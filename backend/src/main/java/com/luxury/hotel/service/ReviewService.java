package com.luxury.hotel.service;

import com.luxury.hotel.dto.ReviewDTO;
import java.util.List;

public interface ReviewService {
    ReviewDTO submitReview(ReviewDTO reviewDTO);
    List<ReviewDTO> getReviewsByHotelId(Long hotelId);
    void deleteReview(Long reviewId);
}
