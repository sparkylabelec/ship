
import React, { useState, useEffect } from 'react';
import { Ship, User, UserRole, OperationLog, TelegramConfig } from '../types';
import { 
  Anchor, Users, Fuel, Save, CheckCircle2, 
  Navigation, AlertTriangle, X, 
  Timer, Check, Send, Clock, ChevronDown
} from 'lucide-react';

interface OperationEntryProps {
  ships: Ship[];
  users: User[];
  currentUser: User;
  onComplete: () => void;
  telegramConfig?: TelegramConfig;
  editingLog?: OperationLog | null;
}

const calculateDuration = (start: string, end: string) => {
  if (!start || !end) return null;
  const [sH, sM] = start.split(':').map(Number);
  const [eH, eM] = end.split(':').map(Number);
  let diffMinutes = (eH * 60 + eM) - (sH * 60 + sM);
  if (diffMinutes < 0) diffMinutes += 24 * 60;
  const h = Math.floor(diffMinutes / 60);
  const m = diffMinutes % 60;
  if (h > 0 && m > 0) return `${h}시간 ${m}분`;
  if (h > 0) return `${h}시간`;
  return `${m}분`;
};

const OperationEntry: React.FC<OperationEntryProps> = ({ ships, users, currentUser, telegramConfig, onComplete, editingLog }) => {
  const [formData, setFormData] = useState<Partial<OperationLog>>({
    shipName: '',
    departureTime: '',
    arrivalTime: '',
    chiefEngineer: '',
    crewMembers: [],
    passengerCount: undefined,
    fuelStatus: undefined,
    notes: '',
    weatherMorning: '좋음',
    weatherAfternoon: '좋음'
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const [isDraftSuccess, setIsDraftSuccess] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  useEffect(() => {
    if (editingLog) {
      setFormData({ ...editingLog });
    } else {
      const draft = localStorage.getItem('mms_draft_form');
      if (draft) setFormData(JSON.parse(draft));
    }
  }, [editingLog]);

  useEffect(() => {
    if (Object.keys(formData).length > 0 && !isSuccess && !isDraftSuccess && !editingLog) {
      localStorage.setItem('mms_draft_form', JSON.stringify(formData));
    }
  }, [formData, isSuccess, isDraftSuccess, editingLog]);

  const durationStr = calculateDuration(formData.departureTime || '', formData.arrivalTime || '');

  const sendTelegramNotification = async (log: OperationLog, type: 'start' | 'finish') => {
    if (!telegramConfig?.botToken) return;

    const recipients = users.filter(u => 
      u.telegramChatId && (
        u.role === UserRole.ADMIN || 
        (telegramConfig.subscribedUserIds && telegramConfig.subscribedUserIds.includes(u.id))
      )
    );

    if (recipients.length === 0) return;

    const isStart = type === 'start';
    const title = isStart ? '🚢 [실시간 운항 등록 알림]' : '🏁 [실시간 운항 종료 알림]';
    const statusMsg = isStart ? '현 시각부로 실시간 운항 현황에 등록되었습니다.' : '운항이 종료되어 실시간 현황에서 해제되었습니다.';
    const crewStr = log.crewMembers && log.crewMembers.length > 0 ? log.crewMembers.join(', ') : '없음';
    
    const message = `${title}
${statusMsg}

• <b>선박명</b>: ${log.shipName}
• <b>선장</b>: ${log.captainName}
• <b>기관장</b>: ${log.chiefEngineer}
• <b>승무원</b>: ${crewStr}
• <b>운항시간</b>: ${log.departureTime} → ${log.arrivalTime || '미정'}
${!isStart ? `• <b>승객수</b>: ${log.passengerCount}명\n• <b>소요시간</b>: ${calculateDuration(log.departureTime, log.arrivalTime) || '-'}` : ''}

(나미나라 MMS 봇 자동 발송)`;

    for (const r of recipients) {
      await fetch(`https://api.telegram.org/bot${telegramConfig.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          chat_id: r.telegramChatId, 
          text: message, 
          parse_mode: 'HTML' 
        })
      }).catch(err => console.error(`Telegram send error to ${r.name}:`, err));
    }
  };

  const isFormValid = !!(
    formData.shipName && 
    formData.departureTime && 
    formData.arrivalTime && 
    formData.chiefEngineer && 
    formData.crewMembers?.length && 
    formData.passengerCount !== undefined && 
    formData.fuelStatus !== undefined
  );

  const canSaveDraft = !!formData.shipName;

  const handleSave = async (asDraft: boolean) => {
    const existingLogs: OperationLog[] = JSON.parse(localStorage.getItem('mms_logs') || '[]');
    
    const targetLog: OperationLog = {
      ...(formData as OperationLog),
      id: editingLog ? editingLog.id : crypto.randomUUID(),
      captainName: currentUser.name,
      isDraft: asDraft,
      createdAt: editingLog ? editingLog.createdAt : new Date().toISOString(),
    };
    
    const updatedLogs = editingLog 
      ? existingLogs.map(l => l.id === editingLog.id ? targetLog : l) 
      : [...existingLogs, targetLog];
      
    localStorage.setItem('mms_logs', JSON.stringify(updatedLogs));
    localStorage.removeItem('mms_draft_form');

    if (asDraft) {
      await sendTelegramNotification(targetLog, 'start');
      setIsDraftSuccess(true);
    } else {
      await sendTelegramNotification(targetLog, 'finish');
      setIsSuccess(true);
    }
    
    setTimeout(() => onComplete(), 1500);
  };

  const handleNumericInput = (field: 'passengerCount' | 'fuelStatus', val: string) => {
    const cleanVal = val.replace(/[^0-9]/g, '');
    setFormData(prev => ({ ...prev, [field]: cleanVal === '' ? undefined : parseInt(cleanVal) }));
  };

  const handleAddCrew = (name: string) => {
    if (!name) return;
    const members = formData.crewMembers || [];
    if (!members.includes(name)) {
      setFormData(prev => ({ ...prev, crewMembers: [...members, name] }));
    }
  };

  const handleRemoveCrew = (name: string) => {
    setFormData(prev => ({
      ...prev,
      crewMembers: (prev.crewMembers || []).filter(m => m !== name)
    }));
  };

  if (isSuccess || isDraftSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 animate-in zoom-in-95 duration-500">
        <div className={`w-20 h-20 ${isDraftSuccess ? 'bg-amber-500' : 'bg-emerald-500'} text-white rounded-full flex items-center justify-center shadow-lg shadow-black/10`}>
          {isDraftSuccess ? <Navigation className="w-10 h-10 animate-pulse" /> : <CheckCircle2 className="w-12 h-12" />}
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-900">
            {isDraftSuccess ? '실시간 운항 등록 완료' : '운항 일지 최종 제출'}
          </h2>
          <p className="text-slate-500 font-bold mt-2 flex items-center justify-center gap-2">
            <Send className="w-4 h-4 text-sky-500" /> 관리자에게 알림이 전송되었습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-40 animate-in fade-in duration-500">
      <div className="flex justify-between items-center px-1">
        <div>
           <h2 className="text-2xl font-black text-slate-900 tracking-tight">{editingLog ? '기록 수정하기' : '운항 일지 작성'}</h2>
           <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">안전 운항 정보를 입력하십시오.</p>
        </div>
        {!isFormValid && canSaveDraft && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-xl text-amber-600 animate-pulse">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-tight">실시간 운항 중</span>
          </div>
        )}
      </div>

      {/* 탑승 선박 */}
      <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
        <label className="flex items-center gap-2 text-sm font-black text-slate-800 tracking-tight"><Anchor className="w-4 h-4 text-sky-600" /> 탑승 선박</label>
        <div className="relative">
          <select value={formData.shipName || ''} onChange={(e) => setFormData(prev => ({...prev, shipName: e.target.value}))} className="w-full bg-white border border-slate-200 rounded-2xl p-6 text-lg font-black outline-none appearance-none focus:ring-4 focus:ring-sky-500/10 transition-all shadow-sm">
            <option value="">선박을 선택하세요</option>
            {ships.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
          <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 pointer-events-none" />
        </div>
      </div>

      {/* 출발/도착 시간 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 출발 시간 */}
        <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
          <label className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-2 ml-1">출발 시간</label>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white border border-slate-200 rounded-2xl px-5 py-4 flex items-center shadow-sm">
              <input type="time" value={formData.departureTime} onChange={(e) => setFormData(prev => ({...prev, departureTime: e.target.value}))} className="w-full text-2xl font-black bg-transparent outline-none" />
            </div>
            <button 
              onClick={() => {
                const now = new Date();
                setFormData(prev => ({ ...prev, departureTime: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}` }));
              }} 
              className="px-8 py-5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-2xl font-black text-base shadow-lg shadow-sky-600/30 active:scale-90 transition-all min-w-[100px]"
            >
              지금
            </button>
          </div>
        </div>

        {/* 도착 시간 */}
        <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
          <label className="text-xs font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2 ml-1">도착 시간</label>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white border border-slate-200 rounded-2xl px-5 py-4 flex items-center shadow-sm">
              <input type="time" value={formData.arrivalTime} onChange={(e) => setFormData(prev => ({...prev, arrivalTime: e.target.value}))} className="w-full text-2xl font-black bg-transparent outline-none" />
            </div>
            <button 
              onClick={() => {
                const now = new Date();
                setFormData(prev => ({ ...prev, arrivalTime: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}` }));
              }} 
              className="px-8 py-5 bg-[#e11d48] hover:bg-[#be123c] text-white rounded-2xl font-black text-base shadow-lg shadow-rose-600/30 active:scale-90 transition-all min-w-[100px]"
            >
              지금
            </button>
          </div>
        </div>
      </div>

      {durationStr && (
        <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 flex items-center justify-center gap-3 animate-in slide-in-from-top-2 duration-300">
          <Timer className="w-5 h-5 text-sky-600" />
          <span className="text-sm font-black text-sky-700">총 운항 소요 시간: <span className="text-lg underline underline-offset-4 tracking-tight">{durationStr}</span></span>
        </div>
      )}

      {/* 승선 인원 / 잔여 연료량 */}
      <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-8">
        <div className="space-y-4">
          <label className="text-sm font-black text-slate-800 flex items-center gap-2 ml-2 tracking-tight"><Users className="w-4 h-4 text-sky-600" /> 승선 인원</label>
          <div className="bg-white border border-slate-200 rounded-[24px] p-2 flex items-center justify-center min-h-[140px] relative shadow-inner group">
            <input type="text" inputMode="numeric" placeholder="0" value={formData.passengerCount ?? ''} onChange={(e) => handleNumericInput('passengerCount', e.target.value)} className="w-full text-center text-5xl font-black bg-transparent py-10 outline-none relative z-10" />
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none">
              <Users className="w-24 h-24" />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <label className="text-sm font-black text-slate-800 flex items-center gap-2 ml-2 tracking-tight"><Fuel className="w-4 h-4 text-orange-500" /> 잔여 연료량</label>
          <div className="bg-white border border-slate-200 rounded-[24px] p-2 flex items-center justify-center min-h-[140px] relative shadow-inner group">
            <input type="text" inputMode="numeric" placeholder="0" value={formData.fuelStatus ?? ''} onChange={(e) => handleNumericInput('fuelStatus', e.target.value)} className="w-full text-center text-5xl font-black bg-transparent py-10 outline-none relative z-10" />
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none">
              <Fuel className="w-24 h-24" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1 ml-1">작업자 배정</label>
        
        {/* 기관장 선택 */}
        <div className="bg-white border border-slate-200 rounded-[24px] overflow-hidden shadow-sm relative group focus-within:ring-4 focus-within:ring-sky-500/10">
          <select value={formData.chiefEngineer || ''} onChange={(e) => setFormData(prev => ({...prev, chiefEngineer: e.target.value}))} className="w-full p-6 font-black text-slate-800 outline-none appearance-none cursor-pointer bg-transparent relative z-10 text-lg">
            <option value="">기관장 선택</option>
            {users.filter(u => u.role === UserRole.CHIEF_ENGINEER).map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
          </select>
          <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 pointer-events-none" />
        </div>
        
        {/* 승무원 선택 (드롭다운 방식) */}
        <div className="bg-white p-6 rounded-[24px] border border-slate-200 space-y-5 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">승무원 선택</p>
          
          <div className="relative">
            <select 
              onChange={(e) => {
                handleAddCrew(e.target.value);
                e.target.value = "";
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:bg-white focus:border-sky-300 transition-all"
            >
              <option value="">승무원 목록에서 추가하려면 선택하세요</option>
              {users.filter(u => u.role === UserRole.WORKER || u.role === UserRole.CREW).map(u => (
                <option key={u.id} value={u.name}>{u.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {formData.crewMembers && formData.crewMembers.length > 0 ? (
              formData.crewMembers.map(name => (
                <div key={name} className="flex items-center gap-2 px-4 py-2 bg-sky-50 text-sky-700 rounded-xl text-xs font-black border border-sky-100 animate-in zoom-in-95 duration-200">
                  {name}
                  <button onClick={() => handleRemoveCrew(name)} className="hover:text-rose-500 transition-colors p-0.5">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-[11px] text-slate-300 font-bold italic py-2 ml-1">선택된 승무원이 없습니다.</p>
            )}
          </div>
        </div>
      </div>

      <textarea placeholder="특이사항 기록..." value={formData.notes} onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))} className="w-full bg-white border border-slate-200 rounded-[32px] p-6 text-sm font-medium h-32 outline-none focus:ring-4 focus:ring-sky-500/5 transition-all shadow-inner" />

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-lg border-t border-slate-100 z-50">
        <div className="max-w-md mx-auto grid grid-cols-2 gap-4">
          <button 
            disabled={!canSaveDraft} 
            onClick={() => handleSave(true)} 
            className={`py-7 rounded-[32px] font-black text-base shadow-xl transition-all flex flex-col items-center justify-center ${
              canSaveDraft 
              ? 'bg-white border-2 border-[#0284c7] text-[#0284c7] hover:bg-sky-50 active:scale-95 shadow-sky-600/10' 
              : 'bg-slate-50 text-slate-200 cursor-not-allowed border-2 border-slate-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <Send className={`w-5 h-5 ${canSaveDraft ? 'text-[#0284c7]' : 'text-slate-200'}`} /> 실시간 등록
            </div>
            <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">임시저장 및 알림</span>
          </button>
          
          <button 
            disabled={!isFormValid} 
            onClick={() => setIsConfirmModalOpen(true)} 
            className={`py-7 rounded-[32px] font-black text-base shadow-xl transition-all flex flex-col items-center justify-center ${
              isFormValid 
              ? 'bg-[#0284c7] text-white hover:bg-[#0369a1] active:scale-95 shadow-sky-600/30' 
              : 'bg-slate-100 text-slate-300 cursor-not-allowed'
            }`}
          >
             <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> 최종 제출
            </div>
            <span className="text-[10px] font-bold text-sky-200 mt-1 uppercase tracking-tighter">실시간 종료 및 기록</span>
          </button>
        </div>
      </div>

      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-[44px] shadow-2xl p-10 space-y-8 animate-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="w-20 h-20 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <Send className="w-10 h-10 text-[#0284c7]" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">운항 보고 확인</h3>
              <p className="text-xs text-slate-500 font-bold mt-2">입력된 정보가 정확합니까?</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-[28px] space-y-3 text-sm border border-slate-100 shadow-inner">
              <div className="flex justify-between items-center"><span className="text-slate-400 font-bold">선박</span><span className="font-black text-slate-800">{formData.shipName}</span></div>
              <div className="flex justify-between items-center"><span className="text-slate-400 font-bold">운행시간</span><span className="font-black text-sky-600 tracking-tight">{durationStr}</span></div>
              <div className="flex justify-between items-center"><span className="text-slate-400 font-bold">승객인원</span><span className="font-black text-slate-800">{formData.passengerCount}명</span></div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setIsConfirmModalOpen(false)} className="flex-1 py-5 bg-slate-100 rounded-[28px] font-black text-slate-500 hover:bg-slate-200 transition-colors">취소</button>
              <button onClick={() => handleSave(false)} className="flex-1 py-5 bg-[#0284c7] rounded-[28px] font-black text-white hover:bg-[#0369a1] transition-colors shadow-lg shadow-sky-600/20">확인/제출</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperationEntry;
