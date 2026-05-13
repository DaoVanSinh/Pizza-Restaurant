package com.pizza.restaurant.restaurant_backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    private final String clientUrl;

    public EmailService(JavaMailSender mailSender,
                        TemplateEngine templateEngine,
                        @Value("${app.client.url}") String clientUrl) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
        this.clientUrl = stripTrailingSlash(clientUrl);
    }

    public void sendResetPasswordMail(String toEmail, String name, String token) {
        try {
            Context context = new Context();
            context.setVariable("name", name != null ? name : "Quy khach");
            context.setVariable("resetLink", clientUrl + "/reset-password?token=" + token);

            String htmlContent = templateEngine.process("reset-password", context);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(toEmail);
            helper.setSubject("Yeu cau khoi phuc mat khau - Nha hang Pizza");
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Could not send reset password email.", e);
        }
    }

    private String stripTrailingSlash(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }
}
