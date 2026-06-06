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
public class ReviewDTO {
    private Long reviewId;
    private Long userId;
    private String userName;
    private String userImage;
    private Long hotelId;
    private Integer rating;
    private String comment;
    private LocalDateTime createdDate;
}
