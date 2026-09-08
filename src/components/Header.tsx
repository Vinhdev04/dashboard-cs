import React from 'react';
import {
  Layers,
  Clock,
  LayoutGrid,
  Download,
  Upload,
  Printer,
  Moon,
  Sun,
  RefreshCw,
  Sparkles,
  Calendar,
  SlidersHorizontal,
} from 'lucide-react';
import { TimePeriod } from '../types';

interface HeaderProps {
  currentPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  showComparison: boolean;
  onToggleComparison: (val: boolean) => void;
  onOpenCustomWidgets: () => void;
  onOpenImportExport: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPeriod,
  onPeriodChange,
  showComparison,
  onToggleComparison,
  onOpenCustomWidgets,
  onOpenImportExport,
  isDark,
  onToggleTheme,
}) => {
  const periodLabels: { id: TimePeriod; label: string; desc: string }[] = [
    { id: 'today', label: 'Hôm nay', desc: 'Chỉ số trong ngày' },
    { id: 'week', label: 'Tuần', desc: 'Tuần này (W37)' },
    { id: 'month', label: 'Tháng', desc: 'Tháng 9/2026' },
    { id: 'year', label: 'Năm', desc: 'Năm 2026' },
  ];

  return (
    <header
      className={`sticky top-0 z-40 border-b shadow-md print:hidden transition-colors ${
        isDark ? 'bg-[#0b1120]/95 backdrop-blur border-slate-800' : 'bg-white/95 backdrop-blur border-slate-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        {/* Top brand & controls bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Brand & title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-500 text-white font-black flex items-center justify-center text-lg shadow-md shadow-blue-500/25">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1
                  className={`text-base sm:text-lg font-black uppercase tracking-tight ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  DASHBOARD QUẢN LÝ DỰ ÁN & NGUỒN LỰC
                </h1>
                <span className="text-[10px] font-bold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded-full border border-blue-800/80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ERP CS v3.2
                </span>
              </div>
              <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Giám sát tiến độ Sprint, quản lý tải nhân sự & phân tích chất lượng dự án thời gian thực
              </p>
            </div>
          </div>

          {/* Right Action Tools & Filter */}
          <div className="flex flex-wrap items-center gap-2">
            {/* 1. BỘ LỌC THỜI GIAN */}
            <div
              className={`flex items-center p-1 rounded-xl border ${
                isDark ? 'bg-slate-900/90 border-slate-700/80' : 'bg-slate-100 border-slate-200'
              }`}
              id="time-filter-group"
            >
              {periodLabels.map((p) => {
                const isActive = currentPeriod === p.id;
                return (
                  <button
                    key={p.id}
                    id={`btn-filter-${p.id}`}
                    onClick={() => onPeriodChange(p.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : isDark
                        ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                    }`}
                    title={p.desc}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            {/* Custom Widgets Button */}
            <button
              id="btn-custom-widgets"
              onClick={onOpenCustomWidgets}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                isDark
                  ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
              }`}
              title="Tùy chỉnh bật/tắt hoặc sắp xếp thứ tự widget trên màn hình"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Tùy Chỉnh Widget</span>
            </button>

            {/* Import / Export Button */}
            <button
              id="btn-import-export"
              onClick={onOpenImportExport}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                isDark
                  ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
              }`}
              title="Xuất file báo cáo Excel chi tiết hoặc nhập dữ liệu mới vào hệ thống"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Xuất Báo Cáo / Nhập</span>
            </button>

            {/* Print A4 quick button */}
            <button
              onClick={() => window.print()}
              className={`p-2 rounded-xl text-xs font-bold border transition ${
                isDark
                  ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-300'
              }`}
              title="In báo cáo A4 / Xuất PDF"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>

            {/* Theme toggle */}
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-xl text-xs font-bold border transition ${
                isDark
                  ? 'bg-slate-900 hover:bg-slate-800 text-amber-400 border-slate-700'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
              }`}
              title={isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
            >
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Sub-bar: Status note & Comparison toggle */}
        <div
          className={`mt-2.5 pt-2 border-t flex flex-wrap items-center justify-between text-xs gap-2 ${
            isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
              <Clock className="w-3 h-3 text-blue-400" />
              Thời gian thực: <strong className="text-slate-300">07/09/2026</strong> • Áp dụng so sánh cùng kỳ trước đó
            </span>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer select-none text-[11px] font-semibold">
              <input
                type="checkbox"
                checked={showComparison}
                onChange={(e) => onToggleComparison(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-blue-600"
              />
              <span className={showComparison ? (isDark ? 'text-blue-300' : 'text-blue-600') : 'text-slate-400'}>
                Bật chỉ số so sánh cùng kỳ (Tăng / Giảm)
              </span>
            </label>

            <span className="hidden sm:inline-block text-slate-600">•</span>

            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              Đồng bộ dữ liệu thời gian thực
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
