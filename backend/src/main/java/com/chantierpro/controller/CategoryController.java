package com.chantierpro.controller;

import com.chantierpro.entity.Category;
import com.chantierpro.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/categories")
@CrossOrigin(origins = "http://localhost:3000")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories(@RequestParam(required = false) Long villaId) {
        List<Category> categories;
        if (villaId != null) {
            categories = categoryService.getCategoriesByVillaId(villaId);
        } else {
            categories = categoryService.getAllCategories();
        }
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable Long id) {
        return categoryService.getCategoryById(id)
                .map(category -> ResponseEntity.ok().body(category))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Category> createCategory(@Valid @RequestBody Category category) {
        try {
            Category createdCategory = categoryService.createCategory(category);
            return ResponseEntity.ok(createdCategory);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable Long id, @Valid @RequestBody Category categoryDetails) {
        try {
            Category updatedCategory = categoryService.updateCategory(id, categoryDetails);
            return ResponseEntity.ok(updatedCategory);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        try {
            categoryService.deleteCategory(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Category>> getCategoriesByProjectId(@PathVariable Long projectId) {
        List<Category> categories = categoryService.getCategoriesByProjectId(projectId);
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/team/{teamId}")
    public ResponseEntity<List<Category>> getCategoriesByTeamId(@PathVariable Long teamId) {
        List<Category> categories = categoryService.getCategoriesByTeamId(teamId);
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Category>> getCategoriesByStatus(@PathVariable Category.CategoryStatus status) {
        List<Category> categories = categoryService.getCategoriesByStatus(status);
        return ResponseEntity.ok(categories);
    }

    @PutMapping("/{id}/stats")
    public ResponseEntity<?> updateCategoryStats(@PathVariable Long id) {
        try {
            categoryService.updateCategoryStats(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}