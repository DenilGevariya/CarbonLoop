import React, { useState } from 'react';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';
import { Bell, CheckCheck, MessageSquare, Handshake, ShoppingBag, Info, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filtered = notifications.filter((item) => (filter === 'unread' ? !item.is_read : true));

  const getIcon = (type: string) => {
    switch (type) {
      case 'INQUIRY_CREATED':
      case 'INQUIRY_MESSAGE':
        return <MessageSquare className="w-4 h-4 text-emerald-700" />;
      case 'OFFER_RECEIVED':
      case 'COUNTER_OFFER_RECEIVED':
      case 'OFFER_REJECTED':
      case 'OFFER_WITHDRAWN':
        return <Handshake className="w-4 h-4 text-amber-700" />;
      case 'ORDER_CREATED':
        return <ShoppingBag className="w-4 h-4 text-sky-700" />;
      default:
        return <Info className="w-4 h-4 text-stone-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#E2DDD5] pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[#173D32] tracking-wider uppercase font-semibold">Communications</span>
            <span className="text-[#8C827A]">•</span>
            <span className="font-mono text-xs text-[#8C827A]">Realtime Activity Log</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif text-[#171A18] tracking-tight font-medium mt-1">
            Notifications Center
          </h1>
          <p className="text-sm text-[#5C554E] mt-1 font-sans">
            Audit trail of commercial inquiries, proposals, counters, and executed orders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono text-[#173D32] border border-[#173D32]/30 hover:bg-[#173D32]/5 rounded transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read ({unreadCount})
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E2DDD5] pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
            filter === 'all'
              ? 'bg-[#173D32] text-white font-medium'
              : 'text-[#5C554E] hover:text-[#171A18] hover:bg-[#E2DDD5]/50'
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
            filter === 'unread'
              ? 'bg-[#173D32] text-white font-medium'
              : 'text-[#5C554E] hover:text-[#171A18] hover:bg-[#E2DDD5]/50'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notification List */}
      {isLoading ? (
        <div className="p-12 text-center text-[#8C827A] font-mono text-sm">Loading activity notifications...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-[#E2DDD5] bg-[#F7F5EF]/50 rounded-lg">
          <Bell className="w-8 h-8 text-[#8C827A] mx-auto mb-3 opacity-50" />
          <h3 className="text-sm font-serif font-medium text-[#171A18]">No notifications found</h3>
          <p className="text-xs text-[#8C827A] mt-1 font-mono">
            {filter === 'unread' ? 'You have cleared all unread notifications.' : 'No activity logged yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (!item.is_read) markAsRead(item.id);
              }}
              className={`p-4 border rounded-lg transition-all ${
                item.is_read
                  ? 'border-[#E2DDD5] bg-white text-[#5C554E]'
                  : 'border-[#173D32]/30 bg-[#F7F5EF] text-[#171A18] shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white border border-[#E2DDD5] rounded-md shadow-xs mt-0.5">
                    {getIcon(item.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-serif font-medium text-[#171A18]">{item.title}</h4>
                      {!item.is_read && (
                        <span className="inline-block w-2 h-2 rounded-full bg-[#173D32]" />
                      )}
                    </div>
                    <p className="text-xs text-[#5C554E] font-sans mt-0.5 leading-relaxed">{item.message}</p>
                    <span className="text-[11px] font-mono text-[#8C827A] mt-2 block">
                      {new Date(item.created_at).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>
                </div>

                {item.link_url && (
                  <Link
                    to={item.link_url}
                    className="inline-flex items-center gap-1 text-xs font-mono text-[#173D32] hover:underline whitespace-nowrap pt-1"
                  >
                    View <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
