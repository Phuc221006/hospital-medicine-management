package com.hospital.medicine;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableJpaAuditing
@EnableScheduling
public class MedicineManagementApplication {
    public static void main(String[] args) {
        SpringApplication.run(MedicineManagementApplication.class, args);
        
        // Chèn thêm dòng này ngay dưới lệnh run để Backend tự băm mật khẩu chuẩn của nó
        System.out.println("👉 CHUỖI BĂM CHUẨN ĐÉT: " + new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder().encode("admin123"));
    }
}