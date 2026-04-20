'use client';

import { useEffect, useState, useRef } from 'react';
import * as signalR from '@microsoft/signalr';

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
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [logs, setLogs] = useState<{ id: string; msg: string; type: string; time: string }[]>([]);
  const [token, setToken] = useState('');
  const [requestId, setRequestId] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    petId: 'pet-001',
    receiverId: 'user-002',
    initiatorId: 'admin-001'
  });

  const [authData, setAuthData] = useState({
    email: 'metarek257@gmail.com',
    password: 'oneiron9075'
  });

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Load token from local storage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) setToken(savedToken);
  }, []);

  const addLog = (msg: string, type: string = 'info') => {
    const id = Math.random().toString(36).substring(7);
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [{ id, msg, type, time }, ...prev]);
  };

  const connectToHub = (authToken: string) => {
    if (connection) {
      connection.stop();
    }

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

  const handleLogin = async () => {
    try {
      addLog(`Attempting login for ${authData.email}...`, 'info');
      const response = await fetch('http://localhost:5000/api/Auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authData)
      });
      const result = await response.json();
      if (response.ok && result.Success) {
        const newToken = result.Data.Token;
        setToken(newToken);
        localStorage.setItem('token', newToken);
        setCurrentUser(result.Data);
        addLog(`🔓 Login Successful! User: ${result.Data.FirstName}`, 'success');
        connectToHub(newToken);
      } else {
        const errorMsg = result.Error || result.Message || `Error ${response.status}: ${response.statusText}`;
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      addLog(`🚨 Login Failed: ${err.message}`, 'error');
    }
  };

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
    <div className="dashboard-container">
      <style jsx>{`
        .dashboard-container {
          min-height: 100vh;
          background: #0f172a;
          color: #f8fafc;
          font-family: 'Inter', sans-serif;
          padding: 2rem;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #1e293b;
        }
        .status-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
        }
        .status-connected { background: #064e3b; color: #10b981; border: 1px solid #059669; }
        .status-connecting { background: #451a03; color: #f59e0b; border: 1px solid #d97706; }
        .status-disconnected { background: #450a0a; color: #ef4444; border: 1px solid #dc2626; }
        
        .pulse {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: currentColor;
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }

        .main-grid {
          display: grid;
          grid-template-columns: 350px 1fr;
          gap: 2rem;
        }

        .card {
          background: #1e293b;
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid #334155;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          margin-bottom: 1.5rem;
        }

        .card h3 {
          margin-top: 0;
          margin-bottom: 1.25rem;
          font-size: 1.125rem;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }
        .form-group label {
          display: block;
          font-size: 0.75rem;
          color: #64748b;
          margin-bottom: 0.25rem;
        }
        input {
          width: 100%;
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 6px;
          padding: 0.625rem;
          color: #f1f5f9;
          font-size: 0.875rem;
        }
        input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }

        button {
          width: 100%;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        button:hover { background: #2563eb; }
        button:disabled { background: #1e293b; color: #475569; cursor: not-allowed; }

        .btn-group {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }
        .btn-outline {
          background: transparent;
          border: 1px solid #334155;
          color: #94a3b8;
        }
        .btn-outline:hover { background: #334155; color: white; }

        .log-container {
          background: #020617;
          border: 1px solid #1e293b;
          border-radius: 12px;
          height: 600px;
          overflow-y: auto;
          padding: 1rem;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 0.8125rem;
        }
        .log-entry {
          padding: 0.5rem;
          border-bottom: 1px solid #0f172a;
          display: flex;
          gap: 1rem;
        }
        .log-time { color: #475569; min-width: 80px; }
        .log-msg { word-break: break-all; }
        
        .type-success { color: #10b981; }
        .type-error { color: #ef4444; }
        .type-warning { color: #f59e0b; }
        .type-info { color: #3b82f6; }
        .type-incoming { color: #c084fc; font-weight: bold; }
        .type-outgoing { color: #2dd4bf; }

        .user-info {
          font-size: 0.875rem;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
      `}</style>

      <div className="header">
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(to right, #60a5fa, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            PETSHOP REAL-TIME CONSOLE
          </h1>
          <div className="user-info">
            {currentUser ? `User: ${currentUser.FirstName} (${currentUser.Role})` : 'No active session'}
            {token && <span style={{ color: '#10b981' }}>● Session Active</span>}
          </div>
        </div>
        
        <div className={`status-badge status-${status}`}>
          <div className={status === 'connected' ? 'pulse' : ''}></div>
          {status}
        </div>
      </div>

      <div className="main-grid">
        <div className="sidebar">
          <div className="card">
            <h3>🔑 Authentication</h3>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={authData.email} onChange={e => setAuthData({...authData, email: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={authData.password} onChange={e => setAuthData({...authData, password: e.target.value})} />
            </div>
            <button onClick={handleLogin}>Login & Connect</button>
            <button className="btn-outline" style={{ marginTop: '0.5rem' }} onClick={() => token ? connectToHub(token) : addLog("🚨 No token available. Please login first.", "error")}>Reconnect Socket</button>
          </div>

          <div className="card">
            <h3>🐾 Initiate Request</h3>
            <div className="form-group">
              <label>Pet ID</label>
              <input value={formData.petId} onChange={e => setFormData({...formData, petId: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Initiator User ID</label>
              <input value={formData.initiatorId} onChange={e => setFormData({...formData, initiatorId: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Receiver User ID</label>
              <input value={formData.receiverId} onChange={e => setFormData({...formData, receiverId: e.target.value})} />
            </div>
            <button onClick={() => handleAction('initiate', 'POST', {
              petId: formData.petId,
              initiatorUserId: formData.initiatorId,
              receiverUserId: formData.receiverId
            })}>Send Adoption Request</button>
          </div>

          <div className="card">
            <h3>⚙️ Manage Request</h3>
            <div className="form-group">
              <label>Request ID</label>
              <input value={requestId} onChange={e => setRequestId(e.target.value)} placeholder="0000-0000..." />
            </div>
            <button className="btn-outline" style={{ marginBottom: '1rem' }} onClick={joinGroup} disabled={!requestId}>Join Update Group</button>
            <div className="btn-group">
              <button style={{ background: '#064e3b', color: '#10b981' }} onClick={() => handleAction(`${requestId}/accept`, 'PUT')} disabled={!requestId}>Accept</button>
              <button style={{ background: '#450a0a', color: '#ef4444' }} onClick={() => handleAction(`${requestId}/reject`, 'PUT')} disabled={!requestId}>Reject</button>
            </div>
            <button className="btn-outline" style={{ marginTop: '0.5rem' }} onClick={() => handleAction(`${requestId}/cancel`, 'PUT')} disabled={!requestId}>Cancel</button>
          </div>
        </div>

        <div className="content">
          <div className="log-container">
            {logs.length === 0 && <div style={{ color: '#475569', textAlign: 'center', marginTop: '4rem' }}>No activity logged. Connect and perform actions to see real-time updates.</div>}
            {logs.map(log => (
              <div key={log.id} className="log-entry">
                <span className="log-time">{log.time}</span>
                <span className={`log-msg type-${log.type}`}>{log.msg}</span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
          
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn-outline" style={{ width: 'auto', padding: '0.5rem 1rem' }} onClick={() => setLogs([])}>Clear Console</button>
          </div>
        </div>
      </div>
    </div>
  );
}