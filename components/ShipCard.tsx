
import React from 'react';
import { Ship, User } from '../types';
import { Anchor, Users, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ShipCardProps {
  ship: Ship;
  assignedUsers: User[];
  onDetailClick: () => void;
  onAssignClick: () => void;
}

const ShipCard: React.FC<ShipCardProps> = ({ ship, assignedUsers, onDetailClick, onAssignClick }) => {
  const currentCount = assignedUsers.length;
  const percentage = Math.min((currentCount / ship.capacity) * 100, 100);
  
  let statusColor = 'bg-emerald-500';
  let statusText = '여유';
  let textColor = 'text-emerald-600';
  let barBg = 'bg-emerald-500';
  
  if (percentage >= 100) {
    statusColor = 'bg-rose-500';
    statusText = '초과';
    textColor = 'text-rose-600';
    barBg = 'bg-rose-500';
  } else if (percentage >= 80) {
    statusColor = 'bg-amber-500';
    statusText = '포화';
    textColor = 'text-amber-600';
    barBg = 'bg-amber-500';
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-sky-200 hover:shadow-md transition-all group shadow-sm">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-sky-50 p-2 rounded-lg text-sky-600">
              <Anchor className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{ship.name}</h3>
              <p className="text-xs text-slate-400 uppercase tracking-wider">{ship.type}</p>
            </div>
          </div>
          <div className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${statusColor} text-white`}>
            {statusText}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-slate-400 mb-1">현재 정원</p>
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-black ${textColor}`}>{currentCount}</span>
                <span className="text-slate-400">/ {ship.capacity}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 mb-1">가용률</p>
              <p className={`font-mono font-bold ${textColor}`}>{percentage.toFixed(1)}%</p>
            </div>
          </div>

          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ease-out ${barBg}`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex items-center gap-2 text-xs py-2 px-3 bg-slate-50 rounded-lg border border-slate-100">
            {percentage >= 100 ? (
              <AlertCircle className="w-4 h-4 text-rose-500" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            )}
            <span className={percentage >= 100 ? 'text-rose-700 font-medium' : 'text-slate-600'}>
              {percentage >= 100 ? '정원 초과! 인력 재배치 필요' : '정원이 안전 범위 내에 있습니다'}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
        <button 
          onClick={onAssignClick}
          className="flex-1 py-2 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold transition-colors"
        >
          인력 배정
        </button>
        <button 
          onClick={onDetailClick}
          className="flex-1 py-2 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-semibold transition-colors"
        >
          상세보기
        </button>
      </div>
    </div>
  );
};

export default ShipCard;
