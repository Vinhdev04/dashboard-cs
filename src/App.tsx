import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { TodayWorkTracker } from './components/TodayWorkTracker';
import { OverviewMetrics } from './components/OverviewMetrics';
import { ProjectSprintCharts } from './components/ProjectSprintCharts';
import { EmployeePerformance } from './components/EmployeePerformance';
import { ProjectDetailReportModal } from './components/ProjectDetailReportModal';
import { CustomWidgetsModal } from './components/CustomWidgetsModal';
import { ImportExportModal } from './components/ImportExportModal';
import { KPIConfigurationModal } from './components/KPIConfigurationModal';
import {
  TodayTasksModal,
  TodayOverdueModal,
  TodayResourceModal,
  MetricEmployeesModal,
  EmployeeDetailModal,
  ProjectsDetailModal,
  AllTasksDetailModal,
} from './components/Modals';
import { TimePeriod, Employee, Task, Project, Sprint, WidgetConfig, CompanyKPIConfig } from './types';
import {
  getMetricsForPeriod,
  getTodayHardMetrics,
  RAW_PROJECTS,
  RAW_TASKS,
  RAW_EMPLOYEES,
  RAW_SPRINTS,
  DEFAULT_KPI_CONFIG,
} from './data/mockData';
import { ChevronDown, ChevronRight, EyeOff, LayoutGrid } from 'lucide-react';

const DEFAULT_WIDGETS: WidgetConfig[] = [
  {
    id: 'section-today',
    title: 'Mục 5: Theo Dõi Công Việc Hôm Nay (Hard Metrics Cố Định)',
    sectionCategory: 'today',
    enabled: true,
    collapsed: false,
    order: 1,
  },
  {
    id: 'section-overview',
    title: 'Mục 2: Tổng Quan Chỉ Số Dự Án & Chất Lượng (6 Thẻ KPI)',
    sectionCategory: 'overview',
    enabled: true,
    collapsed: false,
    order: 2,
  },
  {
    id: 'section-charts',
    title: 'Mục 3: Project & Sprint Analytics (Hình 3 & 4 Trực Quan)',
    sectionCategory: 'charts',
    enabled: true,
    collapsed: false,
    order: 3,
  },
  {
    id: 'section-employee',
    title: 'Mục 4: Hiệu Suất & Chỉ Số Chất Lượng Nhân Viên (Hình 5 & 6)',
    sectionCategory: 'employee',
    enabled: true,
    collapsed: false,
    order: 4,
  },
];

export default function App() {
  const [currentPeriod, setCurrentPeriod] = useState<TimePeriod>('today');
  const [showComparison, setShowComparison] = useState<boolean>(true);
  const [isDark, setIsDark] = useState<boolean>(true);

  /** Tự động đồng bộ class dark lên html root element để đảm bảo tất cả các Modal Popups nhận theme tối chống chói */
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Dynamic system state for projects, employees, tasks, sprints
  const [projectsList, setProjectsList] = useState<Project[]>(RAW_PROJECTS);
  const [employeesList, setEmployeesList] = useState<Employee[]>(RAW_EMPLOYEES);
  const [tasksList, setTasksList] = useState<Task[]>(RAW_TASKS);
  const [sprintsList, setSprintsList] = useState<Sprint[]>(RAW_SPRINTS);

  // Widget custom layout configuration with localStorage memory
  const [widgets, setWidgets] = useState<WidgetConfig[]>(() => {
    try {
      const saved = localStorage.getItem('chips_dashboard_widgets_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      // ignore
    }
    return DEFAULT_WIDGETS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('chips_dashboard_widgets_v2', JSON.stringify(widgets));
    } catch (e) {
      // ignore
    }
  }, [widgets]);

  // Modal states
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isCustomWidgetsOpen, setIsCustomWidgetsOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [isKPIConfigOpen, setIsKPIConfigOpen] = useState(false);

  // OLD:
  // const [companyKPIConfig, setCompanyKPIConfig] = useState<CompanyKPIConfig>(() => {
  //   try {
  //     const saved = localStorage.getItem('chips_company_kpi_config');
  //     if (saved) {
  //       const parsed = JSON.parse(saved);
  //       if (parsed && typeof parsed === 'object' && typeof parsed.year === 'number') {
  //         return { ...DEFAULT_KPI_CONFIG, ...parsed };
  //       }
  //     }
  //   } catch (e) {}
  //   return DEFAULT_KPI_CONFIG;
  // });

  /** Cấu hình KPI mục tiêu công ty áp dụng mặc định chuẩn client-cs (maxOverdueRate: 3.5%, maxBugRate: 4.0%, maxReworkRate: 5.0%) */
  const [companyKPIConfig, setCompanyKPIConfig] = useState<CompanyKPIConfig>(() => {
    try {
      const saved = localStorage.getItem('chips_company_kpi_config_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && typeof parsed.year === 'number') {
          return {
            ...DEFAULT_KPI_CONFIG,
            ...parsed,
          };
        }
      }
    } catch (e) {
      // ignore
    }
    return DEFAULT_KPI_CONFIG;
  });

  const handleSaveKPIConfig = (newConfig: CompanyKPIConfig) => {
    setCompanyKPIConfig(newConfig);
    try {
      localStorage.setItem('chips_company_kpi_config_v3', JSON.stringify(newConfig));
    } catch (e) {
      // ignore
    }
  };

  const [isTodayTasksModalOpen, setIsTodayTasksModalOpen] = useState(false);
  const [isTodayOverdueModalOpen, setIsTodayOverdueModalOpen] = useState(false);
  const [isTodayResourceModalOpen, setIsTodayResourceModalOpen] = useState(false);
  const [activeMetricDetail, setActiveMetricDetail] = useState<'overdue' | 'bug' | 'rework' | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  // State quản lý xem chi tiết Dự án Bảo trì / Dự án mới và Tổng số Task
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);
  const [selectedProjectType, setSelectedProjectType] = useState<'maintenance' | 'new' | null>(null);
  const [isAllTasksModalOpen, setIsAllTasksModalOpen] = useState(false);

  // Section 5 Hard metrics (today independent of filter)
  const todayHardMetrics = useMemo(() => getTodayHardMetrics(), [tasksList, employeesList]);

  // Section 2, 3, 4 metrics depending on period and active company KPI config
  const periodData = useMemo(
    () => getMetricsForPeriod(currentPeriod, companyKPIConfig),
    [currentPeriod, companyKPIConfig, projectsList, employeesList, tasksList]
  );

  // Handlers for Custom Widgets
  const handleToggleWidget = (id: string) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w))
    );
  };

  const handleToggleCollapse = (id: string) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, collapsed: !w.collapsed } : w))
    );
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setWidgets((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next.map((item, idx) => ({ ...item, order: idx + 1 }));
    });
  };

  const handleMoveDown = (index: number) => {
    setWidgets((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next.map((item, idx) => ({ ...item, order: idx + 1 }));
    });
  };

  const handleResetDefaultWidgets = () => {
    setWidgets(DEFAULT_WIDGETS);
  };

  // Handlers for Import / Export & Reset
  const handleImportData = (incoming: {
    projects?: Project[];
    employees?: Employee[];
    tasks?: Task[];
    sprints?: Sprint[];
  }) => {
    if (incoming.projects && incoming.projects.length > 0) setProjectsList(incoming.projects);
    if (incoming.employees && incoming.employees.length > 0) setEmployeesList(incoming.employees);
    if (incoming.tasks && incoming.tasks.length > 0) setTasksList(incoming.tasks);
    if (incoming.sprints && incoming.sprints.length > 0) setSprintsList(incoming.sprints);
  };

  const handleResetData = () => {
    setProjectsList(RAW_PROJECTS);
    setEmployeesList(RAW_EMPLOYEES);
    setTasksList(RAW_TASKS);
    setSprintsList(RAW_SPRINTS);
  };

  const [selectedEmployeeForTasks, setSelectedEmployeeForTasks] = useState<Employee | null>(null);


  /** Mở Modal Danh sách Task dạng Card Layout Mẫu Hình 3 của nhân viên cụ thể */
  const handleOpenEmployeeTaskModal = (employee: Employee, _tasks?: Task[]) => {
    setSelectedEmployeeForTasks(employee);
    setIsTodayTasksModalOpen(true);
  };

  // Render individual widget component by ID
  const renderWidgetContent = (widgetId: string) => {
    switch (widgetId) {
      case 'section-today':
        return (
          <TodayWorkTracker
            metrics={todayHardMetrics}
            onOpenTasksModal={() => setIsTodayTasksModalOpen(true)}
            onOpenOverdueModal={() => setIsTodayOverdueModalOpen(true)}
            onOpenResourceModal={() => setIsTodayResourceModalOpen(true)}
            onOpenEmployeeTaskModal={handleOpenEmployeeTaskModal}
          />
        );
      case 'section-overview':
        return (
          <OverviewMetrics
            data={periodData.overview}
            period={currentPeriod}
            showComparison={showComparison}
            onOpenEmployeeDetail={(type) => setActiveMetricDetail(type)}
            onOpenProjectsDetail={(projectType) => {
              setSelectedProjectType(projectType);
              setIsProjectsModalOpen(true);
            }}
            onOpenTasksDetail={() => setIsAllTasksModalOpen(true)}
            isDark={isDark}
          />
        );
      case 'section-charts':
        return (
          <ProjectSprintCharts
            projects={projectsList}
            projectStatusCount={periodData.projectStatusCount}
            projectTypeCount={periodData.projectTypeCount}
            taskTypeCount={periodData.taskTypeCount}
            taskStatusCount={periodData.taskStatusCount}
            sprintProgressList={sprintsList}
            onSelectProject={(project) => setSelectedProject(project)}
            isDark={isDark}
            companyKPIConfig={companyKPIConfig}
          />
        );
      case 'section-employee':
        return (
          <EmployeePerformance
            topHighestTasks={periodData.topHighestTasks}
            topHighestHours={periodData.topHighestHours}
            topLowestTasks={periodData.topLowestTasks}
            topLowestHours={periodData.topLowestHours}
            allEmployees={employeesList}
            onSelectEmployee={(emp) => setSelectedEmployee(emp)}
            isDark={isDark}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors ${
        isDark ? 'bg-[#080d1a] text-slate-100' : 'bg-slate-50 text-slate-800'
      }`}
    >
      {/* 1. Header with Time Filter & Action Tools */}
      <Header
        currentPeriod={currentPeriod}
        onPeriodChange={setCurrentPeriod}
        showComparison={showComparison}
        onToggleComparison={setShowComparison}
        onOpenCustomWidgets={() => setIsCustomWidgetsOpen(true)}
        onOpenImportExport={() => setIsImportExportOpen(true)}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
      />

      {/* Main Dashboard Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-7 flex-1">
        {/* Dynamic Ordered & Filterable Widgets */}
        {(Array.isArray(widgets) ? widgets : DEFAULT_WIDGETS)
          .filter((w) => w && w.enabled)
          .map((widget) => {
            if (widget.collapsed) {
              return (
                <div
                  key={widget.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition shadow-sm ${
                    isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleCollapse(widget.id)}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-slate-300">{widget.title}</span>
                    <span className="text-[10px] text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded-full">
                      Đang thu gọn
                    </span>
                  </div>
                  <button
                    onClick={() => handleToggleCollapse(widget.id)}
                    className="text-xs text-blue-400 hover:underline font-semibold"
                  >
                    Mở rộng tiện ích
                  </button>
                </div>
              );
            }

            return (
              <div key={widget.id} className="relative group/widget">
                {renderWidgetContent(widget.id)}
              </div>
            );
          })}
      </main>

      {/* Project Detail Modal (như file baocao.html) */}
      {selectedProject && (
        <ProjectDetailReportModal
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          project={selectedProject}
          allTasks={tasksList}
          isDark={isDark}
        />
      )}

      {/* Custom Widgets Manager Modal */}
      <CustomWidgetsModal
        isOpen={isCustomWidgetsOpen}
        onClose={() => setIsCustomWidgetsOpen(false)}
        widgets={widgets}
        onToggleWidget={handleToggleWidget}
        onToggleCollapse={handleToggleCollapse}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
        onResetDefault={handleResetDefaultWidgets}
        isDark={isDark}
      />

      {/* Import / Export & Backup Modal */}
      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        projects={projectsList}
        employees={employeesList}
        tasks={tasksList}
        sprints={sprintsList}
        onImportData={handleImportData}
        onResetData={handleResetData}
        isDark={isDark}
        companyKPIConfig={companyKPIConfig}
      />

      {/* Company KPI Configuration Modal */}
      <KPIConfigurationModal
        isOpen={isKPIConfigOpen}
        onClose={() => setIsKPIConfigOpen(false)}
        kpiConfig={companyKPIConfig}
        config={companyKPIConfig}
        onUpdateConfig={handleSaveKPIConfig}
        onSave={handleSaveKPIConfig}
        isDark={isDark}
      />

      {/* Sub-modals for Section 5 Hard Metrics */}
      <TodayTasksModal
        isOpen={isTodayTasksModalOpen}
        onClose={() => {
          setIsTodayTasksModalOpen(false);
          setSelectedEmployeeForTasks(null);
        }}
        tasks={tasksList}
        employee={selectedEmployeeForTasks}
        isDark={isDark}
      />

      <TodayOverdueModal
        isOpen={isTodayOverdueModalOpen}
        onClose={() => setIsTodayOverdueModalOpen(false)}
        tasks={tasksList.filter((t) => t.isOverdueToday)}
        isDark={isDark}
      />

      <TodayResourceModal
        isOpen={isTodayResourceModalOpen}
        onClose={() => setIsTodayResourceModalOpen(false)}
        employees={employeesList}
        tasks={tasksList}
        metrics={todayHardMetrics}
        onSelectEmployee={(emp) => handleOpenEmployeeTaskModal(emp)}
        isDark={isDark}
      />

      {/* Metric Employees Detail Modal (Overdue, Bug, Rework) */}
      <MetricEmployeesModal
        isOpen={!!activeMetricDetail}
        onClose={() => setActiveMetricDetail(null)}
        metricType={activeMetricDetail}
        employees={employeesList}
        tasks={tasksList}
        onSelectEmployee={(emp) => setSelectedEmployee(emp)}
        isDark={isDark}
      />

      {/* Single Employee Detail Modal */}
      <EmployeeDetailModal
        isOpen={!!selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        employee={selectedEmployee}
        tasks={tasksList.filter((t) => t.assigneeId === selectedEmployee?.id)}
        isDark={isDark}
      />

      {/* Projects Detail Modal (Maintenance / New) */}
      <ProjectsDetailModal
        isOpen={isProjectsModalOpen}
        onClose={() => {
          setIsProjectsModalOpen(false);
          setSelectedProjectType(null);
        }}
        projectType={selectedProjectType}
        projects={projectsList}
        onSelectProject={(project) => setSelectedProjectForReport(project)}
        isDark={isDark}
      />

      {/* All Tasks Detail Modal */}
      <AllTasksDetailModal
        isOpen={isAllTasksModalOpen}
        onClose={() => setIsAllTasksModalOpen(false)}
        tasks={tasksList}
        projects={projectsList}
        isDark={isDark}
      />

      {/* Footer */}
      <footer
        className={`border-t py-4 text-xs print:hidden mt-10 transition-colors ${
          isDark ? 'bg-[#0b1120] border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="font-bold text-slate-200">CHIPS ERP PROJECT & RESOURCE MANAGEMENT PLATFORM</span> • Phiên bản 3.2.0
            <p className="text-[11px] text-slate-500 mt-0.5">
              Tích hợp đầy đủ hồ sơ chi tiết dự án (baocao.html), cấu hình Custom Widgets, Import/Export dữ liệu và đối soát tiến độ thời gian thực
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsCustomWidgetsOpen(true)}
              className="text-blue-400 hover:underline flex items-center gap-1"
            >
              <LayoutGrid className="w-3 h-3" /> Cấu hình Widget
            </button>
            <span>•</span>
            <button
              onClick={() => setIsImportExportOpen(true)}
              className="text-emerald-400 hover:underline"
            >
              Xuất / Nhập dữ liệu
            </button>
            <span>•</span>
            <button onClick={() => window.print()} className="hover:text-slate-300">
              In báo cáo A4
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
