import { useEffect, useState } from "react";

const API_URL = "http://localhost:8080/api";

function Cart({ onCheckout }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingItem, setUpdatingItem] = useState(null);
  const [removingItem, setRemovingItem] = useState(null);
  const [clearingCart, setClearingCart] = useState(false);

  // =========================================================
  // GET CART
  // =========================================================

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("jwtToken");

      if (!token) {
        throw new Error("Please login again.");
      }

      const response = await fetch(`${API_URL}/cart`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(
          responseText ||
            `Unable to load cart (${response.status})`
        );
      }

      const data = JSON.parse(responseText);

      setCart(data);
    } catch (err) {
      console.error("Cart error:", err);
      setError(err.message || "Unable to load cart.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchCart();
  }, []);

  // =========================================================
  // UPDATE QUANTITY
  // =========================================================

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      return;
    }

    try {
      setUpdatingItem(itemId);
      setError("");

      const token = localStorage.getItem("jwtToken");

      if (!token) {
        throw new Error("Please login again.");
      }

      const response = await fetch(
        `${API_URL}/cart/item/${itemId}?quantity=${newQuantity}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(
          responseText ||
            `Unable to update quantity (${response.status})`
        );
      }

      const updatedCart = JSON.parse(responseText);

      setCart(updatedCart);
    } catch (err) {
      console.error("Update quantity error:", err);

      setError(
        err.message ||
          "Unable to update product quantity."
      );
    } finally {
      setUpdatingItem(null);
    }
  };

  // =========================================================
  // REMOVE ITEM
  // =========================================================

  const removeItem = async (itemId) => {
    try {
      setRemovingItem(itemId);
      setError("");

      const token = localStorage.getItem("jwtToken");

      if (!token) {
        throw new Error("Please login again.");
      }

      const response = await fetch(
        `${API_URL}/cart/item/${itemId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(
          responseText ||
            `Unable to remove item (${response.status})`
        );
      }

      const updatedCart = JSON.parse(responseText);

      setCart(updatedCart);
    } catch (err) {
      console.error("Remove item error:", err);

      setError(
        err.message ||
          "Unable to remove item."
      );
    } finally {
      setRemovingItem(null);
    }
  };

  // =========================================================
  // CLEAR CART
  // =========================================================

  const clearCart = async () => {
    try {
      setClearingCart(true);
      setError("");

      const token = localStorage.getItem("jwtToken");

      if (!token) {
        throw new Error("Please login again.");
      }

      const response = await fetch(
        `${API_URL}/cart/clear`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(
          responseText ||
            `Unable to clear cart (${response.status})`
        );
      }

      const updatedCart = JSON.parse(responseText);

      setCart(updatedCart);
    } catch (err) {
      console.error("Clear cart error:", err);

      setError(
        err.message ||
          "Unable to clear cart."
      );
    } finally {
      setClearingCart(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="cart-page">
        <div className="cart-header">
          <p className="cart-small-title">
            SHOPSPHERE CART
          </p>

          <h1>Your Cart 🛒</h1>

          <p>Loading your cart...</p>
        </div>
      </main>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error && !cart) {
    return (
      <main className="cart-page">
        <div className="cart-header">
          <p className="cart-small-title">
            SHOPSPHERE CART
          </p>

          <h1>Your Cart 🛒</h1>

          <div className="cart-error">
            {error}
          </div>

          <button
            className="cart-retry-button"
            onClick={fetchCart}
          >
            Try Again ↻
          </button>
        </div>
      </main>
    );
  }

  // =========================================================
  // EMPTY CART
  // =========================================================

  if (
    !cart ||
    !cart.items ||
    cart.items.length === 0
  ) {
    return (
      <main className="cart-page">
        <div className="cart-header">
          <p className="cart-small-title">
            SHOPSPHERE CART
          </p>

          <h1>Your Cart 🛒</h1>

          <p>
            Review your items before checkout.
          </p>
        </div>

        {error && (
          <div className="cart-error">
            {error}
          </div>
        )}

        <div className="empty-cart">
          <div className="empty-cart-icon">
            🛒
          </div>

          <h2>Your cart is empty</h2>

          <p>
            Add some products to your cart and
            they will appear here.
          </p>
        </div>
      </main>
    );
  }

  // =========================================================
  // TOTALS
  // =========================================================

  const total = cart.items.reduce(
    (sum, item) =>
      sum +
      Number(item.product.price) *
        Number(item.quantity),
    0
  );

  const totalQuantity = cart.items.reduce(
    (sum, item) =>
      sum + Number(item.quantity),
    0
  );

  // =========================================================
  // MAIN CART
  // =========================================================

  return (
    <main className="cart-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="cart-header">

        <p className="cart-small-title">
          SHOPSPHERE CART
        </p>

        <h1>
          Your Cart 🛒
        </h1>

        <p>
          Review your items before checkout.
        </p>

      </div>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="cart-error">
          {error}
        </div>
      )}


      {/* =====================================================
          CART LAYOUT
      ===================================================== */}

      <div className="cart-container">

        {/* ===================================================
            ITEMS
        =================================================== */}

        <div className="cart-items">

          {cart.items.map((item) => {

            const product = item.product;

            const isUpdating =
              updatingItem === item.id;

            const isRemoving =
              removingItem === item.id;

            const maxStock =
              Number(product.stockQuantity);

            return (
              <div
                className="cart-item"
                key={item.id}
              >

                {/* PRODUCT ICON */}

                <div className="cart-product-icon">
                  🛍️
                </div>


                {/* PRODUCT INFO */}

                <div className="cart-product-info">

                  <h2>
                    {product.name}
                  </h2>

                  <p>
                    {product.description ||
                      "Quality product from ShopSphere."}
                  </p>

                  <strong>
                    ₹
                    {Number(
                      product.price
                    ).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </strong>

                </div>


                {/* QUANTITY CONTROLS */}

                <div className="cart-quantity">

                  <span>
                    Quantity
                  </span>

                  <div className="quantity-controls">

                    <button
                      type="button"
                      disabled={
                        isUpdating ||
                        isRemoving ||
                        item.quantity <= 1
                      }
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          Number(item.quantity) - 1
                        )
                      }
                    >
                      −
                    </button>

                    <strong>
                      {isUpdating
                        ? "..."
                        : item.quantity}
                    </strong>

                    <button
                      type="button"
                      disabled={
                        isUpdating ||
                        isRemoving ||
                        item.quantity >= maxStock
                      }
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          Number(item.quantity) + 1
                        )
                      }
                    >
                      +
                    </button>

                  </div>

                  <small>
                    Stock: {maxStock}
                  </small>

                </div>


                {/* SUBTOTAL */}

                <div className="cart-item-total">

                  <span>
                    Subtotal
                  </span>

                  <strong>
                    ₹
                    {(
                      Number(product.price) *
                      Number(item.quantity)
                    ).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </strong>

                  <button
                    type="button"
                    className="remove-item-button"
                    disabled={
                      isRemoving ||
                      isUpdating
                    }
                    onClick={() =>
                      removeItem(item.id)
                    }
                  >
                    {isRemoving
                      ? "Removing..."
                      : "Remove"}
                  </button>

                </div>

              </div>
            );
          })}

        </div>


        {/* ===================================================
            SUMMARY
        =================================================== */}

        <div className="cart-summary">

          <div className="cart-summary-header">

            <h2>
              Order Summary
            </h2>

            <button
              type="button"
              className="clear-cart-button"
              disabled={clearingCart}
              onClick={clearCart}
            >
              {clearingCart
                ? "Clearing..."
                : "Clear Cart"}
            </button>

          </div>


          <div className="summary-row">

            <span>
              Items
            </span>

            <span>
              {cart.items.length}
            </span>

          </div>


          <div className="summary-row">

            <span>
              Total Quantity
            </span>

            <span>
              {totalQuantity}
            </span>

          </div>


          <div className="summary-row total-row">

            <span>
              Total
            </span>

            <strong>
              ₹
              {total.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </strong>

          </div>


          <button
            className="checkout-button"
            onClick={onCheckout}
          >
            Proceed to Checkout →
          </button>

        </div>

      </div>

    </main>
  );
}

export default Cart;