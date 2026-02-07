
import React from 'react';
import { View, UserRole, User } from '../types';
import { NAV_ITEMS } from '../constants';
import { LogOut, Ship, ClipboardEdit, FileText } from 'lucide-react';

interface LayoutProps {
  currentView: View;
  onNavigate: (view: View) => void;
  currentUserRole: UserRole;
  currentUser: User;
  onLogout: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, onNavigate, currentUserRole, currentUser, onLogout, children }) => {
  const isFieldWorker = currentUserRole === UserRole.CAPTAIN || currentUserRole === UserRole.CHIEF_ENGINEER;

  if (isFieldWorker) {
    const fieldNavItems = NAV_ITEMS.filter(item => item.roles.includes(currentUserRole));

    return (
      <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
        {/* Mobile & Desktop Shared Header */}
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center shadow-sm z-20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-[#0284c7] p-2.5 rounded-2xl text-white shadow-lg shadow-sky-100">
              <Ship className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-black text-slate-900 tracking-tight text-lg leading-tight">
                나미나라 운항관리
              </h1>
              <p className="text-[10px] font-bold text-sky-600 uppercase tracking-widest">Captain's Console</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Desktop Navigation for Field Workers */}
            <nav className="hidden md:flex bg-slate-100 p-1 rounded-2xl">
              {fieldNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id as View)}
                  className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-black transition-all ${
                    currentView === item.id 
                      ? 'bg-white text-sky-600 shadow-sm' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {React.cloneElement(item.icon as React.ReactElement, { className: 'w-4 h-4' })}
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="h-8 w-px bg-slate-100 mx-2 hidden md:block" />

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-slate-900 leading-none">{currentUser.name}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">배정: {currentUser.assignedShip || '대기중'}</p>
              </div>
              <button 
                className="flex items-center gap-2 bg-slate-900 hover:bg-rose-600 text-white px-4 py-2.5 rounded-xl text-xs font-black transition-all active:scale-95"
                onClick={onLogout}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden xs:inline">로그아웃</span>
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50 relative">
          <div className="max-w-4xl mx-auto p-4 md:p-8 pb-32 md:pb-8">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation (Only for Captains/Engineers) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-3 flex justify-around items-center z-50 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.05)]">
          {fieldNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as View)}
              className="flex flex-col items-center gap-1 group"
            >
              <div className={`p-2 rounded-xl transition-all ${
                currentView === item.id 
                  ? 'bg-sky-50 text-sky-600' 
                  : 'text-slate-300 group-hover:text-slate-500'
              }`}>
                {React.cloneElement(item.icon as React.ReactElement, { className: 'w-6 h-6' })}
              </div>
              <span className={`text-[10px] font-black tracking-tighter ${
                currentView === item.id ? 'text-sky-600' : 'text-slate-400'
              }`}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3 text-sky-600 mb-8">
            <div className="bg-sky-600/10 p-2 rounded-lg">
              <span className="text-xl font-bold tracking-tighter">MMS</span>
            </div>
            <h1 className="font-bold text-lg text-slate-900">Marine Resource</h1>
          </div>
          
          <nav className="space-y-1">
            {NAV_ITEMS.filter(item => item.roles.includes(currentUserRole)).map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as View)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  currentView === item.id 
                    ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        
        <div className="mt-auto p-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center">
              <span className="text-xs font-bold text-slate-500">ADM</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 truncate max-w-[120px]">{currentUser.name}</p>
              <p className="text-xs text-slate-400">관리자 모드</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50 rounded-2xl text-sm font-bold transition-all group"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            로그아웃
          </button>
        </div>
      </aside>

      {/* Admin Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50 p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
