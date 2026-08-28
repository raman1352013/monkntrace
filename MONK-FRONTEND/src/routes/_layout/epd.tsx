import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { FileCheck, ShieldCheck, Download, Sparkles, Building2, Leaf, QrCode } from "lucide-react";
import { useState } from "react";
import { DigitalProductPassportModal } from "@/components/dpp/DigitalProductPassportModal";

export const Route = createFileRoute("/_layout/epd")({
  head: () => ({
    meta: [
      { title: "EPD / ERD Module — Environmental Product Declarations" },
      { name: "description", content: "ISO 14025 & EN 15804 compliant B2B Environmental Declarations." },
    ],
  }),
  component: EpdModulePage,
});

function EpdModulePage() {
  const [selectedDpp, setSelectedDpp] = useState<any>(null);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["lca-projects"],
    queryFn: async () => {
      const res = await api.get("/lca-projects");
      return res.data?.data || [];
    }
  });

  const handleDownloadPdf = async (project: any) => {
    try {
      const response = await api.get(`/lca-projects/${project._id}/export-pdf`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `EPD-Declaration-${project.title.replace(/\s+/g, "_")}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to download EPD PDF report.");
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-6 rounded-2xl border border-emerald-500/20 shadow-lg">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> ISO 14025 & EN 15804 Standard
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Environmental Product Declarations (EPD / ERD)</h1>
          <p className="text-emerald-100/80 text-sm mt-1 max-w-2xl">
            B2B Environmental Declarations derived automatically from your verified canonical LCA dataset.
          </p>
        </div>
      </div>

      {/* Grid of Verified EPD Documents */}
      <div className="bg-surface border border-wireframe-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-wireframe-border flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-500" />
            Verified EPD Records ({projects.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground text-sm">Loading EPD records...</div>
        ) : projects.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">
            No verified LCA projects found for EPD generation.
          </div>
        ) : (
          <div className="divide-y divide-wireframe-border">
            {projects.map((proj: any) => {
              const lcia = proj.lciaResults || {};
              return (
                <div key={proj._id} className="p-5 hover:bg-muted/30 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-bold text-foreground">{proj.title}</h3>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-900/40 text-emerald-300 border border-emerald-500/30">
                        <ShieldCheck className="w-3 h-3" /> ISO 14025 Compliant
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span><Building2 className="w-3 h-3 inline mr-1" />{proj.vendorId?.name || "Vendor N/A"}</span>
                      <span>•</span>
                      <span>Product: <strong>{proj.productId?.name || "N/A"}</strong></span>
                      <span>•</span>
                      <span>Boundary: <strong>{proj.systemBoundary}</strong></span>
                    </div>
                  </div>

                  {/* Impact Quick Summary */}
                  <div className="flex items-center gap-4 bg-muted/40 p-3 rounded-xl border border-wireframe-border">
                    <div className="text-center px-2">
                      <div className="text-xs text-muted-foreground font-medium">GWP (Carbon)</div>
                      <div className="text-sm font-extrabold text-emerald-400">{lcia.totalGwpKgCo2e ?? 0} kg CO₂e</div>
                    </div>
                    <div className="w-px h-8 bg-wireframe-border" />
                    <div className="text-center px-2">
                      <div className="text-xs text-muted-foreground font-medium">Water Scarcity</div>
                      <div className="text-sm font-extrabold text-cyan-400">{lcia.waterFootprintM3 ?? 0} m³</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedDpp(proj)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-cyan-900/40 hover:bg-cyan-800/60 text-cyan-300 border border-cyan-500/30 font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      DPP QR Passport
                    </button>
                    <button
                      onClick={() => handleDownloadPdf(proj)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download EPD Report
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <DigitalProductPassportModal
        project={selectedDpp}
        isOpen={!!selectedDpp}
        onClose={() => setSelectedDpp(null)}
      />
    </div>
  );
}
