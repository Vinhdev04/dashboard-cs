import React from 'react';
import {
  Layers,
  CalendarClock,
  Users,
  Inbox,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Clock,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';
import { ActiveNavTab } from '../types';

export interface NavbarProps {
  activeNav: ActiveNavTab;
  onNavChange: (nav: ActiveNavTab) => void;
  projectCount: number;
  todayTasksCount: number;
  todayOverdueCount: number;
  employeeCount: number;
  submittedReportsCount: number;
  pendingReviewCount: number;
  currentMemberName?: string;
  isDark?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeNav,
  onNavChange,
  projectCount = 3,
  todayTasksCount = 14,
  todayOverdueCount = 2,
  employeeCount = 10,
  submittedReportsCount = 6,
  pendingReviewCount = 2,
  currentMemberName = 'Nguyễn Văn An',
  isDark = true,
}) => {
  const navTabs: {
    id: ActiveNavTab;
    label: string;
    sublabel: string;
    icon: React.ReactNode;
    badgeContent: React.ReactNode;
    activeColor: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard Dự Án',
      sublabel: 'Tổng quan & Sprint Analytics',
      icon: <Layers className="w-4 h-4" />,
      badgeContent: (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-900/60 text-blue-300 border border-blue-800/80">
          {projectCount} Dự Án
        </span>
      ),
      activeColor: 'from-blue-600 to-indigo-600 text-white shadow-blue-500/25',
    },
    {
      id: 'today',
      label: 'Công Việc Hôm Nay',
      sublabel: 'Live Ops 8.0h & Cảnh báo',
      icon: <CalendarClock className="w-4 h-4" />,
      badgeContent:
        todayOverdueCount > 0 ? (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            {todayOverdueCount} Trễ
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
            {todayTasksCount} Task
          </span>
        ),
      activeColor: 'from-emerald-600 to-teal-600 text-white shadow-emerald-500/25',
    },
    {
      id: 'team',
      label: 'Quản Lý Đội Ngũ',
      sublabel: 'Điều hành & 4 Biểu đồ tải',
      icon: <Users className="w-4 h-4" />,
      badgeContent: (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-900/60 text-sky-300 border border-sky-800/80">
          {employeeCount} Nhân sự
        </span>
      ),
      activeColor: 'from-sky-600 to-blue-700 text-white shadow-sky-500/25',
    },
    {
      id: 'reports',
      label: 'Hộp Thư Báo Cáo Ngày',
      sublabel: 'PM Duyệt & Chỉ đạo 8.0h',
      icon: <Inbox className="w-4 h-4" />,
      badgeContent: (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-950 text-purple-300 border border-purple-800 flex items-center gap-1">
          {pendingReviewCount > 0 && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          )}
          {submittedReportsCount}/{employeeCount} Nộp
        </span>
      ),
      activeColor: 'from-purple-600 to-indigo-700 text-white shadow-purple-500/25',
    },
    {
      id: 'member',
      label: 'Báo Cáo Thành Viên',
      sublabel: 'Radar KPI & Nộp Daily',
      icon: <UserCheck className="w-4 h-4" />,
      badgeContent: (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-900/60 text-indigo-300 border border-indigo-800/80 max-w-[110px] truncate block">
          {currentMemberName}
        </span>
      ),
      activeColor: 'from-indigo-600 to-violet-600 text-white shadow-indigo-500/25',
    },
  ];

  return (
    <nav
      id="main-app-navbar"
      className={`w-full border-b transition-colors shadow-sm ${
        isDark ? 'bg-[#090f1d] border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Horizontal scrollable row for responsive navigation tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 no-scrollbar">
          {navTabs.map((tab) => {
            const isActive = activeNav === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => onNavChange(tab.id)}
                className={`flex-1 min-w-[200px] sm:min-w-[210px] p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between group ${
                  isActive
                    ? isDark
                      ? 'bg-slate-800/95 border-blue-500 shadow-md shadow-blue-500/10'
                      : 'bg-blue-50/80 border-blue-500 shadow-md shadow-blue-500/10'
                    : isDark
                    ? 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                    : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-100 hover:border-slate-300 text-slate-600 hover:text-slate-900'
                }`}
              >
                {/* Top: Icon + Label + Badge */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                        isActive
                          ? `bg-gradient-to-br ${tab.activeColor} shadow-sm`
                          : isDark
                          ? 'bg-slate-800 text-slate-400 group-hover:text-white'
                          : 'bg-slate-200 text-slate-600 group-hover:text-slate-900'
                      }`}
                    >
                      {tab.icon}
                    </div>
                    <span
                      className={`text-xs font-black tracking-tight ${
                        isActive
                          ? isDark
                            ? 'text-white'
                            : 'text-blue-900'
                          : isDark
                          ? 'text-slate-300 group-hover:text-white'
                          : 'text-slate-700 group-hover:text-slate-900'
                      }`}
                    >
                      {tab.label}
                    </span>
                  </div>

                  <div>{tab.badgeContent}</div>
                </div>

                {/* Bottom: Sublabel */}
                <p
                  className={`text-[10px] font-medium pl-9 truncate ${
                    isActive
                      ? isDark
                        ? 'text-blue-300'
                        : 'text-blue-700'
                      : 'text-slate-400'
                  }`}
                >
                  {tab.sublabel}
                </p>

                {/* Active Underline Glow */}
                {isActive && (
                  <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-400 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
