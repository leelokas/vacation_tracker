package com.reach_u.vacation.web.rest;

import com.codahale.metrics.annotation.Timed;
import com.reach_u.vacation.domain.Vacation;

import com.reach_u.vacation.domain.enumeration.PaymentType;
import com.reach_u.vacation.domain.enumeration.Stage;
import com.reach_u.vacation.domain.enumeration.VacationType;
import com.reach_u.vacation.repository.VacationRepository;
import com.reach_u.vacation.repository.VacationSpecifications;
import com.reach_u.vacation.service.MailService;
import com.reach_u.vacation.web.rest.util.HeaderUtil;
import com.reach_u.vacation.web.rest.util.PaginationUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.inject.Inject;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Date;
import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing Vacation.
 */
@RestController
@RequestMapping("/api")
public class VacationResource {

    private final Logger log = LoggerFactory.getLogger(VacationResource.class);

    @Inject
    private VacationRepository vacationRepository;

    @Inject
    private MailService mailService;

    /**
     * POST  /vacations : Create a new vacation.
     *
     * @param vacation the vacation to create
     * @return the ResponseEntity with status 201 (Created) and with body the new vacation, or with status 400 (Bad Request) if the vacation has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @RequestMapping(value = "/vacations",
        method = RequestMethod.POST,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Vacation> createVacation(@Valid @RequestBody Vacation vacation) throws URISyntaxException {
        log.debug("REST request to save Vacation : {}", vacation);
        if (vacation.getId() != null) {
            return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert("vacation", "idexists", "A new vacation cannot already have an ID")).body(null);
        }
        Vacation result = vacationRepository.save(vacation);
        return ResponseEntity.created(new URI("/api/vacations/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert("vacation", result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /vacations : Updates an existing vacation.
     *
     * @param vacation the vacation to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated vacation,
     * or with status 400 (Bad Request) if the vacation is not valid,
     * or with status 500 (Internal Server Error) if the vacation couldnt be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @RequestMapping(value = "/vacations",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Vacation> updateVacation(@Valid @RequestBody Vacation vacation) throws URISyntaxException {
        log.debug("REST request to update Vacation : {}", vacation);
        if (vacation.getId() == null) {
            return createVacation(vacation);
        }
        Vacation result = vacationRepository.save(vacation);
        mailService.sendVacationUpdateEmail(vacation.getOwner(),vacation);

        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert("vacation", vacation.getId().toString()))
            .body(result);

    }

    /**
     * GET  /vacations : get all the vacations.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and the list of vacations in body
     * @throws URISyntaxException if there is an error to generate the pagination HTTP headers
     */
    @RequestMapping(value = "/vacations",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<List<Vacation>> getAllVacations(Pageable pageable)
        throws URISyntaxException {
        log.debug("REST request to get a page of Vacations");
        Page<Vacation> page = vacationRepository.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/vacations");
        return new ResponseEntity<>(page.getContent(), headers, HttpStatus.OK);
    }

    /**
     * GET  /vacations/:id : get the "id" vacation.
     *
     * @param id the id of the vacation to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the vacation, or with status 404 (Not Found)
     */
    @RequestMapping(value = "/vacations/{id}",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Vacation> getVacation(@PathVariable Long id) {
        log.debug("REST request to get Vacation : {}", id);
        Vacation vacation = vacationRepository.findOne(id);
        return Optional.ofNullable(vacation)
            .map(result -> new ResponseEntity<>(result, HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * GET /vacations/filter : get vacations with requested filter
     *
     * @param vacationType the vacation type
     * @param vacationStage the vacation stage
     * @param paymentType the vacation payment type
     * @param startDate the vacation minimum start date
     * @param endDate the vacation maximum end date
     * @return the ResponseEntity with status 200 (OK) and with body the vacation, or with status 404 (Not Found)
     */
    @RequestMapping(value = "/vacations/filter",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<List<Vacation>> getVacationsByFilter(@RequestParam(value = "type", required = false) VacationType vacationType,
                                                               @RequestParam(value = "stage", required = false) Stage vacationStage,
                                                               @RequestParam(value = "payment", required = false) PaymentType paymentType,
                                                               @RequestParam(value = "startDate", required = false) Date startDate,
                                                               @RequestParam(value = "endDate", required = false) Date endDate)
        throws URISyntaxException {
        log.debug("REST request to get vacations : vacationStage: {}, paymentType: {}, vacationType: {}, startDate: {}, endDate: {}",
            vacationStage, paymentType, vacationType, startDate, endDate);
        List<Vacation> list = vacationRepository.findAll(VacationSpecifications.byQuery(vacationType, paymentType, vacationStage));
        return new ResponseEntity<>(list, HttpStatus.OK);
    }

    /**
     * DELETE  /vacations/:id : delete the "id" vacation.
     *
     * @param id the id of the vacation to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @RequestMapping(value = "/vacations/{id}",
        method = RequestMethod.DELETE,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Void> deleteVacation(@PathVariable Long id) {
        log.debug("REST request to delete Vacation : {}", id);
        vacationRepository.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("vacation", id.toString())).build();
    }

    /**
     * GET  /vacations/currentUser : get all current user's vacations.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and the list of vacations in body
     * @throws URISyntaxException if there is an error to generate the pagination HTTP headers
     */
    @RequestMapping(value = "/vacations/currentUser",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<List<Vacation>> getCurrentUserVacations(Pageable pageable)
        throws URISyntaxException {
        log.debug("REST request to get a page of current user's Vacations");
        Page<Vacation> page = vacationRepository.findByOwnerIsCurrentUser(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/vacations/currentUser");
        return new ResponseEntity<>(page.getContent(), headers, HttpStatus.OK);
    }

    /**
     * GET  /vacations/confirmed : get all planned and confirmed vacations.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and the list of vacations in body
     * @throws URISyntaxException if there is an error to generate the pagination HTTP headers
     */
    @RequestMapping(value = "/vacations/confirmed",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<List<Vacation>> getConfirmedVacations(Pageable pageable)
        throws URISyntaxException {
        log.debug("REST request to get a page of planned&confirmed Vacations");
        Page<Vacation> page = vacationRepository.findAllConfirmed(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/vacations/confirmed");
        return new ResponseEntity<>(page.getContent(), headers, HttpStatus.OK);
    }

    /**
     * GET  /vacations/subordinateVacations : get all planned and confirmed vacations.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and the list of vacations in body
     * @throws URISyntaxException if there is an error to generate the pagination HTTP headers
     */
    @RequestMapping(value = "/vacations/subordinateVacations",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<List<Vacation>> getSubordinateVacations(Pageable pageable)
        throws URISyntaxException {
        log.debug("REST request to get a page of vacations in 'Sent' stage to be confirmed by the logged in manager");
        Page<Vacation> page = vacationRepository.findAllSubordinateVacations(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/vacations/subordinateVacations");
        return new ResponseEntity<>(page.getContent(), headers, HttpStatus.OK);
    }

    /**
     * GET /file/vacations : get vacation.xls file
     * @return vacations.xls file - automatic download
     */

    @RequestMapping(value = "/file/vacations",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_XML_VALUE)
    public void getFile( HttpServletResponse response) throws Exception{
        try {
            Resource resource = new ClassPathResource("vacations.xls");
            InputStream resourceInputStream = resource.getInputStream();
            response.setContentType("application/xls");
            response.setHeader("Content-Disposition", "attachment; filename=vacations.xls");
            org.apache.commons.io.IOUtils.copy(resourceInputStream, response.getOutputStream());
            response.flushBuffer();
        } catch (IOException ex) {
            throw new RuntimeException("IOError writing file to output stream");
        }
    }



}

