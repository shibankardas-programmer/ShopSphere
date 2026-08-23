package com.shibankar.shopsphere.service;

import com.shibankar.shopsphere.entity.Product;
import com.shibankar.shopsphere.entity.Wishlist;
import com.shibankar.shopsphere.repository.ProductRepository;
import com.shibankar.shopsphere.repository.UserRepository;
import com.shibankar.shopsphere.repository.WishlistRepository;
import com.shibankar.shopsphere.user.User;

import org.springframework.stereotype.Service;

@Service
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public WishlistService(
            WishlistRepository wishlistRepository,
            ProductRepository productRepository,
            UserRepository userRepository) {

        this.wishlistRepository = wishlistRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    // Get logged-in user's wishlist
    public Wishlist getWishlist(String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return wishlistRepository.findByUser(user)
                .orElseGet(() ->
                        wishlistRepository.save(new Wishlist(user)));
    }

    // Add product to wishlist
    public Wishlist addToWishlist(
            String username,
            Long productId) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Product not found with id: " + productId));

        Wishlist wishlist = wishlistRepository.findByUser(user)
                .orElseGet(() ->
                        wishlistRepository.save(new Wishlist(user)));

        // Avoid adding the same product twice
        if (!wishlist.getProducts().contains(product)) {
            wishlist.getProducts().add(product);
        }

        return wishlistRepository.save(wishlist);
    }

    // Remove product from wishlist
    public Wishlist removeFromWishlist(
            String username,
            Long productId) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Wishlist wishlist = wishlistRepository.findByUser(user)
                .orElseThrow(() ->
                        new RuntimeException("Wishlist not found"));

        wishlist.getProducts().removeIf(
                product -> product.getId().equals(productId)
        );

        return wishlistRepository.save(wishlist);
    }
}