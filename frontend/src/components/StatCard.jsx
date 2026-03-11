import Card from './ui/Card';

export default function StatCard({ icon, label, value, color = 'primary' }) {
  const colors = {
    primary: 'text-primary bg-primary-soft',
    secondary: 'text-secondary-deep bg-secondary-soft',
    success: 'text-green-600 bg-green-100',
    warning: 'text-yellow-600 bg-yellow-100',
    danger: 'text-red-600 bg-red-100',
  };

  return (
    <Card className={`!p-4 ${icon ? 'flex items-center gap-4' : ''}`}>
      {icon && (
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${colors[color]}`}>
          {icon}
        </div>
      )}
      <div>
        <p className="text-xs text-text-light">{label}</p>
        <p className={`text-2xl font-bold font-heading ${colors[color]?.split(' ')[0] || ''}`}>{value}</p>
      </div>
    </Card>
  );
}
