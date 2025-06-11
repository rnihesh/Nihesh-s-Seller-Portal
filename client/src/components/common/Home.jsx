import React, { useContext, useEffect, useState } from "react";
import "./Home.css";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.js";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Squares from "../../components/ui/Squares/Squares";
import DecryptedText from "../../components/ui/DecryptedText/DecryptedText";
import { userContextObj } from "../contexts/UserContext";
import { getBaseUrl } from "../../utils/config";
import { FaStore, FaBox, FaChartLine } from "react-icons/fa";

function Home() {
  const { currentUser, setCurrentUser } = useContext(userContextObj);
  const { isSignedIn, user, isLoaded } = useUser();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [companyInput, setCompanyInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const navigate = useNavigate();

  // FIXED: Only update context with Clerk data if we don't already have complete user data
  useEffect(() => {
    if (isLoaded && user && !currentUser.baseID) {
      // Only update Clerk-specific fields, don't overwrite existing baseID
      setCurrentUser((prev) => ({
        ...prev, // Keep existing data including baseID
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        email: user.emailAddresses[0]?.emailAddress || prev.email,
        profileImageUrl: user.imageUrl || prev.profileImageUrl,
        // Don't set baseID to empty string if it already exists
      }));
    }
    setLoading(false);
  }, [isLoaded, user, currentUser.baseID, setCurrentUser]);

  // Add auto-verification on login
  useEffect(() => {
    async function verifyUserOnLogin() {
      if (isLoaded && isSignedIn && user && !currentUser.baseID) {
        try {
          // Get user email
          const email = user.emailAddresses[0]?.emailAddress;
          if (!email) return;

          console.log("Verifying user on login:", email);

          // Check if user exists in our database
          const { data } = await axios.get(`${getBaseUrl()}/user/verify`, {
            params: { email },
          });

          // If user exists, set the complete data including baseID
          if (data && data.payload) {
            console.log("Found existing user data:", data.payload);

            const completeUserData = {
              firstName: data.payload.firstName || user.firstName,
              lastName: data.payload.lastName || user.lastName,
              email: data.payload.email,
              baseID: data.payload._id,
              isVerified: data.payload.isVerified,
              profileImageUrl: user.imageUrl,
              ...(data.payload.phNum && { phNum: data.payload.phNum }),
              ...(data.payload.companyName && {
                companyName: data.payload.companyName,
              }),
            };

            console.log(
              "Setting complete user data on login:",
              completeUserData
            );
            setCurrentUser(completeUserData);
          }
        } catch (err) {
          console.log("User not found in database yet:", err.message);
          // User doesn't exist in our database yet, just set Clerk data
          setCurrentUser((prev) => ({
            ...prev,
            firstName: user.firstName || prev.firstName,
            lastName: user.lastName || prev.lastName,
            email: user.emailAddresses[0]?.emailAddress || prev.email,
            profileImageUrl: user.imageUrl || prev.profileImageUrl,
          }));
        }
      } else if (isLoaded && !isSignedIn) {
        // User is logged out, clear data
        setCurrentUser((prev) => ({
          ...prev,
          baseID: "", // Clear baseID on logout
        }));
      }

      setLoading(false);
    }

    verifyUserOnLogin();
  }, [isLoaded, isSignedIn, user, currentUser.baseID, setCurrentUser]);

  // Debug helper function
  const checkUserState = () => {
    console.log("====== USER STATE CHECK ======");
    console.log("Current user state:", currentUser);
    const stored = localStorage.getItem("currentuser");
    const parsedStored = stored ? JSON.parse(stored) : null;
    console.log("LocalStorage currentuser:", parsedStored);

    if (currentUser && !currentUser.baseID && parsedStored?.baseID) {
      console.warn(
        "baseID missing in currentUser but present in localStorage!"
      );
      // FIXED: Restore baseID from localStorage if it's missing
      setCurrentUser((prev) => ({
        ...prev,
        baseID: parsedStored.baseID,
      }));
    }
    console.log("==============================");
    return { memory: currentUser, storage: parsedStored };
  };

  // FIXED: Simplified and more reliable handleGetStarted
  async function handleGetStarted() {
    console.log("handleGetStarted called");
    setError("");
    setSuccess("");

    if (!user || !user.emailAddresses[0]?.emailAddress) {
      setError("User email is missing. Please try logging in again.");
      return;
    }

    const email = user.emailAddresses[0].emailAddress;
    console.log("email from handle getting started : ", email);

    try {
      // Check if we already have a baseID in context - if so, use it
      if (currentUser.baseID) {
        console.log("Using existing baseID from context:", currentUser.baseID);
        // navigate("/dashboard");
        // return;
      }

      // Changed endpoint from /user/details to /user/verify which exists in your API
      const { data } = await axios.get(`${getBaseUrl()}/user/verify`, {
        params: { email },
      });

      if (data && data.payload) {
        // User exists - create complete user data object
        const completeUserData = {
          firstName: data.payload.firstName || user.firstName,
          lastName: data.payload.lastName || user.lastName,
          email: data.payload.email,
          baseID: data.payload._id, // This is the key field
          isVerified: data.payload.isVerified,
          profileImageUrl: user.imageUrl,
          // Preserve any additional fields that might exist
          ...(data.payload.phNum && { phNum: data.payload.phNum }),
          ...(data.payload.companyName && {
            companyName: data.payload.companyName,
          }),
        };

        console.log("Setting complete user data:", completeUserData);

        // FIXED: Single call to setCurrentUser with complete data
        setCurrentUser(completeUserData);

        // Navigate based on verification status
        if (data.payload.isVerified) {
          navigate("/dashboard");
        } else {
          setVerificationEmail(email);
          setVerificationId(data.payload._id);
          setShowOtpModal(true);
        }
      } else {
        // User doesn't exist, show registration modal
        setShowPhoneModal(true);
      }
    } catch (err) {
      console.error("Error fetching user:", err);
      if (err.response && err.response.status === 404) {
        setShowPhoneModal(true);
      } else {
        setError("Failed to check user status. Please try again.");
      }
    }

    // Check state after operations complete
    setTimeout(checkUserState, 100);
  }

  // FIXED: Simplified createAndSave function
  async function createAndSave(userData) {
    try {
      // Validate required fields
      if (
        !userData.email ||
        !userData.firstName ||
        !userData.phNum ||
        !userData.companyName
      ) {
        setError("All fields are required");
        return;
      }

      const res = await axios.post(`${getBaseUrl()}/user/user`, userData);
      const { message, payload } = res.data;

      console.log("Create user response:", res.data);

      if (payload && payload._id) {
        // FIXED: Create complete user object with baseID
        const completeUserData = {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          profileImageUrl: userData.profileImageUrl,
          baseID: payload._id, // Critical: Set the baseID
          isVerified: !!payload.isVerified,
          phNum: userData.phNum,
          companyName: userData.companyName,
        };

        console.log("Setting new user data with baseID:", completeUserData);

        // FIXED: Single call to setCurrentUser with complete data
        setCurrentUser(completeUserData);

        if (payload.isVerified) {
          setSuccess("Account created successfully!");
          setTimeout(() => {
            navigate("/dashboard");
          }, 1000);
        } else {
          setVerificationEmail(userData.email);
          setVerificationId(payload._id);
          setShowPhoneModal(false);
          setShowOtpModal(true);
        }
      } else {
        setError(message || "Failed to create user - no ID returned");
      }
    } catch (err) {
      console.error("Error creating user:", err.response?.data || err.message);
      setError(err.response?.data?.message || err.message);
    }
  }

  // Phone modal submit handler
  function handleRegisterSubmit(e) {
    e.preventDefault();

    if (!phoneInput.match(/^\d{7,15}$/)) {
      setError("Please enter a valid phone number");
      return;
    }

    if (!companyInput || companyInput.length < 2) {
      setError("Please enter your company name");
      return;
    }

    const userData = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.emailAddresses[0].emailAddress,
      phNum: phoneInput,
      companyName: companyInput,
      profileImageUrl: user.imageUrl,
    };

    createAndSave(userData);
  }

  // FIXED: OTP verification with proper baseID handling
  async function handleVerifyOtp(e) {
    e.preventDefault();
    setError("");

    if (!otpInput || otpInput.length !== 6 || isNaN(otpInput)) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      const response = await axios.post(`${getBaseUrl()}/user/verifyuser`, {
        email: verificationEmail,
        code: parseInt(otpInput),
      });

      console.log("Verification response:", response.data);

      if (response.data && response.data.payload === true) {
        // FIXED: Update existing user data, don't replace it
        setCurrentUser((prev) => ({
          ...prev, // Keep all existing data including baseID
          isVerified: true,
        }));

        setShowOtpModal(false);
        setSuccess("Email verified successfully!");

        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      } else {
        setError(
          response.data?.message ||
            "Invalid verification code. Please try again."
        );
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      setError(
        err.response?.data?.message || "Verification failed. Please try again."
      );
    }
  }

  // Resend OTP handler
  async function handleResendOtp() {
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(`${getBaseUrl()}/user/resendotp`, {
        email: verificationEmail,
        userId: verificationId,
      });

      if (response.status === 200) {
        setSuccess("OTP resent successfully! Please check your email.");
      } else {
        setError("Failed to resend OTP. Please try again.");
      }
    } catch (err) {
      console.error("Error resending OTP:", err);
      setError(err.response?.data?.message || "Failed to resend OTP.");
    }
  }

  return (
    <div className="container-fluid px-0" style={{ minHeight: "100vh" }}>
      {/* Animated Hero Section */}
      {!isSignedIn && (
        <div className="position-relative" style={{ minHeight: "60vh" }}>
          <Squares
            direction="diagonal"
            speed={0.5}
            borderColor="var(--divider-color)"
            squareSize={60}
            hoverFillColor="var(--accent-color)"
            className="position-absolute top-0 start-0 w-100 h-100"
            style={{ zIndex: 0, opacity: 0.15 }}
          />
          <div
            className="d-flex flex-column align-items-center justify-content-center text-center position-relative"
            style={{ zIndex: 1, minHeight: "60vh" }}
          >
            <h1
              className="fw-bold mb-4"
              style={{
                fontFamily: "Cal Sans",
                fontSize: "3rem",
                color: "var(--text-primary)",
              }}
            >
              <span style={{ color: "var(--accent-color)" }}>
                Nihesh's Seller Portal
              </span>{" "}
              – Manage Your Products with Ease
            </h1>
            <div className="mb-3" style={{ maxWidth: 600 }}>
              <DecryptedText
                text="Your inventory management solution"
                speed={60}
                maxIterations={18}
                className="fs-4"
                style={{ color: "var(--text-primary)" }}
                parentClassName="all-letters"
                encryptedClassName="encrypted"
              />
            </div>
            <div className="mb-2" style={{ maxWidth: 700 }}>
              <DecryptedText
                text="Track inventory, manage products, and grow your business all in one place."
                speed={60}
                maxIterations={18}
                className="fs-5"
                style={{ color: "var(--text-secondary)" }}
                parentClassName="all-letters"
                encryptedClassName="encrypted"
              />
            </div>
            <div className="mt-4">
              <a
                href="/signin"
                className="btn btn-lg btn-primary px-5 py-2"
                style={{
                  background: "var(--accent-color)",
                  border: "none",
                  fontWeight: "bold",
                }}
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Preview when signed in */}
      {isSignedIn && (
        <div className="container mt-5 pt-5">
          <div className="row gx-5">
            <div className="col-md-6">
              <div className="p-4">
                <h2 className="mb-4" style={{ color: "var(--text-primary)" }}>
                  Welcome, {user?.firstName}!
                </h2>
                <p className="lead" style={{ color: "var(--text-secondary)" }}>
                  Manage your inventory, track products, and boost your sales
                  with our intuitive seller portal.
                </p>
                <div className="mt-4">
                  <button
                    onClick={handleGetStarted}
                    className="btn btn-lg btn-primary px-5 py-2"
                    style={{
                      background: "var(--accent-color)",
                      border: "none",
                      fontWeight: "bold",
                    }}
                  >
                    Go to Dashboard
                  </button>
                </div>
                {error && (
                  <div className="alert alert-warning mt-3">{error}</div>
                )}
                {success && (
                  <div className="alert alert-success mt-3">{success}</div>
                )}
              </div>
            </div>
            <div className="col-md-6">
              <div className="features-container p-4">
                <div className="feature-card mb-3">
                  <div className="feature-icon">
                    <FaStore />
                  </div>
                  <div className="feature-content">
                    <h4>Manage Products</h4>
                    <p>Add, edit, and organize your product catalog</p>
                  </div>
                </div>
                <div className="feature-card mb-3">
                  <div className="feature-icon">
                    <FaBox />
                  </div>
                  <div className="feature-content">
                    <h4>Track Inventory</h4>
                    <p>Keep count of your stock and get alerts</p>
                  </div>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">
                    <FaChartLine />
                  </div>
                  <div className="feature-content">
                    <h4>Analytics</h4>
                    <p>Get insights on your best performing products</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Registration modal */}
      <div
        className={`modal fade ${showPhoneModal ? "show d-block" : ""}`}
        tabIndex="-1"
        role="dialog"
        style={
          showPhoneModal
            ? {
                background: "rgba(0, 0, 0, 0.5)",
              }
            : {}
        }
      >
        <div
          className="modal-dialog pt-5 py-5"
          style={{ marginTop: "100px" }}
          role="document"
        >
          <form className="modal-content" onSubmit={handleRegisterSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">Complete Your Registration</h5>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="phoneInput" className="form-label">
                  Phone Number
                </label>
                <input
                  id="phoneInput"
                  type="tel"
                  className="form-control"
                  placeholder="10-15 digit phone number"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  required
                  pattern="^\d{7,15}$"
                />
                <small className="text-muted">
                  We'll use this to contact you about your products.
                </small>
              </div>
              <div className="mb-3">
                <label htmlFor="companyInput" className="form-label">
                  Company Name
                </label>
                <input
                  id="companyInput"
                  type="text"
                  className="form-control"
                  placeholder="Your company name"
                  value={companyInput}
                  onChange={(e) => setCompanyInput(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPhoneModal(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ background: "var(--accent-color)", border: "none" }}
              >
                Register
              </button>
            </div>
          </form>
          {error && (
            <p
              className="text-danger text-center fs-5 font-monospace"
              style={{ marginTop: "20px" }}
            >
              {error}
            </p>
          )}
        </div>
      </div>

      {/* OTP Verification Modal */}
      <div
        className={`modal fade ${showOtpModal ? "show d-block" : ""}`}
        tabIndex="-1"
        role="dialog"
        style={
          showOtpModal
            ? {
                background: "rgba(0, 0, 0, 0.5)",
              }
            : {}
        }
      >
        <div
          className="modal-dialog pt-5 py-5"
          style={{ marginTop: "100px" }}
          role="document"
        >
          <form className="modal-content" onSubmit={handleVerifyOtp}>
            <div className="modal-header">
              <h5 className="modal-title">Verify Your Email</h5>
            </div>
            <div className="modal-body">
              <p className="mb-3">
                We've sent a verification code to{" "}
                <strong>{verificationEmail}</strong>
              </p>
              <div className="mb-3">
                <label htmlFor="otpInput" className="form-label">
                  Enter 6-Digit Verification Code
                </label>
                <input
                  id="otpInput"
                  type="text"
                  className="form-control otp-input"
                  placeholder="6-digit code"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  required
                  maxLength="6"
                  pattern="\d{6}"
                />
              </div>
              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-link text-secondary"
                onClick={handleResendOtp}
              >
                Resend Code
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ background: "var(--accent-color)", border: "none" }}
              >
                Verify Email
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Home;
