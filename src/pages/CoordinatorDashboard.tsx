import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Plus } from 'lucide-react';
import ConfigForm from '../components/ConfigForm';
import ConfigCard from '../components/ConfigCard';
import { Config } from '../types';
import { api } from '../services/api';
import { toast } from 'react-toastify';

const CoordinatorDashboard = () => {
  const { user, logout } = useAuth();
  const [configs, setConfigs] = useState<Config[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<Config | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.branch) {
      fetchConfigs();
    }
  }, [user?.branch]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (user?.branch) {
        fetchConfigs();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user?.branch]);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const data = await api.config.getAll({ branch: user?.branch });
      // Filter out BSH configurations
      const branchConfigs = data.filter((config: Config) => !config.branch.endsWith('-BSH'));
      setConfigs(branchConfigs);
    } catch (error) {
      toast.error('Failed to fetch configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (config: Config) => {
    setSelectedConfig(config);
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      await fetchConfigs();
      setShowForm(false);
      setSelectedConfig(null);
      toast.success('Configuration saved successfully');
    } catch (error) {
      toast.error('Failed to save configuration');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Responsive Navigation */}
      <nav className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-4 sm:h-16">
            <div className="text-center sm:text-left mb-4 sm:mb-0">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-200">
                Coordinator Dashboard
              </h1>
              <p className="text-sm text-slate-400">
                Welcome, {user?.username}
              </p>
            </div>
            <div className="flex-1 flex justify-center mb-4 sm:mb-0">
              <img
                src="/images/logo.png"
                alt="NEC Logo"
                className="h-10 sm:h-12 object-contain"
              />
            </div>
            <div className="flex items-center">
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm sm:text-base"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Exit</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Responsive Main Content */}
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="sm:px-0">
          {showForm ? (
            <div className="bg-slate-800 rounded-xl shadow-sm p-4 sm:p-6 border border-slate-700">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-200 mb-2 sm:mb-0">
                  {selectedConfig ? 'Edit Configuration' : 'New Configuration'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setSelectedConfig(null);
                  }}
                  className="text-slate-400 hover:text-slate-200 transition"
                >
                  Cancel
                </button>
              </div>
              <ConfigForm
                role="coordinator"
                branch={user?.branch || ''} // Add default empty string
                initialData={selectedConfig}
                onSave={handleSave}
              />
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-200 mb-2 sm:mb-0">
                  {user?.branch} Department Configurations
                </h2>
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">New Configuration</span>
                  <span className="sm:hidden">Add New</span>
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center py-8 sm:py-12">
                  <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {configs.map((config) => (
                    <ConfigCard
                      key={config._id}
                      config={config}
                      onEdit={handleEdit}
                    />
                  ))}
                  {configs.length === 0 && (
                    <div className="col-span-full text-center py-8 sm:py-12 text-slate-400 text-sm sm:text-base">
                      No configurations found. Click "Add New" to create one.
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default CoordinatorDashboard;
