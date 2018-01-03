package com.reach_u.vacation.domain;

/**
 * Created by leelo on 29.12.17.
 */

import javax.persistence.*;
import java.io.Serializable;

/**
 * Yearly vacation days balance
 */
@Entity
@Table(name = "yearly_balance")
public class Balance implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(name="user_id")
    private Long userId;

    @Column(name="year")
    private Integer year;

    @Column(name="balance")
    private Integer balance;

    public Balance () {}

    public Balance (Long userId, Integer year, Integer balance) {
        this.userId = userId;
        this.year = year;
        this.balance = balance;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public Integer getBalance() {
        return balance;
    }

    public void setBalance(Integer balance) {
        this.balance = balance;
    }

    @Override
    public String toString() {
        return "Balance{" +
            "id='" + id + '\'' +
            "userId='" + userId + '\'' +
            "year='" + year + '\'' +
            "balance='" + balance + '\'' +
            "}";
    }
}
