'use client';

import { useEffect, useState, useRef } from 'react';
import { HubConnectionBuilder, HubConnection, HttpTransportType } from '@microsoft/signalr';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/utils/axios';

interface AdoptionUpdate {
  requestId: string; petName: string; initiatorName: string;
  receiverName: string; status: string; updateType: string; message: string; requestDate: string;
}

// ── Admin Panel ────────────────────────────────────────────────────────────────
function AdminPanel() {
  const [tab, setTab] = useState<'users' | 'posts' | 'stats'>('stats');
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [pendingPosts, setPendingPosts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = async (t: typeof tab) => {
    setLoading(true);
    try {
      if (t === 'stats') {
        const r = await api.get('/admin/dashboard/stats');
        if (r.data.Success) setStats(r.data.Statistics);
      } else if (t === 'users') {
        const r = await api.get('/admin/users/pending');
        if (r.data.Success) setPendingUsers(r.data.Users);
      } else {
        const r = await api.get('/admin/posts/pending');
        if (r.data.Success) setPendingPosts(r.data.Posts);
      }
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(tab); }, [tab]);

  const userAction = async (userId: string, action: 'approve' | 'reject') => {
    try {
      await api.put(`/admin/users/${userId}/${action}`);
      setPendingUsers(u => u.filter(x => x.userId !== userId));
    } catch { alert(`Failed to ${action}.`); }
  };

  const postAction = async (postId: string, action: 'approve' | 'reject') => {
    try {
      await api.put(`/admin/posts/${postId}/${action}`);
      setPendingPosts(p => p.filter(x => x.postId !== postId));
    } catch { alert(`Failed to ${action}.`); }
  };

  return (
    <div className="mt-10 bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
      <div className="bg-amber-50 px-6 py-4 border-b border-amber-100 flex items-center gap-2">
        <span className="material-symbols-outlined text-amber-600">admin_panel_settings</span>
        <h2 className="font-bold text-amber-800 text-lg">Admin Panel</h2>
      </div>
      <div className="p-6">
        <div className="flex gap-2 mb-6">
          {([['stats','Stats'],['users','Pending Users'],['posts','Pending Posts']] as const).map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition ${tab === k ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {label}
            </button>
          ))}
        </div>

        {loading ? <div className="py-8 text-center text-slate-400">Loading...</div> : (
          <>
            {tab === 'stats' && stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(stats).map(([k, v]: any) => (
                  <div key={k} className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                    <p className="text-2xl font-black text-blue-600">{v}</p>
                    <p className="text-xs text-slate-500 mt-1 capitalize">{k.replace(/([A-Z])/g,' $1').trim()}</p>
                  </div>
                ))}
              </div>
            )}

            {tab === 'users' && (
              <div className="space-y-3">
                {pendingUsers.length === 0 ? <p className="text-slate-400 text-center py-6">No pending users 🎉</p> :
                  pendingUsers.map(u => (
                    <div key={u.userId} className="flex items-center justify-between bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{u.firstName} {u.lastName}</p>
                        <p className="text-xs text-slate-500">{u.email} · {u.role}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => userAction(u.userId, 'approve')} className="text-xs font-bold bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700">Approve</button>
                        <button onClick={() => userAction(u.userId, 'reject')} className="text-xs font-bold bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600">Reject</button>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}

            {tab === 'posts' && (
              <div className="space-y-3">
                {pendingPosts.length === 0 ? <p className="text-slate-400 text-center py-6">No pending posts 🎉</p> :
                  pendingPosts.map(p => (
                    <div key={p.postId} className="flex items-center justify-between bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{p.title}</p>
                        <p className="text-xs text-slate-500">{p.ownerName} · {p.petType}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => postAction(p.postId, 'approve')} className="text-xs font-bold bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700">Approve</button>
                        <button onClick={() => postAction(p.postId, 'reject')} className="text-xs font-bold bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600">Reject</button>
                        <button onClick={async () => { await api.delete(`/admin/posts/${p.postId}`); setPendingPosts(x => x.filter(y => y.postId !== p.postId)); }}
                          className="text-xs font-bold bg-slate-500 text-white px-3 py-1.5 rounded-lg hover:bg-slate-600">Delete</button>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [logs, setLogs] = useState<{ id: string; msg: string; type: string; time: string }[]>([]);
  const [token, setToken] = useState('');
  const [requestId, setRequestId] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState('');
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<any[]>([]);
  const [reqLoading, setReqLoading] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  const fetchRequests = async (uid: string) => {
    setReqLoading(true);
    try {
      const [s, r] = await Promise.all([
        api.get(`/Adoption/user/${uid}/initiated`),
        api.get(`/Adoption/user/${uid}/received`),
      ]);
      setSentRequests(Array.isArray(s.data) ? s.data : []);
      setReceivedRequests(Array.isArray(r.data) ? r.data : []);
    } catch (e) { console.error('Failed to fetch requests', e); }
    finally { setReqLoading(false); }
  };

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollTop = 0; // Since I'm prepending logs, scroll to top or just remove it if appending
    }
  }, [logs]);

  const addLog = (msg: string, type = 'info') => {
    const id = Math.random().toString(36).substring(7);
    setLogs(prev => [{ id, msg, type, time: new Date().toLocaleTimeString() }, ...prev]);
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (!savedToken || !userStr) { router.push('/Login'); return; }

    const user = JSON.parse(userStr);
    const uid = user.userId || user.UserId || user.Id || user.id;
    setUserId(uid);
    setCurrentUser(user);
    setToken(savedToken);
    setIsAdmin(user.Role === 'Admin' || user.role === 'Admin');
    fetchRequests(uid);

    // Quick token validity check before connecting
    const tokenPayload = JSON.parse(atob(savedToken.split('.')[1]));
    const isExpired = tokenPayload.exp * 1000 < Date.now();
    if (isExpired) {
      setStatus('error');
      addLog('🔴 Session expired. Please log in again.', 'error');
      return;
    }

    setToken(savedToken);
    const u = JSON.parse(userStr);
    setCurrentUser(u);
    setIsAdmin(u.Role === 'Admin' || u.role === 'Admin');

    const conn = new HubConnectionBuilder()
      .withUrl('http://localhost:5000/hubs/adoption', {
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets,
        accessTokenFactory: async () => {
          const t = localStorage.getItem('token');
          return t || '';
        }
      })
      .withAutomaticReconnect()
      .build();

    const events: [string, string, string][] = [
      ['NewAdoptionRequest', '📨 [Incoming]', 'incoming'],
      ['RequestSent', '📤 [Outgoing]', 'outgoing'],
      ['RequestAccepted', '✅ [Accepted]', 'success'],
      ['RequestRejected', '❌ [Rejected]', 'error'],
      ['RequestCancelled', '🚫 [Cancelled]', 'warning'],
      ['RequestProcessed', '🔔 [Processed]', 'info'],
      ['RequestUpdate', '🔄 [Update]', 'info'],
    ];
    events.forEach(([evt, prefix, type]) => {
      conn.on(evt, (data: AdoptionUpdate) => addLog(`${prefix} ${data.message}`, type));
    });

    setStatus('connecting');
    conn.start()
      .then(() => { setStatus('connected'); addLog('🟢 SignalR: Connected', 'success'); })
      .catch(err => { setStatus('error'); addLog(`🔴 SignalR failed: ${err}`, 'error'); });
    setConnection(conn);
    return () => { conn.stop(); };
  }, [router]);

  const handleAction = async (path: string, method = 'POST', body?: any) => {
    try {
      const fullPath = `/Adoption/${path}`;
      const response = method === 'PUT' 
        ? await api.put(fullPath, body)
        : await api.post(fullPath, body);
      
      const result = response.data;
      addLog(`🚀 Success: ${result.Message || result.message || 'Action completed'}`, 'success');
      if (result.RequestId || result.requestId) setRequestId(result.RequestId || result.requestId);
      
      // Refresh request lists
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const u = JSON.parse(userStr);
        fetchRequests(u.userId || u.UserId || u.Id || u.id);
      }
    } catch (err: any) { 
      const msg = err.response?.data?.Error || err.response?.data?.error || err.message || 'Action failed';
      addLog(`🚨 Failed: ${msg}`, 'error'); 
    }
  };

  const joinGroup = () => {
    if (connection && requestId) {
      connection.invoke('JoinRequestGroup', requestId)
        .then(() => addLog(`👥 Joined group: ${requestId}`, 'info'))
        .catch(err => addLog(`🚨 Group join failed: ${err}`, 'error'));
    }
  };

  return (
    <div className="pt-24 pb-12 max-w-7xl mx-auto px-6 min-h-screen">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Adoption Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time status of your adoption requests.</p>
        </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold uppercase ${
          status === 'connected' ? 'bg-green-100 text-green-700' : status === 'connecting' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
        }`}>
          <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          {status}
        </div>
      </div>

      {/* Session expired banner */}
      {status === 'error' && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-red-500">lock</span>
            <div>
              <p className="font-bold text-red-700">SignalR connection failed (401 Unauthorized)</p>
              <p className="text-sm text-red-500 mt-0.5">Your session token may have expired. Please log out and log back in.</p>
            </div>
          </div>
          <button
            onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); router.push('/Login'); }}
            className="bg-red-600 text-white font-bold px-5 py-2 rounded-xl text-sm hover:bg-red-700 transition flex-shrink-0"
          >
            Log In Again
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col h-[350px]">
            <h3 className="font-bold text-slate-800 mb-4">Manage Active Request</h3>
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Request ID</label>
                <input value={requestId} onChange={e => setRequestId(e.target.value)}
                  placeholder="Paste Request ID..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <button onClick={joinGroup} disabled={!requestId || status !== 'connected'}
                className="w-full bg-slate-100 text-slate-700 border border-slate-200 py-3 rounded-lg font-bold text-sm hover:bg-slate-200 transition disabled:opacity-50">
                Connect to Request Stream
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button onClick={() => handleAction(`${requestId}/accept`, 'PUT')} disabled={!requestId}
                className="bg-green-50 text-green-700 border border-green-200 py-3 rounded-lg font-bold text-sm hover:bg-green-100 transition disabled:opacity-50">Accept</button>
              <button onClick={() => handleAction(`${requestId}/reject`, 'PUT')} disabled={!requestId}
                className="bg-red-50 text-red-700 border border-red-200 py-3 rounded-lg font-bold text-sm hover:bg-red-100 transition disabled:opacity-50">Reject</button>
            </div>
            <button onClick={() => handleAction(`${requestId}/cancel`, 'PUT')} disabled={!requestId}
              className="w-full mt-3 bg-white text-slate-600 border border-slate-200 py-2 rounded-lg font-bold text-sm hover:bg-slate-50 transition disabled:opacity-50">
              Cancel Request
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-800 flex flex-col h-[400px]">
            <div className="bg-slate-800 px-4 py-2 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">terminal</span>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50" />
              </div>
            </div>
            <div className="p-4 flex-1 overflow-y-auto font-mono text-xs space-y-2 custom-scrollbar" ref={logEndRef}>
              {logs.length === 0
                ? <div className="text-slate-500 h-full flex flex-col items-center justify-center gap-3"><div className="w-10 h-10 rounded-full border-t-2 border-slate-600 animate-spin" /><p>Listening for adoption events...</p></div>
                : <div className="space-y-3">
                    {logs.map(log => {
                      const c = log.type === 'success' ? 'text-green-400' : log.type === 'error' ? 'text-red-400' : log.type === 'warning' ? 'text-yellow-400' : log.type === 'incoming' ? 'text-purple-400' : log.type === 'outgoing' ? 'text-cyan-400' : 'text-blue-400';
                      return <div key={log.id} className="flex gap-4 p-2 hover:bg-slate-800/50 rounded"><span className="text-slate-500 shrink-0">[{log.time}]</span><span className={c}>{log.msg}</span></div>;
                    })}
                    <div ref={logEndRef} />
                  </div>
              }
            </div>
          </div>
        </div>
      </div>

      {/* Adoption Request History Section */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sent Requests */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-500">send</span> Sent Requests
          </h3>
          {reqLoading ? <div className="py-4 text-center text-slate-400">Loading...</div> :
            sentRequests.length === 0 ? <div className="py-4 text-center text-slate-400 text-sm italic">No sent requests.</div> :
            <div className="space-y-3">
              {sentRequests.map(req => (
                <div key={req.requestId} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-700 text-sm">{req.petName}</p>
                    <p className="text-[10px] text-slate-500">To: {req.receiverName}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${req.status === 'Accepted' ? 'bg-green-100 text-green-700' : req.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {req.status}
                    </span>
                    <button onClick={() => { setRequestId(req.requestId); joinGroup(); }} className="text-[10px] text-blue-600 hover:underline">Track Live</button>
                  </div>
                </div>
              ))}
            </div>
          }
        </div>

        {/* Received Requests */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-green-500">inbox</span> Received Requests
          </h3>
          {reqLoading ? <div className="py-4 text-center text-slate-400">Loading...</div> :
            receivedRequests.length === 0 ? <div className="py-4 text-center text-slate-400 text-sm italic">No received requests.</div> :
            <div className="space-y-3">
              {receivedRequests.map(req => (
                <div key={req.requestId} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-700 text-sm">{req.petName}</p>
                    <p className="text-[10px] text-slate-500">From: {req.initiatorName}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${req.status === 'Accepted' ? 'bg-green-100 text-green-700' : req.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {req.status}
                    </span>
                    <button onClick={() => { setRequestId(req.requestId); joinGroup(); }} className="text-[10px] text-blue-600 hover:underline">Manage Live</button>
                  </div>
                </div>
              ))}
            </div>
          }
        </div>
      </div>

      {/* Admin Panel — only for admins */}
      {isAdmin && <AdminPanel />}
    </div>
  );
}