package com.luxury.hotel.service.impl;

import com.luxury.hotel.dto.StaffDTO;
import com.luxury.hotel.entity.Hotel;
import com.luxury.hotel.entity.Staff;
import com.luxury.hotel.entity.User;
import com.luxury.hotel.entity.Role;
import com.luxury.hotel.entity.UserStatus;
import com.luxury.hotel.exception.ResourceNotFoundException;
import com.luxury.hotel.repository.HotelRepository;
import com.luxury.hotel.repository.StaffRepository;
import com.luxury.hotel.repository.UserRepository;
import com.luxury.hotel.service.StaffService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StaffServiceImpl implements StaffService {

    private final StaffRepository staffRepository;
    private final HotelRepository hotelRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    public StaffDTO createStaff(StaffDTO staffDTO) {
        if (staffRepository.existsByEmail(staffDTO.getEmail())) {
            throw new IllegalArgumentException("Staff email is already in use.");
        }
        if (userRepository.existsByEmail(staffDTO.getEmail())) {
            throw new IllegalArgumentException("Email is already in use by another user.");
        }
        
        Staff staff = convertToEntity(staffDTO);
        Staff savedStaff = staffRepository.save(staff);

        // Automatically create User credentials for staff login
        User user = User.builder()
                .firstName(staffDTO.getFirstName())
                .lastName(staffDTO.getLastName())
                .email(staffDTO.getEmail())
                .password(passwordEncoder.encode("staff123")) // default password
                .role(Role.STAFF)
                .status(UserStatus.ACTIVE)
                .build();
        userRepository.save(user);

        return convertToDto(savedStaff);
    }

    @Override
    @Transactional
    public StaffDTO updateStaff(Long staffId, StaffDTO staffDTO) {
        Staff existingStaff = staffRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff member not found with id: " + staffId));

        Hotel hotel = hotelRepository.findById(staffDTO.getAssignedHotelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + staffDTO.getAssignedHotelId()));

        existingStaff.setFirstName(staffDTO.getFirstName());
        existingStaff.setLastName(staffDTO.getLastName());
        existingStaff.setRole(staffDTO.getRole());
        existingStaff.setSalary(staffDTO.getSalary());
        existingStaff.setAssignedHotel(hotel);

        // Update email only if it's changing and not already taken
        if (!existingStaff.getEmail().equalsIgnoreCase(staffDTO.getEmail())) {
            if (staffRepository.existsByEmail(staffDTO.getEmail())) {
                throw new IllegalArgumentException("Email is already in use by another staff member.");
            }
            existingStaff.setEmail(staffDTO.getEmail());
        }

        Staff updatedStaff = staffRepository.save(existingStaff);
        return convertToDto(updatedStaff);
    }

    @Override
    @Transactional
    public void deleteStaff(Long staffId) {
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff member not found with id: " + staffId));
        
        // Delete corresponding User login account
        userRepository.findByEmail(staff.getEmail()).ifPresent(userRepository::delete);
        
        staffRepository.delete(staff);
    }

    @Override
    @Transactional(readOnly = true)
    public StaffDTO getStaffById(Long staffId) {
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff member not found with id: " + staffId));
        return convertToDto(staff);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StaffDTO> getAllStaff() {
        return staffRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<StaffDTO> getStaffByHotelId(Long hotelId) {
        return staffRepository.findByAssignedHotelHotelId(hotelId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private StaffDTO convertToDto(Staff staff) {
        StaffDTO dto = modelMapper.map(staff, StaffDTO.class);
        dto.setAssignedHotelId(staff.getAssignedHotel().getHotelId());
        dto.setAssignedHotelName(staff.getAssignedHotel().getHotelName());
        return dto;
    }

    private Staff convertToEntity(StaffDTO dto) {
        Staff staff = modelMapper.map(dto, Staff.class);
        Hotel hotel = hotelRepository.findById(dto.getAssignedHotelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + dto.getAssignedHotelId()));
        staff.setAssignedHotel(hotel);
        return staff;
    }
}
