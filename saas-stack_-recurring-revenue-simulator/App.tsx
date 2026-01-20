
import React, { useState, useMemo, useEffect } from 'react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  TrendingUp, Users, DollarSign, ArrowUpRight, BrainCircuit, RefreshCw, BarChart3, Info, Rocket, Building2
} from 'lucide-react';
import { SimulationData, SimulationParams, AIAnalysis } from './types';
import SliderInput from './components/SliderInput';
import MetricsCard from './components/MetricsCard';
import { analyzeSimulation } from './services/geminiService';

const App: React.FC = () => {
  const [params, setParams] = useState<SimulationParams>({
    startingCustomers: 1,
    monthlyNewCustomers: 2,
    arpu: 20,
    churnRate: 3,
    months: 24,
    oneTimeSalePrice: 150
  });

  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const simulationResults = useMemo(() => {
    const data: SimulationData[] = [];
    let currentCustomers = params.startingCustomers;
    let cumulativeRevenue = 0;
    let cumulativeOneTime = 0;

    for (let m = 0; m <= params.months; m++) {
      const mrr = currentCustomers * params.arpu;
      
      const oneTimeRevenue = (m === 0 ? params.startingCustomers : params.monthlyNewCustomers) * params.oneTimeSalePrice;
      cumulativeOneTime += oneTimeRevenue;
      
      data.push({
        month: m,
        newCustomers: m === 0 ? params.startingCustomers : params.monthlyNewCustomers,
        totalCustomers: Math.round(currentCustomers * 10) / 10,
        churnedCustomers: Math.round(currentCustomers * (params.churnRate / 100) * 10) / 10,
        mrr: Math.round(mrr),
        cumulativeRevenue: Math.round(cumulativeRevenue + mrr),
        oneTimeComparison: Math.round(cumulativeOneTime)
      });

      cumulativeRevenue += mrr;
      const churnCount = currentCustomers * (params.churnRate / 100);
      currentCustomers = Math.max(0, currentCustomers - churnCount + params.monthlyNewCustomers);
    }
    return data;
  }, [params]);

  const finalMetrics = useMemo(() => {
    const last = simulationResults[simulationResults.length - 1];
    return {
      mrr: last.mrr,
      arr: last.mrr * 12,
      totalCustomers: last.totalCustomers,
      totalRevenue: last.cumulativeRevenue,
      ltv: params.churnRate > 0 ? (params.arpu / (params.churnRate / 100)) : Infinity
    };
  }, [simulationResults, params]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const analysis = await analyzeSimulation(params, finalMetrics.mrr, finalMetrics.totalRevenue);
    setAiAnalysis(analysis);
    setIsAnalyzing(false);
  };

  const applyScenario = (type: 'solo' | 'startup') => {
    if (type === 'solo') {
      setParams({
        startingCustomers: 1,
        monthlyNewCustomers: 1,
        arpu: 10,
        churnRate: 2,
        months: 24,
        oneTimeSalePrice: 50
      });
    } else {
      setParams({
        startingCustomers: 50,
        monthlyNewCustomers: 15,
        arpu: 99,
        churnRate: 5,
        months: 24,
        oneTimeSalePrice: 500
      });
    }
  };

  useEffect(() => {
    if (aiAnalysis) setAiAnalysis(null);
  }, [params.churnRate, params.arpu, params.monthlyNewCustomers, params.startingCustomers]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-slate-900 text-white p-6 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-500/20">
              <RefreshCw className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                SaaS Stack
              </h1>
              <p className="text-slate-400 text-sm font-medium">The Beginner's Guide to Recurring Revenue</p>
            </div>
          </div>
          <div className="flex gap-3 bg-slate-800 p-1.5 rounded-2xl border border-slate-700">
            <button 
              onClick={() => applyScenario('solo')}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${params.startingCustomers <= 5 ? 'bg-indigo-600 text-white shadow-lg' : 'bg-transparent text-slate-400 hover:text-white'}`}
            >
              <Rocket className="w-4 h-4" /> Solo-preneur
            </button>
            <button 
              onClick={() => applyScenario('startup')}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${params.startingCustomers > 5 ? 'bg-indigo-600 text-white shadow-lg' : 'bg-transparent text-slate-400 hover:text-white'}`}
            >
              <Building2 className="w-4 h-4" /> Growth Startup
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-3 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 sticky top-8">
            <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <BarChart3 className="w-6 h-6 text-indigo-600" />
              </div>
              Simulate
            </h2>
            
            <SliderInput 
              label="Starting Customers" 
              value={params.startingCustomers} 
              min={0} max={100} step={1} 
              onChange={(v) => setParams(p => ({...p, startingCustomers: v}))} 
            />
            
            <SliderInput 
              label="New Customers / Month" 
              value={params.monthlyNewCustomers} 
              min={0} max={50} step={1} 
              onChange={(v) => setParams(p => ({...p, monthlyNewCustomers: v}))} 
            />
            
            <SliderInput 
              label="Monthly Subscription" 
              value={params.arpu} 
              min={1} max={200} step={1} 
              unit="$"
              onChange={(v) => setParams(p => ({...p, arpu: v}))} 
            />
            
            <SliderInput 
              label="Churn (Monthly %)" 
              value={params.churnRate} 
              min={0} max={15} step={0.1} 
              unit="%"
              onChange={(v) => setParams(p => ({...p, churnRate: v}))} 
            />

            <SliderInput 
              label="Duration (Months)" 
              value={params.months} 
              min={6} max={48} step={6} 
              onChange={(v) => setParams(p => ({...p, months: v}))} 
            />

            <div className="pt-8 mt-4 border-t border-slate-100">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-6">Traditional Sale Comparison</label>
               <SliderInput 
                label="One-Time Product Price" 
                value={params.oneTimeSalePrice} 
                min={10} max={1000} step={10} 
                unit="$"
                onChange={(v) => setParams(p => ({...p, oneTimeSalePrice: v}))} 
              />
            </div>

            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-black py-4 px-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
            >
              <BrainCircuit className="w-5 h-5" />
              {isAnalyzing ? 'Thinking...' : 'AI Breakdown'}
            </button>
          </div>
        </aside>

        <section className="lg:col-span-9 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricsCard 
              label="Next Month's Income" 
              value={`$${finalMetrics.mrr.toLocaleString()}`}
              icon={<TrendingUp className="w-6 h-6" />}
              trend={`Yearly: $${finalMetrics.arr.toLocaleString()}`}
              trendPositive={true}
            />
            <MetricsCard 
              label="Total Customers" 
              value={finalMetrics.totalCustomers.toString()}
              icon={<Users className="w-6 h-6" />}
              trend={`Growth: +${params.monthlyNewCustomers}/mo`}
              trendPositive={true}
            />
            <MetricsCard 
              label="Value of 1 Customer" 
              value={finalMetrics.ltv === Infinity ? "Infinite" : `$${Math.round(finalMetrics.ltv).toLocaleString()}`}
              icon={<ArrowUpRight className="w-6 h-6" />}
              trend="Expected lifetime spend"
              trendPositive={params.churnRate < 5}
            />
            <MetricsCard 
              label="Total Cash Earned" 
              value={`$${finalMetrics.totalRevenue.toLocaleString()}`}
              icon={<DollarSign className="w-6 h-6" />}
              trend="Compounded total revenue"
              trendPositive={true}
            />
          </div>

          {aiAnalysis && (
            <div className="bg-white border-2 border-indigo-500/20 p-8 rounded-[2rem] shadow-2xl shadow-indigo-500/5 animate-in fade-in slide-in-from-top-6 duration-1000">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-indigo-600 rounded-2xl">
                  <BrainCircuit className="text-white w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 leading-tight">{aiAnalysis.headline}</h2>
                  <p className="text-sm font-bold text-indigo-600">Expert Insights</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  {aiAnalysis.insights.map((insight, idx) => (
                    <div key={idx} className="flex gap-4 items-start bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-colors">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-black">{idx+1}</div>
                      <p className="text-slate-700 text-sm font-medium leading-relaxed">{insight}</p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col justify-center bg-indigo-600 p-8 rounded-3xl text-white shadow-xl shadow-indigo-500/20">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-1 w-8 bg-indigo-300 rounded-full"></div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-100">The Verdict</p>
                  </div>
                  <p className="text-2xl font-black italic leading-tight">"{aiAnalysis.verdict}"</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
              The "Stacking" Effect (Monthly Income)
              <div className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-black rounded-full uppercase">Visual Momentum</div>
            </h3>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={simulationResults}>
                  <defs>
                    <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="month" 
                    label={{ value: 'Months of Growth', position: 'insideBottom', offset: -10, className: 'text-[10px] font-bold fill-slate-400' }} 
                    axisLine={false}
                    tickLine={false}
                    tick={{fontSize: 12, fontWeight: 700, fill: '#64748b'}}
                  />
                  <YAxis 
                    tickFormatter={(val) => `$${val}`} 
                    axisLine={false}
                    tickLine={false}
                    tick={{fontSize: 12, fontWeight: 700, fill: '#64748b'}}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                    labelStyle={{ fontWeight: 900, color: '#1e293b', marginBottom: '4px' }}
                    itemStyle={{ fontWeight: 700, color: '#4f46e5' }}
                    formatter={(value: number) => [`$${value}`, 'Monthly Cash Flow']}
                  />
                  <Area 
                    type="stepAfter" 
                    dataKey="mrr" 
                    stroke="#4f46e5" 
                    strokeWidth={5}
                    fillOpacity={1} 
                    fill="url(#colorMrr)" 
                    animationDuration={2500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
                Total Cash Flow Comparison
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={simulationResults}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                    <YAxis 
                      tickFormatter={(val) => `$${val}`} 
                      axisLine={false} 
                      tickLine={false}
                      tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}}
                    />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                    <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px', fontSize: '12px', fontWeight: 'bold' }} />
                    <Line 
                      name="Subscription Plan"
                      type="monotone" 
                      dataKey="cumulativeRevenue" 
                      stroke="#4f46e5" 
                      strokeWidth={4}
                      dot={false}
                    />
                    <Line 
                      name="Selling Once"
                      type="monotone" 
                      dataKey="oneTimeComparison" 
                      stroke="#cbd5e1" 
                      strokeDasharray="8 8"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Users className="w-5 h-5 text-indigo-600" />
                </div>
                Community Growth
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={simulationResults}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                    <Area 
                      type="stepAfter" 
                      dataKey="totalCustomers" 
                      stroke="#10b981" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorUsers)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-8 flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-slate-500 uppercase">Monthly Churn</span>
                </div>
                <span className="text-sm font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-lg">{params.churnRate}%</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-white border-2 border-indigo-100 p-10 rounded-[2.5rem] shadow-sm">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <Info className="w-7 h-7 text-indigo-600" />
                The Core Lesson
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <p className="text-xs font-black text-rose-500 uppercase mb-3">One-Time Trap</p>
                  <p className="text-slate-700 font-medium leading-relaxed">
                    Imagine selling a $5 coffee. Every day you start at $0. You have to convince someone new to buy just to eat. That's a <span className="text-rose-600 font-bold">treadmill</span>.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <p className="text-xs font-black text-indigo-600 uppercase mb-3">Subscription Edge</p>
                  <p className="text-slate-700 font-medium leading-relaxed">
                    Imagine a $5 "Daily Coffee Club." Every day you start with money <span className="text-indigo-600 font-bold">already in the bank</span>. Every new sale adds on top. That's an <span className="text-indigo-600 font-bold">escalator</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 py-12 text-center">
        <div className="flex justify-center gap-4 mb-4">
           <div className="h-1 w-12 bg-indigo-600 rounded-full"></div>
           <div className="h-1 w-12 bg-emerald-600 rounded-full"></div>
           <div className="h-1 w-12 bg-indigo-600 rounded-full"></div>
        </div>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Compounding Labs &bull; 2024</p>
      </footer>
    </div>
  );
};

export default App;
