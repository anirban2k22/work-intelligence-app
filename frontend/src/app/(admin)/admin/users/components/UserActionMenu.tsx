"use client";

import { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreHorizontal, Shield, Trash2, Power, UserX } from "lucide-react";
import { deleteUserAction, updateUserRoleAction, updateUserStatusAction } from "../../actions";

interface UserActionMenuProps {
  userId: string;
  currentRole: string;
  currentStatus: string;
}

export function UserActionMenu({ userId, currentRole, currentStatus }: UserActionMenuProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to permanently delete this user? This cannot be undone.")) return;
    setIsDeleting(true);
    const res = await deleteUserAction(userId);
    if (!res.success) {
      alert("Error: " + res.error);
    }
    setIsDeleting(false);
  };

  const handleChangeRole = async (role: string) => {
    const res = await updateUserRoleAction(userId, role);
    if (!res.success) alert("Error: " + res.error);
  };

  const handleChangeStatus = async (status: string) => {
    const res = await updateUserStatusAction(userId, status);
    if (!res.success) alert("Error: " + res.error);
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button 
          disabled={isDeleting}
          className="p-1.5 text-gray-500 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content 
          align="end"
          className="min-w-[180px] bg-white rounded-lg shadow-lg border border-gray-200 py-1.5 z-50 text-sm animate-in fade-in zoom-in-95 duration-100"
        >
          <DropdownMenu.Label className="px-3 py-1.5 text-xs font-semibold text-gray-500">
            Roles
          </DropdownMenu.Label>
          
          <DropdownMenu.Item 
            onClick={() => handleChangeRole("admin")}
            className="flex items-center gap-2 px-3 py-1.5 cursor-pointer outline-none hover:bg-gray-50 focus:bg-gray-50"
          >
            <Shield className="w-4 h-4 text-gray-700" />
            <span>Make Admin</span>
            {currentRole === "admin" && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />}
          </DropdownMenu.Item>
          
          <DropdownMenu.Item 
            onClick={() => handleChangeRole("manager")}
            className="flex items-center gap-2 px-3 py-1.5 cursor-pointer outline-none hover:bg-gray-50 focus:bg-gray-50"
          >
            <Shield className="w-4 h-4 text-gray-700" />
            <span>Make Manager</span>
            {currentRole === "manager" && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />}
          </DropdownMenu.Item>
          
          <DropdownMenu.Item 
            onClick={() => handleChangeRole("employee")}
            className="flex items-center gap-2 px-3 py-1.5 cursor-pointer outline-none hover:bg-gray-50 focus:bg-gray-50"
          >
            <Shield className="w-4 h-4 text-gray-700" />
            <span>Make Employee</span>
            {currentRole === "employee" && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />}
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="h-px bg-gray-200 my-1.5" />
          
          <DropdownMenu.Label className="px-3 py-1.5 text-xs font-semibold text-gray-500">
            Account Status
          </DropdownMenu.Label>
          
          <DropdownMenu.Item 
            onClick={() => handleChangeStatus(currentStatus === "active" ? "suspended" : "active")}
            className="flex items-center gap-2 px-3 py-1.5 cursor-pointer outline-none hover:bg-gray-50 focus:bg-gray-50 text-amber-600 focus:text-amber-700"
          >
            {currentStatus === "active" ? (
              <UserX className="w-4 h-4" />
            ) : (
              <Power className="w-4 h-4" />
            )}
            <span>{currentStatus === "active" ? "Suspend Account" : "Activate Account"}</span>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="h-px bg-gray-200 my-1.5" />

          <DropdownMenu.Item 
            onClick={handleDelete}
            className="flex items-center gap-2 px-3 py-1.5 cursor-pointer outline-none hover:bg-red-50 focus:bg-red-50 text-red-600 focus:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete User</span>
          </DropdownMenu.Item>
          
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
