import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { userContextObj } from "../contexts/UserContext";
import { getBaseUrl } from "../../utils/config";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaMinus,
  FaSearch,
  FaFilter,
} from "react-icons/fa";
import "./Dashboard.css";

function Dashboard() {
  const { currentUser } = useContext(userContextObj);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const navigate = useNavigate();

  // Log currentUser and localStorage user on Dashboard load
  useEffect(() => {
    console.log("Dashboard loaded with currentUser:", currentUser);
    const localStorageUser = localStorage.getItem("currentuser");
    console.log(
      "Dashboard localStorage user:",
      localStorageUser ? JSON.parse(localStorageUser) : null
    );
  }, []);

  // Fetch user's products
  useEffect(() => {
    const fetchProducts = async () => {
      if (!currentUser?.baseID) {
        console.log("No baseID found, not fetching products");
        setLoading(false);
        return;
      }

      try {
        console.log(
          "try in fetching by currentUser.baseID: ",
          currentUser.baseID
        );
        const response = await axios.get(
          `${getBaseUrl()}/user/products/?userId=${currentUser.baseID}`
        );
        console.log("after axios products/userid : ", response);
        if (response.data && response.data.payload) {
          const productsList = response.data.payload || [];
          setProducts(productsList);
          setFilteredProducts(productsList);

          // Extract unique categories
          const uniqueCategories = [
            ...new Set(productsList.map((product) => product.pCat)),
          ];
          setCategories(uniqueCategories);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again.");
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentUser?.baseID]); // Only depend on baseID

  // Filter products when search term or category changes
  useEffect(() => {
    if (products.length > 0) {
      let results = [...products];

      // Apply search filter
      if (searchTerm) {
        results = results.filter(
          (product) =>
            product.pName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.pDescription
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
        );
      }

      // Apply category filter
      if (selectedCategory) {
        results = results.filter(
          (product) => product.pCat === selectedCategory
        );
      }

      setFilteredProducts(results);
    }
  }, [searchTerm, selectedCategory, products]);

  const handleUpdateQuantity = async (productName, increase) => {
    try {
      const response = await axios.patch(
        `${getBaseUrl()}/user/updateQuantity`,
        {
          userId: currentUser.baseID,
          pName: productName,
          op: increase,
        }
      );

      if (response.data && response.data.payload) {
        // Update the product in the local state
        const updatedProducts = products.map((p) =>
          p.pName === productName ? response.data.payload.product : p
        );
        setProducts(updatedProducts);

        // Also update filtered products
        setFilteredProducts((prevFiltered) =>
          prevFiltered.map((p) =>
            p.pName === productName ? response.data.payload.product : p
          )
        );
      }
    } catch (err) {
      console.error("Error updating quantity:", err);
      setError(err.response?.data?.message || "Failed to update quantity");
    }
  };

  const handleDeleteProduct = async (productName) => {
    try {
      await axios.delete(`${getBaseUrl()}/user/delete`, {
        data: {
          userId: currentUser.baseID,
          pName: productName,
          previousLength: products.length,
        },
      });

      // Remove the product from local state
      const updatedProducts = products.filter((p) => p.pName !== productName);
      setProducts(updatedProducts);
      setFilteredProducts(
        filteredProducts.filter((p) => p.pName !== productName)
      );

      // Update categories if needed
      const remainingCategories = [
        ...new Set(updatedProducts.map((product) => product.pCat)),
      ];
      setCategories(remainingCategories);

      // Reset category filter if the selected category no longer exists
      if (selectedCategory && !remainingCategories.includes(selectedCategory)) {
        setSelectedCategory("");
      }

      // Close the modal
      setShowDeleteModal(false);
    } catch (err) {
      console.error("Error deleting product:", err);
      setError("Failed to delete product. Please try again.");
      setShowDeleteModal(false);
    }
  };

  const initiateDelete = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleEditProduct = (product) => {
    navigate("/pro", { state: { product, isEditing: true } });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
  };

  // Update the check for user authentication
  if (!currentUser?.baseID) {
    console.log("No baseID found, showing sign-in prompt");
    return (
      <div className="container dashboard-container mt-5">
        <div className="text-center p-5">
          <h2>Please sign in to view your dashboard</h2>
          <p>User data in localStorage may be corrupted or missing.</p>
          <button
            className="btn btn-primary mt-3"
            onClick={() => navigate("/signin")}
            style={{ background: "#e85f5c", border: "none" }}
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container dashboard-container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Your Products</h2>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/pro")}
          style={{ background: "#e85f5c", border: "none" }}
        >
          <FaPlus className="me-2" /> Add New Product
        </button>
      </div>

      {/* Search and Filter Section - Improved UI */}
      <div className="search-filter-container p-4 mb-4 rounded shadow-sm">
        <div className="row g-4">
          <div className="col-md-5">
            <label htmlFor="searchInput" className="form-label mb-2 fw-bold">
              <FaSearch
                className="me-2"
                style={{ color: "var(--accent-color)" }}
              />
              Search Products
            </label>
            <div className="input-group">
              <input
                id="searchInput"
                type="text"
                className="form-control form-control-lg search-input"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={handleSearchChange}
                style={{
                  borderRadius: searchTerm ? "0.5rem 0 0 0.5rem" : "0.5rem",
                  transition: "all 0.3s ease",
                  border: "1px solid var(--input-border)",
                  backgroundColor: "var(--input-background)",
                  color: "var(--text-primary)",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                }}
              />
              {searchTerm && (
                <button
                  className="btn"
                  type="button"
                  onClick={() => setSearchTerm("")}
                  style={{
                    borderRadius: "0 0.5rem 0.5rem 0",
                    borderLeft: "none",
                    backgroundColor: "var(--input-background)",
                    borderColor: "var(--input-border)",
                    color: "var(--text-secondary)",
                    transition: "all 0.2s ease",
                    padding: "0.75rem 1.25rem",
                  }}
                  aria-label="Clear search"
                >
                  <span aria-hidden="true">✕</span>
                </button>
              )}
            </div>
          </div>

          <div className="col-md-5">
            <label htmlFor="categorySelect" className="form-label mb-2 fw-bold">
              <FaFilter
                className="me-2"
                style={{ color: "var(--accent-color)" }}
              />
              Filter by Category
            </label>
            <select
              id="categorySelect"
              className="form-select form-select-lg"
              value={selectedCategory}
              onChange={handleCategoryChange}
              style={{
                borderRadius: "0.5rem",
                border: "1px solid var(--input-border)",
                backgroundColor: "var(--input-background)",
                color: "var(--text-primary)",
                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                transition: "all 0.3s ease",
              }}
            >
              <option value="">All Categories</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-2 d-flex align-items-end">
            {!searchTerm && !selectedCategory ? (
              <button
                className="btn w-100"
                disabled
                style={{
                  backgroundColor: "var(--background-secondary)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--divider-color)",
                  borderRadius: "0.5rem",
                  padding: "0.75rem 1rem",
                  boxShadow: "none",
                  transition: "all 0.3s ease",
                  opacity: 0.7,
                }}
              >
                No Filters Applied
              </button>
            ) : (
              <button
                className="btn w-100"
                onClick={clearFilters}
                style={{
                  backgroundColor: "var(--accent-color)",
                  color: "white",
                  border: "none",
                  borderRadius: "0.5rem",
                  padding: "0.75rem 1rem",
                  boxShadow: "0 4px 10px rgba(232, 95, 92, 0.2)",
                  transition: "all 0.3s ease",
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Filter Status */}
        {filteredProducts.length > 0 &&
          products.length !== filteredProducts.length && (
            <div className="filter-status mt-3 pt-3 border-top">
              <p
                className="mb-0 d-flex align-items-center"
                style={{ color: "var(--text-secondary)" }}
              >
                <FaSearch
                  size={14}
                  className="me-2"
                  style={{ color: "var(--accent-color)" }}
                />
                <span
                  className="fw-bold"
                  style={{ color: "var(--accent-color)" }}
                >
                  {filteredProducts.length}
                </span>
                <span className="mx-1">of</span>
                <span className="fw-bold">{products.length}</span>
                <span className="ms-1">products match your filters</span>
              </p>
            </div>
          )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center p-5 empty-products">
          <h3>No products found</h3>
          <p>Start by adding your first product!</p>
          <button
            className="btn btn-lg btn-primary mt-3"
            onClick={() => navigate("/pro")}
            style={{ background: "#e85f5c", border: "none" }}
          >
            <FaPlus className="me-2" /> Add Product
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center p-5">
          <h3>No matching products</h3>
          <p>Try adjusting your search criteria or category filter</p>
          <button
            className="btn btn-outline-secondary mt-3"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {filteredProducts.map((product) => (
            <div className="col" key={product._id}>
              <div className="card h-100 product-card">
                {product.pImageUrl ? (
                  <img
                    src={product.pImageUrl}
                    className="card-img-top product-image"
                    alt={product.pName}
                  />
                ) : (
                  <div className="card-img-top product-image-placeholder text-center d-flex align-items-center justify-content-center">
                    <span>No Image Available</span>
                  </div>
                )}
                <div className="card-body">
                  <h5 className="card-title">{product.pName}</h5>
                  <p className="card-text description">
                    {product.pDescription}
                  </p>
                  <div className="product-details">
                    <p className="mb-1">
                      <strong>Category:</strong> {product.pCat}
                    </p>
                    <p className="mb-1">
                      <strong>Price:</strong> ₹{product.pPrice}
                    </p>
                    <div className="quantity-control d-flex align-items-center">
                      <strong className="me-2">Quantity:</strong>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() =>
                          handleUpdateQuantity(product.pName, false)
                        }
                        disabled={product.pQuantity <= 0}
                      >
                        <FaMinus />
                      </button>
                      <span className="mx-3">{product.pQuantity}</span>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() =>
                          handleUpdateQuantity(product.pName, true)
                        }
                      >
                        <FaPlus />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="card-footer bg-transparent border-top-0">
                  <div className="d-flex justify-content-between">
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => handleEditProduct(product)}
                    >
                      <FaEdit className="me-1" /> Edit
                    </button>
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => initiateDelete(product)}
                    >
                      <FaTrash className="me-1" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <div
        className={`modal fade ${showDeleteModal ? "show d-block" : ""}`}
        tabIndex="-1"
        role="dialog"
        style={showDeleteModal ? { background: "rgba(0,0,0,0.5)" } : {}}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Confirm Deletion</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowDeleteModal(false)}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete "{productToDelete?.pName}"?</p>
              <p className="text-danger">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() =>
                  productToDelete && handleDeleteProduct(productToDelete.pName)
                }
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
