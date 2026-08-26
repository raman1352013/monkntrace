import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { ShieldCheck, MessageSquare, CheckCircle, AlertTriangle, Send, Eye } from "lucide-react";

export const Route = createFileRoute("/_layout/reviews")({
  head: () => ({
    meta: [
      { title: "Review & Approvals — LCA Audit Workspace" },
      { name: "description", content: "Internal review team audit workspace for vendor LCA activity submissions." },
    ],
  }),
  component: ReviewsPage,
});

function ReviewsPage() {
  const queryClient = useQueryClient();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [sectionFilter, setSectionFilter] = useState("GENERAL");

  // Fetch Submitted / Review Projects
  const { data: projects, isLoading } = useQuery({
    queryKey: ["review-projects"],
    queryFn: async () => {
      const res = await api.get("/lca-projects");
      return res.data?.data || [];
    }
  });

  const selectedProject = projects?.find((p: any) => p._id === selectedProjectId);

  // Fetch Comments for Selected Project
  const { data: comments } = useQuery({
    queryKey: ["review-comments", selectedProjectId],
    queryFn: async () => {
      if (!selectedProjectId) return [];
      const res = await api.get(`/reviews/comments/${selectedProjectId}`);
      return res.data?.data || [];
    },
    enabled: !!selectedProjectId
  });

  // Post Comment Mutation
  const postCommentMutation = useMutation({
    mutationFn: async (payload: { projectId: string; section: string; comment: string }) => {
      const res = await api.post("/reviews/comments", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["review-comments", selectedProjectId] });
      setCommentText("");
    }
  });

  // Status Change Mutation (Request Changes vs Approve)
  const statusMutation = useMutation({
    mutationFn: async (payload: { projectId: string; action: "REQUEST_CHANGES" | "APPROVE" }) => {
      const res = await api.post("/reviews/status", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["review-projects"] });
      queryClient.invalidateQueries({ queryKey: ["lca-projects"] });
    }
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl border border-indigo-500/20 shadow-lg">
        <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2.5 py-1 rounded-full font-semibold border border-indigo-500/30 uppercase tracking-wider">
          Internal Auditor Portal
        </span>
        <h1 className="text-2xl font-bold tracking-tight mt-2">LCA Verification & Approvals Workspace</h1>
        <p className="text-indigo-100/80 text-sm mt-1">
          Inspect submitted vendor datasets, add field-level audit comments, request data corrections, or issue final LCA dataset verification.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Projects Queue */}
        <div className="bg-surface border border-wireframe-border rounded-2xl p-4 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            Submitted Projects Audit Queue ({projects?.length || 0})
          </h2>

          {isLoading ? (
            <div className="p-6 text-center text-xs text-muted-foreground">Loading queue...</div>
          ) : projects?.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">No projects submitted for audit yet.</div>
          ) : (
            <div className="space-y-2">
              {projects?.map((proj: any) => {
                const isSelected = proj._id === selectedProjectId;
                return (
                  <div
                    key={proj._id}
                    onClick={() => setSelectedProjectId(proj._id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-indigo-50/80 border-indigo-500 dark:bg-indigo-950/50 shadow-xs"
                        : "bg-background border-wireframe-border hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-foreground truncate">{proj.title}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        proj.status === "APPROVED" ? "bg-emerald-100 text-emerald-800" :
                        proj.status === "CORRECTIONS_REQUIRED" ? "bg-amber-100 text-amber-800" :
                        "bg-blue-100 text-blue-800"
                      }`}>
                        {proj.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Vendor: <strong>{proj.vendorId?.name || "N/A"}</strong>
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Project Inspection & Review Notes */}
        <div className="lg:col-span-2 space-y-5">
          {selectedProject ? (
            <div className="bg-surface border border-wireframe-border rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-wireframe-border pb-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">{selectedProject.title}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Product: <strong>{selectedProject.productId?.name}</strong> | Boundary: <strong>{selectedProject.systemBoundary}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => statusMutation.mutate({ projectId: selectedProject._id, action: "REQUEST_CHANGES" })}
                    disabled={statusMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Request Corrections
                  </button>
                  <button
                    onClick={() => statusMutation.mutate({ projectId: selectedProject._id, action: "APPROVE" })}
                    disabled={statusMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Approve Dataset
                  </button>
                </div>
              </div>

              {/* Activity Data Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-muted/40 rounded-xl border border-wireframe-border">
                  <span className="text-muted-foreground">Materials Count</span>
                  <p className="font-bold text-foreground mt-0.5">{selectedProject.materials?.length || 0} items</p>
                </div>
                <div className="p-3 bg-muted/40 rounded-xl border border-wireframe-border">
                  <span className="text-muted-foreground">Electricity (kWh)</span>
                  <p className="font-bold text-foreground mt-0.5">{selectedProject.manufacturing?.electricityKwh || 0} kWh</p>
                </div>
                <div className="p-3 bg-muted/40 rounded-xl border border-wireframe-border">
                  <span className="text-muted-foreground">Logistics Legs</span>
                  <p className="font-bold text-foreground mt-0.5">{selectedProject.transportation?.length || 0} legs</p>
                </div>
                <div className="p-3 bg-muted/40 rounded-xl border border-wireframe-border">
                  <span className="text-muted-foreground">Packaging</span>
                  <p className="font-bold text-foreground mt-0.5">{selectedProject.packaging?.length || 0} items</p>
                </div>
              </div>

              {/* Reviewer Field Comment Input */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-indigo-500" />
                  Add Auditor Line-Item Note or Correction Request
                </h3>

                <div className="flex gap-2">
                  <select
                    value={sectionFilter}
                    onChange={(e) => setSectionFilter(e.target.value)}
                    className="px-3 py-2 text-xs border rounded-xl bg-background border-wireframe-border"
                  >
                    <option value="GENERAL">General Note</option>
                    <option value="MATERIALS">Materials Section</option>
                    <option value="MANUFACTURING">Manufacturing Section</option>
                    <option value="TRANSPORT">Transport Section</option>
                    <option value="PACKAGING">Packaging Section</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Enter specific feedback or request (e.g. Upload utility bill for 500 kWh electricity)..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs border rounded-xl bg-background border-wireframe-border"
                  />
                  <button
                    onClick={() => {
                      if (!commentText.trim()) return;
                      postCommentMutation.mutate({
                        projectId: selectedProject._id,
                        section: sectionFilter,
                        comment: commentText
                      });
                    }}
                    disabled={postCommentMutation.isPending}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Post
                  </button>
                </div>
              </div>

              {/* Comments Stream */}
              <div className="space-y-2 pt-2 border-t border-wireframe-border">
                <h4 className="text-xs font-bold text-muted-foreground">Audit Feedback History ({comments?.length || 0})</h4>
                {comments?.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No auditor notes posted yet.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {comments?.map((c: any) => (
                      <div key={c._id} className="p-3 bg-muted/30 rounded-xl border border-wireframe-border text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-indigo-600">[{c.section}]</span>
                          <span className="text-[10px] text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-foreground">{c.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-surface border border-wireframe-border rounded-2xl p-12 text-center text-muted-foreground text-xs space-y-2">
              <Eye className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="font-semibold text-sm">Select a project from the left queue to start reviewing.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
