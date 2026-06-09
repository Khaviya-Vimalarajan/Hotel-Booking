package com.luxury.hotel.service.impl;

import com.luxury.hotel.dto.HotelDTO;
import com.luxury.hotel.entity.Hotel;
import com.luxury.hotel.exception.ResourceNotFoundException;
import com.luxury.hotel.repository.HotelRepository;
import com.luxury.hotel.service.HotelService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HotelServiceImpl implements HotelService {

    private final HotelRepository hotelRepository;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    public HotelDTO createHotel(HotelDTO hotelDTO) {
        Hotel hotel = modelMapper.map(hotelDTO, Hotel.class);
        Hotel savedHotel = hotelRepository.save(hotel);
        return modelMapper.map(savedHotel, HotelDTO.class);
    }

    @Override
    @Transactional
    public HotelDTO updateHotel(Long hotelId, HotelDTO hotelDTO) {
        Hotel existingHotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + hotelId));

        existingHotel.setHotelName(hotelDTO.getHotelName());
        existingHotel.setDescription(hotelDTO.getDescription());
        existingHotel.setAddress(hotelDTO.getAddress());
        existingHotel.setCity(hotelDTO.getCity());
        existingHotel.setCountry(hotelDTO.getCountry());
        existingHotel.setStarRating(hotelDTO.getStarRating());
        existingHotel.setContactNumber(hotelDTO.getContactNumber());
        existingHotel.setEmail(hotelDTO.getEmail());
        existingHotel.setImage(hotelDTO.getImage());

        Hotel updatedHotel = hotelRepository.save(existingHotel);
        return modelMapper.map(updatedHotel, HotelDTO.class);
    }

    @Override
    @Transactional
    public void deleteHotel(Long hotelId) {
        if (!hotelRepository.existsById(hotelId)) {
            throw new ResourceNotFoundException("Hotel not found with id: " + hotelId);
        }
        hotelRepository.deleteById(hotelId);
    }

    @Override
    @Transactional(readOnly = true)
    public HotelDTO getHotelById(Long hotelId) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + hotelId));
        return modelMapper.map(hotel, HotelDTO.class);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HotelDTO> getAllHotels() {
        List<Hotel> hotels = hotelRepository.findAll();
        return hotels.stream()
                .map(hotel -> modelMapper.map(hotel, HotelDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<HotelDTO> searchHotels(String city, String country, String search) {
        // Handle empty strings as null for SQL query mapping, otherwise format with wildcards
        String cityParam = (city == null || city.trim().isEmpty()) ? null : "%" + city.trim().toLowerCase() + "%";
        String countryParam = (country == null || country.trim().isEmpty()) ? null : "%" + country.trim().toLowerCase() + "%";
        String searchParam = (search == null || search.trim().isEmpty()) ? null : "%" + search.trim().toLowerCase() + "%";

        List<Hotel> hotels = hotelRepository.searchHotels(cityParam, countryParam, searchParam);
        return hotels.stream()
                .map(hotel -> modelMapper.map(hotel, HotelDTO.class))
                .collect(Collectors.toList());
    }
}
