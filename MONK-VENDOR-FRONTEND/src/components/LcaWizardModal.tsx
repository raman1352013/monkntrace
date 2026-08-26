import { useState } from 'react';
import api from '../lib/api';
import { X, Save, Send, Package, Zap, Truck, Archive, Trash2, FileCheck, Layers, Plus, Trash } from 'lucide-react';

interface LcaWizardModalProps {
  project: any;
  onClose: () => void;
  onRefresh: () => void;
}

export function LcaWizardModal({ project, onClose, onRefresh }: LcaWizardModalProps) {
  const [activeTab, setActiveTab] = useState(1);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [functionalUnit, setFunctionalUnit] = useState(project.functionalUnit || '1 Unit');
  const [systemBoundary, setSystemBoundary] = useState(project.systemBoundary || 'CRADLE_TO_GATE');
  const [materials, setMaterials] = useState<any[]>(
    project.materials?.length
      ? project.materials
      : [{ materialName: 'Stainless Steel Grade 304', category: 'Metals', quantity: 0.75, unit: 'kg', originCountry: 'India' }]
  );
  const [electricityKwh, setElectricityKwh] = useState(project.manufacturing?.electricityKwh || project.energyConsumption?.electricityKwh || 12.5);
  const [naturalGasM3, setNaturalGasM3] = useState(project.manufacturing?.naturalGasM3 || project.energyConsumption?.naturalGasMj || 0);
  const [dieselLiters, setDieselLiters] = useState(project.manufacturing?.dieselLiters || 0);
  const [waterLiters, setWaterLiters] = useState(project.manufacturing?.waterConsumptionLiters || 0);

  const [transportation, setTransportation] = useState<any[]>(
    project.transportation?.length
      ? project.transportation
      : [{ mode: 'Heavy Duty Diesel Truck (16-32T)', distanceKm: 450, weightTons: 0.05 }]
  );
  const [packaging, setPackaging] = useState<any[]>(
    project.packaging?.length
      ? project.packaging
      : [{ packagingType: 'Recycled Corrugated Cardboard Box', weightGramsPerUnit: 120, recycledContentPct: 80 }]
  );
  const [wasteEmissions, setWasteEmissions] = useState<any[]>(
    project.wasteEmissions?.length
      ? project.wasteEmissions
      : [{ wasteType: 'Production Metal Scrap', quantityKg: 0.05, treatmentMethod: 'Material Recycling' }]
  );

  const tabs = [
    { num: 1, label: '1. Product Specs', icon: Layers },
    { num: 2, label: '2. Raw Materials', icon: Package },
    { num: 3, label: '3. Energy & Utilities', icon: Zap },
    { num: 4, label: '4. Transportation', icon: Truck },
    { num: 5, label: '5. Packaging & PPWR', icon: Archive },
    { num: 6, label: '6. Waste & Emissions', icon: Trash2 },
    { num: 7, label: '7. Verification & Submit', icon: FileCheck },
  ];

  const handleSaveDraft = async () => {
    setSaving(true);
    setMessage(null);

    const payload = {
      functionalUnit,
      systemBoundary,
      materials,
      manufacturing: {
        electricityKwh,
        naturalGasM3,
        dieselLiters,
        waterConsumptionLiters: waterLiters,
      },
      transportation,
      packaging,
      wasteEmissions,
    };

    try {
      const res = await api.put(`/lca/${project._id}`, payload);
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Draft questionnaire saved successfully!' });
        onRefresh();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save draft' });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitReview = async () => {
    setSubmitting(true);
    setMessage(null);

    try {
      await handleSaveDraft();
      const res = await api.post(`/lca/${project._id}/submit`);
      if (res.data.success) {
        setMessage({ type: 'success', text: 'LCA Study submitted successfully for Auditor verification!' });
        setTimeout(() => {
          onRefresh();
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to submit study' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                LCA Questionnaire Wizard
              </span>
              <span className="text-xs text-slate-400">Project: <strong>{project.title}</strong></span>
              {project.status === 'SUBMITTED' || project.status === 'UNDER_REVIEW' ? (
                <span className="text-[10px] font-bold uppercase text-blue-400 bg-blue-950/80 px-2.5 py-0.5 rounded-full border border-blue-500/30">
                  🔒 Under Auditor Review
                </span>
              ) : project.status === 'APPROVED' ? (
                <span className="text-[10px] font-bold uppercase text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  ✅ Approved & Verified
                </span>
              ) : null}
            </div>
            <h2 className="text-lg font-bold text-white mt-1">ISO 14040/44 Environmental Data Questionnaire</h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4 text-emerald-400" /> {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Stepper Bar */}
        <div className="flex items-center gap-1.5 p-3 bg-slate-950/80 border-b border-slate-800 overflow-x-auto scrollbar-none">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.num}
                onClick={() => setActiveTab(t.num)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === t.num
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Notification Message */}
        {message && (
          <div
            className={`mx-6 mt-4 p-3.5 rounded-xl border text-xs font-semibold ${
              message.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : 'bg-red-500/10 text-red-300 border-red-500/30'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          
          {/* STEP 1 */}
          {activeTab === 1 && (
            <div className="space-y-5 max-w-xl">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white">Step 1: Product Specifications & System Scope</h3>
                <p className="text-xs text-slate-400">Define the reference performance unit and life cycle assessment boundaries.</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-200 font-semibold">Functional Unit (Reference Flow) *</label>
                <p className="text-[11px] text-slate-400">Quantified performance reference (e.g. "1 Bottle providing 750ml capacity over 5 years")</p>
                <input
                  type="text"
                  value={functionalUnit}
                  onChange={(e) => setFunctionalUnit(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. 1 Stainless Steel Thermal Bottle (750ml)"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-200 font-semibold">System Boundary *</label>
                <p className="text-[11px] text-slate-400">Specifies which lifecycle stages are included in the study</p>
                <select
                  value={systemBoundary}
                  onChange={(e) => setSystemBoundary(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="CRADLE_TO_GATE">Cradle-to-Gate (Raw Material Extraction to Factory Gate)</option>
                  <option value="CRADLE_TO_GRAVE">Cradle-to-Grave (Full Product Life Cycle including Use & End of Life)</option>
                  <option value="GATE_TO_GATE">Gate-to-Gate (Internal Factory Operations Only)</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {activeTab === 2 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">Step 2: Raw Material Inputs & Composition</h3>
                  <p className="text-xs text-slate-400">List all virgin and recycled raw materials per unit of finished product.</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setMaterials([
                      ...materials,
                      { materialName: '', category: 'Metals', quantity: 0, unit: 'kg', originCountry: 'India' },
                    ])
                  }
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Material Line Item
                </button>
              </div>

              <div className="space-y-3">
                {materials.map((m, idx) => (
                  <div key={idx} className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                      <div className="sm:col-span-4 space-y-1">
                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Material Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Stainless Steel Grade 304"
                          value={m.materialName || m.name || ''}
                          onChange={(e) => {
                            const copy = [...materials];
                            copy[idx].materialName = e.target.value;
                            setMaterials(copy);
                          }}
                          className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Quantity *</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.75"
                          value={m.quantity}
                          onChange={(e) => {
                            const copy = [...materials];
                            copy[idx].quantity = parseFloat(e.target.value) || 0;
                            setMaterials(copy);
                          }}
                          className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Unit *</label>
                        <input
                          type="text"
                          placeholder="kg"
                          value={m.unit || 'kg'}
                          onChange={(e) => {
                            const copy = [...materials];
                            copy[idx].unit = e.target.value;
                            setMaterials(copy);
                          }}
                          className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div className="sm:col-span-3 space-y-1">
                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Origin Country</label>
                        <input
                          type="text"
                          placeholder="e.g. India"
                          value={m.originCountry || 'India'}
                          onChange={(e) => {
                            const copy = [...materials];
                            copy[idx].originCountry = e.target.value;
                            setMaterials(copy);
                          }}
                          className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div className="sm:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setMaterials(materials.filter((_, i) => i !== idx))}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {activeTab === 3 && (
            <div className="space-y-5 max-w-xl">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white">Step 3: Manufacturing & Utility Energy Consumption</h3>
                <p className="text-xs text-slate-400">Total factory utilities consumed per unit product manufactured.</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-200 font-semibold">Grid Electricity Consumption (kWh per unit product) *</label>
                <input
                  type="number"
                  step="0.1"
                  value={electricityKwh}
                  onChange={(e) => setElectricityKwh(parseFloat(e.target.value) || 0)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-200 font-semibold">Natural Gas / Boiler Fuel (m³ or MJ per unit product)</label>
                <input
                  type="number"
                  step="0.1"
                  value={naturalGasM3}
                  onChange={(e) => setNaturalGasM3(parseFloat(e.target.value) || 0)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-200 font-semibold">Generator Diesel Consumption (Liters per unit product)</label>
                <input
                  type="number"
                  step="0.01"
                  value={dieselLiters}
                  onChange={(e) => setDieselLiters(parseFloat(e.target.value) || 0)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-200 font-semibold">Process Water Consumption (Liters per unit product)</label>
                <input
                  type="number"
                  step="0.1"
                  value={waterLiters}
                  onChange={(e) => setWaterLiters(parseFloat(e.target.value) || 0)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {activeTab === 4 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">Step 4: Logistics & Transportation Legs</h3>
                  <p className="text-xs text-slate-400">Inbound raw material logistics & outbound distribution distance.</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setTransportation([
                      ...transportation,
                      { mode: 'Heavy Duty Diesel Truck', distanceKm: 100, weightTons: 0.01 },
                    ])
                  }
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Transport Leg
                </button>
              </div>

              <div className="space-y-3">
                {transportation.map((t, idx) => (
                  <div key={idx} className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                      <div className="sm:col-span-5 space-y-1">
                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Transport Vehicle / Mode *</label>
                        <input
                          type="text"
                          placeholder="e.g. Heavy Duty Diesel Truck (16-32T)"
                          value={t.mode}
                          onChange={(e) => {
                            const copy = [...transportation];
                            copy[idx].mode = e.target.value;
                            setTransportation(copy);
                          }}
                          className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div className="sm:col-span-3 space-y-1">
                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Transport Distance (km) *</label>
                        <input
                          type="number"
                          placeholder="e.g. 450"
                          value={t.distanceKm}
                          onChange={(e) => {
                            const copy = [...transportation];
                            copy[idx].distanceKm = parseFloat(e.target.value) || 0;
                            setTransportation(copy);
                          }}
                          className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div className="sm:col-span-3 space-y-1">
                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Shipment Weight (Tons) *</label>
                        <input
                          type="number"
                          step="0.001"
                          placeholder="e.g. 0.05"
                          value={t.weightTons}
                          onChange={(e) => {
                            const copy = [...transportation];
                            copy[idx].weightTons = parseFloat(e.target.value) || 0;
                            setTransportation(copy);
                          }}
                          className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div className="sm:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setTransportation(transportation.filter((_, i) => i !== idx))}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5 */}
          {activeTab === 5 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">Step 5: Packaging Materials & PPWR Compliance</h3>
                  <p className="text-xs text-slate-400">Primary, secondary & tertiary packaging with Post-Consumer Recycled PCR %.</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setPackaging([
                      ...packaging,
                      { packagingType: 'Recycled Cardboard Box', weightGramsPerUnit: 100, recycledContentPct: 75 },
                    ])
                  }
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Packaging Item
                </button>
              </div>

              <div className="space-y-3">
                {packaging.map((p, idx) => (
                  <div key={idx} className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                      <div className="sm:col-span-5 space-y-1">
                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Packaging Material Type *</label>
                        <input
                          type="text"
                          placeholder="e.g. Recycled Corrugated Cardboard Box"
                          value={p.packagingType || p.materialType || ''}
                          onChange={(e) => {
                            const copy = [...packaging];
                            copy[idx].packagingType = e.target.value;
                            setPackaging(copy);
                          }}
                          className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div className="sm:col-span-3 space-y-1">
                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Weight (Grams / Unit) *</label>
                        <input
                          type="number"
                          placeholder="120"
                          value={p.weightGramsPerUnit || p.weightGrams || 0}
                          onChange={(e) => {
                            const copy = [...packaging];
                            copy[idx].weightGramsPerUnit = parseFloat(e.target.value) || 0;
                            setPackaging(copy);
                          }}
                          className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div className="sm:col-span-3 space-y-1">
                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Post-Consumer Recycled PCR % *</label>
                        <input
                          type="number"
                          placeholder="80"
                          value={p.recycledContentPct || p.recycledContentPercentage || 0}
                          onChange={(e) => {
                            const copy = [...packaging];
                            copy[idx].recycledContentPct = parseFloat(e.target.value) || 0;
                            setPackaging(copy);
                          }}
                          className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div className="sm:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setPackaging(packaging.filter((_, i) => i !== idx))}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6 */}
          {activeTab === 6 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">Step 6: Waste Streams & Direct Emissions</h3>
                  <p className="text-xs text-slate-400">Scrap metal, chemical waste, and stack emissions generated during manufacturing.</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setWasteEmissions([
                      ...wasteEmissions,
                      { wasteType: 'Production Scrap', quantityKg: 0.1, treatmentMethod: 'Recycling' },
                    ])
                  }
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Waste Stream
                </button>
              </div>

              <div className="space-y-3">
                {wasteEmissions.map((w, idx) => (
                  <div key={idx} className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                      <div className="sm:col-span-5 space-y-1">
                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Waste Stream Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Production Metal Scrap"
                          value={w.wasteType}
                          onChange={(e) => {
                            const copy = [...wasteEmissions];
                            copy[idx].wasteType = e.target.value;
                            setWasteEmissions(copy);
                          }}
                          className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div className="sm:col-span-3 space-y-1">
                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Quantity (kg) *</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.05"
                          value={w.quantityKg || w.quantity || 0}
                          onChange={(e) => {
                            const copy = [...wasteEmissions];
                            copy[idx].quantityKg = parseFloat(e.target.value) || 0;
                            setWasteEmissions(copy);
                          }}
                          className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div className="sm:col-span-3 space-y-1">
                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Disposal / Treatment Method *</label>
                        <input
                          type="text"
                          placeholder="e.g. Material Recycling / Landfill"
                          value={w.treatmentMethod || w.disposalMethod || ''}
                          onChange={(e) => {
                            const copy = [...wasteEmissions];
                            copy[idx].treatmentMethod = e.target.value;
                            setWasteEmissions(copy);
                          }}
                          className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div className="sm:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setWasteEmissions(wasteEmissions.filter((_, i) => i !== idx))}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 7 */}
          {activeTab === 7 && (
            <div className="space-y-6 text-center max-w-lg mx-auto py-4">
              <FileCheck className="w-14 h-14 text-emerald-400 mx-auto" />
              <div>
                <h3 className="text-lg font-bold text-white">Ready for Auditor Review Submission?</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Once submitted, the LCA Auditor team will inspect your line items and audit the dataset for LCA, ERD, and DPP calculation.
                </p>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-left space-y-2 text-xs text-slate-300">
                <div className="font-bold text-white text-xs border-b border-slate-800 pb-2">Summary Data Package:</div>
                <div>• Raw Materials: <strong className="text-emerald-400">{materials.length} line items</strong></div>
                <div>• Energy Utilities: <strong className="text-emerald-400">{electricityKwh} kWh electricity</strong></div>
                <div>• Transport Legs: <strong className="text-emerald-400">{transportation.length} transport legs</strong></div>
                <div>• Packaging: <strong className="text-emerald-400">{packaging.length} items</strong></div>
              </div>

              <button
                type="button"
                onClick={handleSubmitReview}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-xl shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Submitting Study...' : 'Submit LCA Study for Auditor Review'}
              </button>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <button
            type="button"
            disabled={activeTab === 1}
            onClick={() => setActiveTab((prev) => Math.max(prev - 1, 1))}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold disabled:opacity-40 cursor-pointer"
          >
            Previous Tab
          </button>

          <span className="text-xs text-slate-400 font-semibold">Tab {activeTab} of 7</span>

          <button
            type="button"
            disabled={activeTab === 7}
            onClick={() => setActiveTab((prev) => Math.min(prev + 1, 7))}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs disabled:opacity-40 cursor-pointer"
          >
            Next Tab
          </button>
        </div>
      </div>
    </div>
  );
}
