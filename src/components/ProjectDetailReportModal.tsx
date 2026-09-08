import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  User,
  Target,
  TrendingUp,
  Layers,
  Activity,
  ShieldCheck,
  Search,
  ChevronRight,
  ExternalLink,
  DollarSign,
  FileSpreadsheet,
} from 'lucide-react';
import { Project, Task } from '../types';
import { UserAvatar } from './UserAvatar';
import { downloadProjectExcel } from '../utils/exportReports';

interface ProjectDetailReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  allTasks: Task[];
  isDark?: boolean;
}

export const ProjectDetailReportModal: React.FC<ProjectDetailReportModalProps> = ({
  isOpen,
  onClose,
  project,
  allTasks,
  isDark = true,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'phases' | 'overdue' | 'tasks'>('overview');
  const [taskSearch, setTaskSearch] = useState('');
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>('all');
  const [taskTypeFilter, setTaskTypeFilter] = useState<string>('all');

  if (!isOpen || !project) return null;

  // Filter tasks associated with this project
  const projectTasks = allTasks.filter(
    (t) => t.projectId === project.id || t.projectName === project.name
  );

  const filteredTasks = projectTasks.filter((task) => {
    const matchesSearch =
      task.code.toLowerCase().includes(taskSearch.toLowerCase()) ||
      task.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
      task.assigneeName.toLowerCase().includes(taskSearch.toLowerCase());
    const matchesStatus = taskStatusFilter === 'all' || task.status === taskStatusFilter;
    const matchesType = taskTypeFilter === 'all' || task.type === taskTypeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Mã Task', 'Tên Công Việc', 'Người Phụ Trách', 'Loại', 'Ưu Tiên', 'Giờ Est', 'Hạn Chót', 'Trạng Thái'];
    const rows = projectTasks.map((t) => [
      t.code,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.assigneeName}"`,
      t.type,
      t.priority,
      t.estimatedHours,
      t.dueDate,
      t.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Bao_Cao_Du_An_${project.code}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: Project['status']) => {
    switch (status) {
      case 'completed':
        return <span className="px-2.5 py-1 bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 rounded-full text-xs font-semibold">✓ Hoàn thành</span>;
      case 'in_progress':
        return <span className="px-2.5 py-1 bg-blue-950/80 text-blue-400 border border-blue-700/60 rounded-full text-xs font-semibold">● Đang thực hiện</span>;
      case 'review':
        return <span className="px-2.5 py-1 bg-amber-950/80 text-amber-400 border border-amber-700/60 rounded-full text-xs font-semibold">⏳ Chậm tiến độ</span>;
      case 'on_hold':
        return <span className="px-2.5 py-1 bg-rose-950/80 text-rose-400 border border-rose-700/60 rounded-full text-xs font-semibold">⏸ Tạm dừng</span>;
      case 'planning':
      default:
        return <span className="px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded-full text-xs font-semibold">⚙ Chuẩn bị</span>;
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl shadow-2xl border overflow-hidden ${
          isDark
            ? 'bg-[#0f172a] text-slate-100 border-slate-700/80'
            : 'bg-white text-slate-900 border-slate-300'
        }`}
      >
        {/* Modal Top Action Bar & Header */}
        <div
          className={`px-6 py-4 border-b flex flex-wrap items-center justify-between gap-4 ${
            isDark ? 'bg-[#0b1120] border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-black tracking-wider px-2.5 py-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/40">
              {project.code}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">{project.name}</h2>
                {getStatusBadge(project.status)}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Khách hàng: <span className="font-medium text-slate-300">{project.client}</span> • Quản trị dự án: <span className="font-medium text-slate-200">{project.pmName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
              }`}
              title="In Báo Cáo A4 / Xuất PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Báo Cáo</span>
            </button>
            <button
              onClick={() => downloadProjectExcel(project, projectTasks)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition"
              title="Xuất Báo Cáo Dự Án Định Dạng Excel Chuẩn Doanh Nghiệp (.xls)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Xuất Excel (.xls)</span>
            </button>
            <button
              onClick={handleExportCSV}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
              title="Xuất file CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition ml-1 ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-600 hover:text-slate-900'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          className={`px-6 pt-3 border-b flex items-center gap-2 overflow-x-auto ${
            isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-slate-100/70 border-slate-200'
          }`}
        >
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>1. Hồ sơ & KPI Vòng Đời</span>
          </button>
          <button
            onClick={() => setActiveTab('phases')}
            className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'phases'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2. Tiến Độ Các Giai Đoạn ({project.phases?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('overdue')}
            className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'overdue'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>3. Phân Tích Trễ & CR ({project.overdueTasksCount + (project.crTasksCount || 0)})</span>
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'tasks'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>4. Toàn Bộ Task Công Việc ({projectTasks.length || project.tasksCount})</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: OVERVIEW & KEY KPI */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Executive Summary Card */}
              <div
                className={`p-4 rounded-xl border ${
                  isDark ? 'bg-[#141e33] border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Thời Gian Thực Hiện
                    </span>
                    <p
                      className={`text-xs font-medium mt-1 flex items-center gap-1.5 ${
                        isDark ? 'text-slate-200' : 'text-slate-800'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                      {project.startDate} → {project.plannedDeadline || project.deadline}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Dự Kiến Thực Tế (Go-Live)
                    </span>
                    <p className="text-xs font-bold text-amber-500 dark:text-amber-400 mt-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {project.actualExpectedDeadline || project.deadline}
                      {project.delayWeeks ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                          +{project.delayWeeks} tuần
                        </span>
                      ) : null}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Doanh Thu Hợp Đồng
                    </span>
                    <p className="text-sm font-black text-emerald-500 dark:text-emerald-400 mt-1">
                      {project.revenueBillionVND} Tỷ VNĐ
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Người Điều Hành Dự Án (PM)
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <UserAvatar
                        avatar={project.pmAvatar}
                        name={project.pmName}
                        className="w-6 h-6 shrink-0 border border-blue-500/50"
                        badgeColor="blue"
                      />
                      <span className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                        {project.pmName}
                      </span>
                    </div>
                  </div>
                </div>

                {project.delayReasonSummary && (
                  <div
                    className={`mt-3 pt-3 border-t flex items-start gap-2 ${
                      isDark ? 'border-slate-700/60' : 'border-slate-200'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      <strong className="text-amber-600 dark:text-amber-300">Lý do phát sinh / Kéo dài vòng đời:</strong>{' '}
                      {project.delayReasonSummary}
                    </p>
                  </div>
                )}
              </div>

              {/* 4 KPI Grid Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Tiến độ thực tế vs Kế hoạch */}
                <div
                  className={`p-4 rounded-xl border relative overflow-hidden ${
                    isDark ? 'bg-[#131d31] border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Tiến Độ Hoàn Thành
                  </span>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-2xl font-black text-blue-400">{project.progress}%</span>
                    <span className="text-xs text-slate-400">
                      Mục tiêu: <strong className="text-slate-300">{project.plannedProgress}%</strong>
                    </span>
                  </div>
                  {/* Visual dual progress bar */}
                  <div className="w-full bg-slate-800 h-2.5 rounded-full mt-3 overflow-hidden relative">
                    <div
                      className="bg-blue-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${project.progress}%` }}
                    />
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
                      style={{ left: `${project.plannedProgress}%` }}
                      title={`Vạch kế hoạch: ${project.plannedProgress}%`}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 flex justify-between">
                    <span>Thực tế: {project.progress}%</span>
                    <span
                      className={
                        project.progress >= project.plannedProgress ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'
                      }
                    >
                      {project.progress >= project.plannedProgress
                        ? '✓ Đạt kế hoạch'
                        : `Chậm ${project.plannedProgress - project.progress}%`}
                    </span>
                  </p>
                </div>

                {/* 2. Ngân sách giờ công */}
                <div
                  className={`p-4 rounded-xl border ${
                    isDark ? 'bg-[#131d31] border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Ngân Sách Giờ Công (Hours)
                  </span>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-2xl font-black text-amber-400">{project.budgetSpentPercent}%</span>
                    <span className="text-xs text-slate-400">
                      {project.actualHours}h / {project.totalBudgetHours}h
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full mt-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        project.budgetSpentPercent > 90 ? 'bg-rose-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, project.budgetSpentPercent)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 flex justify-between">
                    <span>Còn lại: {project.totalBudgetHours - project.actualHours}h</span>
                    <span className="text-slate-300 font-semibold">
                      Dự toán: {project.totalBudgetHours}h
                    </span>
                  </p>
                </div>

                {/* 3. SLA Đúng Hạn (OTD) */}
                <div
                  className={`p-4 rounded-xl border ${
                    isDark ? 'bg-[#131d31] border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Chỉ Số Cam Kết OTD SLA
                  </span>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-2xl font-black text-emerald-400">{project.slaOtd}%</span>
                    <span className="text-xs text-slate-400">Cam kết: ≥90%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full mt-3 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, project.slaOtd)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 flex justify-between">
                    <span>Bug: {project.bugTasksCount}</span>
                    <span className="text-emerald-400 font-bold">
                      {project.slaOtd >= 90 ? '✓ Đạt SLA' : '⚠ Dưới chuẩn'}
                    </span>
                  </p>
                </div>

                {/* 4. Khối lượng Task & CR */}
                <div
                  className={`p-4 rounded-xl border ${
                    isDark ? 'bg-[#131d31] border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Khối Lượng Tasks & CR
                  </span>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-2xl font-black text-indigo-400">
                      {project.completedTasksCount}/{project.tasksCount}
                    </span>
                    <span className="text-xs text-slate-400">
                      {Math.round((project.completedTasksCount / project.tasksCount) * 100)}% Xong
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full mt-3 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full"
                      style={{
                        width: `${Math.round((project.completedTasksCount / project.tasksCount) * 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 flex justify-between">
                    <span>Phát sinh (CR): {project.crTasksCount || 0}</span>
                    <span className="text-rose-400 font-bold">
                      {project.overdueTasksCount} task trễ
                    </span>
                  </p>
                </div>
              </div>

              {/* Financials & Accounting Executive Card */}
              <div
                className={`p-4 rounded-xl border ${
                  isDark ? 'bg-[#131d31] border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-black uppercase text-emerald-400 tracking-wider">
                      Thông Tin Hợp Đồng & Kế Toán Dự Án
                    </h3>
                  </div>
                  {project.penaltyRiskPercent && project.penaltyRiskPercent > 0 ? (
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800">
                      Rủi ro phạt chậm tiến độ: {project.penaltyRiskPercent}%
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                      ✓ An toàn điều khoản hợp đồng
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {/* OLD: <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800"> */}
                  <div
                    className={`p-3 rounded-lg border ${
                      isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Giá Trị Hợp Đồng</span>
                    <span
                      className={`text-lg font-black mt-1 block font-mono ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {project.contractValueMillionVND !== undefined
                        ? `${project.contractValueMillionVND.toLocaleString('vi-VN')} tr`
                        : `${(project.revenueBillionVND || 2) * 1000} tr`}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {((project.contractValueMillionVND || 2000) / 1000).toFixed(2)} tỷ VNĐ
                    </span>
                  </div>

                  <div
                    className={`p-3 rounded-lg border ${
                      isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Đã Xuất HĐ / Thu</span>
                    <span className="text-lg font-black text-emerald-500 dark:text-emerald-400 mt-1 block font-mono">
                      {project.invoicedMillionVND !== undefined
                        ? `${project.invoicedMillionVND.toLocaleString('vi-VN')} tr`
                        : '1,200 tr'}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                      Đạt {Math.round(((project.invoicedMillionVND || 1200) / (project.contractValueMillionVND || 2000)) * 100)}% HĐ
                    </span>
                  </div>

                  <div
                    className={`p-3 rounded-lg border ${
                      isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Công Nợ Phải Thu</span>
                    <span className="text-lg font-black text-amber-500 dark:text-amber-400 mt-1 block font-mono">
                      {Math.max(0, (project.contractValueMillionVND || 2000) - (project.invoicedMillionVND || 1200)).toLocaleString('vi-VN')} tr
                    </span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400">
                      Cần thu hồi các mốc sau
                    </span>
                  </div>

                  <div
                    className={`p-3 rounded-lg border ${
                      isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Đơn Giá Nhân Lực</span>
                    <span className="text-lg font-black text-indigo-500 dark:text-indigo-400 mt-1 block font-mono">
                      {(project.laborRatePerHourVND || 320000).toLocaleString('vi-VN')} đ/h
                    </span>
                    <span className="text-[10px] text-slate-400">
                      CP nhân sự: ~{Math.round((project.actualHours * (project.laborRatePerHourVND || 320000)) / 1000000)} tr
                    </span>
                  </div>
                </div>

                {project.accountingNotes && (
                  <p
                    className={`mt-3 text-[11px] p-2.5 rounded-lg border flex items-start gap-2 ${
                      isDark
                        ? 'bg-slate-900/40 border-slate-800 text-slate-300'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="text-blue-500 font-bold shrink-0">Ghi chú KT:</span>
                    <span>{project.accountingNotes}</span>
                  </p>
                )}
              </div>

              {/* Lifecycle Milestones Summary Preview */}
              <div
                className={`p-4 rounded-xl border ${
                  isDark ? 'bg-[#131d31] border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <h3 className="text-xs font-black uppercase text-blue-400 tracking-wider mb-3">
                  Tóm Tắt Các Giai Đoạn Dự Án (Phases)
                </h3>
                <div className="space-y-2.5">
                  {project.phases?.map((phase) => (
                    <div
                      key={phase.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50 text-xs gap-2"
                    >
                      <div className="flex items-center gap-2">
                        {phase.status === 'completed' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : phase.status === 'in_progress' ? (
                          <Activity className="w-4 h-4 text-blue-400 shrink-0" />
                        ) : (
                          <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                        <span className="font-bold text-slate-200">{phase.name}</span>
                        <span className="text-slate-400">({phase.period})</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-slate-400">
                          {phase.actualHours}h / {phase.plannedHours}h
                        </span>
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                            phase.status === 'completed'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : phase.status === 'in_progress'
                              ? 'bg-blue-950 text-blue-300 border border-blue-800'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          Nghiệm thu: {phase.acceptanceRate}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PHASES / STAGES DETAIL */}
          {activeTab === 'phases' && (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-xl border border-slate-800 scrollbar-thin">
                <table className="w-full min-w-[720px] text-left border-collapse text-xs">
                  <thead className={isDark ? 'bg-slate-900/80 text-slate-400 font-bold' : 'bg-slate-100 text-slate-600 font-bold'}>
                    <tr className="border-b border-slate-800">
                      <th className="p-3 w-[160px] whitespace-nowrap">Giai Đoạn (Phase)</th>
                      <th className="p-3 w-[140px] whitespace-nowrap">Thời Gian Kế Hoạch</th>
                      <th className="p-3 w-[90px] text-center whitespace-nowrap">Giờ Kế Hoạch</th>
                      <th className="p-3 w-[90px] text-center whitespace-nowrap">Giờ Thực Tế</th>
                      <th className="p-3 w-[100px] text-center whitespace-nowrap">Tỷ Lệ Tiêu Hao</th>
                      <th className="p-3 w-[90px] text-center whitespace-nowrap">Trạng Thái</th>
                      <th className="p-3 w-[130px] text-center whitespace-nowrap">Nghiệm Thu Khách Hàng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-medium">
                    {project.phases?.map((p) => {
                      const burnRate = p.plannedHours > 0 ? Math.round((p.actualHours / p.plannedHours) * 100) : 0;
                      return (
                        <tr key={p.id} className="hover:bg-slate-800/30">
                          <td className="p-3 font-bold text-slate-200">{p.name}</td>
                          <td className="p-3 text-slate-400">{p.period}</td>
                          <td className="p-3 text-center font-bold text-slate-300">{p.plannedHours}h</td>
                          <td className="p-3 text-center font-bold text-amber-400">{p.actualHours}h</td>
                          <td className="p-3 text-center">
                            <span className={`font-mono font-bold ${burnRate > 100 ? 'text-rose-400' : 'text-slate-300'}`}>
                              {burnRate}%
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            {p.status === 'completed' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                                Hoàn tất
                              </span>
                            ) : p.status === 'in_progress' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800">
                                Đang chạy
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                                Dự kiến
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center font-bold text-emerald-400">
                            {p.acceptanceRate}% Đạt
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: OVERDUE & CHANGE REQUEST ANALYSIS */}
          {activeTab === 'overdue' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Danh sách nguyên nhân gốc rễ và kế hoạch giảm thiểu rủi ro (Mitigation Plan) cho các hạng mục phát sinh và trễ hạn.
                </p>
                <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-bold">
                  {project.overdueAnalysis?.length || project.overdueTasksCount} Hạng mục trọng điểm
                </span>
              </div>

              {project.overdueAnalysis && project.overdueAnalysis.length > 0 ? (
                <div className="space-y-3">
                  {project.overdueAnalysis.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border ${
                        isDark ? 'bg-[#141e33] border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800">
                            {item.code}
                          </span>
                          <span className="text-xs font-black text-slate-100">{item.title}</span>
                          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {item.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-rose-400 font-bold bg-rose-950/70 px-2 py-0.5 rounded border border-rose-800">
                            Trễ {item.delayDays} ngày
                          </span>
                          <span className="text-slate-400">Hạn: {item.dueDate}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-800 text-xs">
                        <div>
                          <span className="text-slate-400 font-bold block mb-1">
                            Nguyên Nhân Trễ / Phát Sinh:
                          </span>
                          <p className="text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                            {item.reason}
                          </p>
                        </div>
                        <div>
                          <span className="text-emerald-400 font-bold block mb-1">
                            Biện Pháp Khắc Phục (Mitigation):
                          </span>
                          <p className="text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                            {item.mitigation}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                        <span>Thực hiện: <strong className="text-slate-200">{item.assignee}</strong></span>
                        <span>Kiểm duyệt: <strong className="text-slate-200">{item.reviewer}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center rounded-xl bg-slate-800/30 border border-slate-800 text-slate-400 text-xs">
                  Không có task trễ hạn hoặc phát sinh cần giải quyết đặc biệt trong dự án này.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: FULL PROJECT TASKS LIST */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              {/* Task Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={taskSearch}
                    onChange={(e) => setTaskSearch(e.target.value)}
                    placeholder="Tìm kiếm theo mã task, tiêu đề hoặc người phụ trách..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={taskStatusFilter}
                    onChange={(e) => setTaskStatusFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="all">Tất cả Trạng thái</option>
                    <option value="done">Đã hoàn thành</option>
                    <option value="in_progress">Đang làm</option>
                    <option value="todo">Cần làm</option>
                  </select>

                  <select
                    value={taskTypeFilter}
                    onChange={(e) => setTaskTypeFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="all">Tất cả Loại</option>
                    <option value="feature">Tính năng (Feature)</option>
                    <option value="cr">Phát sinh (CR)</option>
                    <option value="bug">Sửa lỗi (Bug)</option>
                    <option value="rework">Làm lại (Rework)</option>
                    <option value="maintenance">Bảo trì</option>
                  </select>
                </div>
              </div>

              {/* Tasks Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800 scrollbar-thin">
                <table className="w-full min-w-[780px] text-left border-collapse text-xs">
                  <thead className={isDark ? 'bg-slate-900/80 text-slate-400 font-bold' : 'bg-slate-100 text-slate-600 font-bold'}>
                    <tr className="border-b border-slate-800">
                      <th className="p-3 w-[100px] whitespace-nowrap">Mã Task</th>
                      <th className="p-3">Tiêu Đề Công Việc</th>
                      <th className="p-3 w-[180px] whitespace-nowrap">Người Phụ Trách</th>
                      <th className="p-3 w-[90px] text-center whitespace-nowrap">Loại</th>
                      <th className="p-3 w-[80px] text-center whitespace-nowrap">Ưu Tiên</th>
                      <th className="p-3 w-[80px] text-center whitespace-nowrap">Giờ Est</th>
                      <th className="p-3 w-[100px] text-center whitespace-nowrap">Hạn Chót</th>
                      <th className="p-3 w-[100px] text-center whitespace-nowrap">Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-medium">
                    {filteredTasks.length > 0 ? (
                      filteredTasks.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-800/30">
                          <td className="p-3 font-mono font-bold text-blue-400 whitespace-nowrap">{t.code}</td>
                          <td className="p-3 font-bold text-slate-200 max-w-xs truncate">{t.title}</td>
                          <td className="p-3 text-slate-300 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <UserAvatar
                                avatar={t.assigneeAvatar}
                                name={t.assigneeName}
                                className="w-5 h-5 shrink-0"
                                badgeColor="blue"
                              />
                              <span className="truncate">{t.assigneeName}</span>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                              {t.type}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                t.priority === 'urgent'
                                  ? 'bg-rose-950 text-rose-300'
                                  : t.priority === 'high'
                                  ? 'bg-amber-950 text-amber-300'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {t.priority}
                            </span>
                          </td>
                          <td className="p-3 text-center font-bold text-slate-300">{t.estimatedHours}h</td>
                          <td className="p-3 text-center text-slate-400">{t.dueDate}</td>
                          <td className="p-3 text-center">
                            {t.status === 'done' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                                Đã xong
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800">
                                Đang làm
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="p-6 text-center text-slate-400">
                          Không tìm thấy công việc phù hợp với bộ lọc hiện tại.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div
          className={`px-6 py-3 border-t flex items-center justify-between text-xs ${
            isDark ? 'bg-[#0b1120] border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Dữ liệu đồng bộ trực tiếp từ Vòng đời Dự án & Jira Sprints</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg transition"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};
