'use client';

import { useState, useEffect, useRef } from 'react';
import { protectAndScore, checkTaskResult, checkTaskStatus } from '@/lib/dataprotector';

const ARBITRUM_SEPOLIA_PARAMS = {
  chainId: '0x66eee',
  chainName: 'Arbitrum Sepolia',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: ['https://arbitrum-sepolia.infura.io/v3/50180baf3ab04100ac923441ffc02078'],
  blockExplorerUrls: ['https://sepolia.arbiscan.io/']
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [connected, setConnected] = useState(false);
  const [provider, setProvider] = useState<any>(null);
  const [status, setStatus] = useState<string>('');
  const [taskInfo, setTaskInfo] = useState<any>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const switchToArbitrumSepolia = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x66eee' }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [ARBITRUM_SEPOLIA_PARAMS],
        });
      } else {
        throw error;
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask!');
      return;
    }

    try {
      const { ethers } = await import('ethers');
      await switchToArbitrumSepolia();
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      setProvider(provider);
      setConnected(true);
    } catch (error: any) {
      alert(`Connection failed: ${error.message}`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const pollTaskStatus = async (taskId: string) => {
    if (!provider) return;
    
    try {
      const taskStatus = await checkTaskStatus(taskId, provider);
      
      setStatus(`Task status: ${taskStatus.statusName}`);
      console.log('Task status:', taskStatus.statusName);
      
      if (taskStatus.status === 2 || taskStatus.statusName === 'COMPLETED') {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        
        setStatus('Task completed! Fetching result...');
        const scoreResult = await checkTaskResult(taskId, provider, setStatus);
        setResult(scoreResult);
        setLoading(false);
      } else if (taskStatus.status === 3 || taskStatus.statusName === 'FAILED' || taskStatus.isTimedOut) {
        setStatus(`Task ${taskStatus.statusName.toLowerCase()}. Please try again.`);
        setLoading(false);
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      }
    } catch (error) {
      console.error('Error polling task:', error);
    }
  };

  const handleSubmit = async () => {
    if (!file || !provider) return;
    
    setLoading(true);
    setResult(null);
    setStatus('Starting...');
    setTaskInfo(null);
    
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    try {
      await switchToArbitrumSepolia();
      
      const taskData = await protectAndScore(file, provider, setStatus);
      setTaskInfo(taskData);
      
      pollIntervalRef.current = setInterval(() => {
        pollTaskStatus(taskData.taskId);
      }, 15000); 
      
    } catch (error: any) {
      alert(`Error: ${error.message}`);
      console.error(error);
      setLoading(false);
      setStatus(`Error: ${error.message}`);
      
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            PrivaScore
          </h1>
          <p className="text-xl text-gray-600 mb-2">Privacy-Preserving Credit Scoring for DeFi</p>
          <p className="text-sm text-gray-500">Powered by iExec Trusted Execution Environment</p>
        </div>

        {!connected ? (
          <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
            <div className="mb-6">
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-3xl font-semibold mb-4">Connect Your Wallet</h2>
              <p className="text-gray-600 mb-8">
                Your financial data stays private. Only you control access.
              </p>
            </div>
            <button
              onClick={connectWallet}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-12 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all transform hover:scale-105"
            >
              Connect MetaMask
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Upload Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-semibold mb-6">Upload Financial Data</h2>
              
              <div className="border-2 border-dashed border-indigo-300 rounded-xl p-12 text-center mb-6 hover:border-indigo-500 transition-colors bg-indigo-50/50">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="text-gray-600">
                    {file ? (
                      <div>
                        <div className="text-4xl mb-2">✅</div>
                        <p className="text-green-600 font-medium text-lg">{file.name}</p>
                        <p className="text-sm text-gray-500 mt-1">Click to change file</p>
                      </div>
                    ) : (
                      <div>
                        <div className="text-5xl mb-3">📄</div>
                        <p className="font-medium text-lg mb-1">Click to upload bank statement</p>
                        <p className="text-sm text-gray-500">CSV format (date, amount, description)</p>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!file || loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transform hover:scale-[1.02]"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing in TEE...
                  </span>
                ) : (
                  '🔒 Get Credit Score'
                )}
              </button>

              {status && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-700 font-medium">📊 {status}</p>
                  {taskInfo && (
                    <div className="mt-3 text-sm text-gray-600 space-y-1">
                      <p>Task ID: <span className="font-mono">{taskInfo.taskId.slice(0, 16)}...</span></p>
                      <p>Protected Data: <span className="font-mono">{taskInfo.protectedData.slice(0, 16)}...</span></p>
                      <a 
                        href={`https://explorer.iex.ec/bellecour/task/${taskInfo.taskId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline inline-block mt-2"
                      >
                        View on iExec Explorer →
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Result Section */}
            {result && !result.error && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-xl p-8 border-2 border-green-200">
                <h3 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="text-4xl mr-3">🎯</span>
                  Your Confidential Credit Score
                </h3>
                
                {/* Score Display */}
                <div className="flex items-center justify-between mb-8 bg-white rounded-xl p-6 shadow-md">
                  <div>
                    <p className="text-7xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {result.score}
                    </p>
                    <p className="text-gray-600 mt-2 text-lg">Out of 850</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-6 py-3 rounded-full font-bold text-lg ${
                      result.tier === 'EXCELLENT' ? 'bg-green-200 text-green-800' :
                      result.tier === 'GOOD' ? 'bg-blue-200 text-blue-800' :
                      result.tier === 'FAIR' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-red-200 text-red-800'
                    }`}>
                      {result.tier}
                    </span>
                  </div>
                </div>

                {/* Score Breakdown */}
                {result.factors && (
                  <div className="bg-white rounded-xl p-6 mb-6 shadow-md">
                    <h4 className="font-semibold text-lg mb-4">Score Breakdown</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-600">Payment Consistency</span>
                          <span className="text-sm font-medium">{result.factors.consistency.toFixed(1)}/40</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{width: `${(result.factors.consistency/40)*100}%`}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-600">Income Stability</span>
                          <span className="text-sm font-medium">{result.factors.stability.toFixed(1)}/30</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{width: `${(result.factors.stability/30)*100}%`}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-600">Debt Management</span>
                          <span className="text-sm font-medium">{result.factors.debt_score.toFixed(1)}/30</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{width: `${(result.factors.debt_score/30)*100}%`}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Privacy Notice */}
                <div className="bg-indigo-900 text-white p-6 rounded-xl shadow-md">
                  <div className="flex items-start">
                    <span className="text-3xl mr-4">🔒</span>
                    <div>
                      <h4 className="font-bold text-lg mb-2">Your Data Remains Private</h4>
                      <p className="text-indigo-100 text-sm leading-relaxed">
                        Your raw financial data was processed inside a Trusted Execution Environment (TEE) 
                        and never left the secure enclave. Only the credit score hash exists on-chain. 
                        Not even we can access your original data.
                      </p>
                      {result.processed_in_tee && (
                        <p className="text-green-300 text-sm mt-2 font-medium">
                          ✅ Verified TEE Processing
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* How It Works */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-semibold mb-6">How PrivaScore Works</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                  <div className="text-4xl mb-3">🔒</div>
                  <h4 className="font-semibold mb-2">1. Data Encryption</h4>
                  <p className="text-sm text-gray-600">Your financial data is encrypted before upload</p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                  <div className="text-4xl mb-3">⚡</div>
                  <h4 className="font-semibold mb-2">2. TEE Processing</h4>
                  <p className="text-sm text-gray-600">Secure computation in isolated environment</p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                  <div className="text-4xl mb-3">✅</div>
                  <h4 className="font-semibold mb-2">3. Verifiable Result</h4>
                  <p className="text-sm text-gray-600">Only score published on-chain, data stays private</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}