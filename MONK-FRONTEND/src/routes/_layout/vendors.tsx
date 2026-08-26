import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Building2, Plus, Mail, Phone, MapPin, CheckCircle, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/_layout/vendors")({
  head: () => ({
    meta: [
      { title: "Vendor Management — LCA Environmental Platform" },
      { name: "description", content: "Onboard and manage vendor supply chain partners for LCA data collection." },
    ],
  }),
  component: VendorsPage,
});

function VendorsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const onboardMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await api.post("/vendors", data);
      return res.data;
    },
    onSuccess: (data) => {
      setMessage({ type: "success", text: `Vendor "${formData.name}" onboarded successfully!` });
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      setIsModalOpen(false);
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
            Onboard new vendor suppliers with credentials to collect structured environmental & product life cycle activity data.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
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

      {/* Vendors Grid / Table */}
      <div className="bg-surface border border-wireframe-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-wireframe-border flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            Onboarded Vendors ({vendors?.length || 0})
          </h2>
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
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-wireframe-border">
                {vendors.map((vendor: any) => (
                  <tr key={vendor._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-foreground flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                        {vendor.name.slice(0, 2).toUpperCase()}
                      </div>
                      {vendor.name}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{vendor.code || "-"}</td>
                    <td className="px-6 py-4 text-foreground">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                        {vendor.contactEmail || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" />
                        {vendor.contactPhone || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {vendor.address?.city ? `${vendor.address.city}, ${vendor.address.country}` : vendor.address?.country || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                        {vendor.status || "ACTIVE"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Onboard Vendor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-wireframe-border rounded-2xl w-full max-w-xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-wireframe-border pb-3">
              <h3 className="text-lg font-bold text-foreground">Onboard Supply Chain Vendor</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">✕</button>
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

              <div className="pt-2 border-t border-wireframe-border grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-foreground">Initial Account Password</label>
                  <input
                    type="text"
                    value={formData.vendorPassword}
                    onChange={(e) => setFormData({ ...formData, vendorPassword: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-background border-wireframe-border font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-wireframe-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm border rounded-lg hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={onboardMutation.isPending}
                  className="px-5 py-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
                >
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
