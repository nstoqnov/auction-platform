package com.example.auction.Mappers;

import com.example.auction.DTOs.UserDTO;
import com.example.auction.Entities.Role;
import com.example.auction.Entities.UserEntity;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class UserMapper {
    public UserDTO mapToDTO(UserEntity user) {
        return new UserDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getName(),
                user.getRoles().stream().map(Role::getName).collect(Collectors.toSet())
        );
    }
}
