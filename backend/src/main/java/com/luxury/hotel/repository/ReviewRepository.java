package com.luxury.hotel.repository;

import com.luxury.hotel.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByHotelHotelIdOrderByCreatedDateDesc(Long hotelId);
    boolean existsByUserEmailAndHotelHotelId(String email, Long hotelId);
}
