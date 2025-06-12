import React, { useState, useEffect, useRef, useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext"; // Import existing ThemeContext
import { getBaseUrl } from "../../utils/config";
import axios from "axios";
import { Chart } from "primereact/chart";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { FaFileDownload, FaChartPie, FaChartBar } from "react-icons/fa";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./Analytics.css";

function Analytics() {
  const { theme } = useContext(ThemeContext); // Use the ThemeContext
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
      // Make sure jsPDF is properly instantiated
      const pdf = new jsPDF("portrait", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      console.log("Starting PDF generation...");

      // Add title
      pdf.setFontSize(20);
      pdf.setTextColor(232, 95, 92);
      pdf.text("Inventory Analytics Report", pdfWidth / 2, 20, {
        align: "center",
      });

      // Add company name
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`${currentUser.company}`, pdfWidth / 2, 30, {
        align: "center",
      });

      // Add timestamp
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(
        `Generated on: ${new Date().toLocaleString()}`,
        pdfWidth / 2,
        37,
        { align: "center" }
      );

      // Add seller info
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Seller ID: ${currentUser.baseID}`, 20, 50);
      pdf.text(`Total Products: ${products.length}`, 20, 57);

      console.log("PDF completed upto text");
      // Get all chart elements
      const charts = chartsRef.current.querySelectorAll(".analytics-card");

      let yPosition = 65; // Adjusted for the added company name

      for (let i = 0; i < charts.length; i++) {
        const chart = charts[i];

        // Check if we need to add a new page
        if (i > 0 && yPosition > pdfHeight - 70) {
          pdf.addPage();
          yPosition = 20;
        }

        const canvas = await html2canvas(chart, {
          scale: 2,
          backgroundColor: theme === "dark" ? "#ffffff" : "#ffffff",
        });

        const imgData = canvas.toDataURL("image/png");

        // Calculate image width and height to fit on page
        const imgWidth = pdfWidth - 40; // 20mm margin on each side
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 20, yPosition, imgWidth, imgHeight);

        yPosition += imgHeight + 20; // Add 20mm spacing between charts
      }

      // Add insights section
      if (yPosition > pdfHeight - 90) {
        pdf.addPage();
        yPosition = 20;
      }

      const insightsSection = chartsRef.current.querySelector(
        ".analytics-insights"
      );
      const insightsCanvas = await html2canvas(insightsSection, {
        scale: 2,
        backgroundColor: theme === "dark" ? "#2b3035" : "#ffffff",
      });

      const insightsImgData = insightsCanvas.toDataURL("image/png");
      const insightsWidth = pdfWidth - 40;
      const insightsHeight =
        (insightsCanvas.height * insightsWidth) / insightsCanvas.width;

      pdf.addImage(
        insightsImgData,
        "PNG",
        20,
        yPosition,
        insightsWidth,
        insightsHeight
      );
      console.log("Completed upto all charts");

      // Load and add logo image
      const img = new Image();
      img.src = "../../src/assets/image2.png";
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      console.log("image setting : ", img);

      // Position logo centered above the line
      const logoWidth = 30; // width in mm
      const logoHeight = 25; // height in mm
      pdf.addImage(
        img,
        "PNG",
        (pdfWidth - logoWidth) / 2,
        pdfHeight - 55,
        logoWidth,
        logoHeight
      );

      console.log("Will start footer pdf");
      // Add branded footer on the last page
      pdf.setDrawColor(232, 95, 92); // accent color
      pdf.setLineWidth(0.5);
      pdf.line(20, pdfHeight - 25, pdfWidth - 20, pdfHeight - 25);

      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text(
        "Report generated using Nihesh's Seller Portal",
        pdfWidth / 2,
        pdfHeight - 18,
        {
          align: "center",
        }
      );

      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(
        "© Nihesh's Seller Portal 2025",
        pdfWidth / 2,
        pdfHeight - 12,
        {
          align: "center",
        }
      );

      // Save PDF
      pdf.save("inventory-analytics-report.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
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
                            label: function(context) {
                              const label = context.label || '';
                              const value = context.parsed || 0;
                              const total = context.dataset.data.reduce((a, b) => a + b, 0);
                              const percentage = Math.round((value / total) * 100);
                              return `${label}: ${value} (${percentage}%)`;
                            }
                          }
                        }
                      }
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

          <div className="analytics-section">
            <div className="analytics-insights">
              <h4>Key Inventory Insights</h4>
              <ul className="insights-list">
                {products.length > 0 && (
                  <>
                    <li className="insight-item">
                      <span className="insight-title">
                        Most Stocked Product:
                      </span>
                      <span className="insight-value">
                        {
                          products.reduce((prev, current) =>
                            prev.pQuantity > current.pQuantity ? prev : current
                          ).pName
                        }{" "}
                        (
                        {
                          products.reduce((prev, current) =>
                            prev.pQuantity > current.pQuantity ? prev : current
                          ).pQuantity
                        }{" "}
                        units)
                      </span>
                    </li>
                    <li className="insight-item">
                      <span className="insight-title">Highest Price Item:</span>
                      <span className="insight-value">
                        {
                          products.reduce((prev, current) =>
                            prev.pPrice > current.pPrice ? prev : current
                          ).pName
                        }{" "}
                        (₹
                        {
                          products.reduce((prev, current) =>
                            prev.pPrice > current.pPrice ? prev : current
                          ).pPrice
                        }
                        )
                      </span>
                    </li>
                    <li className="insight-item">
                      <span className="insight-title">
                        Total Inventory Value:
                      </span>
                      <span className="insight-value">
                        ₹
                        {products
                          .reduce(
                            (sum, product) =>
                              sum + product.pPrice * product.pQuantity,
                            0
                          )
                          .toLocaleString()}
                      </span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Analytics;
