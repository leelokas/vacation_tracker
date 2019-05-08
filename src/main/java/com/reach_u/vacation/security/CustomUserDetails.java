package com.reach_u.vacation.security;

import com.reach_u.vacation.domain.Authority;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Created by kalver on 21.11.2016.
 */
public class CustomUserDetails implements UserDetails {

    private UserDetails details;
    private String phonenr;
    private String email;
    private String givenname;
    private String lastname;
    private String langKey;
    private Set<Authority> appAuthorities;

    public CustomUserDetails(UserDetails details, String phonenr, String email, String givenname, String lastname, String langKey, Set<Authority> authoritySet) {
        this.details = details;
        this.phonenr = phonenr;
        this.email = email;
        this.givenname = givenname;
        this.lastname = lastname;
        this.langKey = langKey;
        this.appAuthorities = authoritySet;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return appAuthorities.stream().map(authority -> new SimpleGrantedAuthority(authority.getName())).collect(Collectors.toList());
    }

    @Override
    public String getPassword() {
        return details.getPassword();
    }

    @Override
    public String getUsername() {
        return details.getUsername();
    }

    @Override
    public boolean isAccountNonExpired() {
        return details.isAccountNonExpired();
    }

    @Override
    public boolean isAccountNonLocked() {
        return details.isAccountNonLocked();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return details.isCredentialsNonExpired();
    }

    @Override
    public boolean isEnabled() {
        return details.isEnabled();
    }

    public String getPhonenr() {
        return phonenr;
    }

    public String getEmail() {
        return email;
    }

    public String getGivenname() {
        return givenname;
    }

    public String getLastname() {
        return lastname;
    }

    public String getLangKey() {
        return langKey;
    }

    public Set<Authority> getAppAuthorities() {
        return appAuthorities;
    }
}
