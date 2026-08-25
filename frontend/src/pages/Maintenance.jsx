import { useEffect, useState } from 'react';
import API from '../services/api';
import { Wrench, Plus, X, DollarSign, Calendar, Truck } from 'lucide-react';

export default function Maintenance() {
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    vehicle: '',
    serviceType: 'Routine Oil Change',
    cost: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    description: '',
    status: 'completed'
  });
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [mRes, vRes] = await Promise.all([
        API.get('/maintenance').catch(() => ({ data: { data: [] } })),
        API.get('/vehicles').catch(() => ({ data: { data: [] } }))
      ]);
      const loadedLogs = mRes.data?.data || [];
      const loadedVehicles = vRes.data?.data || [];

      setLogs(loadedLogs);
      setVehicles(loadedVehicles);

      if (loadedVehicles.length > 0) {
        setFormData((prev) => ({ ...prev, vehicle: loadedVehicles[0]._id }));
      }
    } catch (err) {
      console.error('Failed to fetch maintenance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.vehicle) {
      setError('Please select a valid vehicle.');
      return;
    }

    try {
      const payload = {
        vehicle: formData.vehicle,
        serviceType: formData.serviceType,
        cost: parseFloat(formData.cost),
        scheduledDate: formData.scheduledDate,
        status: formData.status,
        description: formData.description
      };

      await API.post('/maintenance', payload);
      setIsModalOpen(false);
      setFormData({
        vehicle: vehicles[0]?._id || '',
        serviceType: 'Routine Oil Change',
        cost: '',
        scheduledDate: new Date().toISOString().split('T')[0],
        description: '',
        status: 'completed'
      });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add maintenance log');
    }
  };

  const totalExpense = logs.reduce((sum, log) => sum + (Number(log.cost) || 0), 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Fleet Maintenance & Repairs</h1>
          <p className="text-slate-500 mt-1">Track service history, scheduled inspections, and repair costs</p>
        </div>
        <button
          onClick={() => {
            if (vehicles.length > 0 && !formData.vehicle) {
              setFormData((prev) => ({ ...prev, vehicle: vehicles[0]._id }));
            }
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-medium px-4 py-2.5 rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-5 h-5" /> Log Service Record
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Total Maintenance Logs</p>
            <p className="text-3xl font-semibold text-slate-900 mt-2">{logs.length}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Wrench className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Cumulative Maintenance Expenditure</p>
            <p className="text-3xl font-semibold text-slate-900 mt-2">
              ${totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <DollarSign className="w-7 h-7" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading service logs...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                <th className="py-3 px-6">Vehicle</th>
                <th className="py-3 px-6">Service Type</th>
                <th className="py-3 px-6">Scheduled Date</th>
                <th className="py-3 px-6">Cost</th>
                <th className="py-3 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
              {logs.map((log) => (
                <tr key={log._id || Math.random()} className="hover:bg-slate-50/50">
                  <td className="py-4 px-6 font-medium text-slate-900 flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                      <Truck className="w-5 h-5" />
                    </div>
                    {log.vehicle ? `${log.vehicle.make} ${log.vehicle.model}` : 'Unassigned'}
                  </td>
                  <td className="py-4 px-6 font-medium">{log.serviceType}</td>
                  <td className="py-4 px-6 text-slate-500 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {log.scheduledDate ? new Date(log.scheduledDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-4 px-6 font-semibold text-slate-900">
                    ${Number(log.cost || 0).toFixed(2)}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                      log.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                      log.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {log.status || 'completed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Log Maintenance Record</h2>
            {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Select Vehicle</label>
                <select
                  required
                  value={formData.vehicle}
                  onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900"
                >
                  <option value="" disabled>-- Select a Vehicle --</option>
                  {vehicles.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.make} {v.model} ({v.licensePlate || v.vin})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Service Type</label>
                <input
                  required
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                  placeholder="e.g. Brake Replacement, Tire Rotation"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    placeholder="250.00"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    required
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="completed">Completed</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in-progress">In Progress</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg"
                >
                  Save Service Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}