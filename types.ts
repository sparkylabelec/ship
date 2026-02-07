
export enum UserRole {
  ADMIN = '관리자',
  CAPTAIN = '선장',
  CHIEF_ENGINEER = '기관장',
  WORKER = '작업자',
  CREW = '승무원'
}

export interface User {
  id: string;
  name: string;
  contact: string;
  role: UserRole;
  assignedShip: string | null;
  joinDate: string;
  telegramChatId?: string; // Added for Telegram Bot notifications
}

export interface Ship {
  id: string;
  name: string;
  capacity: number;
  type: string;
}

export interface OperationLog {
  id: string;
  shipName: string;
  captainName: string;
  departureTime: string;
  arrivalTime: string;
  chiefEngineer: string;
  crewMembers: string[];
  passengerCount: number;
  fuelStatus: number;
  notes: string;
  createdAt: string; // Used as the operation date
  isDraft: boolean;
  weatherMorning?: string;
  weatherAfternoon?: string;
}

export interface TelegramConfig {
  botToken: string;
  subscribedUserIds: string[];
}

export type View = 'dashboard' | 'ships' | 'users' | 'operation' | 'logs' | 'telegram-settings';
