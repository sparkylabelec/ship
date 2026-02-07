
import React, { useState } from 'react';
import { User, TelegramConfig, UserRole } from '../types';
import { 
  Bot, ShieldCheck, Save, Send, Eye, EyeOff, 
  Search, Check, Users, Info, Bell, AlertCircle, 
  AlertTriangle, MessageSquare, Zap, Loader2
} from 'lucide-react';

interface TelegramSettingsProps {
  users: User[];
  config: TelegramConfig;
  onUpdateConfig: (config: TelegramConfig) => void;
}

const QUICK_TEMPLATES = [
  "운항...", "기상...", "즉시...", "금일..."
];

const TelegramSettings: React.FC<TelegramSettingsProps> = ({ users, config, onUpdateConfig }) => {
  const [token, setToken] = useState(config.botToken);
  const [showToken, setShowToken] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(config.botToken ? 'success' : 'idle');
  const [subscribedIds, setSubscribedIds] = useState<string[]>(config.subscribedUserIds || []);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Message Sending States
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: number, fail: number } | null>(null);

  const filteredUsers = users.filter(u => 
    u.name.includes(searchTerm) || (u.assignedShip && u.assignedShip.includes(searchTerm))
  );

  const usersWithChatIdCount = users.filter(u => !!u.telegramChatId).length;
  const validRecipientsCount = users.filter(u => subscribedIds.includes(u.id) && !!u.telegramChatId).length;

  const handleTestConnection = async () => {
    if (!token) {
      alert('봇 토큰을 먼저 입력해주세요.');
      return;
    }
    setTestStatus('loading');
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
      if (response.ok) {
        setTestStatus('success');
      } else {
        setTestStatus('error');
      }
    } catch (e) {
      setTestStatus('error');
    }
  };

  const toggleSubscription = (userId: string) => {
    setSubscribedIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  const handleSave = () => {
    if (testStatus !== 'success' && token) {
      if (!confirm('봇 연결 테스트가 완료되지 않았습니다. 그래도 저장하시겠습니까?')) return;
    }
    onUpdateConfig({
      botToken: token,
      subscribedUserIds: subscribedIds
    });
    alert('설정이 성공적으로 저장되었습니다.');
  };

  const handleSendMessage = async () => {
    if (!token) return alert('봇 토큰이 설정되지 않았습니다.');
    if (!messageText.trim()) return alert('메시지 내용을 입력하세요.');
    
    const recipients = users.filter(u => subscribedIds.includes(u.id) && !!u.telegramChatId);
    if (recipients.length === 0) return alert('메시지를 보낼 수 있는 수신자가 없습니다. (ChatID 확인 필요)');

    setIsSending(true);
    let successCount = 0;
    let failCount = 0;

    for (const user of recipients) {
      try {
        const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: user.telegramChatId,
            text: messageText,
            parse_mode: 'HTML'
          })
        });
        if (response.ok) successCount++;
        else failCount++;
      } catch (err) {
        failCount++;
      }
    }

    setSendResult({ success: successCount, fail: failCount });
    setIsSending(false);
    if (successCount > 0) setMessageText('');
    setTimeout(() => setSendResult(null), 5000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header with Save Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-[28px] font-black text-slate-900 tracking-tight">Telegram 알림 설정</h2>
          <p className="text-slate-400 text-sm font-medium mt-1">운항 보고 시 실시간 알림을 보낼 봇과 수신자를 관리합니다.</p>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 bg-[#0284c7] hover:bg-[#0369a1] text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-sky-600/20 active:scale-95 group"
        >
          <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
          설정 저장하기
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Bot Config & Message Send */}
        <div className="lg:col-span-4 space-y-8">
          {/* Bot Config Card */}
          <div className="bg-[#f8fafc] border border-slate-200 rounded-[32px] p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-sky-100 p-3 rounded-2xl text-sky-600">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">봇 API 설정</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bot Token</label>
                <div className="relative">
                  <input 
                    type={showToken ? "text" : "password"}
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="BotFather에게 받은 토큰 입력"
                    className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-900 focus:border-sky-600/30 outline-none transition-all pr-12"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-600 transition-colors"
                  >
                    {showToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {testStatus === 'success' ? (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl py-4 flex items-center justify-center gap-2 text-emerald-600 font-black text-sm animate-in fade-in zoom-in-95">
                  <ShieldCheck className="w-5 h-5" />
                  연결 성공
                </div>
              ) : (
                <button 
                  onClick={handleTestConnection}
                  disabled={testStatus === 'loading'}
                  className="w-full bg-white border border-slate-200 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-95 text-slate-600"
                >
                  {testStatus === 'loading' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      연결 테스트
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex gap-3">
              <Info className="w-5 h-5 text-amber-500 shrink-0" />
              <p className="text-[11px] font-bold text-amber-800 leading-relaxed">
                봇 토큰은 시스템 보안을 위해 암호화되어 저장됩니다. 토큰이 노출되지 않도록 주의하십시오.
              </p>
            </div>
          </div>

          {/* Group Message Card */}
          <div className="bg-[#0f172a] rounded-[32px] p-8 shadow-xl space-y-6 text-white overflow-hidden relative group">
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <MessageSquare className="w-32 h-32" />
            </div>
            
            <div className="flex items-center gap-3 relative z-10">
              <div className="bg-sky-500/20 p-3 rounded-2xl text-sky-400">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black">단체 메시지 발송</h3>
                <p className="text-[10px] font-bold text-sky-400/60 uppercase tracking-widest">SELECTED: {validRecipientsCount}명</p>
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">메시지 내용</label>
                  <span className="text-[10px] font-bold text-sky-400">{messageText.length} 자</span>
                </div>
                <textarea 
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="보낼 내용을 입력하세요..."
                  rows={4}
                  className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl p-4 text-sm font-medium text-white placeholder:text-slate-600 outline-none focus:border-sky-500/30 transition-all resize-none shadow-inner"
                />
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Quick Templates
                </p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_TEMPLATES.map((tmpl, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setMessageText(tmpl === "운항..." ? "운항 주의 바람 (안전 운항 필수)" : tmpl === "기상..." ? "기상 악화로 인한 대기 안내" : tmpl === "즉시..." ? "즉시 보고 바랍니다." : "금일 정기 점검 일정 안내")}
                      className="text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
                    >
                      {tmpl}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleSendMessage}
                disabled={isSending || !messageText.trim() || validRecipientsCount === 0}
                className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg ${
                  isSending || !messageText.trim() || validRecipientsCount === 0
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    : 'bg-slate-700 hover:bg-slate-600 text-white shadow-sky-500/10'
                }`}
              >
                {isSending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    선택된 {validRecipientsCount}명에게 발송
                  </>
                )}
              </button>

              {sendResult && (
                <div className="animate-in slide-in-from-bottom-2 duration-300 p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <p className="text-xs font-bold">
                    발송 결과: <span className="text-emerald-400">성공 {sendResult.success}</span> / <span className="text-rose-400">실패 {sendResult.fail}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Recipient Selection */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-[32px] p-0 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 pb-4 space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-3 rounded-2xl text-purple-600">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">알림 수신자 설정 (회원명단)</h3>
              </div>
              <div className="text-xs font-bold text-slate-400 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                ID 등록됨: {usersWithChatIdCount}명
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                type="text"
                placeholder="이름 또는 선박명으로 수신자 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/10 transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-400 text-[11px] font-black uppercase tracking-widest border-y border-slate-100">
                  <th className="px-8 py-4 w-12 text-center">선택</th>
                  <th className="px-8 py-4">사용자</th>
                  <th className="px-8 py-4">역할</th>
                  <th className="px-8 py-4">배정 선박</th>
                  <th className="px-8 py-4 text-right">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map((user) => {
                  const isSubscribed = subscribedIds.includes(user.id);
                  const hasChatId = !!user.telegramChatId;
                  
                  return (
                    <tr 
                      key={user.id} 
                      className={`group hover:bg-slate-50/50 transition-colors cursor-pointer ${isSubscribed ? 'bg-sky-50/20' : ''}`}
                      onClick={() => toggleSubscription(user.id)}
                    >
                      <td className="px-8 py-5">
                        <div className={`mx-auto w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${
                          isSubscribed 
                            ? 'bg-[#0284c7] border-[#0284c7] text-white' 
                            : 'bg-white border-slate-200 group-hover:border-slate-300'
                        }`}>
                          {isSubscribed && <Check className="w-4 h-4" />}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-sm">{user.name}</span>
                          {!hasChatId && (
                             <span className="text-[10px] text-rose-500 font-bold uppercase mt-0.5">ChatID 미등록</span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-xs font-bold text-slate-500">{user.role}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-xs text-slate-400 font-bold">{user.assignedShip || '-'}</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        {isSubscribed ? (
                          hasChatId ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-xl border border-emerald-100">
                              <Bell className="w-3.5 h-3.5" /> 수신 중
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 text-[10px] font-black rounded-xl border border-amber-100">
                              <AlertTriangle className="w-3.5 h-3.5" /> 대기 중
                            </span>
                          )
                        ) : (
                          <span className="text-[11px] font-bold text-slate-300">비활성</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-8 bg-slate-50/50 border-t border-slate-100">
            <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-slate-100">
              <Info className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                회원명단에서 선택된 인원에게만 보고서 저장 시 즉각적인 텔레그램 알림이 전송됩니다. 
                <br />
                <span className="text-rose-400">ChatID 미등록 인원은 선택하더라도 실제 알림을 받을 수 없습니다.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelegramSettings;
