
import React, { useMemo, useState } from 'react';
import { Ship, User, OperationLog } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { 
  Anchor, Users, AlertTriangle, Ship as ShipIcon, Clock, Navigation, 
  Activity, X, FileText, CheckCircle2, Fuel 
} from 'lucide-react';

interface DashboardProps {
  ships: Ship[];
  users: User[];
  logs: OperationLog[];
}

const Dashboard: React.FC<DashboardProps> = ({ ships, users, logs }) => {
  const [selectedLog, setSelectedLog] = useState<OperationLog | null>(null);

  // Get current time in HH:mm format for comparison
  const now = new Date();
  const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const todayStr = now.toISOString().split('T')[0];

  /**
   * 운항 중 선박 판단 조건:
   * 1. 임시 저장 상태 (isDraft: true)
   * 2. 출발 시간이 현재 시간보다 빠름 (departureTime <= currentTime)
   * 3. 도착 시간이 아직 입력되지 않음 (!arrivalTime)
   */
  const operatingLogs = useMemo(() => {
    return logs.filter(log => {
      // 1. 임시저장 항목인지 확인
      if (!log.isDraft) return false;
      
      const logDate = log.createdAt.split('T')[0];
      // 오늘 날짜인지 확인 (실시간 현황이므로)
      if (logDate !== todayStr) return false;

      // 2. 출발시간이 지났는지 확인
      const hasDeparted = log.departureTime && log.departureTime <= currentTimeStr;
      
      // 3. 도착시간이 입력되지 않았는지 확인 (빈 문자열이거나 null인 경우)
      const arrivalNotSet = !log.arrivalTime || log.arrivalTime.trim() === '';

      return hasDeparted && arrivalNotSet;
    });
  }, [logs, currentTimeStr, todayStr]);

  const operatingShipCount = operatingLogs.length;

  const chartData = ships.map(ship => {
    const assignedCount = users.filter(u => u.assignedShip === ship.name).length;
    return {
      name: ship.name,
      assigned: assignedCount,
      capacity: ship.capacity,
      ratio: (assignedCount / ship.capacity) * 100
    };
  });

  const criticalShips = chartData.filter(d => d.ratio >= 90).length;
  const totalAssigned = users.filter(u => u.assignedShip !== null).length;

  const stats = [
    { label: '전체 선박', value: ships.length, Icon: ShipIcon, color: 'text-sky-600', bg: 'bg-sky-50' },
    { label: '현재 운항 중', value: operatingShipCount, Icon: Navigation, color: 'text-emerald-600', bg: 'bg-emerald-50', isLive: true },
    { label: '현재 가동인원', value: totalAssigned, Icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: '주의 선박', value: criticalShips, Icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight tracking-tight">운영 현황</h2>
          <p className="text-slate-500">선박별 가용 인원과 실시간 운항 현황을 확인합니다.</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Sync</p>
          <p className="text-xs font-bold text-slate-900">{new Date().toLocaleTimeString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center gap-4 shadow-sm relative overflow-hidden group">
            <div className={`${stat.bg} ${stat.color} p-3 rounded-xl transition-transform group-hover:scale-110 duration-300`}>
              <stat.Icon className={`w-6 h-6 ${stat.isLive && operatingShipCount > 0 ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                {stat.isLive && operatingShipCount > 0 && (
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Real-time Operation Status List */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-sky-600" />
              <h3 className="text-xl font-black text-slate-900">실시간 운항 현황</h3>
            </div>
            <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-lg border border-emerald-100 animate-pulse">
              LIVE
            </span>
          </div>

          <div className="space-y-4">
            {operatingLogs.length > 0 ? (
              operatingLogs.map((log) => (
                <button 
                  key={log.id} 
                  onClick={() => setSelectedLog(log)}
                  className="w-full text-left group p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-sky-300 hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md active:scale-[0.98]"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                        <ShipIcon className="w-4 h-4" />
                      </div>
                      <span className="font-black text-slate-800 group-hover:text-sky-700">{log.shipName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      운항 중
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {log.captainName} 선장
                    </div>
                    <div className="flex items-center gap-1.5 justify-end">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {log.departureTime} 출항
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 bg-slate-50 rounded-[24px] border border-dashed border-slate-200">
                <Navigation className="w-10 h-10 text-slate-200" />
                <p className="text-sm font-bold text-slate-400">현재 운항 중인 선박이 없습니다.</p>
              </div>
            )}
          </div>
        </div>

        {/* Capacity Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-slate-900">선박별 인원 배정률</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <div className="w-3 h-3 rounded-full bg-sky-500" />
                안전
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                주의
              </div>
            </div>
          </div>
          
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} 
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                />
                <Bar dataKey="ratio" radius={[10, 10, 0, 0]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.ratio >= 90 ? '#f43f5e' : '#0ea5e9'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Operation Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="bg-sky-600 p-2 rounded-xl text-white">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">{selectedLog.shipName} 실시간 운항 정보</h3>
                  <p className="text-xs text-slate-500">
                    {new Date(selectedLog.createdAt).toLocaleDateString()} 운항 기록
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedLog(null)} 
                className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-rose-500 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8 space-y-6">
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">선장 / 기관장</p>
                    <p className="font-bold text-slate-800">{selectedLog.captainName} / {selectedLog.chiefEngineer}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">운항 예정 시간</p>
                    <p className="font-bold text-slate-800">{selectedLog.departureTime} - {selectedLog.arrivalTime || '진행 중'}</p>
                  </div>
               </div>
               <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 grid grid-cols-3 gap-4">
                  <div className="text-center space-y-1">
                    <Users className="w-5 h-5 text-sky-600 mx-auto" />
                    <p className="text-xs text-slate-500 font-bold">탑승 승객</p>
                    <p className="text-lg font-black text-slate-900">{selectedLog.passengerCount || 0}명</p>
                  </div>
                  <div className="text-center space-y-1 border-x border-slate-200">
                    <Fuel className="w-5 h-5 text-orange-500 mx-auto" />
                    <p className="text-xs text-slate-500 font-bold">현재 연료</p>
                    <p className="text-lg font-black text-slate-900">{selectedLog.fuelStatus || '-'}</p>
                  </div>
                  <div className="text-center space-y-1">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                    <p className="text-xs text-slate-500 font-bold">운항 상태</p>
                    <p className="text-lg font-black text-emerald-600">운항 중</p>
                  </div>
               </div>
               <div className="space-y-2">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">투입 승무원</p>
                 <div className="flex flex-wrap gap-2">
                   {selectedLog.crewMembers.length > 0 ? (
                     selectedLog.crewMembers.map(crew => (
                       <span key={crew} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600">
                         {crew}
                       </span>
                     ))
                   ) : (
                     <span className="text-xs text-slate-400 font-medium italic">배정된 승무원 정보가 없습니다.</span>
                   )}
                 </div>
               </div>
               <div className="space-y-2">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">운항 메모</p>
                 <div className="p-4 bg-slate-50 rounded-xl text-sm text-slate-600 border border-slate-100 italic">
                   {selectedLog.notes || '현재 진행 중인 운항에 대한 특이사항이 없습니다.'}
                 </div>
               </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setSelectedLog(null)} 
                className="px-6 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors shadow-sm"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
