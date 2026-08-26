import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Leaf, Plus, LogOut, FileText, CheckCircle2, Clock, AlertTriangle, ArrowRight, Layers } from 'lucide-react';
import { LcaWizardModal } from './LcaWizardModal';
import { NewProductModal } from './NewProductModal';

interface VendorDashboardProps {
  user: any;
  onLogout: () => void;
}

export function VendorDashboard({ user, onLogout }: VendorDashboardProps) {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeProject, setActiveProject] = useState<any | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const projRes = await api.get('/lca');
      if (projRes.data.success) setProjects(projRes.data.data || []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const draftCount = projects.filter((p) => p.status === 'DRAFT').length;
  const submittedCount = projects.filter((p) => p.status === 'SUBMITTED' || p.status === 'UNDER_REVIEW').length;
  const correctionsCount = projects.filter((p) => p.status === 'CORRECTIONS_REQUIRED').length;
  const approvedCount = projects.filter((p) => p.status === 'APPROVED').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      {/* Top Navbar */}
      <div className="max-w-7xl mx-auto flex items-center justify-between bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-500/20">
            <Leaf className="w-6 h-6 text-slate-950 fill-slate-950" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">LCA MONKTRACE — Vendor Portal</h1>
            <p className="text-xs text-slate-400">Supplier Data & Environmental Questionnaire Workspace</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-white">{user?.email}</div>
            <div className="text-[10px] text-emerald-400 font-semibold uppercase">{user?.userType || 'VENDOR SUPPLIER'}</div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-red-400" /> Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{draftCount}</div>
              <div className="text-xs text-slate-400">Draft Questionnaires</div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{submittedCount}</div>
              <div className="text-xs text-slate-400">Under Review</div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{correctionsCount}</div>
              <div className="text-xs text-slate-400">Corrections Requested</div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{approvedCount}</div>
              <div className="text-xs text-slate-400">Approved Studies</div>
            </div>
          </div>
        </div>

        {/* Action Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white">Your LCA Data Submissions</h2>
            <p className="text-xs text-slate-400 mt-1">Fill material, energy, transport, and packaging data step-by-step.</p>
          </div>

          <button
            onClick={() => setShowProductModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Product for LCA
          </button>
        </div>

        {/* Projects List */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading LCA studies...</div>
        ) : projects.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-4 max-w-lg mx-auto">
            <Layers className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-white">No LCA Studies Yet</h3>
            <p className="text-xs text-slate-400">
              Start by adding your product and filling in the 7-step environmental data questionnaire.
            </p>
            <button
              onClick={() => setShowProductModal(true)}
              className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
            >
              Add Product & Create Study
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <div
                key={proj._id}
                className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-6 transition-all flex flex-col justify-between space-y-4 shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                      ISO 14040 / 44
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                        proj.status === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : proj.status === 'CORRECTIONS_REQUIRED'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : proj.status === 'SUBMITTED' || proj.status === 'UNDER_REVIEW'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {proj.status?.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white line-clamp-1">{proj.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">Product: <span className="text-slate-200 font-medium">{proj.productId?.name || 'N/A'}</span></p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Unit: {proj.functionalUnit || '1 Unit'} | Boundary: {proj.systemBoundary || 'Cradle to Gate'}</p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    Updated: {new Date(proj.updatedAt || Date.now()).toLocaleDateString()}
                  </div>

                  <button
                    onClick={() => setActiveProject(proj)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 font-bold rounded-xl text-xs transition-all border border-emerald-500/30 cursor-pointer"
                  >
                    <span>Fill Questionnaire</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 7-Step LCA Questionnaire Modal */}
      {activeProject && (
        <LcaWizardModal
          project={activeProject}
          onClose={() => setActiveProject(null)}
          onRefresh={fetchDashboardData}
        />
      )}

      {/* Add New Product Modal */}
      {showProductModal && (
        <NewProductModal
          onClose={() => setShowProductModal(false)}
          onRefresh={fetchDashboardData}
        />
      )}
    </div>
  );
}
