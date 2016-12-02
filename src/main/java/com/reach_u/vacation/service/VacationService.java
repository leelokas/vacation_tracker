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
import java.util.Arrays;
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


    @Scheduled(cron = "0 * * * * *")
    public void sendWeeklyEmail(){
        List<Vacation> vacations      = vacationRepository.getAllUpcomingVacations();
        List<User> accountants        = userRepository.getAllAccountants();
        List<Object> vacationInfo     = new ArrayList<>();
        List<String> accountantEmails = new ArrayList<>();

        for (User accountant : accountants){
            accountantEmails.add(accountant.getEmail());
        }

        addVacationInfo(vacations, vacationInfo);

        if (!vacationInfo.isEmpty()) {
            for (String email : accountantEmails){
                mailService.sendEmail(email, "Vacations", vacationInfo.toString().replace("[", "").replace("]", ""), false, false);
            }
        }

        for (Vacation vacation : vacations){
            vacation.setStage(Stage.CONFIRMED);
        }
    }

    @Scheduled(cron = "* 0 * * * *")
    public void sendHouryEmail(){
        List<Vacation> vacations      = vacationRepository.getAllUpcomingVacations();
        List<User> accountants        = userRepository.getAllAccountants();
        List<Object> vacationInfo     = new ArrayList<>();
        List<String> accountantEmails = new ArrayList<>();

        for (User accountant : accountants){
            accountantEmails.add(accountant.getEmail());
        }

        addVacationInfo(vacations, vacationInfo);

        if (!vacationInfo.isEmpty()) {
            for (String email : accountantEmails){
                mailService.sendEmail(email, "Vacations", vacationInfo.toString().replace("[", "").replace("]", ""), false, false);
            }
        }

        for (Vacation vacation : vacations){
            vacation.setStage(Stage.CONFIRMED);
        }
    }

    private void addVacationInfo(List<Vacation> vacations, List<Object> vacationInfo) {
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
    }


}

