package com.dentalclinic.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS (Cross-Origin Resource Sharing) Configuration
 *
 * Allows the React frontend (running on http://localhost:5173) to make requests
 * to the Spring Boot backend API (running on http://localhost:8080)
 *
 * Without this configuration, browsers would block the requests due to the
 * Same-Origin Policy (different ports = different origins)
 */
@Configuration
public class CorsConfig {

	/**
	 * Configure CORS mappings
	 *
	 * Settings: - Allowed origins: http://localhost:5173 (React with Vite) Note:
	 * Change to http://localhost:3000 if using Create React App - Allowed methods:
	 * GET, POST, PUT, DELETE, OPTIONS - Allowed headers: All headers (*) - Allow
	 * credentials: true (for cookies/authentication if needed later)
	 *
	 * @return WebMvcConfigurer with CORS settings
	 */
	@Bean
	public WebMvcConfigurer corsConfigurer() {
		return new WebMvcConfigurer() {
			@Override
			public void addCorsMappings(CorsRegistry registry) {
				registry.addMapping("/api/**").allowedOrigins("http://localhost:5173", // Vite dev server
						"http://localhost:4173", // Production preview ← ADD THIS
						"http://127.0.0.1:5173", // Alternative localhost
						"http://127.0.0.1:4173" // Alternative localhost ← ADD THIS
				)
						// For Create React App, use: "http://localhost:3000"
						.allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS").allowedHeaders("*")
						.allowCredentials(true);
			}
		};
	}
}
