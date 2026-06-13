package com.luxury.hotel.service;

import com.luxury.hotel.dto.PromotionDTO;
import java.util.List;

public interface PromotionService {
    PromotionDTO createPromotion(PromotionDTO promotionDTO);
    PromotionDTO updatePromotion(Long promotionId, PromotionDTO promotionDTO);
    void deletePromotion(Long promotionId);
    PromotionDTO getPromotionById(Long promotionId);
    List<PromotionDTO> getAllPromotions();
    PromotionDTO verifyPromoCode(String code);
}
