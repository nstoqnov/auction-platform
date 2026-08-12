package com.example.auction.Controllers;

import com.example.auction.Services.CloudinaryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/images")
public class ImageController {

    private final CloudinaryService cloudinaryService;

    public ImageController(CloudinaryService cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }

    @PostMapping("/upload")
    public ResponseEntity<CloudinaryService.FileUploadResult> upload(@RequestParam("file") MultipartFile file) {
        CloudinaryService.FileUploadResult result = cloudinaryService.uploadFile(file);
        return ResponseEntity.ok(result);
    }
}