import { useEffect, useState } from "react";
import "./Products.css";

const API_URL = "http://localhost:8080/api";

const PAGE_SIZE = 6;

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

function Products() {
  // =========================================================
  // PRODUCTS
  // =========================================================

  const [products, setProducts] = useState([]);

  // =========================================================
  // LOADING / ERROR
  // =========================================================

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // =========================================================
  // ADD TO CART
  // =========================================================

  const [addingProduct, setAddingProduct] = useState(null);

  // =========================================================
  // SEARCH / FILTER
  // =========================================================

  const [searchName, setSearchName] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [searching, setSearching] = useState(false);

  // =========================================================
  // PAGINATION
  // =========================================================

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);

  // =========================================================
  // FILTERED RESULTS
  // =========================================================

  const [filteredResults, setFilteredResults] = useState(null);

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchProducts(0);
  }, []);

  // =========================================================
  // FETCH PRODUCTS
  // =========================================================

  const fetchProducts = async (page = 0) => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const token = localStorage.getItem("jwtToken");

      if (!token) {
        setError("You are not logged in.");
        return;
      }

      const response = await fetch(
        `${API_URL}/products?page=${page}&size=${PAGE_SIZE}&sort=id`,
        {
          method: "GET",
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

        throw new Error(
          `Failed to load products (${response.status})`
        );
      }

      const data = await response.json();

      const pageProducts = Array.isArray(data.content)
        ? data.content
        : [];

      setProducts(pageProducts);

      setCurrentPage(
        typeof data.number === "number"
          ? data.number
          : page
      );

      setTotalPages(
        typeof data.totalPages === "number"
          ? data.totalPages
          : 0
      );

      setTotalProducts(
        typeof data.totalElements === "number"
          ? data.totalElements
          : pageProducts.length
      );

      setFilteredResults(null);

    } catch (err) {
      console.error(
        "Product fetch error:",
        err
      );

      setError(
        err.message ||
          "Failed to load products."
      );

    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // DISPLAY FILTERED PAGE
  // =========================================================

  const displayFilteredPage = (
    results,
    page
  ) => {
    const total = results.length;

    const pages =
      total === 0
        ? 0
        : Math.ceil(total / PAGE_SIZE);

    const start =
      page * PAGE_SIZE;

    const end =
      start + PAGE_SIZE;

    const currentResults =
      results.slice(start, end);

    setProducts(currentResults);
    setCurrentPage(page);
    setTotalPages(pages);
    setTotalProducts(total);
  };

  // =========================================================
  // SEARCH / FILTER PRODUCTS
  // =========================================================

  const searchProducts = async () => {
    try {
      setSearching(true);
      setError("");
      setMessage("");

      const token =
        localStorage.getItem("jwtToken");

      if (!token) {
        setError("Please login first.");
        return;
      }

      // =====================================================
      // VALIDATE PRICES
      // =====================================================

      if (
        minPrice !== "" &&
        Number(minPrice) < 0
      ) {
        setError(
          "Minimum price cannot be negative."
        );
        return;
      }

      if (
        maxPrice !== "" &&
        Number(maxPrice) < 0
      ) {
        setError(
          "Maximum price cannot be negative."
        );
        return;
      }

      if (
        minPrice !== "" &&
        maxPrice !== "" &&
        Number(minPrice) >
          Number(maxPrice)
      ) {
        setError(
          "Minimum price cannot be greater than maximum price."
        );
        return;
      }

      // =====================================================
      // CHECK FILTERS
      // =====================================================

      const hasSearch =
        searchName.trim() !== "";

      const hasMinPrice =
        minPrice !== "";

      const hasMaxPrice =
        maxPrice !== "";

      const hasFilters =
        hasSearch ||
        hasMinPrice ||
        hasMaxPrice ||
        inStockOnly;

      // =====================================================
      // NO FILTERS
      // =====================================================

      if (!hasFilters) {
        await fetchProducts(0);
        return;
      }

      // =====================================================
      // ONLY IN-STOCK FILTER
      // =====================================================

      if (
        inStockOnly &&
        !hasSearch &&
        !hasMinPrice &&
        !hasMaxPrice
      ) {
        const response = await fetch(
          `${API_URL}/products/in-stock`,
          {
            method: "GET",
            headers: {
              Authorization:
                `Bearer ${token}`,
              Accept:
                "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to load in-stock products (${response.status})`
          );
        }

        const data =
          await response.json();

        const results =
          Array.isArray(data)
            ? data
            : [];

        setFilteredResults(results);

        displayFilteredPage(
          results,
          0
        );

        return;
      }

      // =====================================================
      // BUILD SEARCH URL
      // =====================================================

      const params =
        new URLSearchParams();

      if (hasSearch) {
        params.append(
          "name",
          searchName.trim()
        );
      }

      if (hasMinPrice) {
        params.append(
          "minPrice",
          minPrice
        );
      }

      if (hasMaxPrice) {
        params.append(
          "maxPrice",
          maxPrice
        );
      }

      const url =
        `${API_URL}/products/search?${params.toString()}`;

      // =====================================================
      // SEARCH API
      // =====================================================

      const response =
        await fetch(url, {
          method: "GET",
          headers: {
            Authorization:
              `Bearer ${token}`,
            Accept:
              "application/json",
          },
        });

      if (!response.ok) {

        if (response.status === 400) {
          const backendMessage =
            await response.text();

          throw new Error(
            backendMessage ||
              "Invalid search parameters."
          );
        }

        if (response.status === 401) {
          throw new Error(
            "Session expired. Please login again."
          );
        }

        throw new Error(
          `Search failed (${response.status})`
        );
      }

      const data =
        await response.json();

      let results =
        Array.isArray(data)
          ? data
          : [];

      // =====================================================
      // IN-STOCK FILTER
      // =====================================================

      if (inStockOnly) {
        results =
          results.filter(
            (product) =>
              product.stockQuantity > 0
          );
      }

      setFilteredResults(results);

      displayFilteredPage(
        results,
        0
      );

    } catch (err) {

      console.error(
        "Product search error:",
        err
      );

      setError(
        err.message ||
          "Failed to search products."
      );

    } finally {
      setSearching(false);
    }
  };

  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  const clearFilters =
    async () => {

      setSearchName("");
      setMinPrice("");
      setMaxPrice("");
      setInStockOnly(false);

      setError("");
      setMessage("");

      setFilteredResults(null);

      await fetchProducts(0);
    };

  // =========================================================
  // SEARCH ON ENTER
  // =========================================================

  const handleSearchKeyDown =
    (event) => {

      if (event.key === "Enter") {
        searchProducts();
      }
    };

  // =========================================================
  // PAGINATION
  // =========================================================

  const goToPage =
    async (page) => {

      if (
        page < 0 ||
        page >= totalPages ||
        page === currentPage
      ) {
        return;
      }

      if (
        filteredResults !== null
      ) {

        displayFilteredPage(
          filteredResults,
          page
        );

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        return;
      }

      await fetchProducts(page);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

  // =========================================================
  // ADD TO CART
  // =========================================================

  const addToCart =
    async (productId) => {

      try {

        setAddingProduct(
          productId
        );

        setMessage("");
        setError("");

        const token =
          localStorage.getItem(
            "jwtToken"
          );

        if (!token) {
          setError(
            "Please login first."
          );
          return;
        }

        const response =
          await fetch(
            `${API_URL}/cart/add?productId=${productId}&quantity=1`,
            {
              method: "POST",
              headers: {
                Authorization:
                  `Bearer ${token}`,
                Accept:
                  "application/json",
              },
            }
          );

        if (!response.ok) {

          if (
            response.status === 400
          ) {

            const backendMessage =
              await response.text();

            throw new Error(
              backendMessage ||
                "Unable to add product to cart."
            );
          }

          if (
            response.status === 401
          ) {
            throw new Error(
              "Session expired. Please login again."
            );
          }

          throw new Error(
            `Failed to add product (${response.status})`
          );
        }

        await response.json();

        setMessage(
          "Product added to cart! 🛒"
        );

        setTimeout(() => {
          setMessage("");
        }, 2000);

      } catch (err) {

        console.error(
          "Add to cart error:",
          err
        );

        setError(
          err.message ||
            "Failed to add product to cart."
        );

      } finally {

        setAddingProduct(null);
      }
    };

  // =========================================================
  // FORMAT PRICE
  // =========================================================

  const formatPrice =
    (price) => {

      return Number(
        price || 0
      ).toLocaleString(
        "en-IN",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      );
    };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (
      <div className="products-page">

        <div className="products-loading">

          <div className="products-loading-icon">
            🛍️
          </div>

          <h2>
            Loading Products...
          </h2>

          <p>
            Please wait while we fetch
            our collection.
          </p>

        </div>

      </div>
    );
  }

  // =========================================================
  // MAIN PAGE
  // =========================================================

  return (
    <div className="products-page">

      {/* HEADER */}

      <div className="products-header">

        <p className="products-small-title">
          SHOPSPHERE COLLECTION
        </p>

        <h1>
          Discover Products
        </h1>

        <p>
          Find something you'll love.
        </p>

      </div>

      {/* SEARCH & FILTER */}

      <div className="product-filters">

        <div className="filter-title">

          <span className="filter-icon">
            🔍
          </span>

          <h3>
            Find Products
          </h3>

        </div>

        {/* SEARCH BY NAME */}

        <div className="search-box">

          <label>
            Search by name
          </label>

          <input
            type="text"
            placeholder="e.g. Wireless Headphones"
            value={searchName}
            onChange={(e) =>
              setSearchName(
                e.target.value
              )
            }
            onKeyDown={
              handleSearchKeyDown
            }
          />

        </div>

        {/* PRICE FILTERS */}

        <div className="price-filter-row">

          <div className="price-filter">

            <label>
              Minimum Price (₹)
            </label>

            <input
              type="number"
              min="0"
              placeholder="Min price"
              value={minPrice}
              onChange={(e) =>
                setMinPrice(
                  e.target.value
                )
              }
              onKeyDown={
                handleSearchKeyDown
              }
            />

          </div>

          <div className="price-filter">

            <label>
              Maximum Price (₹)
            </label>

            <input
              type="number"
              min="0"
              placeholder="Max price"
              value={maxPrice}
              onChange={(e) =>
                setMaxPrice(
                  e.target.value
                )
              }
              onKeyDown={
                handleSearchKeyDown
              }
            />

          </div>

        </div>

        {/* STOCK FILTER */}

        <label className="stock-filter">

          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) =>
              setInStockOnly(
                e.target.checked
              )
            }
          />

          <span>
            Show only products in stock
          </span>

        </label>

        {/* BUTTONS */}

        <div className="filter-buttons">

          <button
            className="search-products-button"
            onClick={
              searchProducts
            }
            disabled={searching}
          >
            {searching
              ? "Searching..."
              : "🔍 Search Products"}
          </button>

          <button
            className="clear-filters-button"
            onClick={
              clearFilters
            }
            disabled={searching}
          >
            ↻ Clear Filters
          </button>

        </div>

      </div>

      {/* SUCCESS MESSAGE */}

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      {/* ERROR MESSAGE */}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* RESULT COUNT */}

      <div className="products-result-info">

        <span>
          {totalProducts}{" "}
          {totalProducts === 1
            ? "product"
            : "products"}{" "}
          found
        </span>

      </div>

      {/* NO PRODUCTS */}

      {products.length === 0 ? (

        <div className="no-products">

          <div className="no-products-icon">
            🔎
          </div>

          <h3>
            No Products Found
          </h3>

          <p>
            Try changing your search
            or price filters.
          </p>

          <button
            className="clear-filters-button"
            onClick={
              clearFilters
            }
          >
            Show All Products
          </button>

        </div>

      ) : (

        <>

          {/* PRODUCT GRID */}

          <div className="products-grid">

            {products.map(
              (product) => {

                const image =
                  getProductImage(
                    product
                  );

                return (

                  <div
                    className="product-card"
                    key={product.id}
                  >

                    {/* PRODUCT IMAGE */}

                    <div className="product-image">

                      {image && (
                        <img
                          src={image}
                          alt={product.name}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display =
                              "none";
                          }}
                        />
                      )}

                    </div>

                    {/* PRODUCT DETAILS */}

                    <div className="product-details">

                      <div className="product-top">

                        <h2>
                          {product.name}
                        </h2>

                      </div>

                      <p className="product-description">

                        {product.description ||
                          "Quality product from ShopSphere."}

                      </p>

                      {/* PRICE */}

                      <div className="product-price">

                        ₹
                        {formatPrice(
                          product.price
                        )}

                      </div>

                      {/* STOCK */}

                      <div
                        className={
                          product.stockQuantity >
                          0
                            ? "stock stock-available"
                            : "stock stock-unavailable"
                        }
                      >

                        <span className="stock-dot">
                          ●
                        </span>

                        {product.stockQuantity >
                        0
                          ? `In stock · ${product.stockQuantity} available`
                          : "Out of stock"}

                      </div>

                      {/* ADD TO CART */}

                      {product.stockQuantity >
                      0 ? (

                        <button
                          className="add-cart-button"
                          onClick={() =>
                            addToCart(
                              product.id
                            )
                          }
                          disabled={
                            addingProduct ===
                            product.id
                          }
                        >

                          {addingProduct ===
                          product.id
                            ? "Adding..."
                            : "Add to Cart 🛒"}

                        </button>

                      ) : (

                        <button
                          className="add-cart-button disabled"
                          disabled
                        >
                          Out of Stock
                        </button>

                      )}

                    </div>

                  </div>

                );
              }
            )}

          </div>

          {/* PAGINATION */}

          {totalPages > 1 && (

            <div className="products-pagination">

              <button
                className="pagination-button"
                onClick={() =>
                  goToPage(
                    currentPage - 1
                  )
                }
                disabled={
                  currentPage === 0
                }
              >
                ← Previous
              </button>

              <div className="pagination-numbers">

                {Array.from(
                  {
                    length:
                      totalPages,
                  },
                  (_, index) => (

                    <button
                      key={index}
                      className={
                        `pagination-number ${
                          currentPage ===
                          index
                            ? "active"
                            : ""
                        }`
                      }
                      onClick={() =>
                        goToPage(
                          index
                        )
                      }
                    >
                      {index + 1}
                    </button>

                  )
                )}

              </div>

              <button
                className="pagination-button"
                onClick={() =>
                  goToPage(
                    currentPage + 1
                  )
                }
                disabled={
                  currentPage ===
                  totalPages - 1
                }
              >
                Next →
              </button>

            </div>

          )}

          {/* PAGINATION INFORMATION */}

          {totalPages > 1 && (

            <div className="pagination-info">

              Showing{" "}

              <strong>
                {currentPage *
                  PAGE_SIZE +
                  1}
              </strong>

              {" "}–{" "}

              <strong>
                {Math.min(
                  (currentPage + 1) *
                    PAGE_SIZE,
                  totalProducts
                )}
              </strong>

              {" "}of{" "}

              <strong>
                {totalProducts}
              </strong>

              {" "}products

            </div>

          )}

        </>

      )}

    </div>
  );
}

export default Products;