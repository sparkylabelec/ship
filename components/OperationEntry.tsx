
import React, { useState, useEffect } from 'react';
import { Ship, User, UserRole, OperationLog, TelegramConfig } from '../types.ts';
import { 
  Anchor, Users, Fuel, Save, CheckCircle2, 
  Navigation, AlertTriangle, X, 
  Timer, Check, Send, Clock, ChevronDown, MoveRight
} from 'lucide-react';

interface OperationEntryProps {
  ships: Ship[];
  users: User[];
  currentUser: User;
  onComplete: () => void;
  telegramConfig?: TelegramConfig;
  editingLog?: OperationLog | null;
}

// OperationEntry component implementation with default export to resolve import error in App.tsx
const OperationEntry: React.FC<OperationEntryProps> = ({ 
  ships, 
  users, 
  currentUser, 
  onComplete, 
  telegramConfig, 
  editingLog 
}) => {
  const [formData, setFormData] = useState<Partial<OperationLog>>({
    shipName: currentUser.assignedShip || '',
    captainName: currentUser.name,
    chiefEngineer: '',
    crewMembers: [],
    passengerCount: 0,
    fuelStatus: 0,
    notes: '',
    departureTime: '',
    arrivalTime: '',
    isDraft: true,
    weatherMorning: '좋음',
    weatherAfternoon: '좋음'
  });

  useEffect(() => {
    if (editingLog) {
      setFormData(editingLog);
    }
  }, [editingLog]);

  const handleSubmit = (isDraft: boolean) => {
    if (!formData.shipName || !formData.departureTime) {
      alert('선박명과 출발 시간은 필수 입력 사항입니다.');
      return;
    }

    const savedLogs = JSON.parse(localStorage.getItem('mms_logs') || '[]');
    const newLog: OperationLog = {
      id: editingLog?.id || `log_${Date.now()}`,
      shipName: formData.shipName!,
      captainName: formData.captainName!,
      departureTime: formData.departureTime!,
      arrivalTime: formData.arrivalTime || '',
      chiefEngineer: formData.chiefEngineer || '미배정',
      crewMembers: formData.crewMembers || [],
      passengerCount: formData.passengerCount || 0,
      fuelStatus: formData.fuelStatus || 0,
      notes: formData.notes || '',
      createdAt: editingLog?.createdAt || new Date().toISOString(),
      isDraft: isDraft,
      weatherMorning: formData.weatherMorning,
      weatherAfternoon: formData.weatherAfternoon
    };

    let updatedLogs;
    if (editingLog) {
      updatedLogs = savedLogs.map((l: OperationLog) => l.id === editingLog.id ? newLog : l);
    } else {
      updatedLogs = [newLog, ...savedLogs];
    }

    localStorage.setItem('mms_logs', JSON.stringify(updatedLogs));
    onComplete();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">운항 일지 작성</h2>
        <p className="text-slate-500 font-medium">선박의 실시간 운항 정보와 승객 현황을 기록합니다.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-[40px] p-8 md:p-12 shadow-sm space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Anchor className="w-3.5 h-3.5 text-sky-600" /> 선박 선택
            </label>
            <div className="relative">
              <select 
                value={formData.shipName}
                onChange={(e) => setFormData({...formData, shipName: e.target.value})}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:border-sky-600/20 focus:bg-white transition-all appearance-none cursor-pointer"
              >
                <option value="">운항 선박을 선택하세요</option>
                {ships.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Timer className="w-3.5 h-3.5 text-sky-600" /> 운항 시간 설정
            </label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input 
                  type="time" 
                  value={formData.departureTime}
                  onChange={(e) => setFormData({...formData, departureTime: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:border-sky-600/20 focus:bg-white transition-all" 
                />
              </div>
              <MoveRight className="w-4 h-4 text-slate-300" />
              <div className="relative flex-1">
                <input 
                  type="time" 
                  value={formData.arrivalTime}
                  onChange={(e) => setFormData({...formData, arrivalTime: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:border-sky-600/20 focus:bg-white transition-all" 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-sky-600" /> 탑승 승객수
            </label>
            <input 
              type="number" 
              placeholder="0"
              value={formData.passengerCount || ''}
              onChange={(e) => setFormData({...formData, passengerCount: parseInt(e.target.value) || 0})}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:border-sky-600/20 focus:bg-white transition-all" 
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Fuel className="w-3.5 h-3.5 text-orange-500" /> 연료 잔량
            </label>
            <input 
              type="number" 
              placeholder="0"
              value={formData.fuelStatus || ''}
              onChange={(e) => setFormData({...formData, fuelStatus: parseInt(e.target.value) || 0})}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:border-sky-600/20 focus:bg-white transition-all" 
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-emerald-500" /> 담당 기관장
            </label>
            <div className="relative">
              <select 
                value={formData.chiefEngineer}
                onChange={(e) => setFormData({...formData, chiefEngineer: e.target.value})}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:border-sky-600/20 focus:bg-white transition-all appearance-none cursor-pointer"
              >
                <option value="">기관장을 선택하세요</option>
                {users.filter(u => u.role === UserRole.CHIEF_ENGINEER).map(u => (
                  <option key={u.id} value={u.name}>{u.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
            <Navigation className="w-3.5 h-3.5 text-sky-600" /> 운항 특이사항 (기상 및 안전 점검)
          </label>
          <textarea 
            rows={5}
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            placeholder="기상 악화, 장비 점검, 승객 관련 특이사항 등을 기록하세요."
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 text-sm font-bold text-slate-900 outline-none focus:border-sky-600/20 focus:bg-white transition-all resize-none shadow-inner"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4 pt-6">
          <button 
            onClick={() => handleSubmit(true)}
            className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-2xl font-black text-lg hover:bg-slate-200 transition-all active:scale-95"
          >
            임시 저장 (운항 중)
          </button>
          <button 
            onClick={() => handleSubmit(false)}
            className="flex-[2] py-5 bg-sky-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-sky-600/20 hover:bg-sky-700 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <CheckCircle2 className="w-6 h-6" />
            작성 완료 및 일지 제출
          </button>
        </div>
      </div>
    </div>
  );
};

export default OperationEntry;
