package com.pizza.restaurant.restaurant_backend.utils;

public class LogUtil {
    private static final String RESET = "\033[0m";
    private static final String GREEN = "\033[0;32m";
    private static final String YELLOW = "\033[0;33m";
    private static final String RED = "\033[0;31m";

    public static void info(String message) {
        System.out.println(GREEN + "[INFO] " + message + RESET);
    }

    public static void warn(String message) {
        System.out.println(YELLOW + "[WARN] " + message + RESET);
    }

    public static void error(String message) {
        System.err.println(RED + "[ERROR] " + message + RESET);
    }
}
