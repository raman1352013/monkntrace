import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { 
  Package, Box, Zap, Truck, Archive, Trash2, FileCheck, 
  CheckCircle, ArrowLeft, ArrowRight, Save, Send, Plus, Trash
} from "lucide-react";

export const Route = createFileRoute("/_layout/wizard")({
  head: () => ({
    meta: [
      { title: "LCA Data Entry Wizard — Life Cycle Inventory Questionnaire" },
      { name: "description", content: "7-step multi-stage LCA data collection wizard for vendor product activity data." },
    ],
  }),
  component: LcaWizardPage,
});

function LcaWizardPage() {
  const search: any = useSearch({ strict: false });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const projectId = search?.projectId;

  const [activeStep, setActiveStep] = useState(1);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Form State
  const [materials, setMaterials] = useState<any[]>([]);
  const [manufacturing, setManufacturing] = useState<any>({
    electricityKwh: 500,
    electricitySource: "GRID_MIX",
    naturalGasM3: 20,
    dieselLiters: 10,
    waterConsumptionLiters: 1000
  });
  const [transportation, setTransportation] = useState<any[]>([]);
  const [packaging, setPackaging] = useState<any[]>([]);
  const [wasteEmissions, setWasteEmissions] = useState<any[]>([]);

  // Fetch Project Data
  const { data: projectRes, isLoading } = useQuery({
    queryKey: ["lca-project", projectId],
    queryFn: async () => {
      if (!projectId) return null;
      const res = await api.get(`/lca-projects/${projectId}`);
      return res.data?.data || null;
    },
    enabled: !!projectId
  });

  useEffect(() => {
    if (projectRes) {
      if (projectRes.materials?.length) setMaterials(projectRes.materials);
      if (projectRes.manufacturing) setManufacturing(projectRes.manufacturing);
      if (projectRes.transportation?.length) setTransportation(projectRes.transportation);
      if (projectRes.packaging?.length) setPackaging(projectRes.packaging);
      if (projectRes.wasteEmissions?.length) setWasteEmissions(projectRes.wasteEmissions);
    }
  }, [projectRes]);

  const updateMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.put(`/lca-projects/${projectId}`, payload);
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["lca-project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["lca-projects"] });
      setSaveMessage("Draft section saved successfully!");
      setTimeout(() => setSaveMessage(null), 3000);
      if (variables.status === "SUBMITTED") {
        navigate({ to: "/projects" });
      }
    }
  });

  const handleSaveDraft = () => {
    if (!projectId) return;
    updateMutation.mutate({
      currentStep: activeStep,
      materials,
      manufacturing,
      transportation,
      packaging,
      wasteEmissions,
      status: "DRAFT"
    });
  };

  const handleSubmitReview = () => {
    if (!projectId) return;
    updateMutation.mutate({
      currentStep: 7,
      materials,
      manufacturing,
      transportation,
      packaging,
      wasteEmissions,
      status: "SUBMITTED"
    });
  };

  const steps = [
    { num: 1, title: "Product Specs", icon: Package },
    { num: 2, title: "Raw Materials", icon: Box },
    { num: 3, title: "Manufacturing", icon: Zap },
    { num: 4, title: "Transport", icon: Truck },
    { num: 5, title: "Packaging", icon: Archive },
    { num: 6, title: "Waste & Emissions", icon: Trash2 },
    { num: 7, title: "Verification", icon: FileCheck },
  ];

  if (!projectId) {
    return (
      <div className="p-8 text-center max-w-xl mx-auto space-y-4">
        <h2 className="text-xl font-bold text-foreground">No LCA Project Selected</h2>
        <p className="text-sm text-muted-foreground">Please select an LCA project from the projects dashboard to start the data entry wizard.</p>
        <button onClick={() => navigate({ to: "/projects" })} className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg text-sm">
          Go to LCA Projects
        </button>
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-12 text-center text-sm text-muted-foreground">Loading LCA wizard data...</div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface p-5 rounded-2xl border border-wireframe-border shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
              LCA Data Questionnaire
            </span>
            <span className="text-xs text-muted-foreground">• Vendor Submission</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground mt-1">
            {projectRes?.title || "LCA Project Questionnaire"}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Product: <strong>{projectRes?.productId?.name}</strong> | Vendor: <strong>{projectRes?.vendorId?.name}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveDraft}
            disabled={updateMutation.isPending}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold border border-wireframe-border hover:bg-muted rounded-xl transition-colors"
          >
            <Save className="w-4 h-4 text-emerald-600" />
            {updateMutation.isPending ? "Saving..." : "Save Draft"}
          </button>
          {activeStep === 7 && (
            <button
              onClick={handleSubmitReview}
              disabled={updateMutation.isPending}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md transition-all"
            >
              <Send className="w-4 h-4" />
              Submit for Review
            </button>
          )}
        </div>
      </div>

      {saveMessage && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-300 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {saveMessage}
        </div>
      )}

      {/* Stepper Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = activeStep === step.num;
          const isDone = activeStep > step.num;

          return (
            <button
              key={step.num}
              onClick={() => setActiveStep(step.num)}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                isActive
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-md font-bold"
                  : isDone
                  ? "bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold"
                  : "bg-surface text-muted-foreground border-wireframe-border hover:bg-muted/50 font-medium"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[11px] leading-tight">{step.title}</span>
            </button>
          );
        })}
      </div>

      {/* Wizard Step Content */}
      <div className="bg-surface border border-wireframe-border rounded-2xl p-6 shadow-sm min-h-[380px]">
        {/* Step 1: Specs */}
        {activeStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-600" />
              Step 1: Product Specifications & System Boundary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-muted/30 rounded-xl border border-wireframe-border space-y-2">
                <span className="text-xs text-muted-foreground uppercase font-bold">Product Name</span>
                <p className="font-semibold text-foreground">{projectRes?.productId?.name || "-"}</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-xl border border-wireframe-border space-y-2">
                <span className="text-xs text-muted-foreground uppercase font-bold">Functional Unit</span>
                <p className="font-semibold text-foreground">{projectRes?.productId?.functionalUnit || "-"}</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-xl border border-wireframe-border space-y-2">
                <span className="text-xs text-muted-foreground uppercase font-bold">Weight Per Unit (kg)</span>
                <p className="font-semibold text-foreground">{projectRes?.productId?.weightKg || 1.0} kg</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-xl border border-wireframe-border space-y-2">
                <span className="text-xs text-muted-foreground uppercase font-bold">System Boundary</span>
                <p className="font-semibold text-emerald-600">{projectRes?.systemBoundary || "CRADLE_TO_GATE"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Materials */}
        {activeStep === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Box className="w-4 h-4 text-emerald-600" />
                Step 2: Raw Material Inputs & Composition
              </h2>
              <button
                onClick={() => setMaterials([...materials, { materialName: "", quantity: 0, unit: "kg", recycledContentPct: 0, supplierName: "", originCountry: "India" }])}
                className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200"
              >
                <Plus className="w-3.5 h-3.5" /> Add Material Line Item
              </button>
            </div>

            {materials.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">No material inputs added yet. Click "Add Material Line Item" above.</div>
            ) : (
              <div className="space-y-3">
                {materials.map((mat, idx) => (
                  <div key={idx} className="p-3 bg-muted/30 rounded-xl border border-wireframe-border text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase">Material Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Stainless Steel 304"
                          value={mat.materialName}
                          onChange={(e) => { const copy = [...materials]; copy[idx].materialName = e.target.value; setMaterials(copy); }}
                          className="w-full px-3 py-1.5 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase">Quantity</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={mat.quantity}
                          onChange={(e) => { const copy = [...materials]; copy[idx].quantity = Number(e.target.value); setMaterials(copy); }}
                          className="w-full px-3 py-1.5 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase">Unit</label>
                        <select
                          value={mat.unit}
                          onChange={(e) => { const copy = [...materials]; copy[idx].unit = e.target.value; setMaterials(copy); }}
                          className="w-full px-3 py-1.5 border rounded-lg bg-background text-foreground"
                        >
                          <option value="kg">kg</option>
                          <option value="g">g</option>
                          <option value="tonne">tonne</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase">Recycled Content %</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={mat.recycledContentPct}
                          onChange={(e) => { const copy = [...materials]; copy[idx].recycledContentPct = Number(e.target.value); setMaterials(copy); }}
                          className="w-full px-3 py-1.5 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase">Supplier / Origin Country</label>
                        <input
                          type="text"
                          placeholder="e.g. Tata Steel / India"
                          value={mat.supplierName}
                          onChange={(e) => { const copy = [...materials]; copy[idx].supplierName = e.target.value; setMaterials(copy); }}
                          className="w-full px-3 py-1.5 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => setMaterials(materials.filter((_, i) => i !== idx))}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Manufacturing */}
        {activeStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600" />
              Step 3: Manufacturing Facility Energy & Utilities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Electricity Consumption (kWh)</label>
                <input
                  type="number"
                  value={manufacturing.electricityKwh}
                  onChange={(e) => setManufacturing({ ...manufacturing, electricityKwh: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg bg-background text-sm text-foreground"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Electricity Source</label>
                <select
                  value={manufacturing.electricitySource}
                  onChange={(e) => setManufacturing({ ...manufacturing, electricitySource: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-background text-sm text-foreground"
                >
                  <option value="GRID_MIX">National Grid Mix</option>
                  <option value="SOLAR_ON_SITE">Solar On-Site</option>
                  <option value="WIND_PPA">Wind PPA</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Natural Gas Consumption (m³)</label>
                <input
                  type="number"
                  value={manufacturing.naturalGasM3}
                  onChange={(e) => setManufacturing({ ...manufacturing, naturalGasM3: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg bg-background text-sm text-foreground"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Freshwater Consumption (Liters)</label>
                <input
                  type="number"
                  value={manufacturing.waterConsumptionLiters}
                  onChange={(e) => setManufacturing({ ...manufacturing, waterConsumptionLiters: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg bg-background text-sm text-foreground"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Transport */}
        {activeStep === 4 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-600" />
                Step 4: Logistics & Transport Legs
              </h2>
              <button
                onClick={() => setTransportation([...transportation, { legType: "RAW_MATERIAL_INBOUND", mode: "TRUCK_DIESEL", distanceKm: 250, weightTons: 1 }])}
                className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200"
              >
                <Plus className="w-3.5 h-3.5" /> Add Transport Leg
              </button>
            </div>

            {transportation.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">No transport legs added yet.</div>
            ) : (
              <div className="space-y-3">
                {transportation.map((leg, idx) => (
                  <div key={idx} className="p-4 bg-muted/30 rounded-xl border border-wireframe-border space-y-2 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                      <div className="md:col-span-3 space-y-1">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase">Leg Type</label>
                        <select
                          value={leg.legType}
                          onChange={(e) => { const copy = [...transportation]; copy[idx].legType = e.target.value; setTransportation(copy); }}
                          className="w-full px-3 py-2 border rounded-lg bg-background text-foreground"
                        >
                          <option value="RAW_MATERIAL_INBOUND">Raw Material Inbound</option>
                          <option value="FINISHED_GOODS_OUTBOUND">Outbound Finished Goods</option>
                        </select>
                      </div>

                      <div className="md:col-span-3 space-y-1">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase">Transport Mode</label>
                        <select
                          value={leg.mode}
                          onChange={(e) => { const copy = [...transportation]; copy[idx].mode = e.target.value; setTransportation(copy); }}
                          className="w-full px-3 py-2 border rounded-lg bg-background text-foreground"
                        >
                          <option value="TRUCK_DIESEL">Truck (Diesel)</option>
                          <option value="CONTAINER_SHIP">Container Ship</option>
                          <option value="AIR_FREIGHT">Air Freight</option>
                          <option value="RAIL">Rail</option>
                        </select>
                      </div>

                      <div className="md:col-span-2.5 space-y-1">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase">Distance (km)</label>
                        <input
                          type="number"
                          placeholder="Distance (km)"
                          value={leg.distanceKm}
                          onChange={(e) => { const copy = [...transportation]; copy[idx].distanceKm = Number(e.target.value); setTransportation(copy); }}
                          className="w-full px-3 py-2 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground"
                        />
                      </div>

                      <div className="md:col-span-2.5 space-y-1">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase">Weight (Tons)</label>
                        <input
                          type="number"
                          placeholder="Weight (Tons)"
                          value={leg.weightTons}
                          onChange={(e) => { const copy = [...transportation]; copy[idx].weightTons = Number(e.target.value); setTransportation(copy); }}
                          className="w-full px-3 py-2 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground"
                        />
                      </div>

                      <div className="md:col-span-1 flex justify-end">
                        <button
                          onClick={() => setTransportation(transportation.filter((_, i) => i !== idx))}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 5: Packaging */}
        {activeStep === 5 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Archive className="w-4 h-4 text-emerald-600" />
                Step 5: Product Packaging Components
              </h2>
              <button
                onClick={() => setPackaging([...packaging, { packagingType: "Cardboard Box", weightGramsPerUnit: 150, recycledContentPct: 50, disposalRoute: "RECYCLED" }])}
                className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200"
              >
                <Plus className="w-3.5 h-3.5" /> Add Packaging
              </button>
            </div>

            {packaging.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">No packaging items added yet.</div>
            ) : (
              <div className="space-y-3">
                {packaging.map((pack, idx) => (
                  <div key={idx} className="p-3 bg-muted/30 rounded-xl border border-wireframe-border text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase">Packaging Type</label>
                        <input
                          type="text"
                          placeholder="e.g. Cardboard Box"
                          value={pack.packagingType}
                          onChange={(e) => { const copy = [...packaging]; copy[idx].packagingType = e.target.value; setPackaging(copy); }}
                          className="w-full px-3 py-1.5 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase">Weight (grams/unit)</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={pack.weightGramsPerUnit}
                          onChange={(e) => { const copy = [...packaging]; copy[idx].weightGramsPerUnit = Number(e.target.value); setPackaging(copy); }}
                          className="w-full px-3 py-1.5 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase">Recycled Content %</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={pack.recycledContentPct}
                          onChange={(e) => { const copy = [...packaging]; copy[idx].recycledContentPct = Number(e.target.value); setPackaging(copy); }}
                          className="w-full px-3 py-1.5 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase">Disposal Route</label>
                        <select
                          value={pack.disposalRoute}
                          onChange={(e) => { const copy = [...packaging]; copy[idx].disposalRoute = e.target.value; setPackaging(copy); }}
                          className="w-full px-3 py-1.5 border rounded-lg bg-background text-foreground"
                        >
                          <option value="RECYCLED">Recycled</option>
                          <option value="LANDFILL">Landfill</option>
                          <option value="INCINERATION">Incineration</option>
                        </select>
                      </div>
                      <div className="flex justify-end">
                        <button onClick={() => setPackaging(packaging.filter((_, i) => i !== idx))} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 6: Waste */}
        {activeStep === 6 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-emerald-600" />
                Step 6: Waste & Direct Emissions
              </h2>
              <button
                onClick={() => setWasteEmissions([...wasteEmissions, { wasteType: "Scrap Metal", quantityKg: 50, treatmentMethod: "RECYCLING" }])}
                className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200"
              >
                <Plus className="w-3.5 h-3.5" /> Add Waste Line Item
              </button>
            </div>

            {wasteEmissions.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">No waste or direct emissions specified yet.</div>
            ) : (
              <div className="space-y-3">
                {wasteEmissions.map((w, idx) => (
                  <div key={idx} className="p-3 bg-muted/30 rounded-xl border border-wireframe-border text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase">Waste Type</label>
                        <input
                          type="text"
                          placeholder="e.g. Scrap Metal"
                          value={w.wasteType}
                          onChange={(e) => { const copy = [...wasteEmissions]; copy[idx].wasteType = e.target.value; setWasteEmissions(copy); }}
                          className="w-full px-3 py-1.5 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase">Quantity (kg)</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={w.quantityKg}
                          onChange={(e) => { const copy = [...wasteEmissions]; copy[idx].quantityKg = Number(e.target.value); setWasteEmissions(copy); }}
                          className="w-full px-3 py-1.5 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase">Treatment Method</label>
                        <select
                          value={w.treatmentMethod}
                          onChange={(e) => { const copy = [...wasteEmissions]; copy[idx].treatmentMethod = e.target.value; setWasteEmissions(copy); }}
                          className="w-full px-3 py-1.5 border rounded-lg bg-background text-foreground"
                        >
                          <option value="RECYCLING">Recycling</option>
                          <option value="LANDFILL">Landfill</option>
                          <option value="INCINERATION_WITH_ENERGY_RECOVERY">Incineration with Energy Recovery</option>
                        </select>
                      </div>
                      <div className="flex justify-end">
                        <button onClick={() => setWasteEmissions(wasteEmissions.filter((_, i) => i !== idx))} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 7: Verification & Submit */}
        {activeStep === 7 && (
          <div className="space-y-5">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              Step 7: Verification Summary & Final Review Submission
            </h2>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 rounded-xl space-y-2 text-xs text-emerald-900 dark:text-emerald-200">
              <p className="font-bold text-sm">Questionnaire Summary Ready for Submission</p>
              <p>You have entered data across 6 lifecycle categories. Submitting this questionnaire will lock your draft and notify the internal LCA Reviewer team to inspect and audit your line items.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-muted/40 rounded-lg border border-wireframe-border">
                <span className="text-muted-foreground">Raw Materials:</span>
                <p className="font-bold text-foreground mt-0.5">{materials.length} line items</p>
              </div>
              <div className="p-3 bg-muted/40 rounded-lg border border-wireframe-border">
                <span className="text-muted-foreground">Electricity:</span>
                <p className="font-bold text-foreground mt-0.5">{manufacturing.electricityKwh || 0} kWh</p>
              </div>
              <div className="p-3 bg-muted/40 rounded-lg border border-wireframe-border">
                <span className="text-muted-foreground">Logistics Legs:</span>
                <p className="font-bold text-foreground mt-0.5">{transportation.length} transport legs</p>
              </div>
              <div className="p-3 bg-muted/40 rounded-lg border border-wireframe-border">
                <span className="text-muted-foreground">Packaging:</span>
                <p className="font-bold text-foreground mt-0.5">{packaging.length} components</p>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={handleSubmitReview}
                disabled={updateMutation.isPending}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all text-sm"
              >
                <Send className="w-4 h-4" />
                Submit Questionnaire to LCA Review Team
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stepper Footer Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
          disabled={activeStep === 1}
          className="flex items-center gap-1 px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-muted disabled:opacity-40"
        >
          <ArrowLeft className="w-4 h-4" /> Previous Step
        </button>

        <span className="text-xs font-bold text-muted-foreground">Step {activeStep} of 7</span>

        <button
          onClick={() => setActiveStep(Math.min(7, activeStep + 1))}
          disabled={activeStep === 7}
          className="flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-500 disabled:opacity-40"
        >
          Next Step <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
