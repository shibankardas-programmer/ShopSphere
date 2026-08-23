import { useEffect, useState } from "react";
import AdminProducts from "./AdminProducts";

const API_URL = "http://localhost:8080/api";

function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingOrder, setUpdatingOrder] = useState(null);

  // =========================================================
  // STATUS OPTIONS
  // =========================================================

  const statusOptions = [
    "PLACED",
    "CONFIRMED",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ];

  // =========================================================
  // LOAD ALL ORDERS
  // =========================================================

  const loadOrders = async () => {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("jwtToken");

    if (!token) {
      setError("You are not logged in. Please login again.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/orders`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Session expired. Please login again.");
        }

        if (response.status === 403) {
          throw new Error(
            "Access denied. Only ADMIN users can access this page."
          );
        }

        throw new Error(
          `Failed to load orders (${response.status})`
        );
      }

      const data = await response.json();

      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Admin orders error:", err);

      setError(
        err.message || "Failed to load admin orders."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadOrders();
  }, []);

  // =========================================================
  // UPDATE ORDER STATUS
  // =========================================================

  const updateStatus = async (orderId, status) => {
    const token = localStorage.getItem("jwtToken");

    if (!token) {
      setError("Session expired. Please login again.");
      return;
    }

    setUpdatingOrder(orderId);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/admin/orders/${orderId}/status?status=${encodeURIComponent(
          status
        )}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
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
            "You do not have ADMIN permission."
          );
        }

        if (response.status === 404) {
          throw new Error(
            `Order #${orderId} was not found.`
          );
        }

        throw new Error(
          `Failed to update order status (${response.status})`
        );
      }

      const updatedOrder = await response.json();

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order.id === updatedOrder.id
            ? updatedOrder
            : order
        )
      );
    } catch (err) {
      console.error("Status update error:", err);

      setError(
        err.message ||
          "Failed to update order status."
      );
    } finally {
      setUpdatingOrder(null);
    }
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    try {
      return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  // =========================================================
  // FORMAT MONEY
  // =========================================================

  const formatMoney = (amount) => {
    return Number(amount || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  };

  // =========================================================
  // STATUS COUNTS
  // =========================================================

  const placedCount = orders.filter(
    (order) => order.status === "PLACED"
  ).length;

  const confirmedCount = orders.filter(
    (order) => order.status === "CONFIRMED"
  ).length;

  const shippedCount = orders.filter(
    (order) => order.status === "SHIPPED"
  ).length;

  const deliveredCount = orders.filter(
    (order) => order.status === "DELIVERED"
  ).length;

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="admin-page">

        <section className="admin-header">
          <p className="admin-label">
            SHOPSPHERE ADMIN
          </p>

          <h1>
            Admin Dashboard 🛠️
          </h1>

          <p>
            Loading customer orders...
          </p>
        </section>

        <div className="admin-loading-card">
          <div className="admin-loading-icon">
            ⏳
          </div>

          <h3>
            Loading Dashboard
          </h3>

          <p>
            Please wait while we fetch the latest orders.
          </p>
        </div>

      </main>
    );
  }

  // =========================================================
  // MAIN PAGE
  // =========================================================

  return (
    <main className="admin-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="admin-header">

        <p className="admin-label">
          SHOPSPHERE ADMIN
        </p>

        <h1>
          Admin Dashboard 🛠️
        </h1>

        <p>
          Manage orders and products in your ShopSphere store.
        </p>

      </section>


      {/* =====================================================
          SECTION TABS
      ===================================================== */}

      <div className="admin-section-tabs">

        <button
          className={
            activeSection === "orders"
              ? "admin-tab active"
              : "admin-tab"
          }
          onClick={() =>
            setActiveSection("orders")
          }
        >
          📦 Order Management
        </button>


        <button
          className={
            activeSection === "products"
              ? "admin-tab active"
              : "admin-tab"
          }
          onClick={() =>
            setActiveSection("products")
          }
        >
          🛍️ Product Management
        </button>

      </div>


      {/* =====================================================
          PRODUCT MANAGEMENT
      ===================================================== */}

      {activeSection === "products" && (
        <AdminProducts />
      )}


      {/* =====================================================
          ORDER MANAGEMENT
      ===================================================== */}

      {activeSection === "orders" && (
        <>

          {/* ERROR */}

          {error && (
            <div className="admin-error">
              <span>⚠️</span>
              {error}
            </div>
          )}


          {/* =================================================
              SUMMARY CARDS
          ================================================= */}

          <section className="admin-summary">

            <div className="admin-stat">
              <div className="admin-stat-icon">
                📦
              </div>

              <div>
                <span>
                  Total Orders
                </span>

                <strong>
                  {orders.length}
                </strong>
              </div>
            </div>


            <div className="admin-stat">
              <div className="admin-stat-icon placed-icon">
                🛒
              </div>

              <div>
                <span>
                  Placed
                </span>

                <strong>
                  {placedCount}
                </strong>
              </div>
            </div>


            <div className="admin-stat">
              <div className="admin-stat-icon shipped-icon">
                🚚
              </div>

              <div>
                <span>
                  Shipped
                </span>

                <strong>
                  {shippedCount}
                </strong>
              </div>
            </div>


            <div className="admin-stat">
              <div className="admin-stat-icon delivered-icon">
                ✅
              </div>

              <div>
                <span>
                  Delivered
                </span>

                <strong>
                  {deliveredCount}
                </strong>
              </div>
            </div>

          </section>


          {/* =================================================
              ORDERS TITLE
          ================================================= */}

          <div className="admin-orders-heading">

            <div>
              <h2>
                Customer Orders
              </h2>

              <p>
                View and manage all customer orders.
              </p>
            </div>

            <button
              className="admin-refresh-button"
              onClick={loadOrders}
            >
              ↻ Refresh Orders
            </button>

          </div>


          {/* =================================================
              NO ORDERS
          ================================================= */}

          {orders.length === 0 ? (

            <div className="admin-empty">

              <div className="admin-empty-icon">
                📦
              </div>

              <h3>
                No Orders Yet
              </h3>

              <p>
                Customer orders will appear here.
              </p>

            </div>

          ) : (

            /* =================================================
               ORDER LIST
            ================================================= */

            <section className="admin-orders">

              {orders.map((order) => (

                <article
                  className="admin-order-card"
                  key={order.id}
                >

                  {/* =================================================
                      ORDER HEADER
                  ================================================= */}

                  <div className="admin-order-header">

                    <div>
                      <p className="admin-order-label">
                        ORDER ID
                      </p>

                      <h3>
                        #{order.id}
                      </h3>
                    </div>


                    {/* STATUS */}

                    <div className="admin-status-section">

                      <label
                        htmlFor={`status-${order.id}`}
                      >
                        ORDER STATUS
                      </label>

                      <select
                        id={`status-${order.id}`}
                        className={`admin-status-select status-${(
                          order.status || "PLACED"
                        ).toLowerCase()}`}
                        value={
                          order.status || "PLACED"
                        }
                        disabled={
                          updatingOrder === order.id
                        }
                        onChange={(e) =>
                          updateStatus(
                            order.id,
                            e.target.value
                          )
                        }
                      >

                        {statusOptions.map(
                          (status) => (
                            <option
                              key={status}
                              value={status}
                            >
                              {status}
                            </option>
                          )
                        )}

                      </select>

                      {updatingOrder === order.id && (
                        <span className="status-updating">
                          Updating...
                        </span>
                      )}

                    </div>

                  </div>


                  {/* =================================================
                      ORDER INFORMATION
                  ================================================= */}

                  <div className="admin-order-info">

                    <div className="admin-info-item">

                      <span>
                        Order Date
                      </span>

                      <strong>
                        {formatDate(
                          order.createdAt
                        )}
                      </strong>

                    </div>


                    <div className="admin-info-item">

                      <span>
                        Items
                      </span>

                      <strong>
                        {order.items
                          ? order.items.length
                          : 0}
                      </strong>

                    </div>


                    <div className="admin-info-item">

                      <span>
                        Total
                      </span>

                      <strong className="admin-total">
                        ₹
                        {formatMoney(
                          order.totalAmount
                        )}
                      </strong>

                    </div>

                  </div>


                  {/* =================================================
                      ORDER ITEMS
                  ================================================= */}

                  <div className="admin-items">

                    <div className="admin-items-heading">

                      <h4>
                        🛍️ Order Items
                      </h4>

                    </div>


                    {order.items &&
                    order.items.length > 0 ? (

                      order.items.map(
                        (item) => (

                          <div
                            className="admin-item"
                            key={item.id}
                          >

                            <div className="admin-item-icon">
                              🛍️
                            </div>


                            <div className="admin-item-details">

                              <strong>
                                {item.product?.name ||
                                  "Product"}
                              </strong>

                              <span>
                                {item.product?.description ||
                                  "ShopSphere product"}
                              </span>

                              <small>
                                Quantity:{" "}
                                {item.quantity}
                              </small>

                            </div>


                            <div className="admin-item-price">

                              <strong>
                                ₹
                                {formatMoney(
                                  item.price ??
                                    item.product?.price ??
                                    0
                                )}
                              </strong>

                              <span>
                                × {item.quantity}
                              </span>

                            </div>

                          </div>

                        )
                      )

                    ) : (

                      <p className="admin-no-items">
                        No items found.
                      </p>

                    )}

                  </div>


                  {/* =================================================
                      FOOTER
                  ================================================= */}

                  <div className="admin-order-footer">

                    <span>
                      Order #{order.id}
                    </span>

                    <strong>
                      Total: ₹
                      {formatMoney(
                        order.totalAmount
                      )}
                    </strong>

                  </div>

                </article>

              ))}

            </section>

          )}

        </>
      )}

    </main>
  );
}

export default AdminDashboard;