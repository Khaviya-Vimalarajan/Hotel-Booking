package com.luxury.hotel.service.impl;

import com.luxury.hotel.dto.DashboardAnalyticsDTO;
import com.luxury.hotel.entity.*;
import com.luxury.hotel.repository.*;
import com.luxury.hotel.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final PromotionRepository promotionRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardAnalyticsDTO getDashboardAnalytics() {
        long totalHotels = hotelRepository.count();
        long totalRooms = roomRepository.count();
        long totalBookings = bookingRepository.count();
        
        long totalCustomers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.CUSTOMER)
                .count();

        List<Payment> payments = paymentRepository.findAll();
        BigDecimal totalRevenue = payments.stream()
                .filter(p -> p.getPaymentStatus() == PaymentStatus.COMPLETED)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long activePromotions = promotionRepository.findAll().stream()
                .filter(p -> "ACTIVE".equalsIgnoreCase(p.getStatus()))
                .count();

        // 1. Group revenue by month
        Map<String, BigDecimal> revenueByMonth = new LinkedHashMap<>();
        // Pre-populate last 6 months for chart visualization consistency
        List<String> lastSixMonths = new ArrayList<>();
        java.time.LocalDate date = java.time.LocalDate.now().minusMonths(5);
        for (int i = 0; i < 6; i++) {
            String monthName = date.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            lastSixMonths.add(monthName);
            revenueByMonth.put(monthName, BigDecimal.ZERO);
            date = date.plusMonths(1);
        }

        payments.stream()
                .filter(p -> p.getPaymentStatus() == PaymentStatus.COMPLETED && p.getPaymentDate() != null)
                .forEach(p -> {
                    String monthName = p.getPaymentDate().getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
                    if (revenueByMonth.containsKey(monthName)) {
                        BigDecimal existing = revenueByMonth.get(monthName);
                        revenueByMonth.put(monthName, existing.add(p.getAmount()));
                    }
                });

        // 2. Room Occupancy Rates
        Map<String, Long> occupancyRates = new HashMap<>();
        for (RoomStatus status : RoomStatus.values()) {
            occupancyRates.put(status.name(), 0L);
        }

        roomRepository.findAll().forEach(room -> {
            String status = room.getRoomStatus().name();
            occupancyRates.put(status, occupancyRates.getOrDefault(status, 0L) + 1);
        });

        return DashboardAnalyticsDTO.builder()
                .totalHotels(totalHotels)
                .totalRooms(totalRooms)
                .totalCustomers(totalCustomers)
                .totalBookings(totalBookings)
                .totalRevenue(totalRevenue)
                .activePromotions(activePromotions)
                .revenueByMonth(revenueByMonth)
                .occupancyRates(occupancyRates)
                .build();
    }
}
