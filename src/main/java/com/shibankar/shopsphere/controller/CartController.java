package com.shibankar.shopsphere.controller;

import com.shibankar.shopsphere.entity.Cart;
import com.shibankar.shopsphere.service.CartService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@SecurityRequirement(name = "bearerAuth")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    // =========================================================
    // GET CART
    // =========================================================

    @Operation(
            summary = "Get logged-in user's cart"
    )
    @GetMapping
    public Cart getCart(
            Authentication authentication) {

        String username =
                authentication.getName();

        return cartService.getOrCreateCart(
                username
        );
    }

    // =========================================================
    // ADD PRODUCT TO CART
    // =========================================================

    @Operation(
            summary = "Add product to cart"
    )
    @PostMapping("/add")
    public Cart addToCart(
            Authentication authentication,

            @RequestParam Long productId,

            @RequestParam int quantity) {

        String username =
                authentication.getName();

        return cartService.addToCart(
                username,
                productId,
                quantity
        );
    }

    // =========================================================
    // UPDATE CART ITEM QUANTITY
    // =========================================================

    @Operation(
            summary = "Update cart item quantity"
    )
    @PutMapping("/item/{itemId}")
    public Cart updateCartItem(
            Authentication authentication,

            @PathVariable Long itemId,

            @RequestParam int quantity) {

        String username =
                authentication.getName();

        return cartService.updateCartItem(
                username,
                itemId,
                quantity
        );
    }

    // =========================================================
    // REMOVE CART ITEM
    // =========================================================

    @Operation(
            summary = "Remove item from cart"
    )
    @DeleteMapping("/item/{itemId}")
    public Cart removeCartItem(
            Authentication authentication,

            @PathVariable Long itemId) {

        String username =
                authentication.getName();

        return cartService.removeCartItem(
                username,
                itemId
        );
    }

    // =========================================================
    // CLEAR CART
    // =========================================================

    @Operation(
            summary = "Clear entire cart"
    )
    @DeleteMapping("/clear")
    public Cart clearCart(
            Authentication authentication) {

        String username =
                authentication.getName();

        return cartService.clearCart(
                username
        );
    }
}