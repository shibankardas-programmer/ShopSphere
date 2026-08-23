package com.shibankar.shopsphere.controller;

import com.shibankar.shopsphere.entity.Product;
import com.shibankar.shopsphere.service.ProductService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // =========================================================
    // ADMIN ONLY - CREATE PRODUCT
    // =========================================================

    @PostMapping
    @SecurityRequirement(name = "bearerAuth")
    public Product createProduct(
            @Valid @RequestBody Product product) {

        return productService.createProduct(product);
    }

    // =========================================================
    // SEARCH PRODUCTS
    // =========================================================

    @GetMapping("/search")
    @SecurityRequirement(name = "bearerAuth")
    public List<Product> searchProducts(

            @RequestParam(required = false)
            String name,

            @RequestParam(required = false)
            Double minPrice,

            @RequestParam(required = false)
            Double maxPrice) {

        String cleanName =
                name == null ? "" : name.trim();

        boolean hasName =
                !cleanName.isEmpty();

        boolean hasMin =
                minPrice != null;

        boolean hasMax =
                maxPrice != null;

        // -----------------------------------------------------
        // VALIDATE PRICE VALUES
        // -----------------------------------------------------

        if (hasMin && minPrice < 0) {
            throw new IllegalArgumentException(
                    "Minimum price cannot be negative."
            );
        }

        if (hasMax && maxPrice < 0) {
            throw new IllegalArgumentException(
                    "Maximum price cannot be negative."
            );
        }

        if (hasMin &&
                hasMax &&
                minPrice > maxPrice) {

            throw new IllegalArgumentException(
                    "Minimum price cannot be greater than maximum price."
            );
        }

        // -----------------------------------------------------
        // NAME + MIN + MAX
        // -----------------------------------------------------

        if (hasName && hasMin && hasMax) {

            return productService
                    .searchByNameAndPriceRange(
                            cleanName,
                            minPrice,
                            maxPrice
                    );
        }

        // -----------------------------------------------------
        // NAME + MIN
        // -----------------------------------------------------

        if (hasName && hasMin) {

            return productService
                    .searchByNameAndMinimumPrice(
                            cleanName,
                            minPrice
                    );
        }

        // -----------------------------------------------------
        // NAME + MAX
        // -----------------------------------------------------

        if (hasName && hasMax) {

            return productService
                    .searchByNameAndMaximumPrice(
                            cleanName,
                            maxPrice
                    );
        }

        // -----------------------------------------------------
        // NAME ONLY
        // -----------------------------------------------------

        if (hasName) {

            return productService
                    .searchByName(cleanName);
        }

        // -----------------------------------------------------
        // MIN + MAX
        // -----------------------------------------------------

        if (hasMin && hasMax) {

            return productService
                    .searchByPriceRange(
                            minPrice,
                            maxPrice
                    );
        }

        // -----------------------------------------------------
        // MIN ONLY
        // -----------------------------------------------------

        if (hasMin) {

            return productService
                    .searchByMinimumPrice(
                            minPrice
                    );
        }

        // -----------------------------------------------------
        // MAX ONLY
        // -----------------------------------------------------

        if (hasMax) {

            return productService
                    .searchByMaximumPrice(
                            maxPrice
                    );
        }

        // -----------------------------------------------------
        // NO FILTER
        // -----------------------------------------------------

        return productService.getAllProducts();
    }

    // =========================================================
    // GET PRODUCTS IN STOCK
    // =========================================================

    @GetMapping("/in-stock")
    @SecurityRequirement(name = "bearerAuth")
    public List<Product> getInStockProducts() {

        return productService.getInStockProducts();
    }

    // =========================================================
    // GET ALL PRODUCTS
    // =========================================================

    @GetMapping
    @SecurityRequirement(name = "bearerAuth")
    public Page<Product> getAllProducts(

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "5")
            int size,

            @RequestParam(defaultValue = "id")
            String sort) {

        if (page < 0) {
            throw new IllegalArgumentException(
                    "Page number cannot be negative."
            );
        }

        if (size < 1 || size > 100) {
            throw new IllegalArgumentException(
                    "Page size must be between 1 and 100."
            );
        }

        if (sort == null || sort.isBlank()) {
            sort = "id";
        }

        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        Sort.by(
                                Sort.Direction.ASC,
                                sort
                        )
                );

        return productService
                .getAllProducts(pageable);
    }

    // =========================================================
    // GET PRODUCT BY ID
    // =========================================================

    @GetMapping("/{id}")
    @SecurityRequirement(name = "bearerAuth")
    public Product getProductById(
            @PathVariable Long id) {

        return productService
                .getProductById(id);
    }

    // =========================================================
    // ADMIN ONLY - UPDATE PRODUCT
    // =========================================================

    @PutMapping("/{id}")
    @SecurityRequirement(name = "bearerAuth")
    public Product updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody Product product) {

        return productService
                .updateProduct(
                        id,
                        product
                );
    }

    // =========================================================
    // ADMIN ONLY - DELETE PRODUCT
    // =========================================================

    @DeleteMapping("/{id}")
    @SecurityRequirement(name = "bearerAuth")
    public void deleteProduct(
            @PathVariable Long id) {

        productService
                .deleteProduct(id);
    }
}