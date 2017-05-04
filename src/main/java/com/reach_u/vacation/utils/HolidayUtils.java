package com.reach_u.vacation.utils;

import de.jollyday.Holiday;
import de.jollyday.HolidayCalendar;
import de.jollyday.HolidayManager;
import de.jollyday.parameter.UrlManagerParameter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.net.URL;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.Properties;
import java.util.Set;

public class HolidayUtils {

    private final static HolidayManager holidayManager;

    private final static Logger log = LoggerFactory.getLogger(HolidayUtils.class);

    static {
        URL url;
        HolidayManager hm;
        try {
            url = new ClassPathResource("holidays/Holidays_ee.xml").getURL();
            UrlManagerParameter urlManParam = new UrlManagerParameter(url, new Properties());
            hm = HolidayManager.getInstance(urlManParam);
        } catch (IOException e) {
            log.error("Failed loading configuration resource for holidays", e);
            hm = HolidayManager.getInstance(HolidayCalendar.ESTONIA);
        }
        holidayManager = hm;
    }

    private HolidayUtils() {
    }

    public static Set<Holiday> getHolidays(LocalDate startDate, LocalDate endDate) {
        return holidayManager.getHolidays(startDate, endDate);
    }

    public static Set<Holiday> getHolidays(Date startDate, Date endDate) {
        LocalDate start = LocalDate.from(Instant.ofEpochMilli(startDate.getTime()).atZone(ZoneId.systemDefault()));
        LocalDate end = LocalDate.from(Instant.ofEpochMilli(endDate.getTime()).atZone(ZoneId.systemDefault()));
        return holidayManager.getHolidays(start, end);
    }
}
