import { useEffect, useState } from "react";
import "./AdminProducts.css";

const API_URL = "http://localhost:8080/api";

function AdminProducts() {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [saving, setSaving] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);

  // ==========================================
  // FORM
  // ==========================================

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stockQuantity: "",
  });

  // ==========================================
  // LOAD PRODUCTS
  // ==========================================

  const loadProducts = async () => {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("jwtToken");

    if (!token) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/products?page=0&size=100&sort=id`,
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

        if (response.status === 403) {
          throw new Error(
            "You do not have permission to view products."
          );
        }

        throw new Error(
          `Failed to load products (${response.status})`
        );
      }

      const data = await response.json();

      /*
       * Spring Boot Page<Product> returns:
       *
       * {
       *   content: [...],
       *   totalElements: ...
       * }
       */

      setProducts(
        Array.isArray(data.content)
          ? data.content
          : []
      );

    } catch (err) {
      console.error(
        "Admin products error:",
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

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    loadProducts();
  }, []);

  // ==========================================
  // HANDLE FORM INPUT
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // RESET FORM
  // ==========================================

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      stockQuantity: "",
    });

    setEditingProduct(null);
  };

  // ==========================================
  // CREATE PRODUCT
  // ==========================================

  const createProduct = async () => {
    const token =
      localStorage.getItem("jwtToken");

    if (!token) {
      setError("Session expired. Please login again.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/products`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },

          body: JSON.stringify({
            name: formData.name.trim(),

            description:
              formData.description.trim(),

            price: Number(formData.price),

            stockQuantity:
              Number(formData.stockQuantity),
          }),
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
            "Only ADMIN users can create products."
          );
        }

        const message =
          await response.text();

        throw new Error(
          message ||
            `Failed to create product (${response.status})`
        );
      }

      await response.json();

      setSuccess(
        "Product created successfully! 🎉"
      );

      resetForm();

      await loadProducts();

    } catch (err) {
      console.error(
        "Create product error:",
        err
      );

      setError(
        err.message ||
          "Failed to create product."
      );

    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // UPDATE PRODUCT
  // ==========================================

  const updateProduct = async () => {
    if (!editingProduct) {
      return;
    }

    const token =
      localStorage.getItem("jwtToken");

    if (!token) {
      setError("Session expired. Please login again.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/products/${editingProduct.id}`,
        {
          method: "PUT",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },

          body: JSON.stringify({
            name: formData.name.trim(),

            description:
              formData.description.trim(),

            price: Number(formData.price),

            stockQuantity:
              Number(formData.stockQuantity),
          }),
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
            "Only ADMIN users can update products."
          );
        }

        if (response.status === 404) {
          throw new Error(
            "Product not found."
          );
        }

        const message =
          await response.text();

        throw new Error(
          message ||
            `Failed to update product (${response.status})`
        );
      }

      await response.json();

      setSuccess(
        "Product updated successfully! ✅"
      );

      resetForm();

      await loadProducts();

    } catch (err) {
      console.error(
        "Update product error:",
        err
      );

      setError(
        err.message ||
          "Failed to update product."
      );

    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // DELETE PRODUCT
  // ==========================================

  const deleteProduct = async (product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) {
      return;
    }

    const token =
      localStorage.getItem("jwtToken");

    if (!token) {
      setError("Session expired. Please login again.");
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/products/${product.id}`,
        {
          method: "DELETE",

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
            "Only ADMIN users can delete products."
          );
        }

        if (response.status === 404) {
          throw new Error(
            "Product not found."
          );
        }

        throw new Error(
          `Failed to delete product (${response.status})`
        );
      }

      setSuccess(
        "Product deleted successfully! 🗑️"
      );

      if (
        editingProduct &&
        editingProduct.id === product.id
      ) {
        resetForm();
      }

      await loadProducts();

    } catch (err) {
      console.error(
        "Delete product error:",
        err
      );

      setError(
        err.message ||
          "Failed to delete product."
      );
    }
  };

  // ==========================================
  // START EDITING
  // ==========================================

  const startEditing = (product) => {
    setEditingProduct(product);

    setFormData({
      name: product.name || "",

      description:
        product.description || "",

      price:
        product.price !== undefined
          ? String(product.price)
          : "",

      stockQuantity:
        product.stockQuantity !== undefined
          ? String(product.stockQuantity)
          : "",
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // FORM SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Basic frontend validation

    if (!formData.name.trim()) {
      setError(
        "Product name cannot be empty."
      );
      return;
    }

    if (!formData.description.trim()) {
      setError(
        "Product description cannot be empty."
      );
      return;
    }

    if (
      formData.price === "" ||
      Number(formData.price) <= 0
    ) {
      setError(
        "Price must be greater than 0."
      );
      return;
    }

    if (
      formData.stockQuantity === "" ||
      Number(formData.stockQuantity) < 0
    ) {
      setError(
        "Stock quantity cannot be negative."
      );
      return;
    }

    if (editingProduct) {
      await updateProduct();
    } else {
      await createProduct();
    }
  };

  // ==========================================
  // FORMAT MONEY
  // ==========================================

  const formatMoney = (amount) => {
    return Number(
      amount || 0
    ).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="admin-products-page">

        <div className="admin-products-header">

          <p className="admin-label">
            PRODUCT MANAGEMENT
          </p>

          <h2>
            Manage Products 🛍️
          </h2>

          <p>
            Loading products...
          </p>

        </div>

      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="admin-products-page">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="admin-products-header">

        <p className="admin-label">
          SHOPSPHERE ADMIN
        </p>

        <h2>
          Product Management 🛍️
        </h2>

        <p>
          Add, edit and remove products from
          your store.
        </p>

      </div>


      {/* ======================================
          SUCCESS MESSAGE
      ====================================== */}

      {success && (
        <div className="admin-success">
          {success}
        </div>
      )}


      {/* ======================================
          ERROR MESSAGE
      ====================================== */}

      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}


      {/* ======================================
          PRODUCT FORM
      ====================================== */}

      <div className="admin-product-form-card">

        <div className="admin-product-form-header">

          <div>

            <p className="admin-order-label">
              {editingProduct
                ? "EDIT PRODUCT"
                : "NEW PRODUCT"}
            </p>

            <h3>
              {editingProduct
                ? `Edit ${editingProduct.name}`
                : "Add New Product"}
            </h3>

          </div>

          {editingProduct && (
            <button
              type="button"
              className="admin-secondary-button"
              onClick={resetForm}
            >
              Cancel Edit
            </button>
          )}

        </div>


        <form
          className="admin-product-form"
          onSubmit={handleSubmit}
        >

          {/* PRODUCT NAME */}

          <div className="admin-form-group">

            <label>
              Product Name
            </label>

            <input
              type="text"
              name="name"
              placeholder="Enter product name"
              value={formData.name}
              onChange={handleChange}
            />

          </div>


          {/* DESCRIPTION */}

          <div className="admin-form-group">

            <label>
              Description
            </label>

            <textarea
              name="description"
              placeholder="Enter product description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
            />

          </div>


          {/* PRICE + STOCK */}

          <div className="admin-form-row">

            <div className="admin-form-group">

              <label>
                Price (₹)
              </label>

              <input
                type="number"
                name="price"
                placeholder="0.00"
                value={formData.price}
                onChange={handleChange}
                min="0.01"
                step="0.01"
              />

            </div>


            <div className="admin-form-group">

              <label>
                Stock Quantity
              </label>

              <input
                type="number"
                name="stockQuantity"
                placeholder="0"
                value={formData.stockQuantity}
                onChange={handleChange}
                min="0"
                step="1"
              />

            </div>

          </div>


          {/* SUBMIT */}

          <button
            type="submit"
            className="admin-primary-button"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : editingProduct
              ? "Update Product"
              : "Add Product"}
          </button>

        </form>

      </div>


      {/* ======================================
          PRODUCT SUMMARY
      ====================================== */}

      <div className="admin-product-summary">

        <div className="admin-stat">

          <span>
            Total Products
          </span>

          <strong>
            {products.length}
          </strong>

        </div>


        <div className="admin-stat">

          <span>
            In Stock
          </span>

          <strong>
            {
              products.filter(
                (product) =>
                  product.stockQuantity > 0
              ).length
            }
          </strong>

        </div>


        <div className="admin-stat">

          <span>
            Out of Stock
          </span>

          <strong>
            {
              products.filter(
                (product) =>
                  product.stockQuantity === 0
              ).length
            }
          </strong>

        </div>

      </div>


      {/* ======================================
          PRODUCT LIST
      ====================================== */}

      {products.length === 0 ? (

        <div className="admin-empty">

          <div className="admin-empty-icon">
            🛍️
          </div>

          <h3>
            No Products Yet
          </h3>

          <p>
            Add your first product using
            the form above.
          </p>

        </div>

      ) : (

        <div className="admin-product-grid">

          {products.map((product) => (

            <div
              className="admin-product-card"
              key={product.id}
            >

              {/* PRODUCT ICON */}

              <div className="admin-product-icon">
                🛍️
              </div>


              {/* PRODUCT INFO */}

              <div className="admin-product-info">

                <p className="admin-order-label">
                  PRODUCT #{product.id}
                </p>

                <h3>
                  {product.name}
                </h3>

                <p className="admin-product-description">
                  {product.description}
                </p>

              </div>


              {/* PRICE */}

              <div className="admin-product-price">

                ₹{formatMoney(product.price)}

              </div>


              {/* STOCK */}

              <div className="admin-product-stock">

                <span>
                  Stock
                </span>

                <strong
                  className={
                    product.stockQuantity === 0
                      ? "stock-out"
                      : "stock-available"
                  }
                >
                  {product.stockQuantity}
                </strong>

              </div>


              {/* ACTIONS */}

              <div className="admin-product-actions">

                <button
                  className="admin-edit-button"
                  onClick={() =>
                    startEditing(product)
                  }
                >
                  ✏️ Edit
                </button>

                <button
                  className="admin-delete-button"
                  onClick={() =>
                    deleteProduct(product)
                  }
                >
                  🗑️ Delete
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default AdminProducts;