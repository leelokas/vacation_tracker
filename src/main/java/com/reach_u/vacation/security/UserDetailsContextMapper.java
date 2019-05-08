package com.reach_u.vacation.security;

import com.reach_u.vacation.config.JHipsterProperties;
import com.reach_u.vacation.domain.Authority;
import com.reach_u.vacation.domain.User;
import com.reach_u.vacation.repository.AuthorityRepository;
import com.reach_u.vacation.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ldap.core.DirContextAdapter;
import org.springframework.ldap.core.DirContextOperations;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.ldap.userdetails.LdapUserDetailsMapper;
import org.springframework.stereotype.Component;

import javax.inject.Inject;
import javax.naming.NamingException;
import javax.naming.directory.Attribute;
import javax.naming.directory.Attributes;
import java.util.Collection;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

/**
 * Created by kalver on 21.11.2016.
 */

@Component("userDetailsContextMapper")
public class UserDetailsContextMapper extends LdapUserDetailsMapper {

    private final Logger log = LoggerFactory.getLogger(UserDetailsContextMapper.class);

    @Inject
    private JHipsterProperties jHipsterProperties;

    @Inject
    private AuthorityRepository authorityRepository;

    @Inject
    private UserRepository userRepository;

    @Override
    public UserDetails mapUserFromContext(DirContextOperations dirContextOperations, String s, Collection<? extends GrantedAuthority> collection) {
        UserDetails userDetails = super.mapUserFromContext(dirContextOperations, s, collection);

        String phonenr = null;
        String email = null;
        String givenname = null;
        String lastname = null;
        String langKey = null;

        JHipsterProperties.Security.Ldap ldap = jHipsterProperties.getSecurity().getLdap();
        try {
            //TODO parse other variables that are needed
            Attributes attributes = dirContextOperations.getAttributes();
            phonenr = getAttributeValue(attributes, ldap.getPhoneNrAttr(), String.class);
            email = getAttributeValue(attributes, ldap.getMailAttr(), String.class);
            givenname = getAttributeValue(attributes, ldap.getGivenNameAttr(), String.class);
            lastname = getAttributeValue(attributes, ldap.getLastNameAttr(), String.class);
        } catch (NamingException e) {
            log.error("Failed to parse AD variables", e);
        }

        Optional<User> user = userRepository.findOneByLogin(userDetails.getUsername());
        Set<Authority> authorities = new HashSet<>();
        if (user.isPresent()) {
            authorities.addAll(user.get().getAuthorities());
        } else {
            Authority authority = authorityRepository.findOne(AuthoritiesConstants.USER);
            authorities.add(authority);
        }

        CustomUserDetails customUserDetails = new CustomUserDetails(
            userDetails,
            phonenr,
            email,
            givenname,
            lastname,
            langKey,
            authorities
        );

        return customUserDetails;
    }

    private <T> T getAttributeValue(Attributes attributes, String key, Class<T> tClass) throws NamingException {
        Attribute attribute = attributes.get(key);
        if (attribute != null) {
            return tClass.cast(attribute.get());
        }
        return null;
    }

    @Override
    public void mapUserToContext(UserDetails userDetails, DirContextAdapter dirContextAdapter) {}

}
