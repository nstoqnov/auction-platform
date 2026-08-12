package com.example.auction.Mappers;

import com.example.auction.DTOs.CategoryDTO;
import com.example.auction.Entities.Category;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CategoryMapperTest {

    private final CategoryMapper mapper = new CategoryMapper();

    @Test
    void mapToDTO_shouldCopyIdAndName() {
        Category cat = new Category();
        cat.setId(3L);
        cat.setName("Electronics");

        CategoryDTO dto = mapper.mapToDTO(cat);

        assertEquals(3L, dto.getId());
        assertEquals("Electronics", dto.getName());
    }

    @Test
    void mapToEntity_shouldCopyName() {
        CategoryDTO dto = new CategoryDTO();
        dto.setName("Vehicles");

        Category cat = mapper.mapToEntity(dto);

        assertEquals("Vehicles", cat.getName());
        assertNull(cat.getId());
    }
}
