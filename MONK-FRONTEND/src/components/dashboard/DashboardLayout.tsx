import { useState, type ReactNode } from "react";
import { SideNav } from "./SideNav";
import { TopNav } from "./TopNav";
import { ProfileModal } from "./ProfileModal";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: '#080e18', color: '#f1f5f9' }}>
      <SideNav onOpenProfile={() => setIsProfileOpen(true)} />
      <main className="ml-[260px] min-h-screen flex flex-col">
        <TopNav onOpenProfile={() => setIsProfileOpen(true)} />
        {children}
      </main>
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
}