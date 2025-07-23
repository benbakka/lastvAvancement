package com.chantierpro.service;

import com.chantierpro.entity.User;
import com.chantierpro.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("User with email " + user.getEmail() + " already exists");
        }
        return userRepository.save(user);
    }

    public User updateUser(Long id, User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        // Check if email is being changed and if it already exists
        if (!user.getEmail().equals(userDetails.getEmail()) && 
            userRepository.existsByEmail(userDetails.getEmail())) {
            throw new RuntimeException("User with email " + userDetails.getEmail() + " already exists");
        }

        user.setName(userDetails.getName());
        user.setEmail(userDetails.getEmail());
        user.setRole(userDetails.getRole());
        user.setAvatar(userDetails.getAvatar());

        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        userRepository.delete(user);
    }

    public List<User> searchUsers(String searchTerm) {
        return userRepository.findByNameOrEmailContaining(searchTerm);
    }

    public List<User> getUsersByRole(User.UserRole role) {
        return userRepository.findByRole(role);
    }

    public Long getUserCountByRole(User.UserRole role) {
        return userRepository.countByRole(role);
    }

    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }
}