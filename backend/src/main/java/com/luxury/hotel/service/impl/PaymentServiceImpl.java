package com.luxury.hotel.service.impl;

import com.luxury.hotel.dto.PaymentDTO;
import com.luxury.hotel.dto.PaymentRequest;
import com.luxury.hotel.entity.*;
import com.luxury.hotel.exception.InvalidBookingException;
import com.luxury.hotel.exception.ResourceNotFoundException;
import com.luxury.hotel.repository.BookingRepository;
import com.luxury.hotel.repository.NotificationRepository;
import com.luxury.hotel.repository.PaymentRepository;
import com.luxury.hotel.repository.RoomRepository;
import com.luxury.hotel.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final NotificationRepository notificationRepository;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    public PaymentDTO processPayment(PaymentRequest request) {
        log.debug("Processing payment for Booking ID: {} of Amount: {}", request.getBookingId(), request.getAmount());

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + request.getBookingId()));

        // Validate booking status (must be pending)
        if (booking.getBookingStatus() != BookingStatus.PENDING) {
            throw new InvalidBookingException("Payment can only be processed for PENDING bookings.");
        }

        // Validate billing amount matches booking price
        if (request.getAmount().compareTo(booking.getTotalAmount()) != 0) {
            throw new InvalidBookingException("Payment amount does not match booking total amount of: " + booking.getTotalAmount());
        }

        // Credit card validation simulation
        if ("Credit Card".equalsIgnoreCase(request.getPaymentMethod())) {
            String card = request.getCardNumber();
            String cvv = request.getCvv();
            if (card == null || card.replaceAll("\\s+", "").length() < 13 || cvv == null || cvv.length() < 3) {
                throw new InvalidBookingException("Invalid Credit Card details submitted.");
            }
        }

        // Complete transition
        booking.setBookingStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        Room room = booking.getRoom();
        room.setRoomStatus(RoomStatus.BOOKED);
        roomRepository.save(room);

        // Save transaction
        Payment payment = Payment.builder()
                .booking(booking)
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod())
                .transactionId("TXN-" + UUID.randomUUID().toString().toUpperCase().substring(0, 12))
                .paymentStatus(PaymentStatus.COMPLETED)
                .build();

        Payment savedPayment = paymentRepository.save(payment);

        // User confirmation alert
        Notification notification = Notification.builder()
                .user(booking.getUser())
                .title("Booking Payment Confirmed")
                .message("Your payment of LKR " + request.getAmount() + " for Room " + room.getRoomNumber() + " at " + room.getHotel().getHotelName() + " is successful.")
                .readStatus(false)
                .build();
        notificationRepository.save(notification);

        // Delete the redundant "New Booking Reservation" notification for this user
        try {
            List<Notification> userNotifs = notificationRepository.findByUserIdOrderByCreatedAtDesc(booking.getUser().getId());
            userNotifs.stream()
                    .filter(n -> "New Booking Reservation".equalsIgnoreCase(n.getTitle()) && n.getMessage().contains("Room " + room.getRoomNumber()))
                    .forEach(notificationRepository::delete);
        } catch (Exception e) {
            log.error("Failed to delete redundant pending payment notification", e);
        }

        log.info("Payment processed successfully. Transaction: {}", savedPayment.getTransactionId());
        return convertToDto(savedPayment);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentDTO getPaymentByBookingId(Long bookingId) {
        Payment payment = paymentRepository.findByBookingBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for booking id: " + bookingId));
        return convertToDto(payment);
    }

    @Override
    @Transactional
    public PaymentDTO refundPayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + paymentId));

        if (payment.getPaymentStatus() != PaymentStatus.COMPLETED) {
            throw new InvalidBookingException("Only completed payments can be refunded.");
        }

        payment.setPaymentStatus(PaymentStatus.REFUNDED);
        Payment updatedPayment = paymentRepository.save(payment);

        Booking booking = payment.getBooking();
        booking.setBookingStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        Room room = booking.getRoom();
        room.setRoomStatus(RoomStatus.AVAILABLE);
        roomRepository.save(room);

        // Notification alert
        Notification notification = Notification.builder()
                .user(booking.getUser())
                .title("Refund Processed")
                .message("Your refund of $" + payment.getAmount() + " for Booking ID: " + booking.getBookingId() + " has been processed.")
                .readStatus(false)
                .build();
        notificationRepository.save(notification);

        return convertToDto(updatedPayment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentDTO> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private PaymentDTO convertToDto(Payment payment) {
        PaymentDTO dto = modelMapper.map(payment, PaymentDTO.class);
        dto.setBookingId(payment.getBooking().getBookingId());
        dto.setPaymentStatus(payment.getPaymentStatus().name());
        return dto;
    }
}
