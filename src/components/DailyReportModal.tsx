import React, { useState } from 'react';
import {
  X,
  Send,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Plus,
  Trash2,
  Sparkles,
  FileText,
  User,
  Building,
  Target
} from 'lucide-react';
import { Employee, Task, DailyWorkReport, DailyReportTaskItem } from '../types';
import { UserAvatar } from './UserAvatar';

interface DailyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
  memberTasks: Task[];
  onSubmitReport: (report: DailyWorkReport) => void;
  existingReport?: DailyWorkReport | null;
  isDark?: boolean;
}

export const DailyReportModal: React.FC<DailyReportModalProps> = ({
  isOpen,
  onClose,
  employee,
  memberTasks = [],
  onSubmitReport,
  existingReport = null,
  isDark = true,
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [reportDate, setReportDate] = useState(existingReport?.date || todayStr);
  const [completedSummary, setCompletedSummary] = useState(
    existingReport?.completedSummary || ''
  );
  const [inProgressSummary, setInProgressSummary] = useState(
    existingReport?.inProgressSummary || ''
  );
  const [blockers, setBlockers] = useState(existingReport?.blockers || '');
  const [tomorrowPlan, setTomorrowPlan] = useState(existingReport?.tomorrowPlan || '');
  const [completionScore, setCompletionScore] = useState<number>(
    existingReport?.completionRateScore || 90
  );

  // Tasks tracked for this daily report
  const [reportedTasks, setReportedTasks] = useState<DailyReportTaskItem[]>(() => {
    if (existingReport && existingReport.tasks && existingReport.tasks.length > 0) {
      return existingReport.tasks;
    }
    // Pre-populate with currently active tasks of this member
    return memberTasks.slice(0, 4).map((t) => ({
      taskId: t.id,
      taskCode: t.code,
      taskTitle: t.title,
      projectName: t.projectName,
      hoursSpent: t.actualHours ? Math.min(4, t.actualHours) : 3.5,
      progressPercent: t.status === 'done' ? 100 : 70,
      status: t.status === 'done' ? 'done' : 'in_progress',
      notes: '',
    }));
  });

  if (!isOpen) return null;

  const totalHoursLogged = Number(
    reportedTasks.reduce((sum, t) => sum + (Number(t.hoursSpent) || 0), 0).toFixed(1)
  );

  const handleTaskHourChange = (index: number, hours: number) => {
    const updated = [...reportedTasks];
    updated[index].hoursSpent = hours;
    setReportedTasks(updated);
  };

  const handleTaskProgressChange = (index: number, progress: number) => {
    const updated = [...reportedTasks];
    updated[index].progressPercent = progress;
    if (progress === 100) {
      updated[index].status = 'done';
    } else if (updated[index].status === 'done') {
      updated[index].status = 'in_progress';
    }
    setReportedTasks(updated);
  };

  const handleTaskStatusChange = (index: number, status: 'done' | 'in_progress' | 'blocked') => {
    const updated = [...reportedTasks];
    updated[index].status = status;
    if (status === 'done') updated[index].progressPercent = 100;
    setReportedTasks(updated);
  };

  const handleTaskNotesChange = (index: number, notes: string) => {
    const updated = [...reportedTasks];
    updated[index].notes = notes;
    setReportedTasks(updated);
  };

  const handleRemoveTask = (index: number) => {
    setReportedTasks(reportedTasks.filter((_, i) => i !== index));
  };

  const handleAddAvailableTask = (t: Task) => {
    if (reportedTasks.some((rt) => rt.taskCode === t.code)) return;
    setReportedTasks([
      ...reportedTasks,
      {
        taskId: t.id,
        taskCode: t.code,
        taskTitle: t.title,
        projectName: t.projectName,
        hoursSpent: 2.0,
        progressPercent: t.status === 'done' ? 100 : 50,
        status: t.status === 'done' ? 'done' : 'in_progress',
        notes: '',
      },
    ]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completedSummary.trim()) {
      alert('Vui lòng nhập tóm tắt kết quả công việc đã hoàn thành trong ngày!');
      return;
    }

    const newReport: DailyWorkReport = {
      id: existingReport?.id || `DWR-${reportDate.replace(/-/g, '')}-${Date.now().toString().slice(-4)}`,
      employeeId: employee.id,
      employeeCode: employee.code,
      employeeName: employee.name,
      employeeAvatar: employee.avatar,
      department: employee.department,
      date: reportDate,
      submittedAt: new Date().toLocaleString('vi-VN', { hour12: false }),
      hoursLogged: totalHoursLogged,
      completedSummary: completedSummary.trim(),
      inProgressSummary: inProgressSummary.trim() || 'Tiếp tục theo dõi và xử lý các hạng mục liên quan.',
      blockers: blockers.trim(),
      tomorrowPlan: tomorrowPlan.trim() || 'Tiếp tục hoàn thiện các task theo cam kết trong Sprint.',
      completionRateScore: completionScore,
      status: 'submitted',
      tasks: reportedTasks,
      managerFeedback: existingReport?.managerFeedback,
      reviewedBy: existingReport?.reviewedBy,
      reviewedAt: existingReport?.reviewedAt,
    };

    onSubmitReport(newReport);
    onClose();
  };

  const unassignedTasks = memberTasks.filter(
    (mt) => !reportedTasks.some((rt) => rt.taskCode === mt.code)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div
        className={`w-full max-w-4xl rounded-2xl border shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh] transition-all ${
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">
                  {existingReport ? 'CẬP NHẬT BÁO CÁO CÔNG VIỆC' : 'BÁO CÁO CÔNG VIỆC TRONG NGÀY'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                  Gửi Quản Lý Dự Án
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Thành viên: <strong className="text-slate-200">{employee.name}</strong> ({employee.code}) - {employee.department}
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

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* Section 1: Date & Workload Indicator */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Report Date */}
            <div>
              <label className="block font-bold text-slate-400 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                Ngày Báo Cáo
              </label>
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                  isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-800'
                }`}
              />
            </div>

            {/* Total Hours Logged */}
            <div>
              <label className="block font-bold text-slate-400 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Tổng Giờ Đã Ghi Nhận (Actual Hours)
              </label>
              <div
                className={`px-3 py-2 rounded-xl border flex items-center justify-between font-bold ${
                  totalHoursLogged > 8.0
                    ? 'bg-rose-950/40 border-rose-800 text-rose-300'
                    : totalHoursLogged >= 7.0
                    ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                    : 'bg-blue-950/40 border-blue-800 text-blue-300'
                }`}
              >
                <span>{totalHoursLogged} Giờ / 8.0h Chuẩn</span>
                <span className="text-[11px] font-normal">
                  {totalHoursLogged > 8.0 ? '⚠️ Vượt 8h' : totalHoursLogged >= 7.0 ? '✓ Đạt chuẩn 8h' : '🟢 Dưới 8h'}
                </span>
              </div>
            </div>

            {/* Completion Self-Rating */}
            <div>
              <label className="block font-bold text-slate-400 mb-1 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                Tự Đánh Giá Mức Độ Hoàn Thành (% Kế Hoạch)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="30"
                  max="100"
                  step="5"
                  value={completionScore}
                  onChange={(e) => setCompletionScore(Number(e.target.value))}
                  className="flex-1 accent-indigo-500 cursor-pointer"
                />
                <span className="font-bold text-sm text-indigo-400 min-w-[45px] text-right">
                  {completionScore}%
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Tasks breakdown today */}
          <div
            className={`p-4 rounded-xl border space-y-3 ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                  Các Task Công Việc Xử Lý Trong Ngày
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold text-[10px]">
                  {reportedTasks.length} Tasks
                </span>
              </div>

              {unassignedTasks.length > 0 && (
                <div className="flex items-center gap-1 text-[11px]">
                  <span className="text-slate-400 hidden sm:inline">Thêm task khác:</span>
                  <select
                    onChange={(e) => {
                      const found = memberTasks.find((t) => t.code === e.target.value);
                      if (found) handleAddAvailableTask(found);
                      e.target.value = '';
                    }}
                    className={`px-2 py-1 rounded-lg border text-[11px] font-semibold ${
                      isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300'
                    }`}
                    defaultValue=""
                  >
                    <option value="" disabled>+ Chọn task thêm vào báo cáo</option>
                    {unassignedTasks.map((t) => (
                      <option key={t.id} value={t.code}>
                        [{t.code}] {t.title.slice(0, 35)}...
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {reportedTasks.length > 0 ? (
              <div className="space-y-2.5">
                {reportedTasks.map((rt, idx) => (
                  <div
                    key={rt.taskCode + idx}
                    className={`p-3 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
                      isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-400">{rt.taskCode}</span>
                        <span className="font-semibold text-slate-200 line-clamp-1">{rt.taskTitle}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{rt.projectName || 'Dự án chính'}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                      {/* Hours */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-bold">Giờ làm:</span>
                        <input
                          type="number"
                          step="0.5"
                          min="0.5"
                          max="10"
                          value={rt.hoursSpent}
                          onChange={(e) => handleTaskHourChange(idx, parseFloat(e.target.value) || 0)}
                          className={`w-16 px-2 py-1 rounded-lg border text-center font-bold text-xs ${
                            isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-100 border-slate-300'
                          }`}
                        />
                        <span className="text-[10px] text-slate-400">h</span>
                      </div>

                      {/* Progress */}
                      <div className="flex items-center gap-1.5 min-w-[120px]">
                        <span className="text-[10px] text-slate-400 font-bold">Tiến độ:</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={rt.progressPercent}
                          onChange={(e) => handleTaskProgressChange(idx, Number(e.target.value))}
                          className="w-16 accent-indigo-500"
                        />
                        <span className="text-[10px] font-bold text-indigo-400 w-8 text-right">
                          {rt.progressPercent}%
                        </span>
                      </div>

                      {/* Status */}
                      <select
                        value={rt.status}
                        onChange={(e) =>
                          handleTaskStatusChange(idx, e.target.value as 'done' | 'in_progress' | 'blocked')
                        }
                        className={`px-2 py-1 rounded-lg border text-[11px] font-bold ${
                          rt.status === 'done'
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                            : rt.status === 'blocked'
                            ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                            : 'bg-blue-950/80 text-blue-300 border-blue-800'
                        }`}
                      >
                        <option value="in_progress">Đang làm</option>
                        <option value="done">Hoàn thành</option>
                        <option value="blocked">Bị chặn (Blocked)</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => handleRemoveTask(idx)}
                        className="p-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-rose-400 transition"
                        title="Bỏ task khỏi báo cáo hôm nay"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-4">Chưa chọn task nào cho báo cáo hôm nay.</p>
            )}
          </div>

          {/* Section 3: Detailed Written Report */}
          <div className="space-y-4">
            {/* Completed */}
            <div>
              <label className="block font-bold text-slate-300 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  1. Kết Quả Đã Hoàn Thành Trong Ngày (What was completed) <span className="text-rose-400">*</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Nêu cụ thể sản phẩm, PR, test case đã hoàn tất</span>
              </label>
              <textarea
                rows={2}
                required
                value={completedSummary}
                onChange={(e) => setCompletedSummary(e.target.value)}
                placeholder="Ví dụ: Đã hoàn thành code chức năng thanh toán QR, đã chạy pass 12 unit test và commit lên branch feature/qr-pay..."
                className={`w-full px-3 py-2 rounded-xl border font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none transition ${
                  isDark ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500' : 'bg-slate-50 border-slate-300 placeholder-slate-400'
                }`}
              />
            </div>

            {/* In-Progress */}
            <div>
              <label className="block font-bold text-slate-300 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  2. Công Việc Đang Làm Dở Dang (What is in progress)
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Hạng mục dự kiến hoàn tất trong các phiên tiếp theo</span>
              </label>
              <textarea
                rows={2}
                value={inProgressSummary}
                onChange={(e) => setInProgressSummary(e.target.value)}
                placeholder="Ví dụ: Đang viết tài liệu API Swagger và tối ưu truy vấn SQL module lịch sử giao dịch..."
                className={`w-full px-3 py-2 rounded-xl border font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none transition ${
                  isDark ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500' : 'bg-slate-50 border-slate-300 placeholder-slate-400'
                }`}
              />
            </div>

            {/* Blockers & Impediments */}
            <div>
              <label className="block font-bold text-amber-400 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  3. Khó Khăn / Vướng Mắc / Blockers Cần Quản Lý Hỗ Trợ (Impediments)
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Để trống nếu không có khó khăn</span>
              </label>
              <textarea
                rows={2}
                value={blockers}
                onChange={(e) => setBlockers(e.target.value)}
                placeholder="Ví dụ: Chưa được cấp quyền truy cập server staging / Chờ phản hồi API từ phía ngân hàng đối tác..."
                className={`w-full px-3 py-2 rounded-xl border font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none transition ${
                  isDark ? 'bg-slate-900 border-amber-900/50 text-slate-100 placeholder-slate-500' : 'bg-amber-50/50 border-amber-300 placeholder-slate-400'
                }`}
              />
            </div>

            {/* Tomorrow Plan */}
            <div>
              <label className="block font-bold text-slate-300 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  4. Kế Hoạch Công Việc Ngày Tiếp Theo (Tomorrow's Plan)
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Các mục tiêu ưu tiên số 1</span>
              </label>
              <textarea
                rows={2}
                value={tomorrowPlan}
                onChange={(e) => setTomorrowPlan(e.target.value)}
                placeholder="Ví dụ: Phối hợp QA kiểm thử tích hợp và demo sản phẩm cho PM vào lúc 15h..."
                className={`w-full px-3 py-2 rounded-xl border font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none transition ${
                  isDark ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500' : 'bg-slate-50 border-slate-300 placeholder-slate-400'
                }`}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div
            className={`pt-4 border-t flex items-center justify-between gap-4 ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}
          >
            <div className="text-[11px] text-slate-400">
              Báo cáo sẽ được chuyển thẳng đến Quản Lý Dự Án để duyệt & theo dõi KPI.
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-xl font-bold border transition ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                }`}
              >
                Hủy Bỏ
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition"
              >
                <Send className="w-4 h-4" />
                <span>Gửi Báo Cáo Cho Quản Lý</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
