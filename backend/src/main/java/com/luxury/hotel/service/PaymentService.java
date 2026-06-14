package com.luxury.hotel.service;

import com.luxury.hotel.dto.PaymentDTO;
import com.luxury.hotel.dto.PaymentRequest;
import java.util.List;

public interface PaymentService {
    PaymentDTO processPayment(PaymentRequest request);
    PaymentDTO getPaymentByBookingId(Long bookingId);
    PaymentDTO refundPayment(Long paymentId);
    List<PaymentDTO> getAllPayments();
}
