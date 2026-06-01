export function StatCard({ icon: Icon, label, value, color, delay = '' }) {
  return (
    <div className={`bg-white rounded-2xl p-5 border border-gray-100 fade-in ${delay}`}>
      <div className={`inline-flex p-2.5 rounded-xl mb-3 ${color}`}>
        <Icon size={18} />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

export function PageHeader({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between mb-8 fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900 flex items-center gap-2.5">
          {Icon && <Icon size={24} className="text-blue-600" />}
          {title}
        </h1>
        {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon: Icon, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-300">
      <Icon size={52} className="mb-3 opacity-40" />
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
}

export function Badge({ status }) {
  const map = {
    scheduled: 'bg-blue-50 text-blue-700',
    completed: 'bg-teal-50 text-teal-700',
    cancelled: 'bg-red-50 text-red-600',
    active: 'bg-teal-50 text-teal-700',
    inactive: 'bg-gray-100 text-gray-500',
    safe: 'bg-teal-50 text-teal-700',
    unsafe: 'bg-red-50 text-red-600',
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}
