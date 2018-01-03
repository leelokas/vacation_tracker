package com.reach_u.vacation.repository;

import com.reach_u.vacation.domain.Balance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

/**
 * Spring Data JPA repository for the Balance entity.
 */
public interface BalanceRepository extends JpaRepository<Balance, String> {

    @Query("select balance from Balance balance where balance.userId = ?1 and balance.year = ?2")
    Optional<Balance> findUserBalanceOfYear(Long userId, Integer year);

}
