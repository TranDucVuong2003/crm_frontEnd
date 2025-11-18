import React from "react";
import MainLayout from "../Layout/MainLayout";
import Dashboard from "../Components/Dashboard";
import CustomerManagement from "../Components/Customers/CustomerManagement";
import { createBrowserRouter, Outlet } from "react-router-dom";
import AuthLayout from "../Layout/AuthLayout";
import { RouterProvider } from "react-router";
import Login from "../Components/Login";
import SalesPipeline from "../Components/Sale order/SalesPipeline";
import Contract from "../Components/Contract/Contract";
import Tasks from "../Components/Tasks";
import Service from "../Components/Service";
import Addons from "../Components/Addons/Addons";
import Report from "../Components/Report";
import Usermanagement from "../Components/Usermanagement";
import Support from "../Components/Support";
import Helpdesk from "../Components/Helpdesk/Helpdesk";
import TicketForm from "../Components/Helpdesk/TicketForm";
import TicketEditPage from "../Components/Helpdesk/TicketEditPage";
import TicketCreatePage from "../Components/Helpdesk/TicketCreatePage";
import TicketCategory from "../Components/TicketCategory/TicketCategory";
import CategoryServiceAddons from "../Components/CategoryServiceAddons/CategoryServiceAddons";
import Quote from "../Components/Quote/Quote";
import QuoteCreatePage from "../Components/Quote/QuoteCreatePage";
import QuoteEditPage from "../Components/Quote/QuoteEditPage";
import SessionManagement from "../Components/SessionManagement";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import Test_contact from "../Components/test_contact";
import BankTransactionHistory from "../Components/test_api_mb";

function AppRouter() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <MainLayout>
            <Outlet />
          </MainLayout>
        </ProtectedRoute>
      ),
      children: [
        {
          path: "",
          element: <Dashboard />,
        },
        {
          path: "test-contact",
          element: <Test_contact />,
        },
        {
          path: "test-bank-api",
          element: <BankTransactionHistory />,
        },
        {
          path: "customers",
          element: <CustomerManagement />,
        },
        {
          path: "sales",
          element: <SalesPipeline />,
        },
        {
          path: "contract",
          element: <Contract />,
        },
        {
          path: "tasks",
          element: <Tasks />,
        },
        {
          path: "service",
          element: (
            <ProtectedRoute allowedRoles={["admin"]}>
              <Service />
            </ProtectedRoute>
          ),
        },
        {
          path: "addons",
          element: (
            <ProtectedRoute allowedRoles={["admin"]}>
              <Addons />
            </ProtectedRoute>
          ),
        },
        {
          path: "category-service-addons",
          element: (
            <ProtectedRoute allowedRoles={["admin"]}>
              <CategoryServiceAddons />
            </ProtectedRoute>
          ),
        },
        {
          path: "quotes",
          element: <Outlet />,
          children: [
            { path: "", element: <Quote /> },
            { path: "create", element: <QuoteCreatePage /> },
            { path: "edit/:id", element: <QuoteEditPage /> },
          ],
        },
        {
          path: "support",
          element: <Support />,
        },
        {
          path: "reports",
          element: (
            <ProtectedRoute allowedRoles={["admin"]}>
              <Report />
            </ProtectedRoute>
          ),
        },
        {
          path: "usermanagement",
          element: (
            <ProtectedRoute allowedRoles={["admin"]}>
              <Usermanagement />
            </ProtectedRoute>
          ),
        },
        {
          path: "helpdesk",
          element: <Outlet />,
          children: [
            { path: "", element: <Helpdesk /> },
            { path: "create", element: <TicketCreatePage /> },
            { path: ":ticketId", element: <TicketEditPage /> },
          ],
        },
        {
          path: "ticket-categories",
          element: <TicketCategory />,
        },
        {
          path: "sessions",
          element: <SessionManagement />,
        },
      ],
    },
    {
      path: "/login",
      element: (
        <PublicRoute>
          <AuthLayout />
        </PublicRoute>
      ),
      children: [
        {
          path: "",
          element: <Login />,
        },
      ],
    },

    {
      path: "*",
      element: <p>404 not found</p>,
    },
  ]);

  return <RouterProvider router={router} />;
}

export default AppRouter;
