"use client";

import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../../lib/api";

type Role = "admin" | "user" | "customer";

interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

interface UsersResponse {
  total: number;
  page: number;
  pages: number;
  users: User[];
}

export default function UsersPage() {
  // table data state
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // filters & pagination
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"" | Role>("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const pages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  // add user modal
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addRole, setAddRole] = useState<Role>("user");
  const [submitting, setSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);


  // fetch users
  async function fetchUsers() {
    setLoading(true);
    setErr(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (search.trim()) params.set("search", search.trim());
      if (roleFilter) params.set("role", roleFilter);

      const data = await apiRequest<UsersResponse>("get", `/api/users`,{params:{page,limit,search,roleFilter}});
      setUsers(data.users);
      setTotal(data.total);
    } catch (e: any) {
      setErr(e?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
    
  }, [page, roleFilter]);

  // search with slight debounce
  useEffect(() => {
    const tt = setTimeout(() => {
      setPage(1);
      fetchUsers();
    }, 350);
    return () => clearTimeout(tt);
    
  }, [search]);

  async function handleDelete(id: string) {
    const ok = confirm("Delete this user?");
    if (!ok) return;
    try {
      await apiRequest("delete", `/api/users/${id}`);
      // refresh after delete
      fetchUsers();
    } catch (e: any) {
      alert(e?.message || "Delete failed");
    }
  }

 async function handleEdit(user: User) {
  
  setAddName(user.name);
  setAddEmail(user.email);
  setAddPassword(""); 
  setAddRole(user.role);
  setEditingUser(user);
  setShowAdd(true);
}

async function handleUpdateUser(e: React.FormEvent) {
  e.preventDefault();
  if (!editingUser?._id) return;

  try {
    setSubmitting(true);
    await apiRequest("put", `/api/users/${editingUser._id}`, {
      data: {
        name: addName,
        email: addEmail,
        ...(addPassword ? { password: addPassword } : {}),
        role: addRole,
      },
    });

    // Refresh list
    fetchUsers();

    // Reset modal
    setShowAdd(false);
    setEditingUser(null);
    setAddName("");
    setAddEmail("");
    setAddPassword("");
    setAddRole("user");
    
  } catch (err: any) {
    alert(err.message || "Failed to update user");
  } finally {
    setSubmitting(false);
  }
}


  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    if (!addName.trim() || !addEmail.trim() || !addPassword.trim()) {
      alert("Please fill all fields");
      return;
    }
    // simple email check
    if (!/\S+@\S+\.\S+/.test(addEmail)) {
      alert("Invalid email");
      return;
    }
    if (addPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest("post", "/api/users", {
        data: {
          name: addName.trim(),
          email: addEmail.trim().toLowerCase(),
          password: addPassword,
          role: addRole,
        },
      });
      setShowAdd(false);
      setAddName("");
      setAddEmail("");
      setAddPassword("");
      setAddRole("user");
     
      setPage(1);
      fetchUsers();
    } catch (e: any) {
      alert(e?.message || "Create failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6">
      {/* header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500">Manage admins, users, and customers</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="rounded-xl bg-gray-900 px-4 py-2 text-white shadow hover:bg-black/90 transition"
        >
          + Add User
        </button>
      </div>

      {/* filters */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full gap-3 md:w-auto">
          <div className="relative flex-1">
            <input
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 pr-8 shadow-sm outline-none ring-0 focus:border-gray-400"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="pointer-events-none absolute right-3 top-2.5 text-gray-400">⌕</span>
          </div>

          <select
            className="rounded-xl border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none focus:border-gray-400"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as Role | "");
              setPage(1);
            }}
          >
            <option value="">All roles</option>
            {/* <option value="admin">Admin</option> */}
            <option value="user">User</option>
            <option value="customer">Customer</option>
          </select>
        </div>

        {/* <div className="flex gap-2">
          <button
            onClick={() => fetchUsers()}
            className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Refresh
          </button>
        </div> */}
      </div>

      {/* table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:font-medium">
                <th>Name</th>
                <th>Email</th>
                <th className="hidden md:table-cell">Role</th>
                <th className="hidden md:table-cell">Created</th>
                <th className="w-36 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    Loading…
                  </td>
                </tr>
              ) : err ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-red-600">
                    {err}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{u.name}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{u.email}</td>
                    <td className="px-4 py-3 text-gray-700 hidden md:table-cell capitalize">
                      {u.role}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {/* (optional) Edit hook-up later */}
                       <button 
  onClick={() => handleEdit(u)}
  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50">
  Edit
</button>
                        <button
                          onClick={() => handleDelete(u._id)}
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* footer / pagination */}
        <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-600">
          <div>
            Page <span className="font-medium">{page}</span> of{" "}
            <span className="font-medium">{pages}</span> • Total{" "}
            <span className="font-medium">{total}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((pagi) => Math.max(1, pagi - 1))}
              disabled={page <= 1}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((pagi) => Math.min(pages, pagi + 1))}
              disabled={page >= pages}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <h2 className="text-lg font-semibold">{editingUser ? "Edit User" : "Add User"}</h2>
              <button
                onClick={() => setShowAdd(false)}
                className="rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={editingUser ? handleUpdateUser : handleAddUser} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-gray-700">Name</label>
                <input
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-gray-400"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-700">Email</label>
                <input
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-gray-400"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  placeholder="john@example.com"
                  type="email"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-700">Password</label>
                <input
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-gray-400"
                  value={addPassword}
                  onChange={(e) => setAddPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  type="password"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-700">Role</label>
                <select
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-gray-400"
                  value={addRole}
                  onChange={(e) => setAddRole(e.target.value as Role)}
                >
                  <option value="user">User</option>
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="mt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  disabled={submitting}
                  type="submit"
                  className="rounded-xl bg-gray-900 px-4 py-2 text-white hover:bg-black/90 disabled:opacity-60"
                >
                  {submitting ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
