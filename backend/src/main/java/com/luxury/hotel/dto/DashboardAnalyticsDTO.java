package com.luxury.hotel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardAnalyticsDTO {
    private long totalHotels;
    private long totalRooms;
    private long totalCustomers;
    private long totalBookings;
    private BigDecimal totalRevenue;
    private long activePromotions;
    private Map<String, BigDecimal> revenueByMonth;
    private Map<String, Long> occupancyRates; // Status -> Room Count
}
