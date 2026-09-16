import React, { useState, useMemo } from 'react';
import {
  CalendarClock,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  Users,
  Briefcase,
  Layers,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  Tag,
  ExternalLink,
} from 'lucide-react';
import { TodayHardMetrics, Task, Employee } from '../types';
import { UserAvatar } from './UserAvatar';

interface TodayLiveScreenProps {
  metrics?: TodayHardMetrics;
  tasks?: Task[];
  employees?: Employee[];
  onOpenTasksModal: () => void;
  onOpenOverdueModal: () => void;
  onOpenResourceModal: () => void;
  onOpenEmployeeTaskModal: (employee: Employee, tasks: Task[]) => void;
  onNavigateToMember?: (employeeId: string) => void;
  onNavigateToTeamReport?: () => void;
  isDark?: boolean;
}

export const TodayLiveScreen: React.FC<TodayLiveScreenProps> = ({
  metrics,
  tasks = [],
  employees = [],
  onOpenTasksModal,
  onOpenOverdueModal,
  onOpenResourceModal,
  onOpenEmployeeTaskModal,
  onNavigateToMember,
  onNavigateToTeamReport,
  isDark = true,
}) => {
  const [searchTask, setSearchTask] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'todo' | 'in_progress' | 'review' | 'done'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'feature' | 'bug' | 'rework' | 'cr' | 'maintenance'>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);

  // Safe Fallback for Hard Metrics
  const safeMetrics: TodayHardMetrics = useMemo(() => {
    if (metrics) return metrics;
    const completedCount = tasks.filter((t) => (t.isToday || t.isOverdueToday) && t.status === 'done').length;
    const inProgressCount = tasks.filter((t) => (t.isToday || t.isOverdueToday) && (t.status === 'in_progress' || t.status === 'review')).length;
    const overdueCount = tasks.filter((t) => t.isOverdueToday).length;
    return {
      totalTasksToday: tasks.filter((t) => t.isToday || t.isOverdueToday).length || 15,
      completedTasksToday: completedCount || 4,
      inProgressTasksToday: inProgressCount || 8,
      overdueTasksToday: overdueCount || 6,
      remainingHoursToday: 18.2,
      totalQuotaHoursToday: employees.length * 8 || 80,
      underQuotaEmployees: [],
    };
  }, [metrics, tasks, employees]);

  // Compute workload distribution counts from employees
  const { overallocatedCount, balancedCount, underallocatedCount } = useMemo(() => {
    let over = 0;
    let balanced = 0;
    let under = 0;
    employees.forEach((emp) => {
      const allocated = emp.allocatedHoursToday || 0;
      if (allocated >= 7.5) over++;
      else if (allocated >= 6.0) balanced++;
      else under++;
    });
    return { overallocatedCount: over, balancedCount: balanced, underallocatedCount: under };
  }, [employees]);

  // Today's Date String
  const todayDateStr = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Tasks belonging to today or overdue
  const todayTasksList = useMemo(() => {
    return tasks.filter((t) => t.isToday || t.isOverdueToday);
  }, [tasks]);

  // Filtered tasks for today's table
  const filteredTasks = useMemo(() => {
    return todayTasksList.filter((t) => {
      const q = searchTask.toLowerCase();
      const matchSearch =
        t.title.toLowerCase().includes(q) ||
        t.code.toLowerCase().includes(q) ||
        t.projectName.toLowerCase().includes(q) ||
        t.assigneeName.toLowerCase().includes(q);

      const matchStatus = statusFilter === 'all' ? true : t.status === statusFilter;
      const matchType = typeFilter === 'all' ? true : t.type === typeFilter;
      const matchAssignee = selectedAssignee === 'all' ? true : t.assigneeId === selectedAssignee;
      const matchOverdue = showOverdueOnly ? t.isOverdueToday : true;

      return matchSearch && matchStatus && matchType && matchAssignee && matchOverdue;
    });
  }, [todayTasksList, searchTask, statusFilter, typeFilter, selectedAssignee, showOverdueOnly]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* 1. TOP HERO BANNER */}
      <div
        className={`p-6 rounded-2xl border shadow-xl relative overflow-hidden transition ${
          isDark
            ? 'bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border-slate-800'
            : 'bg-gradient-to-r from-blue-50 via-indigo-50/50 to-white border-slate-200'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
              <CalendarClock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1
                  className={`text-lg sm:text-xl font-black uppercase tracking-tight ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  THEO DÕI CÔNG VIỆC HÔM NAY (LIVE OPERATIONS TRACKER)
                </h1>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800/80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live Realtime
                </span>
              </div>
              <p className={`text-xs font-medium mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Giám sát thời gian thực các task cần làm trong ngày, phát hiện tắc nghẽn, kiểm soát task trễ hạn và cân bằng tải 8.0h
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
                isDark ? 'bg-slate-900/80 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
              }`}
            >
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Hôm nay: <strong className="capitalize">{todayDateStr}</strong></span>
            </div>

            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
                isDark ? 'bg-slate-900/80 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Chuẩn công ty: <strong className="text-emerald-400">8.0h / ngày</strong></span>
            </div>
          </div>
        </div>

        {/* 3 HARD METRICS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          {/* Card 1: Tổng số Task hôm nay */}
          <div
            onClick={onOpenTasksModal}
            className={`p-5 rounded-2xl border transition-all cursor-pointer group shadow-sm hover:shadow-md ${
              isDark
                ? 'bg-slate-900/90 border-slate-800 hover:border-blue-500/50'
                : 'bg-white border-slate-200 hover:border-blue-400'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                  Tổng Task Cần Làm Hôm Nay
                </span>
                <div className="text-3xl font-black mt-1.5 flex items-baseline gap-2 group-hover:scale-105 transition-transform">
                  <span className={isDark ? 'text-white' : 'text-slate-900'}>{safeMetrics.totalTasksToday}</span>
                  <span className="text-xs font-semibold text-slate-400">Nhiệm vụ</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Briefcase className="w-5 h-5" />
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/80 text-xs">
              <span className="text-slate-400">Tỷ lệ trong sprint:</span>
              <span className="font-bold text-blue-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Xem danh sách chi tiết
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Card 2: Task Quá Hạn Hôm Nay */}
          <div
            onClick={onOpenOverdueModal}
            className={`p-5 rounded-2xl border transition-all cursor-pointer group shadow-sm hover:shadow-md ${
              safeMetrics.overdueTasksToday > 0
                ? isDark
                  ? 'bg-rose-950/20 border-rose-900/60 hover:border-rose-500'
                  : 'bg-rose-50 border-rose-200 hover:border-rose-400'
                : isDark
                ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  Task Đang Quá Hạn Hôm Nay
                </span>
                <div className="text-3xl font-black mt-1.5 flex items-baseline gap-2 group-hover:scale-105 transition-transform">
                  <span className="text-rose-400">{safeMetrics.overdueTasksToday}</span>
                  <span className="text-xs font-semibold text-slate-400">Cần xử lý gấp</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-rose-900/40 text-xs">
              <span className="text-rose-300/80">Rủi ro trễ milestone:</span>
              <span className="font-bold text-rose-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Xem phương án khắc phục
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Card 3: Cân Bằng Tải Nguồn Lực 8h Hôm Nay */}
          <div
            onClick={onOpenResourceModal}
            className={`p-5 rounded-2xl border transition-all cursor-pointer group shadow-sm hover:shadow-md ${
              isDark
                ? 'bg-slate-900/90 border-slate-800 hover:border-amber-500/50'
                : 'bg-white border-slate-200 hover:border-amber-400'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Cân Bằng Nguồn Lực (8.0h/ngày)
                </span>
                <div className="flex items-center gap-2 mt-2 font-bold text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-rose-950/70 border border-rose-800 text-rose-300">
                    {overallocatedCount} Quá tải (&ge;7.5h)
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-950/70 border border-emerald-800 text-emerald-300">
                    {balancedCount} Chuẩn
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-blue-950/70 border border-blue-800 text-blue-300">
                    {underallocatedCount} Dư giờ
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/80 text-xs">
              <span className="text-slate-400">Tối ưu năng suất:</span>
              <span className="font-bold text-amber-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Điều phối phân bổ lại giờ
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. BẢNG PHÂN TÍCH TẢI TRỌNG NHÂN SỰ HÔM NAY (10 NHÂN VIÊN) */}
      <div
        className={`p-5 rounded-2xl border shadow-lg space-y-4 transition ${
          isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-100">
                Phân Bổ Tải Trọng 8.0h Của Đội Ngũ Trong Ngày Hôm Nay
              </h2>
              <p className="text-xs text-slate-400">
                Theo dõi sát sao từng thành viên để tránh kiệt sức (burnout) hoặc lãng phí năng lực
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateToTeamReport && (
              <button
                onClick={onNavigateToTeamReport}
                className="px-3 py-1.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-bold transition flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                <span>Xem 4 Biểu Đồ Tải</span>
              </button>
            )}
            <button
              onClick={onOpenResourceModal}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-600/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mở Cửa Sổ Cân Đối Tải Nâng Cao</span>
            </button>
          </div>
        </div>

        {/* Grid of employees workload cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {employees.map((emp) => {
            const allocated = emp.allocatedHoursToday || 0;
            const pct = Math.min(100, (allocated / 8.0) * 100);
            const isOverloaded = allocated >= 7.5;
            const isBalanced = allocated >= 6.0 && allocated < 7.5;

            const badgeColor = isOverloaded
              ? 'bg-rose-950 text-rose-300 border-rose-800'
              : isBalanced
              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
              : 'bg-blue-950 text-blue-300 border-blue-800';

            const barColor = isOverloaded
              ? 'bg-rose-500'
              : isBalanced
              ? 'bg-emerald-500'
              : 'bg-blue-500';

            return (
              <div
                key={emp.id}
                className={`p-3.5 rounded-xl border transition flex flex-col justify-between group ${
                  isDark ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <UserAvatar name={emp.name} avatar={emp.avatar} className="w-8 h-8 rounded-lg" />
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${badgeColor}`}>
                      {isOverloaded ? 'Quá tải' : isBalanced ? 'Chuẩn 8h' : 'Dư giờ'}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-200 truncate" title={emp.name}>
                    {emp.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 truncate">{emp.role}</p>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                      <span className="text-slate-400">Đã gán:</span>
                      <strong className={isOverloaded ? 'text-rose-400' : 'text-slate-200'}>
                        {allocated}h / 8.0h
                      </strong>
                    </div>

                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                  <button
                    onClick={() => {
                      const empTasks = tasks.filter((t) => t.assigneeId === emp.id);
                      onOpenEmployeeTaskModal(emp, empTasks);
                    }}
                    className="text-slate-400 hover:text-white font-medium"
                  >
                    Xem task
                  </button>

                  {onNavigateToMember && (
                    <button
                      onClick={() => onNavigateToMember(emp.id)}
                      className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-0.5"
                    >
                      <span>Hồ sơ</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. BẢNG TƯƠNG TÁC CÔNG VIỆC CẦN LÀM TRONG NGÀY */}
      <div
        className={`p-5 rounded-2xl border shadow-lg space-y-4 transition ${
          isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-100">
                Danh Sách Chi Tiết Công Việc Trong Ngày & Quá Hạn ({filteredTasks.length})
              </h2>
              <p className="text-xs text-slate-400">
                Bảng theo dõi trực quan trạng thái, người thực hiện, giờ ước lượng và mức độ khẩn cấp
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowOverdueOnly(!showOverdueOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                showOverdueOnly
                  ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30'
                  : isDark
                  ? 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Chỉ Xem Task Quá Hạn ({safeMetrics.overdueTasksToday})</span>
            </button>
          </div>
        </div>

        {/* Toolbar filter */}
        <div
          className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTask}
                onChange={(e) => setSearchTask(e.target.value)}
                placeholder="Tìm mã task, tên task, dự án hoặc nhân sự..."
                className={`w-full pl-8 pr-3 py-1.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-800'
                }`}
              />
            </div>

            {/* Filter Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
              }`}
            >
              <option value="all">Tất Cả Trạng Thái</option>
              <option value="todo">Chưa Bắt Đầu (To Do)</option>
              <option value="in_progress">Đang Thực Hiện</option>
              <option value="review">Đang Review</option>
              <option value="done">Đã Hoàn Thành</option>
            </select>

            {/* Filter Type */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
              }`}
            >
              <option value="all">Tất Cả Loại Task</option>
              <option value="feature">Tính Năng (Feature)</option>
              <option value="bug">Sửa Lỗi (Bug)</option>
              <option value="rework">Làm Lại (Rework)</option>
              <option value="cr">Yêu Cầu Thay Đổi (CR)</option>
              <option value="maintenance">Bảo Trì</option>
            </select>

            {/* Filter Assignee */}
            <select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
              }`}
            >
              <option value="all">Tất Cả Nhân Sự</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.code})
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-400 font-bold">
            Hiển thị <strong className="text-blue-400">{filteredTasks.length}</strong> / {todayTasksList.length} công việc
          </div>
        </div>

        {/* Task Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead className={isDark ? 'bg-slate-900/90 text-slate-400' : 'bg-slate-100 text-slate-600'}>
              <tr>
                <th className="p-3 font-bold">Mã & Nhiệm Vụ</th>
                <th className="p-3 font-bold">Dự Án</th>
                <th className="p-3 font-bold">Phụ Trách</th>
                <th className="p-3 font-bold">Loại & Ưu Tiên</th>
                <th className="p-3 font-bold">Thời Lượng (Ước tính / Thực tế)</th>
                <th className="p-3 font-bold">Hạn Chót & Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Không có công việc nào khớp với bộ lọc
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t) => {
                  const isOverdue = t.isOverdueToday;
                  return (
                    <tr
                      key={t.id}
                      className={`hover:bg-slate-800/40 transition ${
                        isOverdue ? 'bg-rose-950/20' : ''
                      }`}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-400 text-[11px] px-1.5 py-0.5 rounded bg-blue-950/80 border border-blue-800">
                            {t.code}
                          </span>
                          <span className="text-slate-200 font-bold max-w-xs truncate" title={t.title}>
                            {t.title}
                          </span>
                        </div>
                        {t.sprintName && (
                          <span className="text-[10px] text-slate-400 mt-0.5 block">
                            Sprint: {t.sprintName}
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-slate-300">
                        <span className="font-semibold block truncate max-w-[180px]">{t.projectName}</span>
                        <span className="text-[10px] text-slate-400">{t.clientName}</span>
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <UserAvatar name={t.assigneeName} avatar={t.assigneeAvatar} className="w-7 h-7 rounded-lg" />
                          <div>
                            <span className="text-slate-200 font-semibold block">{t.assigneeName}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              t.type === 'bug'
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : t.type === 'rework'
                                ? 'bg-purple-950 text-purple-300 border border-purple-800'
                                : 'bg-blue-950 text-blue-300 border border-blue-800'
                            }`}
                          >
                            {t.type}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              t.priority === 'urgent'
                                ? 'bg-rose-600 text-white'
                                : t.priority === 'high'
                                ? 'bg-amber-600 text-white'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {t.priority}
                          </span>
                        </div>
                      </td>

                      <td className="p-3 font-mono">
                        <span className="text-slate-200 font-bold">{t.actualHours || t.estimatedHours}h</span>
                        <span className="text-slate-400 text-[10px]"> / {t.estimatedHours}h est</span>
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {isOverdue ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-rose-400" />
                              Trễ {t.delayDays || 1} ngày
                            </span>
                          ) : t.status === 'done' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              Hoàn tất
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-950 text-blue-300 border border-blue-800">
                              Hôm nay ({t.dueDate})
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
