package com.example.auction.Controllers;

import com.example.auction.BaseIntegrationTest;
import com.example.auction.Services.CloudinaryService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
class ImageControllerIntTest extends BaseIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CloudinaryService cloudinaryService;

    @Test
    @WithMockUser
    void shouldUploadImage() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "test.jpg", "image/jpeg", "test image content".getBytes());
        
        CloudinaryService.FileUploadResult result = new CloudinaryService.FileUploadResult("http://example.com/test.jpg", "test_public_id");

        Mockito.when(cloudinaryService.uploadFile(Mockito.any())).thenReturn(result);

        mockMvc.perform(multipart("/api/images/upload")
                        .file(file))
                .andExpect(status().isOk());
    }
}
