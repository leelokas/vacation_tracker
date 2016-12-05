package com.reach_u.vacation.web.rest;

import com.reach_u.vacation.VacationTrackerApp;

import com.reach_u.vacation.domain.Vacation;
import com.reach_u.vacation.repository.VacationRepository;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import static org.hamcrest.Matchers.hasItem;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.PostConstruct;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.reach_u.vacation.domain.enumeration.Stage;
import com.reach_u.vacation.domain.enumeration.VacationType;
import com.reach_u.vacation.domain.enumeration.PaymentType;
/**
 * Test class for the VacationResource REST controller.
 *
 * @see VacationResource
 */
@RunWith(SpringRunner.class)

@SpringBootTest(classes = VacationTrackerApp.class)

public class VacationResourceIntTest {

    private static final Stage DEFAULT_STAGE = Stage.SAVED;
    private static final Stage UPDATED_STAGE = Stage.SENT;

    private static final VacationType DEFAULT_TYPE = VacationType.PAID;
    private static final VacationType UPDATED_TYPE = VacationType.UNPAID;

    private static final PaymentType DEFAULT_PAYMENT = PaymentType.BEFORE_VACATION;
    private static final PaymentType UPDATED_PAYMENT = PaymentType.WITH_NEXT_SALARY;

    private static final LocalDate DEFAULT_START_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_START_DATE = LocalDate.now(ZoneId.systemDefault());

    private static final LocalDate DEFAULT_END_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_END_DATE = LocalDate.now(ZoneId.systemDefault());

    @Inject
    private VacationRepository vacationRepository;

    @Inject
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    @Inject
    private PageableHandlerMethodArgumentResolver pageableArgumentResolver;

    @Inject
    private EntityManager em;

    private MockMvc restVacationMockMvc;

    private Vacation vacation;

    @PostConstruct
    public void setup() {
        MockitoAnnotations.initMocks(this);
        VacationResource vacationResource = new VacationResource();
        ReflectionTestUtils.setField(vacationResource, "vacationRepository", vacationRepository);
        this.restVacationMockMvc = MockMvcBuilders.standaloneSetup(vacationResource)
            .setCustomArgumentResolvers(pageableArgumentResolver)
            .setMessageConverters(jacksonMessageConverter).build();
    }

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Vacation createEntity(EntityManager em) {
        Vacation vacation = new Vacation()
                .stage(DEFAULT_STAGE)
                .type(DEFAULT_TYPE)
                .payment(DEFAULT_PAYMENT)
                .startDate(DEFAULT_START_DATE)
                .endDate(DEFAULT_END_DATE);
        return vacation;
    }

    @Before
    public void initTest() {
        vacation = createEntity(em);
    }

    @Test
    @Transactional
    public void createVacation() throws Exception {
        int databaseSizeBeforeCreate = vacationRepository.findAll().size();

        // Create the Vacation

        restVacationMockMvc.perform(post("/api/vacations")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(vacation)))
                .andExpect(status().isCreated());

        // Validate the Vacation in the database
        List<Vacation> vacations = vacationRepository.findAll();
        assertThat(vacations).hasSize(databaseSizeBeforeCreate + 1);
        Vacation testVacation = vacations.get(vacations.size() - 1);
        assertThat(testVacation.getStage()).isEqualTo(DEFAULT_STAGE);
        assertThat(testVacation.getType()).isEqualTo(DEFAULT_TYPE);
        assertThat(testVacation.getPayment()).isEqualTo(DEFAULT_PAYMENT);
        assertThat(testVacation.getStartDate()).isEqualTo(DEFAULT_START_DATE);
        assertThat(testVacation.getEndDate()).isEqualTo(DEFAULT_END_DATE);
    }

    @Test
    @Transactional
    public void checkTypeIsRequired() throws Exception {
        int databaseSizeBeforeTest = vacationRepository.findAll().size();
        // set the field null
        vacation.setType(null);

        // Create the Vacation, which fails.

        restVacationMockMvc.perform(post("/api/vacations")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(vacation)))
                .andExpect(status().isBadRequest());

        List<Vacation> vacations = vacationRepository.findAll();
        assertThat(vacations).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void checkStartDateIsRequired() throws Exception {
        int databaseSizeBeforeTest = vacationRepository.findAll().size();
        // set the field null
        vacation.setStartDate(null);

        // Create the Vacation, which fails.

        restVacationMockMvc.perform(post("/api/vacations")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(vacation)))
                .andExpect(status().isBadRequest());

        List<Vacation> vacations = vacationRepository.findAll();
        assertThat(vacations).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void getAllVacations() throws Exception {
        // Initialize the database
        vacationRepository.saveAndFlush(vacation);

        // Get all the vacations
        restVacationMockMvc.perform(get("/api/vacations?sort=id,desc"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
                .andExpect(jsonPath("$.[*].id").value(hasItem(vacation.getId().intValue())))
                .andExpect(jsonPath("$.[*].stage").value(hasItem(DEFAULT_STAGE.toString())))
                .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE.toString())))
                .andExpect(jsonPath("$.[*].payment").value(hasItem(DEFAULT_PAYMENT.toString())))
                .andExpect(jsonPath("$.[*].startDate").value(hasItem(DEFAULT_START_DATE.toString())))
                .andExpect(jsonPath("$.[*].endDate").value(hasItem(DEFAULT_END_DATE.toString())));
    }

    @Test
    @Transactional
    public void getVacation() throws Exception {
        // Initialize the database
        vacationRepository.saveAndFlush(vacation);

        // Get the vacation
        restVacationMockMvc.perform(get("/api/vacations/{id}", vacation.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(vacation.getId().intValue()))
            .andExpect(jsonPath("$.stage").value(DEFAULT_STAGE.toString()))
            .andExpect(jsonPath("$.type").value(DEFAULT_TYPE.toString()))
            .andExpect(jsonPath("$.payment").value(DEFAULT_PAYMENT.toString()))
            .andExpect(jsonPath("$.startDate").value(DEFAULT_START_DATE.toString()))
            .andExpect(jsonPath("$.endDate").value(DEFAULT_END_DATE.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingVacation() throws Exception {
        // Get the vacation
        restVacationMockMvc.perform(get("/api/vacations/{id}", Long.MAX_VALUE))
                .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateVacation() throws Exception {
        // Initialize the database
        vacationRepository.saveAndFlush(vacation);
        int databaseSizeBeforeUpdate = vacationRepository.findAll().size();

        // Update the vacation
        Vacation updatedVacation = vacationRepository.findOne(vacation.getId());
        updatedVacation
                .stage(UPDATED_STAGE)
                .type(UPDATED_TYPE)
                .payment(UPDATED_PAYMENT)
                .startDate(UPDATED_START_DATE)
                .endDate(UPDATED_END_DATE);

        restVacationMockMvc.perform(put("/api/vacations")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(updatedVacation)))
                .andExpect(status().isOk());

        // Validate the Vacation in the database
        List<Vacation> vacations = vacationRepository.findAll();
        assertThat(vacations).hasSize(databaseSizeBeforeUpdate);
        Vacation testVacation = vacations.get(vacations.size() - 1);
        assertThat(testVacation.getStage()).isEqualTo(UPDATED_STAGE);
        assertThat(testVacation.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testVacation.getPayment()).isEqualTo(UPDATED_PAYMENT);
        assertThat(testVacation.getStartDate()).isEqualTo(UPDATED_START_DATE);
        assertThat(testVacation.getEndDate()).isEqualTo(UPDATED_END_DATE);
    }

    @Test
    @Transactional
    public void deleteVacation() throws Exception {
        // Initialize the database
        vacationRepository.saveAndFlush(vacation);
        int databaseSizeBeforeDelete = vacationRepository.findAll().size();

        // Get the vacation
        restVacationMockMvc.perform(delete("/api/vacations/{id}", vacation.getId())
                .accept(TestUtil.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk());

        // Validate the database is empty
        List<Vacation> vacations = vacationRepository.findAll();
        assertThat(vacations).hasSize(databaseSizeBeforeDelete - 1);
    }
}
