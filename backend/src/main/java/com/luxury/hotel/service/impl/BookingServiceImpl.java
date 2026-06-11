package com.luxury.hotel.service.impl;

import com.luxury.hotel.dto.BookingDTO;
import com.luxury.hotel.dto.BookingRequest;
import com.luxury.hotel.entity.*;
import com.luxury.hotel.exception.InvalidBookingException;
import com.luxury.hotel.exception.ResourceNotFoundException;
import com.luxury.hotel.exception.RoomNotAvailableException;
import com.luxury.hotel.repository.*;
import com.luxury.hotel.service.BookingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final PromotionRepository promotionRepository;
    private final NotificationRepository notificationRepository;
    private final PaymentRepository paymentRepository;
    private final StaffRepository staffRepository;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    public BookingDTO createBooking(BookingRequest request) {
        log.debug("Booking creation request received for Room ID: {} by User ID: {}", request.getRoomId(), request.getUserId());
        
        // 1. Validate dates
        LocalDate checkIn = request.getCheckInDate();
        LocalDate checkOut = request.getCheckOutDate();
        if (checkOut.isBefore(checkIn) || checkOut.isEqual(checkIn)) {
            throw new InvalidBookingException("Check-out date must be after check-in date.");
        }
        
        // 2. Check room availability
        boolean isAvailable = checkAvailability(request.getRoomId(), checkIn, checkOut);
        if (!isAvailable) {
            throw new RoomNotAvailableException("Room is not available for the selected dates.");
        }

        // 3. Retrieve Room and User
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + request.getRoomId()));
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));

        // 4. Calculate total amount
        long daysBetween = ChronoUnit.DAYS.between(checkIn, checkOut);
        BigDecimal pricePerNight = room.getPricePerNight();
        BigDecimal totalAmount = pricePerNight.multiply(BigDecimal.valueOf(daysBetween));

        // 5. Apply Promo Code if present
        if (request.getPromoCode() != null && !request.getPromoCode().trim().isEmpty()) {
            Promotion promotion = promotionRepository.findByTitleIgnoreCaseAndStatus(request.getPromoCode().trim(), "ACTIVE")
                    .orElseThrow(() -> new ResourceNotFoundException("Invalid or expired Promotion code: " + request.getPromoCode()));
            
            BigDecimal discountMultiplier = BigDecimal.ONE.subtract(
                    promotion.getDiscountPercentage().divide(BigDecimal.valueOf(100)));
            totalAmount = totalAmount.multiply(discountMultiplier);
            log.info("Applied promo code: {}, new price: {}", request.getPromoCode(), totalAmount);
        }

        // 6. Build & Save Booking
        Booking booking = Booking.builder()
                .room(room)
                .user(user)
                .checkInDate(checkIn)
                .checkOutDate(checkOut)
                .guestCount(request.getGuestCount())
                .totalAmount(totalAmount)
                .bookingStatus(BookingStatus.PENDING)
                .build();

        Booking savedBooking = bookingRepository.save(booking);

        // 7. Trigger notification
        Notification notification = Notification.builder()
                .user(user)
                .title("New Booking Reservation")
                .message("Your reservation at " + room.getHotel().getHotelName() + ", Room " + room.getRoomNumber() + " is pending payment.")
                .readStatus(false)
                .build();
        notificationRepository.save(notification);

        // Notify Admins and Staff located at this specific hotel
        try {
            userRepository.findByRole(Role.ADMIN).forEach(admin -> {
                notificationRepository.save(Notification.builder()
                        .user(admin)
                        .title("New Booking Created")
                        .message("Customer " + user.getFirstName() + " " + user.getLastName() + " created booking ID #" + savedBooking.getBookingId() + " for " + room.getHotel().getHotelName() + ".")
                        .readStatus(false)
                        .build());
            });
            
            staffRepository.findByAssignedHotelHotelId(room.getHotel().getHotelId()).forEach(staffMember -> {
                userRepository.findByEmail(staffMember.getEmail()).ifPresent(staffUser -> {
                    notificationRepository.save(Notification.builder()
                            .user(staffUser)
                            .title("New Booking Created")
                            .message("Customer " + user.getFirstName() + " " + user.getLastName() + " created booking ID #" + savedBooking.getBookingId() + " for " + room.getHotel().getHotelName() + ".")
                            .readStatus(false)
                            .build());
                });
            });
        } catch (Exception e) {
            log.error("Failed to send admin/staff notifications", e);
        }

        return convertToDto(savedBooking);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingDTO getBookingById(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));
        return convertToDto(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingDTO> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingDTO> getAllBookingsForUser(org.springframework.security.core.Authentication authentication) {
        String email = authentication.getName();
        User loggedInUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        if (loggedInUser.getRole() == Role.STAFF) {
            // Find staff registry entry to get assigned hotel branch
            Staff staff = staffRepository.findByEmail(email)
                    .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException(
                            "Access Denied: Only registered staff members are authorized."
                    ));

            // Check if job role is authorized (Receptionist)
            String jobRole = staff.getRole().toLowerCase();
            if (!jobRole.contains("receptionist")) {
                throw new org.springframework.security.access.AccessDeniedException(
                        "Access Denied: Only Receptionists are authorized to access the front-desk operations dashboard."
                );
            }

            return bookingRepository.findByRoomHotelHotelId(staff.getAssignedHotel().getHotelId()).stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
        }

        // Admins can see all bookings
        return bookingRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingDTO> getBookingsByUserId(Long userId) {
        return bookingRepository.findByUserIdOrderByBookingDateDesc(userId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingDTO> getBookingsByHotelId(Long hotelId) {
        return bookingRepository.findByRoomHotelHotelId(hotelId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BookingDTO updateBookingStatus(Long bookingId, String status) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));
        
        BookingStatus bookingStatus = BookingStatus.valueOf(status.toUpperCase());
        booking.setBookingStatus(bookingStatus);

        // Update Room Status based on actions
        Room room = booking.getRoom();
        if (bookingStatus == BookingStatus.COMPLETED) {
            room.setRoomStatus(RoomStatus.AVAILABLE);
        } else if (bookingStatus == BookingStatus.CONFIRMED) {
            room.setRoomStatus(RoomStatus.BOOKED);
        } else if (bookingStatus == BookingStatus.CHECKED_IN) {
            room.setRoomStatus(RoomStatus.OCCUPIED);
        } else if (bookingStatus == BookingStatus.CANCELLED) {
            room.setRoomStatus(RoomStatus.AVAILABLE);
            
            // Handle automatic refunding of payment if booking is cancelled
            paymentRepository.findByBookingBookingId(booking.getBookingId()).ifPresent(payment -> {
                if (payment.getPaymentStatus() == PaymentStatus.COMPLETED) {
                    payment.setPaymentStatus(PaymentStatus.REFUNDED);
                    
                    // Trigger Refund Notification
                    notificationRepository.save(Notification.builder()
                            .user(booking.getUser())
                            .title("Booking Refund Processed")
                            .message("Your payment of LKR " + payment.getAmount() + " for Room " + room.getRoomNumber() + " has been successfully refunded to your original payment method.")
                            .readStatus(false)
                            .build());
                } else if (payment.getPaymentStatus() == PaymentStatus.PENDING) {
                    payment.setPaymentStatus(PaymentStatus.FAILED);
                }
                paymentRepository.save(payment);
            });
        }
        roomRepository.save(room);

        Booking updatedBooking = bookingRepository.save(booking);

        // Trigger Notification
        Notification notification = Notification.builder()
                .user(booking.getUser())
                .title("Booking Status Updated")
                .message("Your booking reservation status for Room " + room.getRoomNumber() + " has been updated to " + status + ".")
                .readStatus(false)
                .build();
        notificationRepository.save(notification);

        // Notify Admins and Staff located at this specific hotel about status updates
        try {
            userRepository.findByRole(Role.ADMIN).forEach(admin -> {
                notificationRepository.save(Notification.builder()
                        .user(admin)
                        .title("Booking Status Changed")
                        .message("Booking ID #" + booking.getBookingId() + " status updated to " + status + ".")
                        .readStatus(false)
                        .build());
            });
            
            staffRepository.findByAssignedHotelHotelId(room.getHotel().getHotelId()).forEach(staffMember -> {
                userRepository.findByEmail(staffMember.getEmail()).ifPresent(staffUser -> {
                    notificationRepository.save(Notification.builder()
                            .user(staffUser)
                            .title("Booking Status Changed")
                            .message("Booking ID #" + booking.getBookingId() + " status updated to " + status + ".")
                            .readStatus(false)
                            .build());
                });
            });
        } catch (Exception e) {
            log.error("Failed to send admin/staff booking update notifications", e);
        }

        return convertToDto(updatedBooking);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean checkAvailability(Long roomId, LocalDate checkInDate, LocalDate checkOutDate) {
        long overlapCount = bookingRepository.countOverlappingBookings(roomId, checkInDate, checkOutDate);
        return overlapCount == 0;
    }

    private BookingDTO convertToDto(Booking booking) {
        BookingDTO dto = modelMapper.map(booking, BookingDTO.class);
        dto.setUserId(booking.getUser().getId());
        dto.setUserEmail(booking.getUser().getEmail());
        dto.setUserName(booking.getUser().getFirstName() + " " + booking.getUser().getLastName());
        dto.setRoomId(booking.getRoom().getRoomId());
        dto.setRoomNumber(booking.getRoom().getRoomNumber());
        dto.setHotelName(booking.getRoom().getHotel().getHotelName());
        dto.setHotelId(booking.getRoom().getHotel().getHotelId());
        dto.setBookingStatus(booking.getBookingStatus().name());
        return dto;
    }
}
