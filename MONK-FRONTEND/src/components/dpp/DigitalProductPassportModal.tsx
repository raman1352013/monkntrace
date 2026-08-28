import React from "react";
import { QrCode, Download, ShieldCheck, Leaf, Layers, X, Sparkles, Droplets } from "lucide-react";
import api from "@/lib/api";

interface DigitalProductPassportModalProps {
  project: any;
  isOpen: boolean;
  onClose: () => void;
}

export function DigitalProductPassportModal({ project, isOpen, onClose }: DigitalProductPassportModalProps) {
  if (!isOpen || !project) return null;

  const lcia = project.lciaResults || {};
  const totalGwp = lcia.totalGwpKgCo2e ?? 0;
  const water = lcia.waterFootprintM3 ?? 0;
  const grade = lcia.ppwrRecyclabilityGrade || "GRADE_B";
  const publicQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`https://monkspaces.com/our-work/?project=${project._id}`)}`;

  const handleDownloadPdf = async () => {
    try {
      const response = await api.get(`/lca-projects/${project._id}/export-pdf`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `LCA-Report-${project.title.replace(/\s+/g, "_")}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Failed to download PDF report:", err);
      alert("Failed to generate PDF. Please ensure server is running.");
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(3, 7, 18, 0.85)", backdropFilter: "blur(12px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div style={{
        background: "linear-gradient(145deg, #0b1528 0%, #060d19 100%)",
        border: "1px solid rgba(16, 185, 129, 0.3)",
        borderRadius: 24, width: "100%", maxWidth: 540,
        overflow: "hidden", boxShadow: "0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(16, 185, 129, 0.15)",
        position: "relative", color: "#fff",
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(16, 185, 129, 0.05)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <QrCode size={18} color="#34d399" />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: "#34d399", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  EU Regulation Compliant
                </span>
                <Sparkles size={11} color="#34d399" />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Digital Product Passport (DPP)</h3>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#94a3b8", transition: "all 0.2s",
          }}>
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>

          {/* QR & Product Card */}
          <div style={{
            display: "flex", gap: 20, background: "rgba(255, 255, 255, 0.025)",
            border: "1px solid rgba(255, 255, 255, 0.07)", borderRadius: 16, padding: 18,
            alignItems: "center",
          }}>
            <div style={{
              background: "#fff", padding: 8, borderRadius: 12, flexShrink: 0,
              boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
            }}>
              <img src={publicQrUrl} alt="DPP QR Code" style={{ width: 110, height: 110, display: "block" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 2 }}>{project.vendorId?.name || "Manufacturer"}</div>
              <h4 style={{ fontSize: 16, fontWeight: 800, color: "#fff", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {project.productId?.name || project.title}
              </h4>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 6, display: "flex", flexDirection: "column", gap: 3 }}>
                <span>Boundary: <b>{project.systemBoundary || "CRADLE_TO_GATE"}</b></span>
                <span>Functional Unit: <b>{project.functionalUnit || "1 Unit"}</b></span>
              </div>
            </div>
          </div>

          {/* Environmental Metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: 14, padding: 14, textAlign: "center" }}>
              <Leaf size={16} color="#34d399" style={{ margin: "0 auto 6px" }} />
              <div style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>{totalGwp}</div>
              <div style={{ fontSize: 10, color: "#a7f3d0", fontWeight: 600 }}>kg CO₂e (GWP)</div>
            </div>
            <div style={{ background: "rgba(14, 165, 233, 0.08)", border: "1px solid rgba(14, 165, 233, 0.2)", borderRadius: 14, padding: 14, textAlign: "center" }}>
              <Droplets size={16} color="#38bdf8" style={{ margin: "0 auto 6px" }} />
              <div style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>{water}</div>
              <div style={{ fontSize: 10, color: "#bae6fd", fontWeight: 600 }}>m³ Water</div>
            </div>
            <div style={{ background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.2)", borderRadius: 14, padding: 14, textAlign: "center" }}>
              <Layers size={16} color="#fbbf24" style={{ margin: "0 auto 6px" }} />
              <div style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>{grade.replace("GRADE_", "")}</div>
              <div style={{ fontSize: 10, color: "#fde68a", fontWeight: 600 }}>PPWR Recyclability</div>
            </div>
          </div>

          {/* Verification Badge */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 14px", borderRadius: 12,
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
          }}>
            <ShieldCheck size={18} color="#34d399" />
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", lineHeight: 1.4 }}>
              Verified under <b>ISO 14040 / ISO 14044</b> LCA Standards. Data canonicalized for B2B EPD & EU DPP.
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
            <button onClick={handleDownloadPdf} style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "12px 18px", borderRadius: 12,
              background: "linear-gradient(135deg, #059669 0%, #0891b2 100%)",
              border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 4px 18px rgba(5,150,105,0.35)", transition: "all 0.2s",
            }}>
              <Download size={15} /> Download PDF ISO Report
            </button>
            <button onClick={onClose} style={{
              padding: "12px 20px", borderRadius: 12,
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
              color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}>
              Close
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
