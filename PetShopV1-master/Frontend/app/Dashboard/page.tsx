'use client';

import { useEffect, useState, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { useRouter } from 'next/navigation';

interface AdoptionUpdate {
  requestId: string;
  petId: string;
  petName: string;
  initiatorId: string;
  initiatorName: string;
  receiverId: string;
  receiverName: string;
  status: string;
  updateType: string;
  message: string;
  requestDate: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [logs, setLogs] = useState<{ id: string; msg: string; type: string; time: string }[]>([]);
  const [token, setToken] = useState('');
  const [requestId, setRequestId] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (msg: string, type: string = 'info') => {
    const id = Math.random().toString(36).substring(7);
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [{ id, msg, type, time }, ...prev]);
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!savedToken || !userStr) {
      router.push('/Login');
      return;
    }

    setToken(savedToken);
    setCurrentUser(JSON.parse(userStr));

    const connectToHub = (authToken: string) => {
      setStatus('connecting');
      const conn = new signalR.HubConnectionBuilder()
        .withUrl('http://localhost:5000/hubs/adoption', {
          accessTokenFactory: () => authToken
        })
        .withAutomaticReconnect()
        .build();

      conn.on('NewAdoptionRequest', (data: AdoptionUpdate) => {
        addLog(`📨 [Incoming] ${data.message}`, 'incoming');
      });

      conn.on('RequestSent', (data: AdoptionUpdate) => {
        addLog(`📤 [Outgoing] ${data.message}`, 'outgoing');
      });

      conn.on('RequestAccepted', (data: AdoptionUpdate) => {
        addLog(`✅ [Accepted] ${data.message}`, 'success');
      });

      conn.on('RequestRejected', (data: AdoptionUpdate) => {
        addLog(`❌ [Rejected] ${data.message}`, 'error');
      });

      conn.on('RequestCancelled', (data: AdoptionUpdate) => {
        addLog(`🚫 [Cancelled] ${data.message}`, 'warning');
      });

      conn.on('RequestProcessed', (data: AdoptionUpdate) => {
        addLog(`🔔 [Processed] ${data.message}`, 'info');
      });

      conn.on('RequestUpdate', (data: AdoptionUpdate) => {
        addLog(`🔄 [Update: ${data.updateType}] ${data.message}`, 'info');
      });

      conn.start()
        .then(() => {
          setStatus('connected');
          addLog('🟢 SignalR: Connected to Adoption Hub', 'success');
        })
        .catch(err => {
          setStatus('error');
          addLog(`🔴 SignalR: Connection failed - ${err}`, 'error');
        });

      setConnection(conn);
    };

    connectToHub(savedToken);

    return () => {
      connection?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleAction = async (path: string, method: string = 'POST', body?: any) => {
    try {
      const response = await fetch(`http://localhost:5000/api/Adoption/${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: body ? JSON.stringify(body) : undefined
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.Error || 'Action failed');
      
      addLog(`🚀 Action success: ${result.Message}`, 'success');
      if (result.RequestId) setRequestId(result.RequestId);
    } catch (err: any) {
      addLog(`🚨 Action failed: ${err.message}`, 'error');
    }
  };

  const joinGroup = () => {
    if (connection && requestId) {
      connection.invoke('JoinRequestGroup', requestId)
        .then(() => addLog(`👥 Joined real-time group for Request: ${requestId}`, 'info'))
        .catch(err => addLog(`🚨 Group Join Failed: ${err}`, 'error'));
    }
  };

  return (
    <div className="pt-24 pb-12 max-w-7xl mx-auto px-6 min-h-screen">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Adoption Dashboard
          </h1>
          <p className="text-slate-500 text-sm mt-1">Real-time status of your adoption requests.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium text-slate-600">
            User: {currentUser?.FirstName}
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold uppercase ${
            status === 'connected' ? 'bg-green-100 text-green-700' :
            status === 'connecting' ? 'bg-amber-100 text-amber-700' :
            'bg-red-100 text-red-700'
          }`}>
            <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            {status}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col h-[350px]">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-500">settings</span>
              Manage Active Request
            </h3>
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Request ID</label>
                <input 
                  value={requestId} 
                  onChange={e => setRequestId(e.target.value)} 
                  placeholder="Paste Request ID from console..." 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button 
                className="w-full bg-slate-100 text-slate-700 border border-slate-200 py-3 rounded-lg font-bold text-sm hover:bg-slate-200 transition disabled:opacity-50" 
                onClick={joinGroup} 
                disabled={!requestId || status !== 'connected'}
              >
                Connect to Request Stream
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button 
                className="bg-green-50 text-green-700 border border-green-200 py-3 rounded-lg font-bold text-sm hover:bg-green-100 hover:border-green-300 transition disabled:opacity-50" 
                onClick={() => handleAction(`${requestId}/accept`, 'PUT')} 
                disabled={!requestId}
              >
                Accept
              </button>
              <button 
                className="bg-red-50 text-red-700 border border-red-200 py-3 rounded-lg font-bold text-sm hover:bg-red-100 hover:border-red-300 transition disabled:opacity-50" 
                onClick={() => handleAction(`${requestId}/reject`, 'PUT')} 
                disabled={!requestId}
              >
                Reject
              </button>
            </div>
            
            <button 
              className="w-full mt-3 bg-white text-slate-600 border border-slate-200 py-2 rounded-lg font-bold text-sm hover:bg-slate-50 transition disabled:opacity-50" 
              onClick={() => handleAction(`${requestId}/cancel`, 'PUT')} 
              disabled={!requestId}
            >
              Cancel Request
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-800 flex flex-col h-[600px]">
            <div className="bg-slate-800 px-6 py-4 flex items-center justify-between border-b border-slate-700/50">
              <h3 className="text-slate-200 font-bold font-mono text-sm tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-green-400">terminal</span>
                LIVE EVENT STREAM
              </h3>
              <button 
                className="text-xs text-slate-400 hover:text-white transition bg-slate-700/50 px-3 py-1 rounded" 
                onClick={() => setLogs([])}
              >
                Clear
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 font-mono text-xs leading-relaxed custom-scrollbar">
              {logs.length === 0 ? (
                <div className="text-slate-500 h-full flex flex-col items-center justify-center space-y-4">
                  <div className="w-12 h-12 rounded-full border-t-2 border-slate-600 animate-spin"></div>
                  <p>Listening for adoption events...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {logs.map(log => {
                    const colorClass = 
                      log.type === 'success' ? 'text-green-400' :
                      log.type === 'error' ? 'text-red-400' :
                      log.type === 'warning' ? 'text-yellow-400' :
                      log.type === 'incoming' ? 'text-purple-400' :
                      log.type === 'outgoing' ? 'text-cyan-400' : 'text-blue-400';
                      
                    return (
                      <div key={log.id} className="flex gap-4 p-2 hover:bg-slate-800/50 rounded transition-colors break-words">
                        <span className="text-slate-500 shrink-0 select-none">[{log.time}]</span>
                        <span className={`${colorClass}`}>{log.msg}</span>
                      </div>
                    );
                  })}
                  <div ref={logEndRef} className="h-4" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}