'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, Hash, AlertCircle, Clock, Activity, DownloadCloud, FileText, CheckCircle2, Link as LinkIcon, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import clsx from 'clsx';

export interface ReportData {
  _id: string;
  reportId: string;
  severity: string;
  referenceURL: string;
  description: string;
  contentType: string;
  aiConfidence: string;
  evidenceCID: string[];
  evidenceURL: string[];
  status: string;
  evidenceCount: number;
  reportCID: string;
  txHash: string | null;
  createdAt: string;
}

interface ReportModalProps {
  report: ReportData;
  onClose: () => void;
  onUpdateStatus?: (id: string, status: string) => void;
}

export default function ReportModal({ report, onClose, onUpdateStatus }: ReportModalProps) {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [showFullHash, setShowFullHash] = useState(false);
  const [showFullCID, setShowFullCID] = useState(false);
  const { token } = useAppStore();
  const modalBodyRef = useRef<HTMLDivElement>(null);

  const handleStatusChange = async (newStatus: string) => {
    try {
      setUpdatingStatus(true);
      const res = await fetch(`http://localhost:5000/api/admin/dashboard/reports/${report.reportId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.status === 'success' && onUpdateStatus) {
        onUpdateStatus(report.reportId, newStatus);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleExportPDF = async () => {
    setExportingPdf(true);
    try {
      // Dynamic import to keep bundle size manageable
      const jsPDF = (await import('jspdf')).default;

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 18;
      let y = margin;

      // ── Header band ──────────────────────────────────────────────
      doc.setFillColor(12, 26, 59); // navy blue-950
      doc.rect(0, 0, pageW, 34, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('GovPortal — Incident Report', margin, 14);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(180, 200, 240);
      doc.text('OFFICIAL DOCUMENT — AUTHORISED USE ONLY', margin, 22);
      doc.text(`Generated: ${new Date().toLocaleString()}`, margin, 28);

      y = 44;

      // ── Report ID strip ───────────────────────────────────────────
      doc.setFillColor(240, 244, 255);
      doc.roundedRect(margin, y, pageW - margin * 2, 16, 3, 3, 'F');
      doc.setTextColor(12, 26, 59);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`Report ID: ${report.reportId.toUpperCase()}`, margin + 5, y + 6);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(80, 100, 140);
      doc.text(`Filed: ${new Date(report.createdAt).toLocaleString()}`, margin + 5, y + 12);
      y += 22;

      // ── Helper: section header ────────────────────────────────────
      const sectionHeader = (title: string) => {
        doc.setFillColor(229, 237, 255);
        doc.rect(margin, y, pageW - margin * 2, 7, 'F');
        doc.setTextColor(12, 26, 59);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text(title.toUpperCase(), margin + 3, y + 5);
        y += 10;
      };

      // ── Helper: key-value row ─────────────────────────────────────
      const kvRow = (label: string, value: string, fullWidth = false) => {
        const colW = fullWidth ? pageW - margin * 2 : (pageW - margin * 2) / 2;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(100, 120, 160);
        doc.text(label, margin + 3, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(20, 30, 60);
        doc.setFontSize(9);

        // Word-wrap long values
        const lines = doc.splitTextToSize(value || '—', colW - 6);
        doc.text(lines, margin + 3, y + 4.5);
        const lineH = lines.length * 4.5;
        y += lineH + 8;
      };

      // ── Classification Details ───────────────────────────────────
      sectionHeader('Classification Details');

      // Two-column grid for compact fields
      const halfW = (pageW - margin * 2) / 2 - 3;
      const fields = [
        ['Content Type', report.contentType],
        ['Severity', report.severity],
        ['Status', report.status],
        ['AI Confidence', `${(parseFloat(report.aiConfidence) * 100).toFixed(1)}%`],
      ];

      for (let i = 0; i < fields.length; i += 2) {
        const xLeft = margin + 3;
        const xRight = margin + halfW + 9;

        // Label left
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(100, 120, 160);
        doc.text(fields[i][0], xLeft, y);

        // Label right (if exists)
        if (fields[i + 1]) {
          doc.text(fields[i + 1][0], xRight, y);
        }

        y += 4.5;

        // Value left
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(20, 30, 60);
        doc.text(fields[i][1] || '—', xLeft, y);

        // Value right
        if (fields[i + 1]) {
          doc.text(fields[i + 1][1] || '—', xRight, y);
        }
        y += 9;
      }

      y += 4;

      // ── Executive Summary ────────────────────────────────────────
      sectionHeader('Executive Summary');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(30, 40, 70);
      const descLines = doc.splitTextToSize(report.description || 'No description provided.', pageW - margin * 2 - 6);
      doc.text(descLines, margin + 3, y);
      y += descLines.length * 4.5 + 10;

      // ── Authentication Chain ──────────────────────────────────────
      sectionHeader('Authentication Chain');
      kvRow('Ledger Transaction Hash (txHash)', report.txHash || 'Pending on-chain verification', true);
      kvRow('Dossier CID (IPFS)', report.reportCID || '—', true);

      // ── Reference URL ─────────────────────────────────────────────
      if (report.referenceURL) {
        sectionHeader('Reference URL');
        kvRow('Target URL', report.referenceURL, true);
      }

      // ── Evidence Attachments ──────────────────────────────────────
      if (report.evidenceURL && report.evidenceURL.length > 0) {
        sectionHeader(`Evidence Attachments (${report.evidenceURL.length})`);
        report.evidenceURL.forEach((url, i) => {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.5);
          doc.setTextColor(100, 120, 160);
          doc.text(`Attachment ${i + 1}`, margin + 3, y);
          y += 4.5;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(30, 80, 180);
          const urlLines = doc.splitTextToSize(url, pageW - margin * 2 - 6);
          doc.text(urlLines, margin + 3, y);
          y += urlLines.length * 4 + 5;
        });
      }

      // ── Footer band ───────────────────────────────────────────────
      doc.setFillColor(12, 26, 59);
      doc.rect(0, pageH - 16, pageW, 16, 'F');
      doc.setTextColor(180, 200, 240);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text('Authenticity cryptographically verified • GovPortal Security Command Center', margin, pageH - 7);
      doc.text(`Page 1`, pageW - margin, pageH - 7, { align: 'right' });

      // ── Save ─────────────────────────────────────────────────────
      doc.save(`incident-report-${report.reportId.slice(0, 12).toUpperCase()}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setExportingPdf(false);
    }
  };

  const getSeverityStyles = (sev: string) => {
    switch (sev) {
      case 'HIGHEST': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'HIGH': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'MEDIUM': return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          className="bg-gray-50 w-full max-w-5xl max-h-[92vh] rounded-2xl shadow-2xl border border-gray-200 overflow-hidden relative flex flex-col font-sans"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between relative z-10 bg-white">
            <div className="flex items-center gap-4">
              <div className={clsx(
                "w-12 h-12 rounded-xl flex items-center justify-center border",
                getSeverityStyles(report.severity)
              )}>
                {report.status === 'RESOLVED' ? <CheckCircle2 size={24} /> : <ShieldAlert size={24} />}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Incident Record</span>
                  <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="hidden sm:block text-[10px] font-medium text-gray-400 uppercase tracking-wider">{new Date(report.createdAt).toLocaleString()}</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                  {report.contentType}
                  <span className="text-gray-300 font-normal">/</span> 
                  <span className="font-mono text-lg text-blue-900">{report.reportId.slice(0, 12).toUpperCase()}</span>
                </h2>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportPDF}
                disabled={exportingPdf}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-950 hover:bg-blue-900 disabled:opacity-60 rounded-lg text-white font-medium text-sm border border-blue-800 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-nowrap"
              >
                {exportingPdf ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <DownloadCloud size={16} />
                )}
                {exportingPdf ? 'Generating…' : 'Export PDF'}
              </button>
              <button 
                onClick={onClose}
                className="w-10 h-10 flex flex-shrink-0 items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-500 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div ref={modalBodyRef} className="flex-1 overflow-y-auto p-6 md:p-8 relative z-10 flex flex-col lg:flex-row gap-8">
            
            {/* Left Column (Main Data) */}
            <div className="flex-1 space-y-8">
              
              <section className="space-y-4">
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <FileText size={16} className="text-gray-400" /> Executive Summary
                </h4>
                <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm relative">
                  <p className="text-gray-700 leading-relaxed text-sm">
                    {report.description || "No description provided for this incident report."}
                  </p>
                </div>
              </section>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
                  <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Validation Metrics</h5>
                  <div className="space-y-3">
                     <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                        <span className="text-gray-500 text-xs font-medium">AI Confidence Score</span>
                        <span className="text-emerald-700 font-bold text-sm bg-emerald-50 px-2 py-0.5 rounded">
                          {(parseFloat(report.aiConfidence) * 100).toFixed(1)}%
                        </span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-xs font-medium">Source Platform</span>
                        <span className="text-gray-900 font-semibold text-xs bg-gray-100 px-2 py-0.5 rounded">LOCAL_SYSTEM</span>
                     </div>
                  </div>
                </div>

                {/* Record Authentication with Expandable Hashes */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
                  <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Record Authentication</h5>
                  <div className="space-y-4">
                     <div className="flex flex-col gap-1.5 pb-3 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                           <span className="text-gray-500 text-[10px] uppercase font-semibold">Ledger Transaction Hash</span>
                           {report.txHash && (
                             <button
                               onClick={() => setShowFullHash(!showFullHash)}
                               className="text-[10px] font-bold text-blue-600 hover:text-blue-800 focus:outline-none"
                             >
                               {showFullHash ? 'SHOW LESS' : 'SHOW FULL'}
                             </button>
                           )}
                        </div>
                        <div className="p-2 bg-gray-50 rounded-md border border-gray-100">
                           <span className={clsx(
                             "text-gray-900 text-xs font-mono",
                             !showFullHash && "block truncate",
                             showFullHash && "break-all"
                           )} title={report.txHash || 'Pending on-chain verification'}>
                             {report.txHash || 'Pending verification'}
                           </span>
                        </div>
                     </div>
                     <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                           <span className="text-gray-500 text-[10px] uppercase font-semibold">Dossier CID (IPFS)</span>
                           {report.reportCID && (
                             <button
                               onClick={() => setShowFullCID(!showFullCID)}
                               className="text-[10px] font-bold text-blue-600 hover:text-blue-800 focus:outline-none"
                             >
                               {showFullCID ? 'SHOW LESS' : 'SHOW FULL'}
                             </button>
                           )}
                        </div>
                        <div className="p-2 bg-gray-50 rounded-md border border-gray-100">
                           <span className={clsx(
                             "text-gray-900 text-xs font-mono",
                             !showFullCID && "block truncate",
                             showFullCID && "break-all"
                           )} title={report.reportCID}>
                             {report.reportCID}
                           </span>
                        </div>
                     </div>
                  </div>
                </div>
              </div>

              <section className="space-y-4">
                 <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <LinkIcon size={16} className="text-gray-400" /> Attached Evidence ({report.evidenceURL?.length || 0})
                 </h4>
                 <div className="space-y-3">
                    {report.evidenceURL && report.evidenceURL.map((url, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 shadow-sm transition-colors group">
                         <div className="flex items-center gap-4 overflow-hidden">
                             <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-lg flex shrink-0 items-center justify-center text-gray-400 group-hover:text-blue-600 transition-colors">
                               <Hash size={18} />
                            </div>
                            <div className="min-w-0 flex flex-col gap-0.5">
                               <p className="text-xs font-semibold text-gray-900">Attachment {i+1}</p>
                               <p className="text-[11px] font-mono text-gray-500 truncate max-w-sm" title={url}>URL: {url}</p>
                               {report.evidenceCID && report.evidenceCID[i] && (
                                 <p className="text-[10px] font-mono text-gray-400 truncate max-w-sm" title={report.evidenceCID[i]}>
                                   CID: {report.evidenceCID[i]}
                                 </p>
                               )}
                            </div>
                         </div>
                         <a href={url} target="_blank" rel="noreferrer" className="shrink-0 px-4 py-2 bg-white text-blue-700 text-xs font-semibold rounded-lg hover:bg-blue-50 border border-gray-200 hover:border-blue-200 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap">
                           View File
                         </a>
                      </div>
                    ))}
                 </div>
              </section>
            </div>

            {/* Right Column (Controls) */}
            <div className="w-full lg:w-72 xl:w-80 space-y-6 shrink-0">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                 <div className="flex items-center justify-between mb-5">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Status Control</h4>
                    <div className={clsx(
                      "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                      report.status === 'PENDING' ? "bg-amber-50 text-amber-700 border-amber-200" 
                      : report.status === 'RESOLVED' ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-blue-50 text-blue-700 border-blue-200"
                    )}>
                      {report.status}
                    </div>
                 </div>

                 <div className="flex flex-col gap-2.5">
                    {['PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        disabled={updatingStatus}
                        className={clsx(
                          "w-full py-3 px-4 rounded-lg text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 text-left flex justify-between items-center",
                          report.status === status 
                            ? "bg-blue-950 text-white shadow-sm focus:ring-blue-900"
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-blue-500"
                        )}
                      >
                        {status}
                        {updatingStatus && report.status === status && <Activity size={14} className="animate-spin" />}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="p-5 bg-blue-50 border border-blue-100 rounded-xl space-y-3">
                 <div className="flex items-center gap-3">
                    <AlertCircle size={18} className="text-blue-700 shrink-0" />
                    <h5 className="text-sm font-semibold text-blue-900">Governance Policy</h5>
                 </div>
                 <p className="text-xs text-blue-800 leading-relaxed">
                    Authorized personnel must verify all tactical metadata before re-classifying incident status. All modifications are permanently logged and audited by the compliance protocol.
                 </p>
              </div>

              {/* Mobile Export PDF */}
              <button
                onClick={handleExportPDF}
                disabled={exportingPdf}
                className="md:hidden w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-950 hover:bg-blue-900 disabled:opacity-60 rounded-lg text-white font-medium text-sm transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {exportingPdf ? <Loader2 size={16} className="animate-spin" /> : <DownloadCloud size={16} />}
                {exportingPdf ? 'Generating…' : 'Export PDF'}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-gray-100 border-t border-gray-200 text-center flex justify-center items-center gap-2">
             <ShieldAlert size={14} className="text-gray-400" />
             <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest">
               Authenticity cryptographically verified
             </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
