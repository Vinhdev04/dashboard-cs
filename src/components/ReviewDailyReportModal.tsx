import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MessageSquare,
  FileText,
  User,
  Calendar,
  Sparkles,
  ShieldCheck,
  Send,
  Target
} from 'lucide-react';
import { DailyWorkReport } from '../types';
import { UserAvatar } from './UserAvatar';

interface ReviewDailyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: DailyWorkReport | null;
  onUpdateReportStatus: (
    reportId: string,
    newStatus: 'reviewed' | 'needs_clarification',
    managerFeedback: string
  ) => void;
  isDark?: boolean;
}

export const ReviewDailyReportModal: React.FC<ReviewDailyReportModalProps> = ({
  isOpen,
  onClose,
  report,
  onUpdateReportStatus,
  isDark = true,
}) => {
  if (!isOpen || !report) return null;

  const [feedback, setFeedback] = useState(report.managerFeedback || '');

  const handleApprove = () => {
    onUpdateReportStatus(
      report.id,
      'reviewed',
      feedback.trim() || 'Đã duyệt báo cáo công việc trong ngày. Tiến độ đảm bảo.'
    );
    onClose();
  };

  const handleRequestClarification = () => {
    if (!feedback.trim()) {
      alert('Vui lòng nhập nội dung chỉ đạo / cần giải trình thêm trước khi gửi!');
      return;
    }
    onUpdateReportStatus(report.id, 'needs_clarification', feedback.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div
        className={`w-full max-w-3xl rounded-2xl border shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh] transition-all ${
          isDark ? 'bg-[#0f172a] border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-800'
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <UserAvatar
              name={report.employeeName}
              avatar={report.employeeAvatar}
              className="w-10 h-10 rounded-xl border border-slate-700 shadow"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">DUYỆT BÁO CÁO CÔNG VIỆC NGÀY</h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    report.status === 'reviewed'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : report.status === 'needs_clarification'
                      ? 'bg-amber-950 text-amber-300 border-amber-800'
                      : 'bg-blue-950 text-blue-300 border-blue-800'
                  }`}
                >
                  {report.status === 'reviewed'
                    ? '✓ Đã Duyệt'
                    : report.status === 'needs_clarification'
                    ? '⚠️ Yêu Cầu Giải Trình'
                    : '⏳ Chờ Duyệt'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                <strong className="text-slate-200">{report.employeeName}</strong> ({report.employeeCode}) • {report.department} • Ngày: {report.date}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3">
            <div
              className={`p-3 rounded-xl border ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className="text-[10px] text-slate-400 font-bold uppercase">Giờ Công Đã Làm</span>
              <div className="text-base font-black text-blue-400 mt-0.5">
                {report.hoursLogged} Giờ / 8.0h
              </div>
            </div>

            <div
              className={`p-3 rounded-xl border ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className="text-[10px] text-slate-400 font-bold uppercase">Tự Đánh Giá Hoàn Thành</span>
              <div className="text-base font-black text-emerald-400 mt-0.5">
                {report.completionRateScore || 90}%
              </div>
            </div>

            <div
              className={`p-3 rounded-xl border ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className="text-[10px] text-slate-400 font-bold uppercase">Số Task Đã Chạm</span>
              <div className="text-base font-black text-indigo-400 mt-0.5">
                {report.tasks?.length || 0} Task
              </div>
            </div>
          </div>

          {/* Tasks in this report */}
          {report.tasks && report.tasks.length > 0 && (
            <div
              className={`p-3.5 rounded-xl border space-y-2 ${
                isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className="font-bold text-slate-300 text-[11px] uppercase tracking-wider block">
                Chi Tiết Tiến Độ Các Task
              </span>
              <div className="space-y-1.5">
                {report.tasks.map((t, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${
                      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div>
                      <span className="font-mono font-bold text-blue-400 mr-2">[{t.taskCode}]</span>
                      <span className="font-semibold text-slate-200">{t.taskTitle}</span>
                      {t.notes && <p className="text-[11px] text-slate-400 mt-0.5 italic">{t.notes}</p>}
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <span className="text-[11px] text-slate-400">{t.hoursSpent}h</span>
                      <span className="font-bold text-indigo-400 text-xs">{t.progressPercent}%</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.status === 'done'
                            ? 'bg-emerald-950 text-emerald-300'
                            : t.status === 'blocked'
                            ? 'bg-rose-950 text-rose-300'
                            : 'bg-blue-950 text-blue-300'
                        }`}
                      >
                        {t.status === 'done' ? 'Xong' : t.status === 'blocked' ? 'Bị chặn' : 'Đang làm'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Summary */}
          <div
            className={`p-3.5 rounded-xl border ${
              isDark ? 'bg-emerald-950/20 border-emerald-800/60' : 'bg-emerald-50/60 border-emerald-200'
            }`}
          >
            <span className="font-bold text-emerald-400 text-[11px] uppercase tracking-wider block mb-1">
              ✓ 1. Kết Quả Đã Hoàn Thành:
            </span>
            <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">
              {report.completedSummary}
            </p>
          </div>

          {/* In-Progress Summary */}
          <div
            className={`p-3.5 rounded-xl border ${
              isDark ? 'bg-blue-950/20 border-blue-800/60' : 'bg-blue-50/60 border-blue-200'
            }`}
          >
            <span className="font-bold text-blue-400 text-[11px] uppercase tracking-wider block mb-1">
              ⏳ 2. Đang Xử Lý Dở Dang:
            </span>
            <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">
              {report.inProgressSummary}
            </p>
          </div>

          {/* Blockers */}
          {report.blockers && (
            <div
              className={`p-3.5 rounded-xl border ${
                isDark ? 'bg-amber-950/30 border-amber-800/80' : 'bg-amber-50 border-amber-300'
              }`}
            >
              <span className="font-bold text-amber-400 text-[11px] uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                3. Khó Khăn / Vướng Mắc Cần Quản Lý Hỗ Trợ:
              </span>
              <p className="text-amber-200 font-medium whitespace-pre-wrap leading-relaxed">
                {report.blockers}
              </p>
            </div>
          )}

          {/* Tomorrow Plan */}
          {report.tomorrowPlan && (
            <div
              className={`p-3.5 rounded-xl border ${
                isDark ? 'bg-purple-950/20 border-purple-800/60' : 'bg-purple-50 border-purple-200'
              }`}
            >
              <span className="font-bold text-purple-400 text-[11px] uppercase tracking-wider block mb-1">
                🎯 4. Kế Hoạch Công Việc Ngày Mai:
              </span>
              <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                {report.tomorrowPlan}
              </p>
            </div>
          )}

          {/* Manager Feedback Section */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="block font-bold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                Ý Kiến Nhận Xét & Chỉ Đạo Của Quản Lý (PM / Tech Lead)
              </span>
              {report.reviewedBy && (
                <span className="text-[10px] text-slate-400 font-normal">
                  Duyệt bởi {report.reviewedBy} lúc {report.reviewedAt}
                </span>
              )}
            </label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Nhập nhận xét động viên, hướng dẫn xử lý blocker hoặc chỉ đạo tiếp theo cho thành viên..."
              className={`w-full px-3 py-2 rounded-xl border font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none transition ${
                isDark ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500' : 'bg-slate-50 border-slate-300 placeholder-slate-400'
              }`}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div
          className={`px-6 py-4 border-t flex items-center justify-between gap-3 ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl font-bold border transition ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
          >
            Đóng
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRequestClarification}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold bg-amber-600 hover:bg-amber-500 text-white transition"
              title="Yêu cầu thành viên bổ sung thêm thông tin"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Yêu Cầu Giải Trình Thêm</span>
            </button>
            <button
              type="button"
              onClick={handleApprove}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition"
              title="Xác nhận duyệt báo cáo công việc của thành viên"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Duyệt Báo Cáo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
