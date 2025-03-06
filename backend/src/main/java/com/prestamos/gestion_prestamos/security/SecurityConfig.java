package com.prestamos.gestion_prestamos.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService customUserDetailsService;

    public SecurityConfig(JwtUtil jwtUtil, CustomUserDetailsService customUserDetailsService) {
        this.jwtUtil = jwtUtil;
        this.customUserDetailsService = customUserDetailsService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors() // ✅ Habilitar CORS
                .and()
                .csrf(csrf -> csrf.disable()) // ❌ Deshabilitar CSRF solo si no usas formularios
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/usuarios/registro",
                                "/api/usuarios/login",
                                "/api/usuarios/solicitar-recuperacion",
                                "/api/usuarios/restablecer-contrasena",
                                "/api/usuarios/registro-admin").permitAll() // ✅ Corregido
                        .requestMatchers(HttpMethod.GET, "/api/public/**").permitAll() // ✅ Permitir GET públicos opcionalmente
                        .anyRequest().authenticated() // 🔒 Todo lo demás requiere autenticación
                )
                .addFilterBefore(new JwtAuthenticationFilter(jwtUtil, customUserDetailsService),
                        UsernamePasswordAuthenticationFilter.class)
                .httpBasic(httpBasic -> httpBasic.disable()) // 🔒 Deshabilitar autenticación básica
                .formLogin(form -> form.disable()); // 🔒 Deshabilitar autenticación por formulario

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(customUserDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }
}
