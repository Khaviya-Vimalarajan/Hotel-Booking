package com.luxury.hotel.service.impl;

import com.luxury.hotel.dto.RoomDTO;
import com.luxury.hotel.entity.*;
import com.luxury.hotel.exception.ResourceNotFoundException;
import com.luxury.hotel.repository.AmenityRepository;
import com.luxury.hotel.repository.HotelRepository;
import com.luxury.hotel.repository.RoomCategoryRepository;
import com.luxury.hotel.repository.RoomRepository;
import com.luxury.hotel.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final HotelRepository hotelRepository;
    private final RoomCategoryRepository roomCategoryRepository;
    private final AmenityRepository amenityRepository;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    public RoomDTO createRoom(RoomDTO roomDTO) {
        Room room = convertToEntity(roomDTO);
        Room savedRoom = roomRepository.save(room);
        return convertToDto(savedRoom);
    }

    @Override
    @Transactional
    public RoomDTO updateRoom(Long roomId, RoomDTO roomDTO) {
        Room existingRoom = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + roomId));

        Hotel hotel = hotelRepository.findById(roomDTO.getHotelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + roomDTO.getHotelId()));
        RoomCategory category = roomCategoryRepository.findById(roomDTO.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Room Category not found with id: " + roomDTO.getCategoryId()));

        existingRoom.setHotel(hotel);
        existingRoom.setCategory(category);
        existingRoom.setRoomNumber(roomDTO.getRoomNumber());
        existingRoom.setFloorNumber(roomDTO.getFloorNumber());
        existingRoom.setCapacity(roomDTO.getCapacity());
        existingRoom.setPricePerNight(roomDTO.getPricePerNight());
        existingRoom.setRoomSize(roomDTO.getRoomSize());
        existingRoom.setImage(roomDTO.getImage());
        existingRoom.setRoomStatus(RoomStatus.valueOf(roomDTO.getRoomStatus().toUpperCase()));

        if (roomDTO.getAmenities() != null) {
            Set<Amenity> amenities = roomDTO.getAmenities().stream()
                    .map(name -> amenityRepository.findByAmenityNameIgnoreCase(name)
                            .orElseGet(() -> amenityRepository.save(Amenity.builder().amenityName(name).build())))
                    .collect(Collectors.toSet());
            existingRoom.setAmenities(amenities);
        }

        Room updatedRoom = roomRepository.save(existingRoom);
        return convertToDto(updatedRoom);
    }

    @Override
    @Transactional
    public void deleteRoom(Long roomId) {
        if (!roomRepository.existsById(roomId)) {
            throw new ResourceNotFoundException("Room not found with id: " + roomId);
        }
        roomRepository.deleteById(roomId);
    }

    @Override
    @Transactional(readOnly = true)
    public RoomDTO getRoomById(Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + roomId));
        return convertToDto(room);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomDTO> getAllRooms() {
        return roomRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomDTO> getRoomsByHotelId(Long hotelId) {
        return roomRepository.findByHotelHotelId(hotelId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomDTO> getAvailableRoomsByHotelId(Long hotelId) {
        return roomRepository.findByHotelHotelIdAndRoomStatus(hotelId, RoomStatus.AVAILABLE).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RoomDTO updateRoomStatus(Long roomId, String status) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + roomId));
        room.setRoomStatus(RoomStatus.valueOf(status.toUpperCase()));
        Room updatedRoom = roomRepository.save(room);
        return convertToDto(updatedRoom);
    }

    private RoomDTO convertToDto(Room room) {
        RoomDTO dto = modelMapper.map(room, RoomDTO.class);
        dto.setHotelId(room.getHotel().getHotelId());
        dto.setHotelName(room.getHotel().getHotelName());
        dto.setCategoryId(room.getCategory().getCategoryId());
        dto.setCategoryName(room.getCategory().getCategoryName());
        dto.setRoomStatus(room.getRoomStatus().name());
        
        Set<String> amenityNames = room.getAmenities().stream()
                .map(Amenity::getAmenityName)
                .collect(Collectors.toSet());
        dto.setAmenities(amenityNames);
        return dto;
    }

    private Room convertToEntity(RoomDTO dto) {
        Room room = new Room();
        Hotel hotel = hotelRepository.findById(dto.getHotelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + dto.getHotelId()));
        RoomCategory category = roomCategoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + dto.getCategoryId()));

        room.setHotel(hotel);
        room.setCategory(category);
        room.setRoomNumber(dto.getRoomNumber());
        room.setFloorNumber(dto.getFloorNumber());
        room.setCapacity(dto.getCapacity());
        room.setPricePerNight(dto.getPricePerNight());
        room.setRoomSize(dto.getRoomSize());
        room.setImage(dto.getImage());
        room.setRoomStatus(RoomStatus.valueOf(dto.getRoomStatus().toUpperCase()));

        if (dto.getAmenities() != null) {
            Set<Amenity> amenities = dto.getAmenities().stream()
                    .map(name -> amenityRepository.findByAmenityNameIgnoreCase(name)
                            .orElseGet(() -> amenityRepository.save(Amenity.builder().amenityName(name).build())))
                    .collect(Collectors.toSet());
            room.setAmenities(amenities);
        }

        return room;
    }
}
