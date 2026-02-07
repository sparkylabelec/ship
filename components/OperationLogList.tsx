
import React, { useState } from 'react';
import { OperationLog, Ship, User, UserRole } from '../types';
import { exportLogsToExcel } from '../services/xlsxService';
import { 
  Search, 
  Filter, 
  Calendar, 
  Anchor, 
  Users, 
  Fuel, 
  Navigation, 
  ChevronRight, 
  X, 
  Download, 
  FileText,
  CheckCircle2,
  Clock,
  ArrowRight,
  User as UserIcon,
  RotateCcw,
  Printer,
  CalendarDays,
  ChevronDown,
  Maximize2,
  ArrowLeft,
  Edit2,
  Trash2,
  Timer,
  FileSpreadsheet,
  CheckSquare,
  Square
} from 'lucide-react';

interface OperationLogListProps {
  logs: OperationLog[];
  ships: Ship[];
  currentUser: User;
  onDeleteLog: (id: string) => void;
  onEditLog: (log: OperationLog) => void;
}

// 로컬 날짜 문자열 (YYYY-MM-DD) 반환 유틸리티
const getLocalDateString = (dateInput: string | Date) => {
  const d = new Date(dateInput);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 소요 시간 계산 유틸리티
const calculateDuration = (start: string, end: string) => {
  if (!start || !end) return null;
  const [sH, sM] = start.split(':').map(Number);
  const [eH, eM] = end.split(':').map(Number);
  let diffMinutes = (eH * 60 + eM) - (sH * 60 + sM);
  if (diffMinutes < 0) diffMinutes += 24 * 60; // 자정 넘김 대응
  
  const h = Math.floor(diffMinutes / 60);
  const m = diffMinutes % 60;
  
  if (h > 0 && m > 0) return `${h}시간 ${m}분`;
  if (h > 0) return `${h}시간`;
  return `${m}분`;
};

// 소요 시간(분) 반환 유틸리티 (합계용)
const getDurationMinutes = (start: string, end: string) => {
  if (!start || !end) return 0;
  const [sH, sM] = start.split(':').map(Number);
  const [eH, eM] = end.split(':').map(Number);
  let diff = (eH * 60 + eM) - (sH * 60 + sM);
  return diff < 0 ? diff + 1440 : diff;
};

const OperationLogList: React.FC<OperationLogListProps> = ({ logs, ships, currentUser, onDeleteLog, onEditLog }) => {
  const [selectedLog, setSelectedLog] = useState<OperationLog | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterShip, setFilterShip] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'completed' | 'draft'>('all');
  const [selectedLogIds, setSelectedLogIds] = useState<Set<string>>(new Set());
  
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isPreviewingReport, setIsPreviewingReport] = useState(false);
  const [printDate, setPrintDate] = useState(getLocalDateString(new Date()));
  const [printShip, setPrintShip] = useState(ships.length > 0 ? ships[0].name : '');

  const isCaptain = currentUser.role === UserRole.CAPTAIN;
  
  const handleSetToday = () => {
    const today = getLocalDateString(new Date());
    setFilterDate(filterDate === today ? '' : today);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterShip('');
    setFilterDate('');
    setActiveTab('all');
    setSelectedLogIds(new Set());
  };

  const filteredLogs = logs.filter(log => {
    const logDate = getLocalDateString(log.createdAt);
    if (isCaptain && log.captainName !== currentUser.name) return false;
    
    const matchesSearch = searchTerm === '' || 
      log.captainName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.shipName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.notes && log.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesShip = filterShip === '' || log.shipName === filterShip;
    
    // 날짜 필터링: filterDate가 '2026-02-07' 형식일 때 logDate와 정확히 비교
    const matchesDate = filterDate === '' || logDate === filterDate;
    
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'completed' && !log.isDraft) || 
      (activeTab === 'draft' && log.isDraft);
      
    return matchesSearch && matchesShip && matchesDate && matchesTab;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // 체크박스 제어
  const toggleSelectAll = () => {
    if (selectedLogIds.size === filteredLogs.length && filteredLogs.length > 0) {
      setSelectedLogIds(new Set());
    } else {
      setSelectedLogIds(new Set(filteredLogs.map(l => l.id)));
    }
  };

  const toggleSelectLog = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelected = new Set(selectedLogIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedLogIds(newSelected);
  };

  const handleExcelExport = () => {
    const selectedLogs = logs.filter(l => selectedLogIds.has(l.id));
    if (selectedLogs.length === 0) return;
    exportLogsToExcel(selectedLogs);
  };

  const getLogsForPrint = () => {
    return logs.filter(log => 
      getLocalDateString(log.createdAt) === printDate && 
      !log.isDraft &&
      (printShip === '' || log.shipName === printShip)
    ).sort((a, b) => a.departureTime.localeCompare(b.departureTime));
  };

  const printData = getLogsForPrint();
  const totalPassengers = printData.reduce((sum, log) => sum + (log.passengerCount || 0), 0);
  const totalTrips = printData.length;
  
  // 누적 운항 시간 계산
  const totalMinutes = printData.reduce((sum, log) => sum + getDurationMinutes(log.departureTime, log.arrivalTime), 0);
  const totalDurationStr = `${Math.floor(totalMinutes / 60)}시간 ${totalMinutes % 60}분`;

  const handleEnterPreview = () => {
    setIsPrintModalOpen(false);
    setIsPreviewingReport(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('정말로 이 운항 기록을 삭제하시겠습니까?')) onDeleteLog(id);
  };

  const handleEditClick = (e: React.MouseEvent, log: OperationLog) => {
    e.stopPropagation();
    onEditLog(log);
  };

  const getStatusBadge = (isDraft: boolean) => (
    <span className={`px-3 py-1.5 rounded-full text-[11px] font-black border ${isDraft ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
      {isDraft ? '임시저장' : '완료됨'}
    </span>
  );

  const kd = getFullKoreanDate(printDate);

  if (isPreviewingReport) {
    return (
      <div className="fixed inset-0 z-[100] bg-white overflow-y-auto preview-mode">
        <div className="fixed top-6 right-6 flex items-center gap-3 print:hidden z-[110]">
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-sky-600 text-white px-6 py-4 rounded-2xl font-black shadow-2xl hover:bg-sky-700 transition-all active:scale-95">
            <Printer className="w-5 h-5" /> 지금 인쇄
          </button>
          <button onClick={() => setIsPreviewingReport(false)} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-2xl font-black shadow-2xl hover:bg-slate-800 transition-all active:scale-95">
            <ArrowLeft className="w-5 h-5" /> 목록으로 돌아가기
          </button>
        </div>

        <div className="report-print-area w-[210mm] mx-auto p-[10mm] bg-white text-[#00AEEF]">
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              @page { size: A4 portrait; margin: 0; }
              body * { visibility: hidden; }
              .report-print-area, .report-print-area * { visibility: visible; }
              .report-print-area { position: absolute; left: 0; top: 0; width: 210mm; padding: 10mm; }
            }
            .marine-grid { border-collapse: collapse; width: 100%; border: 2.5px solid #00AEEF; }
            .marine-grid th, .marine-grid td { border: 1.5px solid #00AEEF; padding: 4px; text-align: center; color: black; font-size: 11px; height: 26px; }
            .marine-grid th { color: #00AEEF; font-weight: 900; background-color: #f8fcfd; }
          `}} />

          <div className="border-[2.5px] border-[#00AEEF] p-5 h-full flex flex-col min-h-[277mm] relative">
            <div className="flex justify-between items-start mb-4 w-full">
              <div className="border-[1.5px] border-[#00AEEF] p-4 flex items-center justify-center gap-4 h-24 w-[180px] bg-[#f8fcfd]">
                <div className="text-center">
                  <p className="text-[10px] font-black text-[#00AEEF] mb-1">총 누적 운항시간</p>
                  <span className="text-2xl font-black text-black">{totalDurationStr}</span>
                </div>
              </div>

              <div className="flex gap-0">
                <div className="flex flex-col">
                  <div className="border-[1.5px] border-[#00AEEF] w-[240px] h-[40px] flex items-center justify-center text-black font-bold text-[16px] border-b-0">
                    <span className="tracking-widest">{kd.year}년 {kd.month}월 {kd.day}일 {kd.weekDay.charAt(0)} 요일</span>
                  </div>
                  <div className="flex border-[1.5px] border-[#00AEEF] w-[240px] h-[56px]">
                    <div className="w-[60px] border-r border-[#00AEEF] flex items-center justify-center font-black text-[14px] text-[#00AEEF]">기상</div>
                    <div className="flex-1 flex flex-col">
                      <div className="flex-1 border-b border-[#00AEEF] flex items-center">
                         <span className="w-12 text-center text-[10px] font-bold border-r border-[#00AEEF] h-full flex items-center justify-center text-[#00AEEF]">오전</span>
                         <span className="flex-1 text-center text-[12px] font-bold text-black">{printData[0]?.weatherMorning || '좋음'}</span>
                      </div>
                      <div className="flex-1 flex items-center">
                         <span className="w-12 text-center text-[10px] font-bold border-r border-[#00AEEF] h-full flex items-center justify-center text-[#00AEEF]">오후</span>
                         <span className="flex-1 text-center text-[12px] font-bold text-black">{printData[0]?.weatherAfternoon || '좋음'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex h-24 border-[1.5px] border-[#00AEEF] border-l-0">
                  <div className="w-12 flex items-center justify-center border-r border-[#00AEEF] bg-[#f8fcfd]"><span className="text-[14px] font-black leading-tight text-center text-[#00AEEF]">서<br/>명</span></div>
                  <div className="flex flex-col">
                    <div className="flex border-b border-[#00AEEF] h-8">
                      <div className="w-24 border-r border-[#00AEEF] flex items-center justify-center font-black text-[11px] text-[#00AEEF]">기관장</div>
                      <div className="w-24 flex items-center justify-center font-black text-[11px] text-[#00AEEF]">선장</div>
                    </div>
                    <div className="flex h-16">
                      <div className="w-24 border-r border-[#00AEEF] flex items-center justify-center font-serif text-slate-300 italic text-[14px]">{printData[0]?.chiefEngineer || ''}</div>
                      <div className="w-24 flex items-center justify-center font-serif text-slate-300 italic text-[14px]">{printData[0]?.captainName || ''}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mb-8 mt-4">
              <h1 className="text-[64px] font-black tracking-[0.25em] text-[#00AEEF] leading-none mb-1">선 박 운 항 일 지</h1>
              <p className="text-[18px] font-bold text-[#00AEEF] tracking-tight">출/입항기록 & 각종장비점검</p>
            </div>

            <div className="grid grid-cols-2 gap-4 border-[1.5px] border-[#00AEEF] p-3 mb-6 text-[13px] font-black text-black">
              <div className="flex gap-6">
                <div><span className="text-[#00AEEF]">선박명:</span> {printData[0]?.shipName || '-'}</div>
                <div><span className="text-[#00AEEF]">선장:</span> {printData[0]?.captainName || '-'}</div>
                <div><span className="text-[#00AEEF]">총 운항시간:</span> {totalDurationStr}</div>
              </div>
              <div className="flex justify-between">
                <div><span className="text-[#00AEEF]">총 승객:</span> {totalPassengers} 명</div>
                <div><span className="text-[#00AEEF]">총 운항:</span> {totalTrips} 회</div>
                <div><span className="text-[#00AEEF]">승무원:</span> {printData[0]?.crewMembers.join(', ') || '-'}</div>
              </div>
            </div>

            <div className="flex flex-1 gap-[2px]">
              <div className="flex-1">
                <table className="marine-grid">
                  <thead>
                    <tr><th className="w-10">항차</th><th className="w-20">출발</th><th className="w-20">도착</th><th className="w-20">소요</th><th>비고</th></tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 25 }).map((_, idx) => {
                      const log = printData.slice(0, 25)[idx];
                      return (
                        <tr key={idx}>
                          <td className="font-bold text-[#00AEEF]">{idx + 1}</td>
                          <td className="font-mono">{log?.departureTime || ''}</td>
                          <td className="font-mono">{log?.arrivalTime || ''}</td>
                          <td className="font-bold text-slate-500">{log ? calculateDuration(log.departureTime, log.arrivalTime) : ''}</td>
                          <td className="text-left px-2 text-[10px]">{log ? `${log.notes || ''} (${log.passengerCount}명)` : ''}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex-1">
                <table className="marine-grid">
                  <thead>
                    <tr><th className="w-10">항차</th><th className="w-20">출발</th><th className="w-20">도착</th><th className="w-20">소요</th><th>비고</th></tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 25 }).map((_, idx) => {
                      const log = printData.slice(25, 50)[idx];
                      return (
                        <tr key={idx}>
                          <td className="font-bold text-[#00AEEF]">{idx + 26}</td>
                          <td className="font-mono">{log?.departureTime || ''}</td>
                          <td className="font-mono">{log?.arrivalTime || ''}</td>
                          <td className="font-bold text-slate-500">{log ? calculateDuration(log.departureTime, log.arrivalTime) : ''}</td>
                          <td className="text-left px-2 text-[10px]">{log ? `${log.notes || ''} (${log.passengerCount}명)` : ''}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="mt-8 flex flex-col items-center gap-2 pt-6 border-t border-[#00AEEF]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-[#00AEEF] flex items-center justify-center p-1"><div className="w-full h-full rounded-full border-[1.5px] border-[#00AEEF] flex items-center justify-center font-black text-[10px]">나미</div></div>
                <h2 className="text-2xl font-black tracking-[0.3em] text-black">나미나라공화국 남이섬</h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{isCaptain ? '내 운항 기록' : '(주)남이섬 운항 일지 관리'}</h2>
          <p className="text-slate-500 mt-1 text-sm md:text-base">{isCaptain ? `${currentUser.name} 선장님의 기록입니다.` : '운항 기록을 실시간으로 확인하고 관리합니다.'}</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {!isCaptain && (
            <>
              <button 
                disabled={selectedLogIds.size === 0}
                onClick={handleExcelExport}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm text-xs ${
                  selectedLogIds.size > 0 
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" /> 엑셀 내보내기
              </button>
              <button onClick={() => setIsPrintModalOpen(true)} className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm hover:bg-slate-50 text-xs">
                <Printer className="w-4 h-4 text-sky-600" /> 일계표 출력
              </button>
            </>
          )}
          <button onClick={handleResetFilters} className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm hover:bg-slate-50 text-xs">
            <RotateCcw className="w-3.5 h-3.5" /> 초기화
          </button>
        </div>
      </div>

      <div className="bg-[#f1f5f9] border border-slate-200 rounded-[32px] overflow-hidden shadow-sm p-5 relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input type="text" placeholder="내용 검색" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white border border-slate-100 rounded-xl py-3 px-4 text-sm focus:outline-none shadow-sm font-medium" />
          {!isCaptain && (
            <div className="relative">
              <select value={filterShip} onChange={(e) => setFilterShip(e.target.value)} className="w-full bg-white border border-slate-100 rounded-xl py-3 px-4 text-sm focus:outline-none appearance-none font-medium shadow-sm">
                <option value="">모든 선박</option>
                {ships.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
            </div>
          )}
          <div className="flex gap-2">
            <div className="relative flex-1">
               <input 
                 type="date" 
                 value={filterDate} 
                 onChange={(e) => setFilterDate(e.target.value)} 
                 className="w-full bg-white border border-slate-100 rounded-xl py-3 px-4 text-sm focus:outline-none shadow-sm font-medium" 
               />
               {!filterDate && (
                 <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
               )}
            </div>
            <button 
              onClick={handleSetToday} 
              className={`px-4 py-1 rounded-xl text-[10px] font-bold transition-all ${filterDate === getLocalDateString(new Date()) ? 'bg-sky-600 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-100'}`}
            >
              오늘
            </button>
          </div>
        </div>

        {selectedLogIds.size > 0 && (
          <div className="absolute top-0 left-0 right-0 bottom-0 bg-sky-600 rounded-[32px] flex items-center justify-between px-8 animate-in fade-in zoom-in-95 duration-200 z-10">
            <div className="flex items-center gap-4 text-white">
              <CheckSquare className="w-6 h-6" />
              <span className="text-lg font-black">{selectedLogIds.size}개의 항목이 선택됨</span>
            </div>
            <div className="flex gap-3">
               <button onClick={handleExcelExport} className="bg-white text-sky-600 px-6 py-2 rounded-xl font-black text-sm flex items-center gap-2 shadow-xl active:scale-95 transition-all">
                 <FileSpreadsheet className="w-4 h-4" /> 엑셀 다운로드
               </button>
               <button onClick={() => setSelectedLogIds(new Set())} className="bg-sky-500 text-white px-4 py-2 rounded-xl font-black text-sm hover:bg-sky-400 transition-all">
                 선택 해제
               </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                {!isCaptain && (
                  <th className="px-6 py-4 w-12">
                    <button onClick={toggleSelectAll} className="text-slate-400 hover:text-sky-600 transition-colors">
                      {selectedLogIds.size === filteredLogs.length && filteredLogs.length > 0 ? <CheckSquare className="w-5 h-5 text-sky-600" /> : <Square className="w-5 h-5" />}
                    </button>
                  </th>
                )}
                <th className="px-6 py-4">날짜</th>
                <th className="px-6 py-4">선박</th>
                <th className="px-6 py-4">운항 시간</th>
                <th className="px-6 py-4">총 운행시간</th>
                <th className="px-6 py-4">상태</th>
                <th className="px-6 py-4 text-right">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className={`hover:bg-slate-50 transition-colors cursor-pointer group ${selectedLogIds.has(log.id) ? 'bg-sky-50/50' : ''}`} onClick={() => setSelectedLog(log)}>
                  {!isCaptain && (
                    <td className="px-6 py-4">
                       <button onClick={(e) => toggleSelectLog(log.id, e)} className="text-slate-300 hover:text-sky-600 transition-colors">
                         {selectedLogIds.has(log.id) ? <CheckSquare className="w-5 h-5 text-sky-600" /> : <Square className="w-5 h-5" />}
                       </button>
                    </td>
                  )}
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">
                    {new Date(log.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="p-2 bg-sky-50 text-sky-600 rounded-lg"><Anchor className="w-4 h-4" /></div><span className="font-bold text-slate-800">{log.shipName}</span></div></td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-mono">{log.departureTime} → {log.arrivalTime}</td>
                  <td className="px-6 py-4 font-black text-sky-600 text-sm">{calculateDuration(log.departureTime, log.arrivalTime) || '-'}</td>
                  <td className="px-6 py-4">{getStatusBadge(log.isDraft)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                       <button onClick={(e) => handleEditClick(e, log)} className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all"><Edit2 className="w-4 h-4" /></button>
                       <button onClick={(e) => handleDeleteClick(e, log.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={isCaptain ? 6 : 7} className="px-6 py-20 text-center text-slate-400 font-bold">기록이 존재하지 않습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y divide-slate-100">
          {filteredLogs.map((log) => (
            <div key={log.id} className={`p-5 flex gap-4 active:bg-slate-50 ${selectedLogIds.has(log.id) ? 'bg-sky-50/50 border-l-4 border-sky-600' : ''}`} onClick={() => setSelectedLog(log)}>
              {!isCaptain && (
                <button onClick={(e) => toggleSelectLog(log.id, e)} className="shrink-0 mt-1">
                   {selectedLogIds.has(log.id) ? <CheckSquare className="w-6 h-6 text-sky-600" /> : <Square className="w-6 h-6 text-slate-300" />}
                </button>
              )}
              <div className="flex-1 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <span className="font-black text-slate-900">{log.shipName}</span>
                  <div className="flex gap-2">
                    <button onClick={(e) => handleEditClick(e, log)} className="p-1.5 text-sky-600 bg-sky-50 rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => handleDeleteClick(e, log.id)} className="p-1.5 text-rose-600 bg-rose-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <div className="flex justify-between items-end text-xs font-bold">
                  <div className="space-y-1">
                    <p className="text-slate-400">날짜: {new Date(log.createdAt).toLocaleDateString()}</p>
                    <p className="text-slate-400">운항: {log.departureTime} - {log.arrivalTime}</p>
                    <p className="text-sky-600">소요: {calculateDuration(log.departureTime, log.arrivalTime)}</p>
                  </div>
                  {getStatusBadge(log.isDraft)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedLog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-black text-slate-900">{selectedLog.shipName} 운항 상세</h3>
              <button onClick={() => setSelectedLog(null)}><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            <div className="p-8 space-y-6">
               <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <div className="text-center border-r border-slate-200">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">운항 시간</p>
                    <p className="font-bold text-slate-800 text-lg">{selectedLog.departureTime} - {selectedLog.arrivalTime}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">총 운행시간</p>
                    <p className="font-black text-sky-600 text-lg">{calculateDuration(selectedLog.departureTime, selectedLog.arrivalTime)}</p>
                  </div>
               </div>
               <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <Users className="w-5 h-5 text-sky-600 mx-auto mb-1" />
                    <p className="text-xs font-bold text-slate-500">승객 {selectedLog.passengerCount}명</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <Fuel className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                    <p className="text-xs font-bold text-slate-500">연료 {selectedLog.fuelStatus}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <Timer className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                    <p className="text-xs font-bold text-slate-500">작업 완료</p>
                  </div>
               </div>
               <div className="p-4 bg-slate-50 rounded-xl text-sm italic text-slate-600 border border-slate-100">
                 {selectedLog.notes || '메모 없음'}
               </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button onClick={() => setSelectedLog(null)} className="px-8 py-3 bg-white border border-slate-200 rounded-xl font-black text-slate-600">닫기</button>
            </div>
          </div>
        </div>
      )}

      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-[440px] rounded-[40px] shadow-2xl overflow-hidden p-8 space-y-8 border border-slate-200">
            <div className="flex justify-between items-center"><h3 className="text-2xl font-black text-slate-900 tracking-tight">운항 일계표 출력</h3><button onClick={() => setIsPrintModalOpen(false)}><X className="w-6 h-6 text-slate-400" /></button></div>
            <div className="space-y-4">
              <input type="date" value={printDate} onChange={(e) => setPrintDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-base font-bold text-slate-900" />
              <select value={printShip} onChange={(e) => setPrintShip(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-base font-bold text-slate-900 appearance-none">
                {ships.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div className="bg-sky-50 p-6 rounded-3xl border border-sky-100"><p className="text-xs font-black text-sky-600 mb-2 uppercase tracking-widest">일간 요약</p><div className="flex justify-between"><div className="text-center"><p className="text-xs font-bold text-slate-500">총 운항</p><p className="text-xl font-black text-slate-900">{totalTrips}회</p></div><div className="text-center"><p className="text-xs font-bold text-slate-500">총 시간</p><p className="text-xl font-black text-slate-900">{totalDurationStr}</p></div><div className="text-center"><p className="text-xs font-bold text-slate-500">총 승객</p><p className="text-xl font-black text-slate-900">{totalPassengers}명</p></div></div></div>
            <button disabled={totalTrips === 0} onClick={handleEnterPreview} className={`w-full py-5 rounded-3xl font-black text-lg shadow-xl ${totalTrips === 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-sky-600 text-white hover:bg-sky-700 active:scale-95 transition-all'}`}>보고서 미리보기 & 인쇄</button>
          </div>
        </div>
      )}
    </div>
  );
};

const getFullKoreanDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const weekDays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate(), weekDay: weekDays[date.getDay()] };
};

export default OperationLogList;
