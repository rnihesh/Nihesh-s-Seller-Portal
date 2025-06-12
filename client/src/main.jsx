import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./ThemeStyles.css";

import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import RootLayout from "./components/RootLayout";
import Home from "./components/common/Home";
import Signin from "./components/auth/SignIn";
import Signup from "./components/auth/SignUp";
import Dashboard from "./components/common/Dashboard";
import ProductForm from "./components/product/ProductForm";
import UserContext from "./components/contexts/UserContext";
import ThemeProvider from "./components/contexts/ThemeContext";
import Analytics from "./components/analyt/Analytics.jsx";

const browserRouterObj = createBrowserRouter(
  [
    {
      path: "/",
      element: <RootLayout />,
      children: [
        {
          path: "/",
          element: <Home />,
        },
        {
          path: "signin",
          element: <Signin />,
        },
        {
          path: "signup",
          element: <Signup />,
        },
        {
          path: "dashboard",
          element: <Dashboard />,
        },
        {
          path: "pro",
          element: <ProductForm />,
        },
        {
          path: "analytics",
          element: <Analytics />,
        },
      ],
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
    },
  }
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <UserContext>
        <RouterProvider
          router={browserRouterObj}
          future={{
            v7_startTransition: true,
          }}
        />
      </UserContext>
    </ThemeProvider>
  </StrictMode>
);
