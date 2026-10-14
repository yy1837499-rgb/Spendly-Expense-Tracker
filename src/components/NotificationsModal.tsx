import React from 'react';

interface NotificationsModalProps {
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ onClose }) => {
  const notifications = [
    {
      id: '1',
      title: 'Budget Alert (71% utilized)',
      desc: 'You have spent $2,840.00 of your $4,000.00 May budget cap with 16 days left.',
      time: '2 hours ago',
      icon: 'notifications_active',
      color: 'text-amber-500',
      bgColor: 'bg-amber-100',
    },
    {
      id: '2',
      title: '14-Day Tracking Streak 🔥',
      desc: 'Consistency achievement unlocked! You logged all daily expenses for 2 weeks.',
      time: 'Yesterday',
      icon: 'local_fire_department',
      color: 'text-primary',
      bgColor: 'bg-primary-fixed',
    },
    {
      id: '3',
      title: 'Smart Margin Opportunity',
      desc: 'Dining spending is 14% below last week. You are on track to save an extra $260 this month.',
      time: '3 days ago',
      icon: 'trending_down',
      color: 'text-secondary',
      bgColor: 'bg-secondary-fixed',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 z-10 border border-surface-container/70 pb-safe">
        <div className="flex items-center justify-between pb-3 border-b border-surface-container-low">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-primary">
              notifications
            </span>
            <span className="text-base font-bold text-on-surface">Notifications</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-outline hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-3 mt-4 divide-y divide-surface-container-low max-h-96 overflow-y-auto">
          {notifications.map((n) => (
            <div key={n.id} className="pt-3 first:pt-0 flex items-start gap-3">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${n.bgColor} ${n.color}`}
              >
                <span className="material-symbols-outlined text-[18px]">{n.icon}</span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-on-surface">{n.title}</span>
                  <span className="text-[10px] text-outline">{n.time}</span>
                </div>
                <p className="text-[11px] text-on-surface-variant mt-0.5 leading-snug">
                  {n.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full h-11 mt-5 rounded-full bg-surface-container text-on-surface font-bold text-xs hover:bg-surface-container-high transition-colors"
        >
          Close Notifications
        </button>
      </div>
    </div>
  );
};
