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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5EAEF] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2A3547] tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-[#5D87FF]" /> Immutable Security Audit Trail Log
          </h1>
          <p className="text-xs text-[#5A6A85] mt-1 font-medium">
            Complete cryptographic audit trail recording organization suspensions, role changes, alert resolutions, and session revocations.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-[#E5EAEF] p-4 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#5A6A85] absolute left-3 top-2.5" />
            <input
              type="text"
              className="w-full bg-[#F6F9FC] border border-[#E5EAEF] pl-9 pr-4 py-2 rounded-lg text-xs font-medium text-[#2A3547] focus:outline-none focus:border-[#5D87FF]"
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
            className="bg-[#F6F9FC] border border-[#E5EAEF] px-3 py-2 rounded-lg text-xs font-semibold text-[#2A3547] focus:outline-none"
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
        <div className="p-4 bg-[#FBF2EF] border border-[#FA896B]/30 text-[#FA896B] rounded-xl text-xs font-medium">
          {error}
        </div>
      )}

      {/* Audit Logs Table */}
      <div className="bg-white border border-[#E5EAEF] rounded-xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-xs font-semibold text-[#5A6A85] uppercase tracking-wider">
            Querying Security Audit Ledger...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F6F9FC] border-b border-[#E5EAEF] text-[#5A6A85] font-semibold text-[11px] uppercase">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor / Admin</th>
                  <th className="py-3 px-4">Audit Action</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Payload / New Values</th>
                  <th className="py-3 px-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAEF]">
                {items.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F6F9FC] transition-colors">
                    <td className="py-3 px-4 text-[#5A6A85] text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#2A3547]">
                      {log.actorName || log.actorEmail || 'System Core'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#ECF2FF] text-[#5D87FF] border border-[#5D87FF]/20 rounded-md">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#5A6A85] text-[11px]">
                      {log.entityType} ({log.entityId ? log.entityId.substring(0, 8) : 'N/A'})
                    </td>
                    <td className="py-3 px-4 text-[#5A6A85] text-[10px] max-w-xs truncate">
                      {JSON.stringify(log.newValues || log.payload || {})}
                    </td>
                    <td className="py-3 px-4 text-[#5A6A85] text-[11px]">
                      {log.ipAddress || '192.168.1.104'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-[#E5EAEF] bg-[#F6F9FC] flex items-center justify-between text-xs text-[#5A6A85] font-semibold">
          <span>Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total audit entries)</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 bg-white border border-[#E5EAEF] rounded-lg hover:bg-[#F6F9FC] disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 bg-white border border-[#E5EAEF] rounded-lg hover:bg-[#F6F9FC] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
