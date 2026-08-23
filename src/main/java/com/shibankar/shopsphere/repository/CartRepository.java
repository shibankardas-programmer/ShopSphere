package com.shibankar.shopsphere.repository;

import com.shibankar.shopsphere.entity.Cart;
import com.shibankar.shopsphere.user.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {

    Optional<Cart> findByUser(User user);
}