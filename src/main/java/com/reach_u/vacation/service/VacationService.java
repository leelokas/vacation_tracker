package com.reach_u.vacation.service;

import com.reach_u.vacation.domain.Vacation;
import com.reach_u.vacation.domain.enumeration.Stage;
import org.springframework.stereotype.Service;
import com.reach_u.vacation.repository.VacationRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import javax.inject.Inject;

/**
 * Created by tanelj on 21.10.16.
 */

@Service
@Transactional
public class VacationService {

    @Inject
    private VacationRepository vacationRepository;

    /*
     * Checks every midnight whether stage needs to be changed or not
     *     0 0 0 * * ? - every midnight
     *     0 * * * * * - every minute - use this for testing
     */
    @Scheduled(cron = "0 * * * * *")
    public void updateVacationStage(){
        List<Vacation> vacations = vacationRepository.getAllUpcomingVacations();
        for (Vacation vacation : vacations){
            vacation.setStage(Stage.CONFIRMED);
        }
    }

}

