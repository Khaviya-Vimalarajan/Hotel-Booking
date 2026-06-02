package com.luxury.hotel.repository;

import com.luxury.hotel.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Long> {
    List<Staff> findByAssignedHotelHotelId(Long hotelId);
    java.util.Optional<Staff> findByEmail(String email);
    boolean existsByEmail(String email);
}
