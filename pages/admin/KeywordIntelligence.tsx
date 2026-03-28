import React, { useState, useEffect } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { Keyword, KeywordCategory, KeywordPriority, KeywordCluster, KeywordPerformance, TrendingKeyword } from '../../types';
import { Plus, Edit2, Trash2, Search, RefreshCw, Link as LinkIcon, BarChart2, TrendingUp, Settings, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';

const KeywordIntelligence: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'database' | 'clusters' | 'performance' | 'trending'>('database');
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [clusters, setClusters] = useState<KeywordCluster[]>([]);
  const [performance, setPerformance] = useState<KeywordPerformance[]>([]);
  const [trending, setTrending] = useState<TrendingKeyword[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isKeywordModalOpen, setIsKeywordModalOpen] = useState(false);
  const [editingKeyword, setEditingKeyword] = useState<Keyword | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [kwData, clusterData, perfData, trendData] = await Promise.all([
        mockBackend.getKeywords(),
        mockBackend.getKeywordClusters(),
        mockBackend.getKeywordPerformance(),
        mockBackend.getTrendingKeywords()
      ]);
      setKeywords(kwData);
      setClusters(clusterData);
      setPerformance(perfData);
      setTrending(trendData);
    } catch (error) {
      console.error("Error fetching keyword data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAIKeywords = async (keyword: Keyword) => {
    // Simulate AI generation
    const updatedKeyword = {
      ...keyword,
      synonyms: [...keyword.synonyms, `${keyword.term} methods`, `best ${keyword.term}`],
      relatedQueries: [...keyword.relatedQueries, `how to do ${keyword.term}`, `${keyword.term} cost`],
      aiOptimized: true,
      aiQA: {
        question: `What is the best way to approach ${keyword.term}?`,
        answer: `The best approach to ${keyword.term} involves careful planning, proper resource allocation, and continuous monitoring for optimal results.`
      }
    };
    await mockBackend.updateKeyword(keyword.id, updatedKeyword);
    fetchData();
  };

  const handleDeleteKeyword = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this keyword?")) {
      await mockBackend.deleteKeyword(id);
      fetchData();
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BrainCircuit className="h-8 w-8 text-agri-green" />
            SEO & Keyword Intelligence
          </h1>
          <p className="text-gray-500 mt-2">Master Keyword Database & AI Optimization Engine</p>
        </div>
        <button 
          onClick={() => { setEditingKeyword(null); setIsKeywordModalOpen(true); }}
          className="bg-agri-green text-white px-4 py-2 rounded-lg hover:bg-agri-dark transition-colors flex items-center justify-center gap-2 w-full md:w-auto"
        >
          <Plus className="h-5 w-5" />
          Add Keyword
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap space-x-1 bg-white p-1 rounded-xl shadow-sm mb-6 border border-gray-100">
        {[
          { id: 'database', label: 'Master Database', icon: Search },
          { id: 'clusters', label: 'Topical Clusters', icon: LinkIcon },
          { id: 'performance', label: 'Performance', icon: BarChart2 },
          { id: 'trending', label: 'Trending', icon: TrendingUp }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === tab.id 
                ? 'bg-agri-green text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <tab.icon className="h-5 w-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-agri-green"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {activeTab === 'database' && (
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                      <th className="p-4 font-semibold rounded-tl-lg">Keyword</th>
                      <th className="p-4 font-semibold">Category</th>
                      <th className="p-4 font-semibold">Priority</th>
                      <th className="p-4 font-semibold">Vol.</th>
                      <th className="p-4 font-semibold">AI Opt.</th>
                      <th className="p-4 font-semibold text-right rounded-tr-lg">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {keywords.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-500">
                          No keywords found. Add some to get started.
                        </td>
                      </tr>
                    ) : (
                      keywords.map((kw) => (
                        <tr key={kw.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4">
                            <div className="font-medium text-gray-900">{kw.term}</div>
                            {kw.subCategory && <div className="text-xs text-gray-500">{kw.subCategory}</div>}
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                              {kw.category.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              kw.priority === 'HIGH' ? 'bg-red-50 text-red-700' :
                              kw.priority === 'MEDIUM' ? 'bg-yellow-50 text-yellow-700' :
                              'bg-green-50 text-green-700'
                            }`}>
                              {kw.priority}
                            </span>
                          </td>
                          <td className="p-4 text-gray-600">{kw.searchVolume.toLocaleString()}</td>
                          <td className="p-4">
                            {kw.aiOptimized ? (
                              <span className="text-green-600 flex items-center gap-1 text-sm"><BrainCircuit className="h-4 w-4"/> Yes</span>
                            ) : (
                              <button 
                                onClick={() => handleGenerateAIKeywords(kw)}
                                className="text-agri-green hover:text-agri-dark text-sm flex items-center gap-1"
                              >
                                <RefreshCw className="h-4 w-4" /> Optimize
                              </button>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => { setEditingKeyword(kw); setIsKeywordModalOpen(true); }}
                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteKeyword(kw.id)}
                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'clusters' && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clusters.length === 0 ? (
                <div className="col-span-full text-center p-8 text-gray-500">No clusters found.</div>
              ) : (
                clusters.map(cluster => (
                  <div key={cluster.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <LinkIcon className="h-5 w-5 text-agri-green" />
                      {cluster.mainTopic}
                    </h3>
                    <ul className="space-y-2 mb-4">
                      {cluster.subtopics.map((sub, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                          {sub}
                        </li>
                      ))}
                    </ul>
                    {cluster.targetUrl && (
                      <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded truncate">
                        Target: {cluster.targetUrl}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="p-6">
               <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                      <th className="p-4 font-semibold rounded-tl-lg">Keyword</th>
                      <th className="p-4 font-semibold">Ranking</th>
                      <th className="p-4 font-semibold">Traffic</th>
                      <th className="p-4 font-semibold">CTR</th>
                      <th className="p-4 font-semibold text-right rounded-tr-lg">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {performance.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-500">No performance data available.</td>
                      </tr>
                    ) : (
                      performance.map((perf) => (
                        <tr key={perf.keywordId} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4 font-medium text-gray-900">{perf.term}</td>
                          <td className="p-4">
                            <span className="font-bold text-gray-900">#{perf.ranking}</span>
                          </td>
                          <td className="p-4 text-gray-600">{perf.traffic.toLocaleString()}</td>
                          <td className="p-4 text-gray-600">{perf.ctr}%</td>
                          <td className="p-4 text-right">
                            {perf.trend === 'UP' ? <TrendingUp className="h-5 w-5 text-green-500 inline" /> :
                             perf.trend === 'DOWN' ? <TrendingUp className="h-5 w-5 text-red-500 inline transform rotate-180" /> :
                             <span className="text-gray-400">-</span>}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'trending' && (
            <div className="p-6">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trending.length === 0 ? (
                  <div className="col-span-full text-center p-8 text-gray-500">No trending keywords right now.</div>
                ) : (
                  trending.map(trend => (
                    <div key={trend.id} className="border border-gray-200 rounded-xl p-5 bg-gradient-to-br from-white to-green-50">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{trend.term}</h3>
                        <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" /> +{trend.growthPercentage}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-4">Category: {trend.category}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Vol: {trend.searchVolume.toLocaleString()}</span>
                        <button className="text-sm text-agri-green font-medium hover:underline">Add to Target</button>
                      </div>
                    </div>
                  ))
                )}
               </div>
            </div>
          )}
        </div>
      )}

      {/* Keyword Modal (Simplified for prototype) */}
      {isKeywordModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">{editingKeyword ? 'Edit Keyword' : 'Add New Keyword'}</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const kwData: any = {
                term: formData.get('term'),
                category: formData.get('category'),
                priority: formData.get('priority'),
                searchVolume: Number(formData.get('searchVolume')),
                difficulty: Number(formData.get('difficulty')),
                autoInsert: formData.get('autoInsert') === 'on',
                aiOptimized: editingKeyword ? editingKeyword.aiOptimized : false,
                synonyms: editingKeyword ? editingKeyword.synonyms : [],
                relatedQueries: editingKeyword ? editingKeyword.relatedQueries : [],
                mappedArticles: editingKeyword ? editingKeyword.mappedArticles : []
              };

              if (editingKeyword) {
                await mockBackend.updateKeyword(editingKeyword.id, kwData);
              } else {
                await mockBackend.addKeyword(kwData);
              }
              setIsKeywordModalOpen(false);
              fetchData();
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Keyword Term</label>
                  <input name="term" defaultValue={editingKeyword?.term} required className="w-full p-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select name="category" defaultValue={editingKeyword?.category || 'HIGH_VOLUME'} className="w-full p-2 border rounded-lg">
                    <option value="HIGH_VOLUME">High Volume Core</option>
                    <option value="CROP_SPECIFIC">Crop Specific</option>
                    <option value="PROBLEM_BASED">Problem Based</option>
                    <option value="LOCATION_BASED">Location Based</option>
                    <option value="GOVERNMENT_SCHEME">Government & Scheme</option>
                    <option value="LONG_TAIL">Long Tail (AI Focused)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select name="priority" defaultValue={editingKeyword?.priority || 'MEDIUM'} className="w-full p-2 border rounded-lg">
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search Volume</label>
                  <input type="number" name="searchVolume" defaultValue={editingKeyword?.searchVolume || 0} className="w-full p-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty (1-100)</label>
                  <input type="number" name="difficulty" defaultValue={editingKeyword?.difficulty || 50} className="w-full p-2 border rounded-lg" />
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <input type="checkbox" name="autoInsert" id="autoInsert" defaultChecked={editingKeyword?.autoInsert ?? true} className="w-4 h-4 text-agri-green rounded" />
                  <label htmlFor="autoInsert" className="text-sm font-medium text-gray-700">Enable Auto-Insertion</label>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setIsKeywordModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-agri-green text-white rounded-lg hover:bg-agri-dark">Save Keyword</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeywordIntelligence;
