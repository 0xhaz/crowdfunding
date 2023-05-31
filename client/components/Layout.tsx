import React from "react";
import { Sidebar, Navbar } from "./";

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="relative sm:-8 p-4 bg-[#111827] min-h-screen flex flex-row ">
      <div className="sm:flex hidden mr-10 relative">
        <Sidebar />
      </div>
      <div className="flex-1 max-sm:w-full max-w-[1280px] mx-auto sm:pr-5">
        <Navbar />
        <main>{children}</main>
      </div>
    </div>
  );
};

export default Layout;
