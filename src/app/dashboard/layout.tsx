'use client';

import { Sidebar, SidebarProvider, useSidebar } from '@/components/dashboard';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <main className={`dashboard-content ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      {children}
    </main>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="dashboard-layout">
        <Sidebar />
        <DashboardContent>{children}</DashboardContent>
      </div>
    </SidebarProvider>
  );
}
