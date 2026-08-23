package com.shibankar.shopsphere.controller;

import com.shibankar.shopsphere.entity.Order;
import com.shibankar.shopsphere.entity.OrderStatus;
import com.shibankar.shopsphere.service.AdminOrderService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
@SecurityRequirement(name = "bearerAuth")
public class AdminOrderController {

    private final AdminOrderService adminOrderService;

    public AdminOrderController(AdminOrderService adminOrderService) {
        this.adminOrderService = adminOrderService;
    }

    // =====================================================
    // GET ALL ORDERS
    // =====================================================

    @Operation(
            summary = "Get all orders",
            description = "Admin can view all customer orders"
    )
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Order> getAllOrders() {

        return adminOrderService.getAllOrders();
    }

    // =====================================================
    // UPDATE ORDER STATUS
    // =====================================================

    @Operation(
            summary = "Update order status",
            description = "Admin can update the status of an order"
    )
    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public Order updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam OrderStatus status) {

        return adminOrderService.updateOrderStatus(
                orderId,
                status
        );
    }
}