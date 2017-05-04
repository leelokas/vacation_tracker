package com.reach_u.vacation.web.rest;

import com.codahale.metrics.annotation.Timed;
import com.reach_u.vacation.utils.HolidayUtils;
import de.jollyday.Holiday;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Date;
import java.util.Set;

@RestController
@RequestMapping("/api")
public class HolidayResource {

    @Timed
    @RequestMapping(value = "/holidays",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    public Set<Holiday> getHolidays(
        @RequestParam(value = "startDate", required = true) @DateTimeFormat(pattern = "yyyy-MM-dd") Date startDate,
        @RequestParam(value = "endDate", required = true) @DateTimeFormat(pattern = "yyyy-MM-dd") Date endDate) {
        return HolidayUtils.getHolidays(startDate, endDate);
    }

}
