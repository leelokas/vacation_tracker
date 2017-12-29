package com.reach_u.vacation.repository;

import com.reach_u.vacation.domain.Balance;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for the Balance entity.
 */
public interface BalanceRepository extends JpaRepository<Balance, String> {
}
