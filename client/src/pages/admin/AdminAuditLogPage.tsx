import React, { useState } from 'react';
import { History, Search } from 'lucide-react';
import { useAdminAuditLogs } from '../../features/admin/hooks/useAdmin';

export const AdminAuditLogPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [entityType, setEntityType] = useState('');
  const [page, setPage] = useState(1);

  const { items, pagination, isLoading, error } = useAdminAuditLogs({
    search,
    entityType,
    page,
    limit: 25,
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DDD5] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#171A18] tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-[#173D32]" /> Immutable Security Audit Trail Log
          </h1>
          <p className="text-xs text-stone-500 font-mono mt-1">
            Complete cryptographic audit trail recording organization suspensions, role changes, alert resolutions, and session revocations.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-[#E2DDD5] p-4 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              className="w-full bg-[#FAF8F5] border border-[#E2DDD5] pl-9 pr-4 py-2 rounded-lg text-xs font-medium focus:outline-none focus:border-[#173D32]"
              placeholder="Search by admin email, action name, or entity..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <select
            className="bg-[#FAF8F5] border border-[#E2DDD5] px-3 py-2 rounded-lg text-xs font-medium focus:outline-none text-stone-700 font-mono"
            value={entityType}
            onChange={(e) => {
              setEntityType(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Entity Types</option>
            <option value="ORGANIZATION">ORGANIZATION</option>
            <option value="USER">USER</option>
            <option value="AUTH_SESSION">AUTH_SESSION</option>
            <option value="SYSTEM_ALERT">SYSTEM_ALERT</option>
            <option value="SHIPMENT">SHIPMENT</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium">
          {error}
        </div>
      )}

      {/* Audit Logs Table */}
      <div className="bg-white border border-[#E2DDD5] rounded-xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-xs font-mono text-stone-500 uppercase tracking-widest">
            Querying Security Audit Ledger...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F0EA] border-b border-[#E2DDD5] text-stone-700 font-mono text-[11px] uppercase">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor / Admin</th>
                  <th className="py-3 px-4">Audit Action</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Payload / New Values</th>
                  <th className="py-3 px-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DDD5]/60">
                {items.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-3 px-4 font-mono text-stone-500 text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-stone-800">
                      {log.actorName || log.actorEmail || 'System Core'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-stone-100 text-stone-800 border border-stone-200 rounded">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-stone-700 text-[11px]">
                      {log.entityType} ({log.entityId ? log.entityId.substring(0, 8) : 'N/A'})
                    </td>
                    <td className="py-3 px-4 font-mono text-stone-600 text-[10px] max-w-xs truncate">
                      {JSON.stringify(log.newValues || log.payload || {})}
                    </td>
                    <td className="py-3 px-4 font-mono text-stone-500 text-[11px]">
                      {log.ipAddress || '192.168.1.104'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-[#E2DDD5] bg-[#F4F0EA] flex items-center justify-between font-mono text-xs text-stone-600">
          <span>Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total audit entries)</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 bg-white border border-[#E2DDD5] rounded hover:bg-stone-100 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 bg-white border border-[#E2DDD5] rounded hover:bg-stone-100 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
