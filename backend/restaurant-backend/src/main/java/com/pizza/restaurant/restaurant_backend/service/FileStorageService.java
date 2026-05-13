package com.pizza.restaurant.restaurant_backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Set<String> ALLOWED_SUB_DIRS = Set.of("avatars", "products", "categories");
    private static final Map<String, String> EXTENSIONS_BY_CONTENT_TYPE = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/webp", ".webp"
    );

    private final Path uploadRoot;
    private final long maxUploadBytes;

    public FileStorageService(@Value("${app.upload.dir:uploads}") String uploadDir,
                              @Value("${app.upload.max-bytes:2097152}") long maxUploadBytes) {
        this.uploadRoot = Path.of(uploadDir).toAbsolutePath().normalize();
        this.maxUploadBytes = maxUploadBytes;
    }

    public String saveFile(MultipartFile file, String subDir) throws IOException {
        validateSubDir(subDir);
        validateFile(file);

        String extension = EXTENSIONS_BY_CONTENT_TYPE.get(file.getContentType());
        String filename = UUID.randomUUID() + extension;
        Path root = uploadRoot.resolve(subDir).normalize();
        if (!root.startsWith(uploadRoot)) {
            throw new IllegalArgumentException("Invalid upload path");
        }

        Files.createDirectories(root);
        Path filePath = root.resolve(filename).normalize();
        if (!filePath.startsWith(root)) {
            throw new IllegalArgumentException("Invalid upload path");
        }

        Files.copy(file.getInputStream(), filePath);
        return subDir + "/" + filename;
    }

    public boolean isManagedImageKey(String imageKey) {
        if (imageKey == null || imageKey.isBlank() || imageKey.contains("..") || imageKey.contains("\\")) {
            return false;
        }
        String normalized = imageKey.replace('\\', '/');
        String[] parts = normalized.split("/");
        if (parts.length != 2 || !ALLOWED_SUB_DIRS.contains(parts[0])) {
            return false;
        }
        String lower = parts[1].toLowerCase();
        return lower.endsWith(".jpg") || lower.endsWith(".png") || lower.endsWith(".webp");
    }

    private void validateSubDir(String subDir) {
        if (!ALLOWED_SUB_DIRS.contains(subDir)) {
            throw new IllegalArgumentException("Invalid upload directory");
        }
    }

    private void validateFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        if (file.getSize() > maxUploadBytes) {
            throw new IllegalArgumentException("File is too large");
        }
        if (!EXTENSIONS_BY_CONTENT_TYPE.containsKey(file.getContentType())) {
            throw new IllegalArgumentException("Unsupported image type");
        }

        byte[] header = readHeader(file);
        if (!hasValidMagicBytes(file.getContentType(), header)) {
            throw new IllegalArgumentException("Invalid image content");
        }
    }

    private byte[] readHeader(MultipartFile file) throws IOException {
        try (InputStream inputStream = file.getInputStream()) {
            return inputStream.readNBytes(12);
        }
    }

    private boolean hasValidMagicBytes(String contentType, byte[] header) {
        if ("image/jpeg".equals(contentType)) {
            return header.length >= 3 &&
                    (header[0] & 0xFF) == 0xFF &&
                    (header[1] & 0xFF) == 0xD8 &&
                    (header[2] & 0xFF) == 0xFF;
        }
        if ("image/png".equals(contentType)) {
            byte[] png = new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A};
            if (header.length < png.length) return false;
            for (int i = 0; i < png.length; i++) {
                if (header[i] != png[i]) return false;
            }
            return true;
        }
        if ("image/webp".equals(contentType)) {
            return header.length >= 12 &&
                    header[0] == 'R' && header[1] == 'I' && header[2] == 'F' && header[3] == 'F' &&
                    header[8] == 'W' && header[9] == 'E' && header[10] == 'B' && header[11] == 'P';
        }
        return false;
    }
}
