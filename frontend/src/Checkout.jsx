import { useState } from "react";
import "./Checkout.css";

const API_URL = "http://localhost:8080/api";

function Checkout({ onOrderPlaced }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const getPaymentCode = () => {
    if (paymentMethod === "UPI") {
      return "UPI";
    }

    if (paymentMethod === "Card") {
      return "CARD";
    }

    return "COD";
  };

  const placeOrder = async () => {
    try {
      setLoading(true);
      setError("");
      setPaymentSuccess(false);

      const token = localStorage.getItem("jwtToken");

      if (!token) {
        throw new Error("Please login again.");
      }

      // Payment simulation
      if (paymentMethod !== "Cash on Delivery") {

        setPaymentProcessing(true);

        await new Promise((resolve) =>
          setTimeout(resolve, 1500)
        );

        setPaymentProcessing(false);
        setPaymentSuccess(true);

        await new Promise((resolve) =>
          setTimeout(resolve, 700)
        );
      }

      const paymentCode = getPaymentCode();

      // Place order
      const response = await fetch(
        `${API_URL}/orders/checkout?paymentMethod=${encodeURIComponent(
          paymentCode
        )}`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const responseText = await response.text();

      console.log(
        "Checkout status:",
        response.status
      );

      console.log(
        "Checkout response:",
        responseText
      );

      if (!response.ok) {

        throw new Error(
          responseText ||
          `Checkout failed (${response.status})`
        );
      }

      const data = JSON.parse(responseText);

      setOrder(data);

      if (onOrderPlaced) {
        onOrderPlaced();
      }

    } catch (err) {

      console.error(
        "Checkout error:",
        err
      );

      setError(
        err.message ||
        "Unable to place order."
      );

      setPaymentProcessing(false);
      setPaymentSuccess(false);

    } finally {

      setLoading(false);
    }
  };

  // ==========================================
  // ORDER SUCCESS
  // ==========================================

  if (order) {

    const isCOD =
      paymentMethod === "Cash on Delivery";

    return (
      <main className="checkout-page">

        <section className="checkout-success">

          <div className="success-icon">
            ✓
          </div>

          <p className="checkout-small-title">
            SHOPSPHERE CHECKOUT
          </p>

          <h1>
            Order Placed Successfully! 🎉
          </h1>

          <p className="success-message">
            Thank you for shopping with ShopSphere.
            Your order has been successfully placed.
          </p>

          <div className="payment-success-box">

            <span>
              {isCOD ? "💵" : "✓"}
            </span>

            <div>

              <strong>
                {isCOD
                  ? "Cash on Delivery"
                  : "Payment Successful"}
              </strong>

              <p>
                {isCOD
                  ? "Pay when your order arrives."
                  : `Your ${paymentMethod} payment has been simulated successfully.`}
              </p>

            </div>

          </div>

          <div className="order-confirmation">

            <div className="confirmation-item">

              <span>
                Order ID
              </span>

              <strong>
                #{order.id}
              </strong>

            </div>

            <div className="confirmation-item">

              <span>
                Total Amount
              </span>

              <strong>
                ₹
                {Number(
                  order.totalAmount || 0
                ).toLocaleString(
                  "en-IN",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}
              </strong>

            </div>

            <div className="confirmation-item">

              <span>
                Payment Method
              </span>

              <strong>
                {paymentMethod}
              </strong>

            </div>

            <div className="confirmation-item">

              <span>
                Order Status
              </span>

              <strong className="success-status">
                {order.status}
              </strong>

            </div>

          </div>

          <button
            className="checkout-button"
            onClick={() => {

              if (onOrderPlaced) {
                onOrderPlaced();
              }

            }}
          >
            Continue Shopping →
          </button>

        </section>

      </main>
    );
  }

  // ==========================================
  // CHECKOUT PAGE
  // ==========================================

  return (
    <main className="checkout-page">

      <section className="checkout-header">

        <p className="checkout-small-title">
          SHOPSPHERE CHECKOUT
        </p>

        <h1>
          Complete Your Order
        </h1>

        <p>
          Review your payment method and place your
          order securely.
        </p>

      </section>

      {error && (
        <div className="error-message">

          <span>
            ⚠️
          </span>

          {error}

        </div>
      )}

      <section className="checkout-card">

        {/* ORDER CONFIRMATION */}

        <div className="checkout-section">

          <div className="section-icon">
            🛍️
          </div>

          <div>

            <h2>
              Order Confirmation
            </h2>

            <p>
              Your cart items will be converted into an order.
            </p>

          </div>

        </div>

        {/* PAYMENT METHOD */}

        <div className="payment-section">

          <div className="payment-heading">

            <div>

              <p className="payment-label">
                PAYMENT
              </p>

              <h2>
                Select Payment Method
              </h2>

            </div>

            <span className="secure-badge">
              🔒 Secure
            </span>

          </div>

          <div className="payment-options">

            {/* UPI */}

            <button
              type="button"
              className={`payment-option ${
                paymentMethod === "UPI"
                  ? "payment-option-active"
                  : ""
              }`}
              onClick={() => {

                setPaymentMethod("UPI");
                setPaymentSuccess(false);

              }}
            >

              <span className="payment-option-icon">
                📱
              </span>

              <span className="payment-option-content">

                <strong>
                  UPI
                </strong>

                <small>
                  Simulated instant payment
                </small>

              </span>

              <span className="payment-radio">

                {paymentMethod === "UPI"
                  ? "✓"
                  : ""}

              </span>

            </button>

            {/* CARD */}

            <button
              type="button"
              className={`payment-option ${
                paymentMethod === "Card"
                  ? "payment-option-active"
                  : ""
              }`}
              onClick={() => {

                setPaymentMethod("Card");
                setPaymentSuccess(false);

              }}
            >

              <span className="payment-option-icon">
                💳
              </span>

              <span className="payment-option-content">

                <strong>
                  Card
                </strong>

                <small>
                  Simulated card payment
                </small>

              </span>

              <span className="payment-radio">

                {paymentMethod === "Card"
                  ? "✓"
                  : ""}

              </span>

            </button>

            {/* CASH ON DELIVERY */}

            <button
              type="button"
              className={`payment-option ${
                paymentMethod === "Cash on Delivery"
                  ? "payment-option-active"
                  : ""
              }`}
              onClick={() => {

                setPaymentMethod(
                  "Cash on Delivery"
                );

                setPaymentSuccess(false);

              }}
            >

              <span className="payment-option-icon">
                💵
              </span>

              <span className="payment-option-content">

                <strong>
                  Cash on Delivery
                </strong>

                <small>
                  Pay when your order arrives
                </small>

              </span>

              <span className="payment-radio">

                {paymentMethod ===
                "Cash on Delivery"
                  ? "✓"
                  : ""}

              </span>

            </button>

          </div>

        </div>

        {/* CHECKOUT INFORMATION */}

        <div className="checkout-info">

          <div className="checkout-info-item">

            <span className="info-icon">
              💳
            </span>

            <div>

              <span>
                Payment Method
              </span>

              <strong>
                {paymentMethod}
              </strong>

            </div>

          </div>

          <div className="checkout-info-item">

            <span className="info-icon">
              📦
            </span>

            <div>

              <span>
                Initial Order Status
              </span>

              <strong className="placed-status">
                PLACED
              </strong>

            </div>

          </div>

        </div>

        {/* PAYMENT SUCCESS */}

        {paymentSuccess && (
          <div className="payment-success-box payment-success-inline">

            <span>
              ✓
            </span>

            <div>

              <strong>
                Payment Successful
              </strong>

              <p>
                Payment simulation completed successfully.
              </p>

            </div>

          </div>
        )}

        {/* NOTE */}

        <div className="checkout-note">

          <span>
            ℹ️
          </span>

          <p>
            This project uses a simulated payment system.
            No real money will be charged.
          </p>

        </div>

        {/* PLACE ORDER */}

        <button
          className="place-order-button"
          onClick={placeOrder}
          disabled={loading}
        >

          {paymentProcessing ? (

            <>
              <span className="button-spinner"></span>
              Processing Payment...
            </>

          ) : loading ? (

            <>
              <span className="button-spinner"></span>
              Placing Order...
            </>

          ) : paymentMethod ===
            "Cash on Delivery" ? (

            <>Place Order 🎉</>

          ) : (

            <>Pay & Place Order 💳</>

          )}

        </button>

        <p className="secure-checkout">
          🔒 Secure checkout • Payment simulation
        </p>

      </section>

    </main>
  );
}

export default Checkout;