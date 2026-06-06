package com.luxury.hotel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HotelDTO {
    private Long hotelId;
    private String hotelName;
    private String description;
    private String address;
    private String city;
    private String country;
    private Double starRating;
    private String contactNumber;
    private String email;
    private String image;
    private LocalDateTime createdAt;
}
