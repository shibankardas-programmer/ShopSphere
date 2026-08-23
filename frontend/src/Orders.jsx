import { useEffect, useState } from "react";
import "./Orders.css";

const API_URL = "http://localhost:8080/api";

function Orders() {

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH CUSTOMER ORDERS
  // ==========================================

  const fetchOrders = async (
    isBackgroundRefresh = false
  ) => {

    try {

      if (isBackgroundRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token =
        localStorage.getItem("jwtToken");

      if (!token) {
        setError("You are not logged in.");
        return;
      }

      const response = await fetch(
        `${API_URL}/orders`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {

        if (response.status === 401) {
          throw new Error(
            "Session expired. Please login again."
          );
        }

        if (response.status === 403) {
          throw new Error(
            "You do not have permission to view your orders."
          );
        }

        const message =
          await response.text();

        throw new Error(
          `Orders API failed: ${response.status} ${
            message || "No response body"
          }`
        );
      }

      const data =
        await response.json();

      setOrders(data);

    } catch (err) {

      console.error(
        "Orders error:",
        err
      );

      if (!isBackgroundRefresh) {
        setError(
          err.message ||
          "Failed to load orders."
        );
      }

    } finally {

      if (isBackgroundRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }

    }
  };

  // ==========================================
  // INITIAL LOAD + AUTO REFRESH
  // ==========================================

  useEffect(() => {

    fetchOrders();

    const interval = setInterval(() => {
      fetchOrders(true);
    }, 5000);

    return () => {
      clearInterval(interval);
    };

  }, []);

  // ==========================================
  // ORDER STATUS
  // ==========================================

  const statusSteps = [
    "PLACED",
    "CONFIRMED",
    "SHIPPED",
    "DELIVERED",
  ];

  const getStatusIndex = (status) => {
    return statusSteps.indexOf(status);
  };

  const isCompleted = (order, step) => {

    if (order.status === "CANCELLED") {
      return false;
    }

    return (
      getStatusIndex(order.status) >=
      getStatusIndex(step)
    );
  };

  const isCurrent = (order, step) => {
    return order.status === step;
  };

  // ==========================================
  // STATUS CLASS
  // ==========================================

  const getStatusClass = (status) => {

    switch (status) {

      case "PLACED":
        return "status-placed";

      case "CONFIRMED":
        return "status-confirmed";

      case "SHIPPED":
        return "status-shipped";

      case "DELIVERED":
        return "status-delivered";

      case "CANCELLED":
        return "status-cancelled";

      default:
        return "";
    }
  };

  // ==========================================
  // PAYMENT DISPLAY
  // ==========================================

  const getPaymentLabel = (paymentMethod) => {

    switch (paymentMethod) {

      case "UPI":
        return "UPI";

      case "CARD":
        return "Card";

      case "COD":
        return "Cash on Delivery";

      default:
        return "Not Available";
    }
  };

  const isPaid = (paymentMethod) => {

    return (
      paymentMethod === "UPI" ||
      paymentMethod === "CARD"
    );
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (
      <main className="orders-page">

        <section className="orders-header">

          <p className="orders-label">
            SHOPSPHERE ORDERS
          </p>

          <h2>
            My Orders 📦
          </h2>

          <p>
            Loading your orders...
          </p>

        </section>

      </main>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {

    return (
      <main className="orders-page">

        <section className="orders-header">

          <p className="orders-label">
            SHOPSPHERE ORDERS
          </p>

          <h2>
            My Orders 📦
          </h2>

          <p>
            Track and manage your previous purchases.
          </p>

        </section>

        <div className="orders-error">
          {error}
        </div>

        <button
          className="refresh-orders-button"
          onClick={() => fetchOrders(false)}
        >
          Try Again ↻
        </button>

      </main>
    );
  }

  // ==========================================
  // MAIN PAGE
  // ==========================================

  return (
    <main className="orders-page">

      {/* HEADER */}

      <section className="orders-header">

        <p className="orders-label">
          SHOPSPHERE ORDERS
        </p>

        <h2>
          My Orders 📦
        </h2>

        <p>
          Track and manage your previous purchases.
        </p>

        <button
          className="refresh-orders-button"
          onClick={() => fetchOrders(false)}
        >
          Refresh Orders ↻
        </button>

        {refreshing && (
          <small
            style={{
              display: "block",
              marginTop: "8px",
              opacity: 0.7,
            }}
          >
            Checking for order updates...
          </small>
        )}

      </section>

      {/* EMPTY ORDERS */}

      {orders.length === 0 ? (

        <div className="empty-orders">

          <div className="empty-orders-icon">
            📦
          </div>

          <h3>
            No Orders Yet
          </h3>

          <p>
            You haven't placed any orders yet.
          </p>

        </div>

      ) : (

        <section className="orders-list">

          {orders.map((order) => (

            <article
              className="order-card"
              key={order.id}
            >

              {/* ORDER HEADER */}

              <div className="order-card-header">

                <div>

                  <p className="order-number-label">
                    ORDER ID
                  </p>

                  <h3>
                    #{order.id}
                  </h3>

                </div>

                <span
                  className={`order-status ${getStatusClass(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>

              </div>

              {/* ORDER DETAILS */}

              <div className="order-details">

                <div className="order-detail">

                  <span>
                    Order Date
                  </span>

                  <strong>
                    {order.createdAt
                      ? new Date(
                          order.createdAt
                        ).toLocaleString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : "N/A"}
                  </strong>

                </div>

                <div className="order-detail">

                  <span>
                    Items
                  </span>

                  <strong>
                    {order.items?.length || 0}
                  </strong>

                </div>

                <div className="order-detail">

                  <span>
                    Total
                  </span>

                  <strong className="order-total">

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

                <div className="order-detail">

                  <span>
                    Payment
                  </span>

                  <strong className="payment-method-display">
                    {getPaymentLabel(
                      order.paymentMethod
                    )}
                  </strong>

                </div>

              </div>

              {/* PAYMENT SUMMARY */}

              <div className="payment-summary">

                <div className="payment-summary-icon">

                  {isPaid(
                    order.paymentMethod
                  )
                    ? "✓"
                    : "💵"}

                </div>

                <div className="payment-summary-content">

                  <strong>

                    {isPaid(
                      order.paymentMethod
                    )
                      ? "Payment Successful"
                      : "Cash on Delivery"}

                  </strong>

                  <span>

                    {isPaid(
                      order.paymentMethod
                    )
                      ? "Payment simulation completed successfully."
                      : "Pay when your order arrives."}

                  </span>

                </div>

              </div>

              {/* ORDER TRACKING */}

              <div className="order-tracking">

                <div className="tracking-header">

                  <h4>
                    Order Tracking 🚚
                  </h4>

                  <span>

                    {order.status === "CANCELLED"
                      ? "Order Cancelled"
                      : `Current Status: ${order.status}`}

                  </span>

                </div>

                {/* CANCELLED */}

                {order.status === "CANCELLED" ? (

                  <div className="cancelled-order">

                    <div className="tracking-icon">
                      ❌
                    </div>

                    <div>

                      <strong>
                        Order Cancelled
                      </strong>

                      <p>
                        This order has been cancelled.
                      </p>

                    </div>

                  </div>

                ) : (

                  /* NORMAL TRACKING */

                  <div className="tracking-steps">

                    {statusSteps.map(
                      (step, index) => {

                        const completed =
                          isCompleted(
                            order,
                            step
                          );

                        const current =
                          isCurrent(
                            order,
                            step
                          );

                        return (
                          <div
                            className="tracking-step"
                            key={step}
                          >

                            <div
                              className={`tracking-circle ${
                                completed
                                  ? "tracking-completed"
                                  : ""
                              } ${
                                current
                                  ? "tracking-current"
                                  : ""
                              }`}
                            >

                              {completed
                                ? "✓"
                                : index + 1}

                            </div>

                            <div className="tracking-step-content">

                              <strong>
                                {step}
                              </strong>

                              <span>

                                {current
                                  ? "Current Status"
                                  : completed
                                  ? "Completed"
                                  : "Pending"}

                              </span>

                            </div>

                            {index <
                              statusSteps.length -
                                1 && (

                              <div
                                className={`tracking-line ${
                                  getStatusIndex(
                                    order.status
                                  ) > index
                                    ? "tracking-line-completed"
                                    : ""
                                }`}
                              />

                            )}

                          </div>
                        );
                      }
                    )}

                  </div>
                )}

              </div>

              {/* ORDER ITEMS */}

              <div className="order-items-section">

                <div className="order-items-title">

                  <span>
                    🛍️
                  </span>

                  <h4>
                    Order Items
                  </h4>

                </div>

                {order.items &&
                order.items.length > 0 ? (

                  order.items.map((item) => (

                    <div
                      className="order-product"
                      key={item.id}
                    >

                      <div className="product-placeholder">
                        🛍️
                      </div>

                      <div className="order-product-info">

                        <h5>
                          {item.product?.name ||
                            "Product"}
                        </h5>

                        <p>
                          {item.product?.description ||
                            "ShopSphere product"}
                        </p>

                        <span>
                          Quantity: {item.quantity}
                        </span>

                      </div>

                      <div className="order-product-price">

                        <strong>

                          ₹
                          {Number(
                            item.price || 0
                          ).toLocaleString(
                            "en-IN",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}

                        </strong>

                        <span>
                          × {item.quantity}
                        </span>

                      </div>

                    </div>

                  ))

                ) : (

                  <p>
                    No items found.
                  </p>

                )}

              </div>

              {/* ORDER FOOTER */}

              <div className="order-card-footer">

                <span>
                  Order #{order.id}
                </span>

                <strong>

                  {isPaid(
                    order.paymentMethod
                  )
                    ? "Total Paid: ₹"
                    : "Order Total: ₹"}

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

            </article>

          ))}

        </section>

      )}

    </main>
  );
}

export default Orders;