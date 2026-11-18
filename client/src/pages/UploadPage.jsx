import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

const DEFAULT_SAMPLE_PACK = `From: Dean's office, email
Date: 9 Nov
Approved: a 4-hour hackathon for 150 students in teams of 3. The budget is Rs 650,000, all in. Ten staff will be on duty. Please keep a 15-minute prayer break in the schedule.

---

From: Margalla Event Halls, email
Date: 3 Nov
Room D seats 80 at Rs 40,000. Hall A seats 200 at Rs 120,000. Hall B seats 200 at Rs 150,000. Hall C seats 300 at Rs 220,000. Halls B and C have a standby generator.

---

From: Caterer, WhatsApp
Date: 20 Oct
Standard lunch box Rs 1,000 per head.

---

From: Caterer, WhatsApp
Date: 12 Nov
Salam bhai! Standard lunch box ab Rs 1,200 per head hoga, basic wala Rs 800. Delivery free hai.

---

From: Judging coordinator, email
Date: 11 Nov
20 judges have confirmed. The honorarium is Rs 5,000 each. A judge needs 15 minutes per team and should cover no more than three teams.

---

From: Finance, email
Date: 10 Nov
Already ordered from the event budget: prizes Rs 100,000, backup internet Rs 20,000, printing Rs 10,000.

---

From: Student society, WhatsApp
Date: 13 Nov
Can we get a DJ for the closing? The quote is Rs 50,000.

---

From: A judge, WhatsApp
Date: 14 Nov
I may be 10 minutes late on the day. Traffic on Srinagar Highway.`;

export default function UploadPage({ onProcessComplete, onNavigate }) {
  const [inputText, setInputText] = useState(DEFAULT_SAMPLE_PACK);
  const [fileName, setFileName] = useState('messages.txt');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setInputText(event.target?.result || '');
    };
    reader.readAsText(file);
  };

  const handleProcess = async () => {
    if (!inputText.trim()) {
      setError('Please provide message pack content.');
      return;
    }
    setError('');
    setLoading(true);
    setStatusMessage('Uploading message pack...');

    try {
      // 1. Upload pack
      const uploadRes = await api.uploadPack(inputText, false);
      if (!uploadRes.success) throw new Error(uploadRes.error || 'Failed to upload pack');

      setStatusMessage('Extracting facts and running AI agent pipeline...');
      // 2. Process
      const processRes = await api.processSession(uploadRes.sessionId);
      if (!processRes.success) throw new Error(processRes.error || 'Failed to process session');

      setStatusMessage('Validation passed! Redirecting to plan...');
      onProcessComplete({
        sessionId: uploadRes.sessionId,
        plan: processRes.plan,
        tokenSummary: processRes.tokenSummary,
      });
      setTimeout(() => {
        onNavigate('plan');
      }, 500);
    } catch (err) {
      setError(err.message || 'Processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="border-b border-slate-700/60 pb-4">
        <h2 className="text-xl font-bold text-white">Upload Message Pack</h2>
        <p className="text-xs text-slate-400 mt-1">
          Provide raw unstructured messages (.txt file or direct paste). The system processes Roman Urdu and English with zero manual hints.
        </p>
      </div>

      {/* File Dropzone */}
      <div className="bg-slate-800/40 border-2 border-dashed border-slate-700 hover:border-purple-500/50 rounded-2xl p-6 text-center transition">
        <input
          type="file"
          id="fileInput"
          accept=".txt"
          onChange={handleFileUpload}
          className="hidden"
        />
        <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-white">Click or drag a .txt message pack here</p>
          <p className="text-xs text-slate-400">Loaded: <strong className="text-slate-300">{fileName}</strong></p>
        </label>
      </div>

      {/* Content Preview & Direct Edit */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-purple-400" />
            Message Pack Raw Content Preview
          </label>
          <button
            onClick={() => setInputText(DEFAULT_SAMPLE_PACK)}
            className="text-[11px] text-purple-400 hover:text-purple-300 font-medium"
          >
            Reset to Official Sample Pack
          </button>
        </div>
        <textarea
          rows={12}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste unseen or sample messages here..."
          className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl p-4 font-mono text-xs text-slate-200 focus:outline-none focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/50"
        />
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
          {error}
        </div>
      )}

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 flex items-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin text-purple-400" />}
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Action Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleProcess}
          disabled={loading}
          className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-50 shadow-lg shadow-purple-600/30 transition flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing Pipeline (Reading & Planning)...
            </>
          ) : (
            <>
              Execute Event Planning Pipeline
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
