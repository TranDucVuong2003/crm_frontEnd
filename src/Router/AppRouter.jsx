import React from 'react'
import MainLayout from '../Layout/MainLayout';
import Dashboard from '../Components/Dashboard';
import CustomerManagement from '../Components/Customers/CustomerManagement';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import AuthLayout from '../Layout/AuthLayout';
import { RouterProvider } from 'react-router';
import Login from '../Components/Login';
import SalesPipeline from '../Components/Sale order/SalesPipeline';
import Tasks from '../Components/Tasks';
import Service from '../Components/Service';
import Addons from '../Components/Addons/Addons';
import Report from '../Components/Report';
import Usermanagement from '../Components/Usermanagement';
import Support from '../Components/Support';
import Helpdesk from '../Components/Helpdesk/Helpdesk';
import TicketForm from '../Components/Helpdesk/TicketForm';
import TicketEditPage from '../Components/Helpdesk/TicketEditPage';
import TicketCreatePage from '../Components/Helpdesk/TicketCreatePage';
import SessionManagement from '../Components/SessionManagement';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

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
          path: "customers",
          element: <CustomerManagement />,
        },
        {
          path: "sales",
          element: <SalesPipeline />,
        },
        {
          path: "tasks",
          element: <Tasks />,
        },
        {
          path: "service",
          element: <Service />,
        },
        {
          path: "addons",
          element: <Addons />,
        },
        {
          path: "support",
          element: <Support />,
        },
        {
          path: "reports",
          element: <Report />,
        },
        {
          path: "usermanagement",
          element: <Usermanagement />,
        },
        {
          path: "helpdesk",
          element: <Outlet />,
          children: [
            {path: "", element: <Helpdesk />},
            {path: "create", element: <TicketCreatePage />},
            {path: ":ticketId", element: <TicketEditPage />}
          ]
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

export default AppRouter
