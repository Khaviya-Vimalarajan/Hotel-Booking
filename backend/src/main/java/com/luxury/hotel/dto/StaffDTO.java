package com.luxury.hotel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StaffDTO {
    private Long staffId;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private BigDecimal salary;
    private Long assignedHotelId;
    private String assignedHotelName;
}
