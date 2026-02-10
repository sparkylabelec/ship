
import * as XLSX from 'xlsx';
import { OperationLog } from '../types';

// 소요 시간 계산 유틸리티 (엑셀 데이터 포함용)
const calculateDuration = (start: string, end: string) => {
  if (!start || !end) return "";
  const [sH, sM] = start.split(':').map(Number);
  const [eH, eM] = end.split(':').map(Number);
  let diffMinutes = (eH * 60 + eM) - (sH * 60 + sM);
  if (diffMinutes < 0) diffMinutes += 1440;
  const h = Math.floor(diffMinutes / 60);
  const m = diffMinutes % 60;
  return h > 0 ? `${h}시간 ${m}분` : `${m}분`;
};

export const exportLogsToExcel = (logs: OperationLog[]) => {
  const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const filename = `운항일지_추출_${today}.xlsx`;

  // 1. 데이터 구조화 (엑셀 행 데이터 생성)
  const excelData = logs.map((log, index) => ({
    '번호': index + 1,
    '운항날짜': new Date(log.createdAt).toLocaleDateString(),
    '선박명': log.shipName,
    '운항코스': log.operationCourse || '-', // 추가됨
    '선장': log.captainName,
    '기관장': log.chiefEngineer,
    '승무원': log.crewMembers.join(', '),
    '출발시간': log.departureTime,
    '도착시간': log.arrivalTime,
    '총 운행시간': calculateDuration(log.departureTime, log.arrivalTime),
    '승객수(명)': log.passengerCount,
    '연료잔량(UNIT)': log.fuelStatus,
    '기상(오전/오후)': `${log.weatherMorning || '좋음'} / ${log.weatherAfternoon || '좋음'}`,
    '특이사항': log.notes || '-',
    '상태': log.isDraft ? '임시저장' : '완료'
  }));

  // 2. 워크시트 생성
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // 3. 열 너비 설정
  const wscols = [
    { wch: 5 },  // 번호
    { wch: 12 }, // 운항날짜
    { wch: 15 }, // 선박명
    { wch: 20 }, // 운항코스 (넓힘)
    { wch: 10 }, // 선장
    { wch: 10 }, // 기관장
    { wch: 20 }, // 승무원
    { wch: 10 }, // 출발시간
    { wch: 10 }, // 도착시간
    { wch: 12 }, // 총 운행시간
    { wch: 10 }, // 승객수
    { wch: 12 }, // 연료잔량
    { wch: 15 }, // 기상
    { wch: 30 }, // 특이사항
    { wch: 10 }  // 상태
  ];
  worksheet['!cols'] = wscols;

  // 4. 워크북 생성 및 시트 추가
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "운항일지 리포트");

  // 6. 파일 다운로드
  XLSX.writeFile(workbook, filename);
};
