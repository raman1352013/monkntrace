import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  Building2, Plus, Mail, Phone, MapPin, CheckCircle, ShieldAlert,
  FileText, ExternalLink, X, Layers, ClipboardList
} from "lucide-react";

export const Route = createFileRoute("/_layout/vendors")({
  head: () => ({
    meta: [
      { title: "Vendor Management — LCA Environmental Platform" },
      { name: "description", content: "Onboard and manage vendor supply chain partners for LCA data collection." },
    ],
  }),
  component: VendorsPage,
});

// ── Status badge helper ──────────────────────────────────────
const LCA_STATUS_STYLES: Record<string, string> = {
  DRAFT:               "bg-amber-100 text-amber-800 border-amber-200",
  SUBMITTED:           "bg-blue-100 text-blue-800 border-blue-200",
  UNDER_REVIEW:        "bg-indigo-100 text-indigo-800 border-indigo-200",
  CORRECTIONS_REQUIRED:"bg-orange-100 text-orange-800 border-orange-200",
  APPROVED:            "bg-emerald-100 text-emerald-800 border-emerald-200",
  LCA_COMPLETED:       "bg-green-100 text-green-800 border-green-200",
};

// ── Assign LCA Modal ─────────────────────────────────────────
function AssignLcaModal({
  vendor,
  onClose,
}: {
  vendor: any;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [productId, setProductId] = useState("");
  const [title, setTitle] = useState("");
  const [systemBoundary, setSystemBoundary] = useState("CRADLE_TO_GATE");
  const [error, setError] = useState("");

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await api.get("/products");
      return res.data?.data || [];
    },
  });

  const assignMutation = useMutation({
    mutationFn: async () => {
      if (!productId || !title) {
        setError("Product and project title are required.");
        return;
      }
      const res = await api.post("/lca-projects", {
        title,
        productId,
        vendorId: vendor._id,
        systemBoundary,
      });
      return res.data;
    },
    onSuccess: (data) => {
      if (!data) return;
      queryClient.invalidateQueries({ queryKey: ["lca-projects-all"] });
      onClose();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Failed to assign LCA project.");
    },
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-surface border border-wireframe-border rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-wireframe-border pb-3">
          <div>
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-emerald-600" />
              Assign LCA Project
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Vendor: <span className="font-semibold text-foreground">{vendor.name}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-wireframe-bg-alt text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Project Title */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-foreground">
              Project Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setError(""); }}
              className="w-full px-3 py-2 border rounded-lg text-sm bg-background border-wireframe-border focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g. LCA Study — Stainless Steel Valve Q1 2025"
            />
          </div>

          {/* Product */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-foreground">
              Product <span className="text-red-500">*</span>
            </label>
            {productsLoading ? (
              <div className="text-xs text-muted-foreground py-2">Loading products...</div>
            ) : (
              <select
                value={productId}
                onChange={(e) => { setProductId(e.target.value); setError(""); }}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-background border-wireframe-border focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">— Select a product —</option>
                {(products || []).map((p: any) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* System Boundary */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-foreground">System Boundary</label>
            <select
              value={systemBoundary}
              onChange={(e) => setSystemBoundary(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm bg-background border-wireframe-border focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="CRADLE_TO_GATE">Cradle to Gate</option>
              <option value="CRADLE_TO_GRAVE">Cradle to Grave</option>
              <option value="GATE_TO_GATE">Gate to Gate</option>
            </select>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-medium flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-wireframe-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded-lg hover:bg-muted font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={() => assignMutation.mutate()}
            disabled={assignMutation.isPending}
            className="px-5 py-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            {assignMutation.isPending ? (
              <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
            ) : (
              <ClipboardList className="w-4 h-4" />
            )}
            {assignMutation.isPending ? "Assigning..." : "Assign LCA Project"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Vendors Page ────────────────────────────────────────
function VendorsPage() {
  const queryClient = useQueryClient();
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [assigningVendor, setAssigningVendor] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    contactEmail: "",
    contactPhone: "",
    street: "",
    city: "",
    state: "",
    country: "India",
    postalCode: "",
    vendorPassword: "Vendor@123",
    contactFirstName: "Vendor",
    contactLastName: "Rep"
  });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const { data: vendors, isLoading } = useQuery({
    queryKey: ["vendors"],
    queryFn: async () => {
      const res = await api.get("/vendors");
      return res.data?.data || [];
    }
  });

  // Fetch all LCA projects to compute per-vendor counts
  const { data: allProjects } = useQuery({
    queryKey: ["lca-projects-all"],
    queryFn: async () => {
      const res = await api.get("/lca-projects");
      return res.data?.data || [];
    },
  });

  // Build a map: vendorId -> project list
  const projectsByVendor: Record<string, any[]> = {};
  (allProjects || []).forEach((p: any) => {
    const vid = p.vendorId?._id || p.vendorId;
    if (vid) {
      if (!projectsByVendor[vid]) projectsByVendor[vid] = [];
      projectsByVendor[vid].push(p);
    }
  });

  const onboardMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await api.post("/vendors", data);
      return res.data;
    },
    onSuccess: () => {
      setMessage({ type: "success", text: `Vendor "${formData.name}" onboarded successfully!` });
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      setIsOnboardModalOpen(false);
      setFormData({
        name: "",
        code: "",
        contactEmail: "",
        contactPhone: "",
        street: "",
        city: "",
        state: "",
        country: "India",
        postalCode: "",
        vendorPassword: "Vendor@123",
        contactFirstName: "Vendor",
        contactLastName: "Rep"
      });
    },
    onError: (err: any) => {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to onboard vendor." });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    onboardMutation.mutate(formData);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Assign LCA Modal */}
      {assigningVendor && (
        <AssignLcaModal
          vendor={assigningVendor}
          onClose={() => setAssigningVendor(null)}
        />
      )}

      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-900/90 via-teal-900/90 to-slate-900 text-white p-6 rounded-2xl border border-emerald-500/20 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-1 rounded-full font-semibold border border-emerald-500/30 uppercase tracking-wider">
              Supply Chain Partners
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-2">Vendor Management</h1>
          <p className="text-emerald-100/80 text-sm mt-1">
            Onboard new vendor suppliers and assign LCA data collection projects.
          </p>
        </div>
        <button
          onClick={() => setIsOnboardModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer text-sm"
        >
          <Plus className="w-4 h-4" />
          Onboard New Vendor
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-red-50 text-red-800 border-red-300'}`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <ShieldAlert className="w-5 h-5 text-red-600" />}
          {message.text}
        </div>
      )}

      {/* Vendors Table */}
      <div className="bg-surface border border-wireframe-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-wireframe-border flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            Onboarded Vendors ({vendors?.length || 0})
          </h2>
          <p className="text-xs text-muted-foreground">Click <span className="font-semibold text-foreground">Assign LCA</span> to create a data collection project for any vendor.</p>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground text-sm">Loading vendors...</div>
        ) : vendors?.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">
            No vendors onboarded yet. Click "Onboard New Vendor" to add your first supplier.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-[11px] font-bold tracking-wider border-b border-wireframe-border">
                <tr>
                  <th className="px-6 py-3.5">Company Name</th>
                  <th className="px-6 py-3.5">Code</th>
                  <th className="px-6 py-3.5">Contact Email</th>
                  <th className="px-6 py-3.5">Phone</th>
                  <th className="px-6 py-3.5">Location</th>
                  <th className="px-6 py-3.5">LCA Projects</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-wireframe-border">
                {vendors.map((vendor: any) => {
                  const vendorProjects = projectsByVendor[vendor._id] || [];
                  const approvedCount = vendorProjects.filter((p) => p.status === "APPROVED" || p.status === "LCA_COMPLETED").length;
                  const pendingCount = vendorProjects.filter((p) => ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "CORRECTIONS_REQUIRED"].includes(p.status)).length;

                  return (
                    <tr key={vendor._id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-semibold text-foreground">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                            {vendor.name.slice(0, 2).toUpperCase()}
                          </div>
                          {vendor.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{vendor.code || "—"}</td>
                      <td className="px-6 py-4 text-foreground">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                          {vendor.contactEmail || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5" />
                          {vendor.contactPhone || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          {vendor.address?.city
                            ? `${vendor.address.city}, ${vendor.address.country}`
                            : vendor.address?.country || "—"}
                        </div>
                      </td>
                      {/* LCA Projects Count */}
                      <td className="px-6 py-4">
                        {vendorProjects.length === 0 ? (
                          <span className="text-xs text-muted-foreground italic">No projects</span>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                              <FileText className="w-3 h-3 text-emerald-600" />
                              {vendorProjects.length} total
                            </span>
                            <div className="flex gap-1 flex-wrap">
                              {approvedCount > 0 && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-emerald-100 text-emerald-800 border-emerald-200">
                                  ✓ {approvedCount} approved
                                </span>
                              )}
                              {pendingCount > 0 && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-amber-100 text-amber-800 border-amber-200">
                                  ⏳ {pendingCount} pending
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                          {vendor.status || "ACTIVE"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setAssigningVendor(vendor)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400 transition-all cursor-pointer"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          Assign LCA
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Onboard Vendor Modal */}
      {isOnboardModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-wireframe-border rounded-2xl w-full max-w-xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-wireframe-border pb-3">
              <h3 className="text-lg font-bold text-foreground">Onboard Supply Chain Vendor</h3>
              <button onClick={() => setIsOnboardModalOpen(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-foreground">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-background border-wireframe-border"
                    placeholder="e.g. Apex Steel Industries"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-foreground">Vendor Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-background border-wireframe-border"
                    placeholder="e.g. APEX-001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-foreground">Contact First Name</label>
                  <input
                    type="text"
                    value={formData.contactFirstName}
                    onChange={(e) => setFormData({ ...formData, contactFirstName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-background border-wireframe-border"
                    placeholder="Rajesh"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-foreground">Contact Last Name</label>
                  <input
                    type="text"
                    value={formData.contactLastName}
                    onChange={(e) => setFormData({ ...formData, contactLastName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-background border-wireframe-border"
                    placeholder="Sharma"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-foreground">Contact Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-background border-wireframe-border"
                    placeholder="vendor@company.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-foreground">Contact Phone</label>
                  <input
                    type="text"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-background border-wireframe-border"
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-foreground">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-background border-wireframe-border"
                    placeholder="Mumbai"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-foreground">Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-background border-wireframe-border"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-wireframe-border">
                <label className="block text-xs font-semibold mb-1 text-foreground">Initial Account Password</label>
                <input
                  type="text"
                  value={formData.vendorPassword}
                  onChange={(e) => setFormData({ ...formData, vendorPassword: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-background border-wireframe-border font-mono"
                />
                <p className="text-[11px] text-muted-foreground mt-1">Share this password with the vendor so they can log in to the Vendor Portal.</p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-wireframe-border">
                <button
                  type="button"
                  onClick={() => setIsOnboardModalOpen(false)}
                  className="px-4 py-2 text-sm border rounded-lg hover:bg-muted font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={onboardMutation.isPending}
                  className="px-5 py-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60"
                >
                  {onboardMutation.isPending ? (
                    <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {onboardMutation.isPending ? "Onboarding..." : "Onboard Vendor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
