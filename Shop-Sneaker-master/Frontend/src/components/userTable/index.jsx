import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, RefreshCw, Search, ShieldCheck, ShieldX, Trash2 } from 'lucide-react';

const PAGE_SIZE = 8;

const formatDate = (value) => {
  if (!value) return 'N/A';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

const roleLabel = {
  admin: 'ADMIN',
  user: 'USER',
};

const UserTable = ({ users = [], loading = false, error = '', currentUserId = '', onRefresh, onUpdateRole, onDeleteUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingActionId, setPendingActionId] = useState('');

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredUsers = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) {
      return users;
    }

    return users.filter((user) => {
      const identity = [user._id, user.name, user.email, user.role]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return identity.includes(keyword);
    });
  }, [searchTerm, users]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  useEffect(() => {
    if (currentPage !== safePage) {
      setCurrentPage(safePage);
    }
  }, [currentPage, safePage]);

  const pagedUsers = filteredUsers.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const showingStart = filteredUsers.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const showingEnd = Math.min(safePage * PAGE_SIZE, filteredUsers.length);

  const handleToggleRole = async (user) => {
    if (!onUpdateRole) return;

    const nextRole = user.role === 'admin' ? 'user' : 'admin';
    setPendingActionId(user._id);

    try {
      await onUpdateRole(user._id, nextRole);
    } finally {
      setPendingActionId('');
    }
  };

  const handleDelete = async (user) => {
    if (!onDeleteUser) return;

    const confirmed = window.confirm(`Delete ${user.name}? This cannot be undone.`);
    if (!confirmed) return;

    setPendingActionId(user._id);

    try {
      await onDeleteUser(user._id);
    } finally {
      setPendingActionId('');
    }
  };

  return (
    <div className="p-0 mt-8 md:mt-12 overflow-hidden">
      <div className="flex flex-col lg:flex-row justify-between lg:items-end mb-5 gap-4">
        <div>
          <h2 className="text-[22px] md:text-[26px] font-black tracking-[-1px] m-0 mb-2">USER DIRECTORY</h2>
          <p className="text-[11px] md:text-[12px] font-medium text-[#888] m-0 max-w-[440px] leading-relaxed">
            Live admin access for managing account roles and removing users from the system.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="flex items-center bg-[#f0f0f0] px-4 py-2.5 rounded-sm w-full sm:w-[280px]">
            <Search className="w-3.5 h-3.5 text-[#666] mr-3 shrink-0" />
            <input
              className="bg-transparent border-none outline-none text-[10px] font-bold text-[#111] w-full placeholder:text-[#999]"
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="SEARCH ID, NAME OR EMAIL..."
            />
          </div>

          <button
            type="button"
            onClick={onRefresh}
            className="bg-[#e8e8e8] border-none px-4 py-2.5 rounded-sm cursor-pointer flex items-center justify-center shrink-0 hover:bg-[#e0e0e0] transition-colors"
            title="Refresh users"
          >
            <RefreshCw className="w-4 h-4 text-[#333]" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto -mx-4 md:mx-0">
        <div className="px-4 md:px-0 min-w-max">
          <table className="w-full border-collapse min-w-[820px]">
            <thead>
              <tr>
                <th className="text-left text-[10px] font-black text-[#111] py-4 px-2.5 border-b-[2px] border-black tracking-[1px]">USER IDENTITY</th>
                <th className="text-left text-[10px] font-black text-[#111] py-4 px-2.5 border-b-[2px] border-black tracking-[1px]">JOIN DATE</th>
                <th className="text-left text-[10px] font-black text-[#111] py-4 px-2.5 border-b-[2px] border-black tracking-[1px]">ROLE</th>
                <th className="text-left text-[10px] font-black text-[#111] py-4 px-2.5 border-b-[2px] border-black tracking-[1px]">LAST LOGIN</th>
                <th className="text-left text-[10px] font-black text-[#111] py-4 px-2.5 border-b-[2px] border-black tracking-[1px]">ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-14 text-center">
                    <div className="inline-flex items-center gap-3 text-[11px] font-black tracking-[1px] uppercase text-[#555]">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading users...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="py-14 text-center">
                    <div className="mx-auto max-w-md">
                      <p className="text-[11px] font-black tracking-[1px] uppercase text-[#b91c1c]">Failed to load users</p>
                      <p className="mt-2 text-[12px] text-[#666]">{error}</p>
                    </div>
                  </td>
                </tr>
              ) : pagedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-14 text-center">
                    <div className="mx-auto max-w-md">
                      <p className="text-[11px] font-black tracking-[1px] uppercase text-[#111]">No users found</p>
                      <p className="mt-2 text-[12px] text-[#666]">
                        Try a different search term or refresh the list from the backend.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                pagedUsers.map((user) => {
                  const busy = pendingActionId === user._id;
                  const isAdmin = user.role === 'admin';

                  return (
                    <tr key={user._id} className={busy ? 'opacity-70' : ''}>
                      <td className="py-5 md:py-6 px-2.5 border-b border-[#eee] align-middle">
                        <div className="flex items-center">
                          <div className="min-w-[40px] w-[40px] h-[40px] md:min-w-[44px] md:w-[44px] md:h-[44px] bg-[#111] rounded-sm mr-4 md:mr-5 overflow-hidden shrink-0">
                            <img
                              className="w-full h-full object-cover"
                              src={user.avatar || `https://i.pravatar.cc/150?u=${user._id}`}
                              alt={user.name}
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[11px] md:text-[12px] font-extrabold text-black mb-1 leading-none">
                              {user.name}
                            </span>
                            <span className="text-[10px] md:text-[11px] font-medium text-[#888]">{user.email}</span>
                            <span className="mt-1 text-[9px] font-black tracking-[1px] uppercase text-[#b3b3b3]">
                              {user._id === currentUserId ? 'CURRENT ACCOUNT' : user._id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-5 md:py-6 px-2.5 border-b border-[#eee] align-middle text-[11px] md:text-[12px] font-semibold text-[#555]">
                        {formatDate(user.createdAt)}
                      </td>

                      <td className="py-5 md:py-6 px-2.5 border-b border-[#eee] align-middle">
                        <span
                          className={`inline-block py-1.5 px-2.5 md:px-3 text-[8px] md:text-[9px] font-black rounded-sm tracking-[0.5px] uppercase ${
                            isAdmin ? 'bg-black text-white' : 'bg-[#e6e6e6] text-[#666]'
                          }`}
                        >
                          {roleLabel[user.role] || user.role}
                        </span>
                      </td>

                      <td className="py-5 md:py-6 px-2.5 border-b border-[#eee] align-middle text-[11px] md:text-[12px] font-semibold text-[#555]">
                        {formatDate(user.lastLoginAt)}
                      </td>

                      <td className="py-5 md:py-6 px-2.5 border-b border-[#eee] align-middle">
                        <div className="flex gap-3 md:gap-4 items-center">
                          <button
                            type="button"
                            onClick={() => handleToggleRole(user)}
                            disabled={busy || user._id === currentUserId}
                            className="inline-flex items-center gap-1.5 bg-transparent border-none cursor-pointer p-0 text-[#111] font-black text-[10px] md:text-[11px] uppercase tracking-[1px] hover:opacity-70 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                          >
                            {isAdmin ? <ShieldX className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <ShieldCheck className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                            {user._id === currentUserId ? 'Current' : isAdmin ? 'Demote' : 'Promote'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(user)}
                            disabled={busy || user._id === currentUserId}
                            className="inline-flex items-center gap-1.5 bg-transparent border-none cursor-pointer p-0 text-[#b91c1c] font-black text-[10px] md:text-[11px] uppercase tracking-[1px] hover:opacity-70 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                          >
                            <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            {user._id === currentUserId ? 'Protected' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center sm:items-center mt-6 md:mt-10 pb-10 md:pb-16 gap-4">
        <span className="text-[9px] md:text-[10px] font-extrabold text-[#999] tracking-[1px] text-center sm:text-left">
          SHOWING {showingStart}-{showingEnd} OF {filteredUsers.length.toLocaleString('en-US')} USERS
        </span>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={safePage <= 1 || loading}
            className="flex-1 sm:flex-none bg-[#eee] text-[#666] py-3 md:py-[14px] px-4 md:px-6 text-[9px] md:text-[10px] font-black border-none cursor-pointer tracking-[1px] rounded-sm hover:bg-[#e4e4e4] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            PREVIOUS
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            disabled={safePage >= totalPages || loading}
            className="flex-1 sm:flex-none bg-black text-white py-3 md:py-[14px] px-4 md:px-6 text-[9px] md:text-[10px] font-black border-none cursor-pointer tracking-[1px] rounded-sm hover:bg-opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            NEXT PAGE
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserTable;
