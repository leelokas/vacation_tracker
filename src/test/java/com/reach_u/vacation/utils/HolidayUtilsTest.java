package com.reach_u.vacation.utils;

import de.jollyday.Holiday;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import java.time.LocalDate;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = HolidayUtils.class)
public class HolidayUtilsTest {

    @Test
    public void testGetHolidaysBetweenDates() {
        Set<Holiday> holidays = HolidayUtils.getHolidays(LocalDate.of(2017, 1, 1), LocalDate.of(2017, 12, 30));
        assertThat(holidays.size()).isEqualTo(12);
    }

    @Test
    public void testGetMovingHolidays() {
        Set<Holiday> pentecost2015 = HolidayUtils.getHolidays(LocalDate.of(2015, 5, 21), LocalDate.of(2015, 5, 24));
        assertThat(pentecost2015.size()).isEqualTo(1);
        assertThat(((Holiday) pentecost2015.toArray()[0]).getDescription()).isEqualTo("Pentecost");

        Set<Holiday> pentecost2016 = HolidayUtils.getHolidays(LocalDate.of(2014, 4, 20), LocalDate.of(2014, 4, 20));
        assertThat(pentecost2016.size()).isEqualTo(1);
        assertThat(((Holiday) pentecost2016.toArray()[0]).getDescription()).isEqualTo("Easter");

        Set<Holiday> pentecost2017 = HolidayUtils.getHolidays(LocalDate.of(2017, 6, 4), LocalDate.of(2017, 6, 4));
        assertThat(pentecost2017.size()).isEqualTo(1);
        assertThat(((Holiday) pentecost2017.toArray()[0]).getDescription()).isEqualTo("Pentecost");

        Set<Holiday> pentecost1951 = HolidayUtils.getHolidays(LocalDate.of(1951, 5, 12), LocalDate.of(1951, 5, 13));
        assertThat(pentecost1951.size()).isEqualTo(1);
        assertThat(((Holiday) pentecost1951.toArray()[0]).getDescription()).isEqualTo("Pentecost");

        Set<Holiday> pentecostNone = HolidayUtils.getHolidays(LocalDate.of(2017, 2, 2), LocalDate.of(2017, 2, 2));
        assertThat(pentecostNone.size()).isEqualTo(0);

        Set<Holiday> easter = HolidayUtils.getHolidays(LocalDate.of(2027, 3, 28), LocalDate.of(2027, 3, 28));
        assertThat(easter.size()).isEqualTo(1);
        assertThat(((Holiday) easter.toArray()[0]).getDescription()).isEqualTo("Easter");
    }
}
