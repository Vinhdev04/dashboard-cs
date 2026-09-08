import React from 'react';
import {
  Wrench,
  Sparkles,
  CheckSquare,
  Clock,
  Bug,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle,
  Users,
} from 'lucide-react';
import { OverviewMetricsData, ComparisonTrend, TimePeriod } from '../types';

interface OverviewMetricsProps {
  data: OverviewMetricsData;
  period: TimePeriod;
  showComparison: boolean;
  onOpenEmployeeDetail: (metricType: 'overdue' | 'bug' | 'rework') => void;
  onOpenProjectsDetail?: (projectType: 'maintenance' | 'new') => void;
  onOpenTasksDetail?: () => void;
  isDark?: boolean;
}

export const OverviewMetrics: React.FC<OverviewMetricsProps> = ({
  data,
  period,
  showComparison,
  onOpenEmployeeDetail,
  onOpenProjectsDetail,
  onOpenTasksDetail,
  isDark = true,
}) => {
  // OLD:
  // const renderTrendBadge = (trend: ComparisonTrend, label: string) => { ... }
  // const renderQualityTrendBadge = (trend?: ComparisonTrend, diffText?: string) => { ... }

  /**
   * Render badge xu hướng tăng/giảm số lượng task hiển thị ngắn gọn vừa vặn trên 1 dòng
   */
  const renderTrendBadge = (trend: ComparisonTrend, label: string) => {
    if (!showComparison) return null;

    if (trend === 'up') {
      return (
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
          isDark
            ? 'text-emerald-400 bg-emerald-950/80 border-emerald-700/80'
            : 'text-emerald-700 bg-emerald-50 border-emerald-300'
        }`}>
          <TrendingUp className="w-3 h-3 shrink-0" />
          {label}
        </span>
      );
    }
    if (trend === 'down') {
      return (
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
          isDark
            ? 'text-rose-400 bg-rose-950/80 border-rose-700/80'
            : 'text-rose-700 bg-rose-50 border-rose-300'
        }`}>
          <TrendingDown className="w-3 h-3 shrink-0" />
          {label}
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
        isDark
          ? 'text-slate-300 bg-slate-800 border-slate-700'
          : 'text-slate-700 bg-slate-100 border-slate-300'
      }`}>
        <Minus className="w-3 h-3 shrink-0" />
        0%
      </span>
    );
  };

  /**
   * Render badge tỷ lệ chất lượng (Trễ hạn, Bug, Rework) hiển thị Mũi tên + Con số % ngắn gọn chống trượt dòng
   */
  const renderQualityTrendBadge = (trend?: ComparisonTrend, diffText?: string) => {
    if (!showComparison || !trend || !diffText) return null;

    const cleanText = (diffText || '').replace(/\s*so với kỳ trước\s*/gi, '').trim();

    if (trend === 'down') {
      return (
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${
          isDark
            ? 'text-emerald-400 bg-emerald-950/80 border-emerald-700/80'
            : 'text-emerald-700 bg-emerald-50 border-emerald-300'
        }`}>
          <TrendingDown className="w-3 h-3 shrink-0" />
          {cleanText} (Tốt)
        </span>
      );
    }
    if (trend === 'up') {
      return (
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${
          isDark
            ? 'text-rose-400 bg-rose-950/80 border-rose-700/80'
            : 'text-rose-700 bg-rose-50 border-rose-300'
        }`}>
          <TrendingUp className="w-3 h-3 shrink-0" />
          {cleanText} (Vượt)
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${
        isDark
          ? 'text-slate-300 bg-slate-800 border-slate-700'
          : 'text-slate-700 bg-slate-100 border-slate-300'
      }`}>
        <Minus className="w-3 h-3 shrink-0" />
        0%
      </span>
    );
  };

  const periodNameMap: Record<TimePeriod, string> = {
    today: 'hôm qua',
    week: 'tuần trước',
    month: 'tháng trước',
    year: 'năm trước',
  };

  return (
    <section id="section-overview" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2
            className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${
              isDark ? 'text-blue-300' : 'text-slate-900'
            }`}
          >
            MỤC 2: TỔNG QUAN CHỈ SỐ DỰ ÁN & CHẤT LƯỢNG (6 THẺ KPI ĐỐI CHIẾU)
          </h2>
          <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Thống kê theo khoảng thời gian đã chọn kèm so sánh cùng kỳ trước đó và mục tiêu chất lượng công ty
          </p>
        </div>
        <div className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          So sánh đối chiếu cùng kỳ: <span className="font-bold text-blue-500 capitalize">{periodNameMap[period]}</span>
        </div>
      </div>

      {/* 6 Metric Cards Grid - Responsive: 1 cột mobile, 2 cột tablet, 3 cột laptop md/lg, 6 cột desktop xl */}
      {/* OLD: <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5"> */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* 1. Tổng số dự án bảo trì */}
        <div
          className={`p-4 rounded-xl border flex flex-col justify-between transition-all shadow-md ${
            isDark
              ? 'bg-[#0f172a] border-slate-800 hover:border-slate-700'
              : 'bg-white border-slate-200 hover:border-blue-300'
          }`}
        >
          <div className="flex items-start justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Tổng DA Bảo Trì
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs">
              <Wrench className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="mt-2.5">
            <div className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {data.maintenanceProjects.current}{' '}
              <span className={`text-xs font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Dự án</span>
            </div>

            {showComparison ? (
              <div className={`mt-2 pt-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'} flex items-center justify-between text-[11px]`}>
                <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Kỳ trước: {data.maintenanceProjects.previous}</span>
                {renderTrendBadge(data.maintenanceProjects.trend, data.maintenanceProjects.label)}
              </div>
            ) : (
              <div className={`mt-2 pt-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'} text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Hệ thống ổn định
              </div>
            )}

            <div className={`mt-2 pt-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <button
                onClick={() => onOpenProjectsDetail?.('maintenance')}
                className="w-full text-left text-[11px] text-blue-500 hover:text-blue-400 font-bold hover:underline flex items-center justify-between"
              >
                <span>Xem chi tiết</span>
                <Users className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* 2. Tổng số dự án mới */}
        <div
          className={`p-4 rounded-xl border flex flex-col justify-between transition-all shadow-md ${
            isDark
              ? 'bg-[#0f172a] border-slate-800 hover:border-slate-700'
              : 'bg-white border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-start justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Tổng DA Mới
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="mt-2.5">
            <div className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {data.newProjects.current}{' '}
              <span className={`text-xs font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Dự án</span>
            </div>

            {showComparison ? (
              <div className={`mt-2 pt-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'} flex items-center justify-between text-[11px]`}>
                <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Kỳ trước: {data.newProjects.previous}</span>
                {renderTrendBadge(data.newProjects.trend, data.newProjects.label)}
              </div>
            ) : (
              <div className={`mt-2 pt-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'} text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Triển khai giai đoạn mới
              </div>
            )}

            <div className={`mt-2 pt-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <button
                onClick={() => onOpenProjectsDetail?.('new')}
                className="w-full text-left text-[11px] text-blue-500 hover:text-blue-400 font-bold hover:underline flex items-center justify-between"
              >
                <span>Xem chi tiết</span>
                <Users className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* 3. Tổng số Task */}
        <div
          className={`p-4 rounded-xl border flex flex-col justify-between transition-all shadow-md ${
            isDark
              ? 'bg-[#0f172a] border-slate-800 hover:border-slate-700'
              : 'bg-white border-slate-200 hover:border-indigo-300'
          }`}
        >
          <div className="flex items-start justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Tổng số Task
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xs">
              <CheckSquare className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="mt-2.5">
            <div className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {data.totalTasks.current.toLocaleString()}{' '}
              <span className={`text-xs font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Task</span>
            </div>

            {showComparison ? (
              <div className={`mt-2 pt-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'} flex items-center justify-between text-[11px]`}>
                <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Kỳ trước: {data.totalTasks.previous.toLocaleString()}</span>
                {renderTrendBadge(data.totalTasks.trend, data.totalTasks.label)}
              </div>
            ) : (
              <div className={`mt-2 pt-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'} text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Toàn bộ luồng công việc
              </div>
            )}

            <div className={`mt-2 pt-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <button
                onClick={() => onOpenTasksDetail?.()}
                className="w-full text-left text-[11px] text-blue-500 hover:text-blue-400 font-bold hover:underline flex items-center justify-between"
              >
                <span>Xem chi tiết</span>
                <Users className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* 4. Tỷ lệ Task trễ */}
        <div
          id="card-overdue-rate"
          className={`p-4 rounded-xl border flex flex-col justify-between transition-all shadow-md ${
            data.overdueRate.isExceeded
              ? isDark
                ? 'bg-[#18111d] border-rose-800/80 hover:border-rose-600'
                : 'bg-rose-50/60 border-rose-300 hover:border-rose-400'
              : isDark
              ? 'bg-[#0f172a] border-slate-800 hover:border-slate-700'
              : 'bg-white border-slate-200 hover:border-blue-300'
          }`}
        >
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider">
              Tỷ lệ Task trễ
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold text-xs">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="mt-2">
            <div className="text-2xl font-black text-rose-500">
              {data.overdueRate.value}%
            </div>

            <div className="flex items-center gap-1 text-[10px] font-semibold mt-1">
              {data.overdueRate.isExceeded ? (
                <span className="text-rose-500 flex items-center gap-0.5">
                  <AlertCircle className="w-3 h-3" />
                  MT: &le; {data.overdueRate.target}% (Vượt +{(data.overdueRate.value - data.overdueRate.target).toFixed(1)}%)
                </span>
              ) : (
                <span className="text-emerald-500 flex items-center gap-0.5">
                  <CheckCircle className="w-3 h-3" />
                  MT: &le; {data.overdueRate.target}% (Đạt)
                </span>
              )}
            </div>

            {/* Comparison trend for overdue rate */}
            {showComparison && data.overdueRate.previousValue !== undefined && (
              <div className={`mt-2 pt-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'} flex items-center justify-between text-[11px]`}>
                <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Kỳ trước: {data.overdueRate.previousValue}%
                </span>
                {renderQualityTrendBadge(data.overdueRate.trend, data.overdueRate.diffText)}
              </div>
            )}

            <div className={`mt-2 pt-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <button
                onClick={() => onOpenEmployeeDetail('overdue')}
                className="w-full text-left text-[11px] text-blue-500 hover:text-blue-400 font-bold hover:underline flex items-center justify-between"
              >
                <span>Xem theo nhân viên</span>
                <Users className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* 5. Tỷ lệ Task Bug */}
        <div
          id="card-bug-rate"
          className={`p-4 rounded-xl border flex flex-col justify-between transition-all shadow-md ${
            data.bugRate.isExceeded
              ? isDark
                ? 'bg-[#181512] border-amber-800/80 hover:border-amber-600'
                : 'bg-amber-50/60 border-amber-300 hover:border-amber-400'
              : isDark
              ? 'bg-[#0f172a] border-slate-800 hover:border-slate-700'
              : 'bg-white border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">
              Tỷ lệ Task Bug
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xs">
              <Bug className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="mt-2">
            <div className="text-2xl font-black text-amber-500">
              {data.bugRate.value}%
            </div>

            <div className="flex items-center gap-1 text-[10px] font-semibold mt-1">
              {data.bugRate.isExceeded ? (
                <span className="text-amber-500 flex items-center gap-0.5">
                  <AlertCircle className="w-3 h-3" />
                  MT: &le; {data.bugRate.target}% (Vượt +{(data.bugRate.value - data.bugRate.target).toFixed(1)}%)
                </span>
              ) : (
                <span className="text-emerald-500 flex items-center gap-0.5">
                  <CheckCircle className="w-3 h-3" />
                  MT: &le; {data.bugRate.target}% (Đạt)
                </span>
              )}
            </div>

            {/* Comparison trend for bug rate */}
            {showComparison && data.bugRate.previousValue !== undefined && (
              <div className={`mt-2 pt-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'} flex items-center justify-between text-[11px]`}>
                <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Kỳ trước: {data.bugRate.previousValue}%
                </span>
                {renderQualityTrendBadge(data.bugRate.trend, data.bugRate.diffText)}
              </div>
            )}

            <div className={`mt-2 pt-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <button
                onClick={() => onOpenEmployeeDetail('bug')}
                className="w-full text-left text-[11px] text-blue-500 hover:text-blue-400 font-bold hover:underline flex items-center justify-between"
              >
                <span>Xem theo nhân viên</span>
                <Users className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* 6. Tỷ lệ Task Rework */}
        <div
          id="card-rework-rate"
          className={`p-4 rounded-xl border flex flex-col justify-between transition-all shadow-md ${
            data.reworkRate.isExceeded
              ? isDark
                ? 'bg-[#17111c] border-purple-800/80 hover:border-purple-600'
                : 'bg-purple-50/60 border-purple-300 hover:border-purple-400'
              : isDark
              ? 'bg-[#0f172a] border-slate-800 hover:border-slate-700'
              : 'bg-white border-slate-200 hover:border-purple-300'
          }`}
        >
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-purple-500 uppercase tracking-wider">
              Tỷ lệ Rework
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-xs">
              <RotateCcw className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="mt-2">
            <div className="text-2xl font-black text-purple-500">
              {data.reworkRate.value}%
            </div>

            <div className="flex items-center gap-1 text-[10px] font-semibold mt-1">
              {data.reworkRate.isExceeded ? (
                <span className="text-rose-500 flex items-center gap-0.5">
                  <AlertCircle className="w-3 h-3" />
                  MT: &le; {data.reworkRate.target}% (Vượt +{(data.reworkRate.value - data.reworkRate.target).toFixed(1)}%)
                </span>
              ) : (
                <span className="text-emerald-500 flex items-center gap-0.5">
                  <CheckCircle className="w-3 h-3" />
                  MT: &le; {data.reworkRate.target}% (Đạt)
                </span>
              )}
            </div>

            {/* Comparison trend for rework rate */}
            {showComparison && data.reworkRate.previousValue !== undefined && (
              <div className={`mt-2 pt-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'} flex items-center justify-between text-[11px]`}>
                <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Kỳ trước: {data.reworkRate.previousValue}%
                </span>
                {renderQualityTrendBadge(data.reworkRate.trend, data.reworkRate.diffText)}
              </div>
            )}

            <div className={`mt-2 pt-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <button
                onClick={() => onOpenEmployeeDetail('rework')}
                className="w-full text-left text-[11px] text-blue-500 hover:text-blue-400 font-bold hover:underline flex items-center justify-between"
              >
                <span>Xem theo nhân viên</span>
                <Users className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
