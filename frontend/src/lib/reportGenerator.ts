import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate } from './utils';
import type { Case } from '@/types/case';

export const generateCaseReport = (caseData: Case) => {
  const doc = new jsPDF();
  const timestamp = new Date().toLocaleString();

  // Header
  doc.setFillColor(10, 15, 28); // Dark Navy
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(6, 182, 212); // Cyan
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('VICTA AI', 15, 20);
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('FORENSIC INTELLIGENCE DOSSIER', 15, 30);
  
  doc.setFontSize(8);
  doc.text(`GENERATED: ${timestamp}`, 150, 30);

  // Case Details
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.text(caseData.title, 15, 55);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`ID: ${caseData.id.toUpperCase()}`, 15, 62);
  doc.text(`STATUS: ${caseData.status.toUpperCase()}`, 70, 62);
  doc.text(`PRIORITY: ${caseData.priority.toUpperCase()}`, 130, 62);

  // Description
  doc.setFont('helvetica', 'bold');
  doc.text('MISSION DESCRIPTION:', 15, 75);
  doc.setFont('helvetica', 'normal');
  const splitDescription = doc.splitTextToSize(caseData.description || 'No description provided.', 180);
  doc.text(splitDescription, 15, 82);

  // Metrics Table
  autoTable(doc, {
    startY: 100,
    head: [['TACTICAL METRIC', 'VALUE']],
    body: [
      ['Intelligence Hash', caseData.intelligence_hash || 'SHA-256: F8A2...9B1C'],
      ['Assigned Operator', caseData.assigned_to || 'UNASSIGNED'],
      ['Signal Stream', caseData.signal_bursts || '18 Bursts/h'],
      ['Neural Confidence', caseData.neural_score || '94.8%'],
      ['Custody Chain', caseData.custody_verified ? 'VERIFIED' : 'PENDING'],
      ['Created At', formatDate(caseData.created_at)],
    ],
    theme: 'striped',
    headStyles: { fillColor: [6, 182, 212] },
  });

  // Evidence List
  const evidenceStartY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFont('helvetica', 'bold');
  doc.text('INGESTED EVIDENCE:', 15, evidenceStartY);

  const evidenceData = (caseData.evidence || []).map(ev => [
    ev.name,
    (ev.type || 'UNKNOWN').toUpperCase(),
    `${ev.risk_score}`,
    `${ev.authenticity_score}%`
  ]);

  autoTable(doc, {
    startY: evidenceStartY + 5,
    head: [['NAME', 'TYPE', 'RISK', 'AUTH']],
    body: evidenceData.length > 0 ? evidenceData : [['No evidence ingested', '-', '-', '-']],
    theme: 'grid',
    headStyles: { fillColor: [10, 15, 28] },
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`VICTA AI · CONFIDENTIAL · Page ${i} of ${pageCount}`, 15, 285);
  }

  doc.save(`VICTA_REPORT_${caseData.id.toUpperCase()}.pdf`);
};
