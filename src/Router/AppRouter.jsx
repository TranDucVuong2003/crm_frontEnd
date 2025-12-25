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
import Quote from "../Components/Quote/Quote";
import QuoteCreatePage from "../Components/Quote/QuoteCreatePage";
import QuoteEditPage from "../Components/Quote/QuoteEditPage";
import SessionManagement from "../Components/SessionManagement";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import Test_contact from "../Components/test_contact";
import LeadDataCompany from "../Components/LeadDataCompany";
import Configuration from "../Components/Configuration";
import UserProfile from "../Components/UserProfile/UserProfile";
import ActiveAccount from "../Pages/ActiveAccount";
import ChangePassword from "../Pages/ChangePassword";
import ForgotPassword from "../Pages/ForgotPassword";
import Salary from "../Components/Salary/Salary";
import DepartmentSalary from "../Components/Salary/DepartmentSalary";
import SalaryConfiguration from "../Components/Salary/SalaryConfiguration";
import AttendanceManagement from "../Components/Salary/AttendanceManagement";
import SalaryAdjustments from "../Components/Salary/SalaryAdjustments";
import PayslipManagement from "../Components/Salary/PayslipManagement";
import {
  KpiManagement,
  MyKpi,
  KpiLeaderboard,
  CommissionRates,
  KpiDashboard,
} from "../Components/KPI";

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
        // {
        //   path: "test-session",
        //   element: <TestAdminSession />,
        // },
        {
          path: "customers",
          element: <CustomerManagement />,
        },
        {
          path: "companies",
          element: <LeadDataCompany />,
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
        {
          path: "configuration",
          element: <Configuration />,
        },
        {
          path: "user-profile",
          element: <UserProfile />,
        },
        {
          path: "accounting",
          element: <Outlet />,
          children: [
            {
              path: "salary",
              element: <Salary />,
            },
            {
              path: "salary/configuration",
              element: <SalaryConfiguration />,
            },
            {
              path: "salary/attendance-management",
              element: <AttendanceManagement />,
            },
            {
              path: "salary/adjustments",
              element: <SalaryAdjustments />,
            },
            {
              path: "salary/payslips",
              element: (
                <ProtectedRoute allowedRoles={["admin"]}>
                  <PayslipManagement />
                </ProtectedRoute>
              ),
            },
            {
              path: "salary/department/:departmentId",
              element: <DepartmentSalary />,
            },
          ],
        },
        {
          path: "kpi",
          element: <Outlet />,
          children: [
            {
              path: "dashboard",
              element: (
                <ProtectedRoute allowedRoles={["admin"]}>
                  <KpiDashboard />
                </ProtectedRoute>
              ),
            },
            {
              path: "management",
              element: (
                <ProtectedRoute allowedRoles={["admin"]}>
                  <KpiManagement />
                </ProtectedRoute>
              ),
            },
            {
              path: "my-kpi",
              element: <MyKpi />,
            },
            {
              path: "leaderboard",
              element: <KpiLeaderboard />,
            },
            {
              path: "commission-rates",
              element: (
                <ProtectedRoute allowedRoles={["admin"]}>
                  <CommissionRates />
                </ProtectedRoute>
              ),
            },
          ],
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
      path: "/activate-account",
      element: <ActiveAccount />,
    },
    {
      path: "/change-password",
      element: <ChangePassword />,
    },
    {
      path: "/forgot-password",
      element: <ForgotPassword />,
    },

    {
      path: "*",
      element: <p>404 not found</p>,
    },
  ]);

  return <RouterProvider router={router} />;
}

export default AppRouter;
