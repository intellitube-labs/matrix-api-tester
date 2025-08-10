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
  const [benchmarks, setBenchmarks] = useState({
    ping: null,
    encodeSingle: null,
    encodeBatch: null,
    redeploy: null
  });

  const updateLoading = (key, value) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  };

  const updateResponse = (key, value, isError = false, benchmark = null) => {
    setResponses(prev => ({ 
      ...prev, 
      [key]: { data: value, isError, timestamp: new Date().toLocaleTimeString() }
    }));
    if (benchmark) {
      setBenchmarks(prev => ({ ...prev, [key]: benchmark }));
    }
  };

  const calculateBenchmark = (startTime, requestSize = 0, responseSize = 0, requestType = 'GET') => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    return {
      duration: Math.round(duration),
      requestType,
      requestSize: requestSize,
      responseSize: responseSize,
      throughput: responseSize > 0 ? Math.round((responseSize / duration) * 1000) : 0, // bytes per second
      timestamp: new Date().toISOString(),
      status: duration < 1000 ? 'fast' : duration < 3000 ? 'medium' : 'slow'
    };
  };

  const pingServer = async () => {
    updateLoading('ping', true);
    const startTime = performance.now();
    
    try {
      const response = await fetch('/api/ping');
      const result = await response.json();
      
      const responseText = JSON.stringify(result);
      const benchmark = calculateBenchmark(startTime, 0, responseText.length, 'GET');
      
      if (result.success) {
        updateResponse('ping', result.data, false, benchmark);
        setPingStatus('online');
      } else {
        updateResponse('ping', result, true, benchmark);
        setPingStatus('offline');
      }
    } catch (error) {
      const benchmark = calculateBenchmark(startTime, 0, 0, 'GET');
      updateResponse('ping', { error: error.message }, true, benchmark);
      setPingStatus('offline');
    }
    updateLoading('ping', false);
  };

  const encodeSingle = async (event) => {
    event.preventDefault();
    updateLoading('encodeSingle', true);
    const startTime = performance.now();
    
    const formData = new FormData(event.target);
    const text = formData.get('text');
    const addSpecialTokens = formData.get('addSpecialTokens') === 'on';

    const requestPayload = JSON.stringify({
      text: text,
      add_special_tokens: addSpecialTokens
    });

    try {
      const response = await fetch('/api/encode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: requestPayload
      });
      
      const result = await response.json();
      const responseText = JSON.stringify(result);
      const benchmark = calculateBenchmark(startTime, requestPayload.length, responseText.length, 'POST');
      
      if (result.success) {
        updateResponse('encodeSingle', result.data, false, benchmark);
      } else {
        updateResponse('encodeSingle', result, true, benchmark);
      }
    } catch (error) {
      const benchmark = calculateBenchmark(startTime, requestPayload.length, 0, 'POST');
      updateResponse('encodeSingle', { error: error.message }, true, benchmark);
    }
    updateLoading('encodeSingle', false);
  };

  const encodeBatch = async (event) => {
    event.preventDefault();
    updateLoading('encodeBatch', true);
    const startTime = performance.now();
    
    const formData = new FormData(event.target);
    const textsInput = formData.get('texts');
    const texts = textsInput.split('\n').filter(text => text.trim() !== '');
    const addSpecialTokens = formData.get('addSpecialTokens') === 'on';

    const requestPayload = JSON.stringify({
      texts: texts,
      add_special_tokens: addSpecialTokens
    });

    try {
      const response = await fetch('/api/encode-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: requestPayload
      });
      
      const result = await response.json();
      const responseText = JSON.stringify(result);
      const benchmark = calculateBenchmark(startTime, requestPayload.length, responseText.length, 'POST');
      benchmark.batchSize = texts.length; // Add batch-specific metric
      
      if (result.success) {
        updateResponse('encodeBatch', result.data, false, benchmark);
      } else {
        updateResponse('encodeBatch', result, true, benchmark);
      }
    } catch (error) {
      const benchmark = calculateBenchmark(startTime, requestPayload.length, 0, 'POST');
      benchmark.batchSize = texts.length;
      updateResponse('encodeBatch', { error: error.message }, true, benchmark);
    }
    updateLoading('encodeBatch', false);
  };

  const redeployService = async (event) => {
    event.preventDefault();
    updateLoading('redeploy', true);
    const startTime = performance.now();
    
    const formData = new FormData(event.target);
    const deployKey = formData.get('deployKey');

    const requestPayload = JSON.stringify({ deployKey });

    try {
      const response = await fetch('/api/redeploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: requestPayload
      });
      
      const result = await response.json();
      const responseText = JSON.stringify(result);
      const benchmark = calculateBenchmark(startTime, requestPayload.length, responseText.length, 'POST');
      
      if (result.success) {
        updateResponse('redeploy', result.data, false, benchmark);
      } else {
        updateResponse('redeploy', result, true, benchmark);
      }
    } catch (error) {
      const benchmark = calculateBenchmark(startTime, requestPayload.length, 0, 'POST');
      updateResponse('redeploy', { error: error.message }, true, benchmark);
    }
    updateLoading('redeploy', false);
  };

  return (
    <>
      <Head>
        <title>The Matrix Server API Tester</title>
        <meta name="description" content="Test Matrix Server API endpoints" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-green-400">
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              🔮 The Matrix Server API Tester
            </h1>
            <p className="text-xl text-gray-300">The embedding server for <strong>IntelliTube</strong> (CORS issues resolved)</p>
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
                <ResponseDisplay response={responses.ping} benchmark={benchmarks.ping} />
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
                <ResponseDisplay response={responses.encodeSingle} benchmark={benchmarks.encodeSingle} />
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
                <ResponseDisplay response={responses.encodeBatch} benchmark={benchmarks.encodeBatch} />
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
                <ResponseDisplay response={responses.redeploy} benchmark={benchmarks.redeploy} />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Response Display Component
function ResponseDisplay({ response, benchmark }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const responseText = typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2);
  const isLarge = responseText.length > 500;
  
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'fast': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'slow': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };
  
  return (
    <div className={`mt-6 p-4 rounded-lg ${response.isError ? 'bg-red-900/30 border border-red-500/50' : 'bg-green-900/30 border border-green-500/50'}`}>
      {/* Response Header */}
      <div className="flex justify-between items-center mb-2">
        <h4 className={`font-semibold ${response.isError ? 'text-red-400' : 'text-green-400'}`}>
          {response.isError ? '❌ Error Response' : '✅ Success Response'}
        </h4>
        <div className="flex items-center gap-2">
          {isLarge && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
            >
              {isExpanded ? '📄 Collapse' : '📋 Expand'}
            </button>
          )}
          <span className="text-xs text-gray-400">{response.timestamp}</span>
        </div>
      </div>

      {/* Performance Metrics */}
      {benchmark && (
        <div className="mb-3 p-3 bg-black/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-sm font-semibold text-blue-400">⚡ Performance Metrics</h5>
            <span className={`text-xs px-2 py-1 rounded ${getStatusColor(benchmark.status)} bg-gray-800`}>
              {benchmark.status.toUpperCase()}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="text-center">
              <div className="text-gray-400">Duration</div>
              <div className={`font-mono ${getStatusColor(benchmark.status)}`}>
                {benchmark.duration}ms
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-400">Method</div>
              <div className="font-mono text-blue-300">{benchmark.requestType}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400">Request</div>
              <div className="font-mono text-yellow-300">{formatBytes(benchmark.requestSize)}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400">Response</div>
              <div className="font-mono text-green-300">{formatBytes(benchmark.responseSize)}</div>
            </div>
          </div>
          
          {/* Additional metrics row */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs mt-2 pt-2 border-t border-gray-700">
            <div className="text-center">
              <div className="text-gray-400">Throughput</div>
              <div className="font-mono text-purple-300">
                {benchmark.throughput > 0 ? formatBytes(benchmark.throughput) + '/s' : 'N/A'}
              </div>
            </div>
            {benchmark.batchSize && (
              <div className="text-center">
                <div className="text-gray-400">Batch Size</div>
                <div className="font-mono text-orange-300">{benchmark.batchSize} items</div>
              </div>
            )}
            <div className="text-center">
              <div className="text-gray-400">Efficiency</div>
              <div className="font-mono text-cyan-300">
                {benchmark.responseSize > 0 ? Math.round(benchmark.responseSize / benchmark.duration) : '0'} B/ms
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Response Content */}
      <div 
        className={`bg-black/70 rounded overflow-hidden ${
          isLarge && !isExpanded ? 'max-h-48' : isExpanded ? 'max-h-96' : 'max-h-48'
        }`}
      >
        <pre className={`p-3 text-xs text-gray-300 whitespace-pre-wrap overflow-auto ${
          isLarge && !isExpanded ? 'max-h-48' : isExpanded ? 'max-h-96' : 'max-h-48'
        } scrollbar-thin scrollbar-thumb-green-500 scrollbar-track-gray-800`}>
          {responseText}
        </pre>
      </div>
      {isLarge && !isExpanded && (
        <div className="mt-2 text-center">
          <button
            onClick={() => setIsExpanded(true)}
            className="text-xs text-green-400 hover:text-green-300 underline"
          >
            Show more... ({Math.ceil(responseText.length / 100)} lines)
          </button>
        </div>
      )}
    </div>
  );
}