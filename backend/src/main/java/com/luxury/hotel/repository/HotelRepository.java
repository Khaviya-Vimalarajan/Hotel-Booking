package com.luxury.hotel.repository;

import com.luxury.hotel.entity.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {
    
    @Query("SELECT h FROM Hotel h WHERE " +
           "(:city IS NULL OR LOWER(h.city) LIKE :city) AND " +
           "(:country IS NULL OR LOWER(h.country) LIKE :country) AND " +
           "(:search IS NULL OR LOWER(h.hotelName) LIKE :search)")
    List<Hotel> searchHotels(@Param("city") String city, 
                             @Param("country") String country, 
                             @Param("search") String search);

    List<Hotel> findByCityIgnoreCase(String city);
    java.util.Optional<Hotel> findByHotelName(String hotelName);
}
