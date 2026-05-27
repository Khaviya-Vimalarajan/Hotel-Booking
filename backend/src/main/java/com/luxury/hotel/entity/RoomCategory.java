package com.luxury.hotel.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "room_categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "category_id")
    private Long categoryId;

    @Column(name = "category_name", nullable = false, unique = true, length = 50)
    private String categoryName;

    @Column(columnDefinition = "TEXT")
    private String description;
}
