package com.example.auction.Mappers;

import com.example.auction.DTOs.UserDTO;
import com.example.auction.Entities.Role;
import com.example.auction.Entities.UserEntity;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class UserMapperTest {

    private final UserMapper mapper = new UserMapper();

    @Test
    void mapToDTO_shouldCopyFieldsAndRoles() {
        Role userRole = new Role();
        userRole.setName("ROLE_USER");
        Role adminRole = new Role();
        adminRole.setName("ROLE_ADMIN");

        UserEntity user = new UserEntity();
        user.setId(7L);
        user.setUsername("alice");
        user.setEmail("alice@example.com");
        user.setName("Alice");
        user.setRoles(Set.of(userRole, adminRole));

        UserDTO dto = mapper.mapToDTO(user);

        assertEquals(7L, dto.getId());
        assertEquals("alice", dto.getUsername());
        assertEquals("alice@example.com", dto.getEmail());
        assertEquals("Alice", dto.getName());
        assertEquals(Set.of("ROLE_USER", "ROLE_ADMIN"), dto.getRoles());
    }
}
