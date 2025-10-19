import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Plus } from 'lucide-react';
import ConfigForm from '../components/ConfigForm';
import ConfigCard from '../components/ConfigCard';
import { Config } from '../types';
import { api } from '../services/api';
import { toast } from 'react-toastify';

const BSHDashboard = () => {
  const { user, logout } = useAuth();
  const [configs, setConfigs] = useState<Config[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<Config | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchConfigs();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchConfigs();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      // Get all BSH configs
      const data = await api.config.getAll();
      // Filter for BSH branches only
      const bshConfigs = data.filter((config: Config) => config.branch.endsWith('-BSH'));
      setConfigs(bshConfigs);
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

  // Update renderConfigCards to not use unused branch variable
  const renderConfigCards = () => {
    // Group configs by branch
    const groupedConfigs = configs.reduce((acc, config) => {
      const branchKey = config.branch;
      if (!acc[branchKey]) {
        acc[branchKey] = [];
      }
      acc[branchKey].push(config);
      return acc;
    }, {} as Record<string, Config[]>);

    return Object.entries(groupedConfigs).map(([branchKey, branchConfigs]) => (
      <div key={branchKey} className="mb-8">
        <h3 className="text-lg font-semibold text-slate-200 mb-4">{branchKey}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {branchConfigs.map(config => (
            <ConfigCard
              key={config._id}
              config={config}
              onEdit={() => handleEdit(config)}
            />
          ))}
        </div>
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <nav className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-4 sm:h-16">
            <div className="text-center sm:text-left mb-4 sm:mb-0">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-200">
                BSH Dashboard
              </h1>
              <p className="text-sm text-slate-400">Welcome, {user?.username}</p>
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
                role="bsh"
                branch={selectedConfig?.branch || ''}
                initialData={selectedConfig}
                onSave={handleSave}
              />
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-200 mb-2 sm:mb-0">
                  BSH Configurations
                </h2>
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Plus className="w-5 h-5" />
                  <span>New Configuration</span>
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="space-y-8">
                  {renderConfigCards()}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default BSHDashboard;
