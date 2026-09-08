import React, { useState, useRef, useMemo } from 'react';
import {
  X,
  Download,
  Upload,
  FileSpreadsheet,
  FileCode,
  Printer,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  FileText,
  Database,
  Copy,
  Check,
  Search,
  Sliders,
  DollarSign,
  Building2,
  Calendar,
  AlertTriangle,
  TrendingUp,
  Percent,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { Employee, Project, Sprint, Task, CompanyKPIConfig } from '../types';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  employees: Employee[];
  tasks: Task[];
  sprints: Sprint[];
  onImportData: (data: {
    projects?: Project[];
    employees?: Employee[];
    tasks?: Task[];
    sprints?: Sprint[];
  }) => void;
  onResetData: () => void;
  isDark?: boolean;
  companyKPIConfig?: CompanyKPIConfig;
}

interface ColumnConfig {
  id: string;
  label: string;
  shortLabel: string;
  category: 'common' | 'financial' | 'labor' | 'risk';
}

const ACCOUNTING_COLUMNS: ColumnConfig[] = [
  { id: 'stt', label: 'STT', shortLabel: 'STT', category: 'common' },
  { id: 'code', label: 'Mã Dự Án', shortLabel: 'Mã DA', category: 'common' },
  { id: 'name', label: 'Tên Dự Án', shortLabel: 'Tên DA', category: 'common' },
  { id: 'client', label: 'Khách Hàng / Chủ Đầu Tư', shortLabel: 'Khách Hàng', category: 'common' },
  { id: 'status', label: 'Trạng Thái Dự Án', shortLabel: 'Trạng Thái', category: 'common' },
  { id: 'progress', label: 'Tiến Độ Thực Tế (%)', shortLabel: 'Tiến Độ', category: 'common' },
  { id: 'contractValue', label: 'Giá Trị Hợp Đồng (Triệu VNĐ)', shortLabel: 'Giá Trị HĐ', category: 'financial' },
  { id: 'invoiced', label: 'Đã Xuất HĐ / Thu Hồi (Triệu VNĐ)', shortLabel: 'Đã Xuất HĐ', category: 'financial' },
  { id: 'remainingDebt', label: 'Công Nợ Còn Lại (Triệu VNĐ)', shortLabel: 'Công Nợ', category: 'financial' },
  { id: 'collectionRate', label: 'Tỷ Lệ Thu Hồi (%)', shortLabel: '% Thu Hồi', category: 'financial' },
  { id: 'hours', label: 'Giờ Thực Tế / Kế Hoạch (h)', shortLabel: 'Giờ Công', category: 'labor' },
  { id: 'laborRate', label: 'Đơn Giá Giờ (VNĐ/h)', shortLabel: 'Đơn Giá/h', category: 'labor' },
  { id: 'laborCost', label: 'Chi Phí Nhân Sự (Triệu VNĐ)', shortLabel: 'Chi Phí NS', category: 'labor' },
  { id: 'grossProfit', label: 'Lãi Gộp Kế Toán (Triệu VNĐ)', shortLabel: 'Lãi Gộp', category: 'financial' },
  { id: 'penaltyRisk', label: 'Rủi Ro Phạt HĐ (%)', shortLabel: 'Rủi Ro Phạt', category: 'risk' },
  { id: 'pm', label: 'Quản Lý Dự Án (PM)', shortLabel: 'PM', category: 'common' },
  { id: 'notes', label: 'Ghi Chú Kế Toán & Điều Khoản', shortLabel: 'Ghi Chú KT', category: 'financial' },
];

const DEFAULT_VISIBLE_COLUMNS = [
  'stt',
  'code',
  'name',
  'client',
  'status',
  'contractValue',
  'invoiced',
  'remainingDebt',
  'collectionRate',
  'laborCost',
  'grossProfit',
  'penaltyRisk',
  'notes',
];

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  projects,
  employees,
  tasks,
  sprints,
  onImportData,
  onResetData,
  isDark = true,
}) => {
  const [activeTab, setActiveTab] = useState<'accounting' | 'export' | 'import'>('accounting');

  // Accounting tab state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [visibleColumns, setVisibleColumns] = useState<string[]>(DEFAULT_VISIBLE_COLUMNS);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Import state
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importPreview, setImportPreview] = useState<{
    projectsCount: number;
    tasksCount: number;
    employeesCount: number;
    data: any;
  } | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper status formatter
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'in_progress':
      case 'Đang thực hiện':
        return {
          label: 'Đang thực hiện',
          badgeClass: 'bg-blue-950/80 text-blue-300 border-blue-800',
        };
      case 'delayed':
      case 'Chậm tiến độ':
        return {
          label: 'Chậm tiến độ',
          badgeClass: 'bg-rose-950/80 text-rose-300 border-rose-800',
        };
      case 'completed':
      case 'Hoàn thành':
        return {
          label: 'Hoàn thành',
          badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
        };
      case 'paused':
      case 'on_hold':
      case 'Tạm dừng':
        return {
          label: 'Tạm dừng',
          badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
        };
      default:
        return {
          label: status || 'Đang thực hiện',
          badgeClass: 'bg-blue-950/80 text-blue-300 border-blue-800',
        };
    }
  };

  // Process and enrich projects with accounting calculations
  const enrichedProjects = useMemo(() => {
    return projects.map((p, idx) => {
      const contractValue =
        p.contractValueMillionVND !== undefined
          ? p.contractValueMillionVND
          : p.revenueBillionVND
          ? Math.round(p.revenueBillionVND * 1000)
          : 2000;

      const invoiced =
        p.invoicedMillionVND !== undefined
          ? p.invoicedMillionVND
          : Math.round(contractValue * (p.progress / 100));

      const remainingDebt = Math.max(0, contractValue - invoiced);
      const collectionRate = contractValue > 0 ? Math.round((invoiced / contractValue) * 100) : 0;
      const laborRate = p.laborRatePerHourVND || 320000;
      const laborCost = Math.round((p.actualHours * laborRate) / 1000000);
      const grossProfit = contractValue - laborCost;
      const grossMargin = contractValue > 0 ? Math.round((grossProfit / contractValue) * 100) : 0;
      const penaltyRisk =
        p.penaltyRiskPercent !== undefined
          ? p.penaltyRiskPercent
          : p.status === 'delayed'
          ? 5
          : 0;
      const penaltyAmount = Math.round((contractValue * penaltyRisk) / 100);

      const statusMeta = getStatusDisplay(p.status);

      return {
        ...p,
        stt: idx + 1,
        contractValue,
        invoiced,
        remainingDebt,
        collectionRate,
        laborRate,
        laborCost,
        grossProfit,
        grossMargin,
        penaltyRisk,
        penaltyAmount,
        statusLabel: statusMeta.label,
        statusBadgeClass: statusMeta.badgeClass,
        accountingNotesText:
          p.accountingNotes ||
          (p.status === 'completed'
            ? 'Đã nghiệm thu thanh lý hợp đồng 100%'
            : p.status === 'delayed'
            ? 'Cảnh báo chậm mốc nghiệm thu, nguy cơ phạt hợp đồng'
            : 'Thanh toán đúng kỳ hạn theo tiến độ bàn giao'),
      };
    });
  }, [projects]);

  // Filtered projects for accounting preview
  const filteredAccountingProjects = useMemo(() => {
    return enrichedProjects.filter((p) => {
      const matchesSearch =
        searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.client.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' ||
        p.status === statusFilter ||
        p.statusLabel === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [enrichedProjects, searchQuery, statusFilter]);

  // Executive summary metrics
  const financialTotals = useMemo(() => {
    const totalContract = filteredAccountingProjects.reduce((acc, p) => acc + p.contractValue, 0);
    const totalInvoiced = filteredAccountingProjects.reduce((acc, p) => acc + p.invoiced, 0);
    const totalDebt = filteredAccountingProjects.reduce((acc, p) => acc + p.remainingDebt, 0);
    const totalLaborCost = filteredAccountingProjects.reduce((acc, p) => acc + p.laborCost, 0);
    const totalGrossProfit = totalContract - totalLaborCost;
    const avgCollectionRate = totalContract > 0 ? Math.round((totalInvoiced / totalContract) * 100) : 0;
    const penaltyRiskCount = filteredAccountingProjects.filter((p) => p.penaltyRisk > 0).length;

    return {
      totalContract,
      totalInvoiced,
      totalDebt,
      totalLaborCost,
      totalGrossProfit,
      avgCollectionRate,
      penaltyRiskCount,
      count: filteredAccountingProjects.length,
    };
  }, [filteredAccountingProjects]);

  // Toggle Column Visibility
  const toggleColumn = (colId: string) => {
    if (visibleColumns.includes(colId)) {
      if (visibleColumns.length > 2) {
        setVisibleColumns(visibleColumns.filter((c) => c !== colId));
      }
    } else {
      setVisibleColumns([...visibleColumns, colId]);
    }
  };

  // Column Presets
  const applyPreset = (preset: 'all' | 'debt' | 'profit' | 'default') => {
    if (preset === 'all') {
      setVisibleColumns(ACCOUNTING_COLUMNS.map((c) => c.id));
    } else if (preset === 'debt') {
      setVisibleColumns(['stt', 'code', 'name', 'client', 'status', 'contractValue', 'invoiced', 'remainingDebt', 'collectionRate', 'notes']);
    } else if (preset === 'profit') {
      setVisibleColumns(['stt', 'code', 'name', 'status', 'contractValue', 'hours', 'laborRate', 'laborCost', 'grossProfit', 'notes']);
    } else {
      setVisibleColumns(DEFAULT_VISIBLE_COLUMNS);
    }
  };

  const downloadFile = (uri: string, filename: string) => {
    const link = document.createElement('a');
    link.setAttribute('href', uri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // EXPORT ACCOUNTING EXCEL / CSV
  const exportAccountingCSV = () => {
    const activeCols = ACCOUNTING_COLUMNS.filter((col) => visibleColumns.includes(col.id));
    const headers = activeCols.map((c) => `"${c.label}"`);

    const rows = filteredAccountingProjects.map((p, idx) => {
      return activeCols.map((col) => {
        switch (col.id) {
          case 'stt':
            return idx + 1;
          case 'code':
            return `"${p.code}"`;
          case 'name':
            return `"${p.name.replace(/"/g, '""')}"`;
          case 'client':
            return `"${p.client.replace(/"/g, '""')}"`;
          case 'status':
            return `"${p.statusLabel}"`;
          case 'progress':
            return p.progress;
          case 'contractValue':
            return p.contractValue;
          case 'invoiced':
            return p.invoiced;
          case 'remainingDebt':
            return p.remainingDebt;
          case 'collectionRate':
            return p.collectionRate;
          case 'hours':
            return `"${p.actualHours}/${p.totalBudgetHours}"`;
          case 'laborRate':
            return p.laborRate;
          case 'laborCost':
            return p.laborCost;
          case 'grossProfit':
            return p.grossProfit;
          case 'penaltyRisk':
            return p.penaltyRisk;
          case 'pm':
            return `"${p.pmName}"`;
          case 'notes':
            return `"${p.accountingNotesText.replace(/"/g, '""')}"`;
          default:
            return '""';
        }
      });
    });

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    downloadFile(
      'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent),
      `Mau_Bao_Cao_Ke_Toan_Du_An_${new Date().toISOString().slice(0, 10)}.csv`
    );
  };

  // COPY TABLE TO CLIPBOARD (TSV for Excel)
  const handleCopyTableToClipboard = () => {
    const activeCols = ACCOUNTING_COLUMNS.filter((col) => visibleColumns.includes(col.id));
    const headerRow = activeCols.map((c) => c.label).join('\t');

    const dataRows = filteredAccountingProjects.map((p, idx) => {
      return activeCols
        .map((col) => {
          switch (col.id) {
            case 'stt':
              return idx + 1;
            case 'code':
              return p.code;
            case 'name':
              return p.name;
            case 'client':
              return p.client;
            case 'status':
              return p.statusLabel;
            case 'progress':
              return `${p.progress}%`;
            case 'contractValue':
              return p.contractValue;
            case 'invoiced':
              return p.invoiced;
            case 'remainingDebt':
              return p.remainingDebt;
            case 'collectionRate':
              return `${p.collectionRate}%`;
            case 'hours':
              return `${p.actualHours} / ${p.totalBudgetHours}`;
            case 'laborRate':
              return p.laborRate;
            case 'laborCost':
              return p.laborCost;
            case 'grossProfit':
              return p.grossProfit;
            case 'penaltyRisk':
              return `${p.penaltyRisk}%`;
            case 'pm':
              return p.pmName;
            case 'notes':
              return p.accountingNotesText;
            default:
              return '';
          }
        })
        .join('\t');
    });

    const fullTsv = [headerRow, ...dataRows].join('\n');

    navigator.clipboard.writeText(fullTsv).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    });
  };

  // STANDARD EXPORT HANDLERS
  const exportProjectsCSV = () => {
    const headers = [
      'Mã Dự Án',
      'Tên Dự Án',
      'Khách Hàng',
      'Phân Loại',
      'Trạng Thái',
      'Tiến Độ Thực Tế (%)',
      'Tiến Độ Kế Hoạch (%)',
      'Ngày Bắt Đầu',
      'Hạn Chót Kế Hoạch',
      'Dự Kiến Hoàn Thành',
      'Tổng Giờ Dự Toán (h)',
      'Giờ Thực Tế Đã Dùng (h)',
      'Tỷ Lệ Tiêu Hao (%)',
      'SLA OTD (%)',
      'Giá Trị Hợp Đồng (Triệu VNĐ)',
      'Đã Xuất HĐ (Triệu VNĐ)',
      'Công Nợ (Triệu VNĐ)',
      'Tổng Số Task',
      'Số Task Hoàn Thành',
      'Task Trễ',
      'Quản Lý Dự Án (PM)',
      'Ghi Chú Kế Toán',
    ];

    const rows = enrichedProjects.map((p) => [
      p.code,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.client.replace(/"/g, '""')}"`,
      p.type === 'maintenance' ? 'Bảo trì' : 'Dự án mới',
      `"${p.statusLabel}"`,
      p.progress,
      p.plannedProgress,
      p.startDate,
      p.plannedDeadline || p.deadline,
      p.actualExpectedDeadline || p.deadline,
      p.totalBudgetHours,
      p.actualHours,
      p.budgetSpentPercent,
      p.slaOtd,
      p.contractValue,
      p.invoiced,
      p.remainingDebt,
      p.tasksCount,
      p.completedTasksCount,
      p.overdueTasksCount,
      `"${p.pmName}"`,
      `"${p.accountingNotesText.replace(/"/g, '""')}"`,
    ]);

    downloadFile(
      'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n'),
      `Bao_Cao_Tien_Do_Du_An_${new Date().toISOString().slice(0, 10)}.csv`
    );
  };

  const exportEmployeesCSV = () => {
    const headers = [
      'Mã Nhân Viên',
      'Họ Và Tên',
      'Vị Trí Chuyên Môn',
      'Phòng Ban',
      'Email',
      'Định Mức Giờ/Ngày',
      'Đã Phân Bổ Hôm Nay (h)',
      'Còn Trống (h)',
      'Tổng Số Task',
      'Tổng Số Giờ',
      'Tỷ Lệ Trễ (%)',
      'Mục Tiêu Trễ (%)',
      'Tỷ Lệ Bug (%)',
      'Mục Tiêu Bug (%)',
      'Tỷ Lệ Rework (%)',
      'Mục Tiêu Rework (%)',
      'Đánh Giá Năng Suất',
    ];

    const rows = employees.map((e) => [
      e.code,
      `"${e.name.replace(/"/g, '""')}"`,
      `"${e.role.replace(/"/g, '""')}"`,
      `"${e.department.replace(/"/g, '""')}"`,
      e.email,
      e.quotaHours,
      e.allocatedHoursToday,
      e.remainingHoursToday,
      e.totalTasks,
      e.totalHours,
      e.overdueRate,
      e.targetOverdueRate,
      e.bugRate,
      e.targetBugRate,
      e.reworkRate,
      e.targetReworkRate,
      `"${(e.performanceRating || (e.overdueRate <= 3 ? 'Xuất Sắc' : e.overdueRate <= 5 ? 'Tốt' : 'Cần Cải Thiện')).replace(/"/g, '""')}"`,
    ]);

    downloadFile(
      'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n'),
      `Bao_Cao_KPI_Nhan_Su_${new Date().toISOString().slice(0, 10)}.csv`
    );
  };

  const exportTasksCSV = () => {
    const headers = [
      'Mã Task',
      'Tiêu Đề Task',
      'Dự Án',
      'Người Thực Hiện',
      'Phân Loại',
      'Mức Độ Ưu Tiên',
      'Giờ Dự Toán (h)',
      'Hạn Chót',
      'Trạng Thái',
      'Là Task Hôm Nay',
      'Bị Trễ Hạn',
    ];

    const rows = tasks.map((t) => [
      t.code,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.projectName.replace(/"/g, '""')}"`,
      `"${t.assigneeName.replace(/"/g, '""')}"`,
      t.type,
      t.priority,
      t.estimatedHours,
      t.dueDate,
      t.status,
      t.isToday ? 'Có' : 'Không',
      t.isOverdueToday ? 'Trễ' : 'Đúng hạn',
    ]);

    downloadFile(
      'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n'),
      `Danh_Sach_Task_Cong_Viec_${new Date().toISOString().slice(0, 10)}.csv`
    );
  };

  const exportFullJSON = () => {
    const fullData = {
      exportedAt: new Date().toISOString(),
      system: 'Chips Project & Resource Management Dashboard',
      version: '2.5.0',
      projects: enrichedProjects,
      employees,
      tasks,
      sprints,
    };

    const jsonStr = JSON.stringify(fullData, null, 2);
    downloadFile(
      'data:application/json;charset=utf-8,' + encodeURIComponent(jsonStr),
      `Backup_Du_Lieu_Toan_He_Thong_${new Date().toISOString().slice(0, 10)}.json`
    );
  };

  // IMPORT HANDLERS
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          const pCount = Array.isArray(parsed.projects) ? parsed.projects.length : 0;
          const tCount = Array.isArray(parsed.tasks) ? parsed.tasks.length : 0;
          const eCount = Array.isArray(parsed.employees) ? parsed.employees.length : 0;

          if (pCount === 0 && tCount === 0 && eCount === 0) {
            setImportStatus('File JSON không chứa các cấu trúc danh sách hợp lệ (projects, tasks, employees).');
            setImportPreview(null);
            return;
          }

          setImportPreview({
            projectsCount: pCount,
            tasksCount: tCount,
            employeesCount: eCount,
            data: parsed,
          });
          setImportStatus(null);
        } else {
          setImportStatus('Vui lòng chọn file định dạng .json chuẩn để hệ thống tự động import.');
        }
      } catch (err: any) {
        setImportStatus(`Lỗi đọc file: ${err.message || 'Không thể đọc nội dung file'}`);
        setImportPreview(null);
      }
    };
    reader.readAsText(file);
  };

  const handleApplyImport = () => {
    if (!importPreview?.data) return;
    onImportData(importPreview.data);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1500);
  };

  const handleDownloadSampleJSON = () => {
    const sample = {
      system: 'Chips Project & Resource Management Dashboard',
      version: '2.5.0',
      projects: enrichedProjects.slice(0, 2),
      employees: employees.slice(0, 3),
      tasks: tasks.slice(0, 4),
      sprints: sprints.slice(0, 1),
    };
    const jsonStr = JSON.stringify(sample, null, 2);
    downloadFile(
      'data:application/json;charset=utf-8,' + encodeURIComponent(jsonStr),
      'Mau_Du_Lieu_Nhap_He_Thong.json'
    );
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-h-[94vh] flex flex-col rounded-2xl shadow-2xl border overflow-hidden transition-all ${
          activeTab === 'accounting' ? 'max-w-6xl' : 'max-w-4xl'
        } ${
          isDark ? 'bg-[#0f172a] text-slate-100 border-slate-700/80' : 'bg-white text-slate-900 border-slate-300'
        }`}
      >
        {/* Header */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between ${
            isDark ? 'bg-[#0b1120] border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black uppercase text-blue-400 tracking-wide">
                  Trung Tâm Xuất & Nhập Dữ Liệu
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                  Excel & CSV Cho Kế Toán
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Xem trước toàn diện giá trị hợp đồng, nghiệm thu, công nợ, chi phí nhân sự và tùy biến cột xuất file
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition shrink-0"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle Navigation */}
        <div
          className={`px-5 pt-3 border-b flex items-center gap-2 sm:gap-6 overflow-x-auto scrollbar-thin ${
            isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-slate-100/70 border-slate-200'
          }`}
        >
          <button
            onClick={() => setActiveTab('accounting')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'accounting'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>1. Mẫu Kế Toán & Quyết Toán (Excel / CSV)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
              Live Preview
            </span>
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'export'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>2. Báo Cáo Chuẩn Khác (CSV)</span>
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'import'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>3. Nhập Dữ Liệu & Sao Lưu (JSON)</span>
          </button>
        </div>

        {/* TAB 1: ACCOUNTING EXCEL EXPORT & LIVE PREVIEW */}
        {activeTab === 'accounting' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* Top Financial Executive KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Tổng Giá Trị HĐ
                </span>
                <div className="text-base sm:text-lg font-black text-white mt-1">
                  {(financialTotals.totalContract / 1000).toFixed(2)} tỷ
                </div>
                <span className="text-[10px] text-blue-400 block mt-0.5">
                  {financialTotals.count} dự án
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Đã Xuất HĐ / Thu
                </span>
                <div className="text-base sm:text-lg font-black text-emerald-400 mt-1">
                  {(financialTotals.totalInvoiced / 1000).toFixed(2)} tỷ
                </div>
                <span className="text-[10px] text-emerald-400 block mt-0.5">
                  Thu hồi {financialTotals.avgCollectionRate}%
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Công Nợ Còn Lại
                </span>
                <div className="text-base sm:text-lg font-black text-amber-400 mt-1">
                  {(financialTotals.totalDebt / 1000).toFixed(2)} tỷ
                </div>
                <span className="text-[10px] text-amber-400 block mt-0.5">
                  Cần nghiệm thu & thu hồi
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Chi Phí Nhân Lực
                </span>
                <div className="text-base sm:text-lg font-black text-indigo-400 mt-1">
                  {(financialTotals.totalLaborCost / 1000).toFixed(2)} tỷ
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Định mức thực tế đã dùng
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Lãi Gộp Dự Kiến
                </span>
                <div className="text-base sm:text-lg font-black text-emerald-400 mt-1">
                  {(financialTotals.totalGrossProfit / 1000).toFixed(2)} tỷ
                </div>
                <span className="text-[10px] text-emerald-400 block mt-0.5">
                  Biên {financialTotals.totalContract > 0 ? Math.round((financialTotals.totalGrossProfit / financialTotals.totalContract) * 100) : 0}%
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Rủi Ro Phạt HĐ
                </span>
                <div className="text-base sm:text-lg font-black text-rose-400 mt-1">
                  {financialTotals.penaltyRiskCount} dự án
                </div>
                <span className="text-[10px] text-rose-400 block mt-0.5">
                  {financialTotals.penaltyRiskCount > 0 ? 'Có dự án chậm mốc' : 'An toàn tiến độ'}
                </span>
              </div>
            </div>

            {/* Filter & Customization Toolbar */}
            <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              {/* Search & Status Filters */}
              <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm theo mã dự án, tên dự án, khách hàng..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-950/70 border border-slate-700 text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Status Filter Buttons */}
                <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800 overflow-x-auto scrollbar-thin">
                  {[
                    { id: 'ALL', label: 'Tất cả' },
                    { id: 'in_progress', label: 'Đang thực hiện' },
                    { id: 'delayed', label: 'Chậm tiến độ' },
                    { id: 'completed', label: 'Hoàn thành' },
                    { id: 'paused', label: 'Tạm dừng' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setStatusFilter(st.id)}
                      className={`px-2 py-1 rounded text-[11px] font-bold transition whitespace-nowrap ${
                        statusFilter === st.id
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Column Customizer & Presets */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Presets */}
                <div className="hidden sm:flex items-center gap-1 text-[11px]">
                  <span className="text-slate-500">Mẫu:</span>
                  <button
                    onClick={() => applyPreset('default')}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                  >
                    Chuẩn
                  </button>
                  <button
                    onClick={() => applyPreset('debt')}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                  >
                    Công nợ
                  </button>
                  <button
                    onClick={() => applyPreset('profit')}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                  >
                    Lãi gộp
                  </button>
                  <button
                    onClick={() => applyPreset('all')}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                  >
                    Tất cả ({ACCOUNTING_COLUMNS.length})
                  </button>
                </div>

                {/* Column Toggle Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowColumnDropdown(!showColumnDropdown)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Sliders className="w-3.5 h-3.5 text-blue-400" />
                    <span>Cột ({visibleColumns.length})</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {showColumnDropdown && (
                    <div className="absolute right-0 top-full mt-1.5 w-64 p-3 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl z-30 space-y-2 text-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <span className="font-bold text-slate-300">Tùy Chọn Cột Hiển Thị</span>
                        <button
                          onClick={() => applyPreset('all')}
                          className="text-[10px] text-blue-400 hover:underline"
                        >
                          Chọn tất cả
                        </button>
                      </div>

                      <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                        {ACCOUNTING_COLUMNS.map((col) => {
                          const isChecked = visibleColumns.includes(col.id);
                          return (
                            <label
                              key={col.id}
                              className="flex items-center gap-2 p-1 rounded hover:bg-slate-800/80 cursor-pointer text-slate-300"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleColumn(col.id)}
                                className="rounded border-slate-700 text-blue-600 focus:ring-0"
                              />
                              <span className="truncate">{col.label}</span>
                            </label>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => setShowColumnDropdown(false)}
                        className="w-full py-1.5 mt-1 bg-blue-600 text-white rounded font-bold text-xs"
                      >
                        Áp dụng
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* LIVE PREVIEW TABLE */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  Bản xem trước dữ liệu xuất ({filteredAccountingProjects.length} dự án) • Tương thích Excel, Google Sheets, ERP
                </span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">
                  Dữ liệu số tiền tính bằng: <strong>Triệu VNĐ</strong>
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40 scrollbar-thin max-h-[46vh]">
                <table className="w-full text-left text-xs border-collapse min-w-[1000px]">
                  <thead className="bg-[#0b1120] text-slate-300 sticky top-0 z-10 border-b border-slate-800 font-bold text-[11px] uppercase tracking-wider">
                    <tr>
                      {ACCOUNTING_COLUMNS.filter((col) => visibleColumns.includes(col.id)).map((col) => (
                        <th
                          key={col.id}
                          className={`p-3 whitespace-nowrap ${
                            ['stt', 'progress', 'collectionRate', 'penaltyRisk'].includes(col.id)
                              ? 'text-center'
                              : ['contractValue', 'invoiced', 'remainingDebt', 'laborRate', 'laborCost', 'grossProfit'].includes(col.id)
                              ? 'text-right'
                              : 'text-left'
                          }`}
                        >
                          {col.shortLabel}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-medium">
                    {filteredAccountingProjects.length === 0 ? (
                      <tr>
                        <td
                          colSpan={visibleColumns.length}
                          className="p-8 text-center text-slate-500"
                        >
                          Không có dự án nào thỏa mãn điều kiện lọc.
                        </td>
                      </tr>
                    ) : (
                      filteredAccountingProjects.map((p, idx) => (
                        <tr
                          key={p.id}
                          className="hover:bg-slate-800/40 transition-colors"
                        >
                          {visibleColumns.includes('stt') && (
                            <td className="p-3 text-center text-slate-500 font-mono">
                              {idx + 1}
                            </td>
                          )}

                          {visibleColumns.includes('code') && (
                            <td className="p-3 font-mono font-bold text-blue-400 whitespace-nowrap">
                              {p.code}
                            </td>
                          )}

                          {visibleColumns.includes('name') && (
                            <td className="p-3 font-semibold text-slate-200 min-w-[200px]">
                              {p.name}
                            </td>
                          )}

                          {visibleColumns.includes('client') && (
                            <td className="p-3 text-slate-400 whitespace-nowrap max-w-[160px] truncate">
                              {p.client}
                            </td>
                          )}

                          {visibleColumns.includes('status') && (
                            <td className="p-3 whitespace-nowrap">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${p.statusBadgeClass}`}
                              >
                                {p.statusLabel}
                              </span>
                            </td>
                          )}

                          {visibleColumns.includes('progress') && (
                            <td className="p-3 text-center whitespace-nowrap">
                              <span className="font-bold text-slate-200">
                                {p.progress}%
                              </span>
                            </td>
                          )}

                          {visibleColumns.includes('contractValue') && (
                            <td className="p-3 text-right font-mono font-bold text-white whitespace-nowrap">
                              {p.contractValue.toLocaleString('vi-VN')} tr
                            </td>
                          )}

                          {visibleColumns.includes('invoiced') && (
                            <td className="p-3 text-right font-mono font-bold text-emerald-400 whitespace-nowrap">
                              {p.invoiced.toLocaleString('vi-VN')} tr
                            </td>
                          )}

                          {visibleColumns.includes('remainingDebt') && (
                            <td className="p-3 text-right font-mono font-bold text-amber-400 whitespace-nowrap">
                              {p.remainingDebt > 0 ? `${p.remainingDebt.toLocaleString('vi-VN')} tr` : '✓ Đã tất toán'}
                            </td>
                          )}

                          {visibleColumns.includes('collectionRate') && (
                            <td className="p-3 text-center whitespace-nowrap">
                              <span
                                className={`font-mono font-bold text-xs ${
                                  p.collectionRate >= 90
                                    ? 'text-emerald-400'
                                    : p.collectionRate >= 50
                                    ? 'text-blue-400'
                                    : 'text-amber-400'
                                }`}
                              >
                                {p.collectionRate}%
                              </span>
                            </td>
                          )}

                          {visibleColumns.includes('hours') && (
                            <td className="p-3 text-right font-mono text-slate-300 whitespace-nowrap">
                              {p.actualHours}h / {p.totalBudgetHours}h
                            </td>
                          )}

                          {visibleColumns.includes('laborRate') && (
                            <td className="p-3 text-right font-mono text-slate-400 whitespace-nowrap">
                              {p.laborRate.toLocaleString('vi-VN')} đ
                            </td>
                          )}

                          {visibleColumns.includes('laborCost') && (
                            <td className="p-3 text-right font-mono font-semibold text-indigo-300 whitespace-nowrap">
                              {p.laborCost.toLocaleString('vi-VN')} tr
                            </td>
                          )}

                          {visibleColumns.includes('grossProfit') && (
                            <td className="p-3 text-right font-mono font-bold text-emerald-300 whitespace-nowrap">
                              {p.grossProfit.toLocaleString('vi-VN')} tr
                            </td>
                          )}

                          {visibleColumns.includes('penaltyRisk') && (
                            <td className="p-3 text-center whitespace-nowrap">
                              {p.penaltyRisk > 0 ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800">
                                  {p.penaltyRisk}% ({p.penaltyAmount} tr)
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-500 font-mono">0% (An toàn)</span>
                              )}
                            </td>
                          )}

                          {visibleColumns.includes('pm') && (
                            <td className="p-3 text-slate-300 whitespace-nowrap">
                              {p.pmName}
                            </td>
                          )}

                          {visibleColumns.includes('notes') && (
                            <td className="p-3 text-slate-400 text-[11px] max-w-[220px] truncate" title={p.accountingNotesText}>
                              {p.accountingNotesText}
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Xuất file UTF-8 BOM chuẩn hiển thị tiếng Việt không lỗi font trên Excel</span>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleCopyTableToClipboard}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition border border-slate-700"
                  title="Sao chép bảng định dạng TSV để dán trực tiếp vào Excel (Ctrl+V)"
                >
                  {copySuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Đã sao chép! Dán (Ctrl+V) vào Excel</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Sao Chép Bảng (Ctrl+V Vào Excel)</span>
                    </>
                  )}
                </button>

                <button
                  onClick={exportAccountingCSV}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Xuất File Excel Kế Toán (.CSV)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STANDARD EXPORT REPORTS */}
        {activeTab === 'export' && (
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Lựa chọn gói dữ liệu bạn muốn kết xuất. Các file CSV tương thích hoàn toàn với Microsoft Excel, Google Sheets và các phần mềm ERP.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Projects CSV */}
                <div
                  className={`p-4 rounded-xl border flex flex-col justify-between ${
                    isDark ? 'bg-[#141e33] border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 text-blue-400">
                      <FileSpreadsheet className="w-5 h-5" />
                      <span className="font-bold text-xs">Báo Cáo Tiến Độ Dự Án (CSV)</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">
                      Bao gồm mã dự án, khách hàng, tiến độ thực tế vs kế hoạch, giờ công, SLA OTD và PM điều phối ({projects.length} dự án).
                    </p>
                  </div>
                  <button
                    onClick={exportProjectsCSV}
                    className="mt-4 w-full py-2 px-3 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải CSV Dự Án</span>
                  </button>
                </div>

                {/* 2. Employee KPI CSV */}
                <div
                  className={`p-4 rounded-xl border flex flex-col justify-between ${
                    isDark ? 'bg-[#141e33] border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <FileSpreadsheet className="w-5 h-5" />
                      <span className="font-bold text-xs">Hiệu Suất & KPI Nhân Viên (CSV)</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">
                      Chi tiết định mức giờ công, tỷ lệ trễ hạn, tỷ lệ bug, tỷ lệ rework và xếp hạng A/B/C ({employees.length} nhân sự).
                    </p>
                  </div>
                  <button
                    onClick={exportEmployeesCSV}
                    className="mt-4 w-full py-2 px-3 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải CSV Nhân Sự</span>
                  </button>
                </div>

                {/* 3. Tasks CSV */}
                <div
                  className={`p-4 rounded-xl border flex flex-col justify-between ${
                    isDark ? 'bg-[#141e33] border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 text-purple-400">
                      <FileText className="w-5 h-5" />
                      <span className="font-bold text-xs">Toàn Bộ Danh Sách Task (CSV)</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">
                      Xuất chi tiết toàn bộ các đầu mục công việc, thời hạn, người làm và trạng thái thực hiện ({tasks.length} tasks).
                    </p>
                  </div>
                  <button
                    onClick={exportTasksCSV}
                    className="mt-4 w-full py-2 px-3 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center gap-2 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải CSV Tasks</span>
                  </button>
                </div>

                {/* 4. Full JSON Backup */}
                <div
                  className={`p-4 rounded-xl border flex flex-col justify-between ${
                    isDark ? 'bg-[#141e33] border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 text-amber-400">
                      <FileCode className="w-5 h-5" />
                      <span className="font-bold text-xs">Sao Lưu Toàn Bộ Hệ Thống (JSON)</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">
                      Toàn bộ cơ sở dữ liệu bao gồm dự án, nhân viên, sprint và lịch sử tiến độ, có thể import ngược lại bất kỳ lúc nào.
                    </p>
                  </div>
                  <button
                    onClick={exportFullJSON}
                    className="mt-4 w-full py-2 px-3 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white flex items-center justify-center gap-2 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải JSON Backup</span>
                  </button>
                </div>
              </div>

              {/* Print A4 executive button */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-200">In Báo Cáo Điều Hành Khổ A4</h4>
                  <p className="text-[11px] text-slate-400">
                    Định dạng trang in chuẩn tối ưu sẵn cho cuộc họp ban giám đốc
                  </p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-xs flex items-center gap-2 transition border border-slate-700"
                >
                  <Printer className="w-4 h-4" />
                  <span>In / Xuất PDF Ngay</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: IMPORT & RESTORE */}
        {activeTab === 'import' && (
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            <p className="text-xs text-slate-400">
              Nhập file sao lưu (.json) để cập nhật dữ liệu dự án, sprint và nhân viên vào hệ thống trực tiếp mà không cần cấu hình phức tạp.
            </p>

            {/* File drop zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition text-center ${
                isDark
                  ? 'border-slate-700 bg-slate-900/40 hover:bg-slate-900 hover:border-blue-500/80'
                  : 'border-slate-300 bg-slate-50 hover:bg-white hover:border-blue-400'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="p-3 rounded-full bg-blue-500/10 text-blue-400 mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-200">
                Nhấn vào đây hoặc kéo thả file <span className="text-blue-400">.json</span> sao lưu vào
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Hỗ trợ file cấu trúc sao lưu dữ liệu toàn diện</p>
            </div>

            {/* Sample download */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Chưa có file mẫu chuẩn?</span>
              <button
                onClick={handleDownloadSampleJSON}
                className="text-blue-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <Download className="w-3 h-3" /> Tải file JSON mẫu chuẩn
              </button>
            </div>

            {/* Status / Preview */}
            {importStatus && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{importStatus}</span>
              </div>
            )}

            {importPreview && (
              <div
                className={`p-4 rounded-xl border ${
                  isDark ? 'bg-blue-950/40 border-blue-800/80 text-blue-200' : 'bg-blue-50 border-blue-200 text-blue-900'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>File hợp lệ! Phát hiện dữ liệu sẵn sàng import:</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs font-medium">
                  <div className="p-2 rounded bg-black/20 text-center">
                    <div className="text-base font-black text-blue-400">{importPreview.projectsCount}</div>
                    <div className="text-[11px] text-slate-400">Dự án</div>
                  </div>
                  <div className="p-2 rounded bg-black/20 text-center">
                    <div className="text-base font-black text-purple-400">{importPreview.tasksCount}</div>
                    <div className="text-[11px] text-slate-400">Tasks</div>
                  </div>
                  <div className="p-2 rounded bg-black/20 text-center">
                    <div className="text-base font-black text-emerald-400">{importPreview.employeesCount}</div>
                    <div className="text-[11px] text-slate-400">Nhân sự</div>
                  </div>
                </div>

                <button
                  onClick={handleApplyImport}
                  className="mt-4 w-full py-2.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2 transition shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Xác Nhận Nhập Dữ Liệu & Cập Nhật Hệ Thống</span>
                </button>
              </div>
            )}

            {isSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-700 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Dữ liệu đã được nhập và cập nhật thành công vào Dashboard!</span>
              </div>
            )}

            {/* Reset to system default data */}
            <div
              className={`p-4 rounded-xl border flex items-center justify-between mt-6 ${
                isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <h4 className="text-xs font-bold text-slate-200">Khôi Phục Dữ Liệu Gốc</h4>
                <p className="text-[11px] text-slate-400">
                  Xóa các thay đổi đã nhập và trở về bộ dữ liệu mẫu ban đầu của hệ thống
                </p>
              </div>
              <button
                onClick={() => {
                  onResetData();
                  onClose();
                }}
                className="px-3.5 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 font-bold rounded-lg text-xs flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Khôi Phục Gốc</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          className={`px-6 py-3 border-t flex items-center justify-end ${
            isDark ? 'bg-[#0b1120] border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-xs transition"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};
