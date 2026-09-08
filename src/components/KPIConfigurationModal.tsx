import React, { useState, useEffect } from 'react';
import {
  X,
  Sliders,
  CheckCircle2,
  Clock,
  History,
  AlertTriangle,
  Save,
  ShieldCheck,
  Calendar,
  Sparkles,
  Info,
} from 'lucide-react';
import { CompanyKPIConfig, KPIAuditRecord } from '../types';
import { DEFAULT_KPI_CONFIG } from '../data/mockData';

interface KPIConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  kpiConfig?: CompanyKPIConfig;
  config?: CompanyKPIConfig;
  onUpdateConfig?: (newConfig: CompanyKPIConfig) => void;
  onSave?: (newConfig: CompanyKPIConfig) => void;
  isDark?: boolean;
}

export const KPIConfigurationModal: React.FC<KPIConfigurationModalProps> = ({
  isOpen,
  onClose,
  kpiConfig,
  config,
  onUpdateConfig,
  onSave,
  isDark = true,
}) => {
  const activeConfig = kpiConfig || config || DEFAULT_KPI_CONFIG;
  const handleSaveCallback = onUpdateConfig || onSave || (() => {});

  const [selectedYear, setSelectedYear] = useState<number>(activeConfig?.year || 2026);
  const [maxReworkRate, setMaxReworkRate] = useState<number>(activeConfig?.maxReworkRate ?? 5);
  const [maxOverdueRate, setMaxOverdueRate] = useState<number>(activeConfig?.maxOverdueRate ?? 10);
  const [maxBugRate, setMaxBugRate] = useState<number>(activeConfig?.maxBugRate ?? 4);
  const [status, setStatus] = useState<'active' | 'archived'>(activeConfig?.status || 'active');
  const [notes, setNotes] = useState<string>(activeConfig?.notes || 'Cấu hình hạn mức chất lượng năm 2026');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (activeConfig) {
      setSelectedYear(activeConfig.year || 2026);
      setMaxReworkRate(activeConfig.maxReworkRate ?? 5);
      setMaxOverdueRate(activeConfig.maxOverdueRate ?? 10);
      setMaxBugRate(activeConfig.maxBugRate ?? 4);
      setStatus(activeConfig.status || 'active');
      setNotes(activeConfig.notes || `Cấu hình hạn mức chất lượng năm ${activeConfig.year || 2026}`);
    }
  }, [isOpen, activeConfig]);

  if (!isOpen) return null;

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    // Find if there is existing audit record for that year
    const existing = (activeConfig?.auditTrail || []).find((r) => r.year === year);
    if (existing) {
      setMaxReworkRate(existing.maxReworkRate);
      setMaxOverdueRate(existing.maxOverdueRate);
      setMaxBugRate(existing.maxBugRate);
      setStatus(existing.status);
      setNotes(existing.notes || `Cấu hình hạn mức chất lượng năm ${year}`);
    } else {
      if (year === 2027) {
        setMaxReworkRate(3);
        setMaxOverdueRate(14.5);
        setMaxBugRate(6.5);
        setStatus('archived');
        setNotes('Cấu hình dự thảo năm 2027');
      } else if (year === 2025) {
        setMaxReworkRate(5);
        setMaxOverdueRate(10);
        setMaxBugRate(4);
        setStatus('archived');
        setNotes('Cấu hình hạn mức chất lượng năm 2025');
      }
    }
  };

  const handleSave = () => {
    const newAuditRecord: KPIAuditRecord = {
      id: `kpi-audit-${Date.now()}`,
      year: selectedYear,
      title: `Cấu hình KPI Năm ${selectedYear}`,
      maxReworkRate,
      maxOverdueRate,
      maxBugRate,
      status,
      appliedAt: `Lúc: ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ${new Date().toLocaleDateString('vi-VN')}`,
      updatedBy: 'dev here!',
      notes: notes || `Cấu hình hạn mức chất lượng năm ${selectedYear}`,
    };

    // Update audit trail by replacing record of same year or prepending
    const auditTrailList = activeConfig?.auditTrail || [];
    const existingIndex = auditTrailList.findIndex((r) => r.year === selectedYear);
    let updatedTrail = [...auditTrailList];
    if (existingIndex >= 0) {
      updatedTrail[existingIndex] = newAuditRecord;
    } else {
      updatedTrail.unshift(newAuditRecord);
    }

    const updatedConfig: CompanyKPIConfig = {
      year: selectedYear,
      maxReworkRate,
      maxOverdueRate,
      maxBugRate,
      status,
      notes,
      auditTrail: updatedTrail,
    };

    handleSaveCallback(updatedConfig);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-5xl rounded-2xl shadow-2xl border flex flex-col max-h-[92vh] overflow-hidden ${
          isDark ? 'bg-[#0e1626] border-slate-700/80 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
            isDark ? 'border-slate-800 bg-[#121c30]' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div>
            <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-400" />
              <span>Cài đặt mục tiêu KPI</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Cấu hình các hạn mức cảnh báo tối đa (Re-work, Trễ hạn, Bug) áp dụng cho doanh nghiệp & đồng bộ từng Sprint
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: 2 Columns */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (5 cols): Cập nhật mục tiêu năm */}
            <div className="lg:col-span-5 space-y-4">
              <div
                className={`p-4 rounded-xl border ${
                  isDark ? 'bg-slate-900/60 border-amber-500/30 shadow-lg shadow-amber-500/5' : 'bg-amber-50/40 border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" />
                    Cập nhật mục tiêu năm
                  </span>
                  <span className="text-[11px] font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/80">
                    ● Đã chọn bản ghi KPI Năm {selectedYear}
                  </span>
                </div>

                {/* Select Year */}
                <div className="space-y-1.5 mb-4">
                  <label className="text-xs font-bold text-slate-300 block">Chọn năm áp dụng</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => handleYearChange(Number(e.target.value))}
                    className={`w-full text-xs font-semibold px-3 py-2 rounded-lg border outline-none cursor-pointer ${
                      isDark
                        ? 'bg-slate-950 border-slate-700 text-white focus:border-amber-400'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-amber-500'
                    }`}
                  >
                    <option value={2026}>Năm 2026 (Năm hiện tại)</option>
                    <option value={2027}>Năm 2027 (Kế hoạch năm sau)</option>
                    <option value={2025}>Năm 2025 (Năm trước đó)</option>
                  </select>
                </div>

                {/* 1. Hạn mức Re-work tối đa */}
                <div className="space-y-1.5 mb-4 p-3 rounded-lg bg-slate-950/50 border border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">Hạn mức Re-work tối đa</span>
                    <span className="font-mono font-black text-amber-400 px-2 py-0.5 rounded bg-amber-950/70 border border-amber-800 text-xs">
                      {maxReworkRate}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="0.5"
                    value={maxReworkRate}
                    onChange={(e) => setMaxReworkRate(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                  />
                  <p className="text-[10px] text-slate-400">
                    Phần trăm task phải sửa đổi/làm lại so với tổng task đã đóng.
                  </p>
                </div>

                {/* 2. Hạn mức Trễ deadline tối đa */}
                <div className="space-y-1.5 mb-4 p-3 rounded-lg bg-slate-950/50 border border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">Hạn mức Trễ deadline tối đa</span>
                    <span className="font-mono font-black text-amber-400 px-2 py-0.5 rounded bg-amber-950/70 border border-amber-800 text-xs">
                      {maxOverdueRate}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="0.5"
                    value={maxOverdueRate}
                    onChange={(e) => setMaxOverdueRate(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                  />
                  <p className="text-[10px] text-slate-400">
                    Phần trăm task hoàn thành sau thời hạn cam kết.
                  </p>
                </div>

                {/* 3. Hạn mức Bug phát sinh tối đa */}
                <div className="space-y-1.5 mb-4 p-3 rounded-lg bg-slate-950/50 border border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">Hạn mức Bug phát sinh tối đa</span>
                    <span className="font-mono font-black text-rose-400 px-2 py-0.5 rounded bg-rose-950/70 border border-rose-800 text-xs">
                      {maxBugRate}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    step="0.5"
                    value={maxBugRate}
                    onChange={(e) => setMaxBugRate(Number(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                  />
                  <p className="text-[10px] text-slate-400">
                    Tỷ lệ số bug kiểm thử/sản phẩm so với tổng số lượng task đóng gói.
                  </p>
                </div>

                {/* Trạng thái áp dụng */}
                <div className="space-y-1.5 mb-4">
                  <label className="text-xs font-bold text-slate-300 block">Trạng thái áp dụng</label>
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-300">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="kpi-status"
                        checked={status === 'active'}
                        onChange={() => setStatus('active')}
                        className="accent-amber-500 cursor-pointer"
                      />
                      <span>Đang áp dụng</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="kpi-status"
                        checked={status === 'archived'}
                        onChange={() => setStatus('archived')}
                        className="accent-amber-500 cursor-pointer"
                      />
                      <span>Đã kết thúc</span>
                    </label>
                  </div>
                </div>

                {/* Ghi chú cấu hình */}
                <div className="space-y-1.5 mb-4">
                  <label className="text-xs font-bold text-slate-300 block">Ghi chú cấu hình</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Nhập ghi chú hoặc căn cứ ban hành quy định KPI..."
                    className={`w-full text-xs p-2.5 rounded-lg border outline-none ${
                      isDark
                        ? 'bg-slate-950 border-slate-700 text-white focus:border-amber-400'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-amber-500'
                    }`}
                  />
                </div>

                {/* Action Button */}
                <button
                  onClick={handleSave}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Cập nhật cấu hình KPI</span>
                </button>

                {saveSuccess && (
                  <div className="mt-2 text-center text-xs font-bold text-emerald-400 animate-in fade-in flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Đã lưu cấu hình KPI và áp dụng cho toàn bộ Sprint!
                  </div>
                )}
              </div>
            </div>

            {/* Right Column (7 cols): Lịch sử thiết lập & Audit Trail */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-amber-400" />
                  Lịch sử thiết lập & Audit Trail
                </h3>
                <span className="text-[11px] text-slate-400">
                  Xem vết cấu hình và giá trị trước/sau khi lưu (BA / Admin)
                </span>
              </div>

              {/* Timeline Cards */}
              <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {(activeConfig?.auditTrail || []).map((record) => {
                  const isCurrentYear = record.year === selectedYear;
                  return (
                    <div
                      key={record.id}
                      className={`relative p-3.5 rounded-xl border transition-all ${
                        isCurrentYear
                          ? 'bg-slate-900/90 border-amber-500/60 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/40'
                          : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      {/* Timeline Dot */}
                      <span
                        className={`absolute -left-[27px] top-4 w-3 h-3 rounded-full border-2 ${
                          isCurrentYear
                            ? 'bg-amber-400 border-slate-950 ring-4 ring-amber-500/20'
                            : 'bg-slate-600 border-slate-900'
                        }`}
                      />

                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-3.5 rounded bg-amber-400" />
                          <h4 className="text-xs font-black text-white">{record.title}</h4>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            record.status === 'active'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {record.status === 'active' ? 'Đang áp dụng' : 'Đã kết thúc'}
                        </span>
                      </div>

                      {/* 3 Metric Pills */}
                      <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-lg bg-slate-950/70 border border-slate-800 text-center text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Re-work</span>
                          <span className="font-mono font-bold text-amber-300">
                            &le; {record.maxReworkRate}%
                          </span>
                        </div>
                        <div className="border-x border-slate-800">
                          <span className="text-[10px] text-slate-400 block font-medium">Trễ</span>
                          <span className="font-mono font-bold text-amber-300">
                            &le; {record.maxOverdueRate}%
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Bug</span>
                          <span className="font-mono font-bold text-rose-300">
                            &le; {record.maxBugRate}%
                          </span>
                        </div>
                      </div>

                      {/* Footer Note & Author */}
                      <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="flex items-center gap-1 truncate max-w-xs">
                          <Info className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate">{record.notes}</span>
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="flex items-center gap-1 font-semibold text-slate-300">
                            👤 {record.updatedBy}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {record.appliedAt}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-3 border-t flex items-center justify-between text-xs shrink-0 ${
            isDark ? 'border-slate-800 bg-[#121c30] text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Các hạn mức này áp dụng tức thì cho tính toán tỷ lệ Trễ hạn, Bug, Rework của từng Sprint
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
