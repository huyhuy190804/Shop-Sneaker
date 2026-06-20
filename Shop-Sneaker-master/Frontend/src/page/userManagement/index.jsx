import React, { useEffect, useMemo, useState } from 'react';
import HeaderAdmin from '../../components/headerAdmin';
import SidebarAdmin from '../../components/sidebarAdmin';
import UserTable from '../../components/userTable';
import StatsCard from '../../components/statsCard';
import { deleteAdminUser, getAdminUsers, updateAdminUserRole } from '../../services/api';

const FETCH_LIMIT = 200;

const formatCount = (value) => new Intl.NumberFormat('en-US').format(value);

const isRecentSignup = (value, days = 30) => {
  if (!value) return false;

  const createdAt = new Date(value);
  if (Number.isNaN(createdAt.getTime())) return false;

  const threshold = Date.now() - days * 24 * 60 * 60 * 1000;
  return createdAt.getTime() >= threshold;
};

const UserManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError('');

    try {
      let page = 1;
      let totalPages = 1;
      let allUsers = [];

      do {
        const response = await getAdminUsers({ page, limit: FETCH_LIMIT });
        allUsers = allUsers.concat(response.users || []);
        totalPages = response.pages || 1;
        page += 1;
      } while (page <= totalPages);

      setUsers(allUsers);
    } catch (requestError) {
      setError(requestError.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const statsMetrics = useMemo(() => {
    const totalUsers = users.length;
    const adminUsers = users.filter((user) => user.role === 'admin').length;
    const recentSignups = users.filter((user) => isRecentSignup(user.createdAt)).length;

    return [
      {
        label: 'TOTAL USERS',
        value: loading ? '...' : formatCount(totalUsers),
        detail: error ? 'Unable to load live data' : 'Live from /api/users',
        accent: 'text-[#2563eb]',
        isDark: false,
      },
      {
        label: 'ADMINS',
        value: loading ? '...' : formatCount(adminUsers),
        detail: 'Admin accounts with elevated access',
        accent: 'text-[#888]',
        isDark: false,
      },
      {
        label: 'NEW SIGNUPS',
        value: loading ? '...' : formatCount(recentSignups),
        detail: 'Accounts created in the last 30 days',
        accent: 'text-white/70',
        isDark: true,
      },
    ];
  }, [error, loading, users]);

  const handleUpdateRole = async (id, role) => {
    await updateAdminUserRole({ id, role });
    setUsers((currentUsers) =>
      currentUsers.map((user) => (user._id === id ? { ...user, role } : user))
    );
  };

  const handleDeleteUser = async (id) => {
    await deleteAdminUser(id);
    setUsers((currentUsers) => currentUsers.filter((user) => user._id !== id));
  };

  return (
    <div className="flex min-h-screen bg-[#fbfbfb] font-inter text-[#111]">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0`}
      >
        <SidebarAdmin />
      </div>

      <div className="flex-1 flex flex-col overflow-x-hidden min-w-0">
        <HeaderAdmin toggleSidebar={() => setIsSidebarOpen((value) => !value)} title="USER MANAGEMENT" />

        <div className="flex-1 px-4 py-8 md:px-10 md:py-10 lg:px-14">
          <StatsCard metrics={statsMetrics} />
          <UserTable
            users={users}
            loading={loading}
            error={error}
            currentUserId={currentUser?._id}
            onRefresh={loadUsers}
            onUpdateRole={handleUpdateRole}
            onDeleteUser={handleDeleteUser}
          />
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
