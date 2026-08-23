package com.shibankar.shopsphere.service;

import com.shibankar.shopsphere.entity.Product;
import com.shibankar.shopsphere.exception.BadRequestException;
import com.shibankar.shopsphere.exception.ResourceNotFoundException;
import com.shibankar.shopsphere.repository.ProductRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // =========================================================
    // CREATE PRODUCT
    // =========================================================

    public Product createProduct(Product product) {

        validateProduct(product);

        return productRepository.save(product);
    }

    // =========================================================
    // GET ALL PRODUCTS
    // =========================================================

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // =========================================================
    // GET ALL PRODUCTS WITH PAGINATION
    // =========================================================

    public Page<Product> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable);
    }

    // =========================================================
    // GET PRODUCT BY ID
    // =========================================================

    public Product getProductById(Long id) {

        if (id == null || id <= 0) {
            throw new BadRequestException(
                    "Product ID must be greater than 0."
            );
        }

        return productRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Product not found with id: " + id
                        )
                );
    }

    // =========================================================
    // UPDATE PRODUCT
    // =========================================================

    public Product updateProduct(
            Long id,
            Product updatedProduct) {

        if (id == null || id <= 0) {
            throw new BadRequestException(
                    "Product ID must be greater than 0."
            );
        }

        validateProduct(updatedProduct);

        Product existingProduct =
                productRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Product not found with id: "
                                                + id
                                )
                        );

        existingProduct.setName(
                updatedProduct.getName().trim()
        );

        existingProduct.setDescription(
                updatedProduct.getDescription().trim()
        );

        existingProduct.setPrice(
                updatedProduct.getPrice()
        );

        existingProduct.setStockQuantity(
                updatedProduct.getStockQuantity()
        );

        return productRepository.save(existingProduct);
    }

    // =========================================================
    // DELETE PRODUCT
    // =========================================================

    public void deleteProduct(Long id) {

        if (id == null || id <= 0) {
            throw new BadRequestException(
                    "Product ID must be greater than 0."
            );
        }

        Product existingProduct =
                productRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Product not found with id: "
                                                + id
                                )
                        );

        productRepository.delete(existingProduct);
    }

    // =========================================================
    // SEARCH BY NAME
    // =========================================================

    public List<Product> searchByName(String name) {

        if (name == null || name.trim().isEmpty()) {
            return productRepository.findAll();
        }

        return productRepository
                .findByNameContainingIgnoreCase(
                        name.trim()
                );
    }

    // =========================================================
    // SEARCH BY MINIMUM PRICE
    // =========================================================

    public List<Product> searchByMinimumPrice(
            double minPrice) {

        validatePrice(minPrice);

        return productRepository
                .findByPriceGreaterThanEqual(minPrice);
    }

    // =========================================================
    // SEARCH BY MAXIMUM PRICE
    // =========================================================

    public List<Product> searchByMaximumPrice(
            double maxPrice) {

        validatePrice(maxPrice);

        return productRepository
                .findByPriceLessThanEqual(maxPrice);
    }

    // =========================================================
    // SEARCH BY PRICE RANGE
    // =========================================================

    public List<Product> searchByPriceRange(
            double minPrice,
            double maxPrice) {

        validatePriceRange(minPrice, maxPrice);

        return productRepository
                .findByPriceBetween(
                        minPrice,
                        maxPrice
                );
    }

    // =========================================================
    // SEARCH BY NAME + MINIMUM PRICE
    // =========================================================

    public List<Product> searchByNameAndMinimumPrice(
            String name,
            double minPrice) {

        validatePrice(minPrice);

        return productRepository
                .findByNameContainingIgnoreCaseAndPriceGreaterThanEqual(
                        name.trim(),
                        minPrice
                );
    }

    // =========================================================
    // SEARCH BY NAME + MAXIMUM PRICE
    // =========================================================

    public List<Product> searchByNameAndMaximumPrice(
            String name,
            double maxPrice) {

        validatePrice(maxPrice);

        return productRepository
                .findByNameContainingIgnoreCaseAndPriceLessThanEqual(
                        name.trim(),
                        maxPrice
                );
    }

    // =========================================================
    // SEARCH BY NAME + PRICE RANGE
    // =========================================================

    public List<Product> searchByNameAndPriceRange(
            String name,
            double minPrice,
            double maxPrice) {

        validatePriceRange(minPrice, maxPrice);

        return productRepository
                .findByNameContainingIgnoreCaseAndPriceBetween(
                        name.trim(),
                        minPrice,
                        maxPrice
                );
    }

    // =========================================================
    // GET PRODUCTS IN STOCK
    // =========================================================

    public List<Product> getInStockProducts() {

        return productRepository
                .findByStockQuantityGreaterThan(0);
    }

    // =========================================================
    // VALIDATION
    // =========================================================

    private void validateProduct(Product product) {

        if (product == null) {
            throw new BadRequestException(
                    "Product data cannot be null."
            );
        }

        if (product.getName() == null ||
                product.getName().trim().isEmpty()) {

            throw new BadRequestException(
                    "Product name cannot be blank."
            );
        }

        if (product.getDescription() == null ||
                product.getDescription().trim().isEmpty()) {

            throw new BadRequestException(
                    "Product description cannot be blank."
            );
        }

        if (product.getPrice() <= 0) {
            throw new BadRequestException(
                    "Price must be greater than 0."
            );
        }

        if (product.getStockQuantity() < 0) {
            throw new BadRequestException(
                    "Stock quantity cannot be negative."
            );
        }
    }

    private void validatePrice(double price) {

        if (price < 0) {
            throw new BadRequestException(
                    "Price cannot be negative."
            );
        }
    }

    private void validatePriceRange(
            double minPrice,
            double maxPrice) {

        validatePrice(minPrice);
        validatePrice(maxPrice);

        if (minPrice > maxPrice) {
            throw new BadRequestException(
                    "Minimum price cannot be greater than maximum price."
            );
        }
    }
}