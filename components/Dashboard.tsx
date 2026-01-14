import React from 'react';
import { CompanyAnalysis, RiskFactor, SWOTItem } from '../types';
import { FinancialCharts } from './FinancialCharts';
import { 
  TrendingUp, 
  AlertTriangle, 
  Shield, 
  FileText, 
  ArrowUpRight, 
  DollarSign, 
  Activity,
  Briefcase,
  ExternalLink,
  Globe
} from 'lucide-react';

interface DashboardProps {
  analysis: CompanyAnalysis;
  onNewAnalysis: () => void;
}

const KPICard = ({ title, value, subtext, icon: Icon }: { title: string, value: string, subtext: string, icon: any }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900 mb-1">{value}</h3>
      <p className="text-xs text-slate-400">{subtext}</p>
    </div>
    <div className="p-3 bg-blue-50 rounded-lg">
      <Icon className="w-5 h-5 text-blue-600" />
    </div>
  </div>
);

const RiskBadge = ({ level }: { level: string }) => {
  const colors = {
    Low: 'bg-green-100 text-green-700',
    Medium: 'bg-yellow-100 text-yellow-700',
    High: 'bg-red-100 text-red-700',
  };
  const colorClass = colors[level as keyof typeof colors] || colors.Medium;
  
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${colorClass}`}>
      {level}
    </span>
  );
};

// Helper to safely extract hostname for display
const getHostname = (url: string) => {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch (e) {
    return 'Source';
  }
};

export const Dashboard: React.FC<DashboardProps> = ({ analysis, onNewAnalysis }) => {
  const latestMetric = analysis.metrics[analysis.metrics.length - 1];

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Project Insight</h1>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-sm text-slate-500 hidden sm:block">Analysis generated: {analysis.lastUpdated}</span>
            <button 
              onClick={onNewAnalysis}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors"
            >
              New Analysis
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Title Section */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold text-slate-900">{analysis.companyName}</h2>
              {analysis.website && (
                <a 
                  href={analysis.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full hover:bg-indigo-100 transition-colors text-sm font-medium group"
                >
                  <Globe className="w-3.5 h-3.5" />
                  Visit Website
                  <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                </a>
              )}
            </div>
            <p className="text-slate-500 mt-2">Comprehensive financial assessment and strategic outlook.</p>
          </div>
        </div>

        {/* Executive Summary & Sources */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-slate-900">Executive Summary</h3>
          </div>
          <p className="text-slate-700 leading-relaxed text-justify mb-4">
            {analysis.executiveSummary}
          </p>
          
          {/* Sourced Data Links */}
          {analysis.sources && analysis.sources.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Data Sources</p>
              <div className="flex flex-wrap gap-2">
                {analysis.sources.slice(0, 5).map((source, idx) => (
                  <a 
                    key={idx}
                    href={source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 text-xs rounded-full border border-slate-200 hover:border-indigo-200 transition-all"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span className="truncate max-w-[200px] font-medium">{getHostname(source)}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard 
            title="Revenue (LTM)" 
            value={`$${latestMetric.revenue}M`} 
            subtext={`CAGR (3y): ${analysis.cagr}%`}
            icon={DollarSign}
          />
          <KPICard 
            title="EBITDA" 
            value={`$${latestMetric.ebitda}M`} 
            subtext={`Margin: ${((latestMetric.ebitda / latestMetric.revenue) * 100).toFixed(1)}%`}
            icon={TrendingUp}
          />
           <KPICard 
            title="Net Income" 
            value={`$${latestMetric.netIncome}M`} 
            subtext="Bottom line performance"
            icon={Briefcase}
          />
          <KPICard 
            title="Risk Profile" 
            value={analysis.risks.some(r => r.riskLevel === 'High') ? 'High Attention' : 'Moderate'} 
            subtext="Based on ESG & Market factors"
            icon={Shield}
          />
        </div>

        {/* Charts */}
        <FinancialCharts data={analysis.metrics} />

        {/* Two Column Layout: SWOT & Risks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* SWOT Analysis */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-bold text-slate-900">SWOT Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100">
                <h4 className="font-semibold text-emerald-800 mb-3 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span> Strengths
                </h4>
                <ul className="space-y-2">
                  {analysis.swot.filter(i => i.type === 'strength').map(item => (
                    <li key={item.id} className="text-sm text-emerald-900 flex items-start gap-2">
                      <span className="mt-1">•</span> {item.content}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="bg-orange-50 p-5 rounded-xl border border-orange-100">
                <h4 className="font-semibold text-orange-800 mb-3 flex items-center">
                   <span className="w-2 h-2 rounded-full bg-orange-500 mr-2"></span> Weaknesses
                </h4>
                <ul className="space-y-2">
                  {analysis.swot.filter(i => i.type === 'weakness').map(item => (
                    <li key={item.id} className="text-sm text-orange-900 flex items-start gap-2">
                      <span className="mt-1">•</span> {item.content}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Opportunities */}
              <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                   <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span> Opportunities
                </h4>
                <ul className="space-y-2">
                  {analysis.swot.filter(i => i.type === 'opportunity').map(item => (
                    <li key={item.id} className="text-sm text-blue-900 flex items-start gap-2">
                       <span className="mt-1">•</span> {item.content}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Threats */}
              <div className="bg-rose-50 p-5 rounded-xl border border-rose-100">
                <h4 className="font-semibold text-rose-800 mb-3 flex items-center">
                   <span className="w-2 h-2 rounded-full bg-rose-500 mr-2"></span> Threats
                </h4>
                <ul className="space-y-2">
                  {analysis.swot.filter(i => i.type === 'threat').map(item => (
                    <li key={item.id} className="text-sm text-rose-900 flex items-start gap-2">
                       <span className="mt-1">•</span> {item.content}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Risk Factors */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Key Risks</h3>
            <div className="space-y-4">
              {analysis.risks.map((risk, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">{risk.category}</span>
                    <RiskBadge level={risk.riskLevel} />
                  </div>
                  <p className="text-sm text-slate-700">{risk.description}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};