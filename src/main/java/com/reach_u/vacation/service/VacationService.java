package com.reach_u.vacation.service;


import com.reach_u.vacation.domain.User;
import com.reach_u.vacation.domain.Vacation;
import com.reach_u.vacation.domain.enumeration.Stage;
import com.reach_u.vacation.repository.UserRepository;
import org.springframework.stereotype.Service;
import com.reach_u.vacation.repository.VacationRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import javax.inject.Inject;

import static java.time.temporal.TemporalAdjusters.next;

/**
 * Created by tanelj on 21.10.16.
 */

@Service
@Transactional
public class VacationService {

    @Inject
    private VacationRepository vacationRepository;
    @Inject
    private MailService mailService;
    @Inject
    private UserRepository userRepository;


    // For testing use: cron = "0 * * * * * "   -> every minute
    // For live use:    cron = "0 0 9 * * MON"    -> every Monday at 9 AM
    @Scheduled(cron = "0 0 9 * * MON")
    public void sendWeeklyEmail(){
        LocalDate today = LocalDate.now();
        LocalDate nextWeekSunday = today.with(next(DayOfWeek.SUNDAY)).with(next(DayOfWeek.SUNDAY));

        List<Vacation> vacations      = vacationRepository.getAllNextWeeksVacations(nextWeekSunday);
        List<User> accountants        = userRepository.getAllAccountants();

        confirmAndSendVacationInfo(vacations, accountants);
    }

    // For testing use: cron = "0 * * * * *"     -> executes every minute
    // For live use:    cron = "0 15 */1 * * ?"  -> executes at minute 15 past every hour
    @Scheduled(cron = "0 15 */1 * * ?")
    public void sendHourlyEmail(){
        List<Vacation> vacations      = vacationRepository.getAllUpcomingVacations();
        List<User> accountants        = userRepository.getAllAccountants();

        confirmAndSendVacationInfo(vacations, accountants);

    }

    private void confirmAndSendVacationInfo(List<Vacation> vacations, List<User> accountants) {
        if (!vacations.isEmpty()) {
            for (User accountant : accountants) {
                mailService.sendEmailWithAttachment(accountant.getEmail(), "Vacations", " ", false, vacations);
            }
            for (Vacation vacation : vacations) {
                vacation.setStage(Stage.CONFIRMED);
                mailService.sendVacationConfirmEmail(vacation);
            }
        }
    }

}

