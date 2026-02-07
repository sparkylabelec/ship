
import React from 'react';
import { UserRole, User, Ship, OperationLog } from './types';
import { ShieldCheck, Anchor, Users, LayoutDashboard, ClipboardEdit, FileText, BellRing } from 'lucide-react';

const today = new Date().toISOString().split('T')[0];

export const INITIAL_SHIPS: Ship[] = [
  { id: '1', name: '탐나라호', capacity: 300, type: '크루즈' },
  { id: '2', name: '아일래나호', capacity: 200, type: '여객선' },
  { id: '3', name: '가우디호', capacity: 100, type: '화물선' },
  { id: '4', name: '인어공주호', capacity: 100, type: '여객선' },
];

export const INITIAL_USERS: User[] = [
  { id: '100', name: '이영희', contact: '010-3456-7890', role: UserRole.ADMIN, assignedShip: null, joinDate: '2022-11-05' },
  { id: '101', name: '홍길동', contact: '010-1234-5678', role: UserRole.CAPTAIN, assignedShip: '탐나라호', joinDate: '2023-01-15', telegramChatId: '12345678' },
  { id: '102', name: '최지우', contact: '010-5678-9012', role: UserRole.CAPTAIN, assignedShip: '가우디호', joinDate: '2023-06-12' },
  { id: '103', name: '강하늘', contact: '010-1111-2222', role: UserRole.CAPTAIN, assignedShip: '인어공주호', joinDate: '2024-02-01' },
  { id: '201', name: '김철수', contact: '010-2345-6789', role: UserRole.CHIEF_ENGINEER, assignedShip: '아일래나호', joinDate: '2023-03-20' },
  { id: '202', name: '정우성', contact: '010-3333-4444', role: UserRole.CHIEF_ENGINEER, assignedShip: '탐나라호', joinDate: '2023-05-10', telegramChatId: '87654321' },
  { id: '203', name: '한효주', contact: '010-5555-6666', role: UserRole.CHIEF_ENGINEER, assignedShip: '가우디호', joinDate: '2023-08-15' },
  { id: '301', name: '박민수', contact: '010-4567-8901', role: UserRole.WORKER, assignedShip: '탐나라호', joinDate: '2024-01-10' },
  { id: '302', name: '이광수', contact: '010-7777-8888', role: UserRole.WORKER, assignedShip: '아일래나호', joinDate: '2024-03-05' },
  { id: '303', name: '유재석', contact: '010-9999-0000', role: UserRole.WORKER, assignedShip: null, joinDate: '2024-04-12' },
];

export const INITIAL_LOGS: OperationLog[] = [
  // 2026-02-06 기록 (15건)
  { id: 'd1', shipName: '탐나라호', captainName: '홍길동', departureTime: '08:00', arrivalTime: '08:45', chiefEngineer: '정우성', crewMembers: ['박민수'], passengerCount: 156, fuelStatus: 8500, notes: '첫 항차 정상 시작', createdAt: '2026-02-06T08:00:00Z', isDraft: false, weatherMorning: '좋음', weatherAfternoon: '흐림' },
  { id: 'd2', shipName: '아일래나호', captainName: '강하늘', departureTime: '08:15', arrivalTime: '09:00', chiefEngineer: '김철수', crewMembers: ['이광수'], passengerCount: 92, fuelStatus: 6200, notes: '안개 약간 있음', createdAt: '2026-02-06T08:15:00Z', isDraft: false, weatherMorning: '안개', weatherAfternoon: '흐림' },
  { id: 'd3', shipName: '가우디호', captainName: '최지우', departureTime: '08:30', arrivalTime: '10:15', chiefEngineer: '한효주', crewMembers: ['유재석'], passengerCount: 12, fuelStatus: 7800, notes: '화물 적재 지연 발생', createdAt: '2026-02-06T08:30:00Z', isDraft: false, weatherMorning: '흐림', weatherAfternoon: '비' },
  { id: 'd4', shipName: '인어공주호', captainName: '홍길동', departureTime: '09:00', arrivalTime: '09:40', chiefEngineer: '정우성', crewMembers: ['박민수'], passengerCount: 45, fuelStatus: 4200, notes: '관광객 다수 탑승', createdAt: '2026-02-06T09:00:00Z', isDraft: false, weatherMorning: '좋음', weatherAfternoon: '흐림' },
  { id: 'd5', shipName: '탐나라호', captainName: '홍길동', departureTime: '09:30', arrivalTime: '10:15', chiefEngineer: '정우성', crewMembers: ['박민수'], passengerCount: 210, fuelStatus: 8200, notes: '단체 관광객 수송', createdAt: '2026-02-06T09:30:00Z', isDraft: false, weatherMorning: '좋음', weatherAfternoon: '흐림' },
  { id: 'd6', shipName: '아일래나호', captainName: '강하늘', departureTime: '10:00', arrivalTime: '10:45', chiefEngineer: '김철수', crewMembers: ['이광수'], passengerCount: 120, fuelStatus: 5900, notes: '정상 운항', createdAt: '2026-02-06T10:00:00Z', isDraft: false, weatherMorning: '안개', weatherAfternoon: '흐림' },
  { id: 'd7', shipName: '탐나라호', captainName: '홍길동', departureTime: '11:00', arrivalTime: '11:45', chiefEngineer: '정우성', crewMembers: ['박민수'], passengerCount: 180, fuelStatus: 7900, notes: '엔진 온도 점검 필요', createdAt: '2026-02-06T11:00:00Z', isDraft: false, weatherMorning: '좋음', weatherAfternoon: '흐림' },
  { id: 'd8', shipName: '가우디호', captainName: '최지우', departureTime: '11:30', arrivalTime: '13:00', chiefEngineer: '한효주', crewMembers: ['유재석'], passengerCount: 5, fuelStatus: 7500, notes: '유류 보급 후 운항', createdAt: '2026-02-06T11:30:00Z', isDraft: false, weatherMorning: '흐림', weatherAfternoon: '비' },
  { id: 'd9', shipName: '인어공주호', captainName: '강하늘', departureTime: '12:00', arrivalTime: '12:40', chiefEngineer: '김철수', crewMembers: ['이광수'], passengerCount: 30, fuelStatus: 3900, notes: '강풍 주의보 확인 중', createdAt: '2026-02-06T12:00:00Z', isDraft: false, weatherMorning: '좋음', weatherAfternoon: '흐림' },
  { id: 'd10', shipName: '탐나라호', captainName: '홍길동', departureTime: '13:30', arrivalTime: '14:15', chiefEngineer: '정우성', crewMembers: ['박민수'], passengerCount: 280, fuelStatus: 7500, notes: '정원 근접, 안전 주의', createdAt: '2026-02-06T13:30:00Z', isDraft: false, weatherMorning: '좋음', weatherAfternoon: '흐림' },
  { id: 'd11', shipName: '아일래나호', captainName: '강하늘', departureTime: '14:00', arrivalTime: '14:45', chiefEngineer: '김철수', crewMembers: ['이광수'], passengerCount: 110, fuelStatus: 5500, notes: '파도 높음, 저속 운항', createdAt: '2026-02-06T14:00:00Z', isDraft: false, weatherMorning: '안개', weatherAfternoon: '흐림' },
  { id: 'd12', shipName: '탐나라호', captainName: '홍길동', departureTime: '15:00', arrivalTime: '15:45', chiefEngineer: '정우성', crewMembers: ['박민수'], passengerCount: 140, fuelStatus: 7200, notes: '정상 운항', createdAt: '2026-02-06T15:00:00Z', isDraft: false, weatherMorning: '좋음', weatherAfternoon: '흐림' },
  { id: 'd13', shipName: '가우디호', captainName: '최지우', departureTime: '16:00', arrivalTime: '17:45', chiefEngineer: '한효주', crewMembers: ['유재석'], passengerCount: 8, fuelStatus: 7200, notes: '장비 점검 진행', createdAt: '2026-02-06T16:00:00Z', isDraft: false, weatherMorning: '흐림', weatherAfternoon: '비' },
  { id: 'd14', shipName: '인어공주호', captainName: '홍길동', departureTime: '17:00', arrivalTime: '17:40', chiefEngineer: '정우성', crewMembers: ['박민수'], passengerCount: 22, fuelStatus: 3500, notes: '일몰 전 마지막 항차', createdAt: '2026-02-06T17:00:00Z', isDraft: false, weatherMorning: '좋음', weatherAfternoon: '흐림' },
  { id: 'd15', shipName: '탐나라호', captainName: '홍길동', departureTime: '18:30', arrivalTime: '19:15', chiefEngineer: '정우성', crewMembers: ['박민수'], passengerCount: 60, fuelStatus: 6800, notes: '야간 조명 가동 확인', createdAt: '2026-02-06T18:30:00Z', isDraft: false, weatherMorning: '좋음', weatherAfternoon: '흐림' },

  // 2026-02-07 기록 (15건)
  { id: 'd16', shipName: '탐나라호', captainName: '홍길동', departureTime: '08:00', arrivalTime: '08:45', chiefEngineer: '정우성', crewMembers: ['박민수'], passengerCount: 120, fuelStatus: 8500, notes: '주말 운항 시작, 기상 양호', createdAt: '2026-02-07T08:00:00Z', isDraft: false, weatherMorning: '좋음', weatherAfternoon: '좋음' },
  { id: 'd17', shipName: '아일래나호', captainName: '강하늘', departureTime: '08:30', arrivalTime: '09:15', chiefEngineer: '김철수', crewMembers: ['이광수'], passengerCount: 145, fuelStatus: 6100, notes: '가족 단위 승객 증가', createdAt: '2026-02-07T08:30:00Z', isDraft: false, weatherMorning: '좋음', weatherAfternoon: '좋음' },
  { id: 'd18', shipName: '가우디호', captainName: '최지우', departureTime: '09:00', arrivalTime: '11:00', chiefEngineer: '한효주', crewMembers: ['유재석'], passengerCount: 15, fuelStatus: 7700, notes: '정상 물류 수송', createdAt: '2026-02-07T09:00:00Z', isDraft: false, weatherMorning: '좋음', weatherAfternoon: '좋음' },
  { id: 'd19', shipName: '탐나라호', captainName: '홍길동', departureTime: '09:30', arrivalTime: '10:15', chiefEngineer: '정우성', crewMembers: ['박민수'], passengerCount: 295, fuelStatus: 8100, notes: '만선에 가까움, 안전 요원 배치', createdAt: '2026-02-07T09:30:00Z', isDraft: false, weatherMorning: '좋음', weatherAfternoon: '좋음' },
  { id: 'd20', shipName: '인어공주호', captainName: '강하늘', departureTime: '10:00', arrivalTime: '10:40', chiefEngineer: '김철수', crewMembers: ['이광수'], passengerCount: 88, fuelStatus: 4100, notes: '쾌적한 운항 환경', createdAt: '2026-02-07T10:00:00Z', isDraft: false, weatherMorning: '좋음', weatherAfternoon: '좋음' },
  { id: 'd21', shipName: '탐나라호', captainName: '홍길동', departureTime: '11:00', arrivalTime: '11:45', chiefEngineer: '정우성', crewMembers: ['박민수'], passengerCount: 250, fuelStatus: 7800, notes: '정상 운항 중', createdAt: '2026-02-07T11:00:00Z', isDraft: false, weatherMorning: '좋음', weatherAfternoon: '좋음' },
  { id: 'd22', shipName: '아일래나호', captainName: '강하늘', departureTime: '11:30', arrivalTime: '12:15', chiefEngineer: '김철수', crewMembers: ['이광수'], passengerCount: 190, fuelStatus: 5800, notes: '승객 정원 확인 철저', createdAt: '2026-02-07T11:30:00Z', isDraft: false, weatherMorning: '좋음', weatherAfternoon: '좋음' },
  { id: 'd23', shipName: '탐나라호', captainName: '홍길동', departureTime: '12:30', arrivalTime: '13:15', chiefEngineer: '정우성', crewMembers: ['박민수'], passengerCount: 170, fuelStatus: 7400, notes: '선내 청결 상태 양호', createdAt: '2026-02-07T12:30:00Z', isDraft: false, weatherMorning: '좋음', weatherAfternoon: '좋음' },
  { id: 'd24', shipName: '가우디호', captainName: '최지우', departureTime: '13:00', arrivalTime: '15:00', chiefEngineer: '한효주', crewMembers: ['유재석'], passengerCount: 20, fuelStatus: 7400, notes: '운항 중 고래 목격 보고', createdAt: '2026-02-07T13:00:00Z', isDraft: false, weatherMorning: '좋음', weatherAfternoon: '좋음' },
  { id: 'd25', shipName: '인어공주호', captainName: '강하늘', departureTime: '14:00', arrivalTime: '14:40', chiefEngineer: '김철수', crewMembers: ['이광수'], passengerCount: 95, fuelStatus: 3800, notes: '정상 회항', createdAt: '2026-02-07T14:00:00Z', isDraft: false, weatherMorning: '좋음', weatherAfternoon: '좋음' },
  { id: 'd26', shipName: '탐나라호', captainName: '홍길동', departureTime: '14:30', arrivalTime: '15:15', chiefEngineer: '정우성', crewMembers: ['박민수'], passengerCount: 220, fuelStatus: 7100, notes: '바람이 조금씩 강해짐', createdAt: '2026-02-07T14:30:00Z', isDraft: false, weatherMorning: '좋음', weatherAfternoon: '좋음' },
  { id: 'd27', shipName: '아일래나호', captainName: '강하늘', departureTime: '15:30', arrivalTime: '16:15', chiefEngineer: '김철수', crewMembers: ['이광수'], passengerCount: 130, fuelStatus: 5400, notes: '구명조끼 안내 방송 실시', createdAt: '2026-02-07T15:30:00Z', isDraft: false, weatherMorning: '좋음', weatherAfternoon: '좋음' },
  { id: 'd28', shipName: '탐나라호', captainName: '홍길동', departureTime: '16:30', arrivalTime: '17:15', chiefEngineer: '정우성', crewMembers: ['박민수'], passengerCount: 110, fuelStatus: 6800, notes: '정상 운항 종료 대기', createdAt: '2026-02-07T16:30:00Z', isDraft: false, weatherMorning: '좋음', weatherAfternoon: '좋음' },
  { id: 'd29', shipName: '가우디호', captainName: '최지우', departureTime: '17:30', arrivalTime: '19:00', chiefEngineer: '한효주', crewMembers: ['유재석'], passengerCount: 10, fuelStatus: 7100, notes: '주말 물량 확보 완료', createdAt: '2026-02-07T17:30:00Z', isDraft: false, weatherMorning: '좋음', weatherAfternoon: '좋음' },
  { id: 'd30', shipName: '인어공주호', captainName: '홍길동', departureTime: '18:00', arrivalTime: '18:40', chiefEngineer: '정우성', crewMembers: ['박민수'], passengerCount: 40, fuelStatus: 3400, notes: '오늘의 운항 모두 종료', createdAt: '2026-02-07T18:00:00Z', isDraft: false, weatherMorning: '좋음', weatherAfternoon: '좋음' },
];

export const NAV_ITEMS = [
  { id: 'dashboard', label: '대시보드', icon: <LayoutDashboard className="w-5 h-5" />, roles: [UserRole.ADMIN, UserRole.CHIEF_ENGINEER, UserRole.WORKER] },
  { id: 'operation', label: '운항 일지 작성', icon: <ClipboardEdit className="w-5 h-5" />, roles: [UserRole.CAPTAIN] },
  { id: 'logs', label: '운항 일지 목록', icon: <FileText className="w-5 h-5" />, roles: [UserRole.ADMIN, UserRole.CAPTAIN] },
  { id: 'ships', label: '선박 관리', icon: <Anchor className="w-5 h-5" />, roles: [UserRole.ADMIN] },
  { id: 'users', label: '인력 관리', icon: <Users className="w-5 h-5" />, roles: [UserRole.ADMIN] },
  { id: 'telegram-settings', label: '알림 설정', icon: <BellRing className="w-5 h-5" />, roles: [UserRole.ADMIN] },
];

export const ROLE_STYLES: Record<UserRole, { bg: string, text: string, icon: React.ReactNode }> = {
  [UserRole.ADMIN]: { bg: 'bg-purple-100', text: 'text-purple-700', icon: <ShieldCheck className="w-4 h-4" /> },
  [UserRole.CAPTAIN]: { bg: 'bg-sky-100', text: 'text-sky-700', icon: <ShieldCheck className="w-4 h-4" /> },
  [UserRole.CHIEF_ENGINEER]: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: <ShieldCheck className="w-4 h-4" /> },
  [UserRole.WORKER]: { bg: 'bg-slate-100', text: 'text-slate-600', icon: <Users className="w-4 h-4" /> },
  [UserRole.CREW]: { bg: 'bg-blue-100', text: 'text-blue-600', icon: <Users className="w-4 h-4" /> },
};
