package com.shibankar.shopsphere.service;

import com.shibankar.shopsphere.entity.Order;
import com.shibankar.shopsphere.entity.OrderStatus;
import com.shibankar.shopsphere.repository.OrderRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminOrderService {

    private final OrderRepository orderRepository;

    public AdminOrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    // ==========================================
    // GET ALL ORDERS
    // ==========================================

    public List<Order> getAllOrders() {

        return orderRepository.findAll();
    }

    // ==========================================
    // UPDATE ORDER STATUS
    // ==========================================

    public Order updateOrderStatus(
            Long orderId,
            OrderStatus status) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Order not found with id: " + orderId
                        )
                );

        order.setStatus(status);

        return orderRepository.save(order);
    }
}