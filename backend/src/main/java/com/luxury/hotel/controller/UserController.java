package com.luxury.hotel.controller;

import com.luxury.hotel.dto.UserDTO;
import com.luxury.hotel.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getUserProfile(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(userService.getUserProfile(email));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDTO> updateUserProfile(Authentication authentication, @Valid @RequestBody UserDTO userDTO) {
        String email = authentication.getName();
        return ResponseEntity.ok(userService.updateUserProfile(email, userDTO));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> getAllCustomers() {
        return ResponseEntity.ok(userService.getAllCustomers());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/profile-image")
    public ResponseEntity<java.util.Map<String, String>> uploadProfileImage(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        try {
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = java.util.UUID.randomUUID().toString() + extension;
            
            // Create uploads directory if it doesn't exist
            java.io.File uploadDir = new java.io.File("uploads");
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }
            
            java.io.File destFile = new java.io.File(uploadDir.getAbsoluteFile(), filename);
            java.nio.file.Files.copy(file.getInputStream(), destFile.toPath(), java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            
            String fileUrl = "http://localhost:8080/api/users/profile-image/" + filename;
            java.util.Map<String, String> response = new java.util.HashMap<>();
            response.put("url", fileUrl);
            return ResponseEntity.ok(response);
        } catch (java.io.IOException e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/profile-image/{filename:.+}")
    @ResponseBody
    public ResponseEntity<org.springframework.core.io.Resource> getProfileImage(@PathVariable String filename) {
        try {
            java.nio.file.Path file = java.nio.file.Paths.get("uploads").resolve(filename);
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(file.toUri());
            
            if (resource.exists() || resource.isReadable()) {
                String contentType = java.nio.file.Files.probeContentType(file);
                if (contentType == null) {
                    contentType = "image/jpeg";
                }
                return ResponseEntity.ok()
                        .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, contentType)
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (java.net.MalformedURLException e) {
            return ResponseEntity.notFound().build();
        } catch (java.io.IOException e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
