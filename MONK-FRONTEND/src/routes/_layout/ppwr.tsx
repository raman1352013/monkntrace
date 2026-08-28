import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Package, Recycle, Award, CheckCircle2, AlertTriangle, Layers } from "lucide-react";

export const Route = createFileRoute("/_layout/ppwr")({
  head: () => ({
    meta: [
      { title: "PPWR Module — EU Packaging Regulation Compliance" },
      { name: "description", content: "Packaging Recyclability Grades, PCR % Content, and Weight Minimization." },
    ],
  }),
  component: PpwrModulePage,
});

function PpwrModulePage() {
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["lca-projects"],
    queryFn: async () => {
      const res = await api.get("/lca-projects");
      return res.data?.data || [];
    }
  });

  const getGradeBadge = (grade: string = "GRADE_B") => {
    switch (grade) {
      case "GRADE_A":
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"><Award className="w-3.5 h-3.5" /> Grade A (&ge;70% Recycled)</span>;
      case "GRADE_B":
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"><CheckCircle2 className="w-3.5 h-3.5" /> Grade B (&ge;40% Recycled)</span>;
      case "GRADE_C":
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40"><AlertTriangle className="w-3.5 h-3.5" /> Grade C (&ge;15% Recycled)</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/40"><AlertTriangle className="w-3.5 h-3.5" /> Grade D (Low Recyclability)</span>;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl border border-blue-500/20 shadow-lg">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Recycle className="w-3.5 h-3.5" /> EU 2024/1252 Packaging Regulation
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Packaging & Waste Regulation (PPWR)</h1>
          <p className="text-blue-100/80 text-sm mt-1 max-w-2xl">
            Automated Recyclability Assessment, Post-Consumer Recycled (PCR) content verification, and Packaging Weight Minimization rules.
          </p>
        </div>
      </div>

      {/* Projects PPWR Evaluation List */}
      <div className="bg-surface border border-wireframe-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-wireframe-border flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-400" />
            Evaluated Packaging Components ({projects.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground text-sm">Loading PPWR evaluations...</div>
        ) : projects.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">
            No packaging records found.
          </div>
        ) : (
          <div className="divide-y divide-wireframe-border">
            {projects.map((proj: any) => {
              const lcia = proj.lciaResults || {};
              const packagingList = proj.packaging || [];
              return (
                <div key={proj._id} className="p-5 hover:bg-muted/30 transition-colors space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-base font-bold text-foreground">{proj.title}</h3>
                        {getGradeBadge(lcia.ppwrRecyclabilityGrade)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Vendor: <strong>{proj.vendorId?.name || "Unknown"}</strong> • Product: <strong>{proj.productId?.name || "N/A"}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-3 bg-muted/40 p-2.5 rounded-xl border border-wireframe-border text-xs">
                      <div className="px-2">
                        <span className="text-muted-foreground block">Packaging GWP</span>
                        <span className="font-extrabold text-blue-400">{lcia.gwpByStage?.packaging ?? 0} kg CO₂e</span>
                      </div>
                    </div>
                  </div>

                  {/* Packaging breakdown items */}
                  {packagingList.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                      {packagingList.map((pkg: any, idx: number) => (
                        <div key={idx} className="bg-background/60 p-3 rounded-xl border border-wireframe-border text-xs space-y-1">
                          <div className="font-bold text-foreground flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-blue-400" />
                            {pkg.packagingType || "Packaging Material"}
                          </div>
                          <div className="text-muted-foreground">Weight: <strong>{pkg.weightGramsPerUnit || 0}g</strong></div>
                          <div className="text-muted-foreground">Recycled PCR: <strong>{pkg.recycledContentPct || 0}%</strong></div>
                          <div className="text-emerald-400 font-medium text-[11px]">Route: {pkg.disposalRoute || "RECYCLED"}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
