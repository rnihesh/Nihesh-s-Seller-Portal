import React, { useState, useEffect, useRef, useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext"; // Import existing ThemeContext
import { getBaseUrl } from "../../utils/config";
import axios from "axios";
import { Chart } from "primereact/chart";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import {
  FaFileDownload,
  FaChartPie,
  FaChartBar,
  FaStar,
  FaTag,
  FaMoneyBillWave,
} from "react-icons/fa";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import CountUp from "../ui/CountUp/CountUp"; 
import logo from "../../assets/image2.png";
import "./Analytics.css";

function Analytics() {
  const { theme } = useContext(ThemeContext); 
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const chartsRef = useRef(null);

  // Get user from localStorage only once during initialization
  const [currentUser] = useState(() => {
    const storedUser = localStorage.getItem("currentuser");
    return storedUser ? JSON.parse(storedUser) : {};
  });

  // Chart data states
  const [categoryChartData, setCategoryChartData] = useState({});
  const [inventoryChartData, setInventoryChartData] = useState({});
  const [priceRangeData, setPriceRangeData] = useState({});

  // Light and dark chart options using existing theme
  const getChartOptions = (title) => {
    const isDarkTheme = theme === "dark";

    return {
      maintainAspectRatio: false,
      aspectRatio: 1.5,
      plugins: {
        legend: {
          labels: {
            color: isDarkTheme ? "#e9ecef" : "#495057",
            font: {
              weight: "bold",
              size: 10, // Reduced font size for legend
            },
            padding: 8, // Reduced padding between legend items
            boxWidth: 12, // Smaller legend color boxes
            boxHeight: 12,
          },
          position: "right", // Changed from "bottom" to "right" for pie charts
          maxHeight: 200, // Limit legend height
          maxWidth: 150, // Limit legend width
        },
        title: {
          display: true,
          text: title,
          font: {
            size: 16,
            weight: "bold",
          },
          color: isDarkTheme ? "#e9ecef" : "#495057",
        },
        tooltip: {
          backgroundColor: isDarkTheme ? "#343a40" : "white",
          titleColor: isDarkTheme ? "#e9ecef" : "#212529",
          bodyColor: isDarkTheme ? "#e9ecef" : "#495057",
          borderColor: isDarkTheme ? "#495057" : "#dee2e6",
          borderWidth: 1,
          padding: 10,
          boxPadding: 5,
          cornerRadius: 8,
        },
      },
      scales: {
        x: {
          ticks: {
            color: isDarkTheme ? "#e9ecef" : "#495057",
            font: {
              weight: "500",
            },
          },
          grid: {
            color: isDarkTheme
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.05)",
            drawBorder: true,
            borderColor: isDarkTheme
              ? "rgba(255, 255, 255, 0.2)"
              : "rgba(0, 0, 0, 0.1)",
            borderWidth: 1,
          },
        },
        y: {
          ticks: {
            color: isDarkTheme ? "#e9ecef" : "#495057",
            font: {
              weight: "500",
            },
          },
          grid: {
            color: isDarkTheme
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.05)",
            drawBorder: true,
            borderColor: isDarkTheme
              ? "rgba(255, 255, 255, 0.2)"
              : "rgba(0, 0, 0, 0.1)",
            borderWidth: 1,
          },
        },
      },
      elements: {
        line: {
          borderWidth: 2,
        },
        point: {
          radius: 3,
          hitRadius: 10,
          hoverRadius: 5,
        },
      },
    };
  };

  // Fetch products only once when component mounts
  useEffect(() => {
    fetchProducts();
  }, []); // Empty dependency array to run only once

  // Prepare chart data whenever products change
  useEffect(() => {
    if (products.length > 0) {
      prepareChartData();
    }
  }, [products]);

  const fetchProducts = async () => {
    if (!currentUser?.baseID) {
      setLoading(false);
      setError("Please sign in to view analytics");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `${getBaseUrl()}/user/products/?userId=${currentUser.baseID}`
      );

      if (response.data && response.data.payload) {
        setProducts(response.data.payload || []);
      } else {
        setProducts([]);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching products for analytics:", err);
      setError("Failed to load product data. Please try again.");
      setLoading(false);
    }
  };

  const prepareChartData = () => {
    // Generate real inventory data visualizations based on products
    prepareCategoryChartData();
    prepareInventoryChartData();
    preparePriceRangeData();
  };

  const prepareCategoryChartData = () => {
    const isDarkTheme = theme === "dark";
    // Count products by category
    const categoryCount = {};
    products.forEach((product) => {
      const category = product.pCat || "Uncategorized";
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    // Convert to arrays for chart
    const categories = Object.keys(categoryCount);
    const counts = Object.values(categoryCount);

    // Generate colors for each category with better opacity for light mode
    const backgroundColors = [
      "#e85f5c", // accent color
      "#667eea",
      "#764ba2",
      "#6B8E23",
      "#FFB347",
      "#FF6B6B",
      "#4682B4",
    ];

    // Ensure we have enough colors
    while (backgroundColors.length < categories.length) {
      backgroundColors.push(
        `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
          Math.random() * 255
        )}, ${Math.floor(Math.random() * 255)}, 0.8)`
      );
    }

    setCategoryChartData({
      labels: categories,
      datasets: [
        {
          data: counts,
          backgroundColor: backgroundColors,
          hoverBackgroundColor: backgroundColors.map((color) => {
            // Make hover color slightly brighter
            return color.startsWith("#") ? color : color.replace("0.8", "0.9");
          }),
          borderColor:
            theme === "dark"
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(255, 255, 255, 1)",
          borderWidth: 2,
          color: isDarkTheme ? "#e9ecef" : "#495057",
        },
      ],
    });
  };

  const prepareInventoryChartData = () => {
    // Extract product names and quantities
    const productNames = products.map((p) => p.pName).slice(0, 10); // Limit to 10 products
    const quantities = products.map((p) => p.pQuantity).slice(0, 10);

    setInventoryChartData({
      labels: productNames,
      datasets: [
        {
          label: "Current Stock",
          backgroundColor: "rgba(118, 75, 162, 0.8)",
          borderColor: "#764ba2",
          borderWidth: 1,
          data: quantities,
          barThickness: "flex",
          maxBarThickness: 35,
        },
      ],
    });
  };

  const preparePriceRangeData = () => {
    // Define price ranges
    const ranges = [
      { label: "₹0-500", min: 0, max: 500 },
      { label: "₹501-1000", min: 501, max: 1000 },
      { label: "₹1001-2000", min: 1001, max: 2000 },
      { label: "₹2001-5000", min: 2001, max: 5000 },
      { label: "₹5001+", min: 5001, max: Infinity },
    ];

    // Count products in each price range
    const counts = ranges.map((range) => {
      return products.filter(
        (p) => p.pPrice >= range.min && p.pPrice <= range.max
      ).length;
    });

    setPriceRangeData({
      labels: ranges.map((r) => r.label),
      datasets: [
        {
          label: "Products",
          backgroundColor: "rgba(102, 126, 234, 0.8)",
          borderColor: "rgb(102, 126, 234)",
          borderWidth: 1,
          data: counts,
          barThickness: "flex",
          maxBarThickness: 50,
        },
      ],
    });
  };

  const exportToPDF = async () => {
  if (!chartsRef.current) {
    console.error("Charts reference is not available");
    setError("Cannot generate PDF: charts not found");
    return;
  }

  try {
    const pdf = new jsPDF("portrait", "mm", "a4");
    // PDF metadata
    pdf.setProperties({
      title: "Inventory Analytics Report",
      author: "Nihesh Rachakonda",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = { top: 20, left: 20, right: 20, bottom: 20 };
    const usableWidth = pageWidth - margin.left - margin.right;
    let y = margin.top;

    // — HEADER —
    pdf.setFontSize(20);
    pdf.setTextColor(232, 95, 92);
    pdf.text("Inventory Analytics Report", pageWidth / 2, y, {
      align: "center",
    });
    y += 8;
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text(currentUser.company, pageWidth / 2, y, { align: "center" });
    y += 8;
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(
      `Generated on: ${new Date().toLocaleString()}`,
      pageWidth / 2,
      y,
      { align: "center" }
    );
    y += 12;

    // Seller Info
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Seller ID: ${currentUser.baseID}`, margin.left, y);
    pdf.text(`Total Products: ${products.length}`, margin.left, y + 7);
    y += 15;

    // Preload logo for footer
    const imgLogo = new Image();
    imgLogo.src = logo;
    await new Promise((res) => (imgLogo.onload = res));

    // — INSIGHTS —
    const insightsSection = chartsRef.current.querySelector(
      ".analytics-insights"
    );
    if (insightsSection) {
      const canvas = await html2canvas(insightsSection, {
        scale: 2,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const imgW = usableWidth;
      const imgH = (canvas.height * imgW) / canvas.width;
      const imgX = margin.left + (usableWidth - imgW) / 2;
      if (y + imgH > pageHeight - margin.bottom) {
        pdf.addPage();
        y = margin.top;
      }
      pdf.addImage(imgData, "PNG", imgX, y, imgW, imgH);
      y += imgH + 12;
    }

    // — CHARTS —
    const cards = chartsRef.current.querySelectorAll(".analytics-card");
    for (let card of cards) {
      const canvas = await html2canvas(card, {
        scale: 2,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const imgW = usableWidth;
      const imgH = (canvas.height * imgW) / canvas.width;
      const imgX = margin.left + (usableWidth - imgW) / 2;
      if (y + imgH > pageHeight - margin.bottom) {
        pdf.addPage();
        y = margin.top;
      }
      pdf.addImage(imgData, "PNG", imgX, y, imgW, imgH);
      y += imgH + 12;
    }

    // — FOOTER —
    if (y > pageHeight - margin.bottom) {
      pdf.addPage();
      y = margin.top;
    }
    const footerY = pageHeight - margin.bottom + 5;
    pdf.setDrawColor(232, 95, 92);
    pdf.setLineWidth(0.5);
    pdf.line(margin.left, footerY, pageWidth - margin.right, footerY);

    // logo centered above footer line
    const logoW = 20;
    const logoH = (imgLogo.height * logoW) / imgLogo.width;
    const logoX = pageWidth / 2 - logoW / 2;
    pdf.addImage(imgLogo, "PNG", logoX, footerY - logoH - 3, logoW, logoH);

    // footer text
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text(
      "Report generated using Nihesh's Seller Portal",
      pageWidth / 2,
      footerY + 5,
      { align: "center" }
    );
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text(
      `© Nihesh's Seller Portal 2025`,
      pageWidth / 2,
      footerY + 10,
      { align: "center" }
    );

    // — SAVE —
    pdf.save("inventory-analytics-report.pdf");
  } catch (err) {
    console.error("Error generating PDF:", err);
    setError("Failed to generate PDF. Please try again.");
  }
};

  if (!currentUser?.baseID) {
    return (
      <div className="container analytics-container mt-5">
        <div className="text-center p-5">
          <h2>Please sign in to view analytics</h2>
          <p>You need to be logged in to access your inventory analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container analytics-container mt-5">
      <div className="analytics-header d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0 d-flex flex-wrap align-items-center justify-content-center">
          <FaChartPie
            className="me-2"
            style={{ color: "var(--accent-color)" }}
          />
          <span className="me-2">Inventory Analytics of</span>
          <span
            className="fw-bold align-self-center justify-content-center"
            style={{
              textDecoration: "underline",
              textDecorationStyle: "dotted",
            }}
          >
            {currentUser.company}
          </span>
        </h2>

        <div className="d-flex align-items-center">
          <Button
            icon={<FaFileDownload className="me-2" />}
            label="Export Report"
            onClick={exportToPDF}
            className="export-btn"
            disabled={loading || products.length === 0}
          />
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="text-center p-5">
          <ProgressSpinner
            style={{ width: "50px", height: "50px" }}
            strokeWidth="4"
            animationDuration=".5s"
          />
          <p className="mt-3">Loading analytics data...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-analytics text-center p-5">
          <FaChartPie
            size={48}
            className="mb-3"
            style={{ color: "var(--accent-color)" }}
          />
          <h3>No data available</h3>
          <p>Add products to your inventory to generate analytics</p>
          <Button
            label="Add Products"
            className="mt-3"
            onClick={() => (window.location.href = "/pro")}
          />
        </div>
      ) : (
        <div ref={chartsRef} className="charts-container">
          {/* Key Insights Section - Now First */}
          <div className="analytics-section mb-5">
            <div className="analytics-insights highlight-card">
              <h4 className="text-center mb-4">Key Inventory Highlights</h4>

              <div className="row insight-highlights">
                <div className="col-md-4">
                  <div className="insight-highlight-card">
                    <div className="insight-icon">
                      <FaStar style={{ color: "var(--accent-color)" }} />
                    </div>
                    <h5>Most Stocked Product</h5>
                    <div className="insight-product-name">
                      {
                        products.reduce((prev, current) =>
                          prev.pQuantity > current.pQuantity ? prev : current
                        ).pName
                      }
                    </div>
                    <div className="insight-count">
                      <CountUp
                        to={
                          products.reduce((prev, current) =>
                            prev.pQuantity > current.pQuantity ? prev : current
                          ).pQuantity
                        }
                        duration={2}
                        separator=","
                        className="highlight-count"
                      />{" "}
                      <span>units</span>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="insight-highlight-card">
                    <div className="insight-icon">
                      <FaTag style={{ color: "var(--accent-color)" }} />
                    </div>
                    <h5>Highest Price Item</h5>
                    <div className="insight-product-name">
                      {
                        products.reduce((prev, current) =>
                          prev.pPrice > current.pPrice ? prev : current
                        ).pName
                      }
                    </div>
                    <div className="insight-count">
                      ₹
                      <CountUp
                        to={
                          products.reduce((prev, current) =>
                            prev.pPrice > current.pPrice ? prev : current
                          ).pPrice
                        }
                        duration={2}
                        separator=","
                        className="highlight-count"
                      />
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="insight-highlight-card">
                    <div className="insight-icon">
                      <FaMoneyBillWave
                        style={{ color: "var(--accent-color)" }}
                      />
                    </div>
                    <h5>Total Inventory Value</h5>
                    <div className="insight-product-name text-sm mb-1">
                      Stock Value
                    </div>
                    <div className="insight-count larger">
                      ₹
                      <CountUp
                        to={products.reduce(
                          (sum, product) =>
                            sum + product.pPrice * product.pQuantity,
                          0
                        )}
                        duration={2.5}
                        separator=","
                        className="highlight-count"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Original Charts - Now follow after the insights */}
          <div className="analytics-section row">
            <div className="col-md-6">
              <div className="analytics-card">
                <div className="analytics-card-header">
                  <h4>
                    <FaChartPie className="me-2" />
                    Category Distribution
                  </h4>
                </div>
                <div className="analytics-card-body">
                  <Chart
                    type="pie"
                    data={categoryChartData}
                    options={{
                      ...getChartOptions("Products by Category"),
                      plugins: {
                        ...getChartOptions("Products by Category").plugins,
                        legend: {
                          display: false, // Hide the legend completely
                        },
                        tooltip: {
                          callbacks: {
                            // Show category and value in tooltip
                            label: function (context) {
                              const label = context.label || "";
                              const value = context.parsed || 0;
                              const total = context.dataset.data.reduce(
                                (a, b) => a + b,
                                0
                              );
                              const percentage = Math.round(
                                (value / total) * 100
                              );
                              return `${label}: ${value} (${percentage}%)`;
                            },
                          },
                        },
                      },
                    }}
                    className={`pie-chart-${theme}`}
                  />
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="analytics-card">
                <div className="analytics-card-header">
                  <h4>
                    <FaChartBar className="me-2" />
                    Price Distribution
                  </h4>
                </div>
                <div className="analytics-card-body">
                  <Chart
                    type="bar"
                    data={priceRangeData}
                    options={getChartOptions("Products by Price Range")}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="analytics-section">
            <div className="analytics-card">
              <div className="analytics-card-header">
                <h4>
                  <FaChartBar className="me-2" />
                  Inventory Levels
                </h4>
              </div>
              <div className="analytics-card-body">
                <Chart
                  type="bar"
                  data={inventoryChartData}
                  options={getChartOptions("Current Stock by Product")}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Analytics;
