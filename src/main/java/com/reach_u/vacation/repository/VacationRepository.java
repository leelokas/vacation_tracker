package com.reach_u.vacation.repository;

import com.reach_u.vacation.domain.Vacation;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;

import java.util.List;

/**
 * Spring Data JPA repository for the Vacation entity.
 */
@SuppressWarnings("unused")
public interface VacationRepository extends JpaRepository<Vacation,Long> {

    @Query("select vacation from Vacation vacation where vacation.owner.login = ?#{principal.username}")
    List<Vacation> findByOwnerIsCurrentUser();

    @Query("select vacation from Vacation vacation where vacation.owner.login = ?#{principal.username}")
    Page<Vacation> findByOwnerIsCurrentUser(Pageable pageable);


}
