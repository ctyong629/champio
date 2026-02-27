// ============================================
// Export Utilities - Excel & PDF Export
// ============================================

import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import type { Team, Event } from '@/types';

// ============================================
// Excel Export
// ============================================

export interface ExportOptions {
  filename?: string;
  sheetName?: string;
}

/**
 * Export teams data to Excel
 */
export function exportTeamsToExcel(
  teams: Team[],
  eventName: string,
  options: ExportOptions = {}
): void {
  const { filename = `${eventName}_報名名單.xlsx`, sheetName = '報名名單' } = options;

  const data = teams.map((team, index) => ({
    '序號': index + 1,
    '隊伍名稱': team.name,
    '負責人': team.contact,
    '聯絡電話': team.phone,
    'Email': team.email || '',
    '審核狀態': team.status,
    '繳費狀態': team.paid ? '已繳費' : '未繳費',
    '報名日期': team.registeredAt || '',
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  
  // Set column widths
  const colWidths = [
    { wch: 6 },   // 序號
    { wch: 20 },  // 隊伍名稱
    { wch: 12 },  // 負責人
    { wch: 15 },  // 聯絡電話
    { wch: 25 },  // Email
    { wch: 12 },  // 審核狀態
    { wch: 10 },  // 繳費狀態
    { wch: 15 },  // 報名日期
  ];
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
}

/**
 * Export event summary to Excel
 */
export function exportEventSummaryToExcel(
  event: Event,
  teams: Team[],
  options: ExportOptions = {}
): void {
  const { filename = `${event.name}_賽事摘要.xlsx` } = options;

  const wb = XLSX.utils.book_new();

  // Sheet 1: Event Info
  const eventInfo = [{
    '賽事名稱': event.name,
    '運動項目': event.sport,
    '比賽日期': `${event.startDate} ~ ${event.endDate}`,
    '比賽地點': event.location,
    '主辦單位': event.organizer,
    '報名隊數': `${event.teamsRegistered}/${event.maxTeams}`,
    '報名狀態': event.status,
  }];
  const ws1 = XLSX.utils.json_to_sheet(eventInfo);
  ws1['!cols'] = [{ wch: 15 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, ws1, '賽事資訊');

  // Sheet 2: Teams
  const teamsData = teams.map((team, index) => ({
    '序號': index + 1,
    '隊伍名稱': team.name,
    '負責人': team.contact,
    '聯絡電話': team.phone,
    '審核狀態': team.status,
    '繳費狀態': team.paid ? '已繳費' : '未繳費',
  }));
  const ws2 = XLSX.utils.json_to_sheet(teamsData);
  ws2['!cols'] = [
    { wch: 6 }, { wch: 20 }, { wch: 12 },
    { wch: 15 }, { wch: 12 }, { wch: 10 }
  ];
  XLSX.utils.book_append_sheet(wb, ws2, '報名名單');

  // Sheet 3: Statistics
  const stats = {
    '總報名隊數': teams.length,
    '已審核通過': teams.filter(t => t.status === '審核通過').length,
    '待審核': teams.filter(t => t.status === '待審核').length,
    '資料不全': teams.filter(t => t.status === '資料不全').length,
    '候補中': teams.filter(t => t.status === '候補中').length,
    '已繳費': teams.filter(t => t.paid).length,
    '未繳費': teams.filter(t => !t.paid).length,
  };
  const ws3 = XLSX.utils.json_to_sheet(
    Object.entries(stats).map(([key, value]) => ({ '項目': key, '數量': value }))
  );
  ws3['!cols'] = [{ wch: 15 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, ws3, '統計資料');

  XLSX.writeFile(wb, filename);
}

// ============================================
// PDF Export
// ============================================

interface PDFExportOptions {
  filename?: string;
  title?: string;
  subtitle?: string;
}

/**
 * Export teams to PDF (Order Book style)
 */
export function exportTeamsToPDF(
  teams: Team[],
  event: Event,
  options: PDFExportOptions = {}
): void {
  const { filename = `${event.name}_秩序冊.pdf` } = options;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(20);
  doc.setTextColor(249, 115, 22); // Orange
  doc.text(event.name, pageWidth / 2, 20, { align: 'center' });

  // Subtitle
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`秩序冊 - ${new Date().toLocaleDateString('zh-TW')}`, pageWidth / 2, 28, { align: 'center' });

  // Event info
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text(`比賽日期: ${event.startDate} ~ ${event.endDate}`, 14, 40);
  doc.text(`比賽地點: ${event.location}`, 14, 46);
  doc.text(`主辦單位: ${event.organizer}`, 14, 52);
  doc.text(`報名隊數: ${teams.length} 隊`, 14, 58);

  // Table
  const tableData = teams.map((team, index) => [
    index + 1,
    team.name,
    team.contact,
    team.phone,
    team.status,
    team.paid ? '已繳費' : '未繳費',
  ]);

  (doc as any).autoTable({
    startY: 65,
    head: [['序號', '隊伍名稱', '負責人', '聯絡電話', '狀態', '繳費']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [249, 115, 22],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 248, 248],
    },
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 40 },
      2: { cellWidth: 25 },
      3: { cellWidth: 30 },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 18, halign: 'center' },
    },
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `第 ${i} 頁，共 ${pageCount} 頁 | 本文件由 Champio 賽事管理平台產生`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  doc.save(filename);
}

/**
 * Export bracket to PDF
 */
export function exportBracketToPDF(
  bracketData: { round: number; matches: { teamA: string; teamB: string; scoreA?: number; scoreB?: number }[] }[],
  event: Event,
  options: PDFExportOptions = {}
): void {
  const { filename = `${event.name}_賽程表.pdf` } = options;

  const doc = new jsPDF('landscape');
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(18);
  doc.setTextColor(249, 115, 22);
  doc.text(`${event.name} - 賽程表`, pageWidth / 2, 15, { align: 'center' });

  let startY = 30;

  bracketData.forEach((round) => {
    if (startY > 150) {
      doc.addPage();
      startY = 20;
    }

    // Round title
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text(`第 ${round.round} 輪`, 14, startY);

    // Matches table
    const matchData = round.matches.map(m => [
      m.teamA,
      m.scoreA !== undefined ? m.scoreA.toString() : '-',
      m.scoreB !== undefined ? m.scoreB.toString() : '-',
      m.teamB,
    ]);

    (doc as any).autoTable({
      startY: startY + 5,
      head: [['隊伍 A', '比分', '', '隊伍 B']],
      body: matchData,
      theme: 'grid',
      headStyles: {
        fillColor: [100, 100, 100],
        textColor: [255, 255, 255],
      },
      styles: {
        fontSize: 10,
        cellPadding: 4,
      },
      columnStyles: {
        0: { cellWidth: 60, halign: 'right' },
        1: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
        2: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
        3: { cellWidth: 60, halign: 'left' },
      },
    });

    startY = (doc as any).lastAutoTable.finalY + 15;
  });

  doc.save(filename);
}

// ============================================
// CSV Export (Lightweight option)
// ============================================

/**
 * Export teams to CSV
 */
export function exportTeamsToCSV(
  teams: Team[],
  eventName: string,
  options: ExportOptions = {}
): void {
  const { filename = `${eventName}_報名名單.csv` } = options;

  const headers = ['序號', '隊伍名稱', '負責人', '聯絡電話', 'Email', '審核狀態', '繳費狀態'];
  
  const rows = teams.map((team, index) => [
    index + 1,
    team.name,
    team.contact,
    team.phone,
    team.email || '',
    team.status,
    team.paid ? '已繳費' : '未繳費',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

// ============================================
// Export Button Component Helper
// ============================================

export type ExportFormat = 'excel' | 'pdf' | 'csv';

export function exportData(
  format: ExportFormat,
  teams: Team[],
  event: Event
): void {
  switch (format) {
    case 'excel':
      exportTeamsToExcel(teams, event.name);
      break;
    case 'pdf':
      exportTeamsToPDF(teams, event);
      break;
    case 'csv':
      exportTeamsToCSV(teams, event.name);
      break;
  }
}
