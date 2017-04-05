package com.reach_u.vacation.web.rest;

import com.reach_u.vacation.config.Constants;
import com.codahale.metrics.annotation.Timed;
import com.reach_u.vacation.domain.Authority;
import com.reach_u.vacation.domain.User;
import com.reach_u.vacation.domain.Vacation;
import com.reach_u.vacation.domain.enumeration.VacationType;
import com.reach_u.vacation.repository.UserRepository;
import com.reach_u.vacation.repository.UserSpecifications;
import com.reach_u.vacation.repository.VacationRepository;
import com.reach_u.vacation.security.AuthoritiesConstants;
import com.reach_u.vacation.security.SecurityUtils;
import com.reach_u.vacation.service.MailService;
import com.reach_u.vacation.service.UserService;
import com.reach_u.vacation.utils.HolidayUtils;
import com.reach_u.vacation.web.rest.vm.ManagedUserVM;
import com.reach_u.vacation.web.rest.util.HeaderUtil;
import com.reach_u.vacation.web.rest.util.PaginationUtil;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import javax.inject.Inject;
import java.net.URI;
import java.net.URISyntaxException;
import javax.servlet.http.HttpServletRequest;
import java.time.LocalDate;
import java.time.Year;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * REST controller for managing users.
 * <p>
 * <p>This class accesses the User entity, and needs to fetch its collection of authorities.</p>
 * <p>
 * For a normal use-case, it would be better to have an eager relationship between User and Authority,
 * and send everything to the client side: there would be no View Model and DTO, a lot less code, and an outer-join
 * which would be good for performance.
 * </p>
 * <p>
 * We use a View Model and a DTO for 3 reasons:
 * <ul>
 * <li>We want to keep a lazy association between the user and the authorities, because people will
 * quite often do relationships with the user, and we don't want them to get the authorities all
 * the time for nothing (for performance reasons). This is the #1 goal: we should not impact our users'
 * application because of this use-case.</li>
 * <li> Not having an outer join causes n+1 requests to the database. This is not a real issue as
 * we have by default a second-level cache. This means on the first HTTP call we do the n+1 requests,
 * but then all authorities come from the cache, so in fact it's much better than doing an outer join
 * (which will get lots of data from the database, for each HTTP call).</li>
 * <li> As this manages users, for security reasons, we'd rather have a DTO layer.</li>
 * </ul>
 * <p>Another option would be to have a specific JPA entity graph to handle this case.</p>
 */
@RestController
@RequestMapping("/api")
public class UserResource {

    private final Logger log = LoggerFactory.getLogger(UserResource.class);

    @Inject
    private UserRepository userRepository;

    @Inject
    private VacationRepository vacationRepository;

    @Inject
    private MailService mailService;

    @Inject
    private UserService userService;

    /**
     * POST  /users  : Creates a new user.
     * <p>
     * Creates a new user if the login and email are not already used, and sends an
     * mail with an activation link.
     * The user needs to be activated on creation.
     * </p>
     *
     * @param managedUserVM the user to create
     * @param request       the HTTP request
     * @return the ResponseEntity with status 201 (Created) and with body the new user, or with status 400 (Bad Request) if the login or email is already in use
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @RequestMapping(value = "/users",
        method = RequestMethod.POST,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    @Secured(AuthoritiesConstants.ADMIN)
    public ResponseEntity<?> createUser(@RequestBody ManagedUserVM managedUserVM, HttpServletRequest request) throws URISyntaxException {
        log.debug("REST request to save User : {}", managedUserVM);

        //Lowercase the user login before comparing with database
        if (userRepository.findOneByLogin(managedUserVM.getLogin().toLowerCase()).isPresent()) {
            return ResponseEntity.badRequest()
                .headers(HeaderUtil.createFailureAlert("userManagement", "userexists", "Login already in use"))
                .body(null);
        } else if (userRepository.findOneByEmail(managedUserVM.getEmail()).isPresent()) {
            return ResponseEntity.badRequest()
                .headers(HeaderUtil.createFailureAlert("userManagement", "emailexists", "Email already in use"))
                .body(null);
        } else {
            User newUser = userService.createUser(managedUserVM);
            String baseUrl = request.getScheme() + // "http"
                "://" +                                // "://"
                request.getServerName() +              // "myhost"
                ":" +                                  // ":"
                request.getServerPort() +              // "80"
                request.getContextPath();              // "/myContextPath" or "" if deployed in root context
            return ResponseEntity.created(new URI("/api/users/" + newUser.getLogin()))
                .headers(HeaderUtil.createAlert("userManagement.created", newUser.getLogin()))
                .body(newUser);
        }
    }

    /**
     * PUT  /users : Updates an existing User.
     *
     * @param managedUserVM the user to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated user,
     * or with status 400 (Bad Request) if the login or email is already in use,
     * or with status 500 (Internal Server Error) if the user couldn't be updated
     */
    @RequestMapping(value = "/users",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    @Secured(AuthoritiesConstants.ADMIN)
    public ResponseEntity<ManagedUserVM> updateUser(@RequestBody ManagedUserVM managedUserVM) {
        log.debug("REST request to update User : {}", managedUserVM);
        Optional<User> existingUser = userRepository.findOneByEmail(managedUserVM.getEmail());
        if (existingUser.isPresent() && (!existingUser.get().getId().equals(managedUserVM.getId()))) {
            return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert("userManagement", "emailexists", "E-mail already in use")).body(null);
        }
        existingUser = userRepository.findOneByLogin(managedUserVM.getLogin().toLowerCase());
        if (existingUser.isPresent() && (!existingUser.get().getId().equals(managedUserVM.getId()))) {
            return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert("userManagement", "userexists", "Login already in use")).body(null);
        }
        userService.updateUser(managedUserVM.getId(), managedUserVM.getLogin(), managedUserVM.getFirstName(),
            managedUserVM.getLastName(), managedUserVM.getEmail(), managedUserVM.isActivated(),
            managedUserVM.getLangKey(), managedUserVM.getAuthorities(), managedUserVM.getManagerId(),
            managedUserVM.getFirstWorkday(), managedUserVM.getUnusedVacationDays());

        return ResponseEntity.ok()
            .headers(HeaderUtil.createAlert("userManagement.updated", managedUserVM.getLogin()))
            .body(new ManagedUserVM(userService.getUserWithAuthorities(managedUserVM.getId())));
    }

    /**
     * GET  /users : get all users.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and with body all users
     * @throws URISyntaxException if the pagination headers couldn't be generated
     */
    @RequestMapping(value = "/users",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<List<ManagedUserVM>> getAllUsers(Pageable pageable)
        throws URISyntaxException {
        Page<User> page = userRepository.findAllWithAuthorities(pageable);
        List<ManagedUserVM> managedUserVMs = page.getContent().stream()
            .map(ManagedUserVM::new)
            .collect(Collectors.toList());
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/users");
        return new ResponseEntity<>(managedUserVMs, headers, HttpStatus.OK);
    }

    /**
     * GET  /users/:login : get the "login" user.
     *
     * @param login the login of the user to find
     * @return the ResponseEntity with status 200 (OK) and with body the "login" user, or with status 404 (Not Found)
     */
    @RequestMapping(value = "/users/{login:" + Constants.LOGIN_REGEX + "}",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<ManagedUserVM> getUser(@PathVariable String login) {
        log.debug("REST request to get User : {}", login);
        return userService.getUserWithAuthoritiesByLogin(login)
            .map(ManagedUserVM::new)
            .map(managedUserVM -> new ResponseEntity<>(managedUserVM, HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * DELETE /users/:login : delete the "login" User.
     *
     * @param login the login of the user to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @RequestMapping(value = "/users/{login:" + Constants.LOGIN_REGEX + "}",
        method = RequestMethod.DELETE,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    @Secured(AuthoritiesConstants.ADMIN)
    public ResponseEntity<Void> deleteUser(@PathVariable String login) {
        log.debug("REST request to delete User: {}", login);
        userService.deleteUser(login);
        return ResponseEntity.ok().headers(HeaderUtil.createAlert("userManagement.deleted", login)).build();
    }

    /**
     * GET /users/filter : get users with requested filter.
     *
     * @param firstName the user's first name
     * @param lastName  the user's last name
     * @param login     the user's login
     * @param manager   the user's manager's login
     * @return the ResponseEntity with status 200 (OK)
     */
    @RequestMapping(value = "/users/filter",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<List<ManagedUserVM>> getUsersByFilter(
        @RequestParam(value = "firstName", required = false) String firstName,
        @RequestParam(value = "lastName", required = false) String lastName,
        @RequestParam(value = "login", required = false) String login,
        @RequestParam(value = "manager", required = false) String manager,
        @RequestParam(value = "role", required = false) Authority auth,
        Pageable pageable)

        throws URISyntaxException {
        log.debug("REST request to get vacations : firstName: {}, lastName: {}, login: {}, manager: {}, authority: {}",
            firstName, lastName, login, manager, auth);
        List<User> partlyFilteredUsers = userRepository.findAll(UserSpecifications.byQuery(firstName, lastName, login, manager));
        List<ManagedUserVM> response = partlyFilteredUsers.stream()
            .filter(user -> auth == null || user.getAuthorities().contains(auth))
            .map(user -> new ManagedUserVM(user))
            .collect(Collectors.toList());
        Page<User> page = new PageImpl(response, pageable, response.size());
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/users/filter");
        return new ResponseEntity<>(response, headers, HttpStatus.OK);
    }

    /**
     * GET  /users/remainingDays : get the counts of remaining study leave / paid vacation days that the currently logged in user has.
     *
     * @return a Map with counts of remaining study leave / paid vacation days.
     * @throws URISyntaxException if the pagination headers couldn't be generated
     */
    @RequestMapping(value = "/users/remainingDays",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public Map<String, Integer> getRemainingDaysOfCurrentUser() throws URISyntaxException {
        Map<String, Integer> result = new HashMap<>();
        int currentYear = Year.now().getValue();
        LocalDate timeFrameStart = LocalDate.parse(String.valueOf(currentYear) + "-01-01"), timeFrameEnd = LocalDate.parse(String.valueOf(currentYear) + "-12-31");
        int plannedPaidVacationDuration = getPlannedPaidVacationDays(timeFrameStart, timeFrameEnd, VacationType.PAID);
        int plannedUnPaidVacationDuration = getPlannedPaidVacationDays(timeFrameStart, timeFrameEnd, VacationType.UNPAID);
        result.put("endOfYear", getEmployeeVacationDaysEarned(plannedPaidVacationDuration, plannedUnPaidVacationDuration, false));
        result.put("current", getEmployeeVacationDaysEarned(plannedPaidVacationDuration, plannedUnPaidVacationDuration, true));
        result.put("hasTwoWeekPaidVacation", hasAnyTwoWeekPaidVacation(timeFrameStart, timeFrameEnd));
        result.put("studyLeaveRemaining", getRemainingStudyLeaveDays(timeFrameStart, timeFrameEnd));

        return result;
    }

    private int hasAnyTwoWeekPaidVacation(LocalDate timeFrameStart, LocalDate timeFrameEnd) {
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

    private int getUnpaidVacationDays(LocalDate timeFrameStart, LocalDate timeFrameEnd) {
        List<Vacation> unpaidVacationCount = vacationRepository.findAllVacationsOfTypeWithTimeframe(timeFrameStart, timeFrameEnd, VacationType.UNPAID);
        int unpaidVacationDayCount = 0;
        for (Vacation vacation : unpaidVacationCount) {
            unpaidVacationDayCount += vacation.getStartDate().until(vacation.getEndDate(), ChronoUnit.DAYS);
        }
        return unpaidVacationDayCount;
    }

    private int getRemainingStudyLeaveDays(LocalDate timeFrameStart, LocalDate timeFrameEnd) {
        List<Vacation> list = vacationRepository.findAllVacationsOfTypeWithTimeframe(timeFrameStart, timeFrameEnd, VacationType.STUDY_LEAVE);
        return 30 - getVacationDurationSum(list, timeFrameStart, timeFrameEnd);
    }

    private int getPlannedPaidVacationDays(LocalDate timeFrameStart, LocalDate timeFrameEnd, VacationType vacationType) {
        List<Vacation> list = vacationRepository.findAllVacationsOfTypeWithTimeframe(timeFrameStart, timeFrameEnd, vacationType);
        return getVacationDurationSum(list, timeFrameStart, timeFrameEnd);
    }

    private int getVacationDurationSum(List<Vacation> list, LocalDate timeFrameStart, LocalDate timeFrameEnd) {
        int sum = 0;
        for (Vacation vacation : list) {
            if (vacation.getStartDate().compareTo(timeFrameStart) < 0) {
                sum += getDurationInDays(timeFrameStart, vacation.getEndDate());
            } else if (vacation.getEndDate().compareTo(timeFrameEnd) > 0) {
                sum += getDurationInDays(vacation.getStartDate(), timeFrameEnd);
            } else {
                sum += getDurationInDays(vacation.getStartDate(), vacation.getEndDate());
            }
        }
        return sum;
    }

    private Long getDurationInDays(LocalDate start, LocalDate end) {
        if (end != null) {
            return start.until(end, ChronoUnit.DAYS) + 1 - HolidayUtils.getHolidays(start, end).size();
        }
        return null;
    }

    private int getEmployeeVacationDaysEarned(int paidVacationDurationSum, int unPaidVacationDurationSum, boolean byCurrentDate) {
        DateTime dateTime = new DateTime();
        User user = userRepository.findOneByLogin(SecurityUtils.getCurrentUserLogin()).get();
        double nrOfDaysEarned,
            numOfDaysInYear = (dateTime.year().isLeap() ? 366 : 365),
            currentDay = dateTime.getDayOfYear();

        if (isNewEmployee(user)) {
            if (user.getFirstWorkday() == null) {
                log.warn("User doesn't have first work day defined, calculations will not give correct results!");
            }
            DateTime firstWorkDayDate = new DateTime(user.getFirstWorkday());
            double firstWorkDay = firstWorkDayDate.getDayOfYear();
            nrOfDaysEarned = ((byCurrentDate ? (currentDay - unPaidVacationDurationSum) : (numOfDaysInYear - unPaidVacationDurationSum)) - firstWorkDay) / numOfDaysInYear * 28;
        } else {
            nrOfDaysEarned = byCurrentDate ? ((currentDay - unPaidVacationDurationSum) / numOfDaysInYear * 28) : 28;
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
