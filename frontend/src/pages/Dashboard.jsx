import { useEffect, useState } from 'react';
import API from '../services/api';
import { Truck, Users, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    vehicles: 0,
    drivers: 0,
    expiringDocs: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [vRes, dRes, docRes] = await Promise.all([
          API.get('/vehicles'),
          API.get('/drivers'),
          API.get('/documents/alerts?days=30'),
        ]);

        setStats({
          vehicles: vRes.data.count || 0,
          drivers: dRes.data.count || 0,
          expiringDocs: docRes.data.count || 0,
        });
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    { label: 'Active Fleet Vehicles', value: stats.vehicles, icon: Truck, color: 'text-blue-600 bg-blue-50' },
    { label: 'Registered Drivers', value: stats.drivers, icon: Users, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Compliance Alerts', value: stats.expiringDocs, icon: AlertTriangle, color: 'text-amber-600 bg-amber-50' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">FleetTrack Operational Overview</h1>
        <p className="text-slate-500 mt-1">Real-time status metrics across vehicles, drivers, and compliance alerts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <p className="text-3xl font-semibold text-slate-900 mt-2">{card.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.color}`}>
                <Icon className="w-7 h-7" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}