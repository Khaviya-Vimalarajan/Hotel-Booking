package com.luxury.hotel.config;

import com.luxury.hotel.entity.*;
import com.luxury.hotel.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final HotelRepository hotelRepository;
    private final RoomCategoryRepository roomCategoryRepository;
    private final RoomRepository roomRepository;
    private final AmenityRepository amenityRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final ReviewRepository reviewRepository;
    private final StaffRepository staffRepository;
    private final PromotionRepository promotionRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // If already seeded, check and fix the Nuwara Eliya image URL if it matches the broken one
        if (userRepository.count() > 0) {
            hotelRepository.findByHotelName("Nuwara Eliya Tea Bungalow").ifPresent(hotel -> {
                if (hotel.getImage().contains("photo-1563911302283-d2bc1d982df5")) {
                    hotel.setImage("https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200&h=600&fit=crop");
                    hotelRepository.save(hotel);
                    log.info("Updated Nuwara Eliya Tea Bungalow broken image link to working URL.");
                }
            });
            // Self-healing staff seed if count is low or staff login accounts are missing
            long staffUserCount = userRepository.findByRole(Role.STAFF).size();
            if (staffRepository.count() < 24 || staffUserCount < 17) {
                staffRepository.findAll().forEach(s -> {
                    userRepository.findByEmail(s.getEmail()).ifPresent(userRepository::delete);
                });
                staffRepository.deleteAll();
                seedStaff();
                log.info("Self-healed: Seeded multi-staff registry and login credentials for all 8 hotels.");
            }
            log.info("Database already seeded. Skipping seeder.");
            return;
        }

        log.info("Starting database seeding for Sri Lankan Hotels (No Spas)...");

        // 1. Seed Users with Sri Lankan phone numbers
        User admin = User.builder()
                .firstName("Akshaya")
                .lastName("Sanchith")
                .email("admin@luxury.com")
                .password(passwordEncoder.encode("admin123"))
                .phone("+94 77 555 0199")
                .role(Role.ADMIN)
                .status(UserStatus.ACTIVE)
                .profileImage("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&h=150&fit=crop")
                .build();
        userRepository.save(admin);

        User staff = User.builder()
                .firstName("Vimalarajan")
                .lastName("Rajini")
                .email("staff@luxury.com")
                .password(passwordEncoder.encode("staff123"))
                .phone("+94 71 555 0188")
                .role(Role.STAFF)
                .status(UserStatus.ACTIVE)
                .profileImage("https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=150&h=150&fit=crop")
                .build();
        userRepository.save(staff);

        User customer1 = User.builder()
                .firstName("Khaviya")
                .lastName("Harislan")
                .email("customer@luxury.com")
                .password(passwordEncoder.encode("customer123"))
                .phone("+94 76 555 0122")
                .role(Role.CUSTOMER)
                .status(UserStatus.ACTIVE)
                .profileImage("https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&h=150&fit=crop")
                .build();
        userRepository.save(customer1);

        User customer2 = User.builder()
                .firstName("Jasmitha")
                .lastName("Harislan")
                .email("jasmitha@example.com")
                .password(passwordEncoder.encode("customer123"))
                .phone("+94 77 555 0133")
                .role(Role.CUSTOMER)
                .status(UserStatus.ACTIVE)
                .profileImage("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&h=150&fit=crop")
                .build();
        userRepository.save(customer2);

        // 2. Seed Room Categories
        RoomCategory standard = roomCategoryRepository.save(RoomCategory.builder().categoryName("Standard Room").description("Classic comfort with modern touches, suitable for couples.").build());
        RoomCategory deluxe = roomCategoryRepository.save(RoomCategory.builder().categoryName("Deluxe Room").description("Spacious layouts, ocean or mountain views, premium linens.").build());
        RoomCategory family = roomCategoryRepository.save(RoomCategory.builder().categoryName("Family Suite").description("Separate living spaces and multiple beds, built for families.").build());
        RoomCategory suite = roomCategoryRepository.save(RoomCategory.builder().categoryName("Executive Suite").description("Luxury living areas, workspace, panoramic views, marble bathrooms.").build());
        RoomCategory luxurySuite = roomCategoryRepository.save(RoomCategory.builder().categoryName("Presidential Penthouse").description("The pinnacle of luxury. Private plunge pool, 24/7 butler service, private dining room.").build());

        // 3. Seed Amenities (Replacing Spa with Private Beach Access)
        Amenity wifi = amenityRepository.save(Amenity.builder().amenityName("High-Speed WiFi").build());
        Amenity pool = amenityRepository.save(Amenity.builder().amenityName("Infinity Pool Access").build());
        Amenity ac = amenityRepository.save(Amenity.builder().amenityName("Climate Control A/C").build());
        Amenity tv = amenityRepository.save(Amenity.builder().amenityName("Smart LED TV").build());
        Amenity minibar = amenityRepository.save(Amenity.builder().amenityName("Gourmet Mini Bar").build());
        Amenity parking = amenityRepository.save(Amenity.builder().amenityName("Valet Parking").build());
        Amenity beach = amenityRepository.save(Amenity.builder().amenityName("Private Beach Access").build());
        Amenity gym = amenityRepository.save(Amenity.builder().amenityName("24/7 Fitness Center").build());

        Set<Amenity> premiumAmenities = new HashSet<>(Arrays.asList(wifi, pool, ac, tv, minibar, parking, beach, gym));
        Set<Amenity> standardAmenities = new HashSet<>(Arrays.asList(wifi, ac, tv, gym));

        // 4. Seed Sri Lankan Hotels (5 Hotels, NO Spas, High-Quality Images)
        Hotel GalleFortResort = Hotel.builder()
                .hotelName("Lighthouse Heritage Hotel Galle")
                .description("Nestled inside the historic Galle Fort, this luxury boutique resort merges colonial architecture with modern 5-star comfort. Enjoy infinity pool access overlooking the Indian Ocean and dining at our lighthouse terrace restaurant.")
                .address("24 Lighthouse Street, Galle Fort")
                .city("Galle")
                .country("Sri Lanka")
                .starRating(4.9)
                .contactNumber("+94 91 555 7722")
                .email("galle@emeraldresorts.lk")
                .image("https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&h=600&fit=crop")
                .build();
        hotelRepository.save(GalleFortResort);

        Hotel EllaLodge = Hotel.builder()
                .hotelName("Ella Terracotta Mountain Lodge")
                .description("Surrounded by mist-covered tea plantations and panoramic views of Ella Rock, our lodge is a spiritual sanctuary. Enjoy private canyon viewpoints, fireplace suites, and guided mountain hikes.")
                .address("480 Canyon Vista Trail, Kital Ella")
                .city("Ella")
                .country("Sri Lanka")
                .starRating(4.8)
                .contactNumber("+94 57 555 4844")
                .email("ella@emeraldresorts.lk")
                .image("https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=1200&h=600&fit=crop")
                .build();
        hotelRepository.save(EllaLodge);

        Hotel NegomboHotel = Hotel.builder()
                .hotelName("Royal Golden Sands Negombo")
                .description("Overlooking the golden beaches of Negombo, this art-deco oceanfront resort offers a private beach, a luxury fitness center, and Michelin-star Sri Lankan seafood dining.")
                .address("320 Lewis Place")
                .city("Negombo")
                .country("Sri Lanka")
                .starRating(4.7)
                .contactNumber("+94 31 555 3200")
                .email("negombo@emeraldresorts.lk")
                .image("https://images.unsplash.com/photo-1439066615861-d1af74d74000?q=80&w=1200&h=600&fit=crop")
                .build();
        hotelRepository.save(NegomboHotel);

        Hotel KandyHotel = Hotel.builder()
                .hotelName("The Kandy Lakeview Manor")
                .description("Perched on the hills overlooking the iconic Kandy Lake, this heritage manor offers infinity pool views, lush botanical gardens, and proximity to the Temple of the Sacred Tooth Relic.")
                .address("12 Sangaraja Mawatha")
                .city("Kandy")
                .country("Sri Lanka")
                .starRating(4.8)
                .contactNumber("+94 81 555 1010")
                .email("kandy@emeraldresorts.lk")
                .image("https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?q=80&w=1200&h=600&fit=crop")
                .build();
        hotelRepository.save(KandyHotel);

        Hotel WeligamaHotel = Hotel.builder()
                .hotelName("The Weligama Bay Pavilion")
                .description("A modern beachfront villa resort on Weligama Bay, designed for surfing enthusiasts and luxury travelers. Featuring private plunge pools, beachside lounges, and fresh organic dining.")
                .address("45 Matara Road, Weligama")
                .city("Weligama")
                .country("Sri Lanka")
                .starRating(4.7)
                .contactNumber("+94 41 555 9090")
                .email("weligama@emeraldresorts.lk")
                .image("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&h=600&fit=crop")
                .build();
        hotelRepository.save(WeligamaHotel);

        Hotel SigiriyaHeritageResort = Hotel.builder()
                .hotelName("Sigiriya Heritage Lodge")
                .description("Overlooking the legendary Sigiriya Rock Fortress, this luxury eco-lodge is tucked away in private forest canopies. Features open-air decks, private plunge pools, and guided jungle tours.")
                .address("85 Sigiriya Road")
                .city("Sigiriya")
                .country("Sri Lanka")
                .starRating(4.9)
                .contactNumber("+94 66 555 4321")
                .email("sigiriya@emeraldresorts.lk")
                .image("https://images.unsplash.com/photo-1596436889106-be35e843f974?q=80&w=1200&h=600&fit=crop")
                .build();
        hotelRepository.save(SigiriyaHeritageResort);

        Hotel BentotaBeachfrontVilla = Hotel.builder()
                .hotelName("Bentota Beachfront Villa")
                .description("Located on the pristine peninsula of Bentota, this high-end boutique villa offers direct private beach access, a river safari launch dock, and oceanfront suites.")
                .address("110 Galle Road, Bentota")
                .city("Bentota")
                .country("Sri Lanka")
                .starRating(4.8)
                .contactNumber("+94 34 555 8899")
                .email("bentota@emeraldresorts.lk")
                .image("https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1200&h=600&fit=crop")
                .build();
        hotelRepository.save(BentotaBeachfrontVilla);

        Hotel NuwaraEliyaTeaBungalow = Hotel.builder()
                .hotelName("Nuwara Eliya Tea Bungalow")
                .description("A restored 19th-century colonial tea planter's bungalow set amid rolling emerald tea gardens. Features wood fireplaces, private golf course access, and organic tea estate tours.")
                .address("44 Hakgala Road")
                .city("Nuwara Eliya")
                .country("Sri Lanka")
                .starRating(4.9)
                .contactNumber("+94 52 555 1212")
                .email("nuwaraeliya@emeraldresorts.lk")
                .image("https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200&h=600&fit=crop")
                .build();
        hotelRepository.save(NuwaraEliyaTeaBungalow);

        // 5. Seed Rooms
        // Galle Rooms
        Room galle1 = Room.builder()
                .hotel(GalleFortResort)
                .category(standard)
                .roomNumber("101")
                .floorNumber(1)
                .capacity(2)
                .pricePerNight(BigDecimal.valueOf(12000.00)) // in LKR
                .roomSize(400)
                .roomStatus(RoomStatus.AVAILABLE)
                .image("https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=600&h=400&fit=crop")
                .amenities(standardAmenities)
                .build();
        roomRepository.save(galle1);

        Room galle2 = Room.builder()
                .hotel(GalleFortResort)
                .category(deluxe)
                .roomNumber("201")
                .floorNumber(2)
                .capacity(2)
                .pricePerNight(BigDecimal.valueOf(13500.00))
                .roomSize(550)
                .roomStatus(RoomStatus.AVAILABLE)
                .image("https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=600&h=400&fit=crop")
                .amenities(premiumAmenities)
                .build();
        roomRepository.save(galle2);

        Room galle3 = Room.builder()
                .hotel(GalleFortResort)
                .category(suite)
                .roomNumber("301")
                .floorNumber(3)
                .capacity(4)
                .pricePerNight(BigDecimal.valueOf(14500.00))
                .roomSize(850)
                .roomStatus(RoomStatus.BOOKED)
                .image("https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=600&h=400&fit=crop")
                .amenities(premiumAmenities)
                .build();
        roomRepository.save(galle3);

        Room galle4 = Room.builder()
                .hotel(GalleFortResort)
                .category(luxurySuite)
                .roomNumber("PH-1")
                .floorNumber(5)
                .capacity(4)
                .pricePerNight(BigDecimal.valueOf(14900.00))
                .roomSize(1500)
                .roomStatus(RoomStatus.AVAILABLE)
                .image("https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=600&h=400&fit=crop")
                .amenities(premiumAmenities)
                .build();
        roomRepository.save(galle4);

        // Ella Rooms
        Room ella1 = Room.builder()
                .hotel(EllaLodge)
                .category(standard)
                .roomNumber("101")
                .floorNumber(1)
                .capacity(2)
                .pricePerNight(BigDecimal.valueOf(14000.00))
                .roomSize(380)
                .roomStatus(RoomStatus.AVAILABLE)
                .image("https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=600&h=400&fit=crop")
                .amenities(standardAmenities)
                .build();
        roomRepository.save(ella1);

        Room ella2 = Room.builder()
                .hotel(EllaLodge)
                .category(deluxe)
                .roomNumber("205")
                .floorNumber(2)
                .capacity(2)
                .pricePerNight(BigDecimal.valueOf(13800.00))
                .roomSize(520)
                .roomStatus(RoomStatus.AVAILABLE)
                .image("https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=600&h=400&fit=crop")
                .amenities(premiumAmenities)
                .build();
        roomRepository.save(ella2);

        // Negombo Rooms
        Room negombo1 = Room.builder()
                .hotel(NegomboHotel)
                .category(deluxe)
                .roomNumber("305")
                .floorNumber(3)
                .capacity(2)
                .pricePerNight(BigDecimal.valueOf(13200.00))
                .roomSize(500)
                .roomStatus(RoomStatus.AVAILABLE)
                .image("https://images.unsplash.com/photo-1591088398332-8a7791972843?q=80&w=600&h=400&fit=crop")
                .amenities(premiumAmenities)
                .build();
        roomRepository.save(negombo1);

        // Kandy Rooms
        Room kandy1 = Room.builder()
                .hotel(KandyHotel)
                .category(suite)
                .roomNumber("K-201")
                .floorNumber(2)
                .capacity(2)
                .pricePerNight(BigDecimal.valueOf(14200.00))
                .roomSize(700)
                .roomStatus(RoomStatus.AVAILABLE)
                .image("https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=600&h=400&fit=crop")
                .amenities(premiumAmenities)
                .build();
        roomRepository.save(kandy1);

        // Weligama Rooms
        Room weligama1 = Room.builder()
                .hotel(WeligamaHotel)
                .category(deluxe)
                .roomNumber("W-102")
                .floorNumber(1)
                .capacity(2)
                .pricePerNight(BigDecimal.valueOf(13900.00))
                .roomSize(600)
                .roomStatus(RoomStatus.AVAILABLE)
                .image("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&h=400&fit=crop")
                .amenities(premiumAmenities)
                .build();
        roomRepository.save(weligama1);

        // Sigiriya Rooms
        Room sigiriya1 = Room.builder()
                .hotel(SigiriyaHeritageResort)
                .category(standard)
                .roomNumber("SIG-101")
                .floorNumber(1)
                .capacity(2)
                .pricePerNight(BigDecimal.valueOf(11000.00))
                .roomSize(420)
                .roomStatus(RoomStatus.AVAILABLE)
                .image("https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=600&h=400&fit=crop")
                .amenities(standardAmenities)
                .build();
        roomRepository.save(sigiriya1);

        Room sigiriya2 = Room.builder()
                .hotel(SigiriyaHeritageResort)
                .category(deluxe)
                .roomNumber("SIG-201")
                .floorNumber(2)
                .capacity(2)
                .pricePerNight(BigDecimal.valueOf(13000.00))
                .roomSize(580)
                .roomStatus(RoomStatus.AVAILABLE)
                .image("https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=600&h=400&fit=crop")
                .amenities(premiumAmenities)
                .build();
        roomRepository.save(sigiriya2);

        Room sigiriya3 = Room.builder()
                .hotel(SigiriyaHeritageResort)
                .category(suite)
                .roomNumber("SIG-301")
                .floorNumber(3)
                .capacity(4)
                .pricePerNight(BigDecimal.valueOf(14800.00))
                .roomSize(900)
                .roomStatus(RoomStatus.AVAILABLE)
                .image("https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=600&h=400&fit=crop")
                .amenities(premiumAmenities)
                .build();
        roomRepository.save(sigiriya3);

        // Bentota Rooms
        Room bentota1 = Room.builder()
                .hotel(BentotaBeachfrontVilla)
                .category(deluxe)
                .roomNumber("BEN-101")
                .floorNumber(1)
                .capacity(2)
                .pricePerNight(BigDecimal.valueOf(12800.00))
                .roomSize(520)
                .roomStatus(RoomStatus.AVAILABLE)
                .image("https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=600&h=400&fit=crop")
                .amenities(premiumAmenities)
                .build();
        roomRepository.save(bentota1);

        Room bentota2 = Room.builder()
                .hotel(BentotaBeachfrontVilla)
                .category(suite)
                .roomNumber("BEN-201")
                .floorNumber(2)
                .capacity(4)
                .pricePerNight(BigDecimal.valueOf(14600.00))
                .roomSize(880)
                .roomStatus(RoomStatus.AVAILABLE)
                .image("https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=600&h=400&fit=crop")
                .amenities(premiumAmenities)
                .build();
        roomRepository.save(bentota2);

        // Nuwara Eliya Rooms
        Room nuwaraEliya1 = Room.builder()
                .hotel(NuwaraEliyaTeaBungalow)
                .category(deluxe)
                .roomNumber("NE-101")
                .floorNumber(1)
                .capacity(2)
                .pricePerNight(BigDecimal.valueOf(12400.00))
                .roomSize(490)
                .roomStatus(RoomStatus.AVAILABLE)
                .image("https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=600&h=400&fit=crop")
                .amenities(standardAmenities)
                .build();
        roomRepository.save(nuwaraEliya1);

        Room nuwaraEliya2 = Room.builder()
                .hotel(NuwaraEliyaTeaBungalow)
                .category(suite)
                .roomNumber("NE-201")
                .floorNumber(2)
                .capacity(2)
                .pricePerNight(BigDecimal.valueOf(14400.00))
                .roomSize(750)
                .roomStatus(RoomStatus.AVAILABLE)
                .image("https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=600&h=400&fit=crop")
                .amenities(premiumAmenities)
                .build();
        roomRepository.save(nuwaraEliya2);

        // 6. Seed Promotions
        Promotion promo1 = Promotion.builder()
                .title("WELCOME10")
                .discountPercentage(BigDecimal.valueOf(10.00))
                .startDate(LocalDate.now().minusDays(30))
                .endDate(LocalDate.now().plusMonths(6))
                .status("ACTIVE")
                .build();
        promotionRepository.save(promo1);

        Promotion promo2 = Promotion.builder()
                .title("LUXURY25")
                .discountPercentage(BigDecimal.valueOf(25.00))
                .startDate(LocalDate.now().minusDays(5))
                .endDate(LocalDate.now().plusDays(30))
                .status("ACTIVE")
                .build();
        promotionRepository.save(promo2);

        // 7. Seed Staff
        seedStaff();

        // 8. Seed Historical Bookings (To populate charts) with Sri Lankan Payment Channels
        LocalDate today = LocalDate.now();
        // Month - 2 Completed Booking
        Booking pastBooking1 = Booking.builder()
                .user(customer1)
                .room(galle2) // Galle Deluxe
                .checkInDate(today.minusMonths(2))
                .checkOutDate(today.minusMonths(2).plusDays(3))
                .guestCount(2)
                .totalAmount(BigDecimal.valueOf(40500.00)) // 13500 * 3
                .bookingStatus(BookingStatus.COMPLETED)
                .build();
        bookingRepository.save(pastBooking1);

        Payment payment1 = Payment.builder()
                .booking(pastBooking1)
                .amount(BigDecimal.valueOf(40500.00))
                .paymentMethod("FriMi")
                .transactionId("TXN-SEED-SL-01")
                .paymentStatus(PaymentStatus.COMPLETED)
                .build();
        paymentRepository.save(payment1);

        // Month - 1 Completed Booking
        Booking pastBooking2 = Booking.builder()
                .user(customer2)
                .room(negombo1) // Negombo Deluxe
                .checkInDate(today.minusMonths(1))
                .checkOutDate(today.minusMonths(1).plusDays(4))
                .guestCount(2)
                .totalAmount(BigDecimal.valueOf(52800.00)) // 13200 * 4
                .bookingStatus(BookingStatus.COMPLETED)
                .build();
        bookingRepository.save(pastBooking2);

        Payment payment2 = Payment.builder()
                .booking(pastBooking2)
                .amount(BigDecimal.valueOf(52800.00))
                .paymentMethod("Dialog ezCash")
                .transactionId("TXN-SEED-SL-02")
                .paymentStatus(PaymentStatus.COMPLETED)
                .build();
        paymentRepository.save(payment2);

        // Active Booking (Booked Room status, Confirmed Booking status)
        Booking activeBooking = Booking.builder()
                .user(customer1)
                .room(galle3) // Galle Suite - Booked
                .checkInDate(today.plusDays(5))
                .checkOutDate(today.plusDays(10))
                .guestCount(2)
                .totalAmount(BigDecimal.valueOf(72500.00)) // 14500 * 5
                .bookingStatus(BookingStatus.CONFIRMED)
                .build();
        bookingRepository.save(activeBooking);

        Payment payment3 = Payment.builder()
                .booking(activeBooking)
                .amount(BigDecimal.valueOf(72500.00))
                .paymentMethod("mCash")
                .transactionId("TXN-SEED-SL-03")
                .paymentStatus(PaymentStatus.COMPLETED)
                .build();
        paymentRepository.save(payment3);

        // 9. Seed Reviews
        Review rev1 = Review.builder()
                .user(customer1)
                .hotel(GalleFortResort)
                .rating(5)
                .comment("Absolute paradise! The colonial architecture of Galle Fort and the ocean breeze are out of this world. Highly recommend the Deluxe Room!")
                .build();
        reviewRepository.save(rev1);

        Review rev2 = Review.builder()
                .user(customer2)
                .hotel(NegomboHotel)
                .rating(4)
                .comment("Excellent dining services and gorgeous golden sands beach. Room service was slightly slow on Friday night, but overall a premium stay.")
                .build();
        reviewRepository.save(rev2);

        log.info("Database seeded successfully with {} users, {} hotels, and {} rooms.",
                userRepository.count(), hotelRepository.count(), roomRepository.count());
    }

    private void seedStaff() {
        Hotel galle = hotelRepository.findByHotelName("Lighthouse Heritage Hotel Galle").orElse(null);
        Hotel ella = hotelRepository.findByHotelName("Ella Terracotta Mountain Lodge").orElse(null);
        Hotel negombo = hotelRepository.findByHotelName("Royal Golden Sands Negombo").orElse(null);
        Hotel kandy = hotelRepository.findByHotelName("The Kandy Lakeview Manor").orElse(null);
        Hotel weligama = hotelRepository.findByHotelName("The Weligama Bay Pavilion").orElse(null);
        Hotel sigiriya = hotelRepository.findByHotelName("Sigiriya Heritage Lodge").orElse(null);
        Hotel bentota = hotelRepository.findByHotelName("Bentota Beachfront Villa").orElse(null);
        Hotel nuwara = hotelRepository.findByHotelName("Nuwara Eliya Tea Bungalow").orElse(null);

        // galle staff
        if (galle != null) {
            saveStaffAndUser(Staff.builder().firstName("Lydia").lastName("Sterling").email("lydia@resorts.com").role("Receptionist").salary(BigDecimal.valueOf(85000.00)).assignedHotel(galle).build());
            saveStaffAndUser(Staff.builder().firstName("James").lastName("Alwis").email("james@resorts.com").role("Receptionist").salary(BigDecimal.valueOf(130000.00)).assignedHotel(galle).build());
            saveStaffAndUser(Staff.builder().firstName("Kamal").lastName("Perera").email("kamal@resorts.com").role("Housekeeper").salary(BigDecimal.valueOf(45000.00)).assignedHotel(galle).build());
        }
        // ella staff
        if (ella != null) {
            saveStaffAndUser(Staff.builder().firstName("Markus").lastName("Vance").email("markus@resorts.com").role("Receptionist").salary(BigDecimal.valueOf(125000.00)).assignedHotel(ella).build());
            saveStaffAndUser(Staff.builder().firstName("Priyantha").lastName("Bandara").email("priyantha@resorts.com").role("Receptionist").salary(BigDecimal.valueOf(80000.00)).assignedHotel(ella).build());
            saveStaffAndUser(Staff.builder().firstName("Suresh").lastName("Kumara").email("suresh@resorts.com").role("Housekeeper").salary(BigDecimal.valueOf(43000.00)).assignedHotel(ella).build());
        }
        // negombo staff
        if (negombo != null) {
            saveStaffAndUser(Staff.builder().firstName("Anura").lastName("Fernando").email("anura@resorts.com").role("Receptionist").salary(BigDecimal.valueOf(82000.00)).assignedHotel(negombo).build());
            saveStaffAndUser(Staff.builder().firstName("Sajith").lastName("Silva").email("sajith@resorts.com").role("Receptionist").salary(BigDecimal.valueOf(120000.00)).assignedHotel(negombo).build());
            saveStaffAndUser(Staff.builder().firstName("Sunil").lastName("Shantha").email("sunil@resorts.com").role("Housekeeper").salary(BigDecimal.valueOf(44000.00)).assignedHotel(negombo).build());
        }
        // kandy staff
        if (kandy != null) {
            saveStaffAndUser(Staff.builder().firstName("Kusal").lastName("Mendis").email("kusal@resorts.com").role("Receptionist").salary(BigDecimal.valueOf(84000.00)).assignedHotel(kandy).build());
            saveStaffAndUser(Staff.builder().firstName("Ranil").lastName("Jayawardene").email("ranil@resorts.com").role("Receptionist").salary(BigDecimal.valueOf(135000.00)).assignedHotel(kandy).build());
            saveStaffAndUser(Staff.builder().firstName("Mahela").lastName("Silva").email("mahela@resorts.com").role("Housekeeper").salary(BigDecimal.valueOf(46000.00)).assignedHotel(kandy).build());
        }
        // weligama staff
        if (weligama != null) {
            saveStaffAndUser(Staff.builder().firstName("Suranga").lastName("Lakmal").email("suranga@resorts.com").role("Receptionist").salary(BigDecimal.valueOf(81000.00)).assignedHotel(weligama).build());
            saveStaffAndUser(Staff.builder().firstName("Dinesh").lastName("Chandimal").email("dinesh@resorts.com").role("Receptionist").salary(BigDecimal.valueOf(128000.00)).assignedHotel(weligama).build());
            saveStaffAndUser(Staff.builder().firstName("Roshan").lastName("Perera").email("roshan_h@resorts.com").role("Housekeeper").salary(BigDecimal.valueOf(42000.00)).assignedHotel(weligama).build());
        }
        // sigiriya staff
        if (sigiriya != null) {
            saveStaffAndUser(Staff.builder().firstName("Ruwan").lastName("Silva").email("ruwan@resorts.com").role("Receptionist").salary(BigDecimal.valueOf(95000.00)).assignedHotel(sigiriya).build());
            saveStaffAndUser(Staff.builder().firstName("Roshan").lastName("Siriwardena").email("roshan_s@resorts.com").role("Receptionist").salary(BigDecimal.valueOf(83000.00)).assignedHotel(sigiriya).build());
            saveStaffAndUser(Staff.builder().firstName("Asanka").lastName("Gunawardene").email("asanka@resorts.com").role("Housekeeper").salary(BigDecimal.valueOf(45000.00)).assignedHotel(sigiriya).build());
        }
        // bentota staff
        if (bentota != null) {
            saveStaffAndUser(Staff.builder().firstName("Nishantha").lastName("Perera").email("nishantha@resorts.com").role("Receptionist").salary(BigDecimal.valueOf(135000.00)).assignedHotel(bentota).build());
            saveStaffAndUser(Staff.builder().firstName("Udaya").lastName("Kumara").email("udaya@resorts.com").role("Receptionist").salary(BigDecimal.valueOf(85000.00)).assignedHotel(bentota).build());
            saveStaffAndUser(Staff.builder().firstName("Nuwan").lastName("Pradeep").email("nuwan@resorts.com").role("Housekeeper").salary(BigDecimal.valueOf(47000.00)).assignedHotel(bentota).build());
        }
        // nuwara staff
        if (nuwara != null) {
            saveStaffAndUser(Staff.builder().firstName("Dilini").lastName("Jayasekara").email("dilini@resorts.com").role("Receptionist").salary(BigDecimal.valueOf(90000.00)).assignedHotel(nuwara).build());
            saveStaffAndUser(Staff.builder().firstName("Thilan").lastName("Samarasinghe").email("thilan@resorts.com").role("Receptionist").salary(BigDecimal.valueOf(140000.00)).assignedHotel(nuwara).build());
            saveStaffAndUser(Staff.builder().firstName("Chatura").lastName("de Silva").email("chatura@resorts.com").role("Housekeeper").salary(BigDecimal.valueOf(48000.00)).assignedHotel(nuwara).build());
        }
    }

    private void saveStaffAndUser(Staff staff) {
        staffRepository.save(staff);
        if (!userRepository.existsByEmail(staff.getEmail())) {
            User user = User.builder()
                    .firstName(staff.getFirstName())
                    .lastName(staff.getLastName())
                    .email(staff.getEmail())
                    .password(passwordEncoder.encode("staff123"))
                    .role(Role.STAFF)
                    .status(UserStatus.ACTIVE)
                    .build();
            userRepository.save(user);
        }
    }
}
