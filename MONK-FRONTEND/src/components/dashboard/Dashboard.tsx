import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";
import {
  Building2, Leaf, Clock, ShieldCheck, Plus, ArrowRight,
  Layers, Database, FileSpreadsheet, Sparkles, TrendingUp,
  CheckCircle2, AlertCircle, FileText
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  DRAFT:                { label: "Draft",      color: "#d97706", bg: "rgba(217,119,6,0.12)",  dot: "#f59e0b" },
  SUBMITTED:            { label: "Submitted",  color: "#2563eb", bg: "rgba(37,99,235,0.12)",  dot: "#3b82f6" },
  UNDER_REVIEW:         { label: "In Review",  color: "#7c3aed", bg: "rgba(124,58,237,0.12)", dot: "#8b5cf6" },
  CORRECTIONS_REQUIRED: { label: "Corrections",color: "#ea580c", bg: "rgba(234,88,12,0.12)",  dot: "#f97316" },
  APPROVED:             { label: "Approved",   color: "#059669", bg: "rgba(5,150,105,0.12)",  dot: "#10b981" },
  LCA_COMPLETED:        { label: "Completed",  color: "#0f766e", bg: "rgba(15,118,110,0.12)", dot: "#14b8a6" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: "#6b7280", bg: "rgba(107,114,128,0.1)", dot: "#9ca3af" };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px', borderRadius: 99,
      fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
      color: cfg.color, background: cfg.bg,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dot, display: 'inline-block' }} />
      {cfg.label.toUpperCase()}
    </span>
  );
}

interface KpiCardProps {
  label: string;
  value: number | string;
  sub: string;
  icon: React.ElementType;
  accent: string;
  glow: string;
}

function KpiCard({ label, value, sub, icon: Icon, accent, glow }: KpiCardProps) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
      border: `1px solid rgba(255,255,255,0.07)`,
      borderRadius: 16, padding: '22px 20px',
      position: 'relative', overflow: 'hidden',
      transition: 'all 0.25s ease',
      cursor: 'default',
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLElement).style.border = `1px solid ${accent}40`;
      (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
      (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${glow}`;
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLElement).style.border = '1px solid rgba(255,255,255,0.07)';
      (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
      (e.currentTarget as HTMLElement).style.boxShadow = 'none';
    }}>
      {/* Glow spot */}
      <div style={{
        position: 'absolute', top: -20, right: -20, width: 80, height: 80,
        borderRadius: '50%', background: glow, filter: 'blur(24px)',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {label}
        </span>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: `${accent}18`, border: `1px solid ${accent}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={16} color={accent} />
        </div>
      </div>
      <div style={{ fontSize: 36, fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-1px', marginBottom: 6 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{sub}</div>
    </div>
  );
}

export function Dashboard() {
  const { user } = useAuth();

  const { data: vendors } = useQuery({
    queryKey: ["vendors"],
    queryFn: async () => {
      const res = await api.get("/vendors");
      return res.data?.data || [];
    }
  });

  const { data: projects } = useQuery({
    queryKey: ["lca-projects"],
    queryFn: async () => {
      const res = await api.get("/lca-projects");
      return res.data?.data || [];
    }
  });

  const totalVendors   = vendors?.length || 0;
  const totalProjects  = projects?.length || 0;
  const pendingReviews = projects?.filter((p: any) => p.status === "SUBMITTED" || p.status === "UNDER_REVIEW").length || 0;
  const approvedProjects = projects?.filter((p: any) => p.status === "APPROVED" || p.status === "LCA_COMPLETED").length || 0;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080e18', padding: '28px 28px 40px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* ─── Welcome Banner ─── */}
        <div style={{
          borderRadius: 24,
          background: 'linear-gradient(135deg, #052e16 0%, #064e3b 35%, #0c4a6e 100%)',
          border: '1px solid rgba(16,185,129,0.2)',
          padding: '36px 40px',
          marginBottom: 28,
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 0 80px rgba(5,150,105,0.12)',
        }}>
          {/* Decorative glows */}
          <div style={{ position: 'absolute', top: -60, right: 60, width: 300, height: 300, background: 'radial-gradient(circle, rgba(5,150,105,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -40, right: -40, width: 200, height: 200, background: 'radial-gradient(circle, rgba(8,145,178,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 99, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', marginBottom: 16 }}>
              <Sparkles size={11} color="#34d399" />
              <span style={{ fontSize: 10, fontWeight: 700, color: '#34d399', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Environmental Data Platform v1.0
              </span>
            </div>

            <h1 style={{ fontSize: 30, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', marginBottom: 8 }}>
              {greeting()}, {user?.firstName || user?.name || "User"} 👋
            </h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', maxWidth: 560, lineHeight: 1.7 }}>
              Centralized hub for Life Cycle Assessment (LCA), Environmental Product Declarations (EPD), and Digital Product Passports (DPP).
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 24 }}>
              <Link to="/vendors" style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '10px 20px', borderRadius: 10,
                background: 'linear-gradient(135deg, #059669, #0891b2)',
                fontSize: 12, fontWeight: 700, color: '#fff',
                boxShadow: '0 4px 20px rgba(5,150,105,0.35)',
                textDecoration: 'none', transition: 'all 0.2s ease',
              }}>
                <Plus size={14} /> Onboard Vendor Supplier
              </Link>
              <Link to="/projects" style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '10px 20px', borderRadius: 10,
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                fontSize: 12, fontWeight: 700, color: '#fff',
                textDecoration: 'none', backdropFilter: 'blur(8px)',
              }}>
                <Leaf size={14} /> New LCA Study
              </Link>
              <Link to="/reviews" style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '10px 20px', borderRadius: 10,
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                fontSize: 12, fontWeight: 700, color: '#fff',
                textDecoration: 'none', backdropFilter: 'blur(8px)',
              }}>
                <ShieldCheck size={14} style={{ color: '#34d399' }} /> Review Workspace
              </Link>
            </div>
          </div>
        </div>

        {/* ─── KPI Cards ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
          <KpiCard label="Onboarded Vendors"   value={totalVendors}    sub="Active supply chain partners"    icon={Building2}   accent="#10b981" glow="rgba(16,185,129,0.15)" />
          <KpiCard label="Active LCA Projects"  value={totalProjects}   sub="Product study questionnaires"    icon={Leaf}        accent="#14b8a6" glow="rgba(20,184,166,0.15)" />
          <KpiCard label="Pending Reviews"      value={pendingReviews}  sub="Submissions awaiting audit"      icon={Clock}       accent="#6366f1" glow="rgba(99,102,241,0.15)" />
          <KpiCard label="Verified Datasets"    value={approvedProjects} sub="Approved for LCA / EPD / DPP"   icon={ShieldCheck} accent="#f59e0b" glow="rgba(245,158,11,0.15)" />
        </div>

        {/* ─── Two column grid ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, marginBottom: 20 }}>

          {/* Recent Projects */}
          <div style={{
            background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 20, overflow: 'hidden',
          }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={15} color="#10b981" /> Recent LCA Submissions
              </h2>
              <Link to="/projects" style={{ fontSize: 11, fontWeight: 700, color: '#10b981', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                View All <ArrowRight size={12} />
              </Link>
            </div>

            {!projects?.length ? (
              <div style={{ padding: 48, textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>
                No projects yet. Create your first LCA study.
              </div>
            ) : (
              <div>
                {projects?.slice(0, 6).map((proj: any, i: number) => (
                  <div key={proj._id} style={{
                    padding: '14px 22px',
                    borderBottom: i < Math.min((projects?.length || 0), 6) - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {proj.title}
                        </span>
                        <StatusBadge status={proj.status} />
                      </div>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                        {proj.vendorId?.name || 'Unknown Vendor'} · {proj.systemBoundary?.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <Link to="/projects" style={{
                      padding: '5px 12px', borderRadius: 7, fontSize: 11, fontWeight: 700,
                      background: 'rgba(16,185,129,0.12)', color: '#10b981',
                      border: '1px solid rgba(16,185,129,0.2)', textDecoration: 'none',
                      whiteSpace: 'nowrap', flexShrink: 0,
                    }}>
                      Open →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Data Flow / Architecture */}
          <div style={{
            background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 20, padding: '18px 20px',
          }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers size={15} color="#10b981" /> Data Flow
            </h2>

            {[
              { step: '01', icon: Building2, color: '#10b981', glow: 'rgba(16,185,129,0.2)', title: 'Vendor Onboarding', desc: 'Admin invites suppliers with login credentials.' },
              { step: '02', icon: Database,  color: '#6366f1', glow: 'rgba(99,102,241,0.2)',  title: 'LCA Data Entry',    desc: 'Vendor fills materials, energy, transport & waste.' },
              { step: '03', icon: ShieldCheck, color: '#f59e0b', glow: 'rgba(245,158,11,0.2)', title: 'Audit & Verify',   desc: 'Reviewer audits data and issues verified status.' },
              { step: '04', icon: FileSpreadsheet, color: '#14b8a6', glow: 'rgba(20,184,166,0.2)', title: 'LCA / EPD / DPP', desc: 'Verified dataset reused across multiple reports.' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i < 3 ? 16 : 0, position: 'relative' }}>
                  {i < 3 && (
                    <div style={{ position: 'absolute', left: 17, top: 36, bottom: -16, width: 1, background: 'rgba(255,255,255,0.07)' }} />
                  )}
                  <div style={{
                    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                    background: item.glow, border: `1px solid ${item.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={14} color={item.color} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <span style={{ fontSize: 9, fontWeight: 800, color: item.color, letterSpacing: '0.1em' }}>{item.step}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{item.title}</span>
                    </div>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Quick Stats Bar ─── */}
        <div style={{
          background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 16, padding: '16px 24px',
          display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={14} color="#10b981" />
            <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>Platform Health:</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#10b981' }}>Operational</span>
          </div>
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.07)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={14} color="#6366f1" />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Completion Rate:</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#fff' }}>
              {totalProjects > 0 ? Math.round((approvedProjects / totalProjects) * 100) : 0}%
            </span>
          </div>
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.07)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={14} color="#f59e0b" />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Pending Action:</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: pendingReviews > 0 ? '#f59e0b' : '#fff' }}>
              {pendingReviews} review{pendingReviews !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
