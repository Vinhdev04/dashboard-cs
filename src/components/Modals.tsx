import React, { useState } from 'react';
import {
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  Calendar,
  Briefcase,
  Layers,
  Search,
  Filter,
  Wrench,
  Sparkles,
  CheckSquare,
  ExternalLink,
} from 'lucide-react';
import { Employee, Task, Project, TodayHardMetrics } from '../types';
import { UserAvatar } from './UserAvatar';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  isDark?: boolean;
}

/**
 * Component ModalBase khung nền chính cho tất cả các Popup trong hệ thống
 * Hỗ trợ giao diện Tối (Dark Theme) chống chói mắt chuẩn UI/UX Pro Max
 */
export const ModalBase: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  isDark = true,
}) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
    >
      {/* OLD: <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"> */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`rounded-2xl border shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden transition-colors ${
          isDark
            ? 'bg-[#0f172a] border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between transition-colors ${
            isDark ? 'bg-[#141e33] border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div>
            <h3
              className={`text-sm font-black uppercase tracking-wider ${
                isDark ? 'text-slate-100' : 'text-slate-900'
              }`}
            >
              {title}
            </h3>
            {subtitle && (
              <p
                className={`text-xs mt-0.5 font-medium ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div
          className={`p-6 overflow-y-auto space-y-4 flex-1 ${
            isDark ? 'text-slate-200' : 'text-slate-800'
          }`}
        >
          {children}
        </div>

        {/* Footer */}
        <div
          className={`border-t px-6 py-3 flex justify-end transition-colors ${
            isDark ? 'bg-[#141e33] border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-md transition-colors"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};

// 1. Modal Chi Tiết Task Hôm Nay & Task Của Nhân Viên (Card Layout Chuẩn Mẫu Hình 1 & Hình 3)
export const TodayTasksModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  tasks?: Task[];
  employee?: Employee | null;
  isDark?: boolean;
}> = ({ isOpen, onClose, tasks = [], employee, isDark = true }) => {
  const [taskSearch, setTaskSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  if (!isOpen) return null;

  /** Nếu có employee -> Lọc danh sách task của nhân sự đó. Ngược lại -> Lọc task today */
  const targetTasks = employee
    ? (tasks || []).filter((t) => t.assigneeId === employee.id || t.assigneeName.toLowerCase().includes(employee.name.toLowerCase()))
    : (tasks || []).filter((t) => t.isToday);

  // Lọc task đa chiều theo từ khóa tìm kiếm, trạng thái, mức ưu tiên và loại task
  const filteredTasks = targetTasks.filter((t) => {
    const matchesSearch =
      t.code.toLowerCase().includes(taskSearch.toLowerCase()) ||
      t.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
      t.assigneeName.toLowerCase().includes(taskSearch.toLowerCase()) ||
      t.projectName.toLowerCase().includes(taskSearch.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  const modalTitle = employee ? (
    <div className="flex items-center gap-2 flex-wrap">
      <span>☑ DANH SÁCH CÔNG VIỆC CỦA {employee.name.toUpperCase()}</span>
      <span className="px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 text-[11px] font-mono font-bold">
        {targetTasks.length} TASKS
      </span>
    </div>
  ) : (
    `☑ DANH SÁCH TASK CẦN XỬ LÝ HÔM NAY (${targetTasks.length} TASKS)`
  );

  const modalSubtitle = employee
    ? `Mã NV: ${employee.code} • ${employee.role} (${employee.department})`
    : `Tất cả các đầu việc có lịch hoàn thành hoặc thực thi trong ngày 08/09/2026`;

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      subtitle={modalSubtitle}
      isDark={isDark}
    >
      <div className="space-y-4">
        {/* OLD: Bảng cũ <table> đã được chuyển đổi sang Card Layout chuẩn theo Hình 1 thiết kế mẫu */}

        {/* Thanh công cụ Tìm kiếm & Bộ lọc (Toolbar Filters) */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={taskSearch}
              onChange={(e) => setTaskSearch(e.target.value)}
              placeholder="Tìm theo tên task, mã task, nhân sự, dự án..."
              className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition border ${
                isDark
                  ? 'bg-[#0b1120] border-slate-800 text-slate-100'
                  : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 border ${
                isDark
                  ? 'bg-[#0b1120] border-slate-800 text-slate-200'
                  : 'bg-slate-50 border-slate-300 text-slate-800'
              }`}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="in_progress">Đang làm</option>
              <option value="done">Đã xong</option>
              <option value="review">Review</option>
              <option value="testing">Chờ QA Test</option>
              <option value="todo">Cần làm</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 border ${
                isDark
                  ? 'bg-[#0b1120] border-slate-800 text-slate-200'
                  : 'bg-slate-50 border-slate-300 text-slate-800'
              }`}
            >
              <option value="all">Tất cả ưu tiên</option>
              <option value="urgent">Khẩn cấp</option>
              <option value="high">Cao</option>
              <option value="medium">Trung bình</option>
              <option value="low">Thấp</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 border ${
                isDark
                  ? 'bg-[#0b1120] border-slate-800 text-slate-200'
                  : 'bg-slate-50 border-slate-300 text-slate-800'
              }`}
            >
              <option value="all">Tất cả loại task</option>
              <option value="feature">Tính năng (Feature)</option>
              <option value="bug">Lỗi (Bug)</option>
              <option value="rework">Làm lại (Rework)</option>
              <option value="cr">Phát sinh (CR)</option>
              <option value="maintenance">Bảo trì (Maint)</option>
            </select>
          </div>
        </div>

        {/* Danh sách Thẻ Card Công Việc (Card Layout List View) */}
        {filteredTasks.length > 0 ? (
          <div className="space-y-3">
            {filteredTasks.map((t) => (
              <div
                key={t.id}
                className={`p-4 rounded-xl border transition-all shadow-xs space-y-3 ${
                  isDark
                    ? 'bg-[#131d31] border-slate-800 hover:border-slate-700'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Dòng 1: Mã task, Tiêu đề, Badge Phân loại, Giờ thực tế, Ưu tiên & Trạng thái */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <span className="font-mono text-xs font-black tracking-wider px-2 py-0.5 rounded bg-blue-950/80 text-blue-400 border border-blue-800/80 shrink-0 mt-0.5">
                      {t.code}
                    </span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`text-xs sm:text-sm font-black leading-snug ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                          {t.title}
                        </h4>
                        {/* Nhãn đặc biệt: Bug, Rework, CR */}
                        {t.type === 'bug' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800 shrink-0">
                            🐞 BUG ({t.priority === 'urgent' ? 'critical' : 'major'})
                          </span>
                        )}
                        {t.type === 'rework' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800 shrink-0">
                            🔄 REWORK
                          </span>
                        )}
                        {t.type === 'cr' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800 shrink-0">
                            ✨ CR
                          </span>
                        )}
                      </div>

                      {/* Lý do làm lại / phát sinh trễ hạn nếu có */}
                      {t.delayReason && (
                        <p className="text-xs text-amber-400/90 italic font-medium mt-0.5">
                          Lý do làm lại: {t.delayReason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Cột phải: Giờ thực tế / Ưu tiên / Trạng thái */}
                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-start">
                    <div className="text-right">
                      <span className="text-xs font-black text-amber-400 block font-mono">
                        {t.actualHours || t.estimatedHours}h / {t.estimatedHours}h
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Giờ thực tế/ước tính
                      </span>
                    </div>

                    {/* Mức ưu tiên */}
                    {t.priority === 'urgent' ? (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-950/80 text-rose-300 border border-rose-800">
                        Khẩn cấp
                      </span>
                    ) : t.priority === 'high' ? (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800">
                        Cao
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-950/80 text-blue-300 border border-blue-800">
                        Trung bình
                      </span>
                    )}

                    {/* Trạng thái công việc */}
                    {t.status === 'done' ? (
                      <span className="px-3 py-1 rounded-md text-xs font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                        Đã xong
                      </span>
                    ) : t.status === 'in_progress' ? (
                      <span className="px-3 py-1 rounded-md text-xs font-bold bg-blue-950/80 text-blue-300 border border-blue-800">
                        Đang làm
                      </span>
                    ) : t.status === 'review' ? (
                      <span className="px-3 py-1 rounded-md text-xs font-bold bg-purple-950/80 text-purple-300 border border-purple-800">
                        Review
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-md text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        Chờ làm
                      </span>
                    )}
                  </div>
                </div>

                {/* Dòng 2: Tên Dự Án • Người Làm • Hạn Chót */}
                <div className="flex items-center gap-3 text-xs text-slate-400 pt-2 border-t border-slate-800/60 flex-wrap">
                  <span className="font-semibold text-blue-400 flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                    {t.projectName}
                  </span>
                  <span>•</span>
                  <div className="flex items-center gap-1.5 text-slate-200 font-medium">
                    <UserAvatar avatar={t.assigneeAvatar} name={t.assigneeName} className="w-4 h-4 shrink-0" />
                    <span>Người làm: <strong className="text-slate-100">{t.assigneeName}</strong></span>
                  </div>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Hạn chót: <strong className="text-slate-200">{t.dueDate}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-xl bg-slate-800/30 border border-slate-800 text-slate-400 text-xs">
            Không tìm thấy task nào phù hợp với bộ lọc đã chọn.
          </div>
        )}
      </div>
    </ModalBase>
  );
};

// 2. Modal Chi Tiết Task Trễ Đến Hôm Nay
export const TodayOverdueModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  tasks?: Task[];
  isDark?: boolean;
}> = ({ isOpen, onClose, tasks = [], isDark = true }) => {
  if (!isOpen) return null;

  const overdueTasks = (tasks || []).filter((t) => t.isOverdueToday);

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title="DANH SÁCH CHI TIẾT CÁC TASK TRỄ HẠN ĐẾN HÔM NAY ⚠️"
      subtitle={`Phát hiện ${overdueTasks.length} task đã quá deadline cam kết, cần tập trung tháo gỡ`}
      isDark={isDark}
    >
      <div className="space-y-3">
        {/* OLD: <div className="overflow-x-auto rounded-xl border border-rose-200 dark:border-rose-900 scrollbar-thin"> <table className="w-full min-w-[840px] ..."> */}
        <div className={`overflow-hidden rounded-xl border ${isDark ? 'border-rose-900/60' : 'border-rose-200'}`}>
          <table className="w-full text-left border-collapse text-xs">
            <thead
              className={`font-bold border-b ${
                isDark ? 'bg-rose-950/60 text-rose-300 border-rose-800' : 'bg-rose-50 text-rose-900 border-rose-200'
              }`}
            >
              <tr>
                <th className="p-2.5 w-[120px] whitespace-nowrap">Mã Task</th>
                <th className="p-2.5 min-w-[180px]">Tên công việc</th>
                <th className="p-2.5 w-[160px] whitespace-nowrap">Dự án</th>
                <th className="p-2.5 w-[140px] whitespace-nowrap">Người phụ trách</th>
                <th className="p-2.5 w-[100px] text-center whitespace-nowrap">Hạn giao</th>
                <th className="p-2.5 w-[90px] text-center whitespace-nowrap">Độ trễ</th>
                <th className="p-2.5 min-w-[180px]">Lý do trễ chi tiết</th>
              </tr>
            </thead>
            <tbody className={`divide-y font-medium ${isDark ? 'divide-slate-800 text-slate-200' : 'divide-slate-100 text-slate-800'}`}>
              {overdueTasks.map((t) => (
                <tr key={t.id} className={isDark ? 'hover:bg-rose-950/20' : 'hover:bg-rose-50/40'}>
                  <td className="p-2.5 font-mono font-bold text-rose-400 whitespace-nowrap">{t.code}</td>
                  <td className={`p-2.5 font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{t.title}</td>
                  <td className={`p-2.5 whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{t.projectName}</td>
                  <td className={`p-2.5 font-bold whitespace-nowrap ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{t.assigneeName}</td>
                  <td className={`p-2.5 text-center font-mono whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t.dueDate}</td>
                  <td className="p-2.5 text-center font-bold text-rose-400 whitespace-nowrap">
                    <span className="bg-rose-950 text-rose-300 px-2.5 py-0.5 rounded-full text-[10px] border border-rose-800 whitespace-nowrap inline-block">
                      +{t.delayDays} ngày
                    </span>
                  </td>
                  <td className={`p-2.5 italic ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{t.delayReason || 'Đang cập nhật'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ModalBase>
  );
};

// 3. Modal Chi Tiết Nguồn Lực Từng Nhân Viên Hôm Nay (Chuẩn 100% Theo Mẫu Thiết Kế Hình 3 / Hình 4)
export const TodayResourceModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  employees?: Employee[];
  tasks?: Task[];
  metrics?: TodayHardMetrics;
  onSelectEmployee?: (emp: Employee) => void;
  isDark?: boolean;
}> = ({ isOpen, onClose, employees = [], tasks = [], metrics, onSelectEmployee, isDark = true }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'warning' | 'safe'>('all');

  if (!isOpen) return null;

  const safeEmployees = employees || [];
  
  // Tính toán chỉ số tổng quan năng lực
  const totalCapacity = safeEmployees.reduce((sum, e) => sum + e.quotaHours, 0);
  const totalAllocated = Number(safeEmployees.reduce((sum, e) => sum + e.allocatedHoursToday, 0).toFixed(1));
  const totalRemaining = Number((totalCapacity - totalAllocated).toFixed(1));
  const underQuotaCount = safeEmployees.filter((e) => e.remainingHoursToday < 1.5).length;
  const safeCount = safeEmployees.filter((e) => e.remainingHoursToday >= 1.5).length;

  // Lọc nhân sự theo từ khóa tìm kiếm và tab trạng thái
  const filteredEmployees = safeEmployees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterTab === 'warning') {
      return matchesSearch && emp.remainingHoursToday < 1.5;
    } else if (filterTab === 'safe') {
      return matchesSearch && emp.remainingHoursToday >= 1.5;
    }
    return matchesSearch;
  });

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title="BẢNG NĂNG LỰC & NGUỒN LỰC NHÂN VIÊN HÔM NAY (08/09/2026)"
      subtitle="Quy định: 8.0h/ngày • Đệm tối thiểu an toàn: ≥ 1.5h"
      isDark={isDark}
    >
      <div className="space-y-4">
        {/* OLD: Bảng cũ <table> đã được nâng cấp đầy đủ 4 khối KPI Summary & Toolbar chuẩn theo mẫu Hình 3 thiết kế */}

        {/* 4 Thẻ Summary KPI trên đầu Popup */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div
            className={`p-3 rounded-xl border ${
              isDark ? 'bg-[#131d31] border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              TỔNG NĂNG LỰC NGÀY:
            </span>
            <p className={`text-base font-black mt-1 font-mono ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              {totalCapacity} giờ
            </p>
          </div>

          <div
            className={`p-3 rounded-xl border ${
              isDark ? 'bg-[#131d31] border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              ĐÃ PHÂN BỔ HÔM NAY:
            </span>
            <p className="text-base font-black text-blue-400 mt-1 font-mono">
              {totalAllocated} giờ
            </p>
          </div>

          <div
            className={`p-3 rounded-xl border ${
              isDark ? 'bg-[#131d31] border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              TỔNG NGUỒN LỰC CÒN LẠI:
            </span>
            <p className="text-base font-black text-amber-400 mt-1 font-mono">
              {totalRemaining} giờ
            </p>
          </div>

          <div
            className={`p-3 rounded-xl border ${
              isDark ? 'bg-[#131d31] border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              CẢNH BÁO THIẾU ĐỆM:
            </span>
            <p className="text-base font-black text-rose-400 mt-1 font-mono">
              {underQuotaCount} nhân sự
            </p>
          </div>
        </div>

        {/* Thanh công cụ Tìm kiếm & Nút Lọc Trạng Thái */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm nhân sự theo tên, mã, vị trí..."
              className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition border ${
                isDark
                  ? 'bg-[#0b1120] border-slate-800 text-slate-100'
                  : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div
            className={`flex items-center p-1 rounded-xl border gap-1 ${
              isDark ? 'bg-[#0b1120] border-slate-800' : 'bg-slate-100 border-slate-300'
            }`}
          >
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filterTab === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({safeEmployees.length})
            </button>
            <button
              onClick={() => setFilterTab('warning')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filterTab === 'warning'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cảnh báo đệm thấp ({underQuotaCount})
            </button>
            <button
              onClick={() => setFilterTab('safe')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filterTab === 'safe'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Nguồn lực an toàn ({safeCount})
            </button>
          </div>
        </div>

        {/* Bảng Hiển Thị Dữ Liệu Nhân Sự 7 Cột Chuẩn Mẫu Thiết Kế */}
        <div className={`overflow-hidden rounded-xl border ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[780px] text-left border-collapse text-xs">
              <thead
                className={`font-bold border-b ${
                  isDark ? 'bg-[#141e33] text-slate-300 border-slate-800' : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <tr>
                  <th className="p-3 w-[220px]">NHÂN SỰ</th>
                  <th className="p-3 w-[90px] text-center whitespace-nowrap">QUY CHUẨN</th>
                  <th className="p-3 w-[100px] text-center whitespace-nowrap">ĐÃ PHÂN BỔ</th>
                  <th className="p-3 w-[100px] text-center whitespace-nowrap">CÒN LẠI</th>
                  <th className="p-3 w-[150px] text-center whitespace-nowrap">TẢI CÔNG VIỆC</th>
                  <th className="p-3 w-[130px] text-center whitespace-nowrap">TRẠNG THÁI</th>
                  <th className="p-3 w-[80px] text-center whitespace-nowrap">CHI TIẾT</th>
                </tr>
              </thead>
              <tbody className={`divide-y font-medium ${isDark ? 'divide-slate-800/80 text-slate-200' : 'divide-slate-200 text-slate-800'}`}>
                {filteredEmployees.map((emp) => {
                  const isOverloaded = emp.remainingHoursToday < 0;
                  const isWarning = emp.remainingHoursToday >= 0 && emp.remainingHoursToday < 1.5;
                  const workloadPercent = Math.round((emp.allocatedHoursToday / emp.quotaHours) * 100);

                  return (
                    <tr key={emp.id} className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}>
                      {/* Nhân sự: Avatar + Tên + Mã + Chức danh */}
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <UserAvatar
                            avatar={emp.avatar}
                            name={emp.name}
                            className="w-8 h-8 shrink-0 border border-slate-700"
                            badgeColor="blue"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{emp.name}</span>
                              <span className="font-mono text-[11px] text-slate-400">({emp.code})</span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-normal mt-0.5">{emp.role}</p>
                          </div>
                        </div>
                      </td>

                      {/* Quy chuẩn */}
                      <td className="p-3 text-center font-mono font-bold text-slate-300 whitespace-nowrap">
                        {emp.quotaHours.toFixed(1)}h
                      </td>

                      {/* Đã phân bổ */}
                      <td className="p-3 text-center font-mono font-bold text-slate-100 whitespace-nowrap">
                        {emp.allocatedHoursToday.toFixed(1)}h
                      </td>

                      {/* Còn lại (Badge Pill) */}
                      <td className="p-3 text-center whitespace-nowrap">
                        {isOverloaded ? (
                          <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-rose-950 text-rose-300 border border-rose-800 inline-block">
                            {emp.remainingHoursToday}h
                          </span>
                        ) : isWarning ? (
                          <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-amber-950 text-amber-300 border border-amber-800 inline-block">
                            +{emp.remainingHoursToday}h
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 inline-block">
                            +{emp.remainingHoursToday}h
                          </span>
                        )}
                      </td>

                      {/* Tải công việc (% + Progress bar) */}
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden min-w-[60px]">
                            <div
                              className={`h-full rounded-full transition-all ${
                                workloadPercent > 100
                                  ? 'bg-rose-500'
                                  : workloadPercent >= 80
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, workloadPercent)}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs font-bold text-slate-300 shrink-0 w-9 text-right">
                            {workloadPercent}%
                          </span>
                        </div>
                      </td>

                      {/* Trạng thái */}
                      <td className="p-3 text-center whitespace-nowrap">
                        {isOverloaded ? (
                          <span className="px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-rose-950 text-rose-300 border border-rose-800 inline-block">
                            Quá tải
                          </span>
                        ) : isWarning ? (
                          <span className="px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-amber-950 text-amber-300 border border-amber-800 inline-block">
                            Cảnh báo đệm
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-emerald-950 text-emerald-300 border border-emerald-800 inline-block">
                            An toàn
                          </span>
                        )}
                      </td>

                      {/* Nút Action Chi tiết */}
                      <td className="p-3 text-center whitespace-nowrap w-[44px]">
                        <button
                          onClick={() => {
                            onClose();
                            onSelectEmployee?.(emp);
                          }}
                          className={`p-1.5 font-bold rounded-lg transition inline-flex items-center justify-center shadow-md border ${
                            isDark
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-blue-400/40 shadow-blue-900/40'
                              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-blue-300 shadow-blue-200'
                          }`}
                          title="Xem danh sách công việc & hồ sơ nhân sự"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ModalBase>
  );
};

/**
 * Component Modal Chi Tiết Tỷ Lệ Nhân Viên Theo Chỉ Số Overdue / Bug / Rework (Hình 4)
 * Lọc chính xác danh sách nhân sự phát sinh lỗi, hiển thị tỷ lệ %, số task/tổng task,
 * đối chiếu mục tiêu KPI công ty và so sánh chỉ số với kỳ trước đó.
 * 
 * @param isOpen Trạng thái mở modal
 * @param onClose Hàm đóng modal
 * @param metricType Loại chỉ số đối chiếu (overdue | bug | rework)
 * @param employees Danh sách nhân sự hệ thống
 * @param onSelectEmployee Hàm callback xem hồ sơ chi tiết nhân viên
 * @param isDark Chế độ tối Dark Executive Theme
 */
export const MetricEmployeesModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  metricType: 'overdue' | 'bug' | 'rework' | null;
  employees?: Employee[];
  tasks?: Task[];
  onSelectEmployee?: (emp: Employee) => void;
  isDark?: boolean;
}> = ({ isOpen, onClose, metricType, employees = [], onSelectEmployee, isDark = true }) => {
  if (!isOpen || !metricType) return null;

  const titleMap = {
    overdue: 'CHI TIẾT TỶ LỆ TASK TRỄ THEO NHÂN VIÊN ⏰',
    bug: 'CHI TIẾT TỶ LỆ TASK BUG THEO NHÂN VIÊN 🐛',
    rework: 'CHI TIẾT TỶ LỆ TASK REWORK THEO NHÂN VIÊN 🔄',
  };

  const descMap = {
    overdue: 'Danh sách nhân sự có phát sinh task trễ hạn so với mục tiêu công ty (≤ 3.5%)',
    bug: 'Danh sách nhân sự có tỷ lệ Bug phát sinh so với mục tiêu công ty (≤ 4.0%)',
    rework: 'Danh sách nhân sự có tỷ lệ Rework code so với mục tiêu công ty (≤ 5.0%)',
  };

  // OLD: const sortedEmployees = [...(employees || [])].sort((a, b) => {
  // OLD:   if (metricType === 'overdue') return b.overdueRate - a.overdueRate;
  // OLD:   if (metricType === 'bug') return b.bugRate - a.bugRate;
  // OLD:   return b.reworkRate - a.reworkRate;
  // OLD: });

  /** Filter danh sách nhân sự CHỈ lấy những người phát sinh chỉ số tương ứng theo đúng Hình 4 */
  const filteredEmployees = (employees || []).filter((emp) => {
    if (metricType === 'overdue') return emp.overdueTasksCount > 0 || emp.overdueRate > 0;
    if (metricType === 'bug') return emp.bugTasksCount > 0 || emp.bugRate > 0;
    if (metricType === 'rework') return emp.reworkTasksCount > 0 || emp.reworkRate > 0;
    return true;
  });

  /** Sắp xếp nhân sự có tỷ lệ vi phạm giảm dần */
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    if (metricType === 'overdue') return b.overdueRate - a.overdueRate;
    if (metricType === 'bug') return b.bugRate - a.bugRate;
    return b.reworkRate - a.reworkRate;
  });

  /**
   * Tính toán thông tin so sánh chỉ số chất lượng với kỳ trước đó của nhân sự
   * @param emp Đối tượng nhân viên
   * @param type Loại chỉ số trễ / bug / rework
   */
  const getPreviousComparisonText = (emp: Employee, type: 'overdue' | 'bug' | 'rework') => {
    let rate = emp.overdueRate;
    if (type === 'bug') rate = emp.bugRate;
    if (type === 'rework') rate = emp.reworkRate;

    // Giả lập dữ liệu chỉ số kỳ trước để đối chiếu so sánh
    let prevRate = +(rate * 1.35).toFixed(1);
    if (emp.code === 'NV003') prevRate = +(rate * 0.75).toFixed(1);

    const diff = +(rate - prevRate).toFixed(1);
    if (diff < 0) {
      return {
        text: `Kỳ trước: ${prevRate}% (Cải thiện ${diff}%)`,
        isImproved: true,
      };
    } else if (diff > 0) {
      return {
        text: `Kỳ trước: ${prevRate}% (Tăng +${diff}%)`,
        isImproved: false,
      };
    }
    return {
      text: `Kỳ trước: ${prevRate}% (Ổn định)`,
      isImproved: true,
    };
  };

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title={titleMap[metricType]}
      subtitle={descMap[metricType]}
      isDark={isDark}
    >
      <div className="space-y-3">
        {/* OLD: <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 scrollbar-thin"> <table className="w-full min-w-[850px] ..."> */}
        {/* Bảng co giãn 100% w-full vừa khít khung Modal tối #141e33 không xuất hiện scrollbar ngang */}
        <div className={`overflow-hidden rounded-xl border ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <table className="w-full text-left border-collapse text-xs">
            <thead
              className={`font-bold border-b uppercase text-[11px] ${
                isDark ? 'bg-[#141e33] text-slate-200 border-slate-800' : 'bg-slate-100 text-slate-800 border-slate-200'
              }`}
            >
              <tr>
                <th className="px-2.5 py-2.5 whitespace-nowrap min-w-[130px]">Nhân viên</th>
                <th className="px-2 py-2.5 whitespace-nowrap min-w-[110px]">Phòng ban</th>
                <th className="px-1.5 py-2.5 text-center whitespace-nowrap">Task</th>
                <th className="px-1.5 py-2.5 text-center whitespace-nowrap">
                  {metricType === 'overdue'
                    ? 'Tỷ lệ Trễ (MT: ≤ 3.5%)'
                    : metricType === 'bug'
                    ? 'Tỷ lệ Bug (MT: ≤ 4.0%)'
                    : 'Tỷ lệ Rework (MT: ≤ 5.0%)'}
                </th>
                <th className="px-1.5 py-2.5 text-center whitespace-nowrap">So sánh kỳ trước</th>
                <th className="px-1.5 py-2.5 text-center whitespace-nowrap">Đánh giá KPI</th>
                <th className="px-1.5 py-2.5 text-center whitespace-nowrap w-[44px]"></th>
              </tr>
            </thead>
            <tbody className={`divide-y font-medium ${isDark ? 'divide-slate-800/80 text-slate-300' : 'divide-slate-100 text-slate-800'}`}>
              {sortedEmployees.length > 0 ? (
                sortedEmployees.map((emp) => {
                  let rate = emp.overdueRate;
                  let target = emp.targetOverdueRate;
                  let count = emp.overdueTasksCount;
                  let countLabel = 'Task trễ';

                  if (metricType === 'bug') {
                    rate = emp.bugRate;
                    target = emp.targetBugRate;
                    count = emp.bugTasksCount;
                    countLabel = 'Task Bug';
                  } else if (metricType === 'rework') {
                    rate = emp.reworkRate;
                    target = emp.targetReworkRate;
                    count = emp.reworkTasksCount;
                    countLabel = 'Task Rework';
                  }

                  const isExceeded = rate > target;
                  const prevComp = getPreviousComparisonText(emp, metricType);

                  return (
                    <tr
                      key={emp.id}
                      onClick={() => {
                        if (onSelectEmployee) {
                          onClose();
                          onSelectEmployee(emp);
                        }
                      }}
                      className={`cursor-pointer transition ${isDark ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50'}`}
                    >
                      <td className="p-2 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <UserAvatar
                            avatar={emp.avatar}
                            name={emp.name}
                            className="w-7 h-7 shrink-0 border border-slate-700"
                            badgeColor="blue"
                          />
                          <div className="min-w-0">
                            <div className={`font-bold truncate ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                              {emp.name}
                            </div>
                            <div className={`text-[10px] font-mono truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              {emp.code}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className={`p-2 whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        {emp.department}
                      </td>
                      <td className="p-2 text-center font-bold whitespace-nowrap">
                        <span className={`font-black ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>{count}</span>{' '}
                        <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>/ {emp.totalTasks} {countLabel}</span>
                      </td>
                      <td className="p-2 text-center font-black whitespace-nowrap">
                        <span className={isExceeded ? (isDark ? 'text-rose-400 text-sm' : 'text-rose-600 text-sm') : (isDark ? 'text-emerald-400 text-sm' : 'text-emerald-600 text-sm')}>
                          {rate}%
                        </span>
                      </td>
                      <td className="p-2 text-center whitespace-nowrap">
                        <span className={`text-[11px] font-bold ${prevComp.isImproved ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : (isDark ? 'text-rose-400' : 'text-rose-600')}`}>
                          {prevComp.text}
                        </span>
                      </td>
                      <td className="p-2 text-center whitespace-nowrap">
                        {isExceeded ? (
                          <span className="bg-rose-950 text-rose-300 px-2 py-0.5 rounded-full font-bold text-[10px] border border-rose-800 whitespace-nowrap inline-block">
                            Vượt MT +{(rate - target).toFixed(1)}% ⚠️
                          </span>
                        ) : (
                          <span className="bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full font-bold text-[10px] border border-emerald-800 whitespace-nowrap inline-block">
                            Đạt mục tiêu ✓
                          </span>
                        )}
                      </td>
                      <td className="p-2 text-center whitespace-nowrap w-[44px]">
                        {onSelectEmployee && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onClose();
                              onSelectEmployee(emp);
                            }}
                            className={`p-1.5 font-bold rounded-lg transition inline-flex items-center justify-center shadow-md border ${
                              isDark
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-blue-400/40 shadow-blue-900/40'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-blue-300 shadow-blue-200'
                            }`}
                            title="Xem chi tiết danh sách công việc & hồ sơ nhân sự"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400 italic">
                    Không có nhân sự nào phát sinh chỉ số {metricType === 'overdue' ? 'trễ' : metricType === 'bug' ? 'bug' : 'rework'}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ModalBase>
  );
};

// 5. Modal Chi Tiết Hồ Sơ Nhân Viên & Danh Sách Task
export const EmployeeDetailModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  tasks?: Task[];
  isDark?: boolean;
}> = ({ isOpen, onClose, employee, tasks = [], isDark = true }) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  if (!isOpen || !employee) return null;

  const empTasks = (tasks || []).filter((t) => t.assigneeId === employee.id);

  const filteredTasks = empTasks.filter((t) => {
    const matchType = filterType === 'all' || t.type === filterType;
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchType && matchStatus;
  });

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title={`HỒ SƠ HIỆU SUẤT NHÂN SỰ: ${employee.name} (${employee.code})`}
      subtitle={`${employee.role} — ${employee.department}`}
      isDark={isDark}
    >
      <div className="space-y-4 text-xs">
        {/* OLD: <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800"> */}
        {/* Profile Card được đồng bộ Dark Executive Theme dịu mắt chống chói */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-xl border transition-colors ${
            isDark ? 'bg-[#141e33] border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
          }`}
        >
          <div>
            <span className={`block text-[10px] font-bold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Tổng Task đã giao
            </span>
            <span className={`text-lg font-black ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              {employee.totalTasks} Tasks
            </span>
          </div>
          <div>
            <span className={`block text-[10px] font-bold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Tổng giờ làm việc
            </span>
            <span className="text-lg font-black text-blue-400">{employee.totalHours} Giờ</span>
          </div>
          <div>
            <span className={`block text-[10px] font-bold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Tỷ lệ trễ hạn
            </span>
            <span className={`text-lg font-black ${employee.overdueRate > employee.targetOverdueRate ? 'text-rose-400' : 'text-emerald-400'}`}>
              {employee.overdueRate}%
            </span>
          </div>
          <div>
            <span className={`block text-[10px] font-bold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Đánh Giá Năng Suất
            </span>
            <span className={`text-base font-black ${employee.performanceRating?.includes('Cần') ? 'text-rose-400' : 'text-emerald-400'}`}>
              {employee.performanceRating || (employee.overdueRate <= 3.5 ? 'Xuất Sắc' : employee.overdueRate <= 5 ? 'Tốt' : 'Cần Cải Thiện')}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
          <h4 className={`font-bold flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            <Layers className="w-4 h-4 text-blue-400" />
            Danh Sách Công Việc Được Phân Bổ ({filteredTasks.length})
          </h4>
          <div className="flex items-center gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`px-2.5 py-1 border rounded-lg text-xs font-semibold ${
                isDark ? 'bg-[#141e33] border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-700'
              }`}
            >
              <option value="all">Tất cả loại task</option>
              <option value="feature">Tính năng mới</option>
              <option value="bug">Sửa lỗi (Bug)</option>
              <option value="rework">Làm lại (Rework)</option>
              <option value="cr">Phát sinh (CR)</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-2.5 py-1 border rounded-lg text-xs font-semibold ${
                isDark ? 'bg-[#141e33] border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-700'
              }`}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="done">Đã xong</option>
              <option value="in_progress">Đang làm</option>
              <option value="todo">Chờ làm</option>
            </select>
          </div>
        </div>

        {/* OLD: Bảng cũ <table> đã được chuyển đổi thành Card Layout chuẩn theo Hình 1 thiết kế mẫu */}

        {/* Danh sách Task Công Việc Dạng Card (Card Layout List View chuẩn 100% Hình 1) */}
        {filteredTasks.length > 0 ? (
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1 scrollbar-thin">
            {filteredTasks.map((t) => (
              <div
                key={t.id}
                className={`p-4 rounded-xl border transition-all shadow-xs space-y-3 ${
                  isDark
                    ? 'bg-[#131d31] border-slate-800 hover:border-slate-700'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Dòng 1: Mã task, Tiêu đề, Badge Phân loại, Giờ thực tế/ước tính, Ưu tiên & Trạng thái */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <span className="font-mono text-xs font-black tracking-wider px-2 py-0.5 rounded bg-blue-950/80 text-blue-400 border border-blue-800/80 shrink-0 mt-0.5">
                      {t.code}
                    </span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`text-xs sm:text-sm font-black leading-snug ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                          {t.title}
                        </h4>
                        {/* Nhãn loại Task: Bug, Rework, CR */}
                        {t.type === 'bug' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800 shrink-0">
                            🐞 BUG ({t.priority === 'urgent' ? 'critical' : 'major'})
                          </span>
                        )}
                        {t.type === 'rework' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800 shrink-0">
                            🔄 REWORK
                          </span>
                        )}
                        {t.type === 'cr' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800 shrink-0">
                            ✨ CR
                          </span>
                        )}
                        {t.delayDays && t.delayDays > 0 ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-800 shrink-0">
                            ⚠️ Trễ {t.delayDays} ngày
                          </span>
                        ) : null}
                      </div>

                      {/* Lý do làm lại / phát sinh trễ hạn */}
                      {t.delayReason && (
                        <p className="text-xs text-amber-400/90 italic font-medium mt-0.5">
                          Lý do làm lại: {t.delayReason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Cột phải: Giờ thực tế / Ưu tiên / Trạng thái */}
                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-start">
                    <div className="text-right">
                      <span className="text-xs font-black text-amber-400 block font-mono">
                        {t.actualHours || t.estimatedHours}h / {t.estimatedHours}h
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Giờ thực tế/ước tính
                      </span>
                    </div>

                    {/* Mức ưu tiên */}
                    {t.priority === 'urgent' ? (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-950/80 text-rose-300 border border-rose-800">
                        Khẩn cấp
                      </span>
                    ) : t.priority === 'high' ? (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800">
                        Cao
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-950/80 text-blue-300 border border-blue-800">
                        Trung bình
                      </span>
                    )}

                    {/* Trạng thái công việc */}
                    {t.status === 'done' ? (
                      <span className="px-3 py-1 rounded-md text-xs font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                        Đã xong
                      </span>
                    ) : t.status === 'in_progress' ? (
                      <span className="px-3 py-1 rounded-md text-xs font-bold bg-blue-950/80 text-blue-300 border border-blue-800">
                        Đang làm
                      </span>
                    ) : t.status === 'review' ? (
                      <span className="px-3 py-1 rounded-md text-xs font-bold bg-purple-950/80 text-purple-300 border border-purple-800">
                        Review
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-md text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        Chờ làm
                      </span>
                    )}
                  </div>
                </div>

                {/* Dòng 2: Tên Dự Án • Người Làm • Hạn Chót */}
                <div className="flex items-center gap-3 text-xs text-slate-400 pt-2 border-t border-slate-800/60 flex-wrap">
                  <span className="font-semibold text-blue-400 flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                    {t.projectName}
                  </span>
                  <span>•</span>
                  <div className="flex items-center gap-1.5 text-slate-200 font-medium">
                    <UserAvatar avatar={employee.avatar} name={employee.name} className="w-4 h-4 shrink-0" />
                    <span>Người làm: <strong className="text-slate-100">{employee.name}</strong></span>
                  </div>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Hạn chót: <strong className="text-slate-200">{t.dueDate}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-xl bg-slate-800/30 border border-slate-800 text-slate-400 text-xs">
            Không tìm thấy công việc nào phù hợp với bộ lọc đã chọn.
          </div>
        )}
      </div>
    </ModalBase>
  );
};

// 6. Modal Chi Tiết Danh Sách Dự Án Bảo Trì / Dự Án Mới
/**
 * Component Modal hiển thị danh sách chi tiết các Dự án Bảo Trì hoặc Dự án Mới
 */
export const ProjectsDetailModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  projectType: 'maintenance' | 'new' | null;
  projects?: Project[];
  onSelectProject?: (project: Project) => void;
  isDark?: boolean;
}> = ({ isOpen, onClose, projectType, projects = [], onSelectProject, isDark = true }) => {
  if (!isOpen || !projectType) return null;

  const filteredProjects = (projects || []).filter((p) => p.type === projectType);

  const title = projectType === 'maintenance'
    ? 'CHI TIẾT DANH SÁCH DỰ ÁN BẢO TRÌ HỆ THỐNG'
    : 'CHI TIẾT DANH SÁCH DỰ ÁN MỚI TRIỂN KHAI';

  const subtitle = projectType === 'maintenance'
    ? `Hệ thống ghi nhận ${filteredProjects.length} dự án bảo trì & vận hành duy trì SLA`
    : `Hệ thống ghi nhận ${filteredProjects.length} dự án mới đang trong giai đoạn triển khai`;

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title={title} subtitle={subtitle} isDark={isDark}>
      <div className="space-y-3">
        {/* OLD: <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 scrollbar-thin"> <table className="w-full min-w-[850px] ..."> */}
        <div className={`overflow-hidden rounded-xl border ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <table className="w-full text-left border-collapse text-xs">
            <thead
              className={`font-bold border-b ${
                isDark ? 'bg-[#141e33] text-slate-200 border-slate-800' : 'bg-slate-100 text-slate-800 border-slate-200'
              }`}
            >
              <tr>
                <th className="p-2.5 w-[110px] whitespace-nowrap">Mã Dự Án</th>
                <th className="p-2.5 min-w-[180px]">Tên dự án</th>
                <th className="p-2.5 min-w-[170px]">Khách hàng</th>
                <th className="p-2.5 w-[100px] text-center whitespace-nowrap">Tiến độ</th>
                <th className="p-2.5 w-[100px] text-center whitespace-nowrap">Trạng thái</th>
                <th className="p-2.5 w-[110px] text-center whitespace-nowrap">Giờ làm</th>
                <th className="p-2.5 w-[110px] text-right whitespace-nowrap">Giá trị HĐ</th>
                <th className="p-2.5 min-w-[130px]">PM Lead</th>
                <th className="p-2.5 w-[44px] text-center whitespace-nowrap"></th>
              </tr>
            </thead>
            <tbody className={`divide-y font-medium ${isDark ? 'divide-slate-800 text-slate-200' : 'divide-slate-100 text-slate-800'}`}>
              {filteredProjects.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => {
                    if (onSelectProject) {
                      onClose();
                      onSelectProject(p);
                    }
                  }}
                  className={`cursor-pointer transition ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}
                >
                  <td className="p-2.5 font-mono font-bold text-blue-400 whitespace-nowrap">{p.code}</td>
                  <td className={`p-2.5 font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{p.name}</td>
                  {/* OLD: <td className={`p-2.5 whitespace-nowrap truncate max-w-[160px] ...`}>{p.client}</td> */}
                  <td className={`p-2.5 font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`} title={p.client}>
                    {p.client}
                  </td>
                  <td className="p-2.5 text-center whitespace-nowrap">
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-14 h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${p.progress}%` }} />
                      </div>
                      <span className="font-bold">{p.progress}%</span>
                    </div>
                  </td>
                  <td className="p-2.5 text-center whitespace-nowrap">
                    {p.status === 'completed' ? (
                      <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-bold text-[10px]">Hoàn thành</span>
                    ) : p.status === 'delayed' ? (
                      <span className="bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded-full font-bold text-[10px]">Chậm tiến độ</span>
                    ) : p.status === 'paused' ? (
                      <span className="bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-full font-bold text-[10px]">Tạm dừng</span>
                    ) : (
                      <span className="bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded-full font-bold text-[10px]">Đang triển khai</span>
                    )}
                  </td>
                  <td className="p-2.5 text-center font-bold whitespace-nowrap">
                    {p.actualHours}h / {p.totalBudgetHours}h
                  </td>
                  <td className="p-2.5 text-right font-black text-emerald-400 whitespace-nowrap">
                    {p.contractValueMillionVND ? `${p.contractValueMillionVND.toLocaleString()} Tr` : '-'}
                  </td>
                  <td className={`p-2.5 font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{p.pmName}</td>
                  <td className="p-2.5 text-center whitespace-nowrap w-[44px]">
                    {onSelectProject && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onClose();
                          onSelectProject(p);
                        }}
                        className={`p-1.5 font-bold rounded-lg transition inline-flex items-center justify-center shadow-md border ${
                          isDark
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-blue-400/40 shadow-blue-900/40'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-blue-300 shadow-blue-200'
                        }`}
                        title="Xem báo cáo chi tiết vòng đời & KPI dự án"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ModalBase>
  );
};

// 7. Modal Chi Tiết Danh Sách Toàn Bộ Công Việc (All Tasks)
/**
 * Component Modal hiển thị danh sách toàn bộ Task công việc kèm tìm kiếm & bộ lọc đa tiêu chí
 * @param isOpen Trạng thái đóng/mở modal
 * @param onClose Hàm đóng modal
 * @param tasks Danh sách dữ liệu công việc
 * @param projects Danh sách dự án (phục vụ lọc theo dự án)
 * @param isDark Chế độ tối
 */
export const AllTasksDetailModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  tasks?: Task[];
  projects?: Project[];
  isDark?: boolean;
}> = ({ isOpen, onClose, tasks = [], projects = [], isDark = true }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterProject, setFilterProject] = useState<string>('all');

  if (!isOpen) return null;

  const filteredTasks = (tasks || []).filter((t) => {
    const matchSearch =
      searchTerm.trim() === '' ||
      t.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.assigneeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.projectName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchType = filterType === 'all' || t.type === filterType;
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchProject = filterProject === 'all' || t.projectId === filterProject;

    return matchSearch && matchType && matchStatus && matchProject;
  });

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title="CHI TIẾT DANH SÁCH TOÀN BỘ CÔNG VIỆC (TASKS)"
      subtitle={`Hệ thống quản lý ${tasks.length} công việc — Đang hiển thị ${filteredTasks.length} task theo bộ lọc`}
      isDark={isDark}
    >
      <div className="space-y-4 text-xs">
        {/* Controls Bar: Search & Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          {/* Ô tìm kiếm */}
          <div className="relative sm:col-span-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm mã task, tên, người làm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-8 pr-3 py-1.5 border rounded-lg text-xs font-medium focus:outline-none ${
                isDark ? 'bg-[#141e33] border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-800'
              }`}
            />
          </div>

          {/* Lọc loại task */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={`px-2.5 py-1.5 border rounded-lg text-xs font-semibold ${
              isDark ? 'bg-[#141e33] border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-700'
            }`}
          >
            <option value="all">Tất cả loại task</option>
            <option value="feature">Tính năng mới (Feature)</option>
            <option value="bug">Sửa lỗi (Bug)</option>
            <option value="rework">Làm lại (Rework)</option>
            <option value="cr">Phát sinh (CR)</option>
            <option value="maintenance">Bảo trì (Maintenance)</option>
          </select>

          {/* Lọc trạng thái */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`px-2.5 py-1.5 border rounded-lg text-xs font-semibold ${
              isDark ? 'bg-[#141e33] border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-700'
            }`}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="done">Đã xong (Done)</option>
            <option value="in_progress">Đang làm (In Progress)</option>
            <option value="review">Chờ Review</option>
            <option value="testing">Đang QA Test</option>
            <option value="todo">Chờ làm (Todo)</option>
          </select>

          {/* Lọc dự án */}
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className={`px-2.5 py-1.5 border rounded-lg text-xs font-semibold truncate ${
              isDark ? 'bg-[#141e33] border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-700'
            }`}
          >
            <option value="all">Tất cả dự án</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} - {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        {/* OLD: <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 max-h-[420px] scrollbar-thin"> <table className="w-full min-w-[850px] ..."> */}
        <div className={`overflow-y-auto max-h-[420px] rounded-xl border ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <table className="w-full text-left border-collapse text-xs">
            <thead
              className={`font-bold sticky top-0 border-b z-10 ${
                isDark ? 'bg-[#141e33] text-slate-200 border-slate-800' : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <tr>
                <th className="p-2.5 w-[120px] whitespace-nowrap">Mã Task</th>
                <th className="p-2.5 min-w-[180px]">Tên công việc</th>
                <th className="p-2.5 w-[150px] whitespace-nowrap">Dự án</th>
                <th className="p-2.5 w-[130px] whitespace-nowrap">Người phụ trách</th>
                <th className="p-2.5 w-[80px] text-center whitespace-nowrap">Giờ Est</th>
                <th className="p-2.5 w-[90px] text-center whitespace-nowrap">Loại Task</th>
                <th className="p-2.5 w-[100px] text-center whitespace-nowrap">Trạng thái</th>
                <th className="p-2.5 w-[90px] text-center whitespace-nowrap">Hạn chót</th>
              </tr>
            </thead>
            <tbody className={`divide-y font-medium ${isDark ? 'divide-slate-800 text-slate-200' : 'divide-slate-100 text-slate-800'}`}>
              {filteredTasks.length > 0 ? (
                filteredTasks.map((t) => (
                  <tr key={t.id} className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}>
                    <td className="p-2.5 font-mono font-bold text-blue-400 whitespace-nowrap">{t.code}</td>
                    <td className={`p-2.5 font-bold min-w-0 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{t.title}</td>
                    <td className={`p-2.5 whitespace-nowrap truncate max-w-[150px] ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{t.projectName}</td>
                    <td className={`p-2.5 font-semibold whitespace-nowrap ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{t.assigneeName}</td>
                    <td className="p-2.5 text-center font-bold whitespace-nowrap">{t.estimatedHours}h</td>
                    <td className="p-2.5 text-center whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold whitespace-nowrap inline-block ${
                        isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="p-2.5 text-center whitespace-nowrap">
                      {t.status === 'done' ? (
                        <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-0.5 rounded-full font-bold text-[10px]">Đã xong</span>
                      ) : t.status === 'in_progress' ? (
                        <span className="bg-blue-950 text-blue-300 border border-blue-800 px-2.5 py-0.5 rounded-full font-bold text-[10px]">Đang làm</span>
                      ) : t.status === 'testing' ? (
                        <span className="bg-purple-950 text-purple-300 border border-purple-800 px-2.5 py-0.5 rounded-full font-bold text-[10px]">Đang QA Test</span>
                      ) : (
                        <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-0.5 rounded-full font-bold text-[10px]">{t.status}</span>
                      )}
                    </td>
                    <td className={`p-2.5 text-center font-mono whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t.dueDate}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-400 italic">
                    Không tìm thấy công việc nào phù hợp với từ khóa và bộ lọc đã chọn.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ModalBase>
  );
};

