package com.pizza.restaurant.restaurant_backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private TemplateEngine templateEngine;

    /**
     * Gửi Link Reset Pass bằng HTML
     */
    public void sendResetPasswordMail(String toEmail, String name, String token, String origin) {
        try {
            // Chuẩn bị biến nội dung nhét vào HTML
            Context context = new Context();
            context.setVariable("name", name != null ? name : "Quý khách");

            // Mặc định đọc thẳng url từ HTTP Request Header nếu DTO truyền origin rỗng
            String baseUrl = (origin != null && !origin.isEmpty()) ? origin : com.pizza.restaurant.restaurant_backend.utils.RequestUtil.getClientOrigin();
            String resetLink = baseUrl + "/reset-password?token=" + token;
            context.setVariable("resetLink", resetLink);

            // Giao cho Thymeleaf render file reset-password.html
            String htmlContent = templateEngine.process("reset-password", context);

            // Bắt đầu nhúng Mail nội dung HTML
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Yêu cầu khôi phục mật khẩu - Nhà hàng Pizza");
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Có lỗi khi gửi thư khôi phục: " + e.getMessage());
        }
    }
}
