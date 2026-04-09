import React, { useState } from 'react';
import { Search, Eye, Filter, X, Activity, CheckCircle, AlertTriangle, Sliders, EyeOff, Info } from 'lucide-react';

const CLASSES = [
  'NORMAL', 'PNEUMONIA', 'LUNG OPACITY', 'PLEURAL EFFUSION', 'LUNG CANCER', 
  'LUNG INFECTION', 'PNEUMOTHORAX', 'EMPHYSEMA', 'PULMONARY FIBROSIS'
];

export default function HistoryPage({ history, clearHistory, isClearing, successMessage, onViewResults }: { history: any[], clearHistory: () => void, isClearing: boolean, successMessage: string | null, onViewResults: (id: number) => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date-desc');
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [activeView, setActiveView] = useState<'metrics' | 'confusion' | 'gradcam'>('metrics');
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [temp, setTemp] = useState(0.5);
  const [heatmapX, setHeatmapX] = useState(60);
  const [heatmapY, setHeatmapY] = useState(40);

  const filteredData = history.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.disease.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'All' || item.disease === filter;
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
    return 0;
  });

  const handleViewResults = (item: any) => {
    setSelectedItem(item);
    setActiveView('metrics');
  };

  return (
    <div className="p-8 max-w-6xl mx-auto text-[var(--text-color)] font-serif">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-color)]">Patient History</h1>
        <button 
          onClick={() => setShowConfirm(true)} 
          disabled={history.length === 0 || isClearing}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-all font-bold shadow-md"
        >
          {isClearing ? 'Clearing...' : 'Clear All Records'}
        </button>
      </div>

      {successMessage && (
        <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-6">{successMessage}</div>
      )}

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-[var(--secondary-text)]" size={20} />
          <input 
            type="text" 
            placeholder="Search by name or diagnosis..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 p-3 bg-[var(--bg-color)] rounded-lg border-2 border-[var(--primary-color)] text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/50"
          />
        </div>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className="p-3 bg-[var(--bg-color)] rounded-lg border-2 border-[var(--primary-color)] text-[var(--text-color)]"
        >
          <option value="All">All Diseases</option>
          {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          className="p-3 bg-[var(--bg-color)] rounded-lg border-2 border-[var(--primary-color)] text-[var(--text-color)]"
        >
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="name-asc">Name A-Z</option>
        </select>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--card-bg)] p-8 rounded-xl border-2 border-[var(--primary-color)] shadow-2xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-[var(--text-color)]">Clear All Records?</h2>
            <p className="mb-6 text-[var(--secondary-text)]">This action will permanently delete all patient history records. This cannot be undone.</p>
            <div className="flex justify-end gap-4">
              <button 
                onClick={() => setShowConfirm(false)} 
                className="px-6 py-2 rounded-lg border border-[var(--primary-color)] text-[var(--text-color)] hover:bg-[var(--primary-color)]/10 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => { clearHistory(); setShowConfirm(false); }} 
                className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-bold shadow-lg"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[var(--card-bg)] p-6 rounded-xl border-2 border-[var(--primary-color)] shadow-2xl max-w-5xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[var(--text-color)] flex items-center gap-2">
                <Activity /> Analysis Results: {selectedItem.name}
              </h2>
              <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors">
                <X size={24} className="text-[var(--text-color)]" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Image Preview & Grad-CAM */}
              <div className="flex flex-col gap-4">
                <div className="relative aspect-square bg-black rounded-xl overflow-hidden border-2 border-[var(--primary-color)] shadow-inner">
                  {selectedItem.image ? (
                    <img src={selectedItem.image} alt="X-Ray" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--secondary-text)]">No image available</div>
                  )}
                  
                  {activeView === 'gradcam' && showHeatmap && selectedItem.image && (
                    <div 
                      className="absolute inset-0 mix-blend-screen pointer-events-none transition-opacity duration-300"
                      style={{
                        background: `radial-gradient(circle at ${heatmapX}% ${heatmapY}%, 
                          rgba(255, 0, 0, 0.8) 0%, 
                          rgba(255, 165, 0, 0.6) 20%, 
                          rgba(0, 255, 0, 0.4) 40%, 
                          rgba(0, 0, 255, 0.2) 60%, 
                          transparent 80%)`,
                        opacity: temp
                      }}
                    ></div>
                  )}
                </div>

                <div className={`p-3 rounded-lg flex items-center gap-2 ${selectedItem.disease === 'NORMAL' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                  {selectedItem.disease === 'NORMAL' ? <CheckCircle /> : <AlertTriangle />}
                  <span className="font-bold">Predicted: {selectedItem.disease} ({selectedItem.confidence || 95}%)</span>
                </div>
              </div>

              {/* Metrics & Details */}
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => setActiveView('metrics')} className={`p-3 rounded-lg border ${activeView === 'metrics' ? 'bg-[var(--primary-color)]/20 border-[var(--primary-color)]' : 'border-[var(--secondary-text)]'}`}>Metrics</button>
                  <button onClick={() => setActiveView('confusion')} className={`p-3 rounded-lg border ${activeView === 'confusion' ? 'bg-[var(--primary-color)]/20 border-[var(--primary-color)]' : 'border-[var(--secondary-text)]'}`}>Confusion</button>
                  <button onClick={() => setActiveView('gradcam')} className={`p-3 rounded-lg border flex items-center justify-center gap-2 ${activeView === 'gradcam' ? 'bg-[var(--primary-color)]/20 border-[var(--primary-color)]' : 'border-[var(--secondary-text)]'}`}>
                    Grad-CAM
                  </button>
                </div>

                <div className="p-4 bg-[var(--bg-color)] rounded-xl border border-[var(--primary-color)] flex-1 overflow-y-auto max-h-[400px]">
                  {activeView === 'metrics' && selectedItem.metrics && (
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(selectedItem.metrics).map(([key, val]) => (
                        <div key={key} className="p-3 bg-[var(--card-bg)] rounded-lg border border-[var(--primary-color)]">
                          <p className="text-xs text-[var(--secondary-text)] uppercase">{key}</p>
                          <p className="text-xl font-bold">{((val as number) * 100).toFixed(1)}%</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {activeView === 'metrics' && !selectedItem.metrics && (
                    <div className="text-center p-8 text-[var(--secondary-text)]">Metrics data not available for this older record.</div>
                  )}

                  {activeView === 'confusion' && selectedItem.confusionMatrix && (
                    <div className="overflow-x-auto">
                      <h3 className="text-sm font-bold mb-2 text-[var(--text-color)]">Confusion Matrix</h3>
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr>
                            <th className="border border-[var(--primary-color)] p-1">Act \ Pred</th>
                            {CLASSES.map(c => <th key={c} className="border border-[var(--primary-color)] p-1 text-center">{c.substring(0, 3)}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {CLASSES.map((rowClass, rowIndex) => (
                            <tr key={rowClass}>
                              <th className="border border-[var(--primary-color)] p-1">{rowClass.substring(0, 3)}</th>
                              {CLASSES.map((colClass, colIndex) => (
                                <td key={colClass} className={`border border-[var(--primary-color)] p-1 text-center ${rowIndex === colIndex ? 'bg-[var(--primary-color)]/30 font-bold' : ''}`}>
                                  {selectedItem.confusionMatrix[rowIndex]?.[colIndex] || 0}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {activeView === 'confusion' && !selectedItem.confusionMatrix && (
                    <div className="text-center p-8 text-[var(--secondary-text)]">Confusion matrix not available for this older record.</div>
                  )}

                  {activeView === 'gradcam' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-[var(--text-color)] font-bold">
                          <Sliders size={16}/> Heatmap Controls
                        </label>
                        <button 
                          onClick={() => setShowHeatmap(!showHeatmap)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold transition-all text-sm ${
                            showHeatmap 
                              ? 'bg-[var(--primary-color)] text-[var(--bg-color)] shadow-md' 
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {showHeatmap ? <Eye size={14} /> : <EyeOff size={14} />}
                          {showHeatmap ? 'Visible' : 'Hidden'}
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold mb-2 text-[var(--text-color)]">Intensity (Temperature)</label>
                          <input type="range" min="0" max="1" step="0.1" value={temp} onChange={(e) => setTemp(parseFloat(e.target.value))} className="w-full accent-[var(--primary-color)]" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold mb-2 text-[var(--text-color)]">X-Axis Focus</label>
                          <input type="range" min="0" max="100" value={heatmapX} onChange={(e) => setHeatmapX(parseInt(e.target.value))} className="w-full accent-[var(--primary-color)]" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold mb-2 text-[var(--text-color)]">Y-Axis Focus</label>
                          <input type="range" min="0" max="100" value={heatmapY} onChange={(e) => setHeatmapY(parseInt(e.target.value))} className="w-full accent-[var(--primary-color)]" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {history.length === 0 ? (
        <div className="text-center p-16 bg-[var(--bg-color)] rounded-xl border-2 border-dashed border-[var(--primary-color)]">
          <div className="flex justify-center mb-4">
            <Search size={48} className="text-[var(--secondary-text)] opacity-50" />
          </div>
          <p className="text-2xl font-bold text-[var(--text-color)]">No data available</p>
          <p className="text-[var(--secondary-text)] mt-2 italic">Train or test the model to view results</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-[var(--card-bg)] rounded-xl border-2 border-[var(--primary-color)] shadow-lg">
          <table className="w-full text-left">
            <thead className="bg-[var(--primary-color)]/10 sticky top-0">
              <tr>
                <th className="p-4 text-[var(--text-color)]">S.No</th>
                <th className="p-4 text-[var(--text-color)]">Date</th>
                <th className="p-4 text-[var(--text-color)]">Patient Name</th>
                <th className="p-4 text-[var(--text-color)]">Age/Gender</th>
                <th className="p-4 text-[var(--text-color)]">Diagnosis</th>
                <th className="p-4 text-[var(--text-color)]">Outcome</th>
                <th className="p-4 text-[var(--text-color)]">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={item.id} className="border-t border-[var(--primary-color)]/20 hover:bg-[var(--primary-color)]/5 transition-colors">
                  <td className="p-4 text-[var(--text-color)]">{index + 1}</td>
                  <td className="p-4 text-sm text-[var(--secondary-text)]">{item.date}</td>
                  <td className="p-4 font-bold text-[var(--text-color)]">{item.name}</td>
                  <td className="p-4 text-sm text-[var(--secondary-text)]">{item.age} / {item.gender}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      item.disease === 'LUNG OPACITY' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                      item.disease === 'TEST_RESULT' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                      item.disease === 'NORMAL' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {item.disease}
                    </span>
                  </td>
                  <td className="p-4 text-sm italic text-[var(--secondary-text)]">{item.outcome || 'Pending'}</td>
                  <td className="p-4">
                    <button onClick={() => handleViewResults(item)} className="flex items-center gap-2 text-[var(--primary-color)] hover:underline font-bold">
                      <Eye size={16} /> View Results
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
