
import React, { useState } from 'react';
import { User, UserRole, Ship } from '../types';
import { ROLE_STYLES } from '../constants';
import { 
  Search, Filter, Edit2, UserPlus, X, Shield, Phone, 
  Anchor, User as UserIcon, Check, MessageCircle, Info 
} from 'lucide-react';

interface UserManagementProps {
  users: User[];
  ships: Ship[];
  onUpdateUserRole: (userId: string, newRole: UserRole) => void;
  onUpdateUserShip: (userId: string, newShipName: string | null) => void;
  onUpdateUser: (user: User) => void;
  onAddUser: (user: Omit<User, 'id' | 'joinDate'>) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, ships, onUpdateUserRole, onUpdateUserShip, onUpdateUser, onAddUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Omit<User, 'id' | 'joinDate'>>({
    name: '',
    contact: '',
    role: UserRole.WORKER,
    assignedShip: null,
    telegramChatId: '',
  });

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.contact.includes(searchTerm) ||
    (user.assignedShip && user.assignedShip.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      contact: '',
      role: UserRole.WORKER,
      assignedShip: null,
      telegramChatId: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      contact: user.contact,
      role: user.role,
      assignedShip: user.assignedShip,
      telegramChatId: user.telegramChatId || '',
    });
    setIsModalOpen(true);
  };

  const handleChatIdChange = (val: string) => {
    // Only allow numbers for Telegram ChatID
    const numericVal = val.replace(/[^0-9]/g, '');
    setFormData({ ...formData, telegramChatId: numericVal });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.contact) return;
    
    if (editingUser) {
      onUpdateUser({
        ...editingUser,
        ...formData
      });
    } else {
      onAddUser(formData);
    }
    
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">인력 관리</h2>
          <p className="text-slate-500">시스템에 등록된 모든 작업자와 관리 권한을 설정합니다.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all transform hover:scale-105 shadow-md shadow-sky-600/20 active:scale-95"
        >
          <UserPlus className="w-5 h-5" />
          신규 인력 등록
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="이름, 연락처 또는 선박명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              <Filter className="w-4 h-4" />
              필터
            </button>
            <div className="px-4 py-2 bg-slate-100 rounded-xl text-sm font-bold text-slate-500">
              전체 {users.length}명
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                <th className="px-6 py-4">사용자</th>
                <th className="px-6 py-4">등급 / 권한</th>
                <th className="px-6 py-4">배정 선박</th>
                <th className="px-6 py-4">연락처 / ChatID</th>
                <th className="px-6 py-4">가입일</th>
                <th className="px-6 py-4 text-right">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold">
                        {user.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{user.name}</p>
                        <p className="text-xs text-slate-400">ID: {user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-bold ${ROLE_STYLES[user.role].bg} ${ROLE_STYLES[user.role].text}`}>
                      {user.role}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {user.assignedShip || <span className="text-slate-300">미배정</span>}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex flex-col">
                      <span className="text-slate-500 font-mono">{user.contact}</span>
                      {user.telegramChatId && (
                        <span className="text-[10px] text-sky-500 font-bold flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" /> {user.telegramChatId}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {user.joinDate}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => openEditModal(user)}
                      className="p-2 text-slate-400 hover:text-sky-600 transition-colors"
                      title="정보 수정"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-400">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="bg-sky-600 p-2 rounded-xl text-white">
                  {editingUser ? <Edit2 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">{editingUser ? '인력 정보 수정' : '신규 인력 등록'}</h3>
                  <p className="text-xs text-slate-500">인력의 기본 정보와 역할을 설정하세요.</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-wider ml-1">
                    <UserIcon className="w-3 h-3" /> 성명
                  </label>
                  <input 
                    required
                    type="text"
                    placeholder="홍길동"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:border-sky-600/20 focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-wider ml-1">
                    <Phone className="w-3 h-3" /> 연락처
                  </label>
                  <input 
                    required
                    type="text"
                    placeholder="010-0000-0000"
                    value={formData.contact}
                    onChange={(e) => setFormData({...formData, contact: e.target.value})}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:border-sky-600/20 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Telegram ChatID Field */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-wider ml-1">
                  <MessageCircle className="w-3 h-3 text-sky-500" /> Telegram ChatID
                </label>
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="숫자만 입력 (예: 12345678)"
                    value={formData.telegramChatId || ''}
                    onChange={(e) => handleChatIdChange(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:border-sky-600/20 focus:bg-white transition-all pr-10"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sky-400">
                    <Check className="w-4 h-4 opacity-30" />
                  </div>
                </div>
                <p className="flex items-center gap-1 text-[10px] text-slate-400 font-bold px-2">
                  <Info className="w-3 h-3" />
                  Telegram에서 @userinfobot을 통해 확인 가능합니다.
                </p>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-wider ml-1">
                  <Shield className="w-3 h-3" /> 역할 / 등급
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(UserRole).map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setFormData({...formData, role})}
                      className={`px-4 py-3 rounded-xl border-2 font-bold text-sm transition-all text-left flex items-center justify-between ${
                        formData.role === role 
                        ? 'bg-sky-50 border-sky-600 text-sky-700' 
                        : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
                      }`}
                    >
                      {role}
                      {formData.role === role && <Check className="w-4 h-4 text-sky-600" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-wider ml-1">
                  <Anchor className="w-3 h-3" /> 배정 선박 (선택사항)
                </label>
                <div className="relative">
                  <select
                    value={formData.assignedShip || ''}
                    onChange={(e) => setFormData({...formData, assignedShip: e.target.value || null})}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:border-sky-600/20 focus:bg-white appearance-none cursor-pointer"
                  >
                    <option value="">미배정</option>
                    {ships.map(ship => (
                      <option key={ship.id} value={ship.name}>{ship.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Anchor className="w-4 h-4 opacity-30" />
                  </div>
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
                  {editingUser ? '정보 수정 완료' : '신규 인력 등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
