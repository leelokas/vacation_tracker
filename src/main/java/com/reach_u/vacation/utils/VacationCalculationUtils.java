package com.reach_u.vacation.utils;

import com.reach_u.vacation.domain.User;
import com.reach_u.vacation.domain.Vacation;
import com.reach_u.vacation.domain.enumeration.VacationType;
import com.reach_u.vacation.repository.UserRepository;
import com.reach_u.vacation.repository.VacationRepository;
import com.reach_u.vacation.security.SecurityUtils;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.inject.Inject;
import java.net.URISyntaxException;
import java.time.LocalDate;
import java.time.Year;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by leelo on 19.12.17.
 */
@Service
public class VacationCalculationUtils {

    private static final Logger log = LoggerFactory.getLogger(VacationCalculationUtils.class);

    @Inject
    private UserRepository userRepository;

    @Inject
    private VacationRepository vacationRepository;


    public Map<String, Integer> getRemainingDaysOfCurrentUser() throws URISyntaxException {
        Map<String, Integer> result = new HashMap<>();
        int currentYear = Year.now().getValue();
        LocalDate
            yearStart = LocalDate.parse(String.valueOf(currentYear) + "-01-01"),
            yearEnd = LocalDate.parse(String.valueOf(currentYear) + "-12-31"),
            currentDate = LocalDate.now();

        int paidVacationDuration = getPlannedVacationDuration(yearStart, yearEnd, VacationType.PAID),
            unPaidVacationDuration = getPlannedVacationDuration(yearStart, yearEnd, VacationType.UNPAID),
            paidVacationDurationCurrent = getPlannedVacationDuration(yearStart, currentDate, VacationType.PAID),
            unPaidVacationDurationCurrent = getPlannedVacationDuration(yearStart, currentDate, VacationType.UNPAID);

        result.put("endOfYear", getEmployeeVacationDaysEarned(paidVacationDuration, unPaidVacationDuration, false));
        result.put("current", getEmployeeVacationDaysEarned(paidVacationDurationCurrent, unPaidVacationDurationCurrent, true));
        result.put("hasTwoWeekPaidVacation", hasAnyTwoWeekPaidVacation(yearStart, yearEnd));
        result.put("studyLeaveRemaining", 30 - getPlannedVacationDuration(yearStart, yearEnd, VacationType.STUDY_LEAVE));

        return result;
    }

    private int hasAnyTwoWeekPaidVacation(LocalDate timeFrameStart, LocalDate timeFrameEnd) { // TODO shouldn't exclude holidays
        List<Vacation> list = vacationRepository.findAllVacationsOfTypeWithTimeframe(timeFrameStart, timeFrameEnd, VacationType.PAID);
        for (Vacation vacation : list) {
            if (vacation.getStartDate().compareTo(timeFrameStart) < 0 && getDurationInDays(timeFrameStart, vacation.getEndDate()) >= 14
                || vacation.getEndDate().compareTo(timeFrameEnd) > 0 && getDurationInDays(vacation.getStartDate(), timeFrameEnd) >= 14
                || getDurationInDays(vacation.getStartDate(), vacation.getEndDate()) >= 14) {
                return 1;
            }
        }
        return 0;
    }

    private int getPlannedVacationDuration(LocalDate timeFrameStart, LocalDate timeFrameEnd, VacationType vacationType) {
        List<Vacation>
            vacationList = vacationRepository.findAllVacationsOfTypeWithTimeframe(timeFrameStart, timeFrameEnd, vacationType),
            sickLeaveList = vacationRepository.findAllVacationsOfTypeWithTimeframe(timeFrameStart, timeFrameEnd, VacationType.SICK_LEAVE);
        return getVacationDurationSum(vacationList, sickLeaveList, timeFrameStart, timeFrameEnd);
    }

    private int getVacationDurationSum(List<Vacation> vacationList, List<Vacation> sickLeaveList, LocalDate timeFrameStart, LocalDate timeFrameEnd) {
        int sum = 0,
            overlappingSickLeaveDays = 0;

        for (Vacation vacation : vacationList) {
            if (vacation.getStartDate().compareTo(timeFrameStart) < 0) {
                sum += getDurationInDays(timeFrameStart, vacation.getEndDate());
            } else if (vacation.getEndDate().compareTo(timeFrameEnd) > 0) {
                sum += getDurationInDays(vacation.getStartDate(), timeFrameEnd);
            } else {
                sum += getDurationInDays(vacation.getStartDate(), vacation.getEndDate());
            }
            overlappingSickLeaveDays += getOverlapDays(sickLeaveList, vacation);
        }
        return sum - overlappingSickLeaveDays;
    }

    private int getOverlapDays(List<Vacation> sickLeaveList, Vacation vacation) {
        int sickLeaveDays = 0;
        LocalDate overlapStart, overlapEnd;
        for (Vacation sickLeave : sickLeaveList) {
            if (sickLeave.getStartDate().isBefore(vacation.getEndDate()) && vacation.getStartDate().isBefore(sickLeave.getEndDate())) {
                if (sickLeave.getStartDate().isBefore(vacation.getStartDate())) {
                    overlapStart = vacation.getStartDate();
                } else {
                    overlapStart = sickLeave.getStartDate();
                }
                if (sickLeave.getEndDate().isBefore(vacation.getEndDate())) {
                    overlapEnd = sickLeave.getEndDate();
                } else {
                    overlapEnd = vacation.getEndDate();
                }
                sickLeaveDays += getDurationInDays(overlapStart, overlapEnd);
            }
        }
        return sickLeaveDays;
    }

    private Long getDurationInDays(LocalDate start, LocalDate end) {
        if (end != null) {
            return start.until(end, ChronoUnit.DAYS) + 1 - HolidayUtils.getHolidays(start, end).size();
        }
        return null;
    }

    private int getEmployeeVacationDaysEarned(int paidVacationDurationSum, int unPaidVacationDurationSum, boolean byCurrentDate) {
        User user = userRepository.findOneByLogin(SecurityUtils.getCurrentUserLogin()).get();
        double
            nrOfDaysEarned,
            numOfDaysInYear = (Year.now().isLeap() ? 366 : 365),
            currentDay = new DateTime().getDayOfYear();

        if (isNewEmployee(user)) {
            if (user.getFirstWorkday() == null) {
                log.warn("User doesn't have first work day defined, calculations will not give correct results!");
            }
            DateTime firstWorkDayDate = new DateTime(user.getFirstWorkday());
            double firstWorkDay = firstWorkDayDate.getDayOfYear();

            if (byCurrentDate) {
                nrOfDaysEarned = ((currentDay - unPaidVacationDurationSum) - (firstWorkDay - 1)) / numOfDaysInYear * 28;
            } else {
                nrOfDaysEarned = ((numOfDaysInYear - unPaidVacationDurationSum) - (firstWorkDay - 1)) / numOfDaysInYear * 28;
            }
        } else {
            if (byCurrentDate) {
                nrOfDaysEarned = (currentDay - unPaidVacationDurationSum) / numOfDaysInYear * 28;
            } else {
                nrOfDaysEarned = (numOfDaysInYear - unPaidVacationDurationSum) / numOfDaysInYear * 28;
            }
            nrOfDaysEarned += getUnusedVacationDays(user);
        }
        nrOfDaysEarned -= paidVacationDurationSum;
        return (int) nrOfDaysEarned;
    }

    private int getUnusedVacationDays(User user) {
        return (user.getUnusedVacationDays() == null) ? 0 : user.getUnusedVacationDays();
    }

    private boolean isNewEmployee(User user) {
        DateTime firstWorkDayDate = new DateTime(user.getFirstWorkday());
        return firstWorkDayDate.getYear() == new DateTime().getYear();
    }
}
