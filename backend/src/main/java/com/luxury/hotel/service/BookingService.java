package com.luxury.hotel.service;

import com.luxury.hotel.dto.BookingDTO;
import com.luxury.hotel.dto.BookingRequest;
import java.time.LocalDate;
import java.util.List;

public interface BookingService {
    BookingDTO createBooking(BookingRequest request);
    BookingDTO getBookingById(Long bookingId);
    List<BookingDTO> getAllBookings();
    List<BookingDTO> getAllBookingsForUser(org.springframework.security.core.Authentication authentication);
    List<BookingDTO> getBookingsByUserId(Long userId);
    List<BookingDTO> getBookingsByHotelId(Long hotelId);
    BookingDTO updateBookingStatus(Long bookingId, String status);
    boolean checkAvailability(Long roomId, LocalDate checkInDate, LocalDate checkOutDate);
}
