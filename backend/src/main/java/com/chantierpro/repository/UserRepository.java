package com.chantierpro.repository;

import com.chantierpro.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    List<User> findByRole(User.UserRole role);
    
    List<User> findByNameContainingIgnoreCase(String name);
    
    @Query("SELECT u FROM User u WHERE u.name LIKE %?1% OR u.email LIKE %?1%")
    List<User> findByNameOrEmailContaining(String searchTerm);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = ?1")
    Long countByRole(User.UserRole role);
    
    boolean existsByEmail(String email);
}