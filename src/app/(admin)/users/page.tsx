"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  UserCog,
  Mail,
} from "lucide-react";

type UserRole = "customer" | "admin" | "moderator";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  orders: number;
  totalSpent: number;
  joined: string;
  avatar?: string;
}

// Mock data
const mockUsers: User[] = [
  { id: "1", name: "Sarah Mitchell", email: "sarah.m@email.com", role: "customer", orders: 12, totalSpent: 2450.99, joined: "2023-06-15" },
  { id: "2", name: "James Wilson", email: "james.w@email.com", role: "admin", orders: 45, totalSpent: 12450.0, joined: "2022-03-20" },
  { id: "3", name: "Emily Brown", email: "emily.b@email.com", role: "customer", orders: 8, totalSpent: 890.5, joined: "2023-09-10" },
  { id: "4", name: "Michael Davis", email: "michael.d@email.com", role: "customer", orders: 3, totalSpent: 299.97, joined: "2024-01-05" },
  { id: "5", name: "Lisa Anderson", email: "lisa.a@email.com", role: "moderator", orders: 28, totalSpent: 5670.25, joined: "2022-11-30" },
  { id: "6", name: "Robert Taylor", email: "robert.t@email.com", role: "customer", orders: 15, totalSpent: 1890.0, joined: "2023-04-22" },
  { id: "7", name: "Jennifer Martinez", email: "jennifer.m@email.com", role: "customer", orders: 6, totalSpent: 450.75, joined: "2023-08-14" },
  { id: "8", name: "David Johnson", email: "david.j@email.com", role: "customer", orders: 22, totalSpent: 3450.99, joined: "2023-01-18" },
  { id: "9", name: "Amanda White", email: "amanda.w@email.com", role: "customer", orders: 4, totalSpent: 389.96, joined: "2023-12-01" },
  { id: "10", name: "Christopher Lee", email: "chris.l@email.com", role: "customer", orders: 9, totalSpent: 1120.5, joined: "2023-05-25" },
  { id: "11", name: "Jessica Garcia", email: "jessica.g@email.com", role: "customer", orders: 18, totalSpent: 2890.25, joined: "2023-02-14" },
  { id: "12", name: "Daniel Rodriguez", email: "daniel.r@email.com", role: "customer", orders: 7, totalSpent: 699.93, joined: "2023-10-08" },
];

const roleColors: Record<UserRole, string> = {
  customer: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  admin: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  moderator: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
};

const roleOptions = [
  { value: "all", label: "All Roles" },
  { value: "customer", label: "Customer" },
  { value: "admin", label: "Admin" },
  { value: "moderator", label: "Moderator" },
];

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 10;

  // Filter users
  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Users</h1>
        <p className="text-slate-400 mt-1">
          {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
            />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 cursor-pointer"
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Filter
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              size={16}
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-4 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {paginatedUsers.map((user, index) => (
                <tr
                  key={user.id}
                  className={`hover:bg-slate-700/20 transition-colors ${
                    index % 2 === 0 ? "bg-slate-800/20" : ""
                  }`}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-medium text-sm">
                        {getInitials(user.name)}
                      </div>
                      <div>
                        <p className="text-slate-200 font-medium">{user.name}</p>
                        <p className="text-slate-500 text-sm">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${
                        roleColors[user.role]
                      }`}
                    >
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-300">{user.orders}</td>
                  <td className="px-4 py-4 text-slate-300 font-medium">
                    ${user.totalSpent.toFixed(2)}
                  </td>
                  <td className="px-4 py-4 text-slate-400">{user.joined}</td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                      >
                        <Eye size={16} />
                      </Link>
                      <button className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors">
                        <Mail size={16} />
                      </button>
                      <button className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors">
                        <UserCog size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-700/50">
          <p className="text-slate-400 text-sm">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} of{" "}
            {filteredUsers.length} users
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                  page === currentPage
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                    : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
