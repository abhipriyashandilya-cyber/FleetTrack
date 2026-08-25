import { useEffect, useState } from 'react';
import API from '../services/api';
import { Truck, Plus, X } from 'lucide-react';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    vin: '',
    make: '',
    model: '',
    year: 2026,
    licensePlate: '',
    status: 'active'
  });
  const [error, setError] = useState('');

  const fetchVehicles = async () => {
    try {
      const res = await API.get('/vehicles');
      setVehicles(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await API.post('/vehicles', formData);
      setIsModalOpen(false);
      setFormData({ vin: '', make: '', model: '', year: 2026, licensePlate: '', status: 'active' });
      fetchVehicles();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add vehicle');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Vehicle Management</h1>
          <p className="text-slate-500 mt-1">Track and manage active fleet vehicles</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-5 h-5" /> Add Vehicle
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading vehicles...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                <th className="py-3 px-6">Vehicle</th>
                <th className="py-3 px-6">VIN</th>
                <th className="py-3 px-6">License Plate</th>
                <th className="py-3 px-6">Year</th>
                <th className="py-3 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
              {vehicles.map((v) => (
                <tr key={v._id} className="hover:bg-slate-50/50">
                  <td className="py-4 px-6 font-medium text-slate-900 flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                      <Truck className="w-5 h-5" />
                    </div>
                    {v.make} {v.model}
                  </td>
                  <td className="py-4 px-6 font-mono text-xs">{v.vin}</td>
                  <td className="py-4 px-6 font-semibold">{v.licensePlate}</td>
                  <td className="py-4 px-6">{v.year}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                      v.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                      v.status === 'maintenance' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {v.status}
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
            <h2 className="text-xl font-bold text-slate-900 mb-4">Add Fleet Vehicle</h2>
            {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">VIN (17 characters)</label>
                <input 
                  required 
                  value={formData.vin} 
                  onChange={(e) => setFormData({ ...formData, vin: e.target.value })} 
                  className="w-full px-3 py-2 border rounded-lg uppercase font-mono text-sm" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Make</label>
                  <input 
                    required 
                    value={formData.make} 
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })} 
                    className="w-full px-3 py-2 border rounded-lg text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Model</label>
                  <input 
                    required 
                    value={formData.model} 
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })} 
                    className="w-full px-3 py-2 border rounded-lg text-sm" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">License Plate</label>
                  <input 
                    required 
                    value={formData.licensePlate} 
                    onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })} 
                    className="w-full px-3 py-2 border rounded-lg text-sm uppercase" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Year</label>
                  <input 
                    type="number" 
                    required 
                    value={formData.year} 
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })} 
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
                  Register Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}