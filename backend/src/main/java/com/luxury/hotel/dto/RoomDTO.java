package com.luxury.hotel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomDTO {
    private Long roomId;
    private Long hotelId;
    private String hotelName;
    private Long categoryId;
    private String categoryName;
    private String roomNumber;
    private Integer floorNumber;
    private Integer capacity;
    private BigDecimal pricePerNight;
    private Integer roomSize;
    private String image;
    private String roomStatus; // AVAILABLE, BOOKED, OCCUPIED, MAINTENANCE
    private Set<String> amenities;
}
