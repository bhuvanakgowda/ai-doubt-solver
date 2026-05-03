import { Toaster } from "@/components/ui/sonner";
import { Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <Header onMenuToggle={() => setSidebarOpen((v) => !v)} />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 min-w-0 overflow-auto bg-background">
          <Outlet />
        </main>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  );
}
