import { useEffect, useState } from "react";
import "./App.css";

import Products from "./Products";
import Cart from "./Cart";
import Checkout from "./Checkout";
import Orders from "./Orders";
import AdminDashboard from "./AdminDashboard";

const API_URL = "http://localhost:8080/api";

// =========================================================
// PRODUCT IMAGE MAPPING
// =========================================================

const productImages = {
  "AeroSound Wireless Headphones": "/products/headphones.jpg",
  "Nova Wireless Earbuds": "/products/earbuds.jpg",
  "KeyPro Mechanical Keyboard": "/products/keyboard.jpg",
  "SwiftClick Wireless Mouse": "/products/mouse.jpg",
  "VisionMax Smart TV": "/products/smart-tv.jpg",
  "VoltCharge Power Bank": "/products/power-bank.jpg",
  "GlowDesk LED Lamp": "/products/led-lamp.jpg",
  "SoundPod Bluetooth Speaker": "/products/bluetooth-speaker.jpg",
  "FlexFit Laptop Stand": "/products/laptop-stand.jpg",
};

// =========================================================
// GET PRODUCT IMAGE
// =========================================================

const getProductImage = (product) => {
  if (product?.imageUrl) {
    const imageUrl = String(product.imageUrl).trim();

    if (
      imageUrl.startsWith("http://") ||
      imageUrl.startsWith("https://") ||
      imageUrl.startsWith("/")
    ) {
      return imageUrl;
    }

    return `/products/${imageUrl}`;
  }

  return productImages[product?.name] || null;
};

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("jwtToken")
  );

  // =========================================================
  // ADMIN
  // =========================================================

  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(false);

  // =========================================================
  // CURRENT PAGE
  // =========================================================

  const [currentPage, setCurrentPage] = useState("home");

  // =========================================================
  // FEATURED PRODUCTS
  // =========================================================

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(false);

  // =========================================================
  // CHECK ADMIN ACCESS
  // =========================================================

  const checkAdminAccess = async () => {
    const token = localStorage.getItem("jwtToken");

    if (!token) {
      setIsAdmin(false);
      return false;
    }

    try {
      setCheckingAdmin(true);

      const response = await fetch(`${API_URL}/admin/test`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (response.ok) {
        setIsAdmin(true);
        return true;
      }

      if (response.status === 401) {
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("username");

        setIsLoggedIn(false);
        setIsAdmin(false);
        setCurrentPage("home");

        return false;
      }

      if (response.status === 403) {
        setIsAdmin(false);
        return false;
      }

      setIsAdmin(false);
      return false;
    } catch (err) {
      console.error("Admin access check failed:", err);

      setIsAdmin(false);
      return false;
    } finally {
      setCheckingAdmin(false);
    }
  };

  // =========================================================
  // LOAD FEATURED PRODUCTS
  // =========================================================

  const loadFeaturedProducts = async () => {
    const token = localStorage.getItem("jwtToken");

    if (!token) {
      setFeaturedProducts([]);
      return;
    }

    try {
      setFeaturedLoading(true);

      const response = await fetch(
        `${API_URL}/products?page=0&size=4&sort=id`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        console.error(
          "Failed to load featured products:",
          response.status
        );

        setFeaturedProducts([]);
        return;
      }

      const data = await response.json();

      const products = Array.isArray(data.content)
        ? data.content
        : [];

      setFeaturedProducts(products);
    } catch (err) {
      console.error("Featured product fetch error:", err);

      setFeaturedProducts([]);
    } finally {
      setFeaturedLoading(false);
    }
  };

  // =========================================================
  // CHECK ADMIN + LOAD PRODUCTS
  // =========================================================

  useEffect(() => {
    if (isLoggedIn) {
      checkAdminAccess();
      loadFeaturedProducts();
    } else {
      setIsAdmin(false);
      setFeaturedProducts([]);
    }
  }, [isLoggedIn]);

  // =========================================================
  // PROTECT ADMIN PAGE
  // =========================================================

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    if (
      !checkingAdmin &&
      currentPage === "admin" &&
      !isAdmin
    ) {
      setCurrentPage("home");
    }
  }, [
    isLoggedIn,
    isAdmin,
    checkingAdmin,
    currentPage,
  ]);

  // =========================================================
  // LOGIN
  // =========================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/users/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Invalid username or password."
          );
        }

        throw new Error(
          `Login failed (${response.status}).`
        );
      }

      const token = await response.text();

      if (!token || token.trim() === "") {
        throw new Error(
          "Login failed. Server returned an empty token."
        );
      }

      localStorage.setItem(
        "jwtToken",
        token
      );

      localStorage.setItem(
        "username",
        username
      );

      setIsLoggedIn(true);
      setCurrentPage("home");
      setPassword("");

      const admin = await checkAdminAccess();

      console.log(
        admin
          ? "Logged in as ADMIN."
          : "Logged in as normal USER."
      );

      alert("Login successful! 🎉");
    } catch (err) {
      console.error("Login error:", err);

      setError(
        err.message || "Login failed."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("username");

    setIsLoggedIn(false);
    setIsAdmin(false);

    setUsername("");
    setPassword("");

    setCurrentPage("home");
    setError("");
    setFeaturedProducts([]);
  };

  // =========================================================
  // FORMAT PRICE
  // =========================================================

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  };

  // =========================================================
  // LOGGED-IN SHOPSPHERE
  // =========================================================

  if (isLoggedIn) {
    const loggedInUser =
      localStorage.getItem("username") || "User";

    return (
      <div className="shop-page">

        {/* NAVBAR */}

        <nav className="navbar">

          <div className="brand">
            <h1>ShopSphere</h1>
          </div>

          <div className="nav-links">

            <button
              onClick={() =>
                setCurrentPage("home")
              }
            >
              Home
            </button>

            <button
              onClick={() =>
                setCurrentPage("products")
              }
            >
              Products
            </button>

            <button
              onClick={() =>
                setCurrentPage("cart")
              }
            >
              Cart 🛒
            </button>

            <button
              onClick={() =>
                setCurrentPage("orders")
              }
            >
              My Orders
            </button>

            {isAdmin && (
              <button
                onClick={() =>
                  setCurrentPage("admin")
                }
              >
                Admin 🔧
              </button>
            )}

            <button
              className="logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>

        </nav>

        {/* ADMIN CHECK */}

        {checkingAdmin && (
          <div
            style={{
              textAlign: "center",
              padding: "10px",
              fontSize: "13px",
              color: "#888",
            }}
          >
            Checking account permissions...
          </div>
        )}

        {/* PRODUCTS */}

        {currentPage === "products" && (
          <Products />
        )}

        {/* CART */}

        {currentPage === "cart" && (
          <Cart
            onCheckout={() =>
              setCurrentPage("checkout")
            }
          />
        )}

        {/* CHECKOUT */}

        {currentPage === "checkout" && (
          <Checkout
            onOrderPlaced={() =>
              setCurrentPage("orders")
            }
          />
        )}

        {/* ORDERS */}

        {currentPage === "orders" && (
          <Orders />
        )}

        {/* ADMIN */}

        {currentPage === "admin" && (
          isAdmin ? (
            <AdminDashboard />
          ) : (
            <main className="home-content">

              <div className="welcome-section">

                <p className="welcome-small">
                  ACCESS DENIED
                </p>

                <h2>
                  Admin Access Required 🔒
                </h2>

                <p>
                  You do not have permission
                  to access the Admin Dashboard.
                </p>

                <button
                  className="shop-button"
                  onClick={() =>
                    setCurrentPage("home")
                  }
                >
                  Go Home →
                </button>

              </div>

            </main>
          )
        )}

        {/* HOME PAGE */}

        {currentPage === "home" && (

          <main className="home-content">

            {/* HERO */}

            <div className="welcome-section">

              <p className="welcome-small">
                WELCOME BACK 👋
              </p>

              <h2>
                Hello, {loggedInUser}!
              </h2>

              <p>
                Discover great products and
                enjoy a simple shopping
                experience with ShopSphere.
              </p>

              <button
                className="shop-button"
                onClick={() =>
                  setCurrentPage("products")
                }
              >
                Shop Now →
              </button>

            </div>

            {/* FEATURED PRODUCTS */}

            <section
              style={{
                marginTop: "55px",
              }}
            >

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  marginBottom: "22px",
                }}
              >

                <div>

                  <p
                    style={{
                      color: "#7c3cff",
                      fontSize: "12px",
                      fontWeight: "800",
                      letterSpacing: "4px",
                      marginBottom: "8px",
                    }}
                  >
                    SHOPSPHERE COLLECTION
                  </p>

                  <h2
                    style={{
                      margin: 0,
                      fontSize: "30px",
                    }}
                  >
                    Featured Products 🛍️
                  </h2>

                </div>

                <button
                  onClick={() =>
                    setCurrentPage("products")
                  }
                  style={{
                    background: "none",
                    border: "none",
                    color: "#8b5cf6",
                    fontSize: "15px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  View All →
                </button>

              </div>

              {/* LOADING */}

              {featuredLoading && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#aaa",
                  }}
                >
                  Loading products...
                </div>
              )}

              {/* FEATURED PRODUCTS */}

              {!featuredLoading &&
                featuredProducts.length > 0 && (

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(4, minmax(0, 1fr))",
                      gap: "18px",
                    }}
                  >

                    {featuredProducts.map(
                      (product) => {

                        const image =
                          getProductImage(product);

                        return (
                          <div
                            key={product.id}
                            style={{
                              background: "#ffffff",
                              borderRadius: "18px",
                              padding: "20px",
                              minHeight: "360px",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent:
                                "space-between",
                              boxShadow:
                                "0 8px 30px rgba(0,0,0,0.08)",
                              overflow: "hidden",
                            }}
                          >

                            {/* PRODUCT IMAGE */}

                            <div
                              style={{
                                height: "180px",
                                width: "100%",
                                borderRadius: "14px",
                                background:
                                  "linear-gradient(135deg, #f5f1ff, #eee8ff)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent:
                                  "center",
                                marginBottom: "18px",
                                overflow: "hidden",
                                position: "relative",
                              }}
                            >

                              <span
                                style={{
                                  position: "absolute",
                                  fontSize: "52px",
                                  opacity: 0.9,
                                }}
                              >
                                🛍️
                              </span>

                              {image && (
                                <img
                                  src={image}
                                  alt={product.name}
                                  loading="eager"
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "contain",
                                    padding: "10px",
                                    boxSizing:
                                      "border-box",
                                    position:
                                      "relative",
                                    zIndex: 1,
                                    display: "block",
                                  }}
                                  onError={(e) => {
                                    e.currentTarget.style.display =
                                      "none";
                                  }}
                                />
                              )}

                            </div>

                            {/* PRODUCT DETAILS */}

                            <div>

                              <h3
                                style={{
                                  color: "#17131f",
                                  fontSize: "18px",
                                  lineHeight: "1.3",
                                  margin:
                                    "0 0 8px",
                                }}
                              >
                                {product.name}
                              </h3>

                              <p
                                style={{
                                  color: "#777",
                                  fontSize: "13px",
                                  lineHeight: "1.5",
                                  margin:
                                    "0 0 15px",
                                  minHeight: "40px",
                                }}
                              >
                                {product.description ||
                                  "Quality product from ShopSphere."}
                              </p>

                              <div
                                style={{
                                  color: "#6332ff",
                                  fontSize: "20px",
                                  fontWeight: "800",
                                }}
                              >
                                ₹
                                {formatPrice(
                                  product.price
                                )}
                              </div>

                            </div>

                          </div>
                        );
                      }
                    )}

                  </div>
                )}

              {/* NO PRODUCTS */}

              {!featuredLoading &&
                featuredProducts.length === 0 && (

                  <div
                    style={{
                      textAlign: "center",
                      padding: "30px",
                      color: "#aaa",
                    }}
                  >
                    Products will appear here once
                    they are available.
                  </div>

                )}

            </section>

            {/* QUICK ACCESS */}

            <section
              style={{
                marginTop: "55px",
              }}
            >

              <p
                style={{
                  color: "#7c3cff",
                  fontSize: "12px",
                  fontWeight: "800",
                  letterSpacing: "4px",
                  marginBottom: "8px",
                }}
              >
                QUICK ACCESS
              </p>

              <h2
                style={{
                  marginTop: 0,
                  marginBottom: "22px",
                  fontSize: "30px",
                }}
              >
                Your ShopSphere
              </h2>

              <div className="feature-section">

                <div
                  className="feature-card"
                  onClick={() =>
                    setCurrentPage("cart")
                  }
                  style={{
                    cursor: "pointer",
                  }}
                >

                  <div className="feature-icon">
                    🛒
                  </div>

                  <h3>
                    Your Cart
                  </h3>

                  <p>
                    Review items and checkout.
                  </p>

                </div>

                <div
                  className="feature-card"
                  onClick={() =>
                    setCurrentPage("orders")
                  }
                  style={{
                    cursor: "pointer",
                  }}
                >

                  <div className="feature-icon">
                    📦
                  </div>

                  <h3>
                    Your Orders
                  </h3>

                  <p>
                    Track your purchases.
                  </p>

                </div>

                {isAdmin && (

                  <div
                    className="feature-card"
                    onClick={() =>
                      setCurrentPage("admin")
                    }
                    style={{
                      cursor: "pointer",
                    }}
                  >

                    <div className="feature-icon">
                      🔧
                    </div>

                    <h3>
                      Admin Dashboard
                    </h3>

                    <p>
                      Manage products and
                      customer orders.
                    </p>

                  </div>

                )}

              </div>

            </section>

          </main>
        )}

      </div>
    );
  }

  // =========================================================
  // LOGIN PAGE
  // =========================================================

  return (
    <div className="login-page">

      <div className="login-card">

        <div className="brand">

          <h1>
            ShopSphere
          </h1>

          <p>
            Shop smart. Shop better.
          </p>

        </div>

        <div className="login-content">

          <h2>
            Welcome Back 👋
          </h2>

          <p className="subtitle">
            Login to continue shopping
          </p>

          <form
            onSubmit={handleLogin}
          >

            <div className="input-group">

              <label>
                Username
              </label>

              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value
                  )
                }
                required
              />

            </div>

            <div className="input-group">

              <label>
                Password
              </label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                required
              />

            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="login-button"
            >
              {loading
                ? "Logging in..."
                : "Login"}
            </button>

          </form>

          <p className="demo-note">
            Secure login powered by JWT
            authentication
          </p>

        </div>

      </div>

    </div>
  );
}

export default App;