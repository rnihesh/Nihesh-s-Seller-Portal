import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useClerk, useUser } from "@clerk/clerk-react";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.js";
import "./Header.css";
import { userContextObj } from "../contexts/UserContext";
import { FaBars, FaMoon, FaSun } from "react-icons/fa";
import { ThemeContext } from "../contexts/ThemeContext";

function Header() {
  const { signOut } = useClerk();
  const { isSignedIn, user } = useUser();
  const { currentUser, setCurrentUser } = useContext(userContextObj);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // Apply theme to document body
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  // Handle user logout
  const handleLogout = async () => {
    await signOut();
    localStorage.removeItem("currentuser");
    setCurrentUser({});
    navigate("/");
  };

  // Mobile menu renderer
  const renderMobileMenu = () => {
    if (!menuOpen) return null;

    return (
      <div className="mobile-menu shadow">
        {/* Profile section */}
        {isSignedIn && (
          <div className="mobile-profile p-4 text-center border-bottom">
            <img
              src={user?.imageUrl}
              alt="Profile"
              width="60"
              height="60"
              className="rounded-circle mb-2"
              style={{
                border: "2px solid var(--accent-color)",
                boxShadow: "0 2px 8px rgba(232,95,92,0.15)",
              }}
            />
            <div className="mt-2 fw-bold">
              {user?.fullName || user?.username}
            </div>
            <div className="text-muted small">
              {user?.primaryEmailAddress?.emailAddress}
            </div>
          </div>
        )}

        {/* Navigation links */}
        <div className="p-2">
          <ul className="nav flex-column">
            {isSignedIn ? (
              <>
                <li className="nav-item">
                  <Link
                    to="/"
                    className="nav-link d-flex align-items-center p-3"
                    onClick={() => {
                      setMenuOpen(false);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    <span>Home</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/dashboard"
                    className="nav-link d-flex align-items-center p-3"
                    onClick={() => setMenuOpen(false)}
                  >
                    <span>Dashboard</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/pro"
                    className="nav-link d-flex align-items-center p-3"
                    onClick={() => setMenuOpen(false)}
                  >
                    <span>Add Product</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link d-flex align-items-center p-3"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      window.scrollTo({
                        top: document.body.scrollHeight,
                        behavior: "smooth",
                      });
                      setMenuOpen(false);
                    }}
                  >
                    <span>About</span>
                  </a>
                </li>
                <li className="nav-item mt-2">
                  <button
                    className="nav-link d-flex align-items-center p-3 w-100 text-danger"
                    onClick={handleLogout}
                    style={{
                      background: "rgba(232, 95, 92, 0.1)",
                      borderRadius: "8px",
                    }}
                  >
                    <span>Logout</span>
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link
                    to="/signin"
                    className="nav-link d-flex align-items-center p-3"
                    onClick={() => setMenuOpen(false)}
                  >
                    <span>Sign In</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/signup"
                    className="nav-link d-flex align-items-center p-3"
                    onClick={() => setMenuOpen(false)}
                  >
                    <span>Sign Up</span>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Theme switch in mobile menu */}
        <div className="border-top p-3 d-flex justify-content-between align-items-center">
          <span>Theme</span>
          <button
            className="btn theme-toggle-btn"
            onClick={(e) => {
              e.stopPropagation();
              toggleTheme();
            }}
            aria-label={
              theme === "light" ? "Switch to dark mode" : "Switch to light mode"
            }
          >
            {theme === "light" ? (
              <FaMoon />
            ) : (
              <FaSun className="text-warning" />
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <nav className="main-navbar d-flex align-items-center p-3 shadow-sm flex-wrap">
      <div
        className="d-flex align-items-center w-100"
        style={{ position: "relative" }}
      >
        <div className="fw-bold fs-4 flex-shrink-0">
          <Link
            to="/"
            className="text-decoration-none"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <span style={{ color: "var(--accent-color)" }}>
              Nihesh's Seller Portal
            </span>
          </Link>
        </div>

        {/* Theme toggle button */}
        <button
          className="btn theme-toggle-btn ms-3"
          onClick={toggleTheme}
          aria-label={
            theme === "light" ? "Switch to dark mode" : "Switch to light mode"
          }
          title={
            theme === "light" ? "Switch to dark mode" : "Switch to light mode"
          }
        >
          {theme === "light" ? <FaMoon /> : <FaSun className="text-warning" />}
        </button>

        {/* Hamburger menu for mobile */}
        <div className="menu-bar-icon ms-auto d-block d-md-none">
          <button
            className="btn btn-link p-0 border-0 mb-1"
            style={{ fontSize: 28, color: "var(--accent-color)" }}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
          >
            <FaBars />
          </button>
          {renderMobileMenu()}
        </div>

        {/* Desktop menu */}
        <div className="d-none d-md-block ms-auto">
          <ul className="nav">
            {isSignedIn ? (
              <>
                <li className="nav-item">
                  <Link
                    to="/"
                    className="nav-link"
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                  >
                    Home
                  </Link>
                </li>
                <li className="nav-item">
                  <a
                    onClick={() =>
                      window.scrollTo({
                        top: document.body.scrollHeight,
                        behavior: "smooth",
                      })
                    }
                    className="nav-link"
                    style={{ cursor: "pointer" }}
                  >
                    About
                  </a>
                </li>
                <div className="dropdown ms-3 flex-shrink-0">
                  <img
                    src={user.imageUrl}
                    alt="Profile"
                    width="40"
                    height="40"
                    className="rounded-circle dropdown-toggle"
                    type="button"
                    id="profileDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{
                      border: "2px solid #e85f5c",
                      boxShadow: "0 2px 8px rgba(232,95,92,0.08)",
                      cursor: "pointer",
                    }}
                  />
                  <ul
                    className="dropdown-menu dropdown-menu-end mt-3"
                    aria-labelledby="profileDropdown"
                  >
                    <li>
                      <button onClick={handleLogout} className="dropdown-item">
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link
                    to="/"
                    className="nav-link"
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                  >
                    Home
                  </Link>
                </li>
                <li className="nav-item">
                  <a
                    onClick={() =>
                      window.scrollTo({
                        top: document.body.scrollHeight,
                        behavior: "smooth",
                      })
                    }
                    className="nav-link"
                    style={{ cursor: "pointer" }}
                  >
                    About
                  </a>
                </li>
                <li className="nav-item">
                  <Link to="/signin" className="nav-link">
                    Sign In
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/signup" className="nav-link">
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Header;
