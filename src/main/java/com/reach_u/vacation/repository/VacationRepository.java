package com.reach_u.vacation.repository;

import com.reach_u.vacation.domain.Vacation;

import com.reach_u.vacation.domain.enumeration.VacationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;

import java.time.DayOfWeek;
import java.time.LocalDate;

import java.util.List;

import static java.time.temporal.TemporalAdjusters.next;

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

    @Query("select vacation from Vacation vacation where vacation.owner.login = ?#{principal.username} and vacation.stage in ('CONFIRMED', 'PLANNED')")
    List<Vacation> findConfirmedByOwnerIsCurrentUser();

    @Query("select vacation from Vacation vacation where vacation.owner.login = ?#{principal.username} and vacation.stage in ('SENT', 'CONFIRMED', 'PLANNED') and vacation.type in ('PAID')")
    List<Vacation> findPlannedPaidVacationsByOwnerCurrentUser();

    @Query("select vacation from Vacation vacation where vacation.owner.manager.login = ?#{principal.username} and vacation.stage = 'SENT'")
    Page<Vacation> findAllSubordinateVacations(Pageable pageable);

    @Query("select vacation from Vacation vacation where ( (vacation.startDate - current_date) < 7 and vacation.stage = 'PLANNED' )")
    List<Vacation> getAllUpcomingVacations();

    @Query("select vacation from Vacation vacation where ( vacation.id in (?1) )")
    List<Vacation> getVacationsByIds(Long ids[]);

    @Query("select vacation from Vacation vacation where vacation.owner.login = ?#{principal.username} " +
        "and vacation.type = ?3 and vacation.stage in ('SENT', 'PLANNED', 'CONFIRMED') and vacation.endDate >= ?1 and vacation.startDate <= ?2")
    List<Vacation> findAllVacationsOfTypeWithTimeframe(LocalDate start, LocalDate end, VacationType type);

    @Query("select vacation from Vacation vacation where (vacation.startDate <= ?1 and vacation.stage = 'PLANNED')")
    List<Vacation> getAllNextWeeksVacations(LocalDate nextWeekSunday);

}
