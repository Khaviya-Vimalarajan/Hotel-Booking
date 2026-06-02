package com.luxury.hotel.repository;

import com.luxury.hotel.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    List<Booking> findByUserIdOrderByBookingDateDesc(Long userId);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.room.roomId = :roomId " +
           "AND b.bookingStatus NOT IN (com.luxury.hotel.entity.BookingStatus.CANCELLED) " +
           "AND b.checkInDate < :checkOutDate AND b.checkOutDate > :checkInDate")
    long countOverlappingBookings(@Param("roomId") Long roomId,
                                 @Param("checkInDate") LocalDate checkInDate,
                                 @Param("checkOutDate") LocalDate checkOutDate);

    List<Booking> findByRoomHotelHotelId(Long hotelId);

    boolean existsByUserIdAndRoomHotelHotelIdAndBookingStatus(Long userId, Long hotelId, com.luxury.hotel.entity.BookingStatus status);
}
