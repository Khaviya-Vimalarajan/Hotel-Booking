package com.luxury.hotel.controller;

import com.luxury.hotel.dto.BookingDTO;
import com.luxury.hotel.dto.BookingRequest;
import com.luxury.hotel.security.UserDetailsImpl;
import com.luxury.hotel.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingDTO> createBooking(@Valid @RequestBody BookingRequest request) {
        return new ResponseEntity<>(bookingService.createBooking(request), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingDTO> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingDTO>> getMyBookings(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return ResponseEntity.ok(bookingService.getBookingsByUserId(userDetails.getId()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<BookingDTO>> getAllBookings(org.springframework.security.core.Authentication authentication) {
        return ResponseEntity.ok(bookingService.getAllBookingsForUser(authentication));
    }

    @GetMapping("/check")
    public ResponseEntity<Boolean> checkAvailability(
            @RequestParam Long roomId,
            @RequestParam String checkIn,
            @RequestParam String checkOut) {
        java.time.LocalDate checkInDate = java.time.LocalDate.parse(checkIn);
        java.time.LocalDate checkOutDate = java.time.LocalDate.parse(checkOut);
        boolean isAvailable = bookingService.checkAvailability(roomId, checkInDate, checkOutDate);
        return ResponseEntity.ok(isAvailable);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<BookingDTO> updateBookingStatus(@PathVariable Long id, @RequestBody Map<String, String> statusMap) {
        String status = statusMap.get("status");
        if (status == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(bookingService.updateBookingStatus(id, status));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<BookingDTO> cancelBooking(@PathVariable Long id, org.springframework.security.core.Authentication authentication) {
        String email = authentication.getName();
        BookingDTO booking = bookingService.getBookingById(id);
        if (!booking.getUserEmail().equals(email)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        if ("COMPLETED".equals(booking.getBookingStatus()) || "CANCELLED".equals(booking.getBookingStatus())) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(bookingService.updateBookingStatus(id, "CANCELLED"));
    }
}
