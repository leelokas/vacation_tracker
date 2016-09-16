package com.reach_u.vacation.domain;


import javax.persistence.*;
import javax.validation.constraints.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;

import com.reach_u.vacation.domain.enumeration.Stage;

import com.reach_u.vacation.domain.enumeration.VacationType;

import com.reach_u.vacation.domain.enumeration.PaymentType;

/**
 * A Vacation.
 */
@Entity
@Table(name = "vacation")
public class Vacation implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "stage")
    private Stage stage;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private VacationType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment")
    private PaymentType payment;

    @NotNull
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @ManyToOne
    private User owner;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Stage getStage() {
        return stage;
    }

    public Vacation stage(Stage stage) {
        this.stage = stage;
        return this;
    }

    public void setStage(Stage stage) {
        this.stage = stage;
    }

    public VacationType getType() {
        return type;
    }

    public Vacation type(VacationType type) {
        this.type = type;
        return this;
    }

    public void setType(VacationType type) {
        this.type = type;
    }

    public PaymentType getPayment() {
        return payment;
    }

    public Vacation payment(PaymentType payment) {
        this.payment = payment;
        return this;
    }

    public void setPayment(PaymentType payment) {
        this.payment = payment;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public Vacation startDate(LocalDate startDate) {
        this.startDate = startDate;
        return this;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public Vacation endDate(LocalDate endDate) {
        this.endDate = endDate;
        return this;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public User getOwner() {
        return owner;
    }

    public Vacation owner(User user) {
        this.owner = user;
        return this;
    }

    public void setOwner(User user) {
        this.owner = user;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        Vacation vacation = (Vacation) o;
        if(vacation.id == null || id == null) {
            return false;
        }
        return Objects.equals(id, vacation.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "Vacation{" +
            "id=" + id +
            ", stage='" + stage + "'" +
            ", type='" + type + "'" +
            ", payment='" + payment + "'" +
            ", startDate='" + startDate + "'" +
            ", endDate='" + endDate + "'" +
            '}';
    }
}
