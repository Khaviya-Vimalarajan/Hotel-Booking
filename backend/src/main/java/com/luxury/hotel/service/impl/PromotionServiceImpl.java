package com.luxury.hotel.service.impl;

import com.luxury.hotel.dto.PromotionDTO;
import com.luxury.hotel.entity.Promotion;
import com.luxury.hotel.exception.InvalidBookingException;
import com.luxury.hotel.exception.ResourceNotFoundException;
import com.luxury.hotel.repository.PromotionRepository;
import com.luxury.hotel.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PromotionServiceImpl implements PromotionService {

    private final PromotionRepository promotionRepository;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    public PromotionDTO createPromotion(PromotionDTO promotionDTO) {
        Promotion promotion = modelMapper.map(promotionDTO, Promotion.class);
        if (promotion.getStatus() == null) {
            promotion.setStatus("ACTIVE");
        }
        Promotion savedPromo = promotionRepository.save(promotion);
        return convertToDto(savedPromo);
    }

    @Override
    @Transactional
    public PromotionDTO updatePromotion(Long promotionId, PromotionDTO promotionDTO) {
        Promotion existingPromo = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion not found with id: " + promotionId));

        existingPromo.setTitle(promotionDTO.getTitle());
        existingPromo.setDiscountPercentage(promotionDTO.getDiscountPercentage());
        existingPromo.setStartDate(promotionDTO.getStartDate());
        existingPromo.setEndDate(promotionDTO.getEndDate());
        existingPromo.setStatus(promotionDTO.getStatus());

        Promotion updatedPromo = promotionRepository.save(existingPromo);
        return convertToDto(updatedPromo);
    }

    @Override
    @Transactional
    public void deletePromotion(Long promotionId) {
        if (!promotionRepository.existsById(promotionId)) {
            throw new ResourceNotFoundException("Promotion not found with id: " + promotionId);
        }
        promotionRepository.deleteById(promotionId);
    }

    @Override
    @Transactional(readOnly = true)
    public PromotionDTO getPromotionById(Long promotionId) {
        Promotion promotion = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion not found with id: " + promotionId));
        return convertToDto(promotion);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PromotionDTO> getAllPromotions() {
        return promotionRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PromotionDTO verifyPromoCode(String code) {
        Promotion promotion = promotionRepository.findByTitleIgnoreCaseAndStatus(code, "ACTIVE")
                .orElseThrow(() -> new ResourceNotFoundException("Promo code not found or is inactive."));

        LocalDate today = LocalDate.now();
        if (today.isBefore(promotion.getStartDate())) {
            throw new InvalidBookingException("This promotion code is not active yet.");
        }
        if (today.isAfter(promotion.getEndDate())) {
            // Update status dynamically
            promotion.setStatus("EXPIRED");
            promotionRepository.save(promotion);
            throw new InvalidBookingException("This promotion code has expired.");
        }

        return convertToDto(promotion);
    }

    private PromotionDTO convertToDto(Promotion promotion) {
        PromotionDTO dto = modelMapper.map(promotion, PromotionDTO.class);
        LocalDate today = LocalDate.now();
        if (today.isBefore(promotion.getStartDate())) {
            dto.setStatus("UPCOMING");
        } else if (today.isAfter(promotion.getEndDate())) {
            dto.setStatus("EXPIRED");
        } else {
            dto.setStatus(promotion.getStatus());
        }
        return dto;
    }
}
