package com.shibankar.shopsphere.repository;

import com.shibankar.shopsphere.entity.Wishlist;
import com.shibankar.shopsphere.user.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {

    Optional<Wishlist> findByUser(User user);
}
