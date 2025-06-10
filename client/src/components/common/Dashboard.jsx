import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { userContextObj } from "../contexts/UserContext";
import { getBaseUrl } from "../../utils/config";
import { FaPlus, FaEdit, FaTrash, FaMinus } from "react-icons/fa";
import "./Dashboard.css";

function Dashboard() {
  const { currentUser } = useContext(userContextObj);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
        console.log("try in fetching by currentUser.baseID: ", currentUser.baseID)
        const response = await axios.get(
          `${getBaseUrl()}/user/products/?userId=${currentUser.baseID}`
        );
        console.log("after axios products/userid : ", response)
        if (response.data && response.data.payload) {
          setProducts(response.data.payload || []);
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
        setProducts(
          products.map((p) =>
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
    if (!window.confirm(`Are you sure you want to delete ${productName}?`)) {
      return;
    }

    try {
      await axios.delete(`${getBaseUrl()}/user/delete`, {
        data: {
          userId: currentUser.baseID,
          pName: productName,
          previousLength: products.length,
        },
      });

      // Remove the product from local state
      setProducts(products.filter((p) => p.pName !== productName));
    } catch (err) {
      console.error("Error deleting product:", err);
      setError("Failed to delete product. Please try again.");
    }
  };

  const handleEditProduct = (product) => {
    navigate("/pro", { state: { product, isEditing: true } });
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
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {products.map((product) => (
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
                      onClick={() => handleDeleteProduct(product.pName)}
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
    </div>
  );
}

export default Dashboard;
