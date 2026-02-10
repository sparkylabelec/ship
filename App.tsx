
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';
import ShipManagement from './components/ShipManagement';
import OperationEntry from './components/OperationEntry';
import OperationLogList from './components/OperationLogList';
import TelegramSettings from './components/TelegramSettings';
import { View, User, Ship, UserRole, OperationLog, TelegramConfig } from './types';
import { INITIAL_SHIPS, INITIAL_USERS, INITIAL_LOGS } from './constants';
import { Ship as ShipIcon, UserCircle, LogIn } from 'lucide-react';

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [ships, setShips] = useState<Ship[]>(INITIAL_SHIPS);
  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>({
    botToken: '',
    subscribedUserIds: []
  });
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [editingLog, setEditingLog] = useState<OperationLog | null>(null);

  useEffect(() => {
    // Load Logs
    try {
      const savedLogs = localStorage.getItem('mms_logs');
      if (savedLogs) setLogs(JSON.parse(savedLogs));
      else setLogs(INITIAL_LOGS);

      // Load Telegram Config
      const savedTele = localStorage.getItem('mms_telegram');
      if (savedTele) setTelegramConfig(JSON.parse(savedTele));
    } catch (e) {
      console.error("Failed to load local storage data", e);
      setLogs(INITIAL_LOGS);
    }
  }, [currentView]);

  const handleUpdateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const handleAddUser = (userData: Omit<User, 'id' | 'joinDate'>) => {
    const newUser: User = {
      ...userData,
      id: (Math.max(...users.map(u => parseInt(u.id)), 0) + 1).toString(),
      joinDate: new Date().toISOString().split('T')[0]
    };
    setUsers(prev => [...prev, newUser]);
  };

  const handleUpdateTelegramConfig = (config: TelegramConfig) => {
    setTelegramConfig(config);
    localStorage.setItem('mms_telegram', JSON.stringify(config));
  };

  const handleDeleteLog = (id: string) => {
    const updatedLogs = logs.filter(l => l.id !== id);
    setLogs(updatedLogs);
    localStorage.setItem('mms_logs', JSON.stringify(updatedLogs));
  };

  const handleStartEditLog = (log: OperationLog) => {
    setEditingLog(log);
    setCurrentView('operation');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-sky-600 rounded-3xl text-white shadow-xl shadow-sky-200 mb-6">
              <ShipIcon className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">나미나라 운항관리</h1>
            <p className="mt-2 text-slate-500 font-medium">시스템에 접속하려면 사용자를 선택하세요.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 max-h-[60vh] overflow-y-auto p-2">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => {
                  setCurrentUser(user);
                  const defaultView = user.role === UserRole.CAPTAIN || user.role === UserRole.CHIEF_ENGINEER ? 'operation' : 'dashboard';
                  setCurrentView(defaultView as View);
                }}
                className="group relative flex items-center gap-4 p-5 bg-white border border-slate-200 rounded-3xl text-left hover:border-sky-600 hover:shadow-lg transition-all active:scale-95"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-sky-50 group-hover:text-sky-600 transition-colors">
                  <UserCircle className="w-7 h-7" />
                </div>
                <div>
                  <p className="font-black text-slate-900">{user.name}</p>
                  <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">{user.role}</p>
                </div>
                <LogIn className="absolute right-6 w-5 h-5 text-slate-300 group-hover:text-sky-600 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard ships={ships} users={users} logs={logs} />;
      case 'operation':
        return (
          <OperationEntry 
            ships={ships} 
            users={users} 
            currentUser={currentUser} 
            telegramConfig={telegramConfig}
            editingLog={editingLog}
            onComplete={() => {
              setEditingLog(null);
              setCurrentView('logs');
            }} 
          />
        );
      case 'logs':
        return (
          <OperationLogList 
            logs={logs} 
            ships={ships} 
            currentUser={currentUser} 
            onDeleteLog={handleDeleteLog}
            onEditLog={handleStartEditLog}
          />
        );
      case 'ships':
        return (
          <ShipManagement 
            ships={ships} users={users} 
            onAddShip={(s) => setShips([...ships, {...s, id: Date.now().toString()}])} 
            onUpdateShip={(s) => setShips(ships.map(x => x.id === s.id ? s : x))}
            onDeleteShip={(id) => setShips(ships.filter(x => x.id !== id))}
            onNavigateToUsers={() => setCurrentView('users')}
          />
        );
      case 'users':
        return (
          <UserManagement 
            users={users} ships={ships} 
            onUpdateUserRole={(id, r) => setUsers(users.map(u => u.id === id ? {...u, role: r} : u))}
            onUpdateUserShip={(id, s) => setUsers(users.map(u => u.id === id ? {...u, assignedShip: s} : u))}
            onUpdateUser={handleUpdateUser}
            onAddUser={handleAddUser}
          />
        );
      case 'telegram-settings':
        return (
          <TelegramSettings 
            users={users} 
            config={telegramConfig} 
            onUpdateConfig={handleUpdateTelegramConfig} 
          />
        );
      default:
        return <Dashboard ships={ships} users={users} logs={logs} />;
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      onNavigate={(v) => {
        if (v !== 'operation') setEditingLog(null);
        setCurrentView(v);
      }} 
      currentUserRole={currentUser.role}
      currentUser={currentUser}
      onLogout={() => setCurrentUser(null)}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;