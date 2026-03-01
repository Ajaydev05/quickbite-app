import React, { useState, useEffect } from 'react';
import { getAllUsers } from '../../utils/api';
import API from '../../utils/api';
import { FiSearch, FiUserX, FiUserCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ROLE_COLORS = {
  customer: 'bg-blue-100 text-blue-700',
  restaurant_owner: 'bg-orange-100 text-orange-700',
  admin: 'bg-purple-100 text-purple-700',
  delivery_agent: 'bg-green-100 text-green-700',
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const LIMIT = 15;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await getAllUsers({ search, role: roleFilter, page, limit: LIMIT });
        setUsers(data.users || []);
        setTotal(data.total || 0);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, [search, roleFilter, page]);

  const toggleActive = async (userId, currentStatus) => {
    try {
      await API.patch(`/admin/users/${userId}/toggle`);
      setUsers(users.map(u => u._id === userId ? { ...u, isActive: !currentStatus } : u));
      toast.success(`User ${currentStatus ? 'deactivated' : 'activated'}`);
    } catch { toast.error('Failed to update user status'); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Users</h1>
            <p className="text-gray-500 text-sm">{total} total users</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 flex items-center bg-white rounded-full px-4 py-2.5 gap-2 shadow-sm">
            <FiSearch className="text-gray-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="flex-1 outline-none text-sm text-gray-700" placeholder="Search by name or email..." />
          </div>
          <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-full px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white">
            <option value="">All Roles</option>
            <option value="customer">Customer</option>
            <option value="restaurant_owner">Restaurant Owner</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => <div key={i} className="bg-white rounded-xl h-16 animate-pulse" />)}
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Phone</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(user => (
                    <tr key={user._id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm font-bold text-orange-600 flex-shrink-0">
                            {user.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 text-sm truncate">{user.name}</p>
                            <p className="text-gray-500 text-xs truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">{user.phone || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-600'}`}>
                          {user.role?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {user.role !== 'admin' && (
                          <button onClick={() => toggleActive(user._id, user.isActive)}
                            title={user.isActive ? 'Deactivate' : 'Activate'}
                            className={`p-1.5 rounded-lg transition ${user.isActive ? 'text-red-400 hover:bg-red-50 hover:text-red-600' : 'text-green-400 hover:bg-green-50 hover:text-green-600'}`}>
                            {user.isActive ? <FiUserX /> : <FiUserCheck />}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="text-center py-12 text-gray-400">No users found</div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-4 py-2 rounded-full bg-white text-gray-600 text-sm font-medium hover:bg-orange-50 disabled:opacity-40 transition">
                  Previous
                </button>
                <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-4 py-2 rounded-full bg-white text-gray-600 text-sm font-medium hover:bg-orange-50 disabled:opacity-40 transition">
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
