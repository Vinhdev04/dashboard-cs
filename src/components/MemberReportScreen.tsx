import React, { useState, useMemo, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import {
  Users,
  Search,
  Filter,
  Download,
  Printer,
  FileSpreadsheet,
  ArrowUpDown,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  Briefcase,
  Layers,
  Activity,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  LayoutGrid,
  List,
  Eye,
  ArrowLeft,
  X,
  Sparkles,
  Phone,
  Mail,
  Calendar,
  CheckSquare,
  BarChart2,
  PieChart,
  User,
  FolderKanban,
  Zap,
  Target,
  FileText,
  Flame,
  Award,
  ChevronDown,
  ArrowUpRight,
  Inbox,
  Bell,
  Send,
  MessageSquare,
  Check,
  RotateCcw,
} from 'lucide-react';
import { Employee, Task, Project, Sprint, CompanyKPIConfig, DailyWorkReport } from '../types';
import { UserAvatar } from './UserAvatar';
import { INITIAL_DAILY_REPORTS } from '../data/mockDailyReports';
import { DailyReportModal } from './DailyReportModal';
import { ReviewDailyReportModal } from './ReviewDailyReportModal';
import {
  downloadMemberExcel,
  downloadMemberCSV,
  downloadIndividualMemberExcel,
} from '../utils/exportReports';

interface MemberReportScreenProps {
  employees: Employee[];
  tasks: Task[];
  projects?: Project[];
  sprints?: Sprint[];
  companyKPIConfig: CompanyKPIConfig;
  onBackToDashboard?: () => void;
  isDark?: boolean;
  activeScreen?: 'manager_overview' | 'manager_reports' | 'member_detail';
  onNavigateScreen?: (screen: 'manager_overview' | 'manager_reports' | 'member_detail') => void;
  selectedMemberId?: string;
  onSelectMemberId?: (id: string) => void;
  dailyReports?: DailyWorkReport[];
  onUpdateDailyReports?: (reports: DailyWorkReport[]) => void;
}

export const MemberReportScreen: React.FC<MemberReportScreenProps> = ({
  employees = [],
  tasks = [],
  projects = [],
  sprints = [],
  companyKPIConfig,
  onBackToDashboard,
  isDark = true,
  activeScreen,
  onNavigateScreen,
  selectedMemberId: propSelectedMemberId,
  onSelectMemberId,
  dailyReports: propDailyReports,
  onUpdateDailyReports,
}) => {
  // Navigation: 'manager' (Quản lý) or 'member' (Cá nhân Member)
  const [viewMode, setViewMode] = useState<'manager' | 'member'>(() => {
    if (activeScreen === 'member_detail') return 'member';
    return 'manager';
  });
  
  // Manager sub-tabs: 'overview' (Biểu đồ & Ma trận nhân lực) or 'reports' (Hộp thư báo cáo ngày)
  const [managerSubTab, setManagerSubTab] = useState<'overview' | 'reports'>(() => {
    if (activeScreen === 'manager_reports') return 'reports';
    return 'overview';
  });

  // Selected employee for Member View
  const [selectedMemberId, setSelectedMemberId] = useState<string>(() => {
    if (propSelectedMemberId) return propSelectedMemberId;
    return employees.length > 0 ? employees[0].id : '';
  });

  // Sync with activeScreen prop if passed
  useEffect(() => {
    if (!activeScreen) return;
    if (activeScreen === 'manager_overview') {
      setViewMode('manager');
      setManagerSubTab('overview');
    } else if (activeScreen === 'manager_reports') {
      setViewMode('manager');
      setManagerSubTab('reports');
    } else if (activeScreen === 'member_detail') {
      setViewMode('member');
    }
  }, [activeScreen]);

  // Sync selectedMemberId prop if changed from outside
  useEffect(() => {
    if (propSelectedMemberId && propSelectedMemberId !== selectedMemberId) {
      setSelectedMemberId(propSelectedMemberId);
    }
  }, [propSelectedMemberId]);

  // Manager View States
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [kpiStatusFilter, setKpiStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('tasks_desc');
  const [displayLayout, setDisplayLayout] = useState<'table' | 'grid'>('table');
  const [quickViewEmployee, setQuickViewEmployee] = useState<Employee | null>(null);

  // Daily Work Reports State
  const [dailyReports, setDailyReports] = useState<DailyWorkReport[]>(() => {
    try {
      const saved = localStorage.getItem('company_daily_work_reports_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading daily reports', e);
    }
    return INITIAL_DAILY_REPORTS;
  });

  // Daily Report Modals & Filters
  const [isDailyReportModalOpen, setIsDailyReportModalOpen] = useState(false);
  const [reportToEdit, setReportToEdit] = useState<DailyWorkReport | null>(null);
  const [selectedReportForReview, setSelectedReportForReview] = useState<DailyWorkReport | null>(null);
  const [reportDateFilter, setReportDateFilter] = useState<'all' | 'today'>('today');
  const [reportDeptFilter, setReportDeptFilter] = useState('ALL');
  const [reportStatusFilter, setReportStatusFilter] = useState<'all' | 'submitted' | 'reviewed' | 'needs_clarification'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Member View Inner Filters
  const [memberTaskSearch, setMemberTaskSearch] = useState('');
  const [memberProjectFilter, setMemberProjectFilter] = useState('all');
  const [memberSprintFilter, setMemberSprintFilter] = useState('all');
  const [memberTypeFilter, setMemberTypeFilter] = useState('all');
  const [memberStatusFilter, setMemberStatusFilter] = useState('all');

  // Chart Canvas Refs - Member View
  const projectChartRef = useRef<HTMLCanvasElement | null>(null);
  const typeChartRef = useRef<HTMLCanvasElement | null>(null);
  const workloadChartRef = useRef<HTMLCanvasElement | null>(null);
  const kpiRadarChartRef = useRef<HTMLCanvasElement | null>(null);

  const projectChartInstance = useRef<Chart | null>(null);
  const typeChartInstance = useRef<Chart | null>(null);
  const workloadChartInstance = useRef<Chart | null>(null);
  const kpiRadarChartInstance = useRef<Chart | null>(null);

  // Chart Canvas Refs - Manager View (Executive Charts)
  const mgrWorkloadChartRef = useRef<HTMLCanvasElement | null>(null);
  const mgrDeptQualityChartRef = useRef<HTMLCanvasElement | null>(null);
  const mgrTopContributorsChartRef = useRef<HTMLCanvasElement | null>(null);
  const mgrDailyReportChartRef = useRef<HTMLCanvasElement | null>(null);

  const mgrWorkloadChartInstance = useRef<Chart | null>(null);
  const mgrDeptQualityChartInstance = useRef<Chart | null>(null);
  const mgrTopContributorsChartInstance = useRef<Chart | null>(null);
  const mgrDailyReportChartInstance = useRef<Chart | null>(null);

  const targetOverdue = companyKPIConfig?.maxOverdueRate ?? 5.0;
  const targetBug = companyKPIConfig?.maxBugRate ?? 8.0;
  const targetRework = companyKPIConfig?.maxReworkRate ?? 5.0;

  // Currently Active Employee for Member View
  const currentMember = useMemo(() => {
    return employees.find((e) => e.id === selectedMemberId) || employees[0] || null;
  }, [employees, selectedMemberId]);

  // Tasks belonging to the selected member
  const currentMemberTasks = useMemo(() => {
    if (!currentMember) return [];
    return tasks.filter(
      (t) =>
        t.assigneeId === currentMember.id ||
        (t.assigneeName && t.assigneeName.toLowerCase().includes(currentMember.name.toLowerCase()))
    );
  }, [currentMember, tasks]);

  // Projects associated with the selected member
  const currentMemberProjects = useMemo(() => {
    if (!currentMember) return [];
    const memberProjectIds = new Set(currentMemberTasks.map((t) => t.projectId).filter(Boolean));
    const directProjects = projects.filter(
      (p) => memberProjectIds.has(p.id) || memberProjectIds.has(p.code) || p.pmName === currentMember.name
    );
    if (directProjects.length > 0) return directProjects;
    // Fallback if projects not tagged explicitly
    return projects.slice(0, 3);
  }, [currentMember, currentMemberTasks, projects]);

  // Sprints associated with the selected member
  const currentMemberSprints = useMemo(() => {
    if (!currentMember) return [];
    const memberSprintNames = new Set(currentMemberTasks.map((t) => t.sprintName).filter(Boolean));
    const matchingSprints = sprints.filter((s) => {
      if (memberSprintNames.has(s.name)) return true;
      if (s.sprintTasks && s.sprintTasks.some((st) => st.assigneeName === currentMember.name)) return true;
      return false;
    });
    if (matchingSprints.length > 0) return matchingSprints;
    // Fallback to active sprints
    return sprints.slice(0, 3);
  }, [currentMember, currentMemberTasks, sprints]);

  // Member Tasks Filtered
  const filteredMemberTasks = useMemo(() => {
    return currentMemberTasks.filter((t) => {
      const matchSearch =
        !memberTaskSearch ||
        t.title.toLowerCase().includes(memberTaskSearch.toLowerCase()) ||
        t.code.toLowerCase().includes(memberTaskSearch.toLowerCase());
      const matchProj = memberProjectFilter === 'all' || t.projectId === memberProjectFilter || t.projectName === memberProjectFilter;
      const matchSprint = memberSprintFilter === 'all' || t.sprintName === memberSprintFilter;
      const matchType = memberTypeFilter === 'all' || t.type === memberTypeFilter;
      const matchStatus =
        memberStatusFilter === 'all'
          ? true
          : memberStatusFilter === 'overdue'
          ? t.isOverdueToday || (t.delayDays && t.delayDays > 0)
          : t.status === memberStatusFilter;

      return matchSearch && matchProj && matchSprint && matchType && matchStatus;
    });
  }, [currentMemberTasks, memberTaskSearch, memberProjectFilter, memberSprintFilter, memberTypeFilter, memberStatusFilter]);

  // Departments list for Manager view
  const departments = useMemo(() => {
    return ['ALL', ...Array.from(new Set(employees.map((e) => e.department)))];
  }, [employees]);

  // Manager Filtered & Sorted Employees
  const filteredEmployees = useMemo(() => {
    let result = employees.filter((emp) => {
      const q = searchKeyword.toLowerCase();
      const matchSearch =
        emp.name.toLowerCase().includes(q) ||
        emp.code.toLowerCase().includes(q) ||
        emp.role.toLowerCase().includes(q) ||
        (emp.email && emp.email.toLowerCase().includes(q));

      const matchDept = selectedDept === 'ALL' || emp.department === selectedDept;

      let matchKPI = true;
      if (kpiStatusFilter === 'excellent') {
        matchKPI = emp.overdueRate <= targetOverdue && emp.bugRate <= targetBug && emp.reworkRate <= targetRework;
      } else if (kpiStatusFilter === 'overdue_exceeded') {
        matchKPI = emp.overdueRate > targetOverdue;
      } else if (kpiStatusFilter === 'bug_exceeded') {
        matchKPI = emp.bugRate > targetBug;
      } else if (kpiStatusFilter === 'rework_exceeded') {
        matchKPI = emp.reworkRate > targetRework;
      } else if (kpiStatusFilter === 'overload') {
        matchKPI = emp.allocatedHoursToday >= 7.5 || emp.remainingHoursToday <= 0.5;
      } else if (kpiStatusFilter === 'optimal') {
        matchKPI = emp.allocatedHoursToday >= 6.0 && emp.allocatedHoursToday < 7.5;
      } else if (kpiStatusFilter === 'available') {
        matchKPI = emp.allocatedHoursToday < 6.0;
      }

      return matchSearch && matchDept && matchKPI;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case 'tasks_desc':
          return (b.totalTasks || 0) - (a.totalTasks || 0);
        case 'tasks_asc':
          return (a.totalTasks || 0) - (b.totalTasks || 0);
        case 'hours_desc':
          return (b.totalHours || 0) - (a.totalHours || 0);
        case 'hours_asc':
          return (a.totalHours || 0) - (b.totalHours || 0);
        case 'overdue_desc':
          return b.overdueRate - a.overdueRate;
        case 'bug_desc':
          return b.bugRate - a.bugRate;
        case 'rework_desc':
          return b.reworkRate - a.reworkRate;
        case 'name_asc':
          return a.name.localeCompare(b.name, 'vi');
        default:
          return 0;
      }
    });

    return result;
  }, [employees, searchKeyword, selectedDept, kpiStatusFilter, sortBy, targetOverdue, targetBug, targetRework]);

  // Overall Manager Summary Stats
  const totalEmployees = employees.length;
  const totalTasks = employees.reduce((sum, e) => sum + (e.totalTasks || 0), 0);
  const totalHours = employees.reduce((sum, e) => sum + (e.totalHours || 0), 0);

  const avgOverdueRate = useMemo(() => {
    if (totalEmployees === 0) return 0;
    return Number((employees.reduce((sum, e) => sum + e.overdueRate, 0) / totalEmployees).toFixed(1));
  }, [employees, totalEmployees]);

  const avgBugRate = useMemo(() => {
    if (totalEmployees === 0) return 0;
    return Number((employees.reduce((sum, e) => sum + e.bugRate, 0) / totalEmployees).toFixed(1));
  }, [employees, totalEmployees]);

  const avgReworkRate = useMemo(() => {
    if (totalEmployees === 0) return 0;
    return Number((employees.reduce((sum, e) => sum + e.reworkRate, 0) / totalEmployees).toFixed(1));
  }, [employees, totalEmployees]);

  const overloadedCount = useMemo(() => {
    return employees.filter((e) => e.allocatedHoursToday >= 7.5 || e.remainingHoursToday <= 0.5).length;
  }, [employees]);

  const balancedCount = useMemo(() => {
    return employees.filter((e) => e.allocatedHoursToday >= 6.0 && e.allocatedHoursToday < 7.5).length;
  }, [employees]);

  const underUtilizedCount = useMemo(() => {
    return employees.filter((e) => e.allocatedHoursToday < 6.0).length;
  }, [employees]);

  // --- RENDER CHARTS FOR CURRENT MEMBER ---
  useEffect(() => {
    if (viewMode !== 'member' || !currentMember) return;

    // Cleanup existing charts
    if (projectChartInstance.current) projectChartInstance.current.destroy();
    if (typeChartInstance.current) typeChartInstance.current.destroy();
    if (workloadChartInstance.current) workloadChartInstance.current.destroy();
    if (kpiRadarChartInstance.current) kpiRadarChartInstance.current.destroy();

    const textColor = isDark ? '#94a3b8' : '#475569';
    const gridColor = isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.8)';

    // 1. PROJECT TIME ALLOCATION CHART (Doughnut)
    if (projectChartRef.current) {
      const projectHoursMap: Record<string, number> = {};
      currentMemberTasks.forEach((t) => {
        const name = t.projectName || 'Dự án khác';
        projectHoursMap[name] = (projectHoursMap[name] || 0) + (t.actualHours || t.estimatedHours || 4);
      });

      const labels = Object.keys(projectHoursMap).length > 0 ? Object.keys(projectHoursMap) : ['Dự án V-Pay', 'ERP Vinatex', 'Cổng Hải Quan'];
      const dataValues = Object.keys(projectHoursMap).length > 0 ? Object.values(projectHoursMap) : [45, 30, 25];

      projectChartInstance.current = new Chart(projectChartRef.current, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [
            {
              data: dataValues,
              backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'],
              borderWidth: 2,
              borderColor: isDark ? '#0f172a' : '#ffffff',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: textColor, font: { size: 11 }, boxWidth: 12 },
            },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.label}: ${ctx.raw} giờ`,
              },
            },
          },
          cutout: '62%',
        },
      });
    }

    // 2. TASK TYPE BREAKDOWN CHART (Doughnut)
    if (typeChartRef.current) {
      const typeCounts: Record<string, number> = { feature: 0, bug: 0, rework: 0, cr: 0, maintenance: 0 };
      currentMemberTasks.forEach((t) => {
        if (typeCounts[t.type] !== undefined) typeCounts[t.type]++;
        else typeCounts.feature++;
      });

      const labels = ['Tính Năng (Feature)', 'Lỗi (Bug)', 'Làm Lại (Rework)', 'Thay Đổi (CR)', 'Bảo Trì'];
      const dataValues = [
        typeCounts.feature || (currentMember.totalTasks > 0 ? Math.round(currentMember.totalTasks * 0.6) : 18),
        typeCounts.bug || currentMember.bugTasksCount || 2,
        typeCounts.rework || currentMember.reworkTasksCount || 1,
        typeCounts.cr || 3,
        typeCounts.maintenance || 2,
      ];

      typeChartInstance.current = new Chart(typeChartRef.current, {
        type: 'pie',
        data: {
          labels,
          datasets: [
            {
              data: dataValues,
              backgroundColor: ['#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', '#10b981'],
              borderWidth: 2,
              borderColor: isDark ? '#0f172a' : '#ffffff',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: textColor, font: { size: 11 }, boxWidth: 12 },
            },
          },
        },
      });
    }

    // 3. DAILY WORKLOAD VS 8.0H QUOTA CHART (Bar)
    if (workloadChartRef.current) {
      const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6 (Hôm nay)', 'Thứ 7'];
      const actualHours = [7.5, 8.0, 7.8, 8.2, currentMember.allocatedHoursToday || 7.5, 3.0];
      const quotaHours = [8.0, 8.0, 8.0, 8.0, 8.0, 8.0];

      workloadChartInstance.current = new Chart(workloadChartRef.current, {
        type: 'bar',
        data: {
          labels: days,
          datasets: [
            {
              label: 'Giờ Thực Tế Đã Phân Bổ (h)',
              data: actualHours,
              backgroundColor: actualHours.map((h) => (h > 8.0 ? '#ef4444' : h >= 7.0 ? '#3b82f6' : '#10b981')),
              borderRadius: 6,
            },
            {
              type: 'line',
              label: 'Định Mức Chuẩn Công Ty (8.0h)',
              data: quotaHours,
              borderColor: '#f59e0b',
              borderWidth: 2,
              borderDash: [5, 5],
              pointRadius: 3,
              fill: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { grid: { display: false }, ticks: { color: textColor, font: { size: 11 } } },
            y: {
              min: 0,
              max: 10,
              grid: { color: gridColor },
              ticks: { color: textColor, font: { size: 11 }, stepSize: 2 },
            },
          },
          plugins: {
            legend: {
              position: 'top',
              labels: { color: textColor, font: { size: 11 }, boxWidth: 12 },
            },
          },
        },
      });
    }

    // 4. KPI COMPLIANCE RADAR / BAR CHART
    if (kpiRadarChartRef.current) {
      kpiRadarChartInstance.current = new Chart(kpiRadarChartRef.current, {
        type: 'bar',
        data: {
          labels: ['Tỷ Lệ Trễ Hạn (%)', 'Tỷ Lệ Bug (%)', 'Tỷ Lệ Rework (%)'],
          datasets: [
            {
              label: 'Chỉ Số Cá Nhân',
              data: [currentMember.overdueRate, currentMember.bugRate, currentMember.reworkRate],
              backgroundColor: [
                currentMember.overdueRate > targetOverdue ? '#ef4444' : '#10b981',
                currentMember.bugRate > targetBug ? '#ef4444' : '#10b981',
                currentMember.reworkRate > targetRework ? '#ef4444' : '#10b981',
              ],
              borderRadius: 6,
            },
            {
              label: 'Giới Hạn Tối Đa KPI 2026',
              data: [targetOverdue, targetBug, targetRework],
              backgroundColor: 'rgba(245, 158, 11, 0.3)',
              borderColor: '#f59e0b',
              borderWidth: 1.5,
              borderRadius: 6,
            },
          ],
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              grid: { color: gridColor },
              ticks: { color: textColor, callback: (val) => `${val}%` },
            },
            y: {
              grid: { display: false },
              ticks: { color: textColor, font: { weight: 'bold' } },
            },
          },
          plugins: {
            legend: {
              position: 'top',
              labels: { color: textColor, font: { size: 11 }, boxWidth: 12 },
            },
          },
        },
      });
    }

    return () => {
      if (projectChartInstance.current) projectChartInstance.current.destroy();
      if (typeChartInstance.current) typeChartInstance.current.destroy();
      if (workloadChartInstance.current) workloadChartInstance.current.destroy();
      if (kpiRadarChartInstance.current) kpiRadarChartInstance.current.destroy();
    };
  }, [viewMode, currentMember, currentMemberTasks, targetOverdue, targetBug, targetRework, isDark]);

  // --- RENDER CHARTS FOR MANAGER (EXECUTIVE CHARTS) ---
  useEffect(() => {
    if (viewMode !== 'manager' || managerSubTab !== 'overview') return;

    // Cleanup existing manager charts
    if (mgrWorkloadChartInstance.current) mgrWorkloadChartInstance.current.destroy();
    if (mgrDeptQualityChartInstance.current) mgrDeptQualityChartInstance.current.destroy();
    if (mgrTopContributorsChartInstance.current) mgrTopContributorsChartInstance.current.destroy();
    if (mgrDailyReportChartInstance.current) mgrDailyReportChartInstance.current.destroy();

    const textColor = isDark ? '#94a3b8' : '#475569';
    const gridColor = isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.8)';

    // 1. TEAM WORKLOAD DISTRIBUTION (Doughnut)
    if (mgrWorkloadChartRef.current) {
      mgrWorkloadChartInstance.current = new Chart(mgrWorkloadChartRef.current, {
        type: 'doughnut',
        data: {
          labels: [
            `Quá tải (≥7.5h): ${overloadedCount} người`,
            `Cân bằng (6-7.4h): ${balancedCount} người`,
            `Dư giờ (<6.0h): ${underUtilizedCount} người`,
          ],
          datasets: [
            {
              data: [overloadedCount, balancedCount, underUtilizedCount],
              backgroundColor: ['#ef4444', '#10b981', '#3b82f6'],
              borderWidth: 2,
              borderColor: isDark ? '#0f172a' : '#ffffff',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: textColor, font: { size: 11 }, boxWidth: 12 },
            },
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const total = (overloadedCount + balancedCount + underUtilizedCount) || 1;
                  const val = Number(ctx.raw) || 0;
                  const pct = ((val / total) * 100).toFixed(1);
                  return ` ${ctx.label}: ${val} (${pct}%)`;
                },
              },
            },
          },
          cutout: '65%',
        },
      });
    }

    // 2. DEPARTMENT QUALITY COMPARISON (Grouped Bar)
    if (mgrDeptQualityChartRef.current) {
      const depts = departments.filter((d) => d !== 'ALL');
      const deptOverdue: number[] = [];
      const deptBug: number[] = [];
      const deptRework: number[] = [];

      depts.forEach((dept) => {
        const deptEmps = employees.filter((e) => e.department === dept);
        const count = deptEmps.length || 1;
        deptOverdue.push(Number((deptEmps.reduce((s, e) => s + e.overdueRate, 0) / count).toFixed(1)));
        deptBug.push(Number((deptEmps.reduce((s, e) => s + e.bugRate, 0) / count).toFixed(1)));
        deptRework.push(Number((deptEmps.reduce((s, e) => s + e.reworkRate, 0) / count).toFixed(1)));
      });

      mgrDeptQualityChartInstance.current = new Chart(mgrDeptQualityChartRef.current, {
        type: 'bar',
        data: {
          labels: depts,
          datasets: [
            {
              label: `Trễ Hạn % (Trần: ≤${targetOverdue}%)`,
              data: deptOverdue,
              backgroundColor: '#ef4444',
              borderRadius: 4,
            },
            {
              label: `Bug % (Trần: ≤${targetBug}%)`,
              data: deptBug,
              backgroundColor: '#f59e0b',
              borderRadius: 4,
            },
            {
              label: `Rework % (Trần: ≤${targetRework}%)`,
              data: deptRework,
              backgroundColor: '#8b5cf6',
              borderRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: textColor, font: { size: 10 } },
            },
            y: {
              grid: { color: gridColor },
              ticks: { color: textColor, font: { size: 10 }, callback: (val) => `${val}%` },
            },
          },
          plugins: {
            legend: {
              position: 'top',
              labels: { color: textColor, font: { size: 10 }, boxWidth: 10 },
            },
          },
        },
      });
    }

    // 3. TOP CONTRIBUTORS PRODUCTIVITY (Horizontal Bar)
    if (mgrTopContributorsChartRef.current) {
      const sortedEmps = [...employees].sort((a, b) => (b.totalHours || 0) - (a.totalHours || 0)).slice(0, 6);
      const labels = sortedEmps.map((e) => `${e.name} (${e.code})`);
      const hoursData = sortedEmps.map((e) => e.totalHours || 0);
      const tasksData = sortedEmps.map((e) => e.totalTasks || 0);

      mgrTopContributorsChartInstance.current = new Chart(mgrTopContributorsChartRef.current, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Tổng Giờ Công Tích Lũy (h)',
              data: hoursData,
              backgroundColor: '#3b82f6',
              borderRadius: 4,
            },
            {
              label: 'Số Tasks Đã Giao',
              data: tasksData,
              backgroundColor: '#10b981',
              borderRadius: 4,
            },
          ],
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              grid: { color: gridColor },
              ticks: { color: textColor, font: { size: 10 } },
            },
            y: {
              grid: { display: false },
              ticks: { color: textColor, font: { size: 10, weight: 'bold' } },
            },
          },
          plugins: {
            legend: {
              position: 'top',
              labels: { color: textColor, font: { size: 10 }, boxWidth: 10 },
            },
          },
        },
      });
    }

    // 4. DAILY REPORTS SUBMISSION RATE (Doughnut)
    if (mgrDailyReportChartRef.current) {
      const todayStr = new Date().toISOString().slice(0, 10);
      const todayReps = dailyReports.filter((r) => r.date === todayStr);
      const submittedIds = new Set(todayReps.map((r) => r.employeeId));
      
      const reviewedCount = todayReps.filter((r) => r.status === 'reviewed').length;
      const pendingCount = todayReps.filter((r) => r.status === 'submitted').length;
      const clarificationCount = todayReps.filter((r) => r.status === 'needs_clarification').length;
      const notSubmittedCount = Math.max(0, employees.length - submittedIds.size);

      mgrDailyReportChartInstance.current = new Chart(mgrDailyReportChartRef.current, {
        type: 'doughnut',
        data: {
          labels: [
            `Đã Duyệt (${reviewedCount})`,
            `Chờ Duyệt (${pendingCount})`,
            `Cần Giải Trình (${clarificationCount})`,
            `Chưa Nộp Báo Cáo (${notSubmittedCount})`,
          ],
          datasets: [
            {
              data: [reviewedCount, pendingCount, clarificationCount, notSubmittedCount],
              backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#64748b'],
              borderWidth: 2,
              borderColor: isDark ? '#0f172a' : '#ffffff',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: textColor, font: { size: 10 }, boxWidth: 10 },
            },
          },
          cutout: '65%',
        },
      });
    }

    return () => {
      if (mgrWorkloadChartInstance.current) mgrWorkloadChartInstance.current.destroy();
      if (mgrDeptQualityChartInstance.current) mgrDeptQualityChartInstance.current.destroy();
      if (mgrTopContributorsChartInstance.current) mgrTopContributorsChartInstance.current.destroy();
      if (mgrDailyReportChartInstance.current) mgrDailyReportChartInstance.current.destroy();
    };
  }, [
    viewMode,
    managerSubTab,
    employees,
    departments,
    overloadedCount,
    balancedCount,
    underUtilizedCount,
    targetOverdue,
    targetBug,
    targetRework,
    dailyReports,
    isDark,
  ]);

  // Handle Saving Daily Report (from Member)
  const handleSaveDailyReport = (report: DailyWorkReport) => {
    setDailyReports((prev) => {
      const existingIndex = prev.findIndex(
        (r) => r.id === report.id || (r.employeeId === report.employeeId && r.date === report.date)
      );
      let updated: DailyWorkReport[];
      if (existingIndex >= 0) {
        updated = [...prev];
        updated[existingIndex] = report;
      } else {
        updated = [report, ...prev];
      }
      try {
        localStorage.setItem('company_daily_work_reports_v2', JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving daily reports', e);
      }
      return updated;
    });

    setToastMessage(`Đã gửi báo cáo công việc ngày ${report.date} cho Quản lý thành công!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handle Updating Report Status (by Manager)
  const handleUpdateReportStatus = (
    reportId: string,
    newStatus: 'reviewed' | 'needs_clarification',
    managerFeedback: string
  ) => {
    setDailyReports((prev) => {
      const updated = prev.map((r) => {
        if (r.id === reportId) {
          return {
            ...r,
            status: newStatus,
            managerFeedback,
            reviewedBy: 'Quản Lý Dự Án (PM)',
            reviewedAt: new Date().toLocaleString('vi-VN', { hour12: false }),
          };
        }
        return r;
      });
      try {
        localStorage.setItem('company_daily_work_reports_v2', JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving daily reports', e);
      }
      return updated;
    });

    setToastMessage(
      newStatus === 'reviewed'
        ? 'Đã duyệt báo cáo công việc và gửi phản hồi cho thành viên!'
        : 'Đã gửi yêu cầu giải trình thêm cho thành viên!'
    );
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSendReminder = (empName: string) => {
    setToastMessage(`Đã gửi thông báo nhắc nhở nộp báo cáo công việc 8.0h hôm nay đến ${empName}!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const todayDateStr = new Date().toISOString().slice(0, 10);
  const todaySubmittedReports = useMemo(() => {
    return dailyReports.filter((r) => r.date === todayDateStr);
  }, [dailyReports, todayDateStr]);

  const todaySubmittedEmpIds = useMemo(() => {
    return new Set(todaySubmittedReports.map((r) => r.employeeId));
  }, [todaySubmittedReports]);

  const todayMissingEmployees = useMemo(() => {
    return employees.filter((e) => !todaySubmittedEmpIds.has(e.id));
  }, [employees, todaySubmittedEmpIds]);

  const filteredDailyReports = useMemo(() => {
    return dailyReports.filter((r) => {
      const matchDate = reportDateFilter === 'all' ? true : r.date === todayDateStr;
      const matchDept = reportDeptFilter === 'ALL' ? true : r.department === reportDeptFilter;
      const matchStatus = reportStatusFilter === 'all' ? true : r.status === reportStatusFilter;
      return matchDate && matchDept && matchStatus;
    });
  }, [dailyReports, reportDateFilter, todayDateStr, reportDeptFilter, reportStatusFilter]);

  const currentMemberTodayReport = useMemo(() => {
    if (!currentMember) return null;
    return dailyReports.find((r) => r.employeeId === currentMember.id && r.date === todayDateStr) || null;
  }, [dailyReports, currentMember, todayDateStr]);

  const currentMemberPastReports = useMemo(() => {
    if (!currentMember) return [];
    return dailyReports.filter((r) => r.employeeId === currentMember.id && r.date !== todayDateStr);
  }, [dailyReports, currentMember, todayDateStr]);

  const handlePrint = () => {
    window.print();
  };

  const handleSwitchToMember = (empId: string) => {
    setSelectedMemberId(empId);
    if (onSelectMemberId) onSelectMemberId(empId);
    setViewMode('member');
    if (onNavigateScreen) onNavigateScreen('member_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* 1. TOP HEADER & ROLE SWITCHER BAR */}
      <div
        className={`p-5 rounded-2xl border shadow-lg flex flex-wrap items-center justify-between gap-4 transition-colors ${
          isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center gap-3">
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className={`p-2 rounded-xl border transition flex items-center gap-1.5 text-xs font-bold ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
              title="Quay lại Dashboard Tổng quan Dự án & Sprint"
            >
              <ArrowLeft className="w-4 h-4 text-blue-400" />
              <span>Dashboard</span>
            </button>
          )}

          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black flex items-center justify-center shadow-md shadow-blue-500/20">
            <Users className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1
                className={`text-base sm:text-lg font-black uppercase tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                {viewMode === 'manager' ? 'BÁO CÁO MEMBER - MÀN HÌNH QUẢN LÝ' : 'BÁO CÁO MEMBER - CHI TIẾT CÁ NHÂN'}
              </h1>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800/80 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                KPI Chuẩn {companyKPIConfig?.year || 2026}
              </span>
            </div>
            <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {viewMode === 'manager'
                ? `Giám sát phân bổ tải trọng 8h/ngày, chỉ số trễ, bug, rework của ${totalEmployees} nhân sự`
                : `Hồ sơ chi tiết, số liệu KPI, biểu đồ năng suất, dự án, sprint và toàn bộ task của ${currentMember?.name || 'thành viên'}`}
            </p>
          </div>
        </div>

        {/* Action Controls & Big Role Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          {/* ROLE SWITCHER PILL */}
          <div
            className={`p-1 rounded-xl border flex items-center gap-1 ${
              isDark ? 'bg-slate-900/90 border-slate-700' : 'bg-slate-100 border-slate-300'
            }`}
          >
            <button
              onClick={() => {
                setViewMode('manager');
                if (onNavigateScreen) onNavigateScreen(managerSubTab === 'overview' ? 'manager_overview' : 'manager_reports');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'manager'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : isDark
                  ? 'text-slate-300 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Dành Cho Quản Lý</span>
            </button>
            <button
              onClick={() => {
                setViewMode('member');
                if (onNavigateScreen) onNavigateScreen('member_detail');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'member'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : isDark
                  ? 'text-slate-300 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Dành Cho Member</span>
            </button>
          </div>

          {/* Export & Print buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
              }`}
              title="In Báo Cáo A4 / Xuất PDF"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">In Báo Cáo A4</span>
            </button>

            {viewMode === 'manager' ? (
              <>
                <button
                  onClick={() => downloadMemberExcel(filteredEmployees, tasks, companyKPIConfig)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition"
                  title="Xuất File Báo Cáo Excel Chuẩn Doanh Nghiệp (.xls)"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Xuất Excel Đội Ngũ</span>
                </button>
                <button
                  onClick={() => downloadMemberCSV(filteredEmployees, tasks, companyKPIConfig)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
                    isDark
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  }`}
                  title="Xuất Báo Cáo Dạng CSV"
                >
                  <Download className="w-4 h-4 text-slate-400" />
                  <span>CSV</span>
                </button>
              </>
            ) : (
              currentMember && (
                <button
                  onClick={() =>
                    downloadIndividualMemberExcel(
                      currentMember,
                      currentMemberTasks,
                      currentMemberProjects,
                      currentMemberSprints,
                      companyKPIConfig
                    )
                  }
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition"
                  title="Xuất Toàn Bộ Số Liệu, Dự Án, Sprint & Task Của Member Này Ra File Excel"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Xuất Excel Cá Nhân</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CHẾ ĐỘ 1: MÀN HÌNH DÀNH CHO QUẢN LÝ (MANAGER VIEW)                     */}
      {/* ========================================================================= */}
      {viewMode === 'manager' && (
        <div className="space-y-6">
          {/* MANAGER SUB-NAVIGATION TABS */}
          <div
            className={`p-3 rounded-2xl border flex flex-wrap items-center justify-between gap-4 transition ${
              isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div
              className={`p-1 rounded-xl border flex items-center gap-1 ${
                isDark ? 'bg-slate-900/90 border-slate-700' : 'bg-slate-100 border-slate-300'
              }`}
            >
              <button
                onClick={() => {
                  setManagerSubTab('overview');
                  if (onNavigateScreen) onNavigateScreen('manager_overview');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                  managerSubTab === 'overview'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : isDark
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart2 className="w-4 h-4" />
                <span>Tổng Quan & 4 Biểu Đồ Quản Lý</span>
              </button>

              <button
                onClick={() => {
                  setManagerSubTab('reports');
                  if (onNavigateScreen) onNavigateScreen('manager_reports');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition relative ${
                  managerSubTab === 'reports'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : isDark
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Inbox className="w-4 h-4" />
                <span>Hộp Thư Báo Cáo Ngày</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-950 text-purple-300 border border-purple-800">
                  {todaySubmittedReports.length}/{employees.length} Đã nộp
                </span>
                {todaySubmittedReports.filter((r) => r.status === 'submitted').length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>Hôm nay: <strong className="text-slate-200">{todayDateStr}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Định mức: <strong className="text-slate-200">8.0h/ngày</strong></span>
              </div>
            </div>
          </div>

          {/* TAB 1: OVERVIEW & EXECUTIVE CHARTS & EMPLOYEE MATRIX */}
          {managerSubTab === 'overview' && (
            <>
              {/* 2.1 EXECUTIVE KPI CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Tổng số lực lượng */}
                <div
                  className={`p-4 rounded-2xl border relative overflow-hidden transition shadow-sm ${
                    isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Lực Lượng</span>
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black">{totalEmployees}</span>
                    <span className="text-xs text-slate-400 font-semibold">Thành viên</span>
                  </div>
                  <p className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    100% Nhân sự đang active trong các dự án
                  </p>
                </div>

                {/* Card 2: Năng suất & Giờ công */}
                <div
                  className={`p-4 rounded-2xl border relative overflow-hidden transition shadow-sm ${
                    isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Khối Lượng & Năng Suất</span>
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                      <Briefcase className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black">{totalTasks}</span>
                    <span className="text-xs text-slate-400 font-semibold">Tasks / {totalHours}h tích lũy</span>
                  </div>
                  <p className="text-[11px] text-indigo-400 mt-2 font-semibold">
                    Định mức trung bình: {(totalTasks / (totalEmployees || 1)).toFixed(1)} tasks/nhân sự
                  </p>
                </div>

                {/* Card 3: Chất lượng bình quân vs KPI */}
                <div
                  className={`p-4 rounded-2xl border relative overflow-hidden transition shadow-sm ${
                    isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chất Lượng Bình Quân</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold">Trễ Hạn</div>
                      <div
                        className={`text-base font-black ${
                          avgOverdueRate <= targetOverdue ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {avgOverdueRate}%
                      </div>
                    </div>
                    <div className="w-px h-6 bg-slate-700" />
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold">Bug</div>
                      <div
                        className={`text-base font-black ${
                          avgBugRate <= targetBug ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {avgBugRate}%
                      </div>
                    </div>
                    <div className="w-px h-6 bg-slate-700" />
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold">Rework</div>
                      <div
                        className={`text-base font-black ${
                          avgReworkRate <= targetRework ? 'text-emerald-400' : 'text-purple-400'
                        }`}
                      >
                        {avgReworkRate}%
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2">
                    Mục tiêu KPI 2026: Trễ &le;{targetOverdue}%, Bug &le;{targetBug}%, Rework &le;{targetRework}%
                  </p>
                </div>

                {/* Card 4: Tải trọng 8h/ngày hôm nay */}
                <div
                  className={`p-4 rounded-2xl border relative overflow-hidden transition shadow-sm ${
                    isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cân Bằng Tải Trọng 8h</span>
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <span className="px-2 py-1 rounded bg-rose-950/70 border border-rose-800 text-rose-300">
                      {overloadedCount} Quá tải (&ge;7.5h)
                    </span>
                    <span className="px-2 py-1 rounded bg-emerald-950/70 border border-emerald-800 text-emerald-300">
                      {balancedCount} Chuẩn
                    </span>
                    <span className="px-2 py-1 rounded bg-blue-950/70 border border-blue-800 text-blue-300">
                      {underUtilizedCount} Trống
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2">
                    Quy chuẩn công ty: 8.0h/ngày, giữ ít nhất 0.5h - 1.5h đệm an toàn
                  </p>
                </div>
              </div>

              {/* 2.1.B KHỐI 4 BIỂU ĐỒ PHÂN TÍCH QUẢN LÝ (EXECUTIVE CHARTS) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-blue-400" />
                    <h2 className="text-sm font-black uppercase tracking-wider text-slate-200">
                      Hệ Thống Biểu Đồ Quản Lý & Tải Trọng Đội Ngũ (Executive Visual Analytics)
                    </h2>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                    Phân tích tương quan 8.0h công, chất lượng dự án và năng suất toàn đội
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Chart 1: Phân bổ tải trọng 8.0h toàn đội */}
                  <div className="p-4 rounded-2xl border border-slate-800 bg-[#0f172a] shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          Phân Bổ Tải Trọng 8.0h/Ngày Toàn Đội
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Tỷ lệ nhân sự quá tải (≥7.5h), cân bằng (6-7.4h) và dư giờ (&lt;6h)
                        </p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">
                        {totalEmployees} Nhân Sự
                      </span>
                    </div>
                    <div className="h-[240px] relative">
                      <canvas ref={mgrWorkloadChartRef} />
                    </div>
                  </div>

                  {/* Chart 2: So sánh chất lượng các phòng ban */}
                  <div className="p-4 rounded-2xl border border-slate-800 bg-[#0f172a] shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5 text-rose-400" />
                          So Sánh Chỉ Số Chất Lượng Theo Phòng Ban
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Tỷ lệ trễ hạn, tỷ lệ bug, và tỷ lệ làm lại (rework) đối chiếu trần KPI 2026
                        </p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                        Trần KPI 2026
                      </span>
                    </div>
                    <div className="h-[240px] relative">
                      <canvas ref={mgrDeptQualityChartRef} />
                    </div>
                  </div>

                  {/* Chart 3: Top nhân sự đóng góp giờ công & task */}
                  <div className="p-4 rounded-2xl border border-slate-800 bg-[#0f172a] shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5 text-indigo-400" />
                          Top 6 Nhân Sự Năng Suất & Giờ Công Cao Nhất
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Tích lũy giờ làm việc thực tế và tổng số nhiệm vụ đang đảm nhiệm
                        </p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 font-bold">
                        Top Contributors
                      </span>
                    </div>
                    <div className="h-[240px] relative">
                      <canvas ref={mgrTopContributorsChartRef} />
                    </div>
                  </div>

                  {/* Chart 4: Tình hình nộp báo cáo công việc ngày hôm nay */}
                  <div className="p-4 rounded-2xl border border-slate-800 bg-[#0f172a] shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <Inbox className="w-3.5 h-3.5 text-purple-400" />
                          Tiến Độ Nộp Báo Cáo Công Việc Trong Ngày
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Tình trạng kiểm duyệt và chấp hành quy định nộp báo cáo 8.0h hôm nay
                        </p>
                      </div>
                      <button
                        onClick={() => setManagerSubTab('reports')}
                        className="text-[10px] px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/40 font-bold transition flex items-center gap-1"
                      >
                        <span>Vào Hộp Thư Báo Cáo</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="h-[240px] relative">
                      <canvas ref={mgrDailyReportChartRef} />
                    </div>
                  </div>
                </div>
              </div>

          {/* 2.2 FILTER & SEARCH TOOLBAR */}
          <div
            className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 transition shadow-sm ${
              isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm theo tên nhân viên, mã NV (NV001), vị trí, email..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-slate-200 placeholder-slate-500'
                    : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400'
                }`}
              />
              {searchKeyword && (
                <button
                  onClick={() => setSearchKeyword('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Department Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 hidden sm:inline">Phòng Ban:</span>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'
                }`}
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept === 'ALL' ? 'Tất Cả Phòng Ban' : dept}
                  </option>
                ))}
              </select>
            </div>

            {/* KPI Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 hidden sm:inline">Trạng Thái KPI:</span>
              <select
                value={kpiStatusFilter}
                onChange={(e) => setKpiStatusFilter(e.target.value)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'
                }`}
              >
                <option value="all">Tất Cả Nhân Sự</option>
                <option value="excellent">✓ Đạt Chuẩn Xuất Sắc</option>
                <option value="overdue_exceeded">⚠️ Vượt Ngưỡng Trễ (&gt;{targetOverdue}%)</option>
                <option value="bug_exceeded">⚠️ Vượt Ngưỡng Bug (&gt;{targetBug}%)</option>
                <option value="rework_exceeded">⚠️ Vượt Ngưỡng Rework (&gt;{targetRework}%)</option>
                <option value="overload">🚨 Đang Quá Tải Giờ (&ge;7.5h)</option>
                <option value="optimal">⚖️ Tải Trọng Cân Bằng (6h-7.5h)</option>
                <option value="available">🟢 Còn Nhiều Giờ Trống (&lt;6h)</option>
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'
                }`}
              >
                <option value="tasks_desc">Số Task Giảm Dần</option>
                <option value="tasks_asc">Số Task Tăng Dần</option>
                <option value="hours_desc">Giờ Công Giảm Dần</option>
                <option value="overdue_desc">Tỷ Lệ Trễ Cao Nhất</option>
                <option value="bug_desc">Tỷ Lệ Bug Cao Nhất</option>
                <option value="rework_desc">Tỷ Lệ Rework Cao Nhất</option>
                <option value="name_asc">Tên Nhân Viên A-Z</option>
              </select>
            </div>

            {/* Layout switch: Table / Grid */}
            <div
              className={`flex items-center p-1 rounded-xl border ${
                isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-300'
              }`}
            >
              <button
                onClick={() => setDisplayLayout('table')}
                className={`p-1.5 rounded-lg transition ${
                  displayLayout === 'table' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Xem dạng bảng ma trận chi tiết"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDisplayLayout('grid')}
                className={`p-1.5 rounded-lg transition ${
                  displayLayout === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Xem dạng thẻ hồ sơ trực quan"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 2.3 EMPLOYEES LIST / TABLE */}
          {displayLayout === 'table' ? (
            <div
              className={`rounded-2xl border overflow-hidden shadow-lg transition ${
                isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className={`border-b ${isDark ? 'bg-slate-900/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                      <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[11px]">Nhân Viên & Vị Trí</th>
                      <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[11px]">Phòng Ban</th>
                      <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[11px] text-right">Khối Lượng</th>
                      <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[11px]">Tải Trọng 8h Hôm Nay</th>
                      <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[11px] text-center">Trễ Hạn (&le;{targetOverdue}%)</th>
                      <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[11px] text-center">Bug (&le;{targetBug}%)</th>
                      <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[11px] text-center">Rework (&le;{targetRework}%)</th>
                      <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[11px] text-center">Đánh Giá Năng Suất</th>
                      <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[11px] text-center">Hành Động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredEmployees.length > 0 ? (
                      filteredEmployees.map((emp) => {
                        const isOverdueExceeded = emp.overdueRate > targetOverdue;
                        const isBugExceeded = emp.bugRate > targetBug;
                        const isReworkExceeded = emp.reworkRate > targetRework;
                        const isOverloaded = emp.allocatedHoursToday >= 7.5 || emp.remainingHoursToday <= 0.5;

                        return (
                          <tr
                            key={emp.id}
                            className={`transition hover:bg-blue-600/5 ${
                              isDark ? 'border-slate-800/60 text-slate-300' : 'border-slate-200 text-slate-700'
                            }`}
                          >
                            {/* Member Identity */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <UserAvatar name={emp.name} avatar={emp.avatar} className="w-9 h-9 rounded-xl border border-slate-700" />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-100 hover:text-blue-400 transition cursor-pointer" onClick={() => handleSwitchToMember(emp.id)}>
                                      {emp.name}
                                    </span>
                                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                      {emp.code}
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-slate-400">{emp.role}</span>
                                </div>
                              </div>
                            </td>

                            {/* Department */}
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800/80 text-slate-300 border border-slate-700">
                                {emp.department}
                              </span>
                            </td>

                            {/* Task volume & hours */}
                            <td className="py-3 px-4 text-right">
                              <div className="font-bold text-slate-200">{emp.totalTasks} Tasks</div>
                              <div className="text-[10px] text-slate-400">{emp.totalHours} Giờ Công</div>
                            </td>

                            {/* Today 8h Workload */}
                            <td className="py-3 px-4 min-w-[160px]">
                              <div className="flex items-center justify-between text-[11px] mb-1">
                                <span className={`font-bold ${isOverloaded ? 'text-rose-400' : 'text-slate-300'}`}>
                                  {emp.allocatedHoursToday}h / 8.0h
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {emp.remainingHoursToday > 0 ? `Đệm: ${emp.remainingHoursToday}h` : '⚠️ 0h đệm'}
                                </span>
                              </div>
                              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    isOverloaded
                                      ? 'bg-rose-500'
                                      : emp.allocatedHoursToday >= 6.0
                                      ? 'bg-emerald-500'
                                      : 'bg-blue-500'
                                  }`}
                                  style={{ width: `${Math.min(100, (emp.allocatedHoursToday / 8.0) * 100)}%` }}
                                />
                              </div>
                            </td>

                            {/* Overdue Rate */}
                            <td className="py-3 px-4 text-center">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                                  isOverdueExceeded
                                    ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                                    : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                                }`}
                              >
                                {isOverdueExceeded && <AlertTriangle className="w-3 h-3 text-rose-400" />}
                                {emp.overdueRate}%
                              </span>
                            </td>

                            {/* Bug Rate */}
                            <td className="py-3 px-4 text-center">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                                  isBugExceeded
                                    ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                                    : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                                }`}
                              >
                                {isBugExceeded && <AlertCircle className="w-3 h-3 text-amber-400" />}
                                {emp.bugRate}%
                              </span>
                            </td>

                            {/* Rework Rate */}
                            <td className="py-3 px-4 text-center">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                                  isReworkExceeded
                                    ? 'bg-purple-950/80 text-purple-300 border-purple-800'
                                    : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                                }`}
                              >
                                {emp.reworkRate}%
                              </span>
                            </td>

                            {/* Performance Rating */}
                            <td className="py-3 px-4 text-center">
                              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-950/60 border border-blue-800/80 text-blue-300">
                                {emp.performanceRating || 'Xuất Sắc'}
                              </span>
                            </td>

                            {/* Actions: View as member or Quick drawer */}
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleSwitchToMember(emp.id)}
                                  className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] transition shadow-sm flex items-center gap-1"
                                  title="Xem Màn Hình Chi Tiết Cá Nhân Member Này"
                                >
                                  <User className="w-3 h-3" />
                                  <span>Vào Member View</span>
                                </button>
                                <button
                                  onClick={() => setQuickViewEmployee(emp)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                                  title="Xem Nhanh Tasks"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-slate-400">
                          Không tìm thấy nhân viên nào phù hợp với bộ lọc hiện tại.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEmployees.map((emp) => {
                const isOverdueExceeded = emp.overdueRate > targetOverdue;
                const isBugExceeded = emp.bugRate > targetBug;
                const isReworkExceeded = emp.reworkRate > targetRework;
                const isOverloaded = emp.allocatedHoursToday >= 7.5 || emp.remainingHoursToday <= 0.5;

                return (
                  <div
                    key={emp.id}
                    className={`p-4 rounded-2xl border transition hover:border-blue-500/50 shadow-md ${
                      isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={emp.name} avatar={emp.avatar} className="w-11 h-11 rounded-xl border border-slate-700" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-sm text-slate-100 hover:text-blue-400 cursor-pointer" onClick={() => handleSwitchToMember(emp.id)}>
                              {emp.name}
                            </h3>
                            <span className="text-[10px] font-mono px-1 rounded bg-slate-800 text-slate-400">{emp.code}</span>
                          </div>
                          <p className="text-xs text-slate-400">{emp.role}</p>
                          <span className="text-[10px] text-blue-400 font-semibold">{emp.department}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950/80 border border-blue-800 text-blue-300">
                        {emp.performanceRating || 'Xuất Sắc'}
                      </span>
                    </div>

                    {/* Today 8h Workload */}
                    <div className="mb-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                      <div className="flex items-center justify-between text-xs mb-1 font-semibold">
                        <span className="text-slate-400">Tải trọng hôm nay:</span>
                        <span className={isOverloaded ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                          {emp.allocatedHoursToday}h / 8.0h ({emp.remainingHoursToday > 0 ? `Đệm ${emp.remainingHoursToday}h` : '0h đệm'})
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isOverloaded ? 'bg-rose-500' : emp.allocatedHoursToday >= 6.0 ? 'bg-emerald-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${Math.min(100, (emp.allocatedHoursToday / 8.0) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* KPI Meters */}
                    <div className="grid grid-cols-3 gap-2 mb-3 text-center text-xs">
                      <div className={`p-2 rounded-xl border ${isOverdueExceeded ? 'bg-rose-950/40 border-rose-800/80 text-rose-300' : 'bg-slate-900/60 border-slate-800 text-slate-300'}`}>
                        <div className="text-[10px] text-slate-400 font-medium">Trễ Hạn</div>
                        <div className="font-bold">{emp.overdueRate}%</div>
                      </div>
                      <div className={`p-2 rounded-xl border ${isBugExceeded ? 'bg-amber-950/40 border-amber-800/80 text-amber-300' : 'bg-slate-900/60 border-slate-800 text-slate-300'}`}>
                        <div className="text-[10px] text-slate-400 font-medium">Bug</div>
                        <div className="font-bold">{emp.bugRate}%</div>
                      </div>
                      <div className={`p-2 rounded-xl border ${isReworkExceeded ? 'bg-purple-950/40 border-purple-800/80 text-purple-300' : 'bg-slate-900/60 border-slate-800 text-slate-300'}`}>
                        <div className="text-[10px] text-slate-400 font-medium">Rework</div>
                        <div className="font-bold">{emp.reworkRate}%</div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
                      <button
                        onClick={() => handleSwitchToMember(emp.id)}
                        className="flex-1 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Mở Màn Hình Member</span>
                      </button>
                      <button
                        onClick={() => setQuickViewEmployee(emp)}
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                        title="Xem nhanh chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
            </>
          )}

          {/* TAB 2: DAILY WORK REPORTS INBOX (HỘP THƯ BÁO CÁO CÔNG VIỆC NGÀY CHO QUẢN LÝ) */}
          {managerSubTab === 'reports' && (
            <div className="space-y-6 animate-in fade-in">
              {/* STATS OVERVIEW CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Tỷ lệ nộp hôm nay */}
                <div
                  className={`p-4 rounded-2xl border shadow-sm ${
                    isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tỷ Lệ Nộp Hôm Nay</span>
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                      <Inbox className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-purple-400">
                      {todaySubmittedReports.length}/{employees.length}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      ({((todaySubmittedReports.length / (employees.length || 1)) * 100).toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div
                      className="bg-purple-500 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (todaySubmittedReports.length / (employees.length || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Card 2: Chờ PM duyệt */}
                <div
                  className={`p-4 rounded-2xl border shadow-sm ${
                    isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chờ Duyệt & Phản Hồi</span>
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-amber-400">
                      {todaySubmittedReports.filter((r) => r.status === 'submitted').length}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">Báo cáo mới</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Cần Quản lý đọc, chỉ đạo và phản hồi tháo gỡ khó khăn
                  </p>
                </div>

                {/* Card 3: Đã duyệt hoàn tất */}
                <div
                  className={`p-4 rounded-2xl border shadow-sm ${
                    isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đã Duyệt & Chỉ Đạo</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-emerald-400">
                      {todaySubmittedReports.filter((r) => r.status === 'reviewed').length}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">Đã ghi nhận</span>
                  </div>
                  <p className="text-[11px] text-emerald-400 mt-2 font-semibold">
                    Đã gửi phản hồi trực tiếp cho thành viên
                  </p>
                </div>

                {/* Card 4: Tổng giờ thực tế đã log */}
                <div
                  className={`p-4 rounded-2xl border shadow-sm ${
                    isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Giờ Công Đã Log Hôm Nay</span>
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                      <Briefcase className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-blue-400">
                      {todaySubmittedReports.reduce((sum, r) => sum + r.totalHoursWorked, 0).toFixed(1)}h
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">
                      / {(todaySubmittedReports.length * 8).toFixed(0)}h chuẩn
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Bình quân: {(todaySubmittedReports.reduce((sum, r) => sum + r.totalHoursWorked, 0) / (todaySubmittedReports.length || 1)).toFixed(1)}h/người
                  </p>
                </div>
              </div>

              {/* LIST OF EMPLOYEES NOT SUBMITTED YET (DANH SÁCH CHƯA NỘP HÔM NAY) */}
              {todayMissingEmployees.length > 0 ? (
                <div className="p-5 rounded-2xl border border-amber-800/80 bg-amber-950/20 backdrop-blur-sm space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-400 animate-pulse" />
                      <div>
                        <h3 className="text-sm font-bold text-amber-200">
                          Còn {todayMissingEmployees.length} Nhân Sự Chưa Nộp Báo Cáo Công Việc Hôm Nay
                        </h3>
                        <p className="text-xs text-amber-300/80">
                          Quy chuẩn công ty: Mọi thành viên bắt buộc nộp báo cáo kết quả trước 17:30 để PM tổng hợp tiến độ sprint
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        todayMissingEmployees.forEach((e) => handleSendReminder(e.name));
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>Nhắc Nhở Toàn Bộ ({todayMissingEmployees.length} người)</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
                    {todayMissingEmployees.map((emp) => (
                      <div
                        key={emp.id}
                        className="p-3 rounded-xl border border-amber-900/60 bg-[#0f172a]/90 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <UserAvatar name={emp.name} avatar={emp.avatar} className="w-8 h-8 rounded-lg flex-shrink-0" />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-200 block truncate">{emp.name}</span>
                            <span className="text-[10px] text-slate-400 block truncate">{emp.department} &bull; {emp.code}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleSendReminder(emp.name)}
                          className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[10px] font-bold transition flex items-center gap-1 flex-shrink-0"
                          title="Gửi thông báo nhắc nhở"
                        >
                          <Send className="w-3 h-3" />
                          <span>Nhắc</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl border border-emerald-800/80 bg-emerald-950/20 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-300">
                    100% Thành viên trong toàn bộ đội ngũ đã hoàn thành nộp báo cáo công việc 8.0h cho ngày hôm nay!
                  </span>
                </div>
              )}

              {/* REPORT FILTER TOOLBAR */}
              <div
                className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 transition shadow-sm ${
                  isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex flex-wrap items-center gap-3">
                  {/* Filter Date */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">Thời Gian:</span>
                    <select
                      value={reportDateFilter}
                      onChange={(e) => setReportDateFilter(e.target.value as 'today' | 'all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'
                      }`}
                    >
                      <option value="today">Hôm Nay ({todayDateStr})</option>
                      <option value="all">Tất Cả Lịch Sử Báo Cáo</option>
                    </select>
                  </div>

                  {/* Filter Dept */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">Phòng Ban:</span>
                    <select
                      value={reportDeptFilter}
                      onChange={(e) => setReportDeptFilter(e.target.value)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'
                      }`}
                    >
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept === 'ALL' ? 'Tất Cả Phòng Ban' : dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filter Status */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">Trạng Thái:</span>
                    <select
                      value={reportStatusFilter}
                      onChange={(e) => setReportStatusFilter(e.target.value as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'
                      }`}
                    >
                      <option value="all">Tất Cả Trạng Thái</option>
                      <option value="submitted">Chờ Duyệt (Mới nộp)</option>
                      <option value="reviewed">Đã Duyệt & Có Phản Hồi</option>
                      <option value="needs_clarification">Cần Giải Trình Thêm</option>
                    </select>
                  </div>
                </div>

                <div className="text-xs text-slate-400 font-bold">
                  Tìm thấy <strong className="text-purple-400">{filteredDailyReports.length}</strong> báo cáo
                </div>
              </div>

              {/* LIST OF DETAILED DAILY REPORTS */}
              <div className="space-y-4">
                {filteredDailyReports.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl border border-slate-800 bg-[#0f172a] text-slate-400">
                    <FileText className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                    <p className="font-bold text-sm">Không có báo cáo công việc nào khớp với bộ lọc</p>
                  </div>
                ) : (
                  filteredDailyReports.map((report) => {
                    const emp = employees.find((e) => e.id === report.employeeId);
                    const statusBadge =
                      report.status === 'reviewed' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Đã Duyệt
                        </span>
                      ) : report.status === 'needs_clarification' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Cần Giải Trình
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1">
                          <Clock className="w-3 h-3 animate-spin" />
                          Chờ Duyệt
                        </span>
                      );

                    return (
                      <div
                        key={report.id}
                        className={`p-5 rounded-2xl border transition shadow-md ${
                          isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
                        }`}
                      >
                        {/* Header card */}
                        <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-800">
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              name={report.employeeName}
                              avatar={emp?.avatar}
                              className="w-10 h-10 rounded-xl"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-slate-100">{report.employeeName}</h4>
                                <span className="text-xs text-slate-400 font-mono">({report.employeeCode})</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-bold">
                                  {report.department}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-3">
                                <span>Ngày báo cáo: <strong className="text-slate-200">{report.date}</strong></span>
                                <span>&bull;</span>
                                <span>Gửi lúc: <strong className="text-slate-200">{report.submittedAt}</strong></span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {statusBadge}
                            <button
                              onClick={() => setSelectedReportForReview(report)}
                              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-purple-600/20"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Xem & Duyệt Báo Cáo</span>
                            </button>
                          </div>
                        </div>

                        {/* Summary metrics pills */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3 text-center">
                          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                            <span className="text-[10px] text-slate-400 block font-bold">Giờ Làm Việc</span>
                            <span className="text-sm font-black text-blue-400">
                              {report.totalHoursWorked}h / 8.0h ({((report.totalHoursWorked / 8) * 100).toFixed(0)}%)
                            </span>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                            <span className="text-[10px] text-slate-400 block font-bold">Tự Đánh Giá</span>
                            <span className="text-sm font-black text-emerald-400">
                              {report.selfAssessmentRating}% Hoàn Thành
                            </span>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                            <span className="text-[10px] text-slate-400 block font-bold">Tasks Cập Nhật</span>
                            <span className="text-sm font-black text-indigo-400">
                              {report.tasksCompleted.length} Nhiệm vụ
                            </span>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                            <span className="text-[10px] text-slate-400 block font-bold">Khó Khăn (Blocker)</span>
                            <span className={`text-sm font-black ${report.blockers ? 'text-amber-400' : 'text-slate-400'}`}>
                              {report.blockers ? 'Có Vướng Mắc' : 'Không Có'}
                            </span>
                          </div>
                        </div>

                        {/* Report Content Body */}
                        <div className="space-y-2.5 text-xs">
                          {/* Done & In progress */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80">
                              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 mb-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Công Việc Đã Xong Trong Ngày:
                              </span>
                              <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                                {report.summaryWorkDone || 'Không có mô tả'}
                              </p>
                            </div>

                            <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80">
                              <span className="text-[11px] font-bold text-blue-400 flex items-center gap-1 mb-1">
                                <Clock className="w-3.5 h-3.5" />
                                Công Việc Đang Tiến Hành:
                              </span>
                              <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                                {report.inProgressWork || 'Đã hoàn thành toàn bộ công việc trong ngày'}
                              </p>
                            </div>
                          </div>

                          {/* Blockers alert box if exists */}
                          {report.blockers && (
                            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/70 text-amber-200">
                              <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                                Khó Khăn & Cần Quản Lý Hỗ Trợ:
                              </span>
                              <p className="leading-relaxed text-amber-100">{report.blockers}</p>
                            </div>
                          )}

                          {/* Manager Feedback if already reviewed */}
                          {report.managerFeedback && (
                            <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/70 text-purple-200">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[11px] font-bold text-purple-300 flex items-center gap-1.5">
                                  <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                                  Ý Kiến Chỉ Đạo Của Quản Lý ({report.reviewedBy || 'PM'}):
                                </span>
                                <span className="text-[10px] text-purple-400 font-medium">
                                  {report.reviewedAt}
                                </span>
                              </div>
                              <p className="leading-relaxed text-purple-100">{report.managerFeedback}</p>
                            </div>
                          )}
                        </div>

                        {/* Footer action to jump to member */}
                        <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/60 text-xs">
                          <button
                            onClick={() => handleSwitchToMember(report.employeeId)}
                            className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 transition"
                          >
                            <span>Xem toàn bộ thông số & lịch sử của {report.employeeName}</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CHẾ ĐỘ 2: MÀN HÌNH DÀNH CHO MEMBER (PERSONAL MEMBER VIEW)              */}
      {/* ========================================================================= */}
      {viewMode === 'member' && currentMember && (
        <div className="space-y-6">
          {/* 3.1 MEMBER SWITCHER & PROFILE BANNER */}
          <div
            className={`p-6 rounded-2xl border shadow-xl relative overflow-hidden transition ${
              isDark ? 'bg-gradient-to-r from-[#0f172a] via-[#131d38] to-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Profile details */}
              <div className="flex items-start sm:items-center gap-4">
                <div className="relative">
                  <UserAvatar
                    name={currentMember.name}
                    avatar={currentMember.avatar}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-indigo-500/50 shadow-lg object-cover"
                  />
                  <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900" title="Đang trực tuyến" />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h2 className="text-xl font-black text-white">{currentMember.name}</h2>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-950 border border-indigo-800 text-indigo-300 font-mono text-xs font-bold">
                      {currentMember.code}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      Xếp Loại: {currentMember.performanceRating || 'Xuất Sắc'} (Grade: {currentMember.kpiGrade || 'A+'})
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-slate-300 mb-2">{currentMember.role} &bull; <span className="text-blue-400">{currentMember.department}</span></p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      {currentMember.email || `${currentMember.code.toLowerCase()}@company.vn`}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      {currentMember.phone || '0988.123.456'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      Thời điểm báo cáo: Hôm nay ({new Date().toLocaleDateString('vi-VN')})
                    </span>
                  </div>
                </div>
              </div>

              {/* Fast Member Selector Dropdown & Switch to Manager */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700 min-w-[240px]">
                  <label className="text-[11px] font-bold text-slate-400 block mb-1.5">
                    Đổi Xem Thành Viên Khác:
                  </label>
                  <select
                    value={selectedMemberId}
                    onChange={(e) => {
                      setSelectedMemberId(e.target.value);
                      if (onSelectMemberId) onSelectMemberId(e.target.value);
                    }}
                    className="w-full px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        [{emp.code}] {emp.name} - {emp.role}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setReportToEdit(currentMemberTodayReport);
                      setIsDailyReportModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
                  >
                    <FileText className="w-4 h-4" />
                    <span>{currentMemberTodayReport ? 'Cập Nhật Báo Cáo' : 'Nộp Báo Cáo Ngày'}</span>
                    {currentMemberTodayReport && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    )}
                  </button>

                  <button
                    onClick={() => setViewMode('manager')}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <Users className="w-4 h-4 text-blue-400" />
                    <span>Về Màn Hình Quản Lý</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 3.2 DETAILED STATS & KPI SCOREBOARD FOR MEMBER */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Box 1: Tải Trọng Hôm Nay 8.0h */}
            <div
              className={`p-4 rounded-2xl border relative overflow-hidden transition shadow-sm ${
                isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tải Trọng 8.0h Hôm Nay</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black">{currentMember.allocatedHoursToday}h</span>
                <span className="text-xs text-slate-400">/ 8.0h định mức chuẩn</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden my-2">
                <div
                  className={`h-full rounded-full ${
                    currentMember.allocatedHoursToday >= 7.5
                      ? 'bg-rose-500'
                      : currentMember.allocatedHoursToday >= 6.0
                      ? 'bg-emerald-500'
                      : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(100, (currentMember.allocatedHoursToday / 8.0) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] font-semibold text-slate-300">
                {currentMember.remainingHoursToday > 0 ? (
                  <span className="text-emerald-400">✓ Còn {currentMember.remainingHoursToday}h đệm an toàn cho rủi ro</span>
                ) : (
                  <span className="text-rose-400">⚠️ 0.0h đệm an toàn, nguy cơ quá tải tiến độ</span>
                )}
              </p>
            </div>

            {/* Box 2: Task & Giờ Công */}
            <div
              className={`p-4 rounded-2xl border relative overflow-hidden transition shadow-sm ${
                isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Khối Lượng Tasks & Giờ</span>
                <Briefcase className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black">{currentMember.totalTasks}</span>
                <span className="text-xs text-slate-400">Tasks ({currentMember.totalHours}h tích lũy)</span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-[11px] font-semibold">
                <span className="text-emerald-400">
                  {currentMemberTasks.filter((t) => t.status === 'done').length} Hoàn thành
                </span>
                <span className="text-slate-500">&bull;</span>
                <span className="text-blue-400">
                  {currentMemberTasks.filter((t) => t.status === 'in_progress').length} Đang làm
                </span>
                <span className="text-slate-500">&bull;</span>
                <span className="text-amber-400">
                  {currentMemberTasks.filter((t) => t.isOverdueToday).length} Trễ
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Đóng góp cho {currentMemberProjects.length} Dự Án &bull; {currentMemberSprints.length} Sprint</p>
            </div>

            {/* Box 3: Chỉ Số Chất Lượng KPI */}
            <div
              className={`p-4 rounded-2xl border relative overflow-hidden transition shadow-sm ${
                isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chỉ Số Chất Lượng KPI</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="grid grid-cols-3 gap-1 text-center">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold">Trễ Hạn</div>
                  <div className={`text-base font-black ${currentMember.overdueRate <= targetOverdue ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {currentMember.overdueRate}%
                  </div>
                  <div className="text-[9px] text-slate-500">&le;{targetOverdue}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold">Bug</div>
                  <div className={`text-base font-black ${currentMember.bugRate <= targetBug ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {currentMember.bugRate}%
                  </div>
                  <div className="text-[9px] text-slate-500">&le;{targetBug}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold">Rework</div>
                  <div className={`text-base font-black ${currentMember.reworkRate <= targetRework ? 'text-emerald-400' : 'text-purple-400'}`}>
                    {currentMember.reworkRate}%
                  </div>
                  <div className="text-[9px] text-slate-500">&le;{targetRework}%</div>
                </div>
              </div>
              <p className="text-[10px] text-center text-slate-400 mt-1">
                {currentMember.overdueRate <= targetOverdue && currentMember.bugRate <= targetBug && currentMember.reworkRate <= targetRework
                  ? '✓ Toàn bộ chỉ số đều đạt chuẩn công ty'
                  : '⚠️ Cần tối ưu để đạt chuẩn hạn mức'}
              </p>
            </div>

            {/* Box 4: Độ Phủ Dự Án & Sprint */}
            <div
              className={`p-4 rounded-2xl border relative overflow-hidden transition shadow-sm ${
                isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Độ Phủ Dự Án & Sprint</span>
                <FolderKanban className="w-4 h-4 text-purple-400" />
              </div>
              <div className="flex items-baseline gap-3">
                <div>
                  <span className="text-2xl font-black text-white">{currentMemberProjects.length}</span>
                  <span className="text-xs text-slate-400 ml-1">Dự Án</span>
                </div>
                <div className="w-px h-6 bg-slate-700" />
                <div>
                  <span className="text-2xl font-black text-white">{currentMemberSprints.length}</span>
                  <span className="text-xs text-slate-400 ml-1">Sprint</span>
                </div>
              </div>
              <div className="mt-2 text-[11px] text-slate-300 font-semibold truncate">
                Dự án chính: {currentMemberProjects[0]?.name || 'App V-Pay 3.0'}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Sprint hiện tại: {currentMemberSprints[0]?.name || 'Sprint 28'}</p>
            </div>
          </div>

          {/* 3.3 INTERACTIVE CHARTS FOR MEMBER */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Phân Bổ Giờ Công Theo Dự Án */}
            <div
              className={`p-5 rounded-2xl border shadow-lg transition ${
                isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                    <PieChart className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">Phân Bổ Giờ Công Theo Dự Án</h3>
                    <p className="text-[11px] text-slate-400">Tỷ trọng thời gian member cống hiến cho từng sản phẩm</p>
                  </div>
                </div>
              </div>
              <div className="h-64 relative">
                <canvas ref={projectChartRef} />
              </div>
            </div>

            {/* Chart 2: Cơ Cấu Loại Công Việc (Feature / Bug / Rework / CR) */}
            <div
              className={`p-5 rounded-2xl border shadow-lg transition ${
                isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">Cơ Cấu Phân Loại Công Việc</h3>
                    <p className="text-[11px] text-slate-400">Tỷ lệ Feature, Bug, Rework, CR và Maintenance</p>
                  </div>
                </div>
              </div>
              <div className="h-64 relative">
                <canvas ref={typeChartRef} />
              </div>
            </div>

            {/* Chart 3: Tải Trọng & Giờ Làm Việc Các Ngày Trong Tuần */}
            <div
              className={`p-5 rounded-2xl border shadow-lg transition ${
                isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <BarChart2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">Tải Trọng Hàng Ngày vs Định Mức 8.0h</h3>
                    <p className="text-[11px] text-slate-400">Theo dõi tải trọng làm việc thực tế qua các ngày trong tuần</p>
                  </div>
                </div>
              </div>
              <div className="h-64 relative">
                <canvas ref={workloadChartRef} />
              </div>
            </div>

            {/* Chart 4: Đối Chiếu Chỉ Số KPI Cá Nhân vs Chuẩn Công Ty */}
            <div
              className={`p-5 rounded-2xl border shadow-lg transition ${
                isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">Đối Chiếu KPI Cá Nhân vs Hạn Mức Tối Đa</h3>
                    <p className="text-[11px] text-slate-400">Tỷ lệ Trễ, Bug, Rework so với ngưỡng cho phép 2026</p>
                  </div>
                </div>
              </div>
              <div className="h-64 relative">
                <canvas ref={kpiRadarChartRef} />
              </div>
            </div>
          </div>

          {/* 3.3.B NHẬT KÝ & BÁO CÁO CÔNG VIỆC HÀNG NGÀY (DAILY WORK REPORT & FEEDBACK) */}
          <div
            className={`p-6 rounded-2xl border shadow-xl transition space-y-4 ${
              isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
                    Nhật Ký & Báo Cáo Công Việc Hàng Ngày (Daily Standup & Feedback)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Báo cáo tiến độ hoàn thành các task, ghi nhận giờ công và nhận ý kiến chỉ đạo từ Quản Lý
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setReportToEdit(currentMemberTodayReport);
                  setIsDailyReportModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-indigo-600/30"
              >
                <Sparkles className="w-4 h-4" />
                <span>{currentMemberTodayReport ? 'Cập Nhật Báo Cáo Hôm Nay' : 'Nộp Báo Cáo Công Việc Hôm Nay'}</span>
              </button>
            </div>

            {/* PHIẾU BÁO CÁO CỦA HÔM NAY */}
            {currentMemberTodayReport ? (
              <div className="p-5 rounded-2xl border border-purple-900/60 bg-purple-950/20 backdrop-blur-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <h4 className="font-bold text-sm text-slate-100">
                      Báo Cáo Công Việc Hôm Nay ({todayDateStr}) Của Bạn Đã Được Ghi Nhận
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    {currentMemberTodayReport.status === 'reviewed' ? (
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Quản Lý Đã Duyệt & Phản Hồi
                      </span>
                    ) : currentMemberTodayReport.status === 'needs_clarification' ? (
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Quản Lý Yêu Cầu Giải Trình Thêm
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Đang Chờ Quản Lý Duyệt
                      </span>
                    )}

                    <button
                      onClick={() => {
                        setReportToEdit(currentMemberTodayReport);
                        setIsDailyReportModalOpen(true);
                      }}
                      className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition"
                    >
                      Chỉnh Sửa
                    </button>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold block">Giờ Làm Việc</span>
                    <span className="text-base font-black text-blue-400">
                      {currentMemberTodayReport.totalHoursWorked}h / 8.0h ({((currentMemberTodayReport.totalHoursWorked / 8) * 100).toFixed(0)}%)
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold block">Tự Đánh Giá</span>
                    <span className="text-base font-black text-emerald-400">
                      {currentMemberTodayReport.selfAssessmentRating}% Hoàn Thành
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold block">Gửi Lúc</span>
                    <span className="text-xs font-bold text-slate-300">
                      {currentMemberTodayReport.submittedAt}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold block">Tasks Đã Log</span>
                    <span className="text-base font-black text-indigo-400">
                      {currentMemberTodayReport.tasksCompleted.length} Nhiệm vụ
                    </span>
                  </div>
                </div>

                {/* Report Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 mb-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Công Việc Đã Hoàn Thành Hôm Nay:
                    </span>
                    <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                      {currentMemberTodayReport.summaryWorkDone}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[11px] font-bold text-blue-400 flex items-center gap-1.5 mb-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Công Việc Đang Tiến Hành / Dở Dang:
                    </span>
                    <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                      {currentMemberTodayReport.inProgressWork || 'Không có task dở dang.'}
                    </p>
                  </div>
                </div>

                {/* Blockers if any */}
                {currentMemberTodayReport.blockers && (
                  <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/80 text-xs">
                    <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      Khó Khăn Đã Nêu Cần Hỗ Trợ:
                    </span>
                    <p className="text-amber-100 leading-relaxed">{currentMemberTodayReport.blockers}</p>
                  </div>
                )}

                {/* MANAGER FEEDBACK HIGHLIGHT */}
                {currentMemberTodayReport.managerFeedback ? (
                  <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-800/80 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-purple-300 flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-purple-400" />
                        Ý Kiến Nhận Xét & Chỉ Đạo Từ Quản Lý ({currentMemberTodayReport.reviewedBy || 'PM'}):
                      </span>
                      <span className="text-[10px] text-purple-400 font-medium">
                        {currentMemberTodayReport.reviewedAt}
                      </span>
                    </div>
                    <p className="text-purple-100 leading-relaxed pl-5 italic font-medium">
                      "{currentMemberTodayReport.managerFeedback}"
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 text-xs text-slate-400 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span>Quản Lý đang xem xét báo cáo này và sẽ phản hồi chỉ đạo sớm cho bạn.</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-2xl border border-amber-800/80 bg-amber-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-amber-200">
                      Bạn Chưa Nộp Báo Cáo Công Việc Cho Ngày Hôm Nay ({todayDateStr})
                    </h4>
                    <p className="text-xs text-amber-300/80 mt-1 max-w-xl">
                      Hãy dành 3 phút để ghi nhận giờ làm việc thực tế (chuẩn 8.0h/ngày), cập nhật tiến độ các task và phản ánh ngay khó khăn nếu có để Quản Lý hỗ trợ kịp thời!
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setReportToEdit(null);
                    setIsDailyReportModalOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition flex items-center gap-2 shadow-lg shadow-amber-500/20 flex-shrink-0"
                >
                  <FileText className="w-4 h-4" />
                  <span>Nộp Báo Cáo Ngay</span>
                </button>
              </div>
            )}

            {/* LỊCH SỬ BÁO CÁO TRƯỚC ĐÓ */}
            {currentMemberPastReports.length > 0 && (
              <div className="pt-2">
                <span className="text-xs font-bold text-slate-400 block mb-2">
                  Lịch Sử Các Báo Cáo Trước Đó ({currentMemberPastReports.length}):
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentMemberPastReports.map((past) => (
                    <div
                      key={past.id}
                      className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 text-xs space-y-2 hover:border-slate-700 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">Ngày: {past.date}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                          Đã duyệt
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span>Giờ làm: <strong className="text-slate-200">{past.totalHoursWorked}h</strong></span>
                        <span>&bull;</span>
                        <span>Tự đánh giá: <strong className="text-slate-200">{past.selfAssessmentRating}%</strong></span>
                        <span>&bull;</span>
                        <span>Gửi lúc: {past.submittedAt}</span>
                      </div>
                      <p className="text-slate-300 line-clamp-2 text-[11px]">
                        {past.summaryWorkDone}
                      </p>
                      {past.managerFeedback && (
                        <div className="p-2 rounded-lg bg-purple-950/20 border border-purple-900/40 text-[10px] text-purple-200 italic">
                          PM nhận xét: "{past.managerFeedback}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3.4 PHÂN RÃ THEO DỰ ÁN CỦA MEMBER */}
          <div
            className={`p-5 rounded-2xl border shadow-lg transition ${
              isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                  <FolderKanban className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">
                    Danh Sách Dự Án {currentMember.name} Đang Tham Gia ({currentMemberProjects.length})
                  </h3>
                  <p className="text-[11px] text-slate-400">Thông tin tiến độ, vai trò và khối lượng đóng góp cho từng dự án</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentMemberProjects.map((p) => {
                const tasksInProject = currentMemberTasks.filter((t) => t.projectId === p.id || t.projectName === p.name);
                const completedInProject = tasksInProject.filter((t) => t.status === 'done').length;

                return (
                  <div
                    key={p.id}
                    className={`p-4 rounded-xl border transition hover:border-indigo-500/60 ${
                      isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                        {p.code}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          p.status === 'in_progress'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800'
                            : p.status === 'delayed'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {p.status === 'in_progress' ? 'Đang thực hiện' : p.status === 'delayed' ? 'Trễ tiến độ' : 'Hoàn thành'}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-slate-100 mb-1 line-clamp-1" title={p.name}>
                      {p.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 mb-3">{p.client}</p>

                    {/* Progress */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
                        <span className="text-slate-400">Tiến độ chung dự án:</span>
                        <span className="text-slate-200 font-bold">{p.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${p.progress}%` }} />
                      </div>
                    </div>

                    {/* Member tasks in this project */}
                    <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Tasks của {currentMember.name.split(' ').slice(-1)}:</span>
                      <span className="font-bold text-slate-200">
                        {completedInProject} / {tasksInProject.length || 3} Hoàn thành
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3.5 PHÂN RÃ THEO SPRINT CỦA MEMBER */}
          <div
            className={`p-5 rounded-2xl border shadow-lg transition ${
              isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">
                    Danh Sách Sprint Tham Gia ({currentMemberSprints.length})
                  </h3>
                  <p className="text-[11px] text-slate-400">Theo dõi chu kỳ Sprint, mục tiêu cam kết và vận tốc hoàn thành</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentMemberSprints.map((s) => (
                <div
                  key={s.id}
                  className={`p-4 rounded-xl border transition ${
                    isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-indigo-400">{s.name.split('-')[0]}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        s.status === 'in_progress'
                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                          : s.status === 'completed'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {s.status === 'in_progress' ? 'Đang Chạy' : s.status === 'completed' ? 'Đã Xong' : 'Kế Hoạch'}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-slate-200 mb-1 line-clamp-1">{s.name}</h4>
                  <p className="text-[11px] text-slate-400 mb-2">
                    Chu kỳ: {s.startDate} &rarr; {s.endDate}
                  </p>

                  {s.goal && (
                    <p className="text-[11px] text-slate-300 bg-slate-800/60 p-2 rounded-lg border border-slate-700/60 mb-3 italic">
                      Mục tiêu: {s.goal}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-400">Story Points:</span>
                    <span className="text-emerald-400 font-bold">
                      {s.completedPoints} / {s.committedPoints} SP ({s.progress}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1.5">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${s.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3.6 DANH SÁCH CHI TIẾT TẤT CẢ CÁC TASK CỦA MEMBER */}
          <div
            className={`p-5 rounded-2xl border shadow-lg transition ${
              isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">
                    Bảng Chi Tiết Toàn Bộ Task Của {currentMember.name} ({filteredMemberTasks.length}/{currentMemberTasks.length})
                  </h3>
                  <p className="text-[11px] text-slate-400">Phân loại Feature, Bug, Rework, CR, giờ Est vs Actual, Deadline</p>
                </div>
              </div>

              {/* Task search & fast filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[180px]">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm mã hoặc tên task..."
                    value={memberTaskSearch}
                    onChange={(e) => setMemberTaskSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <select
                  value={memberTypeFilter}
                  onChange={(e) => setMemberTypeFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 border border-slate-700 text-slate-200"
                >
                  <option value="all">Mọi Loại Task</option>
                  <option value="feature">Tính năng (Feature)</option>
                  <option value="bug">Lỗi (Bug)</option>
                  <option value="rework">Làm lại (Rework)</option>
                  <option value="cr">Yêu cầu thay đổi (CR)</option>
                  <option value="maintenance">Bảo trì</option>
                </select>

                <select
                  value={memberStatusFilter}
                  onChange={(e) => setMemberStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 border border-slate-700 text-slate-200"
                >
                  <option value="all">Mọi Trạng Thái</option>
                  <option value="done">Đã Hoàn Thành</option>
                  <option value="in_progress">Đang Thực Hiện</option>
                  <option value="todo">Cần Làm (To Do)</option>
                  <option value="overdue">⚠️ Đang Trễ Hạn</option>
                </select>
              </div>
            </div>

            {/* Tasks Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
                    <th className="py-3 px-3 font-bold uppercase text-[10px]">Mã Task</th>
                    <th className="py-3 px-3 font-bold uppercase text-[10px]">Tên Công Việc</th>
                    <th className="py-3 px-3 font-bold uppercase text-[10px]">Dự Án</th>
                    <th className="py-3 px-3 font-bold uppercase text-[10px]">Sprint</th>
                    <th className="py-3 px-3 font-bold uppercase text-[10px] text-center">Loại Task</th>
                    <th className="py-3 px-3 font-bold uppercase text-[10px] text-center">Độ Ưu Tiên</th>
                    <th className="py-3 px-3 font-bold uppercase text-[10px] text-right">Giờ Est / Act</th>
                    <th className="py-3 px-3 font-bold uppercase text-[10px]">Hạn Chót</th>
                    <th className="py-3 px-3 font-bold uppercase text-[10px] text-center">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredMemberTasks.length > 0 ? (
                    filteredMemberTasks.map((t) => {
                      const isOverdue = t.isOverdueToday || (t.delayDays && t.delayDays > 0);

                      return (
                        <tr key={t.id} className="hover:bg-slate-800/40 text-slate-300 transition">
                          <td className="py-2.5 px-3 font-mono font-bold text-blue-400">{t.code}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-200">
                            <div>{t.title}</div>
                            {t.delayReason && (
                              <div className="text-[10px] text-rose-400 mt-0.5 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Lý do: {t.delayReason}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-slate-300 font-medium">{t.projectName}</td>
                          <td className="py-2.5 px-3 text-slate-400">{t.sprintName || 'Sprint hiện tại'}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                t.type === 'feature'
                                  ? 'bg-blue-950 text-blue-300 border border-blue-800'
                                  : t.type === 'bug'
                                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                  : t.type === 'rework'
                                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                  : t.type === 'cr'
                                  ? 'bg-purple-950 text-purple-300 border border-purple-800'
                                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              }`}
                            >
                              {t.type}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                t.priority === 'urgent'
                                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                  : t.priority === 'high'
                                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {t.priority ? t.priority.toUpperCase() : 'MEDIUM'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-300">
                            {t.estimatedHours || 0}h / {t.actualHours || 0}h
                          </td>
                          <td className="py-2.5 px-3 text-slate-300 text-[11px] font-mono">{t.dueDate || 'Hôm nay'}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                t.status === 'done'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : isOverdue
                                  ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                                  : 'bg-blue-950 text-blue-300 border border-blue-800'
                              }`}
                            >
                              {t.status === 'done' ? '✓ Đã xong' : isOverdue ? '⚠️ Trễ hạn' : 'Đang làm'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        Thành viên này hiện không có task nào khớp với bộ lọc trên.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL QUICK VIEW DETAILS (Khi click nút xem nhanh)                     */}
      {/* ========================================================================= */}
      {quickViewEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div
            className={`w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${
              isDark ? 'bg-[#0f172a] border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserAvatar name={quickViewEmployee.name} avatar={quickViewEmployee.avatar} className="w-10 h-10 rounded-xl" />
                <div>
                  <h3 className="font-bold text-sm text-slate-100">{quickViewEmployee.name} ({quickViewEmployee.code})</h3>
                  <p className="text-xs text-slate-400">{quickViewEmployee.role} &bull; {quickViewEmployee.department}</p>
                </div>
              </div>
              <button
                onClick={() => setQuickViewEmployee(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Tổng Tasks</span>
                  <span className="text-base font-black text-slate-200">{quickViewEmployee.totalTasks}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Tổng Giờ</span>
                  <span className="text-base font-black text-slate-200">{quickViewEmployee.totalHours}h</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Tải Trọng Hôm Nay</span>
                  <span className="text-base font-black text-amber-400">{quickViewEmployee.allocatedHoursToday}h / 8h</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Đánh Giá</span>
                  <span className="text-sm font-black text-emerald-400">{quickViewEmployee.performanceRating || 'Xuất Sắc'}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-300 block">Đối Chiếu KPI Năm 2026:</span>
                <div className="flex items-center justify-between text-xs">
                  <span>Tỷ lệ trễ: <strong className={quickViewEmployee.overdueRate > targetOverdue ? 'text-rose-400' : 'text-emerald-400'}>{quickViewEmployee.overdueRate}%</strong> (Mục tiêu: &le;{targetOverdue}%)</span>
                  <span>Tỷ lệ Bug: <strong className={quickViewEmployee.bugRate > targetBug ? 'text-rose-400' : 'text-emerald-400'}>{quickViewEmployee.bugRate}%</strong> (Mục tiêu: &le;{targetBug}%)</span>
                  <span>Tỷ lệ Rework: <strong className={quickViewEmployee.reworkRate > targetRework ? 'text-rose-400' : 'text-emerald-400'}>{quickViewEmployee.reworkRate}%</strong> (Mục tiêu: &le;{targetRework}%)</span>
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
              <button
                onClick={() => {
                  const emp = quickViewEmployee;
                  setQuickViewEmployee(null);
                  handleSwitchToMember(emp.id);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                <span>Chuyển Sang Màn Hình Chi Tiết Member Này</span>
              </button>
              <button
                onClick={() => setQuickViewEmployee(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. DAILY REPORT MODALS & NOTIFICATION TOAST                               */}
      {/* ========================================================================= */}
      {/* 4.1 MEMBER SUBMIT/EDIT DAILY REPORT MODAL */}
      {currentMember && (
        <DailyReportModal
          isOpen={isDailyReportModalOpen}
          onClose={() => {
            setIsDailyReportModalOpen(false);
            setReportToEdit(null);
          }}
          employee={currentMember}
          memberTasks={currentMemberTasks}
          existingReport={reportToEdit}
          onSaveReport={handleSaveDailyReport}
          isDark={isDark}
        />
      )}

      {/* 4.2 MANAGER REVIEW & FEEDBACK MODAL */}
      <ReviewDailyReportModal
        isOpen={Boolean(selectedReportForReview)}
        onClose={() => setSelectedReportForReview(null)}
        report={selectedReportForReview}
        employee={
          selectedReportForReview
            ? employees.find((e) => e.id === selectedReportForReview.employeeId)
            : undefined
        }
        onUpdateStatus={handleUpdateReportStatus}
        isDark={isDark}
      />

      {/* 4.3 FLOATING SYSTEM TOAST */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="px-4 py-3 rounded-2xl bg-slate-900/95 border border-purple-500/50 text-white shadow-2xl shadow-purple-900/40 flex items-center gap-3 backdrop-blur-md">
            <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-100">{toastMessage}</p>
              <span className="text-[10px] text-purple-300">Thông báo hệ thống báo cáo thành viên</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition ml-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
