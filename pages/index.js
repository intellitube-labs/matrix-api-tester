// pages/index.js
import { useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [pingStatus, setPingStatus] = useState('offline');
  const [responses, setResponses] = useState({
    ping: null,
    encodeSingle: null,
    encodeBatch: null,
    redeploy: null
  });
  const [loading, setLoading] = useState({
    ping: false,
    encodeSingle: false,
    encodeBatch: false,
    redeploy: false
  });

  const BASE_URL = 'https://the-matrix-server.onrender.com';
  const DEPLOY_URL = 'https://api.render.com/deploy';

  const updateLoading = (key, value) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  };

  const updateResponse = (key, value, isError = false) => {
    setResponses(prev => ({ 
      ...prev, 
      [key]: { data: value, isError, timestamp: new Date().toLocaleTimeString() }
    }));
  };

  const pingServer = async () => {
    updateLoading('ping', true);
    try {
      const response = await fetch(`${BASE_URL}/ping`);
      const data = await response.text();
      updateResponse('ping', data);
      setPingStatus('online');
    } catch (error) {
      updateResponse('ping', { error: error.message }, true);
      setPingStatus('offline');
    }
    updateLoading('ping', false);
  };

  const encodeSingle = async (event) => {
    event.preventDefault();
    updateLoading('encodeSingle', true);
    
    const formData = new FormData(event.target);
    const text = formData.get('text');
    const addSpecialTokens = formData.get('addSpecialTokens') === 'on';

    try {
      const response = await fetch(`${BASE_URL}/encode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          add_special_tokens: addSpecialTokens
        })
      });
      
      const data = await response.json();
      updateResponse('encodeSingle', data);
    } catch (error) {
      updateResponse('encodeSingle', { error: error.message }, true);
    }
    updateLoading('encodeSingle', false);
  };

  const encodeBatch = async (event) => {
    event.preventDefault();
    updateLoading('encodeBatch', true);
    
    const formData = new FormData(event.target);
    const textsInput = formData.get('texts');
    const texts = textsInput.split('\n').filter(text => text.trim() !== '');
    const addSpecialTokens = formData.get('addSpecialTokens') === 'on';

    try {
      const response = await fetch(`${BASE_URL}/encode-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texts: texts,
          add_special_tokens: addSpecialTokens
        })
      });
      
      const data = await response.json();
      updateResponse('encodeBatch', data);
    } catch (error) {
      updateResponse('encodeBatch', { error: error.message }, true);
    }
    updateLoading('encodeBatch', false);
  };

  const redeployService = async (event) => {
    event.preventDefault();
    updateLoading('redeploy', true);
    
    const formData = new FormData(event.target);
    const deployKey = formData.get('deployKey');

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (deployKey) {
        headers['Authorization'] = `Bearer ${deployKey}`;
      }

      const response = await fetch(DEPLOY_URL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({})
      });
      
      const data = await response.json();
      updateResponse('redeploy', data);
    } catch (error) {
      updateResponse('redeploy', { error: error.message }, true);
    }
    updateLoading('redeploy', false);
  };

  return (
    <>
      <Head>
        <title>Matrix API Tester</title>
        <meta name="description" content="Test Matrix Server API endpoints" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-green-400">
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              🔮 Matrix API Tester
            </h1>
            <p className="text-xl text-gray-300">Test your API endpoints with zero CORS issues</p>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            
            {/* Ping Card */}
            <div className="bg-black/30 backdrop-blur-sm border border-green-400/30 rounded-xl p-6 hover:border-green-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-400/20">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-3 h-3 rounded-full ${pingStatus === 'online' ? 'bg-green-400 shadow-lg shadow-green-400/50' : 'bg-red-500 shadow-lg shadow-red-500/50'}`}></div>
                <h3 className="text-xl font-semibold text-green-400">Ping Server</h3>
              </div>
              <div className="bg-black/50 p-3 rounded-lg mb-4 font-mono text-sm text-blue-400">
                GET /ping
              </div>
              <button
                onClick={pingServer}
                disabled={loading.ping}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-black font-semibold py-3 px-6 rounded-lg hover:from-green-400 hover:to-blue-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading.ping ? '🔄 Pinging...' : '📡 Ping Server'}
              </button>
              {responses.ping && (
                <ResponseDisplay response={responses.ping} />
              )}
            </div>

            {/* Single Encode Card */}
            <div className="bg-black/30 backdrop-blur-sm border border-green-400/30 rounded-xl p-6 hover:border-green-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-400/20">
              <h3 className="text-xl font-semibold text-green-400 mb-4">📝 Single Text Encode</h3>
              <div className="bg-black/50 p-3 rounded-lg mb-4 font-mono text-sm text-blue-400">
                POST /encode
              </div>
              <form onSubmit={encodeSingle} className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">Text to encode:</label>
                  <textarea
                    name="text"
                    defaultValue="This is a test text"
                    className="w-full p-3 bg-black/50 border border-gray-600 rounded-lg text-green-100 focus:border-green-400 focus:outline-none"
                    rows="3"
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" name="addSpecialTokens" className="w-4 h-4" />
                  <label className="text-gray-300">Add special tokens</label>
                </div>
                <button
                  type="submit"
                  disabled={loading.encodeSingle}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-black font-semibold py-3 px-6 rounded-lg hover:from-green-400 hover:to-blue-400 transition-all duration-300 disabled:opacity-50"
                >
                  {loading.encodeSingle ? '🔄 Encoding...' : '🚀 Encode Text'}
                </button>
              </form>
              {responses.encodeSingle && (
                <ResponseDisplay response={responses.encodeSingle} />
              )}
            </div>

            {/* Batch Encode Card */}
            <div className="bg-black/30 backdrop-blur-sm border border-green-400/30 rounded-xl p-6 hover:border-green-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-400/20">
              <h3 className="text-xl font-semibold text-green-400 mb-4">📚 Batch Text Encode</h3>
              <div className="bg-black/50 p-3 rounded-lg mb-4 font-mono text-sm text-blue-400">
                POST /encode-batch
              </div>
              <form onSubmit={encodeBatch} className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">Texts to encode (one per line):</label>
                  <textarea
                    name="texts"
                    defaultValue={`muri khan bhai\nosthirr hoitese mama\nAlhamdulillah!!!`}
                    className="w-full p-3 bg-black/50 border border-gray-600 rounded-lg text-green-100 focus:border-green-400 focus:outline-none"
                    rows="4"
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" name="addSpecialTokens" className="w-4 h-4" />
                  <label className="text-gray-300">Add special tokens</label>
                </div>
                <button
                  type="submit"
                  disabled={loading.encodeBatch}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-black font-semibold py-3 px-6 rounded-lg hover:from-green-400 hover:to-blue-400 transition-all duration-300 disabled:opacity-50"
                >
                  {loading.encodeBatch ? '🔄 Processing...' : '⚡ Encode Batch'}
                </button>
              </form>
              {responses.encodeBatch && (
                <ResponseDisplay response={responses.encodeBatch} />
              )}
            </div>

            {/* Redeploy Card */}
            <div className="bg-black/30 backdrop-blur-sm border border-green-400/30 rounded-xl p-6 hover:border-green-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-400/20">
              <h3 className="text-xl font-semibold text-green-400 mb-4">🚀 Redeploy Service</h3>
              <div className="bg-black/50 p-3 rounded-lg mb-4 font-mono text-sm text-blue-400">
                POST api.render.com/deploy
              </div>
              <form onSubmit={redeployService} className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">Deploy Key (optional):</label>
                  <input
                    type="password"
                    name="deployKey"
                    placeholder="Enter deploy key if required..."
                    className="w-full p-3 bg-black/50 border border-gray-600 rounded-lg text-green-100 focus:border-green-400 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading.redeploy}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-black font-semibold py-3 px-6 rounded-lg hover:from-green-400 hover:to-blue-400 transition-all duration-300 disabled:opacity-50"
                >
                  {loading.redeploy ? '🔄 Deploying...' : '🎯 Redeploy Service'}
                </button>
              </form>
              {responses.redeploy && (
                <ResponseDisplay response={responses.redeploy} />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Response Display Component
function ResponseDisplay({ response }) {
  return (
    <div className={`mt-6 p-4 rounded-lg ${response.isError ? 'bg-red-900/30 border border-red-500/50' : 'bg-green-900/30 border border-green-500/50'}`}>
      <div className="flex justify-between items-center mb-2">
        <h4 className={`font-semibold ${response.isError ? 'text-red-400' : 'text-green-400'}`}>
          {response.isError ? '❌ Error Response' : '✅ Success Response'}
        </h4>
        <span className="text-xs text-gray-400">{response.timestamp}</span>
      </div>
      <pre className="bg-black/70 p-3 rounded text-xs overflow-x-auto text-gray-300 whitespace-pre-wrap">
        {typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2)}
      </pre>
    </div>
  );
}