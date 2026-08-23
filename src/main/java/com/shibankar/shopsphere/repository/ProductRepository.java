package com.shibankar.shopsphere.repository;

import com.shibankar.shopsphere.entity.Product;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    // Search products by name
    List<Product> findByNameContainingIgnoreCase(String name);

    // Search products by minimum price
    List<Product> findByPriceGreaterThanEqual(double minPrice);

    // Search products by maximum price
    List<Product> findByPriceLessThanEqual(double maxPrice);

    // Search products by price range
    List<Product> findByPriceBetween(
            double minPrice,
            double maxPrice
    );

    // Search by name + minimum price
    List<Product> findByNameContainingIgnoreCaseAndPriceGreaterThanEqual(
            String name,
            double minPrice
    );

    // Search by name + maximum price
    List<Product> findByNameContainingIgnoreCaseAndPriceLessThanEqual(
            String name,
            double maxPrice
    );

    // Search by name + price range
    List<Product> findByNameContainingIgnoreCaseAndPriceBetween(
            String name,
            double minPrice,
            double maxPrice
    );

    // Get products currently in stock
    List<Product> findByStockQuantityGreaterThan(int stockQuantity);
}