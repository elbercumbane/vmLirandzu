package com.lirandzo.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
public class CorsConfig {

    /**
     * Lista separada por vírgulas (ex.: em Railway: CORS_ALLOWED_ORIGINS=https://app.vercel.app,http://localhost:4200).
     * Em produção o frontend deve chamar o backend diretamente (URL pública) para o browser conseguir fazer
     * preflight OPTIONS no Spring; o proxy /api do Vercel não trata OPTIONS corretamente para destinos externos.
     */
    @Value("${spring.web.cors.allowed-origins:http://localhost:4200,http://localhost:4201}")
    private String allowedOriginsCsv;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        List<String> allowedOrigins = Arrays.stream(allowedOriginsCsv.split(","))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .collect(Collectors.toList());
        config.setAllowedOrigins(allowedOrigins);
        
        // Permitir métodos HTTP
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        
        // Allow headers
        config.setAllowedHeaders(Arrays.asList("*"));
        
        // Allow credentials
        config.setAllowCredentials(true);
        
        // Cache preflight requests
        config.setMaxAge(3600L);
        
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
