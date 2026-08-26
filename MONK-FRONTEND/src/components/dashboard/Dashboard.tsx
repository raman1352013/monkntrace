import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { 
  Building2, Leaf, Clock, ShieldCheck, Plus, ArrowRight, 
  Layers, Database, FileSpreadsheet, Sparkles
} from "lucide-react";

export function Dashboard() {
  const { user } = useAuth();

  // Queries for real LCA platform data
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

  const totalVendors = vendors?.length || 0;
  const totalProjects = projects?.length || 0;
  const pendingReviews = projects?.filter((p: any) => p.status === "SUBMITTED" || p.status === "UNDER_REVIEW").length || 0;
  const approvedProjects = projects?.filter((p: any) => p.status === "APPROVED").length || 0;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-950 p-8 text-white border border-emerald-500/20 shadow-xl">
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" /> Environmental Data Platform v1.0
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Welcome, {user?.firstName || user?.name || "User"} 👋
          </h1>
          <p className="text-emerald-100/80 text-sm leading-relaxed">
            Centralized environmental data hub for Life Cycle Assessment (LCA), Environmental Product Declarations (ERD), and Digital Product Passports (DPP).
          </p>
        </div>

        {/* Floating Quick Action Buttons */}
        <div className="relative z-10 pt-4 flex flex-wrap gap-3">
          <Link
            to="/vendors"
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            Onboard Vendor Supplier
          </Link>
          <Link
            to="/projects"
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 backdrop-blur-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            New LCA Study Container
          </Link>
          <Link
            to="/reviews"
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 backdrop-blur-xs transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Review Audit Workspace
          </Link>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Metric KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-surface border border-wireframe-border p-5 rounded-2xl shadow-xs space-y-2 relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            <span>Onboarded Vendors</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 rounded-xl">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-foreground">{totalVendors}</p>
          <p className="text-[11px] text-muted-foreground">Active supply chain partners</p>
        </div>

        <div className="bg-surface border border-wireframe-border p-5 rounded-2xl shadow-xs space-y-2 relative overflow-hidden group hover:border-teal-500/50 transition-all">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            <span>Active LCA Projects</span>
            <div className="p-2 bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400 rounded-xl">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-foreground">{totalProjects}</p>
          <p className="text-[11px] text-muted-foreground">Product study questionnaires</p>
        </div>

        <div className="bg-surface border border-wireframe-border p-5 rounded-2xl shadow-xs space-y-2 relative overflow-hidden group hover:border-blue-500/50 transition-all">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            <span>Pending Reviews</span>
            <div className="p-2 bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-foreground">{pendingReviews}</p>
          <p className="text-[11px] text-muted-foreground">Submissions awaiting audit</p>
        </div>

        <div className="bg-surface border border-wireframe-border p-5 rounded-2xl shadow-xs space-y-2 relative overflow-hidden group hover:border-indigo-500/50 transition-all">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            <span>Verified Datasets</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 rounded-xl">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-foreground">{approvedProjects}</p>
          <p className="text-[11px] text-muted-foreground">Approved for LCA / ERD / DPP</p>
        </div>
      </div>

      {/* Platform Architecture & Data Flow Story Banner */}
      <div className="bg-surface border border-wireframe-border rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-wireframe-border pb-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            Canonical Data Reuse Architecture
          </h2>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
            Single Source of Truth
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-wireframe-border bg-muted/20 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <Building2 className="w-4 h-4 text-emerald-600" /> 1. Vendor Onboarding
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Admin invites suppliers with credentials to submit company & facility information.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-wireframe-border bg-muted/20 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <Database className="w-4 h-4 text-teal-600" /> 2. Data Entry & Review
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Multi-step questionnaire collects materials, energy, logistics, packaging, and waste data.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-wireframe-border bg-muted/20 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <ShieldCheck className="w-4 h-4 text-indigo-600" /> 3. Verification & Approval
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Internal reviewers audit data line-by-line, flag corrections, and issue verified status.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-emerald-600">
              <FileSpreadsheet className="w-4 h-4" /> 4. LCA / ERD / DPP Reuse
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Verified dataset seamlessly feeds Life Cycle Assessment, Environmental Declarations, and Digital Product Passports.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Projects Table */}
      <div className="bg-surface border border-wireframe-border rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-wireframe-border flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Leaf className="w-4 h-4 text-emerald-600" />
            Recent LCA Submissions & Progress
          </h2>
          <Link to="/projects" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            View All Projects <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {projects?.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">
            No projects created yet. Click "New LCA Study Container" to create your first project.
          </div>
        ) : (
          <div className="divide-y divide-wireframe-border text-xs">
            {projects?.slice(0, 5).map((proj: any) => (
              <div key={proj._id} className="p-4 hover:bg-muted/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-foreground text-sm">{proj.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] ${
                      proj.status === "APPROVED" ? "bg-emerald-100 text-emerald-800" :
                      proj.status === "CORRECTIONS_REQUIRED" ? "bg-amber-100 text-amber-800" :
                      "bg-blue-100 text-blue-800"
                    }`}>
                      {proj.status}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-0.5">
                    Product: <strong>{proj.productId?.name}</strong> | Boundary: <strong>{proj.systemBoundary}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to="/wizard"
                    search={{ projectId: proj._id }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs"
                  >
                    Questionnaire Wizard
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
