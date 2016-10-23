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
public interface VacationRepository extends JpaRepository<Vacation, Long> {

    @Query("select vacation from Vacation vacation where vacation.owner.login = ?#{principal.username}")
    List<Vacation> findByOwnerIsCurrentUser();

    @Query("select vacation from Vacation vacation where vacation.owner.login = ?#{principal.username}")
    Page<Vacation> findByOwnerIsCurrentUser(Pageable pageable);

    @Query("select vacation from Vacation vacation where vacation.stage in ('CONFIRMED', 'PLANNED')")
    Page<Vacation> findAllConfirmed(Pageable pageable);

    @Query("select vacation from Vacation vacation where vacation.owner.manager.login = ?#{principal.username} and vacation.stage in ('SENT')")
    Page<Vacation> findAllSubordinateVacations(Pageable pageable);

    // select start_date from vacation v where ( (v.start_date - curdate()) <= 7 and v.stage in ('SAVED') );
    @Query("select vacation from Vacation vacation where ( (vacation.startDate - current_date) <= 7 and vacation.stage in ('SAVED') )")
    List<Vacation> getAllUpcomingVacations();

}
