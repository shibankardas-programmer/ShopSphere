package com.shibankar.shopsphere.service;

import com.shibankar.shopsphere.entity.Cart;
import com.shibankar.shopsphere.entity.CartItem;
import com.shibankar.shopsphere.entity.Order;
import com.shibankar.shopsphere.entity.OrderItem;
import com.shibankar.shopsphere.entity.Product;
import com.shibankar.shopsphere.repository.CartRepository;
import com.shibankar.shopsphere.repository.OrderRepository;
import com.shibankar.shopsphere.repository.UserRepository;
import com.shibankar.shopsphere.user.User;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;

    public OrderService(
            OrderRepository orderRepository,
            CartRepository cartRepository,
            UserRepository userRepository) {

        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.userRepository = userRepository;
    }

    // Get all orders belonging to the logged-in user
    public List<Order> getUserOrders(String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return orderRepository.findByUser(user);
    }

    // Get a single order
    public Order getOrder(
            Long orderId,
            String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Order not found with id: " + orderId));

        // Users can only access their own orders
        if (!order.getUser().getId().equals(user.getId())) {

            throw new RuntimeException(
                    "You are not allowed to access this order");
        }

        return order;
    }

    // Checkout cart and create order
    @Transactional
    public Order createOrderFromCart(
            String username,
            String paymentMethod) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() ->
                        new RuntimeException("Cart not found"));

        if (cart.getItems() == null ||
                cart.getItems().isEmpty()) {

            throw new RuntimeException("Cart is empty");
        }

        // Validate payment method
        if (paymentMethod == null ||
                paymentMethod.trim().isEmpty()) {

            paymentMethod = "COD";
        }

        paymentMethod = paymentMethod.toUpperCase();

        if (!paymentMethod.equals("UPI") &&
                !paymentMethod.equals("CARD") &&
                !paymentMethod.equals("COD")) {

            throw new RuntimeException(
                    "Invalid payment method");
        }

        // Check stock before creating the order
        for (CartItem cartItem : cart.getItems()) {

            Product product = cartItem.getProduct();

            int requestedQuantity =
                    cartItem.getQuantity();

            if (requestedQuantity <= 0) {

                throw new RuntimeException(
                        "Invalid quantity for product: "
                                + product.getName());
            }

            if (product.getStockQuantity()
                    < requestedQuantity) {

                throw new RuntimeException(
                        "Insufficient stock for product: "
                                + product.getName()
                                + ". Available: "
                                + product.getStockQuantity()
                                + ", Requested: "
                                + requestedQuantity);
            }
        }

        // Create new order
        Order order = new Order(user);

        order.setPaymentMethod(paymentMethod);

        double totalAmount = 0.0;

        // Convert CartItems into OrderItems
        for (CartItem cartItem : cart.getItems()) {

            Product product = cartItem.getProduct();

            int quantity = cartItem.getQuantity();

            double price = product.getPrice();

            double itemTotal = price * quantity;

            totalAmount += itemTotal;

            OrderItem orderItem = new OrderItem(
                    order,
                    product,
                    quantity,
                    price
            );

            order.getItems().add(orderItem);

            // Reduce product stock
            product.setStockQuantity(
                    product.getStockQuantity() - quantity
            );
        }

        order.setTotalAmount(totalAmount);

        // Save order and order items
        Order savedOrder =
                orderRepository.save(order);

        // Clear cart after successful order creation
        cart.getItems().clear();

        cartRepository.save(cart);

        return savedOrder;
    }
}