import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/_layout/roles/")({
  component: RolePermissions,
});

const modules = [
  "Vendors",
  "Products",
  "LCA Projects",
  "Reviews & Verification",
  "Users & Access",
  "Roles & Permissions"
];

const permissions = ["View", "Create", "Edit", "Delete", "Approve"];

function RolePermissions() {
  const [selectedRole, setSelectedRole] = useState("Admin");

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link to="/users" className="hover:text-foreground">Users</Link>
            <span>/</span>
            <span className="text-foreground font-medium">Role Permissions</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Role Permissions</h1>
          <p className="text-sm text-muted-foreground">Configure access control and permissions for LCA Platform roles.</p>
        </div>
      </div>

      <div className="bg-surface border border-wireframe-border rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-wireframe-border flex flex-wrap gap-4 bg-muted/30 items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="text-sm font-semibold whitespace-nowrap text-foreground">Select Role to View:</label>
            <select 
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="border border-wireframe-border bg-background rounded-lg px-3 py-2 text-sm font-medium w-64"
            >
              <option value="Super Admin">Super Admin</option>
              <option value="Admin">Admin</option>
              <option value="Reviewer">LCA Reviewer / Auditor</option>
              <option value="Vendor">Vendor Supplier</option>
            </select>
          </div>
          <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-3 py-1 rounded-full">
            {selectedRole === "Super Admin" || selectedRole === "Admin" ? "Full Access Default" : "Role-Based Scoped Access"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-wireframe-border uppercase text-[11px] font-bold text-muted-foreground tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Module Name</th>
                {permissions.map((perm) => (
                  <th key={perm} className="px-6 py-3.5 text-center">{perm}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-wireframe-border">
              {modules.map((mod) => (
                <tr key={mod} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-semibold text-foreground">{mod}</td>
                  {permissions.map((perm) => (
                    <td key={perm} className="px-6 py-4 text-center">
                      <input 
                        type="checkbox" 
                        defaultChecked={
                          selectedRole === "Super Admin" || selectedRole === "Admin" || 
                          (selectedRole === "Reviewer" && (perm === "View" || perm === "Approve")) ||
                          (selectedRole === "Vendor" && (mod === "LCA Projects" || mod === "Products") && (perm === "View" || perm === "Create" || perm === "Edit"))
                        }
                        className="rounded border-wireframe-border text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
