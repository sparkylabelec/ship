
import React, { useState } from 'react';
import { Ship, User } from '../types';
import { Anchor, Plus, X, Edit2, Trash2, Hash, Layers, Users } from 'lucide-react';
import ShipCard from './ShipCard';

interface ShipManagementProps {
  ships: Ship[];
  users: User[];
  onAddShip: (ship: Omit<Ship, 'id'>) => void;
  onUpdateShip: (ship: Ship) => void;
  onDeleteShip: (shipId: string) => void;
  onNavigateToUsers: () => void;
}

const ShipManagement: React.FC<ShipManagementProps> = ({ 
  ships, 
  users, 
  onAddShip, 
  onUpdateShip, 
  onDeleteShip,
  onNavigateToUsers
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShip, setEditingShip] = useState<Ship | null>(null);
  const [formData, setFormData] = useState<Omit<Ship, 'id'>>({
    name: '',
    capacity: 0,
    type: '여객선',
  });

  const openAddModal = () => {
    setEditingShip(null);
    setFormData({ name: '', capacity: 0, type: '여객선' });
    setIsModalOpen(true);
  };

  const openEditModal = (ship: Ship) => {
    setEditingShip(ship);
    setFormData({ name: ship.name, capacity: ship.capacity, type: ship.type });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.capacity <= 0) return;

    if (editingShip) {
      onUpdateShip({ ...formData, id: editingShip.id });
    } else {
      onAddShip(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">선박 정보 관리</h2>
          <p className="text-slate-500">보유 선박의 제원과 실시간 탑승 현황을 관리하고 수정합니다.</p>
        </div>
        <div className="flex gap-3">
          <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 text-xs font-bold rounded-full border border-rose-100 h-fit self-center">
            <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
            정원 초과 주의
          </span>
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all transform hover:scale-105 shadow-md shadow-sky-600/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            신규 선박 등록
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ships.map(ship => (
          <div key={ship.id} className="relative group">
            <ShipCard 
              ship={ship}
              assignedUsers={users.filter(u => u.assignedShip === ship.name)}
              onDetailClick={() => openEditModal(ship)}
              onAssignClick={onNavigateToUsers}
            />
            {/* Overlay Edit/Delete Buttons */}
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => openEditModal(ship)}
                className="p-2 bg-white/90 backdrop-blur shadow-sm rounded-lg text-sky-600 hover:text-sky-700 transition-colors border border-slate-100"
                title="수정"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => {
                  if(confirm(`${ship.name} 정보를 삭제하시겠습니까?`)) {
                    onDeleteShip(ship.id);
                  }
                }}
                className="p-2 bg-white/90 backdrop-blur shadow-sm rounded-lg text-rose-500 hover:text-rose-600 transition-colors border border-slate-100"
                title="삭제"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Ship Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="bg-sky-600 p-2 rounded-xl text-white">
                  <Anchor className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    {editingShip ? '선박 정보 수정' : '신규 선박 등록'}
                  </h3>
                  <p className="text-xs text-slate-500">선박의 명칭과 최대 정원을 설정하세요.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-rose-500 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-wider ml-1">
                  <Anchor className="w-3 h-3" /> 선박 명칭
                </label>
                <input 
                  required
                  type="text"
                  placeholder="예: 탐나라호"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:border-sky-600/20 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-wider ml-1">
                    <Hash className="w-3 h-3" /> 최대 정원
                  </label>
                  <input 
                    required
                    type="number"
                    placeholder="300"
                    value={formData.capacity || ''}
                    onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 0})}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:border-sky-600/20 focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-wider ml-1">
                    <Layers className="w-3 h-3" /> 선박 유형
                  </label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:border-sky-600/20 focus:bg-white appearance-none cursor-pointer"
                  >
                    <option value="여객선">여객선</option>
                    <option value="크루즈">크루즈</option>
                    <option value="화물선">화물선</option>
                    <option value="유람선">유람선</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 px-6 rounded-2xl bg-slate-100 text-slate-600 font-black hover:bg-slate-200 transition-colors"
                >
                  취소
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-4 px-6 rounded-2xl bg-sky-600 text-white font-black shadow-lg shadow-sky-600/20 hover:bg-sky-700 transition-all active:scale-95"
                >
                  {editingShip ? '수정 완료' : '등록 완료'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipManagement;
