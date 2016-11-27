package com.reach_u.vacation.repository;

import com.reach_u.vacation.domain.Vacation;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Spring Data JPA repository for the Vacation entity.
 */
@SuppressWarnings("unused")
public interface VacationRepository extends JpaRepository<Vacation, Long>, JpaSpecificationExecutor {

    @Query("select vacation from Vacation vacation where vacation.owner.login = ?#{principal.username}")
    List<Vacation> findByOwnerIsCurrentUser();

    @Query("select vacation from Vacation vacation where vacation.owner.login = ?#{principal.username}")
    Page<Vacation> findByOwnerIsCurrentUser(Pageable pageable);

    @Query("select vacation from Vacation vacation where vacation.stage in ('CONFIRMED', 'PLANNED')")
    Page<Vacation> findAllConfirmed(Pageable pageable);

    @Query("select vacation from Vacation vacation where vacation.owner.manager.login = ?#{principal.username} and vacation.stage = 'SENT'")
    Page<Vacation> findAllSubordinateVacations(Pageable pageable);

    @Query("select vacation from Vacation vacation where ( (vacation.startDate - current_date) <= 7 and vacation.stage = 'PLANNED' )")
    List<Vacation> getAllUpcomingVacations();

    @Query("select vacation from Vacation vacation where ( vacation.id in (?1) )")
    List<Vacation> getVacationsByIds(Long ids[]);

    @Query("select vacation from Vacation vacation where vacation.owner.login = ?#{principal.username} " +
        "and vacation.type = 'STUDY_LEAVE' and vacation.stage in ('SENT', 'PLANNED', 'CONFIRMED') and vacation.endDate >= ?1 and vacation.startDate <= ?2")
    List<Vacation> findAllStudyLeaveVacationsWithTimeframe(LocalDate start, LocalDate end);
}
