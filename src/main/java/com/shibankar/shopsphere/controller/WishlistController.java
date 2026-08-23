package com.shibankar.shopsphere.controller;

import com.shibankar.shopsphere.entity.Wishlist;
import com.shibankar.shopsphere.service.WishlistService;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    // Get logged-in user's wishlist
    @GetMapping
    public Wishlist getWishlist(
            Authentication authentication) {

        String username = authentication.getName();

        return wishlistService.getWishlist(username);
    }

    // Add product to wishlist
    @PostMapping("/{productId}")
    public Wishlist addToWishlist(
            @PathVariable Long productId,
            Authentication authentication) {

        String username = authentication.getName();

        return wishlistService.addToWishlist(
                username,
                productId
        );
    }

    // Remove product from wishlist
    @DeleteMapping("/{productId}")
    public Wishlist removeFromWishlist(
            @PathVariable Long productId,
            Authentication authentication) {

        String username = authentication.getName();

        return wishlistService.removeFromWishlist(
                username,
                productId
        );
    }
}
