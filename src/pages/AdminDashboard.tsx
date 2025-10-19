import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, FileText, Download, Plus, Users } from 'lucide-react';
import ConfigForm from '../components/ConfigForm';
import ConfigCard from '../components/ConfigCard';
import FeedbackSummary from '../components/FeedbackSummary';
import FeedbackExport from '../components/FeedbackExport';
import { Config } from '../types';
import { api } from '../services/api';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition, staggerContainer, fadeInUp, scaleIn } from '../animations';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'config' | 'summary' | 'export'>('config');
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
      const data = await api.config.getAll();
      setConfigs(data);
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

  const handleDelete = async (config: Config) => {
    if (!config._id) return;

    // Show confirmation dialog
    if (!window.confirm('Are you sure you want to delete this configuration?')) {
      return;
    }

    try {
      setLoading(true);
      await api.config.delete(config._id);
      await fetchConfigs();
      toast.success('Configuration deleted successfully');
    } catch (error) {
      toast.error('Failed to delete configuration');
      console.error('Delete error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBSHClick = () => {
    navigate('/bsh-dashboard');
  };

  return (
    <motion.div 
      className="min-h-screen bg-slate-900"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
    >
      <motion.nav 
        className="bg-slate-800 border-b border-slate-700"
        variants={fadeInUp}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center h-auto sm:h-16 py-4 sm:py-0">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
            </div>
            <div className="flex-1 flex justify-center mb-4 sm:mb-0">
              <img
                src="https://i.ibb.co/8C02vFT/logo.jpg"
                alt="NEC Logo"
                className="h-10 sm:h-12 object-contain"
              />
            </div>
            <div className="flex items-center">
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm sm:text-base"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8"
        variants={staggerContainer}
      >
        <motion.div 
          className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6"
          variants={fadeInUp}
        >
          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition text-sm sm:text-base ${
              activeTab === 'config'
                ? 'bg-blue-600 text-slate-200'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            Faculty Configuration
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition text-sm sm:text-base ${
              activeTab === 'summary'
                ? 'bg-blue-600 text-slate-200'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            Feedback Summary
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition text-sm sm:text-base ${
              activeTab === 'export'
                ? 'bg-blue-600 text-slate-200'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            Feedback Export
          </button>
          <button
            onClick={handleBSHClick}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-lg font-medium transition text-sm sm:text-base"
          >
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            BSH Dashboard
          </button>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={scaleIn}
          >
            {activeTab === 'config' && (
              <motion.div className="space-y-6" variants={staggerContainer}>
                {showForm ? (
                  <motion.div 
                    className="bg-slate-800 rounded-xl shadow-sm p-6"
                    variants={fadeInUp}
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-white">
                        {selectedConfig ? 'Edit Configuration' : 'New Configuration'}
                      </h2>
                      <button
                        onClick={() => {
                          setShowForm(false);
                          setSelectedConfig(null);
                        }}
                        className="text-slate-300 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                    <ConfigForm
                      role="admin"
                      branch="" // Add empty string for admin
                      initialData={selectedConfig}
                      onSave={handleSave}
                    />
                  </motion.div>
                ) : (
                  <motion.div variants={staggerContainer}>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-white">Faculty Configurations</h2>
                      <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        <Plus className="w-5 h-5" />
                        New Configuration
                      </button>
                    </div>

                    {loading ? (
                      <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {configs.map((config, index) => (
                          <motion.div
                            key={config._id || index}
                            variants={fadeInUp}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <ConfigCard
                              config={config}
                              onEdit={handleEdit}
                              onDelete={handleDelete}
                              showDelete={true}
                            />
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}
            
            {activeTab === 'summary' && (
              <motion.div variants={fadeInUp}>
                <FeedbackSummary />
              </motion.div>
            )}
            
            {activeTab === 'export' && (
              <motion.div variants={fadeInUp}>
                <FeedbackExport />
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default AdminDashboard;
