package com.luxury.hotel.repository;

import com.luxury.hotel.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByHotelHotelId(Long hotelId);
    List<Room> findByHotelHotelIdAndRoomStatus(Long hotelId, com.luxury.hotel.entity.RoomStatus roomStatus);
}
