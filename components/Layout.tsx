
import React from 'react';
import { View, UserRole, User } from '../types.ts';
import { NAV_ITEMS } from '../constants.tsx';
import { LogOut, Ship as ShipIcon, LayoutDashboard, Menu, X } from 'lucide-react';

interface LayoutProps {
  currentView: View;
  onNavigate: (view: View) => void;
  currentUserRole: UserRole;
  currentUser: User;
  onLogout: () => void;
  children: React.ReactNode;
}

// Layout component implementation with default export to resolve import error in App.tsx
const Layout: React.FC<LayoutProps> = ({ 
  currentView, 
  onNavigate, 
  currentUserRole, 
  currentUser, 
  onLogout, 
  children 
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar for Desktop / Mobile Overlay */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 flex items-center justify-between border-b border-slate-100 bg-slate-50/30">
          <div className="flex items-center gap-4">
            <div className="bg-sky-600 p-3 rounded-2xl text-white shadow-lg shadow-sky-600/20">
              <ShipIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">나미나라</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operation System</p>
            </div>
          </div>
          <button onClick={toggleSidebar} className="md:hidden p-2 text-slate-400 hover:text-rose-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Main Menu</p>
          {NAV_ITEMS.filter(item => item.roles.includes(currentUserRole)).map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id as View);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all transform active:scale-95 ${
                currentView === item.id
                  ? 'bg-sky-600 text-white shadow-xl shadow-sky-600/20'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-sky-600'
              }`}
            >
              <div className="shrink-0">
                {item.icon}
              </div>
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 mb-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-black shrink-0">
              {currentUser.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-slate-900 truncate">{currentUser.name}</p>
              <p className="text-[10px] font-bold text-sky-600 uppercase tracking-tighter">{currentUserRole}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-2xl font-black text-rose-500 bg-rose-50 hover:bg-rose-100 transition-all active:scale-95"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">로그아웃</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden" onClick={toggleSidebar} />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
             <div className="bg-sky-600 p-2 rounded-xl text-white">
               <ShipIcon className="w-5 h-5" />
             </div>
             <span className="font-black text-slate-900">MMS</span>
          </div>
          <button onClick={toggleSidebar} className="p-2 bg-slate-50 rounded-xl text-slate-600">
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
