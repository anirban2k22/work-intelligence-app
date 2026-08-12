"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GitBranch, Check } from "lucide-react";

type Profile = { user_id: string; full_name: string | null; display_name: string | null; role: string };
type Mapping = { employee_id: string; manager_id: string };

export default function TeamMapPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: p } = await supabase.from("profiles").select("user_id, full_name, display_name, role");
      const { data: m } = await supabase.from("employee_manager_map").select("employee_id, manager_id");
      setProfiles(p ?? []);
      setMappings(m ?? []);
    };
    load();
  }, []);

  const managers = profiles.filter(p => p.role === "manager");
  const employees = profiles.filter(p => p.role === "employee");

  const getManagerFor = (employeeId: string) =>
    mappings.find(m => m.employee_id === employeeId)?.manager_id ?? "";

  const assignManager = async (employeeId: string, managerId: string) => {
    setSaving(employeeId);
    const supabase = createClient();

    if (!managerId) {
      await supabase.from("employee_manager_map").delete().eq("employee_id", employeeId);
    } else {
      await supabase.from("employee_manager_map").upsert(
        { employee_id: employeeId, manager_id: managerId },
        { onConflict: "employee_id" }
      );
    }

    const { data: m } = await supabase.from("employee_manager_map").select("employee_id, manager_id");
    setMappings(m ?? []);
    setSaving(null);
    setSaved(employeeId);
    setTimeout(() => setSaved(null), 2000);
  };

  const getName = (p: Profile) => p.full_name ?? p.display_name ?? "Unknown";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <GitBranch className="w-5 h-5 text-gray-500" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Map</h1>
          <p className="text-sm text-gray-500 mt-0.5">Assign employees to their reporting managers</p>
        </div>
      </div>

      {employees.length === 0 ? (
        <div className="bg-white border rounded-xl p-8 text-center text-gray-400">
          No employees found. Create users first from the Users page.
        </div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Employee</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Reporting Manager</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {employees.map(emp => (
                <tr key={emp.user_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-700">
                        {getName(emp).slice(0, 2).toUpperCase()}
                      </div>
                      <p className="font-medium text-gray-900">{getName(emp)}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={getManagerFor(emp.user_id)}
                      onChange={e => assignManager(emp.user_id, e.target.value)}
                      disabled={saving === emp.user_id}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white min-w-[200px]"
                    >
                      <option value="">— No manager assigned —</option>
                      {managers.map(m => (
                        <option key={m.user_id} value={m.user_id}>{getName(m)}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-center w-10">
                    {saved === emp.user_id && <Check className="w-4 h-4 text-green-600 mx-auto" />}
                    {saving === emp.user_id && <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin mx-auto" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
