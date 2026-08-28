import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { useAuth } from '@/lib/auth';
import { formatRole } from './ProfileModal';
import {
  LayoutDashboard, Building2, Leaf, ClipboardCheck,
  Users, ShieldCheck, LogOut, ChevronRight, FileCheck, Package
} from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  allowedRoles: string[];
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/",         label: "Dashboard",         icon: LayoutDashboard, allowedRoles: ["*"] },
  { to: "/vendors",  label: "Vendor Management",  icon: Building2,       allowedRoles: ["superadmin","super_admin","admin","reviewer"] },
  { to: "/projects", label: "LCA Projects",        icon: Leaf,            allowedRoles: ["*"] },
  { to: "/reviews",  label: "Review & Approvals",  icon: ClipboardCheck,  allowedRoles: ["superadmin","super_admin","admin","reviewer"] },
  { to: "/epd",      label: "EPD / ERD Module",   icon: FileCheck,       allowedRoles: ["*"] },
  { to: "/ppwr",     label: "PPWR Packaging",     icon: Package,         allowedRoles: ["*"] },
  { to: "/users",    label: "Users & Access",       icon: Users,           allowedRoles: ["superadmin","super_admin","admin"] },
  { to: "/roles",    label: "Roles & Permissions",  icon: ShieldCheck,     allowedRoles: ["superadmin","super_admin","admin"] },
];

export function SideNav({ onOpenProfile }: { onOpenProfile: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const userRole = (user?.role || '').toLowerCase().replace(/[\s_-]/g, '');
  const filteredItems = NAV_ITEMS.filter(item => {
    if (item.allowedRoles.includes("*")) return true;
    return item.allowedRoles.map(r => r.toLowerCase().replace(/[\s_-]/g, '')).includes(userRole);
  });

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/login", replace: true });
  };

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : "US";

  const isActive = (to: string) => {
    if (to === "/") return currentPath === "/";
    return currentPath.startsWith(to);
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-[260px] flex flex-col" style={{
      background: 'linear-gradient(180deg, #0a0f1a 0%, #0d1520 60%, #0a1010 100%)',
      borderRight: '1px solid rgba(16,185,129,0.12)',
    }}>
      {/* Logo */}
      <div className="px-5 py-6 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 20px rgba(5,150,105,0.4)',
          flexShrink: 0,
        }}>
          <Leaf size={18} className="text-white" />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
            MONKTRACE
          </div>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#34d399', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            LCA Environmental Platform
          </div>
        </div>
      </div>

      {/* Nav section label */}
      <div className="px-5 pt-5 pb-2">
        <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Navigation
        </span>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 flex flex-col gap-0.5 overflow-y-auto">
        {filteredItems.map(item => {
          const active = isActive(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                color: active ? '#fff' : 'rgba(255,255,255,0.45)',
                background: active
                  ? 'linear-gradient(135deg, rgba(5,150,105,0.35) 0%, rgba(13,148,136,0.2) 100%)'
                  : 'transparent',
                border: active ? '1px solid rgba(16,185,129,0.2)' : '1px solid transparent',
                transition: 'all 0.15s ease',
                textDecoration: 'none',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                  (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)';
                }
              }}
            >
              {active && (
                <div style={{
                  position: 'absolute', left: 0, top: '20%', bottom: '20%',
                  width: 3, borderRadius: 4,
                  background: 'linear-gradient(180deg, #10b981, #14b8a6)',
                  boxShadow: '0 0 8px rgba(16,185,129,0.6)',
                }} />
              )}
              <Icon size={15} style={{ color: active ? '#34d399' : 'inherit', flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {active && <ChevronRight size={12} style={{ color: '#34d399', opacity: 0.6 }} />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom user section */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '16px 12px 12px' }}>
        <div
          onClick={onOpenProfile}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px',
            borderRadius: 10,
            cursor: 'pointer',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            marginBottom: 8,
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
        >
          <div style={{
            width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #059669, #0891b2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 800, color: '#fff',
            boxShadow: '0 0 12px rgba(5,150,105,0.3)',
          }}>
            {initials}
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.firstName || user?.name || 'User'}
            </p>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {formatRole(user?.role || '')}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px', borderRadius: 8,
            fontSize: 12, fontWeight: 600, color: 'rgba(239,68,68,0.7)',
            background: 'transparent', border: 'none', cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)';
            (e.currentTarget as HTMLElement).style.color = '#ef4444';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.color = 'rgba(239,68,68,0.7)';
          }}
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
