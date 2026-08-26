import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/lib/auth";
import { Leaf, Lock, Mail, Eye, EyeOff, ShieldCheck, Sparkles } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "LCA MONKTRACE — Login" },
      { name: "description", content: "Sign in to LCA MONKTRACE Environmental Data Platform" },
    ],
  }),
  component: Login,
});

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate({ to: "/", replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onSubmit = async (data: LoginFormValues) => {
    setErrorMsg(null);
    try {
      await login(data.email, data.password);
      navigate({ to: "/", replace: true });
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Invalid email or password. Please try again.";
      setErrorMsg(msg);
    }
  };

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-foreground relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl w-full bg-slate-900/90 backdrop-blur-md rounded-3xl border border-emerald-500/20 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 relative z-10">
        
        {/* Left Side: LCA Branding & Ecosystem info */}
        <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900 p-10 text-white border-r border-emerald-500/20">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/30">
                <Leaf className="w-6 h-6 text-slate-950 fill-slate-950" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-white">LCA MONKTRACE</h2>
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Environmental Platform</p>
              </div>
            </div>

            <div className="pt-6 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5" /> ISO 14040/44 Standardized
              </div>
              <h3 className="text-2xl font-bold tracking-tight leading-snug">
                Digitized Life Cycle Assessment & Product Footprint Engine
              </h3>
              <p className="text-xs text-emerald-100/70 leading-relaxed">
                Centralized environmental data hub enabling vendor data onboarding, activity questionnaires, auditor verification, and canonical data reuse for ERD & DPP.
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-emerald-500/20 flex items-center justify-between text-[11px] text-emerald-200/60 font-medium">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Enterprise Encrypted</span>
            <span>v1.0.0</span>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-8 md:p-10 flex flex-col justify-center space-y-6">
          <div>
            <div className="md:hidden flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
                <Leaf className="w-5 h-5 text-slate-950 fill-slate-950" />
              </div>
              <span className="text-base font-bold text-white">LCA MONKTRACE</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Sign in to Platform</h1>
            <p className="text-xs text-slate-400 mt-1">Enter your credentials to access the LCA portal</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-xl text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="email">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  placeholder="admin@monktrace.com"
                  {...register("email")}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.email ? 'border-red-500' : 'border-slate-800'}`}
                />
              </div>
              {errors.email && <p className="text-red-400 text-[11px] mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-300" htmlFor="password">Password</label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  className={`w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.password ? 'border-red-500' : 'border-slate-800'}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-[11px] mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 text-sm cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Signing in..." : "Sign In to Platform"}
            </button>
          </form>

          <div className="text-center text-xs text-slate-400 pt-1">
            New Vendor Supplier?{" "}
            <Link to="/register" className="text-emerald-400 font-semibold hover:underline">
              Register Your Company Here
            </Link>
          </div>

          <div className="pt-4 border-t border-slate-800 text-center text-[11px] text-slate-500">
            <p>© 2026 LCA MONKTRACE — Environmental Data Platform</p>
          </div>
        </div>
      </div>
    </div>
  );
}
