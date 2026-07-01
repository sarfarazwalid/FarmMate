"use client";

import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Filler,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
} from 'chart.js';
import { BarChart3, Loader2, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { getApiUrl } from '@/lib/apiConfig';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
);

// Skeleton Loading Components
const SkeletonCard = ({ className = "" }) => (
  <div className={`bg-surface-800/80 rounded-2xl shadow-sm border border-white/[0.06] p-6 animate-pulse ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <div className="h-4 bg-white/[0.08] rounded w-24"></div>
      <div className="h-8 w-8 bg-white/[0.08] rounded"></div>
    </div>
    <div className="h-8 bg-white/[0.08] rounded w-20 mb-2"></div>
    <div className="h-3 bg-white/[0.08] rounded w-32"></div>
  </div>
);

const SkeletonChart = ({ className = "" }) => (
  <div className={`bg-surface-800/80 rounded-2xl shadow-sm border border-white/[0.06] p-6 animate-pulse ${className}`}>
    <div className="h-6 bg-white/[0.08] rounded w-32 mb-4"></div>
    <div className="h-48 bg-white/[0.08] rounded"></div>
  </div>
);

const SkeletonTable = () => (
  <div className="bg-surface-800/80 rounded-2xl shadow-sm border border-white/[0.06] p-6 animate-pulse">
    <div className="h-6 bg-white/[0.08] rounded w-48 mb-4"></div>
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-3 rounded-lg border border-white/[0.06]">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-white/[0.08] rounded w-32 mb-2"></div>
            <div className="grid grid-cols-5 gap-6">
              {[1, 2, 3, 4, 5].map((j) => (
                <div key={j}>
                  <div className="h-3 bg-white/[0.08] rounded w-16 mb-1"></div>
                  <div className="h-4 bg-white/[0.08] rounded w-20"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function AnalyticsPage() {
  const [user, setUser] = useState(null);
  const [crops, setCrops] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [userId, setUserId] = useState(null);
  const [farms, setFarms] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState('');

  useEffect(() => {
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    };
    
    const uid = getCookie('userId');
    setUserId(uid);
    
    if (!uid) {
      setError('User not authenticated');
      setLoading(false);
      setDataLoading(false);
      return;
    }
    
    setUser({ _id: uid });

    const fetchAnalyticsData = async () => {
      try {
        setDataLoading(true);
        const [farmsRes, cropsRes, ordersRes] = await Promise.all([
          fetch(getApiUrl(`/farms/farmer/${uid}`), { credentials: 'include' }),
          fetch(getApiUrl(`/crops/farmer/${uid}`), { credentials: 'include' }),
          fetch(getApiUrl(`/orders/farmer/${uid}?status=delivered`), { credentials: 'include' })
        ]);

        if (!farmsRes.ok) {
          throw new Error(`Failed to fetch farms: ${farmsRes.status}`);
        }
        if (!cropsRes.ok) {
          throw new Error(`Failed to fetch crops: ${cropsRes.status}`);
        }
        if (!ordersRes.ok) {
          throw new Error(`Failed to fetch orders: ${ordersRes.status}`);
        }

        const farmsJson = await farmsRes.json();
        if (farmsJson.success) {
          setFarms(farmsJson.data);
          if (farmsJson.data?.length && !selectedFarmId) {
            setSelectedFarmId(farmsJson.data[0]._id);
          }
        }

        const cropsData = await cropsRes.json();
        if (cropsData.success) setCrops(cropsData.data);

        const ordersData = await ordersRes.json();
        if (ordersData.success) setOrders(ordersData.data);

      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setError(`Failed to load analytics data: ${error.message}`);
      } finally {
        setDataLoading(false);
        setLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, []);

  const filteredCrops = useMemo(() => {
    if (!selectedFarmId) return crops;
    return crops.filter(c => (c.farm?._id || c.farm) === selectedFarmId);
  }, [crops, selectedFarmId]);

  const totals = useMemo(() => {
    const expected = filteredCrops.reduce((sum, c) => sum + (Number(c.estimatedYield) || 0), 0);
    const predicted = filteredCrops.reduce((sum, c) => sum + (Number(c.predictedYield) || 0), 0);
    const actual = filteredCrops.reduce((sum, c) => sum + (Number(c.actualYield) || 0), 0);

    let totalIncome = 0;
    const revenueByProductId = new Map();
    
    // Calculate income from delivered orders
    orders.forEach(order => {
      // Only count delivered orders
      if (order.status === 'delivered') {
        order.items.forEach(item => {
          // Check if this item belongs to the current farmer
          // Handle both ObjectId and string comparisons
          const itemFarmerId = item.farmer?._id || item.farmer;
          const currentUserId = user?._id;
          
          if (itemFarmerId && currentUserId && 
              itemFarmerId.toString() === currentUserId.toString()) {
            const itemRevenue = item.price * item.quantity;
            totalIncome += itemRevenue;
            
            // Store revenue by product ID for per-crop analysis
            const productId = item.productId?._id || item.productId;
            if (productId) {
              revenueByProductId.set(productId.toString(), 
                (revenueByProductId.get(productId.toString()) || 0) + itemRevenue);
            }
          }
        });
      }
    });

    const totalCost = filteredCrops.reduce((sum, c) => sum + (Number(c.totalCost) || 0), 0);
    const netProfit = totalIncome - totalCost;

    return { expected, predicted, actual, totalIncome, totalCost, netProfit, revenueByProductId };
  }, [filteredCrops, orders, user]);

  // Show loading state while initial data is being fetched
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
        </div>
        
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-teal-400 mx-auto mb-4" />
            <p className="text-lg text-surface-400">Loading analytics dashboard...</p>
            <p className="text-sm text-surface-500 mt-2">Please wait while we gather your data</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
        </div>
        <div className="bg-red-500/5 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 text-red-400">!</div>
            <div>
              <h3 className="text-lg font-semibold text-red-300">Error Loading Analytics</h3>
              <p className="text-red-700">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-3 px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <div className="flex items-center gap-3">
          {farms.length > 0 && (
            <select
              className="border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={selectedFarmId}
              onChange={(e) => setSelectedFarmId(e.target.value)}
            >
              {farms.map(f => (
                <option key={f._id} value={f._id}>{f.name}</option>
              ))}
            </select>
          )}
          {dataLoading && (
            <div className="flex items-center gap-2 text-sm text-surface-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              Updating data...
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dataLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <div className="bg-surface-800/80 rounded-2xl shadow-sm border border-white/[0.06] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-surface-500">Total Expected Yield</p>
                  <p className="text-2xl font-bold text-white">{totals.expected.toFixed(2)}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-surface-500" />
              </div>
              <p className="text-sm text-surface-500 mt-2">Sum of manual expected yields</p>
            </div>

            <div className="bg-surface-800/80 rounded-2xl shadow-sm border border-white/[0.06] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-surface-500">Total Predicted Yield</p>
                  <p className="text-2xl font-bold text-white">{totals.predicted.toFixed(2)}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-sky-400" />
              </div>
              <p className="text-sm text-surface-500 mt-2">AI predicted using Gemini</p>
            </div>

            <div className="bg-surface-800/80 rounded-2xl shadow-sm border border-white/[0.06] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-surface-500">Total Actual Yield</p>
                  <p className="text-2xl font-bold text-white">{totals.actual.toFixed(2)}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-sm text-surface-500 mt-2">Captured at harvest</p>
            </div>
          </>
        )}
      </div>

      {/* Financial Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dataLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <div className="bg-surface-800/80 rounded-2xl shadow-sm border border-white/[0.06] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-surface-500">Total Income</p>
                  <p className="text-2xl font-bold text-white">${totals.totalIncome.toFixed(2)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-surface-800/80 rounded-2xl shadow-sm border border-white/[0.06] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-surface-500">Total Cost</p>
                  <p className="text-2xl font-bold text-white">${totals.totalCost.toFixed(2)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-surface-800/80 rounded-2xl shadow-sm border border-white/[0.06] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-surface-500">Net Profit</p>
                  <p className="text-2xl font-bold text-white">${totals.netProfit.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {dataLoading ? (
          <>
            <SkeletonChart />
            <SkeletonChart />
          </>
        ) : (
          <>
            {/* Yield Comparison Chart */}
            <div className="bg-surface-800/80 rounded-2xl shadow-sm border border-white/[0.06] p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Yield Comparison</h2>
              {filteredCrops.length > 0 ? (
                <div className="h-56">
                  <Bar
                  data={{
                    labels: filteredCrops.map(c => `${c.name} - ${c.variety}`),
                    datasets: [
                      {
                        label: 'Expected Yield',
                        data: filteredCrops.map(c => Number(c.estimatedYield) || 0),
                        backgroundColor: 'rgba(156, 163, 175, 0.8)',
                        borderColor: 'rgb(156, 163, 175)',
                        borderWidth: 1,
                      },
                      {
                        label: 'Predicted Yield',
                        data: filteredCrops.map(c => Number(c.predictedYield) || 0),
                        backgroundColor: 'rgba(59, 130, 246, 0.8)',
                        borderColor: 'rgb(59, 130, 246)',
                        borderWidth: 1,
                      },
                      {
                        label: 'Actual Yield',
                        data: filteredCrops.map(c => Number(c.actualYield) || 0),
                        backgroundColor: 'rgba(16, 185, 129, 0.8)',
                        borderColor: 'rgb(16, 185, 129)',
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      title: {
                        display: true,
                        text: 'Yield Comparison by Crop',
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Yield',
                        },
                      },
                    },
                  }}
                />
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-surface-500">
                  <p>No crop data available to display</p>
                </div>
              )}
            </div>

            {/* Profit Analysis Chart */}
            <div className="bg-surface-800/80 rounded-2xl shadow-sm border border-white/[0.06] p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Profit Analysis</h2>
              {totals.totalIncome > 0 || totals.totalCost > 0 ? (() => {
                const income = Math.max(0, Number(totals.totalIncome) || 0);
                const cost = Math.max(0, Number(totals.totalCost) || 0);
                const isProfit = income >= cost;
                const labels = isProfit ? ['Cost', 'Profit'] : ['Income', 'Loss'];
                const data = isProfit ? [cost, income - cost] : [income, cost - income];
                const colors = isProfit
                  ? ['rgba(239, 68, 68, 0.8)', 'rgba(16, 185, 129, 0.8)']
                  : ['rgba(16, 185, 129, 0.8)', 'rgba(239, 68, 68, 0.8)'];
                const borders = isProfit
                  ? ['rgb(239, 68, 68)', 'rgb(16, 185, 129)']
                  : ['rgb(16, 185, 129)', 'rgb(239, 68, 68)'];
                return (
                  <div className="h-56">
                    <Doughnut
                    data={{
                      labels,
                      datasets: [
                        {
                          data,
                          backgroundColor: colors,
                          borderColor: borders,
                          borderWidth: 2,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom' },
                        title: {
                          display: true,
                          text: isProfit ? 'Income Breakdown (Cost vs Profit)' : 'P&L Breakdown (Income vs Loss)',
                        },
                      },
                    }}
                  />
                  </div>
                );
              })() : (
                <div className="h-64 flex items-center justify-center text-surface-500">
                  <p>No financial data available to display</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Per-Crop Profit Chart */}
      {dataLoading ? (
        <SkeletonChart />
      ) : (
        <div className="bg-surface-800/80 rounded-2xl shadow-sm border border-white/[0.06] p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Per-Crop Profit Analysis</h2>
          {filteredCrops.length > 0 ? (
            <div className="h-56">
              <Bar
              data={{
                labels: filteredCrops.map(c => `${c.name} - ${c.variety}`),
                datasets: [
                  {
                    label: 'Income',
                    data: filteredCrops.map(c => {
                      const income = (c.product && totals.revenueByProductId.get(c.product?.toString())) || 0;
                      return income;
                    }),
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderColor: 'rgb(16, 185, 129)',
                    borderWidth: 1,
                  },
                  {
                    label: 'Cost',
                    data: filteredCrops.map(c => Number(c.totalCost) || 0),
                    backgroundColor: 'rgba(239, 68, 68, 0.8)',
                    borderColor: 'rgb(239, 68, 68)',
                    borderWidth: 1,
                  },
                  {
                    label: 'Profit',
                    data: filteredCrops.map(c => {
                      const income = (c.product && totals.revenueByProductId.get(c.product?.toString())) || 0;
                      const cost = Number(c.totalCost) || 0;
                      return income - cost;
                    }),
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Income, Cost, and Profit by Crop',
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Amount ($)',
                    },
                  },
                },
              }}
            />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-surface-500">
              <p>No crop data available to display</p>
            </div>
          )}
        </div>
      )}

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dataLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <div className="bg-surface-800/80 rounded-2xl shadow-sm border border-white/[0.06] p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                {totals.netProfit >= 0 ? (
                  <TrendingUp className="w-8 h-8 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-8 h-8 text-red-400" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Profit Trend</h3>
              <p className={`text-2xl font-bold ${totals.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {totals.netProfit >= 0 ? '+' : ''}{totals.netProfit.toFixed(2)} $
              </p>
              <p className="text-sm text-surface-400">Net Profit</p>
            </div>

            <div className="bg-surface-800/80 rounded-2xl shadow-sm border border-white/[0.06] p-6 text-center">
              <div className="w-24 h-24 mx-auto mb-4 relative">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${(totals.actual / Math.max(totals.expected, 1)) * 251.2} 251.2`}
                    className="text-emerald-400"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-white">
                    {((totals.actual / Math.max(totals.expected, 1)) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Yield Achievement</h3>
              <p className="text-sm text-surface-400">Actual vs Expected</p>
            </div>

            <div className="bg-surface-800/80 rounded-2xl shadow-sm border border-white/[0.06] p-6 text-center">
              <div className="w-24 h-24 mx-auto mb-4 relative">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${(totals.totalIncome / Math.max(totals.totalCost, 1)) * 251.2} 251.2`}
                    className="text-sky-400"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-white">
                    {((totals.totalIncome / Math.max(totals.totalCost, 1)) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">ROI</h3>
              <p className="text-sm text-surface-400">Return on Investment</p>
            </div>
          </>
        )}
      </div>

      {/* Crop Details Table */}
      {dataLoading ? (
        <SkeletonTable />
      ) : (
        <div className="bg-surface-800/80 rounded-2xl shadow-sm border border-white/[0.06] p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Yield and Profit by Crop</h2>
          <div className="space-y-3">
            {filteredCrops.length === 0 ? (
              <div className="text-center py-8 text-surface-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 text-surface-400" />
                <p className="text-lg">No crops found</p>
                <p className="text-sm">Add some crops to see analytics data</p>
              </div>
            ) : (
              filteredCrops.map((c) => {
                const income = (c.product && totals.revenueByProductId.get(c.product?.toString())) || 0;
                const cost = Number(c.totalCost || 0);
                const profit = income - cost;
                return (
                  <div key={c._id} className="p-3 rounded-lg border border-white/[0.06] flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{c.name} - {c.variety}</p>
                      <p className="text-xs text-surface-500">Area: {c.area} {c.unit} • Unit: {c.yieldUnit}</p>
                    </div>
                    <div className="grid grid-cols-5 gap-6 text-sm">
                      <div>
                        <p className="text-surface-500">Expected</p>
                        <p className="font-semibold">{c.estimatedYield ?? '-'} {c.yieldUnit}</p>
                      </div>
                      <div>
                        <p className="text-surface-500">Predicted</p>
                        <p className="font-semibold">{c.predictedYield ?? '-'} {c.yieldUnit}</p>
                      </div>
                      <div>
                        <p className="text-surface-500">Actual</p>
                        <p className="font-semibold">{c.actualYield ?? '-'} {c.yieldUnit}</p>
                      </div>
                      <div>
                        <p className="text-surface-500">Income</p>
                        <p className="font-semibold">${income.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-surface-500">Profit</p>
                        <p className="font-semibold">${profit.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Environmental Insights */}

    </div>
  );
}