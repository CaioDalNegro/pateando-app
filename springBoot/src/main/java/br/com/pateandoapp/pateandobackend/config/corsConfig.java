package br.com.pateandoapp.pateandobackend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

public class corsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**") // libera todos os endpoints
                        .allowedOrigins("*") // libera todas as origens (depois você pode restringir)
                        .allowedMethods("GET", "POST", "PUT", "DELETE");
            }
        };
    }
}
