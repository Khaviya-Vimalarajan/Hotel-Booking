package com.luxury.hotel.service;

import com.luxury.hotel.dto.RoomDTO;
import java.util.List;

public interface RoomService {
    RoomDTO createRoom(RoomDTO roomDTO);
    RoomDTO updateRoom(Long roomId, RoomDTO roomDTO);
    void deleteRoom(Long roomId);
    RoomDTO getRoomById(Long roomId);
    List<RoomDTO> getAllRooms();
    List<RoomDTO> getRoomsByHotelId(Long hotelId);
    List<RoomDTO> getAvailableRoomsByHotelId(Long hotelId);
    RoomDTO updateRoomStatus(Long roomId, String status);
}
