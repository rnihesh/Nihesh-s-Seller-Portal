import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { userContextObj } from "../contexts/UserContext";
import { getBaseUrl } from "../../utils/config";
import "./ProductForm.css";

function ProductForm() {
  const { currentUser } = useContext(userContextObj);
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = location.state?.isEditing || false;
  const editProduct = location.state?.product || null;

  // Form state
  const [formData, setFormData] = useState({
    pName: "",
    pDescription: "",
    pCat: "",
    pQuantity: 1,
    pPrice: "",
    pImageUrl: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Categories for dropdown
  const categories = [
    "Electronics",
    "Clothing",
    "Home & Kitchen",
    "Books",
    "Toys & Games",
    "Beauty & Personal Care",
    "Sports & Outdoors",
    "Automotive",
    "Health & Wellness",
    "Other",
  ];

  // Set form data if editing
  useEffect(() => {
    if (isEditing && editProduct) {
      setFormData({
        pName: editProduct.pName || "",
        pDescription: editProduct.pDescription || "",
        pCat: editProduct.pCat || "",
        pQuantity: editProduct.pQuantity || 0,
        pPrice: editProduct.pPrice || "",
        pImageUrl: editProduct.pImageUrl || "",
      });
    }
  }, [isEditing, editProduct]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "pQuantity" || name === "pPrice" ? Number(value) : value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!currentUser?.baseID) {
      setError("You must be logged in to add products");
      setLoading(false);
      return;
    }

    try {
      if (isEditing) {
        // Update existing product
        const response = await axios.put(`${getBaseUrl()}/user/edit`, {
          userId: currentUser.baseID,
          pName: editProduct.pName,
          updatedProduct: formData,
        });

        if (response.status === 200) {
          setSuccess("Product updated successfully!");
          setTimeout(() => navigate("/dashboard"), 1500);
        }
      } else {
        // Add new product
        const response = await axios.post(`${getBaseUrl()}/user/product`, {
          userId: currentUser.baseID,
          product: formData,
        });

        if (response.status === 201) {
          setSuccess("Product added successfully!");
          setFormData({
            pName: "",
            pDescription: "",
            pCat: "",
            pQuantity: 1,
            pPrice: "",
            pImageUrl: "",
          });
          setTimeout(() => navigate("/dashboard"), 1500);
        }
      }
    } catch (err) {
      console.error("Error submitting product:", err);
      setError(
        err.response?.data?.message ||
          "Failed to save product. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser?.baseID) {
    return (
      <div className="container mt-5">
        <div className="text-center p-5">
          <h2>Please sign in to add products</h2>
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
    <div className="container product-form-container mt-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h2 className="text-center mb-4">
                {isEditing ? "Edit Product" : "Add New Product"}
              </h2>

              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="pName" className="form-label">
                    Product Name*
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="pName"
                    name="pName"
                    value={formData.pName}
                    onChange={handleChange}
                    required
                    disabled={isEditing} // Cannot change product name when editing
                  />
                  {isEditing && (
                    <small className="text-muted">
                      Product name cannot be changed.
                    </small>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="pDescription" className="form-label">
                    Description*
                  </label>
                  <textarea
                    className="form-control"
                    id="pDescription"
                    name="pDescription"
                    value={formData.pDescription}
                    onChange={handleChange}
                    rows="4"
                    required
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label htmlFor="pCat" className="form-label">
                    Category*
                  </label>
                  <select
                    className="form-select"
                    id="pCat"
                    name="pCat"
                    value={formData.pCat}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="pPrice" className="form-label">
                      Price (₹)*
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">₹</span>
                      <input
                        type="number"
                        className="form-control"
                        id="pPrice"
                        name="pPrice"
                        value={formData.pPrice}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="pQuantity" className="form-label">
                      Quantity*
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="pQuantity"
                      name="pQuantity"
                      value={formData.pQuantity}
                      onChange={handleChange}
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="pImageUrl" className="form-label">
                    Image URL
                  </label>
                  <input
                    type="url"
                    className="form-control"
                    id="pImageUrl"
                    name="pImageUrl"
                    value={formData.pImageUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                  />
                  <small className="text-muted">
                    Enter a valid URL for the product image
                  </small>
                </div>

                {formData.pImageUrl && (
                  <div className="mb-4 text-center">
                    <p>Image Preview:</p>
                    <img
                      src={formData.pImageUrl}
                      alt="Product preview"
                      className="img-thumbnail preview-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co/300x200?text=Invalid+Image+URL";
                      }}
                    />
                  </div>
                )}

                <div className="d-flex justify-content-between mt-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate("/dashboard")}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                    style={{ background: "#e85f5c", border: "none" }}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Saving...
                      </>
                    ) : isEditing ? (
                      "Update Product"
                    ) : (
                      "Add Product"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductForm;
