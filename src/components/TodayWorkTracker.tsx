import React, { useState } from 'react';
import {
  CalendarClock,
  CheckCircle2,
  AlertTriangle,
  BatteryCharging,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Layers,
  Clock,
  ChevronDown,
  ChevronUp,
  Search,
  CheckSquare,
  ExternalLink,
} from 'lucide-react';
import { TodayHardMetrics, Task, Employee } from '../types';
import { UserAvatar } from './UserAvatar';

interface TodayWorkTrackerProps {
  metrics: TodayHardMetrics;
  onOpenTasksModal: () => void;
  onOpenOverdueModal: () => void;
  onOpenResourceModal: () => void;
  onOpenEmployeeTaskModal: (employee: Employee, tasks: Task[]) => void;
}

/**
 * Component Theo Dõi Công Việc Hôm Nay (Mục 5) - Hard Metrics Cố Định
 * Nâng cấp thiết kế Nguồn Lực Nhân Viên dạng Accordion/Dropdown xem nhanh danh sách Task theo Hình 5
 */
export const TodayWorkTracker: React.FC<TodayWorkTrackerProps> = ({
  metrics,
  onOpenTasksModal,
  onOpenOverdueModal,
  onOpenResourceModal,
  onOpenEmployeeTaskModal,
}) => {
  // State quản lý dòng nhân viên đang được mở rộng danh sách Task (Accordion)
  const [expandedEmpId, setExpandedEmpId] = useState<string | null>(
    metrics.underQuotaEmployees[0]?.employee.id || null
  );

  // State tìm kiếm & lọc trạng thái rủi ro
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('all');

  const toggleExpand = (empId: string) => {
    setExpandedEmpId((prev) => (prev === empId ? null : empId));
  };

  // Filter nhân viên theo từ khóa tìm kiếm & mức độ rủi ro
  const filteredUnderQuota = (metrics.underQuotaEmployees || []).filter(({ employee }) => {
    const matchSearch =
      employee.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      employee.code.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchKeyword.toLowerCase());

    const rem = employee.remainingHoursToday;
    const isOverloaded = rem < 0;
    const isRedAlert = rem >= 0 && rem <= 0.5;
    const isSatNguong = rem > 0.5;

    // OLD: const matchRisk = selectedRiskFilter === 'all' || (selectedRiskFilter === 'overloaded' && isOverloaded) || (selectedRiskFilter === 'warning' && !isOverloaded);
    /** Lọc danh sách theo các trạng thái rủi ro chuẩn ảnh mẫu */
    let matchRisk = true;
    if (selectedRiskFilter === 'overloaded') matchRisk = isOverloaded;
    if (selectedRiskFilter === 'red_alert') matchRisk = isRedAlert;
    if (selectedRiskFilter === 'sat_nguong') matchRisk = isSatNguong;

    return matchSearch && matchRisk;
  });

  return (
    <section id="section-today" className="space-y-4">
      {/* Dark modern hero container */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h2 className="text-sm font-black uppercase tracking-wider text-blue-200 flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-emerald-400" />
              MỤC 5: THEO DÕI CÔNG VIỆC HÔM NAY (HARD METRICS CỐ ĐỊNH THEO NGÀY)
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="bg-white/10 text-slate-200 font-semibold px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              Ngày áp dụng: <strong className="text-white">08/09/2026</strong> • Không phụ thuộc bộ lọc
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold text-[11px]">
              Quy định công ty: 8.0h / ngày
            </span>
          </div>
        </div>

        {/* 3 HARD METRICS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Card 1: Tổng số Task hôm nay */}
          <div
            id="card-today-tasks"
            onClick={onOpenTasksModal}
            className="bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between group"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
                  Tổng số Task hôm nay
                </span>
                <div className="text-3xl font-black text-white mt-1 group-hover:scale-105 transition-transform flex items-baseline gap-2">
                  <span>{metrics.totalTasksToday}</span>
                  <span className="text-xs font-normal text-slate-300">Công việc</span>
                </div>
              </div>
              <div className="w-11 h-11 rounded-xl bg-blue-500/25 text-blue-300 flex items-center justify-center text-lg font-bold group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <Layers className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-emerald-300 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {metrics.completedTasksToday} Đã xong • {metrics.inProgressTasksToday} Đang làm
              </span>
              <span className="text-blue-300 font-bold group-hover:underline flex items-center gap-0.5">
                Xem chi tiết Task <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Card 2: Tổng số Task trễ đến hôm nay */}
          <div
            id="card-today-overdue"
            onClick={onOpenOverdueModal}
            className="bg-white/10 hover:bg-white/15 border border-rose-500/40 rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between group"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-rose-200 uppercase tracking-wider">
                  Tổng số Task trễ đến hôm nay
                </span>
                <div className="text-3xl font-black text-rose-400 mt-1 group-hover:scale-105 transition-transform flex items-baseline gap-2">
                  <span>{metrics.overdueTasksToday}</span>
                  <span className="text-xs font-normal text-rose-200">Task quá hạn ⚠️</span>
                </div>
              </div>
              <div className="w-11 h-11 rounded-xl bg-rose-500/25 text-rose-300 flex items-center justify-center text-lg font-bold group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-rose-300 font-semibold">
                Cần ưu tiên xử lý trong Sprint
              </span>
              <span className="text-rose-200 font-bold group-hover:underline flex items-center gap-0.5">
                Xem chi tiết Task <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Card 3: Tổng nguồn lực còn lại hôm nay */}
          <div
            id="card-today-resource"
            onClick={onOpenResourceModal}
            className="bg-white/10 hover:bg-white/15 border border-amber-500/40 rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between group"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-amber-200 uppercase tracking-wider">
                  Tổng nguồn lực còn lại hôm nay
                </span>
                <div className="text-3xl font-black text-amber-300 mt-1 group-hover:scale-105 transition-transform flex items-baseline gap-2">
                  <span>{metrics.remainingHoursToday.toFixed(1)}</span>
                  <span className="text-xs font-normal text-slate-300">Giờ (Hours)</span>
                </div>
              </div>
              <div className="w-11 h-11 rounded-xl bg-amber-500/25 text-amber-300 flex items-center justify-center text-lg font-bold group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <BatteryCharging className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-amber-200 font-semibold">
                {metrics.underQuotaEmployees.length} nhân viên có tải cảnh báo (&lt; 2.0h)
              </span>
              <span className="text-amber-200 font-bold group-hover:underline flex items-center gap-0.5">
                Xem chi tiết nguồn lực <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>

        {/* Nguồn lực nhân viên: Danh sách nhân viên có nguồn lực còn trống thấp hơn quy định */}
        <div className="mt-5 pt-4 border-t border-white/10 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-extrabold uppercase text-amber-200 tracking-wider">
                NGUỒN LỰC NHÂN VIÊN: QUẢN LÝ CÔNG SUẤT VÀ TẢI PHÂN BỔ CÔNG VIỆC HÔM NAY
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm nhân viên, mã NV..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="pl-8 pr-3 py-1 bg-slate-900/90 border border-slate-700 text-slate-200 rounded-lg text-xs w-44 focus:outline-none focus:border-blue-500"
                />
              </div>
              {/* Risk Filter */}
              <select
                value={selectedRiskFilter}
                onChange={(e) => setSelectedRiskFilter(e.target.value)}
                className="px-2.5 py-1 bg-slate-900/90 border border-slate-700 text-slate-200 rounded-lg text-xs focus:outline-none cursor-pointer"
              >
                <option value="all">Tất cả rủi ro</option>
                <option value="overloaded">Quá tải nghiêm trọng</option>
                <option value="red_alert">Báo động đỏ (≤ 0.5h)</option>
                <option value="sat_nguong">Sát ngưỡng đệm</option>
              </select>
            </div>
          </div>

          {/* OLD:
          <table className="w-full min-w-[860px] text-xs text-left" id="table-under-quota-employees"> ... </table>
          */}

          {/* TABLE THIẾT KẾ MỚI DẠNG GROUP TEAM ACCORDION THEO PHÒNG BAN */}
          {(() => {
            /** Gom nhóm danh sách nhân sự theo phòng ban/team */
            const teamGroups: Record<string, typeof filteredUnderQuota> = {};
            filteredUnderQuota.forEach((item) => {
              const dept = item.employee.department || 'Phòng Kỹ Thuật';
              if (!teamGroups[dept]) teamGroups[dept] = [];
              teamGroups[dept].push(item);
            });

            return (
              <div className="overflow-x-auto rounded-xl border border-white/15 bg-white/5 scrollbar-thin">
                <table className="w-full min-w-[920px] text-xs text-left border-collapse" id="table-resource-accordion">
                  <thead className="bg-slate-900/90 text-slate-300 uppercase font-bold border-b border-slate-800 text-[11px]">
                    <tr>
                      <th className="p-3 w-[260px] whitespace-nowrap">NHÂN VIÊN / TEAM</th>
                      <th className="p-3 w-[150px] whitespace-nowrap">NGUỒN LỰC QUY ĐỊNH</th>
                      <th className="p-3 w-[150px] whitespace-nowrap">NGUỒN LỰC ĐÃ PHÂN BỔ</th>
                      <th className="p-3 w-[140px] whitespace-nowrap">NGUỒN LỰC CÒN LẠI</th>
                      <th className="p-3 w-[160px] whitespace-nowrap">TRẠNG THÁI RỦI RO</th>
                      <th className="p-3 text-center w-[120px] whitespace-nowrap">CHI TIẾT TASK</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 font-medium">
                    {Object.entries(teamGroups).map(([deptName, members]) => {
                      const teamTotalAllocated = members.reduce((sum, m) => sum + m.employee.allocatedHoursToday, 0);
                      const teamTotalQuota = members.reduce((sum, m) => sum + m.employee.quotaHours, 0);
                      const hasOverload = members.some((m) => m.employee.remainingHoursToday < 0);
                      const hasRedAlert = members.some((m) => m.employee.remainingHoursToday >= 0 && m.employee.remainingHoursToday <= 0.5);

                      return (
                        <React.Fragment key={deptName}>
                          {/* DÒNG HEADER BẮT MẮT GOM NHÓM THEO TEAM / PHÒNG BAN */}
                          <tr className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border-y border-slate-800/90">
                            <td colSpan={6} className="px-3.5 py-2.5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
                                  <span className="font-black text-xs text-indigo-200 uppercase tracking-wider">
                                    🏢 {deptName}
                                  </span>
                                  <span className="bg-indigo-950 text-indigo-300 font-bold px-2 py-0.5 rounded-full text-[10px] border border-indigo-800 font-mono">
                                    {members.length} Nhân sự
                                  </span>
                                </div>

                                <div className="flex items-center gap-4 text-[11px]">
                                  <span className="text-slate-300 font-medium">
                                    Tổng đã phân bổ: <strong className="text-amber-300 font-mono">{teamTotalAllocated.toFixed(1)}h / {teamTotalQuota.toFixed(1)}h</strong>
                                  </span>
                                  {hasOverload ? (
                                    <span className="bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded font-bold text-[10px]">
                                      ⚠️ Có nhân sự quá tải
                                    </span>
                                  ) : hasRedAlert ? (
                                    <span className="bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded font-bold text-[10px]">
                                      ⏱️ Cảnh báo sát đệm
                                    </span>
                                  ) : (
                                    <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-bold text-[10px]">
                                      ✓ Tải an toàn
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>

                          {/* DANH SÁCH NHÂN SỰ THUỘC TEAM */}
                          {members.map(({ employee, allocatedTasks }) => {
                            const isOverloaded = employee.remainingHoursToday < 0;
                            const isExpanded = expandedEmpId === employee.id;
                            const allocatedPercent = Math.round((employee.allocatedHoursToday / employee.quotaHours) * 100);
                            const remHours = employee.remainingHoursToday;

                            return (
                              <React.Fragment key={employee.id}>
                                {/* Dòng chính Nhân Viên */}
                                <tr
                                  onClick={() => toggleExpand(employee.id)}
                                  className={`cursor-pointer transition-colors ${
                                    isExpanded ? 'bg-white/15' : 'hover:bg-white/10'
                                  }`}
                                >
                                  {/* 1. NHÂN VIÊN */}
                                  <td className="p-3 pl-6">
                                    <div className="flex items-center gap-2.5">
                                      <UserAvatar
                                        avatar={employee.avatar}
                                        name={employee.name}
                                        className="w-8 h-8 shrink-0 border border-slate-700"
                                        badgeColor={isOverloaded ? 'rose' : 'amber'}
                                      />
                                      <div className="min-w-0">
                                        <div className="font-bold text-white flex items-center gap-1.5">
                                          <span className="truncate">{employee.name}</span>
                                          <span className="font-mono text-[10px] text-slate-400 bg-white/10 px-1.5 py-0.2 rounded shrink-0">
                                            {employee.code}
                                          </span>
                                        </div>
                                        <div className="text-[11px] text-slate-300 truncate mt-0.5">
                                          {employee.role}
                                        </div>
                                      </div>
                                    </div>
                                  </td>

                                  {/* 2. NGUỒN LỰC QUY ĐỊNH */}
                                  <td className="p-3 whitespace-nowrap">
                                    <div className="font-bold text-slate-100">{employee.quotaHours.toFixed(1)}h/ngày</div>
                                    <div className="text-[10px] text-slate-400">Đệm chuẩn: ≥1.5h</div>
                                  </td>

                                  {/* 3. NGUỒN LỰC ĐÃ PHÂN BỔ */}
                                  <td className="p-3 whitespace-nowrap">
                                    <div className={`font-black ${isOverloaded ? 'text-rose-400' : 'text-amber-300'}`}>
                                      {employee.allocatedHoursToday.toFixed(1)}h
                                    </div>
                                    <div className="text-[10px] text-slate-400">{allocatedPercent}% công suất</div>
                                  </td>

                                  {/* 4. NGUỒN LỰC CÒN LẠI */}
                                  <td className="p-3 whitespace-nowrap">
                                    <div className={`font-black ${isOverloaded ? 'text-rose-400' : 'text-amber-300'}`}>
                                      {employee.remainingHoursToday.toFixed(1)}h
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                      {isOverloaded ? 'Quá tải 100%' : remHours <= 0.5 ? 'Báo động đỏ' : 'Sát ngưỡng đệm'}
                                    </div>
                                  </td>

                                  {/* 5. TRẠNG THÁI RỦI RO */}
                                  <td className="p-3 whitespace-nowrap">
                                    {remHours < 0 ? (
                                      <span className="inline-flex items-center gap-1.5 bg-[#2a0e17] text-[#f87171] border border-[#7f1d1d] px-3 py-1 rounded-full text-xs font-bold shadow-xs">
                                        <AlertTriangle className="w-3.5 h-3.5 text-[#f87171]" />
                                        Quá tải nghiêm trọng
                                      </span>
                                    ) : remHours <= 0.5 ? (
                                      <span className="inline-flex items-center gap-1.5 bg-[#281a05] text-[#fbbf24] border border-[#78350f] px-3 py-1 rounded-full text-xs font-bold shadow-xs">
                                        <Clock className="w-3.5 h-3.5 text-[#fbbf24]" />
                                        Báo động đỏ (&le; 0.5h)
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1.5 bg-[#281a05] text-[#fbbf24] border border-[#78350f] px-3 py-1 rounded-full text-xs font-bold shadow-xs">
                                        <Clock className="w-3.5 h-3.5 text-[#fbbf24]" />
                                        Sát ngưỡng đệm
                                      </span>
                                    )}
                                  </td>

                                  {/* 6. CHI TIẾT TASK */}
                                  <td className="p-3 text-center whitespace-nowrap">
                                    <div className="flex items-center justify-center gap-1.5">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleExpand(employee.id);
                                        }}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-950/80 hover:bg-blue-900 text-blue-300 font-bold rounded-lg border border-blue-800 text-xs transition-colors shadow-xs"
                                      >
                                        <span>{allocatedTasks.length} task</span>
                                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                      </button>

                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onOpenEmployeeTaskModal(employee, allocatedTasks);
                                        }}
                                        title="Xem chi tiết công việc nhân sự (Mẫu Hình 3)"
                                        className="p-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg border border-blue-400/40 transition-colors shadow-xs"
                                      >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>

                                {/* KHUNG DROPDOWN XỔ RA CHI TIẾT CÁC TASK PHÂN BỔ HÔM NAY (KHỚP HÌNH 5) */}
                                {isExpanded && (
                                  <tr className="bg-[#0f172a]/95 border-b border-slate-800">
                                    <td colSpan={6} className="p-3">
                                      <div className="p-3.5 rounded-xl bg-[#141e33] border border-slate-800 space-y-2.5 shadow-inner">
                                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                                            <CheckSquare className="w-4 h-4 text-emerald-400" />
                                            Chi tiết {allocatedTasks.length} Task đang phân bổ hôm nay cho {employee.name}:
                                          </span>
                                          <span className="text-xs text-slate-400 font-medium">
                                            Tổng giờ Est: <strong className="text-blue-300 font-mono">{employee.allocatedHoursToday.toFixed(1)} giờ</strong>
                                          </span>
                                        </div>

                                        <div className="space-y-2">
                                          {allocatedTasks.length > 0 ? (
                                            allocatedTasks.map((t) => (
                                              <div
                                                key={t.id}
                                                className="flex items-center justify-between p-2.5 rounded-lg bg-[#0c1322] border border-slate-800/80 text-xs gap-3 hover:border-slate-700 transition-colors"
                                              >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                  <span className="font-mono font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800 shrink-0">
                                                    {t.code}
                                                  </span>
                                                  <span className="font-bold text-slate-100 truncate">{t.title}</span>
                                                  {t.type === 'bug' && (
                                                    <span className="bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.2 rounded text-[10px] font-bold uppercase shrink-0">
                                                      BUG (critical)
                                                    </span>
                                                  )}
                                                </div>

                                                <div className="flex items-center gap-3 shrink-0">
                                                  <span className="text-slate-400 truncate max-w-[160px] text-[11px]">
                                                    {t.projectName}
                                                  </span>
                                                  <span className="bg-slate-800 text-amber-300 font-bold font-mono px-2 py-0.5 rounded border border-slate-700 text-[11px]">
                                                    Ước tính: {t.estimatedHours}h
                                                  </span>
                                                  <span className="bg-blue-950 text-blue-300 px-2.5 py-0.5 rounded-full font-bold text-[10px] border border-blue-800">
                                                    {t.status === 'done' ? 'Đã xong' : 'Đang làm'}
                                                  </span>
                                                </div>
                                              </div>
                                            ))
                                          ) : (
                                            <div className="text-slate-400 italic text-xs py-1">
                                              Không có task gán trực tiếp hôm nay.
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </React.Fragment>
                      );
                    })}
            </tbody>
          </table>
        </div>
      );
    })()}
  </div>
</div>
</section>
);
};
