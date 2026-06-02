package com.luxury.hotel.repository;

import com.luxury.hotel.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {
    Optional<Promotion> findByTitleIgnoreCaseAndStatus(String title, String status);
}
