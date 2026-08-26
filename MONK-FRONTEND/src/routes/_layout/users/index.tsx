import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";

export const Route = createFileRoute("/_layout/users/")({
  component: UsersList,
});

const ROLES = ["Super Admin", "Admin", "Reviewer", "Vendor"] as const;

const ROLE_COLORS: Record<string, string> = {
  "Super Admin": "bg-purple-100 text-purple-800 border-purple-200",
  Admin:         "bg-emerald-100 text-emerald-800 border-emerald-200",
  Reviewer:      "bg-indigo-100 text-indigo-800 border-indigo-200",
  Vendor:        "bg-teal-100 text-teal-800 border-teal-200",
};

function mapUserTypeToRole(userType: string): string {
  if (userType === "SUPER_ADMIN") return "Super Admin";
  if (userType === "ADMIN")       return "Admin";
  if (userType === "REVIEWER")    return "Reviewer";
  if (userType === "VENDOR")      return "Vendor";
  return "Vendor";
}

function mapRoleToUserType(role: string): string {
  if (role === "Super Admin") return "SUPER_ADMIN";
  if (role === "Admin")       return "ADMIN";
  if (role === "Reviewer")    return "REVIEWER";
  if (role === "Vendor")      return "VENDOR";
  return "VENDOR";
}

// ── Edit User Modal ─────────────────────────────────────────
function EditUserModal({
  user,
  onClose,
}: {
  user: any;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();

  const [firstName, setFirstName]   = useState(user.firstName || "");
  const [lastName, setLastName]     = useState(user.lastName || "");
  const [email, setEmail]           = useState(user.email || "");
  const [phone, setPhone]           = useState(
    (user.phoneNumber || "").replace(/^\+91/, "")
  );
  const [role, setRole]             = useState(mapUserTypeToRole(user.userType));
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors]         = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!firstName.trim() || firstName.trim().length < 2) e.firstName = "Min 2 characters required";
    if (!lastName.trim() || lastName.trim().length < 2)   e.lastName  = "Min 2 characters required";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Valid email required";
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) e.phone = "Valid 10-digit mobile required";
    if (newPassword && newPassword.length < 8) e.newPassword = "Password must be at least 8 characters";
    return e;
  };

  const updateMutation = useMutation({
    mutationFn: async () => {
      const cleanPhone = phone.replace(/\s+/g, "").replace(/-/g, "");
      const payload: any = {
        firstName: firstName.trim(),
        lastName:  lastName.trim(),
        email:     email.trim(),
        phoneNumber: cleanPhone.startsWith("+") ? cleanPhone : `+91${cleanPhone}`,
        userType:  mapRoleToUserType(role),
      };
      const res = await api.put(`/users/${user._id || user.id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("User updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update user");
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/users/${user._id || user.id}/reset-password`, { newPassword });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Password reset successfully!");
      setNewPassword("");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to reset password");
    },
  });

  const handleSave = () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    updateMutation.mutate();
  };

  const handlePasswordReset = () => {
    if (!newPassword || newPassword.length < 8) {
      setErrors(e => ({ ...e, newPassword: "Password must be at least 8 characters" }));
      return;
    }
    setErrors(e => { const n = { ...e }; delete n.newPassword; return n; });
    resetPasswordMutation.mutate();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg border border-wireframe-border max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="p-5 border-b border-wireframe-border flex items-center justify-between sticky top-0 bg-surface z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary uppercase text-base">
              {user.firstName?.charAt(0) || "U"}
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">Edit User</h3>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-wireframe-bg-alt transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Basic Info Section */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Basic Information
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={e => { setFirstName(e.target.value); setErrors(er => { const n={...er}; delete n.firstName; return n; }); }}
                  className={`w-full border ${errors.firstName ? "border-red-400 focus:ring-red-400" : "border-input"} bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="First name"
                />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={e => { setLastName(e.target.value); setErrors(er => { const n={...er}; delete n.lastName; return n; }); }}
                  className={`w-full border ${errors.lastName ? "border-red-400 focus:ring-red-400" : "border-input"} bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="Last name"
                />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErrors(er => { const n={...er}; delete n.email; return n; }); }}
                  className={`w-full border ${errors.email ? "border-red-400 focus:ring-red-400" : "border-input"} bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="user@company.com"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 border border-r-0 border-input rounded-l-lg bg-wireframe-bg-alt text-sm font-medium text-muted-foreground">
                    +91
                  </span>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => { setPhone(e.target.value); setErrors(er => { const n={...er}; delete n.phone; return n; }); }}
                    className={`flex-1 border ${errors.phone ? "border-red-400 focus:ring-red-400" : "border-input"} bg-background rounded-r-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary`}
                    placeholder="9876543210"
                    maxLength={10}
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>
          </div>

          {/* Role Section */}
          <div className="border-t border-wireframe-border pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Role & Access
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map(r => (
                <label
                  key={r}
                  className={`flex items-center gap-2.5 p-3 border rounded-lg cursor-pointer transition-all ${
                    role === r
                      ? "border-primary bg-primary/5"
                      : "border-wireframe-border hover:bg-wireframe-bg-alt"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r}
                    checked={role === r}
                    onChange={() => setRole(r)}
                    className="w-4 h-4 text-primary cursor-pointer"
                  />
                  <div>
                    <span className="block text-sm font-semibold text-foreground">{r}</span>
                    <span className={`mt-0.5 inline-block text-[10px] font-bold px-1.5 py-0.5 rounded border ${ROLE_COLORS[r] || "bg-gray-100 text-gray-700"}`}>
                      {mapRoleToUserType(r)}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-3 pt-1">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border border-wireframe-border rounded-lg hover:bg-wireframe-bg-alt transition-colors font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="flex items-center gap-2 px-5 py-2 text-sm rounded-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {updateMutation.isPending ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                  Saving...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  Save Changes
                </>
              )}
            </button>
          </div>

          {/* Password Reset Section */}
          <div className="border-t border-wireframe-border pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Reset Password
            </h4>
            <p className="text-xs text-muted-foreground mb-3">
              Set a new password for this user. Min 8 characters required. This will log them out of all sessions.
            </p>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={e => { setNewPassword(e.target.value); setErrors(er => { const n={...er}; delete n.newPassword; return n; }); }}
                  className={`w-full border ${errors.newPassword ? "border-red-400" : "border-input"} bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary pr-10`}
                  placeholder="New password (min 8 chars)"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-2 top-2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">{showPassword ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
              <button
                onClick={handlePasswordReset}
                disabled={!newPassword || resetPasswordMutation.isPending}
                className="px-3 py-2 text-sm rounded-lg font-semibold bg-orange-600 text-white hover:bg-orange-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 whitespace-nowrap"
              >
                {resetPasswordMutation.isPending ? (
                  <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                ) : (
                  <span className="material-symbols-outlined text-[16px]">lock_reset</span>
                )}
                Reset Password
              </button>
            </div>
            {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main List Page ──────────────────────────────────────────
function UsersList() {
  const queryClient = useQueryClient();
  const [search, setSearch]             = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [editingUser, setEditingUser]   = useState<any | null>(null);

  const { data: response, isLoading, error } = useQuery({
    queryKey: ["users", selectedStatus, selectedRole, search],
    queryFn: async () => {
      const params: any = { limit: 100 };
      if (selectedStatus) params.status = selectedStatus === "Active" ? "ACTIVE" : "INACTIVE";
      if (selectedRole) {
        const typeMap: Record<string, string> = {
          "Admin": "SUPER_ADMIN",
          "MD": "MD",
          "Sales Executive": "SALES_EXECUTIVE",
          "Operations": "OPERATIONS",
          "Accounts": "ACCOUNTS",
          "Logistics": "LOGISTICS_TEAM",
        };
        params.role = typeMap[selectedRole] || selectedRole;
      }
      if (search) params.search = search;
      const res = await api.get("/users", { params });
      return res.data;
    },
  });

  const usersList = response?.data || [];

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ userId, currentStatus }: { userId: string; currentStatus: string }) => {
      const targetStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      const res = await api.put(`/users/${userId}`, { status: targetStatus });
      return res.data;
    },
    onSuccess: (_, { currentStatus }) => {
      toast.success(`User ${currentStatus === "ACTIVE" ? "disabled" : "enabled"} successfully!`);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update status");
    },
  });

  return (
    <div className="p-6 space-y-5">
      {/* Edit Modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span className="material-symbols-outlined text-[26px] text-primary">manage_accounts</span>
            User Management
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Manage employee access, roles, and system permissions.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/roles"
            className="bg-surface border border-wireframe-border hover:bg-wireframe-bg-alt text-foreground px-4 py-2 rounded-lg font-semibold flex items-center gap-2 shadow-sm cursor-pointer transition-colors text-sm"
          >
            <span className="material-symbols-outlined text-[18px]">shield_person</span>
            Role Permissions
          </Link>
          <Link
            to="/users/new"
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 shadow-sm cursor-pointer transition-colors text-sm"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Add New User
          </Link>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-surface border border-wireframe-border rounded-xl shadow-sm overflow-hidden">

        {/* Filters */}
        <div className="p-4 border-b border-wireframe-border flex flex-wrap gap-3 bg-wireframe-bg-alt/40">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-muted-foreground text-[18px] pointer-events-none">search</span>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-input bg-background rounded-lg pl-9 pr-3 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="border border-input bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <option value="">All Roles</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-input bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          {(search || selectedRole || selectedStatus) && (
            <button
              onClick={() => { setSearch(""); setSelectedRole(""); setSelectedStatus(""); }}
              className="text-xs text-muted-foreground hover:text-red-600 border border-wireframe-border hover:border-red-300 px-3 py-2 rounded-lg bg-background hover:bg-red-50 transition-all cursor-pointer flex items-center gap-1 font-medium"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
              Clear
            </button>
          )}
          <div className="ml-auto text-xs text-muted-foreground font-semibold self-center">
            {usersList.length} user{usersList.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-16 text-center flex flex-col items-center gap-3 text-muted-foreground">
              <span className="animate-spin h-7 w-7 border-2 border-primary border-t-transparent rounded-full"></span>
              <span className="text-sm font-medium">Loading users...</span>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-600 font-medium">
              Error loading users. Please try again.
            </div>
          ) : usersList.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center gap-3 text-muted-foreground">
              <span className="material-symbols-outlined text-5xl opacity-25">manage_accounts</span>
              <p className="text-sm font-medium">No users found</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-wireframe-bg-alt border-b border-wireframe-border">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Name</th>
                  <th className="px-5 py-3.5 font-semibold">Email</th>
                  <th className="px-5 py-3.5 font-semibold">Mobile</th>
                  <th className="px-5 py-3.5 font-semibold">Role</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((usr: any) => {
                  const mappedRole  = mapUserTypeToRole(usr.userType);
                  const isActive    = usr.status === "ACTIVE";
                  const initials    = `${usr.firstName?.charAt(0) || ""}${usr.lastName?.charAt(0) || ""}`.toUpperCase() || "U";

                  return (
                    <tr key={usr._id || usr.id} className="border-b border-wireframe-border hover:bg-wireframe-bg-alt/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm uppercase shrink-0 ${
                            isActive ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-400"
                          }`}>
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{usr.firstName} {usr.lastName}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">ID: {(usr._id || usr.id)?.slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground text-sm">{usr.email}</td>
                      <td className="px-5 py-4 text-sm">
                        {usr.phoneNumber
                          ? <a href={`tel:${usr.phoneNumber}`} className="hover:text-primary hover:underline cursor-pointer transition-colors">{usr.phoneNumber}</a>
                          : <span className="text-muted-foreground">—</span>
                        }
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${ROLE_COLORS[mappedRole] || "bg-gray-100 text-gray-700 border-gray-200"}`}>
                          {mappedRole}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          isActive
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : "bg-gray-100 text-gray-600 border border-gray-200"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-gray-400"}`}></span>
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Button */}
                          <button
                            onClick={() => setEditingUser(usr)}
                            title="Edit user details, role, or reset password"
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border border-wireframe-border rounded-lg hover:bg-primary/5 hover:border-primary/40 hover:text-primary transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[15px]">edit</span>
                            Edit
                          </button>

                          {/* Enable / Disable Button */}
                          <button
                            onClick={() => toggleStatusMutation.mutate({ userId: usr._id || usr.id, currentStatus: usr.status })}
                            disabled={toggleStatusMutation.isPending}
                            title={isActive ? "Disable this user's access" : "Re-enable this user's access"}
                            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                              isActive
                                ? "border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                                : "border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[15px]">
                              {isActive ? "person_off" : "person_check"}
                            </span>
                            {isActive ? "Disable" : "Enable"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-wireframe-border bg-wireframe-bg-alt/30 text-xs text-muted-foreground flex items-center gap-2">
          <span className="material-symbols-outlined text-[14px]">info</span>
          Showing <span className="font-semibold text-foreground mx-1">{usersList.length}</span> users.
          Click <span className="font-semibold text-foreground mx-1">Edit</span> to update name, email, role, or reset password.
        </div>
      </div>
    </div>
  );
}
