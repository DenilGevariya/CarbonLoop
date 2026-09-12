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
        return <MessageSquare className="w-4 h-4 text-[#5D87FF]" />;
      case 'OFFER_RECEIVED':
      case 'COUNTER_OFFER_RECEIVED':
      case 'OFFER_REJECTED':
      case 'OFFER_WITHDRAWN':
        return <Handshake className="w-4 h-4 text-[#FFAE1F]" />;
      case 'ORDER_CREATED':
        return <ShoppingBag className="w-4 h-4 text-[#13DEB9]" />;
      default:
        return <Info className="w-4 h-4 text-[#5A6A85]" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 text-[#2A3547]">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#E5EAEF] pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#5D87FF] uppercase font-semibold">Communications</span>
            <span className="text-[#5A6A85]">•</span>
            <span className="text-xs text-[#5A6A85]">Realtime Activity Log</span>
          </div>
          <h1 className="text-2xl md:text-3xl text-[#2A3547] tracking-tight font-bold mt-1">
            Notifications Center
          </h1>
          <p className="text-xs text-[#5A6A85] mt-1">
            Audit trail of commercial inquiries, proposals, counters, and executed orders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#5D87FF] bg-[#ECF2FF] hover:bg-[#5D87FF] hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read ({unreadCount})
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E5EAEF] pb-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            filter === 'all'
              ? 'bg-[#5D87FF] text-white shadow-xs'
              : 'text-[#5A6A85] hover:text-[#2A3547] hover:bg-[#F6F9FC]'
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            filter === 'unread'
              ? 'bg-[#5D87FF] text-white shadow-xs'
              : 'text-[#5A6A85] hover:text-[#2A3547] hover:bg-[#F6F9FC]'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notification List */}
      {isLoading ? (
        <div className="p-12 text-center text-[#5A6A85] text-xs">Loading activity notifications...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-[#E5EAEF] bg-white rounded-xl shadow-xs">
          <Bell className="w-8 h-8 text-[#5A6A85] mx-auto mb-3 opacity-50" />
          <h3 className="text-sm font-bold text-[#2A3547]">No notifications found</h3>
          <p className="text-xs text-[#5A6A85] mt-1">
            {filter === 'unread' ? 'You have cleared all unread notifications.' : 'No activity logged yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (!item.is_read) markAsRead(item.id);
              }}
              className={`p-4 border rounded-xl transition-all cursor-pointer ${
                item.is_read
                  ? 'border-[#E5EAEF] bg-white text-[#5A6A85]'
                  : 'border-[#5D87FF]/30 bg-[#F6F9FC] text-[#2A3547] shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white border border-[#E5EAEF] rounded-lg shadow-xs mt-0.5">
                    {getIcon(item.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-[#2A3547]">{item.title}</h4>
                      {!item.is_read && (
                        <span className="inline-block w-2 h-2 rounded-full bg-[#5D87FF]" />
                      )}
                    </div>
                    <p className="text-xs text-[#5A6A85] mt-0.5 leading-relaxed">{item.message}</p>
                    <span className="text-[11px] text-[#5A6A85] mt-2 block">
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
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#5D87FF] hover:underline whitespace-nowrap pt-1"
                  >
                    View <ArrowRight className="w-3.5 h-3.5" />
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
