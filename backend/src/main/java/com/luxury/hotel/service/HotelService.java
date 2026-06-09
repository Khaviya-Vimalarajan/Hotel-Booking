package com.luxury.hotel.service;

import com.luxury.hotel.dto.HotelDTO;
import java.util.List;

public interface HotelService {
    HotelDTO createHotel(HotelDTO hotelDTO);
    HotelDTO updateHotel(Long hotelId, HotelDTO hotelDTO);
    void deleteHotel(Long hotelId);
    HotelDTO getHotelById(Long hotelId);
    List<HotelDTO> getAllHotels();
    List<HotelDTO> searchHotels(String city, String country, String search);
}
