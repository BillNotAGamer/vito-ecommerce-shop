"use client";

import { AppHeader } from "./header";
import { Sidebar, SidebarInsetMain, defaultSidebarLinks } from "./sidebar";

export function AppShell({
  children,
  withSidebar = false,
}: {
  children: React.ReactNode;
  withSidebar?: boolean;
}) {
  return (
    <div className="min-h-svh">
      <AppHeader />
      <div className="flex">
        {withSidebar && <Sidebar links={defaultSidebarLinks} />}
        {withSidebar ? (
          <SidebarInsetMain>
            <div className="container py-6">{children}</div>
          </SidebarInsetMain>
        ) : (
          <main className="container py-6 flex-1">{children}</main>
        )}
      </div>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <div className="container">© {new Date().getFullYear()} Vito Atelier</div>
      </footer>
    </div>
  );
}
