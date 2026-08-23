package com.shibankar.shopsphere.service;

import com.shibankar.shopsphere.entity.Cart;
import com.shibankar.shopsphere.entity.CartItem;
import com.shibankar.shopsphere.entity.Product;
import com.shibankar.shopsphere.repository.CartItemRepository;
import com.shibankar.shopsphere.repository.CartRepository;
import com.shibankar.shopsphere.repository.ProductRepository;
import com.shibankar.shopsphere.repository.UserRepository;
import com.shibankar.shopsphere.user.User;

import jakarta.transaction.Transactional;

import org.springframework.stereotype.Service;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartService(
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            ProductRepository productRepository,
            UserRepository userRepository) {

        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }


    // =========================================================
    // GET EXISTING CART OR CREATE NEW CART
    // =========================================================

    public Cart getOrCreateCart(String username) {

        User user = getUser(username);

        return cartRepository.findByUser(user)
                .orElseGet(() -> {

                    Cart cart = new Cart(user);

                    return cartRepository.save(cart);
                });
    }


    // =========================================================
    // ADD PRODUCT TO CART
    // =========================================================

    @Transactional
    public Cart addToCart(
            String username,
            Long productId,
            int quantity) {

        // -----------------------------------------------------
        // VALIDATE QUANTITY
        // -----------------------------------------------------

        if (quantity <= 0) {

            throw new RuntimeException(
                    "Quantity must be greater than zero"
            );
        }


        // -----------------------------------------------------
        // FIND USER
        // -----------------------------------------------------

        User user = getUser(username);


        // -----------------------------------------------------
        // FIND PRODUCT
        // -----------------------------------------------------

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Product not found with id: "
                                        + productId
                        )
                );


        // -----------------------------------------------------
        // CHECK PRODUCT STOCK
        // -----------------------------------------------------

        if (product.getStockQuantity() <= 0) {

            throw new RuntimeException(
                    "Product is out of stock"
            );
        }


        // -----------------------------------------------------
        // GET OR CREATE USER CART
        // -----------------------------------------------------

        Cart cart = cartRepository.findByUser(user)
                .orElseGet(() ->
                        cartRepository.save(
                                new Cart(user)
                        )
                );


        // -----------------------------------------------------
        // FIND EXISTING CART ITEM
        // -----------------------------------------------------

        CartItem cartItem =
                cartItemRepository
                        .findByCartAndProduct(
                                cart,
                                product
                        )
                        .orElse(null);


        // -----------------------------------------------------
        // ADD / INCREASE QUANTITY
        // -----------------------------------------------------

        if (cartItem != null) {

            int newQuantity =
                    cartItem.getQuantity() + quantity;


            // Make sure total cart quantity
            // does not exceed available stock.

            if (newQuantity >
                    product.getStockQuantity()) {

                throw new RuntimeException(
                        "Cannot add more than available stock. "
                                + "Available stock: "
                                + product.getStockQuantity()
                );
            }


            cartItem.setQuantity(newQuantity);

        } else {

            // Requested quantity must not
            // exceed available stock.

            if (quantity >
                    product.getStockQuantity()) {

                throw new RuntimeException(
                        "Requested quantity exceeds available stock. "
                                + "Available stock: "
                                + product.getStockQuantity()
                );
            }


            cartItem = new CartItem(
                    cart,
                    product,
                    quantity
            );
        }


        // -----------------------------------------------------
        // SAVE CART ITEM
        // -----------------------------------------------------

        cartItemRepository.save(cartItem);


        return cart;
    }


    // =========================================================
    // UPDATE CART ITEM QUANTITY
    // =========================================================

    @Transactional
    public Cart updateCartItem(
            String username,
            Long itemId,
            int quantity) {

        // -----------------------------------------------------
        // VALIDATE QUANTITY
        // -----------------------------------------------------

        if (quantity <= 0) {

            throw new RuntimeException(
                    "Quantity must be greater than zero"
            );
        }


        // -----------------------------------------------------
        // FIND USER
        // -----------------------------------------------------

        User user = getUser(username);


        // -----------------------------------------------------
        // FIND USER'S CART
        // -----------------------------------------------------

        Cart cart = getUserCart(user);


        // -----------------------------------------------------
        // FIND CART ITEM
        // -----------------------------------------------------

        CartItem cartItem =
                cartItemRepository.findById(itemId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Cart item not found with id: "
                                                + itemId
                                )
                        );


        // -----------------------------------------------------
        // SECURITY CHECK
        //
        // Make sure this item belongs to
        // the logged-in user's cart.
        // -----------------------------------------------------

        if (!cartItem.getCart()
                .getId()
                .equals(cart.getId())) {

            throw new RuntimeException(
                    "You do not have permission to modify this cart item"
            );
        }


        // -----------------------------------------------------
        // GET PRODUCT
        // -----------------------------------------------------

        Product product =
                cartItem.getProduct();


        // -----------------------------------------------------
        // CHECK STOCK
        // -----------------------------------------------------

        if (quantity >
                product.getStockQuantity()) {

            throw new RuntimeException(
                    "Requested quantity exceeds available stock. "
                            + "Available stock: "
                            + product.getStockQuantity()
            );
        }


        // -----------------------------------------------------
        // UPDATE QUANTITY
        // -----------------------------------------------------

        cartItem.setQuantity(quantity);

        cartItemRepository.save(cartItem);


        return cart;
    }


    // =========================================================
    // REMOVE CART ITEM
    // =========================================================

    @Transactional
    public Cart removeCartItem(
            String username,
            Long itemId) {

        // -----------------------------------------------------
        // FIND USER
        // -----------------------------------------------------

        User user = getUser(username);


        // -----------------------------------------------------
        // FIND USER'S CART
        // -----------------------------------------------------

        Cart cart = getUserCart(user);


        // -----------------------------------------------------
        // FIND CART ITEM
        // -----------------------------------------------------

        CartItem cartItem =
                cartItemRepository.findById(itemId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Cart item not found with id: "
                                                + itemId
                                )
                        );


        // -----------------------------------------------------
        // SECURITY CHECK
        // -----------------------------------------------------

        if (!cartItem.getCart()
                .getId()
                .equals(cart.getId())) {

            throw new RuntimeException(
                    "You do not have permission to remove this cart item"
            );
        }


        // -----------------------------------------------------
        // REMOVE FROM CART COLLECTION
        // -----------------------------------------------------

        cart.getItems().remove(cartItem);


        // -----------------------------------------------------
        // DELETE FROM DATABASE
        // -----------------------------------------------------

        cartItemRepository.delete(cartItem);


        return cart;
    }


    // =========================================================
    // CLEAR CART
    // =========================================================

    @Transactional
    public Cart clearCart(String username) {

        // -----------------------------------------------------
        // FIND USER
        // -----------------------------------------------------

        User user = getUser(username);


        // -----------------------------------------------------
        // FIND USER'S CART
        // -----------------------------------------------------

        Cart cart = getUserCart(user);


        // -----------------------------------------------------
        // CLEAR ALL ITEMS
        // -----------------------------------------------------

        cart.getItems().clear();


        // Because Cart has:
        //
        // cascade = CascadeType.ALL
        // orphanRemoval = true
        //
        // clearing the collection will remove
        // the CartItems from the database.

        return cartRepository.save(cart);
    }


    // =========================================================
    // FIND USER
    // =========================================================

    private User getUser(String username) {

        return userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found: " + username
                        )
                );
    }


    // =========================================================
    // FIND USER'S CART
    // =========================================================

    private Cart getUserCart(User user) {

        return cartRepository.findByUser(user)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Cart not found"
                        )
                );
    }
}