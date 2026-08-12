package com.example.auction.Services;

import com.example.auction.DTOs.CategoryDTO;
import com.example.auction.Entities.Category;
import com.example.auction.Mappers.CategoryMapper;
import com.example.auction.Repositories.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;
    public CategoryService(CategoryRepository categoryRepository, CategoryMapper categoryMapper) {
        this.categoryRepository = categoryRepository;
        this.categoryMapper = categoryMapper;
    }


    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(categoryMapper::mapToDTO)
                .toList();
    }

    public Optional<CategoryDTO> getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .map(categoryMapper::mapToDTO);
    }

    public CategoryDTO createCategory(CategoryDTO dto) {
        Category category = categoryMapper.mapToEntity(dto);
        category.setId(null);
        Category savedCategory = categoryRepository.save(category);
        return categoryMapper.mapToDTO(savedCategory);
    }

    public Optional<CategoryDTO> updateCategory(Long id, CategoryDTO dto) {
        return categoryRepository.findById(id).map(existingCategory -> {
            existingCategory.setName(dto.getName());
            Category saved = categoryRepository.save(existingCategory);
            return categoryMapper.mapToDTO(saved);
        });
    }

    public boolean deleteCategory(Long id) {
        if (categoryRepository.existsById(id)) {
            categoryRepository.deleteById(id);
            return true;
        }
        return false;
    }



}