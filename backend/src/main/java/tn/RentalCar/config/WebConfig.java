package tn.RentalCar.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadDir = Paths.get("uploads/avatars");
        String uploadPath = uploadDir.toFile().getAbsolutePath();

        registry.addResourceHandler("/api/user/avatars/**")
                .addResourceLocations("file:/" + uploadPath + "/");

        Path carUploadDir = Paths.get("uploads/cars");
        String carUploadPath = carUploadDir.toFile().getAbsolutePath();
        registry.addResourceHandler("/api/cars/images/**")
                .addResourceLocations("file:/" + carUploadPath + "/");
    }
}
