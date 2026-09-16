import { DailyWorkReport } from '../types';

export const INITIAL_DAILY_REPORTS: DailyWorkReport[] = [
  {
    id: 'DWR-20260915-001',
    employeeId: 'emp-1',
    employeeCode: 'NV001',
    employeeName: 'Nguyễn Văn An',
    employeeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    department: 'Phát triển Phần mềm',
    date: '2026-09-15',
    submittedAt: '2026-09-15 17:45',
    hoursLogged: 7.5,
    completedSummary: 'Hoàn thành tích hợp API Cổng thanh toán VietQR và unit test cho module thanh toán.',
    inProgressSummary: 'Đang tiếp tục viết tài liệu Swagger và kiểm thử edge case cho giao dịch hoàn tiền.',
    blockers: 'Chờ đối tác cấp Sandbox key môi trường UAT mới để test hoàn tiền tự động.',
    tomorrowPlan: 'Kiểm thử end-to-end cùng QA và đóng sprint task #VPAY-402.',
    completionRateScore: 95,
    status: 'reviewed',
    reviewedBy: 'Trần Văn Quản Lý (PM)',
    reviewedAt: '2026-09-15 18:10',
    managerFeedback: 'Làm tốt lắm An! Đã nhắc bộ phận hạ tầng kết nối đối tác lấy key UAT trong sáng mai.',
    tasks: [
      {
        taskId: 't-101',
        taskCode: 'VPAY-402',
        taskTitle: 'Tích hợp webhook xử lý kết quả thanh toán VietQR',
        projectName: 'Hệ Thống Thanh Toán V-Pay',
        hoursSpent: 4.5,
        progressPercent: 100,
        status: 'done',
        notes: 'Đã pass 14 test cases'
      },
      {
        taskId: 't-102',
        taskCode: 'VPAY-408',
        taskTitle: 'Xử lý hoàn tiền tự động khi giao dịch timeout',
        projectName: 'Hệ Thống Thanh Toán V-Pay',
        hoursSpent: 3.0,
        progressPercent: 70,
        status: 'in_progress',
        notes: 'Chờ key sandbox UAT'
      }
    ]
  },
  {
    id: 'DWR-20260915-002',
    employeeId: 'emp-2',
    employeeCode: 'NV002',
    employeeName: 'Trần Thị Bình',
    employeeAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    department: 'Đảm bảo Chất lượng',
    date: '2026-09-15',
    submittedAt: '2026-09-15 17:30',
    hoursLogged: 8.0,
    completedSummary: 'Thực thi kiểm thử hồi quy 45 test case trên module Kho hàng ERP Vinatex.',
    inProgressSummary: 'Ghi nhận 2 bug critical liên quan đến tính toán tồn kho âm khi xuất kho hàng loạt.',
    blockers: 'Không có blocker lớn. Cần dev confirm luồng xử lý xuất kho song song.',
    tomorrowPlan: 'Re-test bug sau khi dev release hotfix và tổng hợp báo cáo test coverage sprint.',
    completionRateScore: 100,
    status: 'reviewed',
    reviewedBy: 'Trần Văn Quản Lý (PM)',
    reviewedAt: '2026-09-15 18:15',
    managerFeedback: 'Bắt được bug xuất kho âm rất kịp thời trước khi bàn giao demo khách hàng.',
    tasks: [
      {
        taskId: 't-201',
        taskCode: 'ERP-512',
        taskTitle: 'Regression test module Xuất Kho Vinatex',
        projectName: 'ERP Doanh Nghiệp Vinatex',
        hoursSpent: 5.5,
        progressPercent: 100,
        status: 'done',
        notes: 'Phát hiện 2 bugs'
      },
      {
        taskId: 't-202',
        taskCode: 'ERP-519',
        taskTitle: 'Soạn test scenario cho tính năng kiểm kê định kỳ',
        projectName: 'ERP Doanh Nghiệp Vinatex',
        hoursSpent: 2.5,
        progressPercent: 60,
        status: 'in_progress',
        notes: 'Đang hoàn thiện sheet test'
      }
    ]
  },
  {
    id: 'DWR-20260915-003',
    employeeId: 'emp-3',
    employeeCode: 'NV003',
    employeeName: 'Lê Hoàng Cường',
    employeeAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    department: 'Hạ tầng & DevOps',
    date: '2026-09-15',
    submittedAt: '2026-09-15 17:50',
    hoursLogged: 7.0,
    completedSummary: 'Nâng cấp cluster Kubernetes staging lên v1.30 và tối ưu tài nguyên Node Pool.',
    inProgressSummary: 'Cấu hình auto-scaling HPA cho dịch vụ thanh toán và tracking metrics Prometheus.',
    blockers: 'Có cảnh báo spike CPU trên pod hải quan vào 14h chiều, đang theo dõi log Grafana.',
    tomorrowPlan: 'Review security benchmark CIS Kubernetes và cập nhật helm chart.',
    completionRateScore: 90,
    status: 'submitted',
    tasks: [
      {
        taskId: 't-301',
        taskCode: 'OPS-109',
        taskTitle: 'Nâng cấp cụm Kubernetes K8s Staging',
        projectName: 'Hạ Tầng Cloud & DevOps',
        hoursSpent: 4.0,
        progressPercent: 100,
        status: 'done',
        notes: 'Hoàn thành không gián đoạn'
      },
      {
        taskId: 't-302',
        taskCode: 'OPS-114',
        taskTitle: 'Cấu hình cảnh báo AlertManager qua Telegram/Slack',
        projectName: 'Hạ Tầng Cloud & DevOps',
        hoursSpent: 3.0,
        progressPercent: 80,
        status: 'in_progress',
        notes: 'Đã test gửi test alert'
      }
    ]
  },
  {
    id: 'DWR-20260915-004',
    employeeId: 'emp-4',
    employeeCode: 'NV004',
    employeeName: 'Phạm Minh Đức',
    employeeAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    department: 'Phát triển Phần mềm',
    date: '2026-09-15',
    submittedAt: '2026-09-15 18:05',
    hoursLogged: 8.2,
    completedSummary: 'Fix bug tràn bộ nhớ tại luồng đồng bộ tờ khai hải quan điện tử.',
    inProgressSummary: 'Đang refactor worker job chia nhỏ batch size để tránh nghẽn luồng xử lý.',
    blockers: 'Dữ liệu tờ khai từ hệ thống ngoài gửi về có ký tự null byte gây lỗi parser JSON.',
    tomorrowPlan: 'Thêm filter sanitize input dữ liệu trước khi nạp vào DB.',
    completionRateScore: 85,
    status: 'needs_clarification',
    managerFeedback: 'Cần chú ý định mức 8h, hôm nay làm 8.2h hơi căng thẳng. Hãy chia task hỗ trợ cùng An nhé.',
    tasks: [
      {
        taskId: 't-401',
        taskCode: 'HQ-322',
        taskTitle: 'Sửa lỗi bộ đệm bộ nhớ batch tờ khai',
        projectName: 'Cổng Hải Quan Điện Tử',
        hoursSpent: 5.2,
        progressPercent: 100,
        status: 'done',
        notes: 'Hotfix đã deploy lên staging'
      },
      {
        taskId: 't-402',
        taskCode: 'HQ-329',
        taskTitle: 'Refactor parser XML tờ khai chuẩn WCO',
        projectName: 'Cổng Hải Quan Điện Tử',
        hoursSpent: 3.0,
        progressPercent: 50,
        status: 'in_progress',
        notes: 'Gặp lỗi null byte'
      }
    ]
  },
  {
    id: 'DWR-20260915-005',
    employeeId: 'emp-5',
    employeeCode: 'NV005',
    employeeName: 'Hoàng Thu Giang',
    employeeAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    department: 'Thiết kế UI/UX',
    date: '2026-09-15',
    submittedAt: '2026-09-15 17:15',
    hoursLogged: 7.0,
    completedSummary: 'Hoàn thành wireframe và UI prototype cho màn hình Báo Cáo Doanh Thu V-Pay.',
    inProgressSummary: 'Bàn giao Design System token sang cho đội Front-end trên Figma.',
    blockers: 'Không có blocker.',
    tomorrowPlan: 'Phối hợp với Front-end Dev để review giao diện thực tế và hiệu chỉnh dark mode.',
    completionRateScore: 100,
    status: 'reviewed',
    reviewedBy: 'Trần Văn Quản Lý (PM)',
    reviewedAt: '2026-09-15 18:20',
    managerFeedback: 'Bản thiết kế rất chỉn chu, màu sắc và độ tương phản đạt chuẩn WCAG AA.',
    tasks: [
      {
        taskId: 't-501',
        taskCode: 'UI-804',
        taskTitle: 'Thiết kế màn hình Dashboard Tài Chính V-Pay',
        projectName: 'Hệ Thống Thanh Toán V-Pay',
        hoursSpent: 4.5,
        progressPercent: 100,
        status: 'done'
      },
      {
        taskId: 't-502',
        taskCode: 'UI-810',
        taskTitle: 'Export asset và component tokens Figma',
        projectName: 'Hệ Thống Thanh Toán V-Pay',
        hoursSpent: 2.5,
        progressPercent: 100,
        status: 'done'
      }
    ]
  }
];
