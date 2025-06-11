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
    pImagePublicId: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null); // null, 'redirecting', or 'error'
  const [suggestedDescription, setSuggestedDescription] = useState("");
  const [isSuggestingDescription, setIsSuggestingDescription] = useState(false);

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
        pImagePublicId: editProduct.pImagePublicId || "",
      });

      if (editProduct.pImageUrl) {
        setImagePreview(editProduct.pImageUrl);
      }
    }
  }, [isEditing, editProduct]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "pQuantity" || name === "pPrice" ? Number(value) : value,
    });
    if (name === "pName" && value.trim() !== "") {
      setSuggestedDescription(""); // Clear previous suggestion if product name changes
    }
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);

    // Create a preview
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle image upload
  const handleImageUpload = async () => {
    if (!imageFile) {
      return setError("Please select an image file first");
    }

    setUploadingImage(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("productImage", imageFile);

      console.log(
        "Uploading image:",
        imageFile.name,
        "Size:",
        Math.round(imageFile.size / 1024),
        "KB"
      );

      const response = await axios.post(
        `${getBaseUrl()}/user/upload-product-image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          // Add timeout and retry config
          timeout: 30000, // 30 seconds
        }
      );

      console.log("Upload response:", response.data);

      if (response.data.success) {
        setFormData((prev) => ({
          ...prev,
          pImageUrl: response.data.imageUrl,
          pImagePublicId: response.data.publicId,
        }));

        setSuccess("Image uploaded successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        throw new Error(response.data.message || "Upload failed");
      }
    } catch (err) {
      console.error("Error uploading image:", err);

      // Detailed error handling
      if (err.response) {
        // Server responded with error
        const errorMsg =
          err.response.data.message ||
          err.response.data.error ||
          "Upload failed";
        setError(`Server error: ${errorMsg}`);
      } else if (err.request) {
        // Request made but no response
        setError(
          "No response received from server. Check your network connection."
        );
      } else {
        // Request setup error
        setError(`Upload error: ${err.message}`);
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSuggestDescription = async () => {
    if (!formData.pName.trim()) {
      setError("Please enter a product name first to get suggestions.");
      return;
    }
    setIsSuggestingDescription(true);
    setSuggestedDescription("");
    setError("");
    try {
      const response = await axios.post(
        `${getBaseUrl()}/gemini/suggest-description`,
        {
          productName: formData.pName,
        }
      );
      if (response.data && response.data.suggestion) {
        setSuggestedDescription(response.data.suggestion);
      } else {
        setError("Could not retrieve a suggestion.");
      }
    } catch (err) {
      console.error("Error fetching description suggestion:", err);
      setError(
        err.response?.data?.message || "Failed to get description suggestion."
      );
    } finally {
      setIsSuggestingDescription(false);
    }
  };

  const applySuggestedDescription = () => {
    if (suggestedDescription) {
      setFormData((prev) => ({ ...prev, pDescription: suggestedDescription }));
      setSuggestedDescription(""); // Clear suggestion after applying
    }
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
          // Show loading state with feedback text
          setSubmissionStatus("redirecting");
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
            pImagePublicId: "",
          });
          setImageFile(null);
          setImagePreview(null);
          // Show loading state with feedback text
          setSubmissionStatus("redirecting");
          setTimeout(() => navigate("/dashboard"), 1500);
        }
      }
    } catch (err) {
      console.error("Error submitting product:", err);
      setError(
        err.response?.data?.message ||
          "Failed to save product. Please try again."
      );
      setSubmissionStatus("error");
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
            <div className="card-body p-4" style={{borderRadius: "15px"}}>
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
                  <div className="mt-2">
                    <button
                      type="button"
                      className="btn ai-suggest-btn btn-sm me-2"
                      onClick={handleSuggestDescription}
                      disabled={
                        isSuggestingDescription || !formData.pName.trim()
                      }
                    >
                      {isSuggestingDescription ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                            style={{ width: "1rem", height: "1rem" }}
                          ></span>
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <i className="bi bi-stars me-1"></i>✨ Generate with
                          AI
                        </>
                      )}
                    </button>
                    {suggestedDescription && (
                      <button
                        type="button"
                        className="btn apply-suggestion-btn btn-sm"
                        onClick={applySuggestedDescription}
                      >
                        <i className="bi bi-check2 me-1"></i>
                        Apply
                      </button>
                    )}
                  </div>
                  {suggestedDescription && (
                    <div className="ai-suggestion-card mt-3">
                      <div className="suggestion-header">
                        <div className="ai-badge">
                          <i className="bi bi-robot me-1"></i>
                          AI Generated
                        </div>
                        <button
                          type="button"
                          className="suggestion-close"
                          onClick={() => setSuggestedDescription("")}
                        >
                          <i className="bi bi-x"></i>
                        </button>
                      </div>
                      <div className="suggestion-content">
                        <p className="suggestion-text">
                          {suggestedDescription}
                        </p>
                      </div>
                    </div>
                  )}
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
                  <label htmlFor="productImage" className="form-label">
                    Product Image
                  </label>
                  <div className="input-group mb-3">
                    <input
                      type="file"
                      className="form-control"
                      id="productImage"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={handleImageUpload}
                      disabled={!imageFile || uploadingImage}
                    >
                      {uploadingImage ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-1"
                            role="status"
                            aria-hidden="true"
                            style={{ width: "1rem", height: "1rem" }}
                          ></span>
                          <span className="text-center">Uploading...</span>
                        </>
                      ) : (
                        "Upload"
                      )}
                    </button>
                  </div>
                  <small className="text-muted">
                    Select an image file (max 5MB) and click Upload
                  </small>
                  {error && <div className="alert alert-danger">{error}</div>}
                  {formData.pImageUrl && (
                    <div className="form-text text-success">
                      <i className="bi bi-check-circle-fill me-1"></i>
                      {success}
                    </div>
                  )}
                </div>

                {imagePreview && (
                  <div className="mb-4 text-center">
                    <p>Image Preview:</p>
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="img-thumbnail preview-image"
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
                          style={{ width: "1rem", height: "1rem" }}
                        ></span>
                        <span>Saving...</span>
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

      {submissionStatus === "redirecting" && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{
            backgroundColor: "rgba(120, 120, 120, 0.5)",
            zIndex: 1050,
          }}
        >
          <div className="text-center">
            <div className="modern-spinner">
              <div className="spinner-circle"></div>
              <div className="spinner-circle-outer"></div>
            </div>
            <h5 className="mt-4" style={{ color: "#e85f5c" }}>
              {success}
            </h5>
            <p className="text-muted">Redirecting to dashboard...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductForm;
