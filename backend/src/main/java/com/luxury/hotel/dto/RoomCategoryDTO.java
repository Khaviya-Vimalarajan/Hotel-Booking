package com.luxury.hotel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomCategoryDTO {
    private Long categoryId;
    private String categoryName;
    private String description;
}
