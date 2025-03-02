package com.prestamos.gestion_prestamos.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.function.Function;

@Component
public class JwtUtil {

    private static final String SECRET_KEY = "este_es_un_secreto_muy_seguro_para_jwt_123456"; // Clave de al menos 32 caracteres
    private static final Key KEY = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());

    public String generarToken(String correo) {
        return Jwts.builder()
                .setSubject(correo)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10)) // Expira en 10 horas
                .signWith(KEY, SignatureAlgorithm.HS256)
                .compact();
    }

    public String extraerCorreo(String token) {
        return extraerReclamo(token, Claims::getSubject);
    }

    public boolean validarToken(String token, String correo) {
        return correo.equals(extraerCorreo(token)) && !tokenExpirado(token);
    }

    private boolean tokenExpirado(String token) {
        return extraerReclamo(token, Claims::getExpiration).before(new Date());
    }

    private <T> T extraerReclamo(String token, Function<Claims, T> resolver) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return resolver.apply(claims);
    }
}
