package com.pizza.restaurant.restaurant_backend.service;

import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitService {

    private static class Bucket {
        private int count;
        private long resetAtMillis;

        private Bucket(long resetAtMillis) {
            this.resetAtMillis = resetAtMillis;
        }
    }

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    public void check(String scope, String key, int maxAttempts, Duration window) {
        long now = System.currentTimeMillis();
        String bucketKey = scope + ":" + normalize(key);
        Bucket bucket = buckets.computeIfAbsent(bucketKey, ignored -> new Bucket(now + window.toMillis()));

        synchronized (bucket) {
            if (now > bucket.resetAtMillis) {
                bucket.count = 0;
                bucket.resetAtMillis = now + window.toMillis();
            }
            if (bucket.count >= maxAttempts) {
                throw new RuntimeException("Too many requests. Please try again later.");
            }
            bucket.count++;
        }
    }

    private String normalize(String key) {
        return key == null ? "unknown" : key.trim().toLowerCase();
    }
}
