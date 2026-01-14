import React, { useState } from 'react';
import { Upload, Search, FileText, BarChart2, Activity, AlertTriangle, Globe, FileSearch, Users, Target } from 'lucide-react';
import { analyzeCompany, findTargets } from './services/geminiService';
import { CompanyAnalysis, AppState, SourcingCriteria, CandidateProfile } from './types';
import { Dashboard } from './components/Dashboard';
import { SourcingView } from './components/SourcingView';

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
  
  // Analysis State
  const [companyName, setCompanyName] = useState('');
  const [analysisData, setAnalysisData] = useState<CompanyAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [files, setFiles] = useState<string[]>([]);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [useAutoFetch, setUseAutoFetch] = useState<boolean>(false);

  // Sourcing State
  const [sourcingResults, setSourcingResults] = useState<CandidateProfile[] | null>(null);
  const [isSourcingLoading, setIsSourcingLoading] = useState(false);

  // --- Handlers ---

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((f: File) => f.name);
      setFiles([...files, ...newFiles]);
    }
  };

  const handleSourcingSearch = async (criteria: SourcingCriteria) => {
    setIsSourcingLoading(true);
    setSourcingResults(null);
    try {
      const results = await findTargets(criteria);
      setSourcingResults(results);
    } catch (e) {
      console.error(e);
      // Optional: Handle sourcing error UI
    } finally {
      setIsSourcingLoading(false);
    }
  };

  const handleAnalyzeCandidate = (name: string) => {
    setCompanyName(name);
    setUseAutoFetch(true); // Automatically fetch data for the selected candidate
    setAppState(AppState.ANALYZING);
    startAnalysis(name, true);
  };

  const startAnalysis = async (overrideName?: string, overrideFetch?: boolean) => {
    const targetName = overrideName || companyName;
    const shouldFetch = overrideFetch !== undefined ? overrideFetch : useAutoFetch;

    const hasFiles = files.length > 0;
    const hasName = targetName.trim().length > 0;

    if (!shouldFetch && !hasName && !hasFiles) return;
    if (shouldFetch && !hasName) return;

    setAppState(AppState.ANALYZING);
    setErrorMsg(null);

    const safeName = hasName ? targetName : "Target Company";

    const steps = shouldFetch ? [
      `Searching for "${safeName}" financial reports...`,
      "Identifying tech stack from job boards...",
      "Analyzing strategic fit...",
      "Calculating valuation metrics...",
      "Generating risk profile...",
      "Finalizing report..."
    ] : [
      "Ingesting documents...",
      "OCR and data extraction...",
      "Calculating financial ratios...",
      "Performing SWOT analysis...",
      "Cross-referencing market trends...",
      "Generating final report..."
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      setLoadingStep(steps[stepIndex]);
      stepIndex = (stepIndex + 1) % steps.length;
    }, 1500);

    try {
      const context = (!shouldFetch && files.length > 0)
        ? `Documents available: ${files.join(', ')}. Please simulate analysis.`
        : '';

      const result = await analyzeCompany(safeName, context, shouldFetch);
      
      clearInterval(interval);
      setAnalysisData(result);
      setAppState(AppState.DASHBOARD);
    } catch (err) {
      clearInterval(interval);
      setErrorMsg("Failed to analyze company. Please check your API key or try again.");
      setAppState(AppState.ERROR);
    }
  };

  const resetApp = () => {
    setAppState(AppState.UPLOAD);
    setCompanyName('');
    setFiles([]);
    setAnalysisData(null);
    setUseAutoFetch(false);
  };

  // --- Navigation Renderers ---

  const renderNav = () => (
    <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setAppState(AppState.UPLOAD)}>
        <div className="bg-indigo-600 p-2 rounded-lg">
          <BarChart2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-xl font-bold tracking-tight text-slate-900 block leading-none">Project Insight 2.0</span>
          <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">IT M&A Edition</span>
        </div>
      </div>
      
      {appState !== AppState.ANALYZING && appState !== AppState.DASHBOARD && (
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setAppState(AppState.UPLOAD)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${appState === AppState.UPLOAD ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Deep Analysis
          </button>
          <button 
             onClick={() => setAppState(AppState.SOURCING)}
             className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${appState === AppState.SOURCING ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Sourcing
          </button>
        </div>
      )}
    </nav>
  );

  // --- Main View Logic ---

  if (appState === AppState.DASHBOARD && analysisData) {
    return <Dashboard analysis={analysisData} onNewAnalysis={resetApp} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {renderNav()}

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        
        {/* VIEW: SOURCING */}
        {appState === AppState.SOURCING && (
          <SourcingView 
            onSearch={handleSourcingSearch} 
            isLoading={isSourcingLoading}
            results={sourcingResults}
            onSelectCandidate={handleAnalyzeCandidate}
          />
        )}

        {/* VIEW: UPLOAD / ANALYZE SINGLE */}
        {appState === AppState.UPLOAD && (
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="p-8 md:p-12">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-slate-900 mb-3">Company Analysis</h2>
                <p className="text-slate-500 text-lg">
                  {useAutoFetch 
                    ? "We'll search the web for the latest financial reports automatically." 
                    : "Upload financial reports and let AI uncover strategic insights."}
                </p>
              </div>

              <div className="space-y-6">
                
                {/* Mode Toggle inside Analysis View */}
                <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
                  <button 
                    onClick={() => setUseAutoFetch(false)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all
                      ${!useAutoFetch ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <Upload className="w-4 h-4" />
                    Upload Documents
                  </button>
                  <button 
                    onClick={() => setUseAutoFetch(true)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all
                      ${useAutoFetch ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <Globe className="w-4 h-4" />
                    Auto-Fetch Data
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Target Company</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                    <input 
                      type="text" 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g., Spotify, Volvo, Northvolt..."
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                  {useAutoFetch && (
                    <p className="text-xs text-indigo-600 mt-2 flex items-center gap-1">
                      <FileSearch className="w-3 h-3" />
                      AI will search for "Årsredovisning {new Date().getFullYear()-1}"
                    </p>
                  )}
                </div>

                {!useAutoFetch && (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Financial Documents (PDF)</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 bg-slate-50 text-center hover:bg-slate-100 transition-colors relative group">
                      <input 
                        type="file" 
                        multiple 
                        accept=".pdf"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Upload className="w-10 h-10 text-indigo-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                      <p className="text-slate-900 font-medium">Click to upload or drag and drop</p>
                      <p className="text-slate-500 text-sm mt-1">Annual Reports, 10-K, Investor Presentations</p>
                    </div>
                    {files.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {files.map((file, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-slate-600 bg-slate-100 px-3 py-2 rounded-md">
                            <FileText className="w-4 h-4 text-indigo-500" />
                            <span className="truncate">{file}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <button 
                  onClick={() => startAnalysis()}
                  disabled={(useAutoFetch && !companyName) || (!useAutoFetch && !companyName && files.length === 0)}
                  className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transform transition-all 
                    ${((useAutoFetch && companyName) || (!useAutoFetch && (companyName || files.length > 0)))
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white translate-y-0 hover:-translate-y-1' 
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                >
                  {useAutoFetch ? "Search & Analyze" : "Analyze Company"}
                </button>

              </div>
            </div>
            <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
              <span>Powered by Gemini 3</span>
              <span>Encrypted AES-256</span>
            </div>
          </div>
        )}

        {/* LOADING STATE */}
        {appState === AppState.ANALYZING && (
          <div className="text-center max-w-md w-full animate-in fade-in duration-700">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
              <Activity className="absolute inset-0 m-auto text-indigo-600 w-8 h-8 animate-pulse" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Processing Data</h2>
            <p className="text-slate-500 mb-6 h-6">{loadingStep}</p>
            
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div className="bg-indigo-600 h-2 rounded-full animate-progress-indeterminate"></div>
            </div>
            
            <style>{`
              @keyframes progress-indeterminate {
                0% { width: 0%; margin-left: 0%; }
                50% { width: 50%; margin-left: 25%; }
                100% { width: 100%; margin-left: 100%; }
              }
              .animate-progress-indeterminate {
                animation: progress-indeterminate 1.5s infinite ease-in-out;
              }
            `}</style>
          </div>
        )}

        {/* ERROR STATE */}
        {appState === AppState.ERROR && (
           <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-red-100 p-8 text-center">
             <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <AlertTriangle className="w-8 h-8 text-red-500" />
             </div>
             <h3 className="text-xl font-bold text-slate-900 mb-2">Analysis Failed</h3>
             <p className="text-slate-500 mb-6">{errorMsg || "An unexpected error occurred."}</p>
             <button 
               onClick={resetApp}
               className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors"
             >
               Try Again
             </button>
           </div>
        )}

      </main>
    </div>
  );
}

export default App;