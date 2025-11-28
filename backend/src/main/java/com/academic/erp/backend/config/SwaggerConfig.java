package com.academic.erp.backend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI academicErpOpenAPI() {
        Server devServer = new Server();
        devServer.setUrl("http://localhost:8080");
        devServer.setDescription("Development server");

        Contact contact = new Contact();
        contact.setEmail("admin@university.edu");
        contact.setName("Academic ERP SDMA Team");

        License license = new License()
                .name("MIT License")
                .url("https://opensource.org/licenses/MIT");

        Info info = new Info()
                .title("Academic ERP SDMA API")
                .version("1.0.0")
                .contact(contact)
                .description("RESTful API for Academic ERP SDMA - Student Domain Management & Admissions System. " +
                        "This API provides endpoints for managing academic domains/programs and student admissions. " +
                        "Most endpoints require JWT authentication via Google OAuth2.")
                .license(license);

        // Define JWT Bearer token security scheme
        SecurityScheme jwtBearerScheme = new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .description("JWT token obtained from Google OAuth2 authentication. " +
                        "Include the token in the Authorization header as: Bearer <token>");

        Components components = new Components()
                .addSecuritySchemes("bearer-jwt", jwtBearerScheme);

        // Note: Security requirements are added per controller/endpoint that needs authentication
        return new OpenAPI()
                .info(info)
                .servers(List.of(devServer))
                .components(components);
    }
}

