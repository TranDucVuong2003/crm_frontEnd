import React from "react";
import { Outlet } from "react-router";
import SideBar from "../Components/SideBar";
import Header from "../Components/Header";

function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <SideBar />
      
      {/* Main content - offset by sidebar width on medium screens and up */}
      <div className="md:ml-64 min-h-screen flex flex-col">
        {/* Header */}
        <Header />
        
        {/* Page content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
