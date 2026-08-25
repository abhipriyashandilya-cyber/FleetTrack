import { useEffect, useState } from 'react';
import API from '../services/api';
import { Fuel, Plus, X, DollarSign, Gauge, TrendingUp } from 'lucide-react';

export default function FuelAnalytics() {
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState({ totalGallons: 0, totalCost: 0, avgPricePerGallon: 0 });
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    vehicle_vin: '',
    driver_id: '',
    fuel_gallons: '',
    price_per_gallon: '',
    odometer_reading: '',
    logged_at: new Date().toISOString().split('T')[0]
  });
  const [error, setError] = useState('');

  const fetchFuelData = async () => {
    try {
      const [analyticsRes, vehiclesRes, driversRes] = await Promise.all([
        API.get('/fuel/analytics/summary').catch(() => ({ data: { data: [] } })),
        API.get('/vehicles').catch(() => ({ data: { data: [] } })),
        API.get('/drivers').catch(() => ({ data: { data: [] } }))
      ]);

      const analyticsData = analyticsRes.data?.data || [];
      const loadedVehicles = vehiclesRes.data?.data || [];
      const loadedDrivers = driversRes.data?.data || [];

      setLogs(analyticsData);
      setVehicles(loadedVehicles);
      setDrivers(loadedDrivers);

      // Compute aggregate stats across all vehicles
      const totalCost = analyticsData.reduce((acc, curr) => acc + Number(curr.total_expenditure || 0), 0);
      const totalGallons = analyticsData.reduce((acc, curr) => acc + Number(curr.total_gallons || 0), 0);
      const avgPrice = totalGallons > 0 ? totalCost / totalGallons : 0;

      setSummary({ totalCost, totalGallons, avgPricePerGallon: avgPrice });

      if (loadedVehicles.length > 0 && loadedDrivers.length > 0) {
        setFormData((prev) => ({
          ...prev,
          vehicle_vin: loadedVehicles[0].vin || '',
          driver_id: loadedDrivers[0].driver?._id || loadedDrivers[0]._id || ''
        }));
      }
    } catch (err) {
      console.error('Failed to fetch fuel logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFuelData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.vehicle_vin || !formData.driver_id) {
      setError('Please select both a vehicle and a driver.');
      return;
    }

    try {
      const payload = {
        vehicle_vin: formData.vehicle_vin,
        driver_id: formData.driver_id,
        fuel_gallons: parseFloat(formData.fuel_gallons),
        price_per_gallon: parseFloat(formData.price_per_gallon),
        odometer_reading: parseInt(formData.odometer_reading, 10),
        logged_at: formData.logged_at
      };

      await API.post('/fuel', payload);
      setIsModalOpen(false);
      
      setFormData({
        vehicle_vin: vehicles[0]?.vin || '',
        driver_id: drivers[0]?.driver?._id || drivers[0]?._id || '',
        fuel_gallons: '',
        price_per_gallon: '',
        odometer_reading: '',
        logged_at: new Date().toISOString().split('T')[0]
      });

      fetchFuelData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record fuel log');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Fuel & Expenditure Analytics</h1>
          <p className="text-slate-500 mt-1">Real-time consumption logs backed by MariaDB relational storage</p>
        </div>
        <button
          onClick={() => {
            if (vehicles.length > 0 && !formData.vehicle_vin) {
              setFormData((prev) => ({ ...prev, vehicle_vin: vehicles[0].vin }));
            }
            if (drivers.length > 0 && !formData.driver_id) {
              setFormData((prev) => ({ ...prev, driver_id: drivers[0].driver?._id || drivers[0]._id }));
            }
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-5 h-5" /> Log Fuel Refill
        </button>
      </div>

      {/* Metrics Summary Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Total Expenditure</p>
            <p className="text-3xl font-semibold text-slate-900 mt-2">
              ${Number(summary.totalCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <DollarSign className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Gallons Consumed</p>
            <p className="text-3xl font-semibold text-slate-900 mt-2">
              {Number(summary.totalGallons || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })} gal
            </p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Fuel className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Avg Price / Gallon</p>
            <p className="text-3xl font-semibold text-slate-900 mt-2">
              ${Number(summary.avgPricePerGallon || 0).toFixed(2)}
            </p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <TrendingUp className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Analytics Summary Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading fuel analytics...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                <th className="py-3 px-6">Vehicle VIN</th>
                <th className="py-3 px-6">Total Refills</th>
                <th className="py-3 px-6">Total Gallons</th>
                <th className="py-3 px-6">Total Expenditure</th>
                <th className="py-3 px-6">Avg Price / Gal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
              {logs.map((row, idx) => (
                <tr key={row.vehicle_vin || idx} className="hover:bg-slate-50/50">
                  <td className="py-4 px-6 font-mono text-xs font-semibold text-slate-900">
                    {row.vehicle_vin}
                  </td>
                  <td className="py-4 px-6">{row.total_refills}</td>
                  <td className="py-4 px-6 font-medium">{Number(row.total_gallons).toFixed(1)} gal</td>
                  <td className="py-4 px-6 font-semibold text-emerald-700">
                    ${Number(row.total_expenditure).toFixed(2)}
                  </td>
                  <td className="py-4 px-6 text-slate-600">
                    ${Number(row.avg_price_per_gallon).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Refill Log Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Log Fuel Refill Record</h2>
            {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Select Vehicle (VIN)</label>
                <select
                  required
                  value={formData.vehicle_vin}
                  onChange={(e) => setFormData({ ...formData, vehicle_vin: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="" disabled>-- Select a Vehicle --</option>
                  {vehicles.map((v) => (
                    <option key={v._id || v.vin} value={v.vin}>
                      {v.make} {v.model} ({v.licensePlate || v.vin})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Select Driver</label>
                <select
                  required
                  value={formData.driver_id}
                  onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="" disabled>-- Select a Driver --</option>
                  {drivers.map((d) => {
                    const id = d.driver?._id || d._id;
                    const name = d.driver?.name || d.name;
                    return (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Gallons Fueled</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.fuel_gallons}
                    onChange={(e) => setFormData({ ...formData, fuel_gallons: e.target.value })}
                    placeholder="45.5"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Price / Gallon ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price_per_gallon}
                    onChange={(e) => setFormData({ ...formData, price_per_gallon: e.target.value })}
                    placeholder="3.65"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Odometer Reading (mi)</label>
                  <input
                    type="number"
                    required
                    value={formData.odometer_reading}
                    onChange={(e) => setFormData({ ...formData, odometer_reading: e.target.value })}
                    placeholder="124500"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.logged_at}
                    onChange={(e) => setFormData({ ...formData, logged_at: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
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
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                >
                  Save Fuel Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}