package com.reach_u.vacation.service.dto;

import com.reach_u.vacation.config.Constants;

import com.reach_u.vacation.domain.Authority;
import com.reach_u.vacation.domain.Balance;
import com.reach_u.vacation.domain.User;

import org.hibernate.validator.constraints.Email;

import javax.validation.constraints.*;
import java.util.Date;
import java.util.Set;
import java.util.stream.Collectors;
/**
 * A DTO representing a user, with his authorities.
 */
public class UserDTO {

    @NotNull
    @Pattern(regexp = Constants.LOGIN_REGEX)
    @Size(min = 1, max = 50)
    private String login;

    @Size(max = 50)
    private String firstName;

    @Size(max = 50)
    private String lastName;

    @Email
    @Size(min = 5, max = 100)
    private String email;

    private boolean activated = false;

    @Size(min = 2, max = 5)
    private String langKey;

    private Set<String> authorities;

    private Set<Balance> yearlyBalances;

    private UserDTO manager;

    private Date firstWorkday;

    private Integer unusedVacationDays;

    public UserDTO() {
    }

    public UserDTO(User user) {
        this(user.getLogin(), user.getFirstName(), user.getLastName(),
            user.getEmail(), user.getActivated(), user.getLangKey(),
            user.getAuthorities().stream().map(Authority::getName).collect(Collectors.toSet()),
            user.getManager(), user.getFirstWorkday(), user.getYearlyBalances());
    }

    public UserDTO(String login, String firstName, String lastName, String email,
                   boolean activated, String langKey, Set<String> authorities, User manager,
                   Date firstWorkday, Set<Balance> yearlyBalances) {

        this.login = login;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.activated = activated;
        this.langKey = langKey;
        this.authorities = authorities;
        this.yearlyBalances = yearlyBalances;
        if (manager != null && !manager.getLogin().equals(login)) {
            this.manager = new UserDTO(manager);
        }
        this.firstWorkday = firstWorkday;
        this.unusedVacationDays = unusedVacationDays;
    }

    public String getLogin() {
        return login;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getEmail() {
        return email;
    }

    public boolean isActivated() {
        return activated;
    }

    public String getLangKey() {
        return langKey;
    }

    public Set<String> getAuthorities() {
        return authorities;
    }

    public Set<Balance> getYearlyBalances() {
        return yearlyBalances;
    }

    public UserDTO getManager() {
        return manager;
    }

    public Date getFirstWorkday() {
        return firstWorkday;
    }

    @Deprecated
    public Integer getUnusedVacationDays() {
        return unusedVacationDays;
    }

    @Override
    public String toString() {
        return "UserDTO{" +
            "login='" + login + '\'' +
            ", firstName='" + firstName + '\'' +
            ", lastName='" + lastName + '\'' +
            ", email='" + email + '\'' +
            ", activated=" + activated +
            ", langKey='" + langKey + '\'' +
            ", authorities=" + authorities +
            ", yearlyBalances=" + yearlyBalances +
            ", manager={" + manager + "}" +
            ", firstWorkday=" + firstWorkday +
            "}";
    }
}
