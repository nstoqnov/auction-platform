package com.example.auction.Services;

import com.example.auction.DTOs.CategoryDTO;
import com.example.auction.Entities.Category;
import com.example.auction.Mappers.CategoryMapper;
import com.example.auction.Repositories.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private CategoryMapper categoryMapper;

    @InjectMocks
    private CategoryService categoryService;

    private Category category;
    private CategoryDTO categoryDTO;

    @BeforeEach
    void setUp() {
        category = new Category();
        category.setId(1L);
        category.setName("Electronics");

        categoryDTO = new CategoryDTO();
        categoryDTO.setId(1L);
        categoryDTO.setName("Electronics");
    }

    @Test
    void shouldGetAllCategories() {
        when(categoryRepository.findAll()).thenReturn(List.of(category));
        when(categoryMapper.mapToDTO(category)).thenReturn(categoryDTO);

        List<CategoryDTO> result = categoryService.getAllCategories();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Electronics", result.get(0).getName());
    }

    @Test
    void shouldGetCategoryById() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(categoryMapper.mapToDTO(category)).thenReturn(categoryDTO);

        Optional<CategoryDTO> result = categoryService.getCategoryById(1L);

        assertTrue(result.isPresent());
        assertEquals("Electronics", result.get().getName());
    }

    @Test
    void shouldCreateCategory() {
        when(categoryMapper.mapToEntity(categoryDTO)).thenReturn(category);
        when(categoryRepository.save(category)).thenReturn(category);
        when(categoryMapper.mapToDTO(category)).thenReturn(categoryDTO);

        CategoryDTO result = categoryService.createCategory(categoryDTO);

        assertNotNull(result);
        assertEquals("Electronics", result.getName());
        verify(categoryRepository).save(category);
    }

    @Test
    void shouldUpdateCategory() {
        CategoryDTO updateDTO = new CategoryDTO();
        updateDTO.setName("Updated Name");

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(categoryRepository.save(any(Category.class))).thenReturn(category);
        when(categoryMapper.mapToDTO(any(Category.class))).thenReturn(updateDTO);

        Optional<CategoryDTO> result = categoryService.updateCategory(1L, updateDTO);

        assertTrue(result.isPresent());
        assertEquals("Updated Name", result.get().getName());
        verify(categoryRepository).save(category);
    }

    @Test
    void shouldDeleteCategory() {
        when(categoryRepository.existsById(1L)).thenReturn(true);

        boolean result = categoryService.deleteCategory(1L);

        assertTrue(result);
        verify(categoryRepository).deleteById(1L);
    }

    @Test
    void shouldReturnFalseWhenDeleteNonExistentCategory() {
        when(categoryRepository.existsById(1L)).thenReturn(false);

        boolean result = categoryService.deleteCategory(1L);

        assertFalse(result);
        verify(categoryRepository, never()).deleteById(anyLong());
    }
}
