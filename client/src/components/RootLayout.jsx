import React, { useContext, useEffect } from "react";
import Header from "./common/Header";
import Footer from "./common/Footer";
import { Outlet } from "react-router-dom";
import ThemeDebugger from "./utils/ThemeDebugger";
import { getBaseUrl } from "../utils/config";

import { PrimeReactProvider } from "primereact/api";
import { ClerkProvider } from "@clerk/clerk-react";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThemeContext } from "./contexts/ThemeContext";

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

function RootLayout({ pageProps }) {
  const { theme } = useContext(ThemeContext);
  useEffect(() => {
    const pingBackend = async () => {
      console.log("Ping backend started...");
      console.log("Base URL:", getBaseUrl());

      const pingPromise = fetch(`${getBaseUrl()}/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(30000),
      }).then(async (response) => {
        console.log("Response status:", response.status);

        if (response.ok) {
          const data = await response.text();
          console.log("Response data:", data);
          return data;
        } else {
          throw new Error(`Server responded with status: ${response.status}`);
        }
      });

      // Use toast.promise for automatic loading/success/error handling
      toast.promise(
        pingPromise,
        {
          pending: "Waking up server, please wait...",
          success: "Server is ready! 🎉",
          error: {
            render({ data }) {
              console.error("Connection error:", data);
              return `Failed to connect: ${data.message}`;
            },
          },
        },
        {
          autoClose: 2000,
        }
      );
    };

    // Run the ping
    pingBackend();

    // Once working, add the production check:
    // if (import.meta.env.MODE === "production") {
    //   pingBackend();
    // }
  }, []);
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <PrimeReactProvider>
        <div>
          <Header {...pageProps} />
          <div
            style={{ minHeight: "90vh", height: "100%", marginTop: "100px" }}
          >
            <Outlet {...pageProps} />
          </div>
          <Footer {...pageProps} />
          {/* <ThemeDebugger /> Keep this temporarily for debugging */}
          <ToastContainer
            position="bottom-right"
            autoClose={3000}
            theme={theme === "dark" ? "dark" : "light"}
            limit={1}
          />
        </div>
      </PrimeReactProvider>
    </ClerkProvider>
  );
}

export default RootLayout;
