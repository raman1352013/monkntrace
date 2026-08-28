import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Leaf, Plus, ArrowRight, ShieldCheck, Clock, FileEdit, AlertCircle, QrCode, Download } from "lucide-react";
import { DigitalProductPassportModal } from "@/components/dpp/DigitalProductPassportModal";

export const Route = createFileRoute("/_layout/projects")({
  head: () => ({
    meta: [
      { title: "LCA Projects — Life Cycle Assessment Module" },
      { name: "description", content: "Manage product LCA studies and data entry questionnaires." },
    ],
  }),
  component: LcaProjectsPage,
});

function LcaProjectsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDppProject, setSelectedDppProject] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    productName: "",
    category: "Packaging / Drinkware",
    weightKg: 0.5,
    functionalUnit: "1 bottle over 5 years reuse",
    vendorId: "",
    systemBoundary: "CRADLE_TO_GATE"
  });

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["lca-projects"],
    queryFn: async () => {
      const res = await api.get("/lca-projects");
      return res.data?.data || [];
    }
  });

  const { data: vendors } = useQuery({
    queryKey: ["vendors"],
    queryFn: async () => {
      const res = await api.get("/vendors");
      return res.data?.data || [];
    }
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // 1. Create Product
      const prodRes = await api.post("/products", {
        name: data.productName,
        category: data.category,
        weightKg: data.weightKg,
        functionalUnit: data.functionalUnit,
        organizationId: data.vendorId
      });
      const product = prodRes.data.data;

      // 2. Create LCA Project
      const projRes = await api.post("/lca-projects", {
        title: data.title,
        productId: product._id,
        vendorId: data.vendorId,
        systemBoundary: data.systemBoundary
      });
      return projRes.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lca-projects"] });
      setIsModalOpen(false);
      setFormData({
        title: "",
        productName: "",
        category: "Packaging / Drinkware",
        weightKg: 0.5,
        functionalUnit: "1 bottle over 5 years reuse",
        vendorId: "",
        systemBoundary: "CRADLE_TO_GATE"
      });
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"><ShieldCheck className="w-3.5 h-3.5" /> Approved</span>;
      case "UNDER_REVIEW":
      case "SUBMITTED":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"><Clock className="w-3.5 h-3.5" /> Under Review</span>;
      case "CORRECTIONS_REQUIRED":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"><AlertCircle className="w-3.5 h-3.5" /> Changes Requested</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"><FileEdit className="w-3.5 h-3.5" /> Draft</span>;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-teal-900/90 via-emerald-900/90 to-slate-900 text-white p-6 rounded-2xl border border-teal-500/20 shadow-lg">
        <div>
          <span className="bg-teal-500/20 text-teal-300 text-xs px-2.5 py-1 rounded-full font-semibold border border-teal-500/30 uppercase tracking-wider">
            Life Cycle Assessment
          </span>
          <h1 className="text-2xl font-bold tracking-tight mt-2">LCA Projects</h1>
          <p className="text-teal-100/80 text-sm mt-1">
            Collect raw materials, energy, logistics, packaging, and emission activity datasets from suppliers.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer text-sm"
        >
          <Plus className="w-4 h-4" />
          Create New LCA Project
        </button>
      </div>

      {/* Projects Grid */}
      <div className="bg-surface border border-wireframe-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-wireframe-border flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Leaf className="w-4 h-4 text-emerald-600" />
            LCA Projects & Submissions ({projects?.length || 0})
          </h2>
        </div>

        {projectsLoading ? (
          <div className="p-12 text-center text-muted-foreground text-sm">Loading LCA projects...</div>
        ) : projects?.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">
            No LCA projects found. Click "Create New LCA Project" to start data collection.
          </div>
        ) : (
          <div className="divide-y divide-wireframe-border">
            {projects.map((project: any) => (
              <div key={project._id} className="p-5 hover:bg-muted/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-bold text-foreground">{project.title}</h3>
                    {getStatusBadge(project.status)}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span><strong>Product:</strong> {project.productId?.name || "Product N/A"}</span>
                    <span>•</span>
                    <span><strong>Vendor:</strong> {project.vendorId?.name || "Vendor N/A"}</span>
                    <span>•</span>
                    <span><strong>Boundary:</strong> {project.systemBoundary}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setSelectedDppProject(project)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-900/40 hover:bg-cyan-800/60 text-cyan-300 border border-cyan-500/30 font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    DPP Passport
                  </button>
                  <Link
                    to="/wizard"
                    search={{ projectId: project._id }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-all"
                  >
                    Open Data Questionnaire
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DPP Passport Modal */}
      <DigitalProductPassportModal
        project={selectedDppProject}
        isOpen={!!selectedDppProject}
        onClose={() => setSelectedDppProject(null)}
      />

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-wireframe-border rounded-2xl w-full max-w-xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-wireframe-border pb-3">
              <h3 className="text-lg font-bold text-foreground">Create LCA Project Container</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); createProjectMutation.mutate(formData); }} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-foreground">Project Study Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-background border-wireframe-border"
                  placeholder="e.g. Stainless Steel Water Bottle 750ml - LCA 2026 Study"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-foreground">Assigned Vendor Company *</label>
                  <select
                    required
                    value={formData.vendorId}
                    onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-background border-wireframe-border"
                  >
                    <option value="">-- Select Vendor --</option>
                    {vendors?.map((v: any) => (
                      <option key={v._id} value={v._id}>{v.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-foreground">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-background border-wireframe-border"
                    placeholder="e.g. Steel Bottle 750ml"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-foreground">Functional Unit</label>
                  <input
                    type="text"
                    value={formData.functionalUnit}
                    onChange={(e) => setFormData({ ...formData, functionalUnit: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-background border-wireframe-border"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-foreground">System Boundary</label>
                  <select
                    value={formData.systemBoundary}
                    onChange={(e) => setFormData({ ...formData, systemBoundary: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-background border-wireframe-border"
                  >
                    <option value="CRADLE_TO_GATE">Cradle-to-Gate (Raw material to Factory)</option>
                    <option value="CRADLE_TO_GRAVE">Cradle-to-Grave (Full lifecycle)</option>
                    <option value="GATE_TO_GATE">Gate-to-Gate (Facility only)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-wireframe-border">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-muted">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createProjectMutation.isPending}
                  className="px-5 py-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
                >
                  {createProjectMutation.isPending ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
