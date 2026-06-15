package com.hospital.medicine.config;

import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.hibernate6.Hibernate6Module;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;

@Configuration
public class JacksonConfig {

    @Bean
    public Hibernate6Module hibernate6Module() {
        Hibernate6Module module = new Hibernate6Module();
        // Prevent forcing lazy loading during serialization
        module.disable(Hibernate6Module.Feature.FORCE_LAZY_LOADING);
        return module;
    }

    @Bean
    public Jackson2ObjectMapperBuilderCustomizer jacksonCustomizer(Hibernate6Module hibernate6Module) {
        return builder -> {
            // Register Hibernate module and Java Time module so LocalDateTime serializes correctly
            builder.modulesToInstall(hibernate6Module, new JavaTimeModule());
            // Prefer ISO date-times instead of timestamps
            builder.featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        };
    }
}
