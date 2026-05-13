'use client';

import { useEffect, useState, useRef } from 'react';
import { HubConnectionBuilder, HubConnection, HttpTransportType } from '@microsoft/signalr';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/utils/axios';

interface AdoptionUpdate {
  requestId: string; petName: string; initiatorName: string;
  receiverName: string; status: string; updateType: string; message: string; requestDate: string;
}

// --- Admin Panel ---
function AdminPanel() {
  const [tab, setTab] = useState<'users' | 'posts' | 'stats'>('stats');
  const [userSubTab, setUserSubTab] = useState<'pending' | 'all'>('pending');
  const [users, setUsers] = useState<any[]>([]);
  const [pendingPosts, setPendingPosts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = async (t: typeof tab, ust: typeof userSubTab = userSubTab) => {
    setLoading(true);
    try {
      if (t === 'stats') {
        const r = await api.get('/admin/dashboard/stats');
        if (r.data.success || r.data.Success) {
          setStats(r.data.statistics || r.data.Statistics);
        }
      } else if (t === 'users') {
        const endpoint = ust === 'pending' ? '/User/pending' : '/User/all';
        const r = await api.get(endpoint);
        if (r.data.success || r.data.Success) {
          setUsers(r.data.users || r.data.Users || []);
        }
      } else {
        const r = await api.get('/admin/posts/pending');
        if (r.data.success || r.data.Success) {
          setPendingPosts(r.data.posts || r.data.Posts || []);
        }
      }
    } catch (err: any) {
      console.error('Failed to load admin data', err);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(tab, userSubTab); }, [tab, userSubTab]);

  const userAction = async (userId: string, action: 'activate' | 'deactivate' | 'delete') => {
    if (action === 'delete' || action === 'deactivate') {
      if (!confirm(`Are you sure you want to ${action} this user?`)) return;
    }
    
    setActionLoading(`${userId}-${action}`);
    try {
      if (action === 'delete') {
        await api.delete(`/User/${userId}`);
      } else {
        await api.put(`/User/${userId}/${action}`);
      }
      
      // Local update to reflect changes immediately
      if (userSubTab === 'pending' && action === 'activate') {
        setUsers(u => u.filter(x => x.userId !== userId));
      } else {
        load('users', userSubTab); // Full refresh for 'all' tab or deactivations
      }
      
      if (tab === 'stats') load('stats');
    } catch (err: any) {
      alert(err.response?.data?.Error || `Failed to ${action} user.`);
    } finally { setActionLoading(null); }
  };

  const postAction = async (postId: string, action: 'approve' | 'reject' | 'delete') => {
    if (action === 'delete' || action === 'reject') {
      if (!confirm(`Are you sure you want to ${action} this post?`)) return;
    }

    setActionLoading(`${postId}-${action}`);
    try {
      if (action === 'delete') {
        await api.delete(`/admin/posts/${postId}`);
      } else {
        await api.put(`/admin/posts/${postId}/${action}`);
      }
      setPendingPosts(p => p.filter(x => x.postId !== postId));
      if (tab === 'stats') load('stats');
    } catch (err: any) {
      alert(err.response?.data?.Error || `Failed to ${action} post.`);
    } finally { setActionLoading(null); }
  };

  const StatCard = ({ title, value, icon, color }: { title: string, value: any, icon: string, color: string }) => (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4`}>
        <span className="material-symbols-outlined text-white">{icon}</span>
      </div>
      <p className="text-3xl font-black text-slate-800">{value}</p>
      <p className="text-sm font-medium text-slate-500 mt-1 capitalize">{title.replace(/([A-Z])/g, ' $1').trim()}</p>
    </div>
  );

  return (
    <div className="mt-12 bg-slate-50 rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm border border-white/10">
            <span className="material-symbols-outlined text-white text-2xl">admin_panel_settings</span>
          </div>
          <div>
            <h2 className="font-bold text-white text-xl tracking-tight">System Control Tower</h2>
            <p className="text-slate-400 text-xs font-medium opacity-80 uppercase tracking-widest">Global Management Console</p>
          </div>
        </div>
        <button onClick={() => load(tab)} className="bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors text-white border border-white/5">
          <span className={`material-symbols-outlined ${loading ? 'animate-spin' : ''}`}>refresh</span>
        </button>
      </div>

      <div className="p-8">
        <div className="flex gap-2 mb-8 bg-slate-200/50 p-1 rounded-2xl w-fit">
          {(['stats', 'users', 'posts'] as const).map((k) => (
            <button key={k} onClick={() => setTab(k)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                tab === k 
                ? 'bg-white text-slate-800 shadow-sm border border-slate-200' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}>
              {k.charAt(0).toUpperCase() + k.slice(1)}
            </button>
          ))}
        </div>

        {loading && !stats && !users.length && !pendingPosts.length ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 border-4 border-slate-800 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400 font-medium">Fetching secure data...</p>
          </div>
        ) : (
          <div className="min-h-[400px]">
            {tab === 'stats' && stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in zoom-in-95 duration-500">
                <StatCard title="Total Users" value={stats.totalUsers} icon="group" color="bg-indigo-500" />
                <StatCard title="Total Pets" value={stats.totalPets} icon="pets" color="bg-teal-500" />
                <StatCard title="Total Posts" value={stats.totalPosts} icon="article" color="bg-violet-500" />
                <StatCard title="Pending Users" value={stats.pendingUsers} icon="person_add" color="bg-amber-500" />
              </div>
            )}

            {tab === 'users' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="flex gap-4 border-b border-slate-200 pb-2 mb-4">
                  {(['pending', 'all'] as const).map(ut => (
                    <button key={ut} onClick={() => setUserSubTab(ut)} 
                      className={`text-xs font-black uppercase tracking-widest pb-2 transition-all ${userSubTab === ut ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                      {ut === 'pending' ? 'Pending Approval' : 'All Users'}
                    </button>
                  ))}
                </div>

                {users.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                    <span className="material-symbols-outlined text-5xl text-slate-200 mb-2">person_search</span>
                    <p className="text-slate-400 font-medium">No {userSubTab} users found</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {users.map(u => (
                      <div key={u.userId} className="group flex flex-col md:flex-row items-start md:items-center justify-between bg-white rounded-2xl p-5 border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-colors ${
                            u.accountStatus === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 
                            u.accountStatus === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {u.firstName[0]}{u.lastName[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 flex items-center gap-2">
                              {u.firstName} {u.lastName}
                              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                                u.accountStatus === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 
                                u.accountStatus === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {u.accountStatus}
                              </span>
                            </p>
                            <p className="text-xs text-slate-500 flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[14px]">mail</span> {u.email}
                              <span className="text-slate-300">|</span>
                              <span className="font-black uppercase tracking-wider text-[10px] text-slate-400">{u.role}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4 md:mt-0 w-full md:w-auto">
                          {u.accountStatus !== 'Approved' ? (
                            <button 
                              onClick={() => userAction(u.userId, 'activate')} 
                              disabled={actionLoading === `${u.userId}-activate`}
                              className="flex-1 md:flex-none flex items-center justify-center gap-1 text-xs font-bold bg-emerald-600 text-white px-4 py-2.5 rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50">
                              {actionLoading === `${u.userId}-activate` ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <span className="material-symbols-outlined text-[16px]">how_to_reg</span>}
                              Activate
                            </button>
                          ) : (
                            <button 
                              onClick={() => userAction(u.userId, 'deactivate')} 
                              disabled={actionLoading === `${u.userId}-deactivate`}
                              className="flex-1 md:flex-none flex items-center justify-center gap-1 text-xs font-bold bg-amber-500 text-white px-4 py-2.5 rounded-xl hover:bg-amber-600 transition-all disabled:opacity-50">
                              {actionLoading === `${u.userId}-deactivate` ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <span className="material-symbols-outlined text-[16px]">block</span>}
                              Deactivate
                            </button>
                          )}
                          <button 
                            onClick={() => userAction(u.userId, 'delete')} 
                            disabled={actionLoading === `${u.userId}-delete`}
                            className="p-2.5 rounded-xl bg-slate-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all">
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'posts' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                {pendingPosts.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                    <span className="material-symbols-outlined text-5xl text-slate-200 mb-2">article_off</span>
                    <p className="text-slate-400 font-medium">No pending community posts</p>
                  </div>
                ) : (
                  pendingPosts.map(p => (
                    <div key={p.postId} className="group flex flex-col md:flex-row items-start md:items-center justify-between bg-white rounded-2xl p-5 border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                          <span className="material-symbols-outlined text-3xl">description</span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{p.title}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1.5">
                            <span className="font-bold text-slate-700">{p.ownerName}</span>
                            <span className="text-slate-300">.</span>
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">pets</span> {p.petType}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4 md:mt-0 w-full md:w-auto">
                        <button 
                          onClick={() => postAction(p.postId, 'approve')} 
                          disabled={actionLoading === `${p.postId}-approve`}
                          className="flex-1 md:flex-none flex items-center justify-center gap-1 text-xs font-bold bg-emerald-600 text-white px-4 py-2.5 rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50">
                          Approve
                        </button>
                        <button 
                          onClick={() => postAction(p.postId, 'reject')} 
                          disabled={actionLoading === `${p.postId}-reject`}
                          className="flex-1 md:flex-none flex items-center justify-center gap-1 text-xs font-bold bg-rose-500 text-white px-4 py-2.5 rounded-xl hover:bg-rose-600 transition-all disabled:opacity-50">
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Main Dashboard -------------------------------------------------------------
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

    let isMounted = true;
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
      conn.on(evt, (data: AdoptionUpdate) => {
        if (isMounted) {
          addLog(`${prefix} ${data.message}`, type);
          fetchRequests(uid);
        }
      });
    });

    conn.on('ForceLogout', (data: { message: string }) => {
      if (isMounted) {
        alert(data.message || 'Your account has been deactivated by an admin.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/Login');
      }
    });

    setStatus('connecting');
    conn.start()
      .then(() => { 
        if (isMounted) {
          setStatus('connected'); 
          addLog('🟢 SignalR: Connected', 'success'); 
        }
      })
      .catch(err => { 
        if (isMounted) {
          setStatus('error'); 
          addLog(`🔴 SignalR: Offline (Updates via refresh only)`, 'warning');
        }
      });

    setConnection(conn);
    return () => { 
      isMounted = false;
      conn.stop().catch(() => {}); // Safely stop without throwing
    };
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
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                      (req.status === 'Accepted' || req.status === 'Approved') ? 'bg-green-100 text-green-700' : 
                      req.status === 'Rejected' ? 'bg-red-100 text-red-700' : 
                      req.status === 'Cancelled' ? 'bg-slate-100 text-slate-500' : 
                      'bg-amber-100 text-amber-700'
                    }`}>
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
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                      (req.status === 'Accepted' || req.status === 'Approved') ? 'bg-green-100 text-green-700' : 
                      req.status === 'Rejected' ? 'bg-red-100 text-red-700' : 
                      req.status === 'Cancelled' ? 'bg-slate-100 text-slate-500' : 
                      'bg-amber-100 text-amber-700'
                    }`}>
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

      {/* Admin Panel - only for admins */}
      {isAdmin && <AdminPanel />}
    </div>
  );
}
