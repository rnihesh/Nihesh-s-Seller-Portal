import React from "react";
import Header from "./common/Header";
import Footer from "./common/Footer";
import { Outlet } from "react-router-dom";
import ThemeDebugger from "./utils/ThemeDebugger";

import { PrimeReactProvider } from "primereact/api";
import { ClerkProvider } from "@clerk/clerk-react";

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

function RootLayout({ pageProps }) {
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
        </div>
      </PrimeReactProvider>
    </ClerkProvider>
  );
}

export default RootLayout;
