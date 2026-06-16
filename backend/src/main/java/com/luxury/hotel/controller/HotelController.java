package com.luxury.hotel.controller;

import com.luxury.hotel.dto.HotelDTO;
import com.luxury.hotel.dto.RoomDTO;
import com.luxury.hotel.service.HotelService;
import com.luxury.hotel.service.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/hotels")
@RequiredArgsConstructor
@CrossOrigin
public class HotelController {

    private final HotelService hotelService;
    private final RoomService roomService;

    @GetMapping
    public ResponseEntity<List<HotelDTO>> getHotels(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String search) {
        if (city != null || country != null || search != null) {
            return ResponseEntity.ok(hotelService.searchHotels(city, country, search));
        }
        return ResponseEntity.ok(hotelService.getAllHotels());
    }

    @GetMapping("/{id}")
    public ResponseEntity<HotelDTO> getHotelById(@PathVariable Long id) {
        return ResponseEntity.ok(hotelService.getHotelById(id));
    }

    @GetMapping("/{id}/rooms")
    public ResponseEntity<List<RoomDTO>> getRoomsByHotel(@PathVariable Long id) {
        return ResponseEntity.ok(roomService.getRoomsByHotelId(id));
    }

    @GetMapping("/{id}/available-rooms")
    public ResponseEntity<List<RoomDTO>> getAvailableRoomsByHotel(@PathVariable Long id) {
        return ResponseEntity.ok(roomService.getAvailableRoomsByHotelId(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HotelDTO> createHotel(@Valid @RequestBody HotelDTO hotelDTO) {
        return new ResponseEntity<>(hotelService.createHotel(hotelDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HotelDTO> updateHotel(@PathVariable Long id, @Valid @RequestBody HotelDTO hotelDTO) {
        return ResponseEntity.ok(hotelService.updateHotel(id, hotelDTO));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteHotel(@PathVariable Long id) {
        hotelService.deleteHotel(id);
        return ResponseEntity.noContent().build();
    }
}
