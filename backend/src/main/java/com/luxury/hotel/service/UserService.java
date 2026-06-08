package com.luxury.hotel.service;

import com.luxury.hotel.dto.UserDTO;
import java.util.List;

public interface UserService {
    UserDTO getUserProfile(String email);
    UserDTO updateUserProfile(String email, UserDTO userDTO);
    List<UserDTO> getAllCustomers();
    void deleteUser(Long id);
}
