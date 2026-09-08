import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import {
  Layers,
  PieChart,
  BarChart2,
  TrendingUp,
  CheckCircle,
  Activity,
  Calendar,
  AlertTriangle,
  Clock,
  ExternalLink,
  ChevronRight,
  Target,
  FileText,
  ListTodo,
  Flame,
  ShieldCheck,
  Award,
  CheckCircle2,
  Sparkles,
  Download,
  FileSpreadsheet,
  UserX,
  UserCheck,
  Filter,
  ArrowUpRight,
  Eye,
} from 'lucide-react';
import { Project, Sprint, CompanyKPIConfig } from '../types';
import { DEFAULT_KPI_CONFIG } from '../data/mockData';
import {
  downloadSprintExcel,
  downloadSprintCSV,
  downloadProjectExcel,
  downloadProjectCSV,
} from '../utils/exportReports';
import { UserAvatar } from './UserAvatar';

interface ProjectSprintChartsProps {
  projects: Project[];
  projectStatusCount: Record<string, number>;
  projectTypeCount: Record<string, number>;
  taskTypeCount: Record<string, number>;
  taskStatusCount: Record<string, number>;
  sprintProgressList: Sprint[];
  onSelectProject: (project: Project) => void;
  isDark?: boolean;
  companyKPIConfig?: CompanyKPIConfig;
}

export const getProjectStatusMeta = (status: string) => {
  switch (status) {
    case 'in_progress':
    case 'Đang thực hiện':
      return {
        label: 'Đang thực hiện',
        badgeClass: 'bg-blue-950/80 text-blue-300 border-blue-800',
        dotClass: 'bg-blue-400',
      };
    case 'delayed':
    case 'Chậm tiến độ':
      return {
        label: 'Chậm tiến độ',
        badgeClass: 'bg-rose-950/80 text-rose-300 border-rose-800',
        dotClass: 'bg-rose-400 animate-pulse',
      };
    case 'completed':
    case 'Hoàn thành':
      return {
        label: 'Hoàn thành',
        badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
        dotClass: 'bg-emerald-400',
      };
    case 'paused':
    case 'on_hold':
    case 'Tạm dừng':
      return {
        label: 'Tạm dừng',
        badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
        dotClass: 'bg-slate-400',
      };
    default:
      return {
        label: status || 'Đang thực hiện',
        badgeClass: 'bg-blue-950/80 text-blue-300 border-blue-800',
        dotClass: 'bg-blue-400',
      };
  }
};

export const ProjectSprintCharts: React.FC<ProjectSprintChartsProps> = ({
  projects,
  projectStatusCount,
  projectTypeCount,
  taskTypeCount,
  taskStatusCount,
  sprintProgressList = [],
  onSelectProject,
  isDark = true,
  companyKPIConfig,
}) => {


  /** State quản lý bộ lọc Dự Án được chọn ('ALL' hoặc id cụ thể của dự án) */
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');

  /** Khởi tạo Sprint được chọn: Tự động ưu tiên chọn Active Sprint (status === 'in_progress') đang chạy của hệ thống */
  const defaultActiveSprint = (sprintProgressList || []).find((s) => s.status === 'in_progress') || sprintProgressList[0];
  const [selectedSprintId, setSelectedSprintId] = useState<string>(
    defaultActiveSprint?.id || 'sprint-28'
  );
  const [sprintViewMode, setSprintViewMode] = useState<
    'burndown' | 'burnup' | 'kpi_quality' | 'member_workload' | 'backlog'
  >('burndown');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [backlogFilter, setBacklogFilter] = useState<
    'all' | 'done' | 'in_progress' | 'todo' | 'overdue' | 'bug' | 'rework'
  >('all');

  const activeKPI =
    companyKPIConfig && typeof companyKPIConfig === 'object' && companyKPIConfig.year
      ? companyKPIConfig
      : DEFAULT_KPI_CONFIG;

  const chartStatusRef = useRef<HTMLCanvasElement | null>(null);
  const chartTypeRef = useRef<HTMLCanvasElement | null>(null);
  const chartTaskTypeRef = useRef<HTMLCanvasElement | null>(null);
  const chartTaskStatusRef = useRef<HTMLCanvasElement | null>(null);
  const chartSprintProgressRef = useRef<HTMLCanvasElement | null>(null);
  const chartSprintBurnupRef = useRef<HTMLCanvasElement | null>(null);

  const chartInstances = useRef<{ [key: string]: Chart | null }>({});

  /** Lọc động danh sách Sprint theo Dự Án đang được chọn (selectedProjectId) */
  const filteredSprints = React.useMemo(() => {
    if (selectedProjectId === 'ALL') return sprintProgressList || [];
    const targetProject = (projects || []).find((p) => p.id === selectedProjectId);
    const matched = (sprintProgressList || []).filter(
      (s) =>
        s.projectId === selectedProjectId ||
        (targetProject?.code && s.projectCode === targetProject.code) ||
        (targetProject?.code && s.name.includes(targetProject.code))
    );
    return matched.length > 0 ? matched : sprintProgressList || [];
  }, [sprintProgressList, selectedProjectId, projects]);

  const selectedSprint =
    filteredSprints.find((s) => s.id === selectedSprintId) ||
    sprintProgressList.find((s) => s.id === selectedSprintId) ||
    filteredSprints[0] ||
    sprintProgressList[0];

  /** Tự động chuyển đổi sang Sprint tương ứng của Dự án khi chọn Dự án mới */
  useEffect(() => {
    if (filteredSprints && filteredSprints.length > 0) {
      const exists = filteredSprints.some((s) => s.id === selectedSprintId);
      if (!exists) {
        setSelectedSprintId(filteredSprints[0].id);
      }
    }
  }, [filteredSprints, selectedSprintId]);

  /** Danh sách dự án đã được lọc theo selectedProjectId và statusFilter ('ALL', 'Đang thực hiện', 'Chậm tiến độ', 'Hoàn thành', 'Tạm dừng') */
  const filteredProjects = React.useMemo(() => {
    return (projects || []).filter((p) => {
      if (selectedProjectId !== 'ALL' && p.id !== selectedProjectId) return false;
      if (statusFilter !== 'ALL') {
        const meta = getProjectStatusMeta(p.status);
        if (meta.label !== statusFilter && p.status !== statusFilter) return false;
      }
      return true;
    });
  }, [projects, selectedProjectId, statusFilter]);

  /** Tính toán đếm động số lượng dự án theo 4 trạng thái từ filteredProjects */
  const dynamicProjectStatusCount = React.useMemo(() => {
    const counts: Record<string, number> = {
      'Đang thực hiện': 0,
      'Hoàn thành': 0,
      'Chậm tiến độ': 0,
      'Tạm dừng': 0,
    };
    (filteredProjects || []).forEach((p) => {
      const meta = getProjectStatusMeta(p.status);
      if (counts[meta.label] !== undefined) {
        counts[meta.label]++;
      } else {
        counts['Đang thực hiện']++;
      }
    });
    return counts;
  }, [filteredProjects]);

  /** Tính toán đếm động số lượng dự án theo loại hình từ filteredProjects */
  const dynamicProjectTypeCount = React.useMemo(() => {
    const counts: Record<string, number> = {
      'Dự án Mới (New)': 0,
      'Bảo trì (Maint)': 0,
      'Hạ tầng & Tối ưu': 0,
    };
    (filteredProjects || []).forEach((p) => {
      if (p.type === 'new') counts['Dự án Mới (New)']++;
      else if (p.type === 'maintenance' || p.type === 'maint') counts['Bảo trì (Maint)']++;
      else counts['Hạ tầng & Tối ưu']++;
    });
    return counts;
  }, [filteredProjects]);

  /** Tính toán động cơ cấu loại task từ selectedSprint.sprintTasks và selectedProjectId */
  const dynamicTaskTypeCount = React.useMemo(() => {
    let tasks = selectedSprint?.sprintTasks || [];
    if (selectedProjectId !== 'ALL') {
      tasks = tasks.filter((t) => !t.projectId || t.projectId === selectedProjectId);
    }
    if (tasks.length === 0) return taskTypeCount;
    return {
      'Tính năng mới': tasks.filter((t) => t.type === 'feature' || t.type === 'new').length,
      'Sửa lỗi (Bug)': tasks.filter((t) => t.type === 'bug').length,
      'Bảo trì (Maint)': tasks.filter((t) => t.type === 'maintenance' || t.type === 'maint').length,
      'Làm lại (Rework)': tasks.filter((t) => t.type === 'rework').length,
      'Phát sinh (CR)': tasks.filter((t) => t.type === 'cr').length,
    };
  }, [selectedSprint, selectedProjectId, taskTypeCount]);

  /** Tính toán động cơ cấu trạng thái task từ selectedSprint.sprintTasks và selectedProjectId */
  const dynamicTaskStatusCount = React.useMemo(() => {
    let tasks = selectedSprint?.sprintTasks || [];
    if (selectedProjectId !== 'ALL') {
      tasks = tasks.filter((t) => !t.projectId || t.projectId === selectedProjectId);
    }
    if (tasks.length === 0) return taskStatusCount;
    return {
      'Cần làm (Todo)': tasks.filter((t) => t.status === 'todo').length,
      'Đang làm (Doing)': tasks.filter((t) => t.status === 'in_progress' || t.status === 'doing').length,
      'Chờ Code Review': tasks.filter((t) => t.status === 'code_review' || t.status === 'review').length,
      'Đang QA Test': tasks.filter((t) => t.status === 'qa_test' || t.status === 'testing').length,
      'Đã xong (Done)': tasks.filter((t) => t.status === 'done' || t.status === 'completed').length,
    };
  }, [selectedSprint, selectedProjectId, taskStatusCount]);

  /** Tính toán trạng thái dự án chiếm tỷ lệ cao nhất */
  const dominantProjectStatus = React.useMemo(() => {
    const entries = Object.entries(dynamicProjectStatusCount || {});
    if (entries.length === 0) return { label: 'Chưa có', count: 0, percent: 0 };
    const [label, count] = entries.reduce((max, curr) => (curr[1] > max[1] ? curr : max), ['', 0]);
    const total = entries.reduce((sum, e) => sum + e[1], 0);
    const percent = total > 0 ? Math.round((count / total) * 100) : 0;
    return { label, count, percent };
  }, [dynamicProjectStatusCount]);

  useEffect(() => {
    // OLD:
    // // 1. Biểu đồ Project theo trạng thái (Donut 360)
    // if (chartStatusRef.current) {
    //   if (chartInstances.current['status']) {
    //     chartInstances.current['status']?.destroy();
    //   }
    //   chartInstances.current['status'] = new Chart(chartStatusRef.current, {
    //     type: 'doughnut', ...
    //   });
    // }

    /** 1. Biểu đồ Trạng Thái Dự Án (Radar Chart Mạng Nhện Micro Tooltip & Sleek Point Marker) */
    if (chartStatusRef.current) {
      if (chartInstances.current['status']) {
        chartInstances.current['status']?.destroy();
      }

      const ctx = chartStatusRef.current.getContext('2d');
      let fillGradient: any = isDark ? 'rgba(59, 130, 246, 0.20)' : 'rgba(59, 130, 246, 0.15)';
      if (ctx) {
        fillGradient = ctx.createRadialGradient(90, 90, 10, 90, 90, 130);
        fillGradient.addColorStop(0, isDark ? 'rgba(59, 130, 246, 0.30)' : 'rgba(59, 130, 246, 0.20)');
        fillGradient.addColorStop(0.5, isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.10)');
        fillGradient.addColorStop(1, isDark ? 'rgba(59, 130, 246, 0.02)' : 'rgba(59, 130, 246, 0.01)');
      }

      const labels = ['Đang làm', 'Hoàn thành', 'Chậm tiến độ', 'Tạm dừng'];
      const values = [
        dynamicProjectStatusCount['Đang thực hiện'] || 0,
        dynamicProjectStatusCount['Hoàn thành'] || 0,
        dynamicProjectStatusCount['Chậm tiến độ'] || 0,
        dynamicProjectStatusCount['Tạm dừng'] || 0,
      ];
      const maxVal = Math.max(...values);
      const pointRadii = values.map((val) => (val === maxVal && val > 0 ? 3.5 : 2.0));
      const pointColors = values.map((val) => (val === maxVal && val > 0 ? '#f97316' : '#3b82f6'));
      const pointHoverRadii = values.map((val) => (val === maxVal && val > 0 ? 4.5 : 3.5));

      chartInstances.current['status'] = new Chart(chartStatusRef.current, {
        type: 'radar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Số dự án',
              data: values,
              backgroundColor: fillGradient,
              borderColor: '#3b82f6',
              borderWidth: 2.2,
              pointBackgroundColor: pointColors,
              pointBorderColor: '#ffffff',
              pointHoverBackgroundColor: '#ffffff',
              pointHoverBorderColor: '#f97316',
              pointRadius: pointRadii,
              pointHoverRadius: pointHoverRadii,
              pointBorderWidth: 1.5,
            },
          ],
        },
        options: {
          interaction: {
            mode: 'nearest',
            intersect: true,
          },
          hover: {
            mode: 'nearest',
            intersect: true,
          },
          animation: {
            duration: 600,
            easing: 'easeOutQuart',
          },
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              padding: { top: 4, bottom: 4, left: 8, right: 8 },
              caretSize: 4,
              caretPadding: 6,
              displayColors: false,
              titleFont: { size: 10, weight: 'bold' },
              bodyFont: { size: 10, weight: 'bold' },
              callbacks: {
                title: () => '',
                label: (ctx) => `${ctx.label}: ${ctx.raw} dự án`,
              },
            },
          },
          scales: {
            r: {
              angleLines: {
                color: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
              },
              grid: {
                color: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
              },
              pointLabels: {
                color: isDark ? '#cbd5e1' : '#475569',
                font: { size: 9.5, weight: 'bold' },
                padding: 4,
              },
              ticks: { display: false },
              suggestedMin: 0,
            },
          },
        },
      });
    }

    // OLD:
    // // 2. Biểu đồ Project theo loại dự án (Horizontal Bar)
    // if (chartTypeRef.current) { ... }

    /** 2. Biểu đồ Loại Hình Dự Án (Radar Chart Mạng Nhện Micro Tooltip & Sleek Point Marker) */
    if (chartTypeRef.current) {
      if (chartInstances.current['type']) {
        chartInstances.current['type']?.destroy();
      }

      const ctx = chartTypeRef.current.getContext('2d');
      let fillGradient: any = isDark ? 'rgba(14, 165, 233, 0.20)' : 'rgba(14, 165, 233, 0.15)';
      if (ctx) {
        fillGradient = ctx.createRadialGradient(90, 90, 10, 90, 90, 130);
        fillGradient.addColorStop(0, isDark ? 'rgba(14, 165, 233, 0.30)' : 'rgba(14, 165, 233, 0.20)');
        fillGradient.addColorStop(0.5, isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.10)');
        fillGradient.addColorStop(1, isDark ? 'rgba(14, 165, 233, 0.02)' : 'rgba(14, 165, 233, 0.01)');
      }

      // OLD: const pointRadii = values.map((val) => (val === maxVal && val > 0 ? 5.5 : 3.5));
      // OLD: const pointHoverRadii = values.map((val) => (val === maxVal && val > 0 ? 8 : 6));
      // Tự động tìm đỉnh có số lượng dự án lớn nhất để làm nổi bật vừa vặn gọn gàng (Point Highlight Sleek Micro)
      const values = Object.values(projectTypeCount || {});
      const maxVal = Math.max(...values);
      const pointRadii = values.map((val) => (val === maxVal && val > 0 ? 3.5 : 2.0));
      const pointColors = values.map((val) => (val === maxVal && val > 0 ? '#f59e0b' : '#10b981'));
      const pointHoverRadii = values.map((val) => (val === maxVal && val > 0 ? 4.5 : 3.5));

      chartInstances.current['type'] = new Chart(chartTypeRef.current, {
        type: 'radar',
        data: {
          labels: Object.keys(projectTypeCount || {}),
          datasets: [
            {
              label: 'Số dự án',
              data: values,
              backgroundColor: fillGradient,
              borderColor: '#0ea5e9',
              borderWidth: 2.2,
              pointBackgroundColor: pointColors,
              pointBorderColor: '#ffffff',
              pointHoverBackgroundColor: '#ffffff',
              pointHoverBorderColor: '#f59e0b',
              pointRadius: pointRadii,
              pointHoverRadius: pointHoverRadii,
              pointBorderWidth: 1.5,
            },
          ],
        },
        options: {
          interaction: {
            mode: 'nearest',
            intersect: true,
          },
          hover: {
            mode: 'nearest',
            intersect: true,
          },
          animation: {
            duration: 600,
            easing: 'easeOutQuart',
          },
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              padding: { top: 4, bottom: 4, left: 8, right: 8 },
              caretSize: 4,
              caretPadding: 6,
              displayColors: false,
              titleFont: { size: 10, weight: 'bold' },
              bodyFont: { size: 10, weight: 'bold' },
              callbacks: {
                title: () => '',
                label: (ctx) => `${ctx.label}: ${ctx.raw} dự án`,
              },
            },
          },
          scales: {
            r: {
              angleLines: { color: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)' },
              grid: { color: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)' },
              pointLabels: {
                color: isDark ? '#cbd5e1' : '#334155',
                font: { size: 9.5, weight: 'bold' },
                padding: 4,
              },
              ticks: { display: false },
            },
          },
        },
      });
    }

    // OLD:
    // // 3. Biểu đồ Project theo loại task (Bar)
    // if (chartTaskTypeRef.current) { ... }

    /** 3. Biểu đồ Cơ Cấu Loại Task (Radar Chart Mạng Nhện Micro Tooltip & Sleek Point Marker) */
    if (chartTaskTypeRef.current) {
      if (chartInstances.current['taskType']) {
        chartInstances.current['taskType']?.destroy();
      }

      const ctx = chartTaskTypeRef.current.getContext('2d');
      let fillGradient: any = isDark ? 'rgba(168, 85, 247, 0.20)' : 'rgba(168, 85, 247, 0.15)';
      if (ctx) {
        fillGradient = ctx.createRadialGradient(90, 90, 10, 90, 90, 130);
        fillGradient.addColorStop(0, isDark ? 'rgba(168, 85, 247, 0.30)' : 'rgba(168, 85, 247, 0.20)');
        fillGradient.addColorStop(0.6, isDark ? 'rgba(129, 140, 248, 0.15)' : 'rgba(99, 102, 241, 0.10)');
        fillGradient.addColorStop(1, isDark ? 'rgba(168, 85, 247, 0.02)' : 'rgba(168, 85, 247, 0.01)');
      }

      // OLD: const values = Object.values(taskTypeCount || {});
      // Tự động đếm động cơ cấu loại task từ selectedSprint.sprintTasks và tô màu da cam tươi (#f97316) cho task chiếm số lượng lớn nhất
      const values = Object.values(dynamicTaskTypeCount || {});
      const maxVal = Math.max(...values);
      const pointRadii = values.map((val) => (val === maxVal && val > 0 ? 5.0 : 2.8));
      const pointColors = values.map((val) => (val === maxVal && val > 0 ? '#f97316' : '#a855f7'));
      const pointHoverRadii = values.map((val) => (val === maxVal && val > 0 ? 7.0 : 4.0));

      chartInstances.current['taskType'] = new Chart(chartTaskTypeRef.current, {
        type: 'radar',
        data: {
          labels: Object.keys(dynamicTaskTypeCount || {}),
          datasets: [
            {
              label: 'Số lượng Task',
              data: values,
              backgroundColor: fillGradient,
              borderColor: '#818cf8',
              borderWidth: 2.2,
              pointBackgroundColor: pointColors,
              pointBorderColor: '#ffffff',
              pointHoverBackgroundColor: '#ffffff',
              pointHoverBorderColor: '#f97316',
              pointRadius: pointRadii,
              pointHoverRadius: pointHoverRadii,
              pointBorderWidth: 1.8,
            },
          ],
        },
        options: {
          interaction: {
            mode: 'nearest',
            intersect: true,
          },
          hover: {
            mode: 'nearest',
            intersect: true,
          },
          animation: {
            duration: 600,
            easing: 'easeOutQuart',
          },
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              padding: { top: 4, bottom: 4, left: 8, right: 8 },
              caretSize: 4,
              caretPadding: 6,
              displayColors: false,
              titleFont: { size: 10, weight: 'bold' },
              bodyFont: { size: 10, weight: 'bold' },
              callbacks: {
                title: () => '',
                label: (ctx) => `${ctx.label}: ${ctx.raw} Tasks`,
              },
            },
          },
          scales: {
            r: {
              angleLines: { color: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)' },
              grid: { color: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)' },
              pointLabels: {
                color: isDark ? '#e2e8f0' : '#1e293b',
                font: { size: 9.5, weight: 'bold' },
                padding: 4,
              },
              ticks: { display: false },
            },
          },
        },
      });
    }

    // OLD:
    // // 4. Biểu đồ Project theo loại trạng thái task (Doughnut)
    // if (chartTaskStatusRef.current) { ... }

    /** 4. Biểu đồ Trạng Thái Task (Radar Chart Mạng Nhện Micro Tooltip & Sleek Point Marker) */
    if (chartTaskStatusRef.current) {
      if (chartInstances.current['taskStatus']) {
        chartInstances.current['taskStatus']?.destroy();
      }

      const ctx = chartTaskStatusRef.current.getContext('2d');
      let fillGradient: any = isDark ? 'rgba(56, 189, 248, 0.20)' : 'rgba(56, 189, 248, 0.15)';
      if (ctx) {
        fillGradient = ctx.createRadialGradient(90, 90, 10, 90, 90, 130);
        fillGradient.addColorStop(0, isDark ? 'rgba(56, 189, 248, 0.30)' : 'rgba(56, 189, 248, 0.20)');
        fillGradient.addColorStop(0.6, isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.10)');
        fillGradient.addColorStop(1, isDark ? 'rgba(56, 189, 248, 0.02)' : 'rgba(56, 189, 248, 0.01)');
      }

      // OLD: const values = Object.values(taskStatusCount || {});
      // Tự động đếm động trạng thái task từ selectedSprint.sprintTasks
      const values = Object.values(dynamicTaskStatusCount || {});
      const maxVal = Math.max(...values);
      const pointRadii = values.map((val) => (val === maxVal && val > 0 ? 5.0 : 2.8));
      const pointColors = values.map((val) => (val === maxVal && val > 0 ? '#34d399' : '#06b6d4'));
      const pointHoverRadii = values.map((val) => (val === maxVal && val > 0 ? 7.0 : 4.0));

      chartInstances.current['taskStatus'] = new Chart(chartTaskStatusRef.current, {
        type: 'radar',
        data: {
          labels: Object.keys(dynamicTaskStatusCount || {}),
          datasets: [
            {
              label: 'Số lượng Task',
              data: values,
              backgroundColor: fillGradient,
              borderColor: '#06b6d4',
              borderWidth: 2.2,
              pointBackgroundColor: pointColors,
              pointBorderColor: '#ffffff',
              pointHoverBackgroundColor: '#ffffff',
              pointHoverBorderColor: '#34d399',
              pointRadius: pointRadii,
              pointHoverRadius: pointHoverRadii,
              pointBorderWidth: 1.8,
            },
          ],
        },
        options: {
          interaction: {
            mode: 'nearest',
            intersect: true,
          },
          hover: {
            mode: 'nearest',
            intersect: true,
          },
          animation: {
            duration: 600,
            easing: 'easeOutQuart',
          },
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              padding: { top: 4, bottom: 4, left: 8, right: 8 },
              caretSize: 4,
              caretPadding: 6,
              displayColors: false,
              titleFont: { size: 10, weight: 'bold' },
              bodyFont: { size: 10, weight: 'bold' },
              callbacks: {
                title: () => '',
                label: (ctx) => `${ctx.label}: ${ctx.raw} Tasks`,
              },
            },
          },
          scales: {
            r: {
              angleLines: { color: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)' },
              grid: { color: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)' },
              pointLabels: {
                color: isDark ? '#cbd5e1' : '#334155',
                font: { size: 9.5, weight: 'bold' },
                padding: 4,
              },
              ticks: { display: false },
            },
          },
        },
      });
    }

    // 6. Biểu đồ tiến độ Sprint (Burndown Chart)
    if (
      chartSprintProgressRef.current &&
      selectedSprint &&
      Array.isArray(selectedSprint.burndown)
    ) {
      if (chartInstances.current['sprintProgress']) {
        chartInstances.current['sprintProgress']?.destroy();
      }

      const burndownData = selectedSprint.burndown;
      const labels = burndownData.map((b) => b.day);
      const idealPoints = burndownData.map((b) => b.ideal);
      const actualPoints = burndownData.map((b) => (b.actual !== undefined ? b.actual : null));
      const forecastPoints = burndownData.map((b) => (b.forecast !== undefined ? b.forecast : null));

      chartInstances.current['sprintProgress'] = new Chart(chartSprintProgressRef.current, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Kế hoạch chuẩn (Ideal SP)',
              data: idealPoints,
              borderColor: '#94a3b8',
              borderDash: [5, 5],
              fill: false,
              pointRadius: 4,
              pointHoverRadius: 6,
              tension: 0.1,
            },
            {
              label: 'Thực tế đốt SP (Actual SP)',
              data: actualPoints,
              borderColor: '#38bdf8',
              backgroundColor: 'rgba(56, 189, 248, 0.18)',
              fill: true,
              pointRadius: 6,
              pointHoverRadius: 8,
              pointBackgroundColor: '#38bdf8',
              tension: 0.2,
              spanGaps: false,
            },
            {
              label: 'Dự báo hoàn thành (Forecast)',
              data: forecastPoints,
              borderColor: '#c084fc',
              borderDash: [3, 3],
              fill: false,
              pointRadius: 5,
              pointHoverRadius: 7,
              pointBackgroundColor: '#c084fc',
              tension: 0.2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                boxWidth: 12,
                font: { size: 11, weight: 'bold' },
                color: isDark ? '#cbd5e1' : '#334155',
              },
            },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw} SP`,
              },
            },
          },
          scales: {
            x: {
              grid: { color: isDark ? '#1e293b' : '#f1f5f9' },
              ticks: { font: { size: 10 }, color: isDark ? '#94a3b8' : '#64748b' },
            },
            y: {
              beginAtZero: true,
              grid: { color: isDark ? '#1e293b' : '#f1f5f9' },
              ticks: { color: isDark ? '#94a3b8' : '#64748b' },
              title: {
                display: true,
                text: 'Story Points (SP) Còn Lại',
                font: { size: 10, weight: 'bold' },
                color: isDark ? '#94a3b8' : '#64748b',
              },
            },
          },
        },
      });
    }

    // 6.b Biểu đồ Burnup Chart (Tích lũy SP hoàn thành)
    if (
      chartSprintBurnupRef.current &&
      selectedSprint &&
      Array.isArray(selectedSprint.burnup)
    ) {
      if (chartInstances.current['sprintBurnup']) {
        chartInstances.current['sprintBurnup']?.destroy();
      }

      const burnupData = selectedSprint.burnup;
      const labels = burnupData.map((b) => b.day);
      const scopePoints = burnupData.map((b) => b.totalScope);
      const completedPoints = burnupData.map((b) => b.completed);

      chartInstances.current['sprintBurnup'] = new Chart(chartSprintBurnupRef.current, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Tổng điểm Scope cam kết',
              data: scopePoints,
              borderColor: '#f59e0b',
              borderDash: [4, 4],
              fill: false,
              pointRadius: 4,
              tension: 0,
            },
            {
              label: 'SP Đã hoàn thành tích lũy',
              data: completedPoints,
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              fill: true,
              pointRadius: 6,
              pointHoverRadius: 8,
              pointBackgroundColor: '#10b981',
              tension: 0.2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                boxWidth: 12,
                font: { size: 11, weight: 'bold' },
                color: isDark ? '#cbd5e1' : '#334155',
              },
            },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw} SP`,
              },
            },
          },
          scales: {
            x: {
              grid: { color: isDark ? '#1e293b' : '#f1f5f9' },
              ticks: { font: { size: 10 }, color: isDark ? '#94a3b8' : '#64748b' },
            },
            y: {
              beginAtZero: true,
              grid: { color: isDark ? '#1e293b' : '#f1f5f9' },
              ticks: { color: isDark ? '#94a3b8' : '#64748b' },
              title: {
                display: true,
                text: 'Story Points (SP) Tích Lũy',
                font: { size: 10, weight: 'bold' },
                color: isDark ? '#94a3b8' : '#64748b',
              },
            },
          },
        },
      });
    }

    return () => {
      (Object.values(chartInstances.current) as (Chart | null)[]).forEach((inst) => inst?.destroy());
    };
  }, [
    projectStatusCount,
    projectTypeCount,
    taskTypeCount,
    taskStatusCount,
    selectedSprint,
    dynamicTaskTypeCount,
    dynamicTaskStatusCount,
    sprintViewMode,
    isDark,
  ]);

  // Tính toán chỉ số phân tích chiếm ưu thế (Dominant Insights) cho các Biểu đồ
  const dominantProjectType = React.useMemo(() => {
    const entries = Object.entries(projectTypeCount || {});
    if (entries.length === 0) return { label: 'Chưa có', count: 0, percent: 0 };
    const [label, count] = entries.reduce((max, curr) => (curr[1] > max[1] ? curr : max), ['', 0]);
    const total = entries.reduce((sum, e) => sum + e[1], 0);
    const percent = total > 0 ? Math.round((count / total) * 100) : 0;
    return { label, count, percent };
  }, [projectTypeCount]);

  const dominantTaskType = React.useMemo(() => {
    const entries = Object.entries(dynamicTaskTypeCount || {});
    if (entries.length === 0) return { label: 'Chưa có', count: 0, percent: 0 };
    const [label, count] = entries.reduce((max, curr) => (curr[1] > max[1] ? curr : max), ['', 0]);
    const total = entries.reduce((sum, e) => sum + e[1], 0);
    const percent = total > 0 ? Math.round((count / total) * 100) : 0;
    return { label, count, percent };
  }, [dynamicTaskTypeCount]);

  const dominantTaskStatus = React.useMemo(() => {
    const entries = Object.entries(dynamicTaskStatusCount || {});
    if (entries.length === 0) return { label: 'Chưa có', count: 0, percent: 0 };
    const [label, count] = entries.reduce((max, curr) => (curr[1] > max[1] ? curr : max), ['', 0]);
    const total = entries.reduce((sum, e) => sum + e[1], 0);
    const percent = total > 0 ? Math.round((count / total) * 100) : 0;
    return { label, count, percent };
  }, [dynamicTaskStatusCount]);

  const totalProjectsCount = projects.length;

  return (
    <section id="section-charts" className="space-y-6">
      {/* SECTION HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <h2
              className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${
                isDark ? 'text-blue-300' : 'text-slate-900'
              }`}
            >
              <Activity className="w-4 h-4 text-blue-500" />
              MỤC 3: PROJECT & SPRINT ANALYTICS (HỆ THỐNG BIỂU ĐỒ BỔ TRỢ HÀI HÒA)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Phân tích tỷ trọng trạng thái, loại hình dự án, cơ cấu task, biểu đồ Burndown Sprint và tiến độ thực tế vs kế hoạch
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold">
            {totalProjectsCount} Dự án đang quản trị
          </span>
        </div>
      </div>

      {/* TOOLBAR BỘ LỌC KÉP DỰ ÁN & SPRINT */}
      <div
        className={`p-3.5 rounded-2xl border flex flex-wrap items-center justify-between gap-3 shadow-md ${
          isDark ? 'bg-[#0f172a]/90 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="flex flex-wrap items-center gap-3">
          {/* Dropdown Lọc Theo Dự Án */}
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold flex items-center gap-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              Lọc Dự Án:
            </span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none transition ${
                isDark
                  ? 'bg-[#141e33] border-slate-700 text-blue-300 focus:border-blue-500'
                  : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
              }`}
            >
              <option value="ALL">🌐 Tất Cả Dự Án ({projects.length})</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  📂 {p.name} ({p.code})
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown Lọc Theo Sprint */}
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold flex items-center gap-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              Lọc Sprint:
            </span>
            <select
              value={selectedSprintId}
              onChange={(e) => setSelectedSprintId(e.target.value)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none transition ${
                isDark
                  ? 'bg-[#141e33] border-slate-700 text-amber-300 focus:border-amber-500'
                  : 'bg-white border-slate-300 text-slate-900 focus:border-amber-500'
              }`}
            >
              {(filteredSprints || []).map((s) => (
                <option key={s.id} value={s.id}>
                  🚀 {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Thống kê nhanh & Nút reset */}
        <div className="flex items-center gap-2">
          {statusFilter !== 'ALL' || selectedProjectId !== 'ALL' ? (
            <button
              onClick={() => {
                setStatusFilter('ALL');
                setSelectedProjectId('ALL');
              }}
              className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition"
            >
              ↺ Xóa bộ lọc
            </button>
          ) : null}
          <span className={`text-xs font-bold px-3 py-1 rounded-xl border ${
            isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-white text-slate-700 border-slate-200'
          }`}>
            Hiển thị: <strong>{filteredProjects.length} / {projects.length}</strong> Dự Án
          </span>
        </div>
      </div>

      {/* 3.1: 4 BIỂU ĐỒ PHÂN BỔ DỰ ÁN & CÔNG VIỆC (STATUS, TYPE, TASK TYPE, TASK STATUS) - BỐ CỤC 1 HÀNG NGANG */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Biểu đồ Project theo trạng thái */}
        <div
          className={`p-4 rounded-2xl border flex flex-col justify-between shadow-lg ${
            isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
            <div className="flex items-center gap-1.5 min-w-0">
              <PieChart className="w-4 h-4 text-blue-500 shrink-0" />
              <h3 className={`text-xs font-black uppercase tracking-wide truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                Trạng Thái Dự Án
              </h3>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${isDark ? 'bg-blue-950 text-blue-300 border-blue-800' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
              Biểu đồ Radar
            </span>
          </div>

          <div className="h-48 relative my-1">
            <canvas ref={chartStatusRef} />
          </div>

          <div className={`pt-2.5 border-t text-[10.5px] flex items-center justify-between gap-1 ${isDark ? 'border-slate-800/80 text-slate-400' : 'border-slate-200 text-slate-600'}`}>
            <span className="truncate flex items-center gap-1 min-w-0">
              <span className="text-blue-400 font-bold shrink-0">🔥 Đa số:</span>
              <span className={`truncate font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{dominantProjectStatus.label}</span>
            </span>
            <span className={`font-bold font-mono shrink-0 ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
              {dominantProjectStatus.count} prj ({dominantProjectStatus.percent}%)
            </span>
          </div>
        </div>

        {/* Card 2: Biểu đồ Project theo loại dự án */}
        <div
          className={`p-4 rounded-2xl border flex flex-col justify-between shadow-lg ${
            isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
            <div className="flex items-center gap-1.5 min-w-0">
              <Layers className="w-4 h-4 text-emerald-500 shrink-0" />
              <h3 className={`text-xs font-black uppercase tracking-wide truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                Loại Dự Án
              </h3>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${isDark ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
              Biểu đồ Radar
            </span>
          </div>

          <div className="h-48 relative my-1">
            <canvas ref={chartTypeRef} />
          </div>

          <div className={`pt-2.5 border-t text-[10.5px] flex items-center justify-between gap-1 ${isDark ? 'border-slate-800/80 text-slate-400' : 'border-slate-200 text-slate-600'}`}>
            <span className="truncate flex items-center gap-1 min-w-0">
              <span className="text-amber-400 font-bold shrink-0">🔥 Cao nhất:</span>
              <span className={`truncate font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{dominantProjectType.label}</span>
            </span>
            <span className={`font-bold font-mono shrink-0 ${isDark ? 'text-amber-300' : 'text-amber-600'}`}>
              {dominantProjectType.count} prj ({dominantProjectType.percent}%)
            </span>
          </div>
        </div>

        {/* Card 3: Biểu đồ Project theo loại task */}
        <div
          className={`p-4 rounded-2xl border flex flex-col justify-between shadow-lg ${
            isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
            <div className="flex items-center gap-1.5 min-w-0">
              <BarChart2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <h3 className={`text-xs font-black uppercase tracking-wide truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                Cơ Cấu Task
              </h3>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${isDark ? 'bg-indigo-950 text-indigo-300 border-indigo-800' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}>
              Biểu đồ Radar
            </span>
          </div>

          <div className="h-48 relative my-1">
            <canvas ref={chartTaskTypeRef} />
          </div>

          <div className={`pt-2.5 border-t text-[10.5px] flex items-center justify-between gap-1 ${isDark ? 'border-slate-800/80 text-slate-400' : 'border-slate-200 text-slate-600'}`}>
            <span className="truncate flex items-center gap-1 min-w-0">
              <span className="text-rose-400 font-bold shrink-0">🔥 Trọng tâm:</span>
              <span className={`truncate font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{dominantTaskType.label}</span>
            </span>
            <span className={`font-bold font-mono shrink-0 ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
              {dominantTaskType.count} ({dominantTaskType.percent}%)
            </span>
          </div>
        </div>

        {/* Card 4: Biểu đồ Project theo loại trạng thái task */}
        <div
          className={`p-4 rounded-2xl border flex flex-col justify-between shadow-lg ${
            isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
            <div className="flex items-center gap-1.5 min-w-0">
              <CheckCircle className="w-4 h-4 text-sky-500 shrink-0" />
              <h3 className={`text-xs font-black uppercase tracking-wide truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                Trạng Thái Task
              </h3>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${isDark ? 'bg-sky-950 text-sky-300 border-sky-800' : 'bg-sky-50 text-sky-700 border-sky-200'}`}>
              Biểu đồ Radar
            </span>
          </div>

          <div className="h-48 relative my-1">
            <canvas ref={chartTaskStatusRef} />
          </div>

          <div className={`pt-2.5 border-t text-[10.5px] flex items-center justify-between gap-1 ${isDark ? 'border-slate-800/80 text-slate-400' : 'border-slate-200 text-slate-600'}`}>
            <span className="truncate flex items-center gap-1.5 min-w-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-emerald-400 font-bold shrink-0">Đa số:</span>
              <span className={`truncate font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{dominantTaskStatus.label}</span>
            </span>
            <span className={`font-bold font-mono shrink-0 ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}>
              {dominantTaskStatus.count} ({dominantTaskStatus.percent}%)
            </span>
          </div>
        </div>
      </div>

      {/* 3.2: BIỂU ĐỒ TIẾN ĐỘ SPRINT (BURNDOWN, BURNUP, KPI CHẤT LƯỢNG & TẢI TRỌNG NHÂN SỰ) */}
      {(() => {
        const sprintTasks = selectedSprint?.sprintTasks || [];
        const totalTasks = sprintTasks.length || selectedSprint?.totalTasks || 0;
        const doneTasks = sprintTasks.filter((t) => t.status === 'done').length;
        const inProgressTasks = sprintTasks.filter((t) => t.status === 'in_progress').length;
        const todoTasks = sprintTasks.filter((t) => t.status === 'todo').length;
        const overdueTasks = sprintTasks.filter((t) => t.isOverdue).length;
        const bugTasks = sprintTasks.filter((t) => t.type === 'bug').length;
        const reworkTasks = sprintTasks.filter((t) => t.type === 'rework').length;

        const overdueRate = totalTasks > 0 ? Number(((overdueTasks / totalTasks) * 100).toFixed(1)) : 0;
        const bugRate = totalTasks > 0 ? Number(((bugTasks / totalTasks) * 100).toFixed(1)) : 0;
        const reworkRate = totalTasks > 0 ? Number(((reworkTasks / totalTasks) * 100).toFixed(1)) : 0;

        const isOverduePass = overdueRate <= activeKPI.maxOverdueRate;
        const isBugPass = bugRate <= activeKPI.maxBugRate;
        const isReworkPass = reworkRate <= activeKPI.maxReworkRate;

        // Member workload grouping
        const memberWorkloadMap: Record<
          string,
          { name: string; taskCount: number; points: number; hours: number; overdueCount: number; tasks: typeof sprintTasks }
        > = {};
        sprintTasks.forEach((t) => {
          const name = t.assigneeName || 'Chưa phân công';
          if (!memberWorkloadMap[name]) {
            memberWorkloadMap[name] = { name, taskCount: 0, points: 0, hours: 0, overdueCount: 0, tasks: [] };
          }
          memberWorkloadMap[name].taskCount += 1;
          memberWorkloadMap[name].points += t.storyPoints || 0;
          memberWorkloadMap[name].hours += t.estimatedHours || 0;
          if (t.isOverdue) memberWorkloadMap[name].overdueCount += 1;
          memberWorkloadMap[name].tasks.push(t);
        });
        const memberWorkloadList = Object.values(memberWorkloadMap).sort((a, b) => b.points - a.points);
        const overloadedMembers = memberWorkloadList.filter(
          (m) => m.points >= 25 || m.hours >= 45 || m.taskCount >= 4
        );

        // Filtered backlog tasks
        const filteredBacklogTasks = sprintTasks.filter((t) => {
          if (backlogFilter === 'done') return t.status === 'done';
          if (backlogFilter === 'in_progress') return t.status === 'in_progress';
          if (backlogFilter === 'todo') return t.status === 'todo';
          if (backlogFilter === 'overdue') return t.isOverdue;
          if (backlogFilter === 'bug') return t.type === 'bug';
          if (backlogFilter === 'rework') return t.type === 'rework';
          return true;
        });

        const isSprintDelayed = (selectedSprint?.delayDays && selectedSprint.delayDays > 0) || selectedSprint?.forecastStatus === 'delayed';

        return (
          <div
            className={`p-5 rounded-2xl border shadow-xl ${
              isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            {/* Sprint Module Header with Selector & View Switcher */}
            <div className={`flex flex-wrap items-center justify-between gap-4 pb-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
                  <h3 className={`text-sm font-black uppercase tracking-wide ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    BIỂU ĐỒ TIẾN ĐỘ SPRINT & ĐỐI CHIẾU KPI CHẤT LƯỢNG DOANH NGHIỆP
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      isSprintDelayed
                        ? isDark
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
                          : 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                        : selectedSprint?.forecastStatus === 'at_risk'
                        ? isDark
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-amber-50 text-amber-700 border-amber-300'
                        : isDark
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    }`}
                  >
                    {isSprintDelayed
                      ? `🔴 Chậm tiến độ (${selectedSprint?.delayDays || 1} ngày)`
                      : selectedSprint?.forecastStatus === 'at_risk'
                      ? '🟡 Nguy cơ trễ tiến độ'
                      : '🟢 On-Track (Đúng tiến độ)'}
                  </span>
                </div>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Tự động đối chiếu KPI chuẩn công ty (Năm {activeKPI?.year || 2026}): Hạn mức Rework &lt;={activeKPI?.maxReworkRatePercent || 10}%, Task trễ hạn &lt;={activeKPI?.maxOverdueRatePercent || 5}%, Bug/Task &lt;={activeKPI?.maxBugRatePercent || 8}%
                </p>
              </div>

              {/* Action Buttons: View Details & Export Excel */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Nút Xem Chi Tiết Báo Cáo */}
                <button
                  onClick={() => {
                    const matchedProject =
                      projects.find(
                        (p) =>
                          p.id === selectedSprint?.projectId ||
                          p.name === selectedSprint?.projectName ||
                          p.code === selectedSprint?.projectCode
                      ) || projects[0];
                    if (matchedProject) {
                      onSelectProject(matchedProject);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition"
                  title="Xem chi tiết hồ sơ & báo cáo toàn diện của dự án"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Xem Chi Tiết</span>
                </button>

                {/* Nút Xuất Excel (.xls) Formatter chuẩn */}
                <button
                  onClick={() => {
                    if (selectedSprint) {
                      downloadSprintExcel(selectedSprint, activeKPI);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition"
                  title="Xuất bảng báo cáo Excel định dạng chuẩn doanh nghiệp (bảng biểu, màu sắc, không lỗi font)"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Xuất Excel Sprint</span>
                </button>

                {/* Nút Xuất CSV dự phòng */}
                <button
                  onClick={() => {
                    if (selectedSprint) {
                      downloadSprintCSV(selectedSprint, activeKPI);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-bold text-xs transition border ${
                    isDark
                      ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  }`}
                  title="Xuất file CSV UTF-8"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>
              </div>
            </div>

            {/* Sub-bar: Sprint Selector & 5 View Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
              {/* Dual Project & Sprint Selector */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Project Selector */}
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold flex items-center gap-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <Layers className="w-3.5 h-3.5 text-blue-400" />
                    Chọn Dự Án:
                  </span>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className={`text-xs font-bold px-3 py-2 rounded-xl border focus:outline-none transition ${
                      isDark
                        ? 'bg-[#141e33] border-slate-700 text-blue-300 focus:border-blue-500'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
                    }`}
                  >
                    <option value="ALL">🌐 Tất Cả Dự Án ({projects.length})</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        📂 {p.name} ({p.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sprint Selector */}
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    Chọn Sprint:
                  </span>
                  <select
                    value={selectedSprintId}
                    onChange={(e) => setSelectedSprintId(e.target.value)}
                    className={`text-xs font-bold px-3 py-2 rounded-xl border focus:outline-none transition ${
                      isDark
                        ? 'bg-[#141e33] border-slate-700 text-sky-300 focus:border-sky-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-500'
                    }`}
                  >
                    {(filteredSprints || []).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* View Mode Switcher */}
              <div className={`flex flex-wrap items-center p-1 rounded-xl border gap-1 ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-100 border-slate-300'
              }`}>
                <button
                  onClick={() => setSprintViewMode('burndown')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    sprintViewMode === 'burndown'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : isDark
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Burndown (Đốt SP)</span>
                </button>

                <button
                  onClick={() => setSprintViewMode('burnup')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    sprintViewMode === 'burnup'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : isDark
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Burnup (Tích lũy)</span>
                </button>

                <button
                  onClick={() => setSprintViewMode('kpi_quality')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    sprintViewMode === 'kpi_quality'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : isDark
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>KPI & Chất Lượng</span>
                </button>

                <button
                  onClick={() => setSprintViewMode('member_workload')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    sprintViewMode === 'member_workload'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : isDark
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Nhân Sự & Quá Tải</span>
                  {overloadedMembers.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                  )}
                </button>

                <button
                  onClick={() => setSprintViewMode('backlog')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    sprintViewMode === 'backlog'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : isDark
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ListTodo className="w-3.5 h-3.5" />
                  <span>Sprint Backlog ({totalTasks})</span>
                </button>
              </div>
            </div>

            {/* Selected Sprint Profile Strip */}
            {selectedSprint && (
              <div className="mt-4 space-y-4">
                {/* Sprint Overview Bar */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-[#131f38] to-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                        {selectedSprint.projectCode || 'PRJ'}
                      </span>
                      <span className="text-xs font-bold text-slate-300">
                        {selectedSprint.projectName}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-xs text-slate-400">
                        Khách hàng: <strong className="text-slate-200">{selectedSprint.clientName}</strong>
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 font-medium mt-1.5 flex items-center gap-2">
                      <span className="text-amber-400 font-bold shrink-0">🎯 Mục tiêu Sprint:</span>
                      <span className="truncate text-slate-200">
                        {selectedSprint.goal || 'Tối ưu hóa các chức năng trọng điểm và bàn giao đúng cam kết.'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Thời gian Kế Hoạch</span>
                      <span className="font-mono font-bold text-sky-300">
                        {selectedSprint.startDate} → {selectedSprint.endDate}
                      </span>
                    </div>
                    <div className="h-8 w-px bg-slate-800" />
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Dự Kiến Thực Tế</span>
                      <span className={`font-bold ${isSprintDelayed ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {selectedSprint.forecastEndDate || selectedSprint.endDate}
                        {selectedSprint.delayDays ? ` (Trễ ${selectedSprint.delayDays}d)` : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4 KPI QUALITY METRIC CARDS (Exact match to Company KPI specification) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Card 1: Overdue Task Rate */}
                  <div className={`p-3.5 rounded-xl border transition ${
                    isOverduePass ? 'bg-slate-900/80 border-slate-800' : 'bg-rose-950/20 border-rose-800/60'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 uppercase font-extrabold tracking-wider">
                        TỶ LỆ TASK TRỄ
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isOverduePass
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border-rose-800'
                      }`}>
                        {isOverduePass ? '✓ Đạt mục tiêu' : '⚠️ Vượt hạn mức'}
                      </span>
                    </div>
                    <div className="text-2xl font-black text-white mt-1.5 flex items-baseline gap-1.5">
                      <span>{overdueRate}%</span>
                      <span className="text-xs font-semibold text-slate-400">
                        ({overdueTasks}/{totalTasks} tasks)
                      </span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">
                        Mục tiêu cam kết: <strong className="text-slate-200">≤ {activeKPI.maxOverdueRate}%</strong>
                      </span>
                      <span className={`font-bold ${isOverduePass ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isOverduePass
                          ? 'Tốt hơn mục tiêu'
                          : `Vượt +${(overdueRate - activeKPI.maxOverdueRate).toFixed(1)}%`}
                      </span>
                    </div>
                  </div>

                  {/* Card 2: Bug Task Rate */}
                  <div className={`p-3.5 rounded-xl border transition ${
                    isBugPass ? 'bg-slate-900/80 border-slate-800' : 'bg-rose-950/20 border-rose-800/60'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 uppercase font-extrabold tracking-wider">
                        TỶ LỆ TASK BUG
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isBugPass
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border-rose-800'
                      }`}>
                        {isBugPass ? '✓ Đạt mục tiêu' : '⚠️ Vượt hạn mức'}
                      </span>
                    </div>
                    <div className="text-2xl font-black text-white mt-1.5 flex items-baseline gap-1.5">
                      <span>{bugRate}%</span>
                      <span className="text-xs font-semibold text-slate-400">
                        ({bugTasks}/{totalTasks} tasks)
                      </span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">
                        Mục tiêu cam kết: <strong className="text-slate-200">≤ {activeKPI.maxBugRate}%</strong>
                      </span>
                      <span className={`font-bold ${isBugPass ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isBugPass
                          ? 'Tốt hơn mục tiêu'
                          : `Vượt +${(bugRate - activeKPI.maxBugRate).toFixed(1)}%`}
                      </span>
                    </div>
                  </div>

                  {/* Card 3: Rework Task Rate */}
                  <div className={`p-3.5 rounded-xl border transition ${
                    isReworkPass ? 'bg-slate-900/80 border-slate-800' : 'bg-rose-950/20 border-rose-800/60'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 uppercase font-extrabold tracking-wider">
                        TỶ LỆ TASK REWORK
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isReworkPass
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border-rose-800'
                      }`}>
                        {isReworkPass ? '✓ Đạt mục tiêu' : '⚠️ Vượt hạn mức'}
                      </span>
                    </div>
                    <div className="text-2xl font-black text-white mt-1.5 flex items-baseline gap-1.5">
                      <span>{reworkRate}%</span>
                      <span className="text-xs font-semibold text-slate-400">
                        ({reworkTasks}/{totalTasks} tasks)
                      </span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">
                        Mục tiêu cam kết: <strong className="text-slate-200">≤ {activeKPI.maxReworkRate}%</strong>
                      </span>
                      <span className={`font-bold ${isReworkPass ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isReworkPass
                          ? 'Tốt hơn mục tiêu'
                          : `Vượt +${(reworkRate - activeKPI.maxReworkRate).toFixed(1)}%`}
                      </span>
                    </div>
                  </div>

                  {/* Card 4: Sprint Schedule & Delays */}
                  <div className={`p-3.5 rounded-xl border transition ${
                    isSprintDelayed ? 'bg-rose-950/20 border-rose-800/60' : 'bg-slate-900/80 border-slate-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 uppercase font-extrabold tracking-wider">
                        TIẾN ĐỘ & TRỄ HẠN SPRINT
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isSprintDelayed
                          ? 'bg-rose-950 text-rose-400 border-rose-800'
                          : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      }`}>
                        {isSprintDelayed ? '🔴 Chậm tiến độ' : '🟢 Đúng hạn'}
                      </span>
                    </div>
                    <div className="text-xl font-black text-white mt-1.5 truncate">
                      {isSprintDelayed
                        ? `Trễ ${selectedSprint.delayDays || 1} ngày`
                        : 'Bàn giao đúng hạn'}
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">
                        Vận tốc: <strong className="text-amber-400">{selectedSprint.velocity || 7.4} SP/d</strong>
                      </span>
                      <span className="text-sky-300 font-bold">
                        {selectedSprint.completedPoints}/{selectedSprint.committedPoints} SP ({selectedSprint.progress}%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Story Points Segmented Progress Bar */}
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-300">Tiến độ phân bổ Story Points Sprint:</span>
                    <span className="text-emerald-400">{selectedSprint.progress || 80}% Hoàn tất</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full transition-all"
                      style={{ width: `${selectedSprint.progress || 80}%` }}
                      title={`Đã xong: ${selectedSprint.completedPoints || 0} SP`}
                    />
                    <div
                      className="bg-blue-500 h-full transition-all"
                      style={{ width: '13.3%' }}
                      title="Đang thực hiện"
                    />
                    <div
                      className="bg-slate-600 h-full transition-all"
                      style={{ width: '6.7%' }}
                      title="Chờ làm"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Đã xong: <strong className="text-slate-200">{selectedSprint.completedPoints || 0} SP ({selectedSprint.progress}%)</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        Đang làm: <strong className="text-slate-200">{inProgressTasks} tasks</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-slate-600" />
                        Chờ làm: <strong className="text-slate-200">{todoTasks} tasks</strong>
                      </span>
                      {overdueTasks > 0 && (
                        <span className="flex items-center gap-1 text-rose-400 font-bold">
                          <AlertTriangle className="w-3 h-3" />
                          Trễ hạn: {overdueTasks} tasks
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-amber-400">
                      Hạn chót Sprint: {selectedSprint.endDate}
                    </span>
                  </div>
                </div>

                {/* TAB CONTENT: BURNDOWN CHART */}
                <div className={`space-y-3 pt-2 ${sprintViewMode === 'burndown' ? 'block' : 'hidden'}`}>
                  <div className="h-72 sm:h-80 relative">
                    <canvas ref={chartSprintProgressRef} />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 pt-3 border-t border-slate-800">
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-0.5 bg-slate-400 inline-block border border-dashed" />
                        Đường nét đứt xám: Kế hoạch lý tưởng chuẩn (Ideal Burndown)
                      </span>
                      <span className="flex items-center gap-1.5 text-sky-400 font-bold">
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" />
                        Đường xanh neon: Thực tế thực hiện qua các ngày (Actual Burn)
                      </span>
                      <span className="flex items-center gap-1.5 text-purple-400 font-bold">
                        <span className="w-3 h-0.5 bg-purple-400 inline-block border border-dashed" />
                        Đường tím: Dự báo hoàn thành (Forecast Velocity)
                      </span>
                    </div>
                    <span className="text-emerald-400 font-bold text-[11px] bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800">
                      ✓ Điểm thực tế ({selectedSprint.burndown?.find((b) => b.day.includes('Hôm nay'))?.actual ?? 24} SP) bám sát kế hoạch
                    </span>
                  </div>
                </div>

                {/* TAB CONTENT: BURNUP CHART */}
                <div className={`space-y-3 pt-2 ${sprintViewMode === 'burnup' ? 'block' : 'hidden'}`}>
                  <div className="h-72 sm:h-80 relative">
                    <canvas ref={chartSprintBurnupRef} />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 pt-3 border-t border-slate-800">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                        <span className="w-3 h-0.5 bg-amber-400 inline-block border border-dashed" />
                        Đường cam: Tổng Story Points cam kết ({selectedSprint.committedPoints} pts)
                      </span>
                      <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                        Vùng xanh lá: Điểm hoàn thành lũy kế ({selectedSprint.completedPoints} pts)
                      </span>
                    </div>
                    <span className="text-emerald-400 font-bold text-[11px]">
                      Tỷ lệ hoàn thành lũy kế: {selectedSprint.progress}%
                    </span>
                  </div>
                </div>

                {/* TAB CONTENT: KPI & CHẤT LƯỢNG (KPI QUALITY AUDIT) */}
                {sprintViewMode === 'kpi_quality' && (
                  <div className="space-y-4 pt-2">
                    <div className={`p-4 rounded-xl border ${
                      isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className={`flex items-center justify-between pb-3 border-b ${
                        isDark ? 'border-slate-800' : 'border-slate-200'
                      }`}>
                        <div>
                          <h4 className={`text-sm font-bold flex items-center gap-2 ${
                            isDark ? 'text-white' : 'text-slate-900'
                          }`}>
                            <ShieldCheck className="w-4 h-4 text-amber-500" />
                            ĐỐI CHIẾU CHỈ SỐ KPI CHẤT LƯỢNG VỚI QUY CHUẨN CÔNG TY (NĂM {activeKPI?.year || 2026})
                          </h4>
                          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            Tự động áp dụng cấu hình hạn mức chất lượng toàn công ty ban hành: {activeKPI?.notes || 'Hạn mức chuẩn'}
                          </p>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                          isDark
                            ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}>
                          Hạn mức tự động áp dụng
                        </span>
                      </div>

                      {/* 3 KPI Comparison Bars */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        {/* KPI 1: Overdue */}
                        <div className={`p-3.5 rounded-xl border space-y-2 ${
                          isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                        }`}>
                          <div className="flex items-center justify-between text-xs">
                            <span className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Tỷ Lệ Trễ Hạn</span>
                            <span className={`font-mono font-black ${isOverduePass ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {overdueRate}% / Tối đa {activeKPI.maxOverdueRate}%
                            </span>
                          </div>
                          <div className={`h-2 rounded-full overflow-hidden relative ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                            <div
                              className={`h-full transition-all ${isOverduePass ? 'bg-emerald-500' : 'bg-rose-500'}`}
                              style={{ width: `${Math.min(100, (overdueRate / (activeKPI.maxOverdueRate * 1.5)) * 100)}%` }}
                            />
                          </div>
                          <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {isOverduePass
                              ? `✓ Đáp ứng chuẩn doanh nghiệp (có ${overdueTasks} task trễ / tổng ${totalTasks})`
                              : `⚠️ Cảnh báo: Vượt hạn mức cam kết ${(overdueRate - activeKPI.maxOverdueRate).toFixed(1)}%`}
                          </p>
                        </div>

                        {/* KPI 2: Bug */}
                        <div className={`p-3.5 rounded-xl border space-y-2 ${
                          isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                        }`}>
                          <div className="flex items-center justify-between text-xs">
                            <span className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Tỷ Lệ Bug Phát Sinh</span>
                            <span className={`font-mono font-black ${isBugPass ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {bugRate}% / Tối đa {activeKPI.maxBugRate}%
                            </span>
                          </div>
                          <div className={`h-2 rounded-full overflow-hidden relative ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                            <div
                              className={`h-full transition-all ${isBugPass ? 'bg-emerald-500' : 'bg-rose-500'}`}
                              style={{ width: `${Math.min(100, (bugRate / (activeKPI.maxBugRate * 1.5)) * 100)}%` }}
                            />
                          </div>
                          <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {isBugPass
                              ? `✓ Chất lượng code ổn định (có ${bugTasks} bug / tổng ${totalTasks})`
                              : `⚠️ Cảnh báo: Vượt hạn mức bug ${(bugRate - activeKPI.maxBugRate).toFixed(1)}%`}
                          </p>
                        </div>

                        {/* KPI 3: Rework */}
                        <div className={`p-3.5 rounded-xl border space-y-2 ${
                          isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                        }`}>
                          <div className="flex items-center justify-between text-xs">
                            <span className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Tỷ Lệ Re-work (Làm Lại)</span>
                            <span className={`font-mono font-black ${isReworkPass ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {reworkRate}% / Tối đa {activeKPI.maxReworkRate}%
                            </span>
                          </div>
                          <div className={`h-2 rounded-full overflow-hidden relative ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                            <div
                              className={`h-full transition-all ${isReworkPass ? 'bg-emerald-500' : 'bg-rose-500'}`}
                              style={{ width: `${Math.min(100, (reworkRate / (activeKPI.maxReworkRate * 1.5)) * 100)}%` }}
                            />
                          </div>
                          <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {isReworkPass
                              ? `✓ Tỷ lệ làm lại trong ngưỡng cho phép (${reworkTasks} task rework)`
                              : `⚠️ Cảnh báo: Vượt ngưỡng làm lại ${(reworkRate - activeKPI.maxReworkRate).toFixed(1)}%`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Quality Risk Tasks List */}
                    <div className={`p-4 rounded-xl border ${
                      isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <h4 className={`text-xs font-black uppercase mb-3 flex items-center gap-1.5 ${
                        isDark ? 'text-slate-300' : 'text-slate-800'
                      }`}>
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                        DANH SÁCH CÁC TASK VI PHẠM HOẶC CẦN LƯU Ý CHẤT LƯỢNG TRONG SPRINT NÀY
                      </h4>
                      {sprintTasks.filter((t) => t.isOverdue || t.type === 'bug' || t.type === 'rework').length === 0 ? (
                        <p className="text-xs text-emerald-500 font-semibold py-4 text-center">
                          🎉 Tuyệt vời! Không có task nào bị trễ hạn hoặc phát sinh lỗi nghiêm trọng trong Sprint này.
                        </p>
                      ) : (
                        <div className={`divide-y ${isDark ? 'divide-slate-800/80' : 'divide-slate-200'}`}>
                          {sprintTasks
                            .filter((t) => t.isOverdue || t.type === 'bug' || t.type === 'rework')
                            .map((task) => (
                              <div key={task.id} className="py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-sky-500">{task.code}</span>
                                  <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{task.title}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Phụ trách: <strong>{task.assigneeName}</strong></span>
                                  {task.isOverdue && (
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                      isDark ? 'bg-rose-950 text-rose-300 border-rose-800' : 'bg-rose-50 text-rose-700 border-rose-200'
                                    }`}>
                                      TRỄ HẠN ({task.delayDays || 1}d)
                                    </span>
                                  )}
                                  {task.type === 'bug' && (
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                      isDark ? 'bg-amber-950 text-amber-300 border-amber-800' : 'bg-amber-50 text-amber-800 border-amber-200'
                                    }`}>
                                      BUG
                                    </span>
                                  )}
                                  {task.type === 'rework' && (
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                      isDark ? 'bg-purple-950 text-purple-300 border-purple-800' : 'bg-purple-50 text-purple-700 border-purple-200'
                                    }`}>
                                      REWORK
                                    </span>
                                  )}
                                </div>
                                {task.delayReason && (
                                  <p className={`w-full text-[11px] pl-2 border-l-2 border-rose-500 ${
                                    isDark ? 'text-rose-300/90' : 'text-rose-700'
                                  }`}>
                                    Lý do: {task.delayReason}
                                  </p>
                                )}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB CONTENT: NHÂN SỰ & QUÁ TẢI (MEMBER WORKLOAD MONITOR) */}
                {sprintViewMode === 'member_workload' && (
                  <div className="space-y-4 pt-2">
                    {/* Alert Banner if any members are overloaded */}
                    {overloadedMembers.length > 0 && (
                      <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                        isDark ? 'bg-rose-950/40 border-rose-800/80' : 'bg-rose-50 border-rose-200'
                      }`}>
                        <div className="flex items-center gap-2.5">
                          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 animate-pulse" />
                          <div>
                            <span className={`font-bold ${isDark ? 'text-rose-200' : 'text-rose-900'}`}>
                              CẢNH BÁO QUÁ TẢI NHÂN SỰ ({overloadedMembers.length} thành viên vượt ngưỡng an toàn):
                            </span>
                            <span className={`ml-1 ${isDark ? 'text-rose-300' : 'text-rose-700'}`}>
                              {overloadedMembers.map((m) => `${m.name} (${m.points} SP, ${m.hours}h)`).join('; ')}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-1 rounded bg-rose-600 text-white shrink-0">
                          CẦN SAN TẢI
                        </span>
                      </div>
                    )}

                    {/* Member Workload Cards Table */}
                    <div className={`overflow-x-auto rounded-xl border ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                      <table className="w-full text-left text-xs min-w-[700px]">
                        <thead className={`uppercase text-[10px] font-extrabold tracking-wider border-b ${
                          isDark ? 'bg-slate-900/90 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          <tr>
                            <th className="px-4 py-3">Thành Viên</th>
                            <th className="px-3 py-3 text-center">Số Task Phụ Trách</th>
                            <th className="px-3 py-3 text-center">Tổng Story Points</th>
                            <th className="px-3 py-3 text-center">Giờ Ước Tính (h)</th>
                            <th className="px-3 py-3 text-center">Task Bị Trễ</th>
                            <th className="px-4 py-3">Đánh Giá Tải Trọng</th>
                            <th className="px-4 py-3">Khuyến Nghị Điều Phối</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${isDark ? 'divide-slate-800/80' : 'divide-slate-200'}`}>
                          {memberWorkloadList.map((m) => {
                            const isOverload = m.points >= 25 || m.hours >= 45 || m.taskCount >= 4;
                            const isOptimal = m.points >= 12 && !isOverload;
                            return (
                              <tr key={m.name} className={`transition ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                                <td className={`px-4 py-3 font-semibold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                                  <div className="flex items-center gap-2">
                                    <UserAvatar name={m.name} size="sm" />
                                    <span>{m.name}</span>
                                  </div>
                                </td>
                                <td className={`px-3 py-3 text-center font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                  {m.taskCount} tasks
                                </td>
                                <td className="px-3 py-3 text-center">
                                  <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs border ${
                                    isOverload
                                      ? isDark ? 'bg-rose-950 text-rose-300 border-rose-800' : 'bg-rose-50 text-rose-700 border-rose-200'
                                      : isDark ? 'bg-slate-800 text-amber-300 border-slate-700' : 'bg-slate-100 text-amber-700 border-slate-300'
                                  }`}>
                                    {m.points} SP
                                  </span>
                                </td>
                                <td className={`px-3 py-3 text-center font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                  {m.hours}h
                                </td>
                                <td className="px-3 py-3 text-center">
                                  {m.overdueCount > 0 ? (
                                    <span className="font-bold text-rose-500">
                                      {m.overdueCount} task
                                    </span>
                                  ) : (
                                    <span className="text-emerald-500 font-bold">0</span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 border ${
                                    isOverload
                                      ? isDark ? 'bg-rose-950 text-rose-300 border-rose-800' : 'bg-rose-50 text-rose-700 border-rose-200'
                                      : isOptimal
                                      ? isDark ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : isDark ? 'bg-blue-950 text-blue-300 border-blue-800' : 'bg-blue-50 text-blue-700 border-blue-200'
                                  }`}>
                                    {isOverload ? '🔴 QUÁ TẢI (OVERLOAD)' : isOptimal ? '🟢 CÂN BẰNG (OPTIMAL)' : '🟡 CÒN TẢI (AVAILABLE)'}
                                  </span>
                                </td>
                                <td className={`px-4 py-3 text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                  {isOverload
                                    ? 'Cần san bớt 1-2 tasks cho nhân sự khác để tránh chậm tiến độ'
                                    : isOptimal
                                    ? 'Tải trọng chuẩn, theo dõi tiến độ bình thường'
                                    : 'Có thể giao thêm 1 story point trung bình'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB CONTENT: SPRINT BACKLOG TABLE */}
                {sprintViewMode === 'backlog' && (
                  <div className="pt-2 space-y-3">
                    {/* Backlog Quick Filter Pills */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5 text-xs">
                        <span className={`font-bold mr-1 flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          <Filter className="w-3.5 h-3.5" />
                          Lọc:
                        </span>
                        {[
                          { id: 'all', label: `Tất cả (${totalTasks})` },
                          { id: 'done', label: `Đã xong (${doneTasks})` },
                          { id: 'in_progress', label: `Đang làm (${inProgressTasks})` },
                          { id: 'todo', label: `Chờ làm (${todoTasks})` },
                          { id: 'overdue', label: `Trễ hạn (${overdueTasks})`, alert: overdueTasks > 0 },
                          { id: 'bug', label: `Bug (${bugTasks})` },
                          { id: 'rework', label: `Rework (${reworkTasks})` },
                        ].map((btn) => (
                          <button
                            key={btn.id}
                            onClick={() => setBacklogFilter(btn.id as any)}
                            className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] ${
                              backlogFilter === btn.id
                                ? 'bg-purple-600 text-white shadow-xs'
                                : btn.alert
                                ? isDark ? 'bg-rose-950/80 text-rose-300 border border-rose-800' : 'bg-rose-50 text-rose-700 border border-rose-300'
                                : isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (selectedSprint) downloadSprintExcel(selectedSprint, activeKPI);
                          }}
                          className="text-xs text-emerald-500 hover:text-emerald-600 font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 transition"
                          title="Xuất bảng tính Excel định dạng đẹp chuẩn"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          <span>Xuất Excel Sprint (.xls)</span>
                        </button>
                        <button
                          onClick={() => {
                            if (selectedSprint) downloadSprintCSV(selectedSprint, activeKPI);
                          }}
                          className={`text-xs font-bold flex items-center gap-1 px-2 py-1 rounded-lg border transition ${
                            isDark ? 'text-slate-300 bg-slate-800 border-slate-700 hover:bg-slate-700' : 'text-slate-700 bg-slate-100 border-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          <Download className="w-3 h-3" />
                          <span>CSV</span>
                        </button>
                      </div>
                    </div>

                    <div className={`overflow-x-auto rounded-xl border scrollbar-thin ${
                      isDark ? 'border-slate-800' : 'border-slate-200'
                    }`}>
                      <table className="w-full text-left text-xs min-w-[860px]">
                        <thead className={`uppercase text-[10px] font-extrabold tracking-wider border-b ${
                          isDark ? 'bg-slate-900/90 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          <tr>
                            <th className="px-3 py-3 w-10 text-center whitespace-nowrap">STT</th>
                            <th className="px-3 py-3 w-32 whitespace-nowrap">Mã Task</th>
                            <th className="px-4 py-3 min-w-[260px]">Tên User Story / Công Việc</th>
                            <th className="px-3 py-3 w-36 whitespace-nowrap">Người Phụ Trách</th>
                            <th className="px-2 py-3 w-16 text-center whitespace-nowrap">Điểm SP</th>
                            <th className="px-2 py-3 w-20 text-center whitespace-nowrap">Giờ (KH/TT)</th>
                            <th className="px-3 py-3 w-24 whitespace-nowrap">Loại Task</th>
                            <th className="px-3 py-3 w-24 whitespace-nowrap">Ưu Tiên</th>
                            <th className="px-3 py-3 w-28 whitespace-nowrap">Trạng Thái</th>
                            <th className="px-3 py-3 w-28 whitespace-nowrap">Hạn Chót / Trễ</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${isDark ? 'divide-slate-800/80' : 'divide-slate-200'}`}>
                          {filteredBacklogTasks.map((task, idx) => (
                            <tr
                              key={task.id}
                              className={`transition-colors ${
                                isDark
                                  ? `hover:bg-slate-800/40 ${task.isOverdue ? 'bg-rose-950/20' : ''}`
                                  : `hover:bg-slate-50 ${task.isOverdue ? 'bg-rose-50/50' : ''}`
                              }`}
                            >
                              <td className="px-3 py-3 text-center text-slate-400 font-mono">
                                {idx + 1}
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap font-mono font-bold text-sky-500">
                                {task.code}
                              </td>
                              <td className={`px-4 py-3 font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                <div>{task.title}</div>
                                {task.delayReason && (
                                  <div className="text-[10px] text-rose-500 mt-0.5 font-normal">
                                    Lý do trễ: {task.delayReason}
                                  </div>
                                )}
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <UserAvatar name={task.assigneeName} size="sm" />
                                  <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{task.assigneeName}</span>
                                </div>
                              </td>
                              <td className="px-2 py-3 text-center whitespace-nowrap">
                                <span className={`px-2 py-0.5 rounded font-mono font-black text-xs border ${
                                  isDark ? 'bg-slate-800 text-amber-300 border-slate-700' : 'bg-slate-100 text-amber-700 border-slate-300'
                                }`}>
                                  {task.storyPoints} pts
                                </span>
                              </td>
                              <td className={`px-2 py-3 text-center whitespace-nowrap font-mono text-[11px] ${
                                isDark ? 'text-slate-300' : 'text-slate-600'
                              }`}>
                                {task.estimatedHours || 0}h / {task.actualHours || task.estimatedHours || 0}h
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                    task.type === 'bug'
                                      ? isDark ? 'bg-rose-950 text-rose-300 border-rose-800' : 'bg-rose-50 text-rose-700 border-rose-300'
                                      : task.type === 'cr'
                                      ? isDark ? 'bg-amber-950 text-amber-300 border-amber-800' : 'bg-amber-50 text-amber-700 border-amber-300'
                                      : task.type === 'rework'
                                      ? isDark ? 'bg-purple-950 text-purple-300 border-purple-800' : 'bg-purple-50 text-purple-700 border-purple-300'
                                      : isDark ? 'bg-blue-950 text-blue-300 border-blue-800' : 'bg-blue-50 text-blue-700 border-blue-300'
                                  }`}
                                >
                                  {task.type.toUpperCase()}
                                </span>
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                    task.priority === 'urgent'
                                      ? isDark ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-rose-50 text-rose-700 border-rose-300'
                                      : task.priority === 'high'
                                      ? isDark ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-amber-50 text-amber-700 border-amber-300'
                                      : isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-300'
                                  }`}
                                >
                                  {task.priority === 'urgent'
                                    ? 'Khẩn cấp'
                                    : task.priority === 'high'
                                    ? 'Cao'
                                    : 'Trung bình'}
                                </span>
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap">
                                <span
                                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 border ${
                                    task.status === 'done'
                                      ? isDark ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                      : task.status === 'in_progress'
                                      ? isDark ? 'bg-blue-950 text-blue-300 border-blue-800' : 'bg-blue-50 text-blue-700 border-blue-300'
                                      : isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-300'
                                  }`}
                                >
                                  {task.status === 'done' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                                  {task.status === 'done'
                                    ? 'Đã hoàn thành'
                                    : task.status === 'in_progress'
                                    ? 'Đang thực hiện'
                                    : 'Chờ làm'}
                                </span>
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap">
                                {task.isOverdue ? (
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                    isDark ? 'bg-rose-950 text-rose-300 border-rose-800' : 'bg-rose-50 text-rose-700 border-rose-300'
                                  }`}>
                                    Trễ {task.delayDays || 1} ngày ({task.dueDate})
                                  </span>
                                ) : (
                                  <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {task.dueDate || selectedSprint.endDate}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* 3.3: BIỂU ĐỒ TIẾN ĐỘ PROJECT: SO SÁNH TIẾN ĐỘ THỰC TẾ VS KẾ HOẠCH */}
      <div
        className={`p-5 rounded-2xl border shadow-xl ${
          isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-black uppercase tracking-wide text-slate-200">
                BIỂU ĐỒ TIẾN ĐỘ PROJECT: SO SÁNH TIẾN ĐỘ THỰC TẾ VS KẾ HOẠCH
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Nhấn trực tiếp vào tên dự án hoặc nút "Xem Chi Tiết Báo Cáo" để mở hồ sơ phân tích toàn diện (như file baocao.html)
            </p>
          </div>

          {/* Status Filter buttons */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
            {['ALL', 'Đang thực hiện', 'Chậm tiến độ', 'Hoàn thành', 'Tạm dừng'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {st === 'ALL' ? 'Tất cả trạng thái' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Project Progress Cards / Grid */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProjects.map((project) => {
            const isBehind = project.progress < project.plannedProgress;
            const isOverdue = project.overdueTasksCount > 0;

            return (
              <div
                key={project.id}
                onClick={() => onSelectProject(project)}
                className={`p-4 rounded-xl border transition-all cursor-pointer group flex flex-col justify-between ${
                  isDark
                    ? 'bg-[#141e33] border-slate-800 hover:border-blue-500/60 hover:bg-[#16233d]'
                    : 'bg-slate-50 border-slate-200 hover:border-blue-400 hover:bg-white'
                }`}
              >
                {/* Top: Project Info & Badges */}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-xs font-black text-blue-400 bg-blue-950/70 border border-blue-800/80 px-2 py-0.5 rounded shrink-0">
                          {project.code}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            project.type === 'maintenance'
                              ? 'bg-sky-950 text-sky-300 border border-sky-800'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {project.type === 'maintenance' ? 'Bảo trì hệ thống' : 'Dự án mới'}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 border ${
                            getProjectStatusMeta(project.status).badgeClass
                          }`}
                        >
                          {getProjectStatusMeta(project.status).label}
                        </span>
                      </div>

                      <h4 className="text-sm font-extrabold text-white mt-1.5 group-hover:text-blue-300 transition-colors flex items-center gap-1.5">
                        <span className="truncate">{project.name}</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400 shrink-0" />
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        Khách hàng: <span className="text-slate-300 font-semibold">{project.client}</span> • PM: <span className="text-blue-300 font-semibold">{project.pmName}</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-slate-400 whitespace-nowrap">Tiến độ thực tế</div>
                      <div className="text-2xl font-black text-white flex items-baseline justify-end gap-1">
                        <span
                          className={
                            project.progress >= 90
                              ? 'text-emerald-400'
                              : isBehind
                              ? 'text-amber-400'
                              : 'text-blue-400'
                          }
                        >
                          {project.progress}%
                        </span>
                        <span className="text-xs text-slate-400 font-normal whitespace-nowrap">
                          / {project.plannedProgress}% KH
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dual Progress Bar: Real vs Planned benchmark */}
                  <div className="mt-3">
                    <div className="relative h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700/60">
                      {/* Real Progress Fill */}
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          project.progress >= 90
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                            : isBehind
                            ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                            : 'bg-gradient-to-r from-blue-600 to-sky-400'
                        }`}
                        style={{ width: `${project.progress}%` }}
                      />

                      {/* Planned Benchmark Marker */}
                      <div
                        className="absolute top-0 bottom-0 w-1 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] z-10"
                        style={{ left: `${project.plannedProgress}%` }}
                        title={`Kế hoạch chuẩn: ${project.plannedProgress}%`}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      <span>Bắt đầu: {project.startDate}</span>
                      <span className="flex items-center gap-1 font-bold text-amber-400">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        Mốc KH: {project.plannedProgress}% ({project.plannedDeadline || project.deadline})
                      </span>
                      <span>Hạn dự kiến: {project.actualExpectedDeadline || project.deadline}</span>
                    </div>
                  </div>

                  {/* Metrics sub-strip: Hours Burned, SLA OTD, Tasks Status */}
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800 text-[11px]">
                    <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800/80">
                      <span className="text-slate-400 text-[10px] block">Tiêu hao giờ công</span>
                      <span className="font-bold text-slate-200">
                        {project.actualHours}h / {project.totalBudgetHours}h
                      </span>
                      <span className="text-[10px] text-amber-400 block mt-0.5">
                        ({project.budgetSpentPercent}%)
                      </span>
                    </div>

                    <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800/80">
                      <span className="text-slate-400 text-[10px] block">Chỉ số SLA OTD</span>
                      <span
                        className={`font-black ${
                          project.slaOtd >= 90 ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {project.slaOtd}%
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Đúng hạn</span>
                    </div>

                    <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800/80">
                      <span className="text-slate-400 text-[10px] block">Tình trạng Task</span>
                      <span className="font-bold text-slate-200">
                        {project.completedTasksCount}/{project.tasksCount} xong
                      </span>
                      {isOverdue ? (
                        <span className="text-[10px] text-rose-400 font-bold block mt-0.5">
                          ⚠️ {project.overdueTasksCount} task trễ
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">
                          ✓ Không trễ
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Accounting & Financials summary chip */}
                  <div className="mt-2.5 px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-[11px] gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">HĐ:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {project.contractValueMillionVND !== undefined
                          ? `${(project.contractValueMillionVND / 1000).toFixed(2)} tỷ`
                          : `${project.revenueBillionVND || 2} tỷ`}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400">
                        Đã thu: <strong className="text-slate-200">
                          {project.invoicedMillionVND !== undefined
                            ? `${(project.invoicedMillionVND / 1000).toFixed(2)} tỷ`
                            : `${Math.round((project.revenueBillionVND || 2) * (project.progress / 100) * 10) / 10} tỷ`}
                        </strong>
                      </span>
                    </div>

                    {project.penaltyRiskPercent && project.penaltyRiskPercent > 0 ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800 shrink-0">
                        Rủi ro phạt {project.penaltyRiskPercent}%
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-400/90 shrink-0">
                        {project.status === 'completed' || project.status === 'Hoàn thành' ? '✓ Đã nghiệm thu' : 'An toàn HĐ'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs flex-wrap gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadProjectCSV(project, sprintProgressList, activeKPI);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 hover:bg-emerald-900 border border-emerald-800/80 text-[11px] font-bold transition"
                    title="Xuất bảng báo cáo dự án ra Excel (CSV chuẩn UTF-8 BOM đầy đủ tài chính, tiến độ và KPI)"
                  >
                    <Download className="w-3 h-3 text-emerald-400" />
                    <span>Xuất Excel Dự Án</span>
                  </button>
                  <span className="text-blue-400 font-bold group-hover:text-blue-300 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Xem Hồ Sơ Báo Cáo Chi Tiết</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

