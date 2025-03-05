package com.prestamos.gestion_prestamos.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    private static final String SECRET_KEY = "este_es_un_secreto_muy_seguro_para_jwt_123456"; // Clave segura (mín. 32 caracteres)
    private static final Key KEY = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());

    // Generar Token con los datos del usuario
    public String generarToken(Long idUsuario, String correo, String nombre, String apellido, String rol, String cedula) {
        return Jwts.builder()
                .setSubject(correo)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 20)) // Expira en 20 min
                .addClaims(Map.of(
                        "idUsuario", idUsuario,
                        "nombre", nombre,
                        "apellido", apellido,
                        "rol", rol,
                        "cedula", cedula // Se añade la cédula al token
                ))
                .signWith(KEY, SignatureAlgorithm.HS256)
                .compact();
    }

    // Extraer correo
    public String extraerCorreo(String token) {
        return extraerReclamo(token, Claims::getSubject);
    }

    // Extraer ID de usuario
    public Long extraerIdUsuario(String token) {
        return extraerReclamo(token, claims -> claims.get("idUsuario", Long.class));
    }

    // Extraer nombre
    public String extraerNombre(String token) {
        return extraerReclamo(token, claims -> claims.get("nombre", String.class));
    }

    // Extraer apellido
    public String extraerApellido(String token) {
        return extraerReclamo(token, claims -> claims.get("apellido", String.class));
    }

    // Extraer rol
    public String extraerRol(String token) {
        return extraerReclamo(token, claims -> claims.get("rol", String.class));
    }

    // Extraer cédula
    public String extraerCedula(String token) {
        return extraerReclamo(token, claims -> claims.get("cedula", String.class));
    }

    // Validar Token
    public boolean validarToken(String token, String correo) {
        return correo.equals(extraerCorreo(token)) && !tokenExpirado(token);
    }

    // Verificar si el token ha expirado
    private boolean tokenExpirado(String token) {
        return extraerReclamo(token, Claims::getExpiration).before(new Date());
    }

    // Método genérico para extraer información del token
    private <T> T extraerReclamo(String token, Function<Claims, T> resolver) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return resolver.apply(claims);
    }
}
