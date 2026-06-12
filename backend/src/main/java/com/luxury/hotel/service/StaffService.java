package com.luxury.hotel.service;

import com.luxury.hotel.dto.StaffDTO;
import java.util.List;

public interface StaffService {
    StaffDTO createStaff(StaffDTO staffDTO);
    StaffDTO updateStaff(Long staffId, StaffDTO staffDTO);
    void deleteStaff(Long staffId);
    StaffDTO getStaffById(Long staffId);
    List<StaffDTO> getAllStaff();
    List<StaffDTO> getStaffByHotelId(Long hotelId);
}
