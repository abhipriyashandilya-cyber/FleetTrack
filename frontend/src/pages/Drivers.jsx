import { useEffect, useState } from 'react';
import API from '../services/api';
import { UserCheck, Plus, X, Award } from 'lucide-react';

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'FleetDriver123!',
    licenseNumber: '',
    licenseClass: 'Class A',
    licenseExpiry: '2028-12-31',
    status: 'available'
  });
  const [error, setError] = useState('');

  const fetchDrivers = async () => {
    try {
      const res = await API.get('/drivers');
      setDrivers(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch drivers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await API.post('/drivers', formData);
      setIsModalOpen(false);
      setFormData({
        name: '',
        email: '',
        password: 'FleetDriver123!',
        licenseNumber: '',
        licenseClass: 'Class A',
        licenseExpiry: '2028-12-31',
        status: 'available'
      });
      fetchDrivers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register driver');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Driver Roster</h1>
          <p className="text-slate-500 mt-1">Manage qualified personnel and compliance standing</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2.5 rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-5 h-5" /> Add Driver
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading drivers...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                <th className="py-3 px-6">Driver Name</th>
                <th className="py-3 px-6">Email</th>
                <th className="py-3 px-6">License Number</th>
                <th className="py-3 px-6">Class</th>
                <th className="py-3 px-6">Safety Score</th>
                <th className="py-3 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
              {drivers.map((item) => (
                <tr key={item.driver?._id || Math.random()} className="hover:bg-slate-50/50">
                  <td className="py-4 px-6 font-medium text-slate-900 flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    {item.driver?.name}
                  </td>
                  <td className="py-4 px-6 text-slate-500">{item.driver?.email}</td>
                  <td className="py-4 px-6 font-mono text-xs">{item.profile?.licenseNumber || 'N/A'}</td>
                  <td className="py-4 px-6">{item.profile?.licenseClass || 'N/A'}</td>
                  <td className="py-4 px-6 font-semibold flex items-center gap-1 text-slate-800">
                    <Award className="w-4 h-4 text-amber-500" />
                    {item.profile?.safetyScore ?? 100} / 100
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                      item.profile?.status === 'available' ? 'bg-emerald-100 text-emerald-800' :
                      item.profile?.status === 'on-trip' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {item.profile?.status || 'available'}
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
            <h2 className="text-xl font-bold text-slate-900 mb-4">Register New Driver</h2>
            {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">License Number</label>
                  <input
                    required
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">License Class</label>
                  <select
                    value={formData.licenseClass}
                    onChange={(e) => setFormData({ ...formData, licenseClass: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                  >
                    <option value="Class A">Class A</option>
                    <option value="Class B">Class B</option>
                    <option value="Class C">Class C</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">License Expiry Date</label>
                <input
                  type="date"
                  required
                  value={formData.licenseExpiry}
                  onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
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
                  className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg"
                >
                  Register Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}