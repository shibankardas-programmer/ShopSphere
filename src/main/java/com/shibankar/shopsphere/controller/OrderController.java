package com.shibankar.shopsphere.controller;

import com.shibankar.shopsphere.entity.Order;
import com.shibankar.shopsphere.service.OrderService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@SecurityRequirement(name = "bearerAuth")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // Get logged-in user's orders
    @Operation(
            summary = "Get logged-in user's orders",
            description = "Returns all orders belonging to the authenticated user"
    )
    @GetMapping
    public List<Order> getMyOrders(
            Authentication authentication) {

        String username = authentication.getName();

        return orderService.getUserOrders(username);
    }

    // Get specific order
    @Operation(
            summary = "Get a specific order",
            description = "Returns an order belonging to the authenticated user"
    )
    @GetMapping("/{orderId}")
    public Order getOrder(
            @PathVariable Long orderId,
            Authentication authentication) {

        String username = authentication.getName();

        return orderService.getOrder(
                orderId,
                username
        );
    }

    // Checkout
    @Operation(
            summary = "Checkout cart",
            description = "Creates an order using the selected simulated payment method"
    )
    @PostMapping("/checkout")
    public Order checkout(
            @RequestParam(defaultValue = "COD")
            String paymentMethod,
            Authentication authentication) {

        String username = authentication.getName();

        return orderService.createOrderFromCart(
                username,
                paymentMethod
        );
    }
}