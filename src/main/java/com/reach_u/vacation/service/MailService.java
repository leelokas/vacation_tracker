package com.reach_u.vacation.service;

import com.reach_u.vacation.config.JHipsterProperties;
import com.reach_u.vacation.domain.User;

import com.reach_u.vacation.domain.Vacation;
import com.reach_u.vacation.domain.enumeration.Stage;
import com.reach_u.vacation.domain.enumeration.VacationType;
import com.reach_u.vacation.repository.UserRepository;
import org.apache.commons.io.output.ByteArrayOutputStream;
import org.apache.commons.lang3.CharEncoding;
import org.apache.poi.ss.usermodel.Workbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.MessageSource;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring4.SpringTemplateEngine;

import javax.activation.DataSource;
import javax.inject.Inject;
import javax.mail.internet.MimeMessage;
import javax.mail.util.ByteArrayDataSource;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

/**
 * Service for sending e-mails.
 * <p>
 * We use the @Async annotation to send e-mails asynchronously.
 * </p>
 */
@Service
public class MailService {

    private final Logger log = LoggerFactory.getLogger(MailService.class);

    private static final String USER = "user";
    private static final String BASE_URL = "baseUrl";
    private static final String EMAIL_FOOTER = "<br/><br/><a href=\"https://vacation.reach-u.com/\">https://vacation.reach-u.com/</a>";
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd. MMM yyyy");

    @Inject
    private JHipsterProperties jHipsterProperties;

    @Inject
    private JavaMailSenderImpl javaMailSender;

    @Inject
    private MessageSource messageSource;

    @Inject
    private SpringTemplateEngine templateEngine;

    @Inject
    private XlsService xlsService;

    @Inject
    private UserRepository userRepository;

    @Async
    public void sendEmail(String to, String subject, String content, boolean isMultipart, boolean isHtml) {
        log.debug("Send e-mail[multipart '{}' and html '{}'] to '{}' with subject '{}' and content={}",
            isMultipart, isHtml, to, subject, content);

        // Prepare message using a Spring helper
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        try {
            MimeMessageHelper message = new MimeMessageHelper(mimeMessage, isMultipart, CharEncoding.UTF_8);
            message.setTo(to);
            message.setFrom(jHipsterProperties.getMail().getFrom());
            message.setSubject(subject);
            message.setText(content, isHtml);
            javaMailSender.send(mimeMessage);
            log.debug("Sent e-mail to User '{}'", to);
        } catch (Exception e) {
            log.warn("E-mail could not be sent to user '{}', exception is: {}", to, e.getMessage());
        }
    }

    @Async
    public void sendActivationEmail(User user, String baseUrl) {
        log.debug("Sending activation e-mail to '{}'", user.getEmail());
        Locale locale = Locale.forLanguageTag(user.getLangKey());
        Context context = new Context(locale);
        context.setVariable(USER, user);
        context.setVariable(BASE_URL, baseUrl);
        String content = templateEngine.process("activationEmail", context);
        String subject = messageSource.getMessage("email.activation.title", null, locale);
        sendEmail(user.getEmail(), subject, content, false, true);
    }

    @Async
    public void sendCreationEmail(User user, String baseUrl) {
        log.debug("Sending creation e-mail to '{}'", user.getEmail());
        Locale locale = Locale.forLanguageTag(user.getLangKey());
        Context context = new Context(locale);
        context.setVariable(USER, user);
        context.setVariable(BASE_URL, baseUrl);
        String content = templateEngine.process("creationEmail", context);
        String subject = messageSource.getMessage("email.activation.title", null, locale);
        sendEmail(user.getEmail(), subject, content, false, true);
    }

    @Async
    public void sendPasswordResetMail(User user, String baseUrl) {
        log.debug("Sending password reset e-mail to '{}'", user.getEmail());
        Locale locale = Locale.forLanguageTag(user.getLangKey());
        Context context = new Context(locale);
        context.setVariable(USER, user);
        context.setVariable(BASE_URL, baseUrl);
        String content = templateEngine.process("passwordResetEmail", context);
        String subject = messageSource.getMessage("email.reset.title", null, locale);
        sendEmail(user.getEmail(), subject, content, false, true);
    }

    @Async
    public void sendVacationCreateEmail(Vacation vacation) {

        User owner = vacation.getOwner();
        User manager = owner.getManager();

        String subject = "Vacation request created for " + owner.getFirstName() + " " + owner.getLastName();
        String content = "A new vacation request was created for "
            + owner.getFirstName() + " " + owner.getLastName() + " (" + owner.getLogin() + ")<br/>"
            + "<br/><b>Vacation stage:</b> " + vacation.getStage()
            + "<br/><b>Type:</b> " + vacation.getType()
            + "<br/><b>From:</b> " + vacation.getStartDate().format(FORMATTER)
            + "<br/><b>Until:</b> " + (vacation.getEndDate() == null ? "-" : vacation.getEndDate().format(FORMATTER)) + EMAIL_FOOTER;

        if (vacation.getStage() != Stage.SAVED) {
            log.debug("Sending vacation creation e-mail to owner '{}'", owner.getEmail());
            sendEmail(owner.getEmail(), subject, content, false, true);
        }
        if (manager != null && (vacation.getStage() == Stage.SENT || vacation.getStage() == Stage.PLANNED)) {
            log.debug("Sending vacation creation e-mail to manager '{}'", manager.getEmail());
            sendEmail(manager.getEmail(), subject, content, false, true);
        }
    }

    @Async
    public void sendVacationDeleteEmail(Vacation vacation) {

        /** Email is not needed when deleting 'Saved' vacations. */
        if (vacation.getStage() == Stage.SAVED) {
            return;
        }

        /** Following should only happen if admin changed vacation owner. */
        User owner = vacation.getOwner();
        User manager = owner.getManager();

        String subject = "Vacation request for " + owner.getFirstName() + " " + owner.getLastName() + " deleted!";
        String content = "A vacation request for " + owner.getFirstName() + " " + owner.getLastName()
            + " (" + owner.getLogin() + ")" + "was either deleted or the admin changed the request owner.<br/>"
            + "<br/><b>From:</b> " + vacation.getStartDate().format(FORMATTER)
            + "<br/><b>Until:</b> " + (vacation.getEndDate() == null ? "-" : vacation.getEndDate().format(FORMATTER));

        log.debug("Sending vacation deletion e-mail to previous owner '{}'", owner.getEmail());
        sendEmail(owner.getEmail(), subject, content + EMAIL_FOOTER, false, true);

        if (manager != null && (vacation.getStage() == Stage.PLANNED || vacation.getStage() == Stage.CONFIRMED)) {
            log.debug("Sending vacation deletion e-mail to previous manager '{}'", manager.getEmail());
            sendEmail(manager.getEmail(), subject, content + EMAIL_FOOTER, false, true);
        }

        if (vacation.getStage() == Stage.CONFIRMED) {
            content += "<br/><b>Type:</b> " + vacation.getType()
                + "<br/><b>Payment type:</b> " + vacation.getPayment();

            List<User> accountants = userRepository.getAllAccountants();

            for (User accountant : accountants) {
                log.debug("Sending vacation deletion e-mail to accountant '{}'", accountant.getEmail());
                sendEmail(accountant.getEmail(), subject, content + EMAIL_FOOTER, false, true);
            }
        }
    }

    @Async
    public void sendVacationUpdateEmail(Vacation oldVacation, Vacation newVacation) {

        if (!oldVacation.getOwner().getLogin().equals(newVacation.getOwner().getLogin())) {
            sendVacationCreateEmail(newVacation);
            sendVacationDeleteEmail(oldVacation);
            return;
        }

        User owner = newVacation.getOwner();
        User manager = owner.getManager();

        String subject = owner.getFirstName() + " " + owner.getLastName()
            + (newVacation.getType() == VacationType.SICK_LEAVE ? " sick leave" : " vacation") + " updated";
        String content = "A vacation request for " + owner.getFirstName() + " " + owner.getLastName()
            + " (" + owner.getLogin() + ")" + "was updated.<br/>";

        boolean stageChanged = oldVacation.getStage() != newVacation.getStage();
        boolean dateChanged = oldVacation.getStartDate() != newVacation.getStartDate()
            || oldVacation.getEndDate() != newVacation.getEndDate();
        boolean typeChanged = oldVacation.getType() != newVacation.getType();
        boolean paymentChanged = oldVacation.getPayment() != newVacation.getPayment();

        if (stageChanged) {
            content += "<br/>Request stage was changed from <b>" + oldVacation.getStage()
                + "</b> to <b>" + newVacation.getStage() + "</b><br/>";
        }
        if (!typeChanged && newVacation.getType() == VacationType.SICK_LEAVE) {
            content += "<br/><b>Type:</b> Sick leave";
        }
        if (dateChanged) {
            content += "<br/><b>Previous duration:</b> " + oldVacation.getStartDate().format(FORMATTER)
                + " to " + (oldVacation.getEndDate() == null ? "-" : oldVacation.getEndDate().format(FORMATTER))
                + "<br/><b>New duration:</b> " + newVacation.getStartDate().format(FORMATTER)
                + " to " + (newVacation.getEndDate() == null ? "-" : newVacation.getEndDate().format(FORMATTER));
        }

        if (!stageChanged) {
            /** Email is not needed when user is editing 'Saved' vacations. */
            if (newVacation.getStage() == Stage.SAVED) {
                return;
            }

            /** Following should only happen when admin makes changes. */

            if (manager != null && dateChanged && newVacation.getStage() != Stage.SENT) {
                log.debug("Sending vacation update e-mail to manager '{}'", manager.getEmail());
                sendEmail(manager.getEmail(), subject, content + EMAIL_FOOTER, false, true);
            }

            if (typeChanged) {
                content += "<br/><b>Previous type:</b> " + oldVacation.getType()
                    + "<br/><b>New type:</b> " + newVacation.getType();
            }
            if (paymentChanged) {
                content += "<br/><b>Previous payment type:</b> " + oldVacation.getPayment()
                    + "<br/><b>New payment type:</b> " + newVacation.getPayment();
            }
            log.debug("Sending vacation update e-mail to owner '{}'", owner.getEmail());
            sendEmail(owner.getEmail(), subject, content + EMAIL_FOOTER, false, true);

            /** Adding end date to sick leave. */
            if (newVacation.getType() == VacationType.SICK_LEAVE && dateChanged) {
                List<User> accountants = userRepository.getAllAccountants();

                for (User accountant : accountants) {
                    log.debug("Sending vacation update e-mail to accountant '{}'", accountant.getEmail());
                    sendEmailWithAttachment(accountant.getEmail(), "Vacations", " ", false, Arrays.asList(newVacation));
                }
            }
            return;
        }

        /** Stage has changed. */

        /**  If admin set stage to 'Confirmed' then email to manager is not needed. Same if request was rejected by manager. */
        if (manager != null && !(newVacation.getStage() == Stage.CONFIRMED
            || (oldVacation.getStage() == Stage.SENT && newVacation.getStage() == Stage.SAVED))) {
            log.debug("Sending vacation update e-mail to manager '{}'", manager.getEmail());
            sendEmail(manager.getEmail(), subject, content + EMAIL_FOOTER, false, true);
        }

        if (typeChanged) {
            content += "<br/><b>Previous type:</b> " + oldVacation.getType()
                + "<br/><b>New type:</b> " + newVacation.getType();
        }
        if (paymentChanged) {
            content += "<br/><b>Previous payment type:</b> " + oldVacation.getPayment()
                + "<br/><b>New payment type:</b> " + newVacation.getPayment();
        }
        if (oldVacation.getStage() == Stage.CONFIRMED && newVacation.getStage() != Stage.PLANNED) {
            List<User> accountants = userRepository.getAllAccountants();

            for (User accountant : accountants) {
                log.debug("Sending vacation update e-mail to accountant '{}'", accountant.getEmail());
                sendEmail(accountant.getEmail(), subject, content + EMAIL_FOOTER, false, true);
            }
        }

        log.debug("Sending vacation update e-mail to owner '{}'", owner.getEmail());
        sendEmail(owner.getEmail(), subject, content + EMAIL_FOOTER, false, true);
    }

    @Async
    public void sendVacationConfirmEmail(Vacation vacation) {

        User owner = vacation.getOwner();
        User manager = owner.getManager();

        String subject = owner.getFirstName() + " " + owner.getLastName() + " vacation confirmed";
        String content = "A vacation request for " + owner.getFirstName() + " " + owner.getLastName()
            + " (" + owner.getLogin() + ")" + "was confirmed and information was sent to the accountant.<br/>"
            + "<br/><b>Type:</b> " + vacation.getType()
            + "<br/><b>From:</b> " + vacation.getStartDate().format(FORMATTER)
            + "<br/><b>Until:</b> " + (vacation.getEndDate() == null ? "-" : vacation.getEndDate().format(FORMATTER)) + EMAIL_FOOTER;

        log.debug("Sending vacation creation e-mail to owner '{}'", owner.getEmail());
        sendEmail(owner.getEmail(), subject, content, false, true);

        if (manager != null && (vacation.getStage() == Stage.SENT || vacation.getStage() == Stage.PLANNED)) {
            log.debug("Sending vacation creation e-mail to manager '{}'", manager.getEmail());
            sendEmail(manager.getEmail(), subject, content, false, true);
        }
    }

    @Async
    public void sendEmailWithAttachment(String to, String subject, String content, boolean isHtml, List<Vacation> vacations) {

        log.debug("Sending vacation confirmation e-mail to accountant '{}'", to);
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        try {
            MimeMessageHelper message = new MimeMessageHelper(mimeMessage, true, CharEncoding.UTF_8);
            Workbook wb = xlsService.generateXlsFileForVacations(vacations, true);
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            wb.write(output);
            DataSource fds = new ByteArrayDataSource(output.toByteArray(), "application/vnd.ms-excel");

            message.addAttachment("Vacations.xls", fds );
            message.setTo(to);
            message.setFrom(jHipsterProperties.getMail().getFrom());
            message.setSubject(subject);
            message.setText(content, isHtml);
            javaMailSender.send(mimeMessage);
            log.debug("Sent e-mail to User '{}'", to);

            output.close();
        }
        catch (Exception e) {
            log.warn("E-mail could not be sent to user '{}', exception is: {}", to, e.getMessage());
        }

    }
}
