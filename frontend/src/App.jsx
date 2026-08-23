import { useEffect, useState } from "react";
import "./App.css";

import Products from "./Products";
import Cart from "./Cart";
import Checkout from "./Checkout";
import Orders from "./Orders";
import AdminDashboard from "./AdminDashboard";

const API_URL = "http://localhost:8080/api";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("jwtToken")
  );

  // ==========================================
  // ADMIN ACCESS
  // ==========================================

  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(false);

  // ==========================================
  // CURRENT PAGE
  // ==========================================

  const [currentPage, setCurrentPage] = useState("home");

  // ==========================================
  // CHECK ADMIN ACCESS
  // ==========================================

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
        console.log("Admin access confirmed.");
        setIsAdmin(true);
        return true;
      }

      if (response.status === 401) {
        console.log("JWT is invalid or expired.");

        localStorage.removeItem("jwtToken");
        localStorage.removeItem("username");

        setIsLoggedIn(false);
        setIsAdmin(false);
        setCurrentPage("home");

        return false;
      }

      if (response.status === 403) {
        console.log("User is logged in but is not an ADMIN.");
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

  // ==========================================
  // CHECK ADMIN WHEN LOGIN STATE CHANGES
  // ==========================================

  useEffect(() => {
    if (isLoggedIn) {
      checkAdminAccess();
    } else {
      setIsAdmin(false);
    }
  }, [isLoggedIn]);

  // ==========================================
  // PROTECT ADMIN PAGE
  // ==========================================

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    if (!checkingAdmin && currentPage === "admin" && !isAdmin) {
      setCurrentPage("home");
    }
  }, [
    isLoggedIn,
    isAdmin,
    checkingAdmin,
    currentPage,
  ]);

  // ==========================================
  // LOGIN
  // ==========================================

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid username or password.");
        }

        throw new Error(
          `Login failed (${response.status}).`
        );
      }

      const token = await response.text();

      if (!token || token.trim() === "") {
        throw new Error("Login failed. Server returned an empty token.");
      }

      // ========================================
      // SAVE JWT
      // ========================================

      localStorage.setItem(
        "jwtToken",
        token
      );

      // ========================================
      // SAVE USERNAME
      // ========================================

      localStorage.setItem(
        "username",
        username
      );

      console.log("JWT saved successfully.");

      // ========================================
      // UPDATE LOGIN STATE
      // ========================================

      setIsLoggedIn(true);
      setCurrentPage("home");

      // Clear old login form values
      setPassword("");

      // ========================================
      // CHECK ADMIN ACCESS
      // ========================================

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

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("username");

    setIsLoggedIn(false);
    setIsAdmin(false);

    setUsername("");
    setPassword("");

    setCurrentPage("home");
    setError("");
  };

  // ==========================================
  // LOGGED-IN SHOPSPHERE
  // ==========================================

  if (isLoggedIn) {
    const loggedInUser =
      localStorage.getItem("username") || "User";

    return (
      <div className="shop-page">

        {/* =====================================
            NAVBAR
        ===================================== */}

        <nav className="navbar">

          {/* BRAND */}

          <div className="brand">
            <h1>
              ShopSphere
            </h1>
          </div>


          {/* NAVIGATION */}

          <div className="nav-links">

            {/* HOME */}

            <button
              onClick={() =>
                setCurrentPage("home")
              }
            >
              Home
            </button>


            {/* PRODUCTS */}

            <button
              onClick={() =>
                setCurrentPage("products")
              }
            >
              Products
            </button>


            {/* CART */}

            <button
              onClick={() =>
                setCurrentPage("cart")
              }
            >
              Cart 🛒
            </button>


            {/* MY ORDERS */}

            <button
              onClick={() =>
                setCurrentPage("orders")
              }
            >
              My Orders
            </button>


            {/* =================================
                ADMIN BUTTON

                ONLY ADMIN CAN SEE THIS
            ================================= */}

            {isAdmin && (
              <button
                onClick={() =>
                  setCurrentPage("admin")
                }
              >
                Admin 🔧
              </button>
            )}


            {/* LOGOUT */}

            <button
              className="logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>

        </nav>


        {/* =====================================
            ADMIN CHECK LOADING
        ===================================== */}

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


        {/* =====================================
            PRODUCTS
        ===================================== */}

        {currentPage === "products" && (
          <Products />
        )}


        {/* =====================================
            CART
        ===================================== */}

        {currentPage === "cart" && (
          <Cart
            onCheckout={() =>
              setCurrentPage("checkout")
            }
          />
        )}


        {/* =====================================
            CHECKOUT
        ===================================== */}

        {currentPage === "checkout" && (
          <Checkout
            onOrderPlaced={() =>
              setCurrentPage("orders")
            }
          />
        )}


        {/* =====================================
            ORDERS
        ===================================== */}

        {currentPage === "orders" && (
          <Orders />
        )}


        {/* =====================================
            ADMIN DASHBOARD
        ===================================== */}

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


        {/* =====================================
            HOME
        ===================================== */}

        {currentPage === "home" && (
          <main className="home-content">

            {/* =================================
                WELCOME
            ================================= */}

            <div className="welcome-section">

              <p className="welcome-small">
                WELCOME BACK 👋
              </p>

              <h2>
                Hello, {loggedInUser}!
              </h2>

              <p>
                Welcome to ShopSphere.
                Your shopping experience
                starts here.
              </p>

              <button
                className="shop-button"
                onClick={() =>
                  setCurrentPage("products")
                }
              >
                Start Shopping →
              </button>

            </div>


            {/* =================================
                FEATURE CARDS
            ================================= */}

            <div className="feature-section">

              {/* PRODUCTS */}

              <div
                className="feature-card"
                onClick={() =>
                  setCurrentPage("products")
                }
                style={{
                  cursor: "pointer",
                }}
              >

                <div className="feature-icon">
                  🛍️
                </div>

                <h3>
                  Explore Products
                </h3>

                <p>
                  Discover products available
                  in our store.
                </p>

              </div>


              {/* CART */}

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
                  Add products and manage
                  your shopping cart.
                </p>

              </div>


              {/* ORDERS */}

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
                  Track and manage your
                  previous orders.
                </p>

              </div>


              {/* =================================
                  ADMIN CARD
                  ONLY ADMIN
              ================================= */}

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
                    Manage customer orders
                    and update order status.
                  </p>

                </div>
              )}

            </div>

          </main>
        )}

      </div>
    );
  }


  // ==========================================
  // LOGIN PAGE
  // ==========================================

  return (
    <div className="login-page">

      <div className="login-card">

        {/* =====================================
            BRAND
        ===================================== */}

        <div className="brand">

          <h1>
            ShopSphere
          </h1>

          <p>
            Shop smart. Shop better.
          </p>

        </div>


        {/* =====================================
            LOGIN CONTENT
        ===================================== */}

        <div className="login-content">

          <h2>
            Welcome Back 👋
          </h2>

          <p className="subtitle">
            Login to continue shopping
          </p>


          {/* =================================
              LOGIN FORM
          ================================= */}

          <form
            onSubmit={handleLogin}
          >

            {/* USERNAME */}

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


            {/* PASSWORD */}

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


            {/* ERROR */}

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}


            {/* LOGIN BUTTON */}

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


          {/* SECURITY MESSAGE */}

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