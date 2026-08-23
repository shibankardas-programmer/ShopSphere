package com.shibankar.shopsphere.repository;

import com.shibankar.shopsphere.entity.Order;
import com.shibankar.shopsphere.user.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUser(User user);
}
