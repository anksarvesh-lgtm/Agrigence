
import React, { useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { mockBackend } from '../../services/mockBackend';
import { AgriNotification, User } from '../../types';
import { Bell, Heart, MessageCircle, UserPlus, CheckCircle } from 'lucide-react';

const Notifications: React.FC = () => {
  const { user } = useOutletContext<{ user: User }>();
  const [notifications, setNotifications] = useState<AgriNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      const data = await mockBackend.getAgriNotifications(user.id);
      setNotifications(data);
      setLoading(false);
      
      // Mark all as read
      data.forEach(n => {
        if (!n.read) mockBackend.markNotificationRead(n.id);
      });
    };
    fetchNotifications();
  }, [user.id]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'LIKE': return <Heart className="w-5 h-5 text-red-500 fill-current" />;
      case 'REPLY': return <MessageCircle className="w-5 h-5 text-blue-500 fill-current" />;
      case 'CONNECTION_REQUEST': return <UserPlus className="w-5 h-5 text-green-500 fill-current" />;
      case 'CONNECTION_ACCEPTED': return <CheckCircle className="w-5 h-5 text-green-500 fill-current" />;
      default: return <Bell className="w-5 h-5 text-stone-500 fill-current" />;
    }
  };

  const getMessage = (n: AgriNotification) => {
    switch (n.type) {
      case 'LIKE': return `${n.actorName} liked your post.`;
      case 'REPLY': return `${n.actorName} replied to your post.`;
      case 'CONNECTION_REQUEST': return `${n.actorName} sent you a connection request.`;
      case 'CONNECTION_ACCEPTED': return `${n.actorName} accepted your connection request.`;
      default: return `New notification from ${n.actorName}.`;
    }
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-stone-200 p-4">
        <h2 className="text-xl font-bold">Notifications</h2>
      </div>

      {/* List */}
      <div className="flex flex-col">
        {loading ? (
          <div className="p-10 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-green-600"></div>
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((n) => (
            <div 
              key={n.id} 
              className={`p-4 border-b border-stone-100 flex gap-4 items-start transition-colors hover:bg-stone-50 ${!n.read ? 'bg-green-50/30' : ''}`}
            >
              <div className="mt-1">{getIcon(n.type)}</div>
              <div className="flex-1">
                <p className="text-stone-800">{getMessage(n)}</p>
                <p className="text-xs text-stone-500 mt-1">
                  {new Date(n.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="p-10 text-center text-stone-500">
            No notifications yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
