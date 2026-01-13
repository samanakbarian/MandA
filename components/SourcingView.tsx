import React, { useState } from 'react';
import { SourcingCriteria, CandidateProfile } from '../types';
import { Search, MapPin, Database, TrendingUp, Cpu, ChevronRight, Target } from 'lucide-react';

interface SourcingViewProps {
  onSearch: (criteria: SourcingCriteria) => void;
  isLoading: boolean;
  results: CandidateProfile[] | null;
  onSelectCandidate: (candidateName: string) => void;
}

export const SourcingView: React.FC<SourcingViewProps> = ({ onSearch, isLoading, results, onSelectCandidate }) => {
  const [criteria, setCriteria] = useState<SourcingCriteria>({
    region: 'Sweden',
    industry: 'SaaS Fintech',
    revenueRange: '20-100 MSEK',
    techStack: 'Python, AWS, AI'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(criteria);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Sourcing Form */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
           <div className="flex items-center gap-3 mb-2">
             <div className="bg-indigo-600 p-2 rounded-lg">
               <Target className="w-5 h-5 text-white" />
             </div>
             <h2 className="text-2xl font-bold text-slate-900">Automated Sourcing</h2>
           </div>
           <p className="text-slate-500 ml-12">Define your acquisition strategy. AI will scour the web for matching targets.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Geography</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                <input 
                  type="text" 
                  value={criteria.region}
                  onChange={(e) => setCriteria({...criteria, region: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Nordics, Germany, Stockholm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Industry / Niche</label>
              <div className="relative">
                <Database className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                <input 
                  type="text" 
                  value={criteria.industry}
                  onChange={(e) => setCriteria({...criteria, industry: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. B2B SaaS, Cybersecurity, EdTech"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Revenue Range (Est.)</label>
              <div className="relative">
                <TrendingUp className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                <input 
                  type="text" 
                  value={criteria.revenueRange}
                  onChange={(e) => setCriteria({...criteria, revenueRange: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. 20-50 MSEK"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Tech Stack Requirements</label>
              <div className="relative">
                <Cpu className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                <input 
                  type="text" 
                  value={criteria.techStack}
                  onChange={(e) => setCriteria({...criteria, techStack: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Python, Azure, Kubernetes"
                />
              </div>
            </div>

          </div>

          <div className="mt-8">
            <button 
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-md transform transition-all flex items-center justify-center gap-2
                ${isLoading ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 hover:bg-slate-800 text-white hover:-translate-y-1'}`}
            >
              {isLoading ? (
                <>Searching Market...</>
              ) : (
                <>
                  <Search className="w-5 h-5" /> Find Targets
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results Grid */}
      {results && results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900 px-1">Top Candidates</h3>
          <div className="grid grid-cols-1 gap-4">
            {results.map((company) => (
              <div key={company.id} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  
                  {/* Company Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-xl font-bold text-slate-900">{company.name}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold 
                        ${company.matchScore > 85 ? 'bg-green-100 text-green-700' : 
                          company.matchScore > 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-600'}`}>
                        {company.matchScore}% Match
                      </span>
                    </div>
                    <p className="text-slate-600 mb-3 text-sm leading-relaxed">{company.shortDescription}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {company.techStackTags.map((tag, i) => (
                        <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded border border-slate-200 flex items-center gap-1">
                          <Cpu className="w-3 h-3" /> {tag}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {company.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Est. Rev: {company.estimatedRevenue}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Insights */}
                  <div className="md:w-64 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-100 md:pl-6 pt-4 md:pt-0">
                     <div>
                       <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Growth Signal</p>
                       <p className="text-xs text-indigo-600 font-medium bg-indigo-50 p-2 rounded mb-3">
                         {company.growthSignals}
                       </p>
                       <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Why it fits</p>
                       <p className="text-xs text-slate-600 italic mb-4">"{company.matchRationale}"</p>
                     </div>
                     
                     <button 
                       onClick={() => onSelectCandidate(company.name)}
                       className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
                     >
                       Deep Analysis <ChevronRight className="w-4 h-4" />
                     </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
