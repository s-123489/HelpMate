package com.helpmate.common;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.IOException;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Autowired
    private AuthInterceptor authInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns(
                        "/api/user/login",
                        "/api/user/register",
                        "/api/ai/chat",
                        "/api/task/list",
                        "/health"
                );
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

    @Bean
    public FilterRegistrationBean<OncePerRequestFilter> securityHeadersFilter() {
        FilterRegistrationBean<OncePerRequestFilter> bean = new FilterRegistrationBean<>(
                new OncePerRequestFilter() {
                    @Override
                    protected void doFilterInternal(HttpServletRequest request,
                                                    HttpServletResponse response,
                                                    FilterChain chain) throws ServletException, IOException {
                        response.setHeader("X-Content-Type-Options", "nosniff");
                        response.setHeader("X-Frame-Options", "DENY");
                        response.setHeader("X-XSS-Protection", "1; mode=block");
                        response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
                        chain.doFilter(request, response);
                    }
                }
        );
        bean.addUrlPatterns("/*");
        bean.setOrder(1);
        return bean;
    }
}
