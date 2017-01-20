package com.reach_u.vacation.security;

import org.springframework.security.core.AuthenticationException;

/**
 * Created by kalver on 20.01.2017.
 */
public final class VTActiveDirectoryAuthenticationException extends AuthenticationException {
    private final String dataCode;

    VTActiveDirectoryAuthenticationException(String dataCode, String message, Throwable cause) {
        super(message, cause);
        this.dataCode = dataCode;
    }

    public String getDataCode() {
        return this.dataCode;
    }
}