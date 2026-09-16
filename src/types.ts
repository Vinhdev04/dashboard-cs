export type TimePeriod = 'today' | 'week' | 'month' | 'year';

export type ActiveNavTab = 'dashboard' | 'today' | 'team' | 'reports' | 'member';

export type ComparisonTrend = 'up' | 'down' | 'equal';

// OLD: export type ProjectType = 'maintenance' | 'new';
export type ProjectType = 'maintenance' | 'new' | 'qa_testing' | 'analysis_rd' | 'infra_opt';

export type ProjectStatus = 'in_progress' | 'delayed' | 'completed' | 'paused' | 'planning' | 'on_hold' | 'review' | 'testing';

export type TaskType = 'feature' | 'bug' | 'maintenance' | 'rework' | 'cr';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'testing' | 'done';

export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  code: string;
  title: string;
  projectId: string;
  projectName: string;
  clientName: string;
  assigneeId: string;
  assigneeName: string;
  assigneeAvatar: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  estimatedHours: number;
  actualHours: number;
  dueDate: string; // YYYY-MM-DD
  createdDate: string;
  isToday: boolean;
  isOverdueToday: boolean;
  delayDays?: number;
  delayReason?: string;
  sprintName?: string;
}

export interface ProjectPhase {
  id: string;
  name: string;
  period: string;
  plannedHours: number;
  actualHours: number;
  status: 'completed' | 'in_progress' | 'planned';
  acceptanceRate: number;
  mainGoal?: string;
  taskCount?: number;
}

export interface ProjectOverdueItem {
  code: string;
  title: string;
  type: string;
  assignee: string;
  reviewer: string;
  dueDate: string;
  actualCompletionDate?: string;
  delayDays: number;
  reason: string;
  mitigation?: string;
}

export interface ProjectMemberStat {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
  role: string;
  totalTasks: number;
  baselineTasks: number;
  crTasks: number;
  estimatedHours: number;
  actualHours: number;
  overdueTasks: number;
  onTimeRate: number;
  performanceRating: 'Xuất Sắc' | 'Tốt' | 'Khá (Vượt Giờ)' | 'Đạt Yêu Cầu' | 'Cần Cải Thiện';
}

export interface ProjectWorkLogItem {
  id: string;
  code: string;
  memberName: string;
  memberAvatar?: string;
  taskTitle: string;
  phaseSprint: string;
  estimatedHours: number;
  actualHours: number;
  status: 'done' | 'delayed' | 'in_progress' | 'todo';
  statusLabel: string;
  deliveryResult: string;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  client: string;
  type: ProjectType;
  status: ProjectStatus;
  progress: number; // 0 - 100 (Thực tế)
  plannedProgress: number; // Kế hoạch e.g. 80%
  startDate: string;
  deadline: string;
  plannedDeadline?: string;
  actualExpectedDeadline?: string;
  delayWeeks?: number;
  delayReasonSummary?: string;
  totalBudgetHours: number;
  actualHours: number;
  budgetSpentPercent: number; // e.g. 72%
  revenueBillionVND: number;
  slaOtd: number; // On-time delivery rate %
  tasksCount: number;
  completedTasksCount: number;
  bugTasksCount: number;
  reworkTasksCount: number;
  overdueTasksCount: number;
  crTasksCount: number;
  baselineTasksCount: number;
  pmName: string;
  pmRole: string;
  pmAvatar: string;
  phases?: ProjectPhase[];
  overdueAnalysis?: ProjectOverdueItem[];
  // Dữ liệu kế toán & tài chính đối soát (Accounting & Finance)
  contractValueMillionVND?: number; // Giá trị hợp đồng (triệu VNĐ)
  invoicedMillionVND?: number; // Đã xuất hóa đơn / nghiệm thu (triệu VNĐ)
  laborRatePerHourVND?: number; // Đơn giá nhân công quy chuẩn (VNĐ/giờ)
  penaltyRiskPercent?: number; // Tỷ lệ rủi ro phạt hợp đồng nếu trễ hạn (%)
  accountingNotes?: string;
  scopeDescription?: string;
  totalWeeks?: number;
  memberStats?: ProjectMemberStat[];
  detailedWorkLogs?: ProjectWorkLogItem[];
  paymentMilestones?: {
    milestone: string;
    percentage: number;
    amountMillionVND: number;
    status: 'paid' | 'invoiced' | 'pending' | 'overdue';
    dueDate: string;
  }[];
}

export interface Employee {
  id: string;
  code: string;
  name: string;
  role: string;
  department: string;
  avatar: string;
  email: string;
  phone: string;
  // Resource tracking (Today hard metric)
  quotaHours: number; // Quy định chuẩn: 8.0h
  allocatedHoursToday: number;
  remainingHoursToday: number;
  // Performance metric for chosen period
  totalTasks: number;
  totalHours: number;
  overdueTasksCount: number;
  overdueRate: number; // %
  targetOverdueRate: number; // Mục tiêu công ty (e.g. <= 3.0%)
  bugTasksCount: number;
  bugRate: number; // %
  targetBugRate: number; // Mục tiêu công ty (e.g. <= 1.5%)
  reworkTasksCount: number;
  reworkRate: number; // %
  targetReworkRate: number; // Mục tiêu công ty (e.g. <= 2.0%)
  performanceRating?: 'Xuất Sắc' | 'Tốt' | 'Khá' | 'Khá (Vượt Giờ)' | 'Cần Cải Thiện';
  kpiGrade?: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | string;
}

export interface SprintTaskItem {
  id: string;
  code: string;
  title: string;
  assigneeName: string;
  assigneeAvatar?: string;
  storyPoints: number;
  estimatedHours?: number;
  actualHours?: number;
  type: 'feature' | 'bug' | 'cr' | 'rework' | 'maintenance';
  status: 'done' | 'in_progress' | 'todo';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  dueDate?: string;
  isOverdue?: boolean;
  delayDays?: number;
  delayReason?: string;
}

export interface Sprint {
  id: string;
  name: string;
  projectCode?: string;
  projectName: string;
  clientName: string;
  status: 'in_progress' | 'planned' | 'completed' | 'delayed';
  startDate: string;
  endDate: string;
  committedPoints: number;
  completedPoints: number;
  totalTasks: number;
  progress: number;
  goal?: string;
  velocity?: number; // SP / ngày
  forecastEndDate?: string;
  forecastStatus?: 'on_track' | 'at_risk' | 'delayed';
  delayDays?: number; // Số ngày trễ so với kế hoạch
  delayReason?: string;
  burndown: { day: string; ideal: number; actual?: number; forecast?: number; isToday?: boolean }[];
  burnup?: { day: string; totalScope: number; completed: number; isToday?: boolean }[];
  sprintTasks?: SprintTaskItem[];
}

export interface KPIAuditRecord {
  id: string;
  year: number;
  title: string;
  maxReworkRate: number; // e.g. 5%
  maxOverdueRate: number; // e.g. 10%
  maxBugRate: number; // e.g. 4%
  status: 'active' | 'archived';
  appliedAt: string;
  updatedBy: string;
  notes: string;
}

export interface CompanyKPIConfig {
  year: number;
  maxReworkRate: number; // e.g. 5%
  maxOverdueRate: number; // e.g. 10%
  maxBugRate: number; // e.g. 4%
  status: 'active' | 'archived';
  notes: string;
  auditTrail: KPIAuditRecord[];
}

export interface ComparisonStat {
  current: number;
  previous: number;
  percentChange: number;
  trend: ComparisonTrend;
  label: string;
}

export interface OverviewMetricsData {
  maintenanceProjects: ComparisonStat;
  newProjects: ComparisonStat;
  totalTasks: ComparisonStat;
  overdueRate: {
    value: number; // e.g. 4.2%
    target: number; // e.g. 3.0%
    isExceeded: boolean;
    previousValue?: number;
    diffText?: string;
    trend?: ComparisonTrend;
    varianceFromTarget?: number;
  };
  bugRate: {
    value: number; // e.g. 1.8%
    target: number; // e.g. 1.5%
    isExceeded: boolean;
    previousValue?: number;
    diffText?: string;
    trend?: ComparisonTrend;
    varianceFromTarget?: number;
  };
  reworkRate: {
    value: number; // e.g. 2.1%
    target: number; // e.g. 2.0%
    isExceeded: boolean;
    previousValue?: number;
    diffText?: string;
    trend?: ComparisonTrend;
    varianceFromTarget?: number;
  };
}

export interface TodayHardMetrics {
  totalTasksToday: number;
  completedTasksToday: number;
  inProgressTasksToday: number;
  overdueTasksToday: number;
  remainingHoursToday: number;
  totalQuotaHoursToday: number;
  underQuotaEmployees: {
    employee: Employee;
    allocatedTasks: Task[];
  }[];
}

export interface WidgetConfig {
  id: string;
  title: string;
  sectionCategory: 'today' | 'overview' | 'charts' | 'employee';
  enabled: boolean;
  collapsed: boolean;
  order: number;
}

export interface DailyReportTaskItem {
  taskId?: string;
  taskCode: string;
  taskTitle: string;
  projectName?: string;
  hoursSpent: number;
  progressPercent: number;
  status: 'done' | 'in_progress' | 'blocked';
  notes?: string;
}

export interface DailyWorkReport {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  employeeAvatar?: string;
  department: string;
  date: string; // YYYY-MM-DD
  submittedAt: string;
  hoursLogged: number;
  completedSummary: string;
  inProgressSummary: string;
  blockers?: string;
  tomorrowPlan?: string;
  completionRateScore?: number; // 0-100%
  status: 'submitted' | 'reviewed' | 'needs_clarification';
  managerFeedback?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  tasks: DailyReportTaskItem[];
}

