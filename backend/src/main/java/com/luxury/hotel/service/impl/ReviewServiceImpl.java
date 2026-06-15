package com.luxury.hotel.service.impl;

import com.luxury.hotel.dto.ReviewDTO;
import com.luxury.hotel.entity.*;
import com.luxury.hotel.exception.InvalidBookingException;
import com.luxury.hotel.exception.ResourceNotFoundException;
import com.luxury.hotel.repository.BookingRepository;
import com.luxury.hotel.repository.HotelRepository;
import com.luxury.hotel.repository.ReviewRepository;
import com.luxury.hotel.repository.UserRepository;
import com.luxury.hotel.service.ReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final HotelRepository hotelRepository;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    public ReviewDTO submitReview(ReviewDTO reviewDTO) {
        log.debug("Submitting review for Hotel ID: {} by User ID: {}", reviewDTO.getHotelId(), reviewDTO.getUserId());

        // Validate business rule: Must have a completed booking at this hotel
        boolean hasCompletedStay = bookingRepository.existsByUserIdAndRoomHotelHotelIdAndBookingStatus(
                reviewDTO.getUserId(), reviewDTO.getHotelId(), BookingStatus.COMPLETED);

        if (!hasCompletedStay) {
            throw new InvalidBookingException("Only customers with a COMPLETED stay at this hotel may write a review.");
        }

        User user = userRepository.findById(reviewDTO.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + reviewDTO.getUserId()));
        Hotel hotel = hotelRepository.findById(reviewDTO.getHotelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + reviewDTO.getHotelId()));

        Review review = Review.builder()
                .user(user)
                .hotel(hotel)
                .rating(reviewDTO.getRating())
                .comment(reviewDTO.getComment())
                .build();

        Review savedReview = reviewRepository.save(review);
        log.info("Review saved successfully. ID: {}", savedReview.getReviewId());

        // Update hotel average star rating
        updateHotelStarRating(hotel);

        return convertToDto(savedReview);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewDTO> getReviewsByHotelId(Long hotelId) {
        return reviewRepository.findByHotelHotelIdOrderByCreatedDateDesc(hotelId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));
        Hotel hotel = review.getHotel();
        reviewRepository.deleteById(reviewId);
        updateHotelStarRating(hotel);
    }

    private void updateHotelStarRating(Hotel hotel) {
        List<Review> reviews = reviewRepository.findByHotelHotelIdOrderByCreatedDateDesc(hotel.getHotelId());
        if (!reviews.isEmpty()) {
            double sum = reviews.stream().mapToInt(Review::getRating).sum();
            double avg = sum / reviews.size();
            hotel.setStarRating(Math.round(avg * 10.0) / 10.0); // round to 1 decimal place
            hotelRepository.save(hotel);
            log.info("Updated hotel star rating: {}", hotel.getStarRating());
        }
    }

    private ReviewDTO convertToDto(Review review) {
        ReviewDTO dto = modelMapper.map(review, ReviewDTO.class);
        dto.setUserId(review.getUser().getId());
        dto.setUserName(review.getUser().getFirstName() + " " + review.getUser().getLastName());
        dto.setUserImage(review.getUser().getProfileImage());
        dto.setHotelId(review.getHotel().getHotelId());
        return dto;
    }
}
