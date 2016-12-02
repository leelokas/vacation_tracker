package com.reach_u.vacation.service;


import com.reach_u.vacation.domain.User;
import com.reach_u.vacation.domain.Vacation;
import com.reach_u.vacation.domain.enumeration.Stage;
import com.reach_u.vacation.repository.UserRepository;
import org.springframework.stereotype.Service;
import com.reach_u.vacation.repository.VacationRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Transactional;

import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
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
    @Inject
    private MailService mailService;
    @Inject
    private UserRepository userRepository;


    // For testing use cron = 0 * * * * *
    @Scheduled(cron = "0 0 9 * * MON")
    public void sendWeeklyEmail(){
        List<Vacation> vacations      = vacationRepository.getAllUpcomingVacations();
        List<User> accountants        = userRepository.getAllAccountants();

        createAndSendVacationInfo(vacations, accountants);
    }

    @Scheduled(cron = "* 1 * * * *")
    public void sendHouryEmail(){
        List<Vacation> vacations      = vacationRepository.getAllNextWeeksVacations();
        List<User> accountants        = userRepository.getAllAccountants();

        createAndSendVacationInfo(vacations, accountants);

    }

    private void createAndSendVacationInfo(List<Vacation> vacations, List<User> accountants) {
        List<Object> vacationInfo     = new ArrayList<>();
        List<String> accountantEmails = new ArrayList<>();

        for (User accountant : accountants) {
            accountantEmails.add(accountant.getEmail());
        }

        if (!vacations.isEmpty()) {
            for (Vacation vac : vacations){
                vacationInfo.add(vac.getOwner().getFullName());
                vacationInfo.add(vac.getStartDate());
                vacationInfo.add(vac.getEndDate());
                if (vac.getEndDate() != null) {
                    vacationInfo.add(vac.getStartDate().until(vac.getEndDate(), ChronoUnit.DAYS) + 1);
                }
                vacationInfo.add(vac.getType());
                vacationInfo.add(vac.getPayment() + "\n");
            }
        }

        if (!vacationInfo.isEmpty()) {
            for (String email : accountantEmails){
                mailService.sendEmail(email, "Vacations", vacationInfo.toString().replace("[", "").replace("]", ""), false, false);
            }
        }

        if (!vacations.isEmpty()) {
            for (Vacation vacation : vacations) {
                vacation.setStage(Stage.CONFIRMED);
            }
        }
    }

}

