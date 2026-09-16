import { Sprint, Project, Task, CompanyKPIConfig, Employee } from '../types';
import { DEFAULT_KPI_CONFIG } from '../data/mockData';

/**
 * Clean escape for CSV cell to prevent Excel column misalignment or `########`
 */
function cleanCSV(val: string | number | boolean | null | undefined): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Generates an executive, well-structured CSV for a Sprint with KPI compliance and Member Overload analysis
 */
export function generateSprintCSV(sprint: Sprint, kpiConfig: CompanyKPIConfig = DEFAULT_KPI_CONFIG): string {
  const activeConfig = kpiConfig && typeof kpiConfig === 'object' && kpiConfig.year ? kpiConfig : DEFAULT_KPI_CONFIG;
  const tasks = sprint.sprintTasks || [];
  const totalTasks = tasks.length || sprint.totalTasks || 0;
  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const todoTasks = tasks.filter((t) => t.status === 'todo').length;
  const overdueTasks = tasks.filter((t) => t.isOverdue).length;
  const bugTasks = tasks.filter((t) => t.type === 'bug').length;
  const reworkTasks = tasks.filter((t) => t.type === 'rework').length;

  const overdueRate = totalTasks > 0 ? Number(((overdueTasks / totalTasks) * 100).toFixed(1)) : 0;
  const bugRate = totalTasks > 0 ? Number(((bugTasks / totalTasks) * 100).toFixed(1)) : 0;
  const reworkRate = totalTasks > 0 ? Number(((reworkTasks / totalTasks) * 100).toFixed(1)) : 0;

  // Group by Member
  const memberMap: Record<
    string,
    { name: string; taskCount: number; points: number; hours: number; overdueCount: number }
  > = {};
  tasks.forEach((t) => {
    const name = t.assigneeName || 'Chưa phân công';
    if (!memberMap[name]) {
      memberMap[name] = { name, taskCount: 0, points: 0, hours: 0, overdueCount: 0 };
    }
    memberMap[name].taskCount += 1;
    memberMap[name].points += t.storyPoints || 0;
    memberMap[name].hours += t.estimatedHours || 0;
    if (t.isOverdue) memberMap[name].overdueCount += 1;
  });

  const members = Object.values(memberMap);
  const lines: string[] = [];

  // Title Banner
  lines.push(`BÁO CÁO CHI TIẾT SPRINT & ĐỐI CHIẾU KPI CHẤT LƯỢNG DOANH NGHIỆP`);
  lines.push(`Thời điểm trích xuất:,${cleanCSV(new Date().toLocaleString('vi-VN'))}`);
  lines.push(``);

  // Section 1: Sprint Overview
  lines.push(`[PHẦN 1: THÔNG TIN TỔNG QUAN SPRINT & DỰ ÁN]`);
  lines.push(`Tên Sprint:,${cleanCSV(sprint.name)}`);
  lines.push(`Mã Dự Án:,${cleanCSV(sprint.projectCode || 'N/A')}`);
  lines.push(`Tên Dự Án:,${cleanCSV(sprint.projectName)}`);
  lines.push(`Khách Hàng / Đối Tác:,${cleanCSV(sprint.clientName)}`);
  lines.push(`Mục Tiêu Sprint:,${cleanCSV(sprint.goal || 'Hoàn tất các chức năng cam kết')}`);
  lines.push(`Thời Gian Sprint (Kế hoạch):,${cleanCSV(`${sprint.startDate} đến ${sprint.endDate}`)}`);
  lines.push(`Dự Kiến Hoàn Tất Thực Tế:,${cleanCSV(sprint.forecastEndDate || sprint.endDate)}`);
  lines.push(`Tình Trạng Tiến Độ:,${cleanCSV(sprint.forecastStatus === 'on_track' ? 'Đúng tiến độ' : sprint.forecastStatus === 'at_risk' ? 'Có nguy cơ trễ' : 'Chậm tiến độ')}`);
  lines.push(`Số Ngày Trễ So Với Kế Hoạch:,${cleanCSV(sprint.delayDays ? `${sprint.delayDays} ngày` : '0 ngày (Đúng hạn)')}`);
  if (sprint.delayReason) {
    lines.push(`Nguyên Nhân Chậm Trễ:,${cleanCSV(sprint.delayReason)}`);
  }
  lines.push(``);

  // Section 2: Story Points & Velocity
  lines.push(`[PHẦN 2: TIẾN ĐỘ THỰC HIỆN & STORY POINTS]`);
  lines.push(`Chỉ Số Tiến Độ,Giá Trị,Đơn Vị,Ghi Chú`);
  lines.push(`Tổng Story Points Cam Kết,${sprint.committedPoints},SP,Tổng quy mô cam kết ban đầu`);
  lines.push(`Đã Hoàn Thành (Done),${sprint.completedPoints},SP,${sprint.progress}% tiến độ`);
  lines.push(`Điểm Còn Lại (Remaining),${Math.max(0, sprint.committedPoints - sprint.completedPoints)},SP,Cần đốt trong thời gian còn lại`);
  lines.push(`Vận Tốc Đốt (Velocity),${sprint.velocity || 7.4},SP/ngày,Tốc độ giải quyết trung bình`);
  lines.push(`Tổng Số Lượng Task,${totalTasks},Task,Bao gồm Feature/Bug/CR/Rework`);
  lines.push(`Task Đã Xong (Done),${doneTasks},Task,${totalTasks > 0 ? ((doneTasks / totalTasks) * 100).toFixed(1) : 0}%`);
  lines.push(`Task Đang Làm (In Progress),${inProgressTasks},Task,${totalTasks > 0 ? ((inProgressTasks / totalTasks) * 100).toFixed(1) : 0}%`);
  lines.push(`Task Chờ Làm (Todo),${todoTasks},Task,${totalTasks > 0 ? ((todoTasks / totalTasks) * 100).toFixed(1) : 0}%`);
  lines.push(``);

  // Section 3: KPI Quality Compliance
  lines.push(`[PHẦN 3: ĐÁNH GIÁ ĐỐI CHIẾU KPI CHẤT LƯỢNG VỚI QUY ĐỊNH CÔNG TY (NĂM ${activeConfig?.year || 2026})]`);
  lines.push(`Chỉ Số Chất Lượng,Số Lượng Vi Phạm / Tổng,Tỷ Lệ Thực Tế (%),Hạn Mức KPI Cam Kết (%),Đánh Giá Tuân Thủ,Trạng Thái`);
  
  const maxOverdue = activeConfig?.maxOverdueRate ?? 10;
  const overduePass = overdueRate <= maxOverdue;
  lines.push(
    `Tỷ Lệ Task Trễ Hạn,${overdueTasks}/${totalTasks},${overdueRate}%,<= ${maxOverdue}%,${cleanCSV(overduePass ? 'ĐẠT MỤC TIÊU' : `VƯỢT HẠN MỨC (+${(overdueRate - maxOverdue).toFixed(1)}%)`)},${cleanCSV(overduePass ? 'Tốt hơn mục tiêu' : 'Cảnh báo đỏ')}`
  );

  const maxBug = activeConfig?.maxBugRate ?? 4;
  const bugPass = bugRate <= maxBug;
  lines.push(
    `Tỷ Lệ Task Bug Phát Sinh,${bugTasks}/${totalTasks},${bugRate}%,<= ${maxBug}%,${cleanCSV(bugPass ? 'ĐẠT MỤC TIÊU' : `VƯỢT HẠN MỨC (+${(bugRate - maxBug).toFixed(1)}%)`)},${cleanCSV(bugPass ? 'Tốt hơn mục tiêu' : 'Cảnh báo đỏ')}`
  );

  const maxRework = activeConfig?.maxReworkRate ?? 5;
  const reworkPass = reworkRate <= maxRework;
  lines.push(
    `Tỷ Lệ Task Phải Re-work,${reworkTasks}/${totalTasks},${reworkRate}%,<= ${maxRework}%,${cleanCSV(reworkPass ? 'ĐẠT MỤC TIÊU' : `VƯỢT HẠN MỨC (+${(reworkRate - maxRework).toFixed(1)}%)`)},${cleanCSV(reworkPass ? 'Tốt hơn mục tiêu' : 'Cảnh báo đỏ')}`
  );
  lines.push(``);

  // Section 4: Member Workload & Overload Monitor
  lines.push(`[PHẦN 4: PHÂN BỔ TẢI TRỌNG NHÂN SỰ & CẢNH BÁO QUÁ TẢI (OVERLOAD)]`);
  lines.push(`STT,Họ Và Tên Thành Viên,Số Task Đảm Nhận,Tổng Story Points,Ước Tính Giờ Công (h),Task Bị Trễ,Đánh Giá Tải Trọng,Khuyến Nghị Phân Bổ`);
  members.forEach((m, idx) => {
    let workloadStatus = 'CÂN BẰNG (BALANCED)';
    let recommendation = 'Tải trọng phù hợp, tiếp tục theo dõi tiến độ';
    if (m.points >= 25 || m.hours >= 45 || m.taskCount >= 4) {
      workloadStatus = 'QUÁ TẢI (OVERLOAD)';
      recommendation = 'Nguy cơ chậm tiến độ cao. Cần san tải bớt task hoặc bổ sung nhân sự hỗ trợ!';
    } else if (m.points < 12 && m.hours < 20) {
      workloadStatus = 'CÒN TẢI (AVAILABLE)';
      recommendation = 'Có thể nhận thêm 1-2 user stories / tasks';
    }

    lines.push(
      `${idx + 1},${cleanCSV(m.name)},${m.taskCount},${m.points} SP,${m.hours}h,${m.overdueCount} task,${cleanCSV(workloadStatus)},${cleanCSV(recommendation)}`
    );
  });
  lines.push(``);

  // Section 5: Detailed Task List
  lines.push(`[PHẦN 5: DANH SÁCH CHI TIẾT TẤT CẢ USER STORIES & TASKS TRONG SPRINT]`);
  lines.push(`STT,Mã Task,Tiêu Đề Công Việc,Người Phụ Trách,Điểm SP,Giờ Kế Hoạch,Giờ Thực Tế,Loại Task,Mức Độ Ưu Tiên,Trạng Thái,Hạn Chót,Bị Trễ Hạn,Số Ngày Trễ,Nguyên Nhân Trễ (Nếu Có)`);
  tasks.forEach((t, idx) => {
    const statusText = t.status === 'done' ? 'Đã hoàn thành' : t.status === 'in_progress' ? 'Đang thực hiện' : 'Chờ làm';
    const typeText = t.type.toUpperCase();
    const priorityText = t.priority === 'urgent' ? 'Khẩn cấp' : t.priority === 'high' ? 'Cao' : 'Trung bình';
    const isOverdueText = t.isOverdue ? 'TRỄ HẠN' : 'Đúng hạn';
    const delayDaysText = t.delayDays ? `${t.delayDays} ngày` : '0';

    lines.push(
      `${idx + 1},${cleanCSV(t.code)},${cleanCSV(t.title)},${cleanCSV(t.assigneeName)},${t.storyPoints},${t.estimatedHours || 0},${t.actualHours || 0},${cleanCSV(typeText)},${cleanCSV(priorityText)},${cleanCSV(statusText)},${cleanCSV(t.dueDate || 'N/A')},${cleanCSV(isOverdueText)},${delayDaysText},${cleanCSV(t.delayReason || '')}`
    );
  });

  return '\uFEFF' + lines.join('\r\n');
}

/**
 * Generates an Excel Spreadsheet HTML with full styling, borders, colors, and mso-number-format
 * This avoids any `########` date overflow or text truncation issues when opened in Microsoft Excel.
 */
export function generateSprintExcelHtml(sprint: Sprint, kpiConfig: CompanyKPIConfig = DEFAULT_KPI_CONFIG): string {
  const activeConfig = kpiConfig && typeof kpiConfig === 'object' && kpiConfig.year ? kpiConfig : DEFAULT_KPI_CONFIG;
  const tasks = sprint.sprintTasks || [];
  const totalTasks = tasks.length || sprint.totalTasks || 0;
  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const todoTasks = tasks.filter((t) => t.status === 'todo').length;
  const overdueTasks = tasks.filter((t) => t.isOverdue).length;
  const bugTasks = tasks.filter((t) => t.type === 'bug').length;
  const reworkTasks = tasks.filter((t) => t.type === 'rework').length;

  const overdueRate = totalTasks > 0 ? Number(((overdueTasks / totalTasks) * 100).toFixed(1)) : 0;
  const bugRate = totalTasks > 0 ? Number(((bugTasks / totalTasks) * 100).toFixed(1)) : 0;
  const reworkRate = totalTasks > 0 ? Number(((reworkTasks / totalTasks) * 100).toFixed(1)) : 0;

  const memberMap: Record<
    string,
    { name: string; taskCount: number; points: number; hours: number; overdueCount: number }
  > = {};
  tasks.forEach((t) => {
    const name = t.assigneeName || 'Chưa phân công';
    if (!memberMap[name]) {
      memberMap[name] = { name, taskCount: 0, points: 0, hours: 0, overdueCount: 0 };
    }
    memberMap[name].taskCount += 1;
    memberMap[name].points += t.storyPoints || 0;
    memberMap[name].hours += t.estimatedHours || 0;
    if (t.isOverdue) memberMap[name].overdueCount += 1;
  });
  const members = Object.values(memberMap);

  const maxOverdue = activeConfig?.maxOverdueRate ?? 10;
  const maxBug = activeConfig?.maxBugRate ?? 4;
  const maxRework = activeConfig?.maxReworkRate ?? 5;

  return `
  <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <!--[if gte mso 9]>
    <xml>
      <x:ExcelWorkbook>
        <x:ExcelWorksheets>
          <x:ExcelWorksheet>
            <x:Name>${sprint.name.slice(0, 30)}</x:Name>
            <x:WorksheetOptions>
              <x:DisplayGridlines/>
            </x:WorksheetOptions>
          </x:ExcelWorksheet>
        </x:ExcelWorksheets>
      </x:ExcelWorkbook>
    </xml>
    <![endif]-->
    <style>
      body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; font-size: 11pt; color: #1e293b; }
      table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
      th { background-color: #1e3a8a; color: #ffffff; font-weight: bold; border: 1px solid #94a3b8; padding: 8px 10px; text-align: left; }
      td { border: 1px solid #cbd5e1; padding: 6px 10px; mso-number-format:'\\@'; }
      .num { text-align: right; mso-number-format:'#,##0'; }
      .text-center { text-align: center; }
      .section-banner { background-color: #0284c7; color: #ffffff; font-weight: bold; font-size: 12pt; padding: 10px; }
      .title-banner { background-color: #0f172a; color: #ffffff; font-size: 15pt; font-weight: bold; text-align: center; padding: 14px; }
      .badge-ok { background-color: #dcfce7; color: #15803d; font-weight: bold; }
      .badge-fail { background-color: #fee2e2; color: #b91c1c; font-weight: bold; }
      .badge-warn { background-color: #fef3c7; color: #b45309; font-weight: bold; }
    </style>
  </head>
  <body>
    <table>
      <tr>
        <td colspan="8" class="title-banner">BÁO CÁO CHI TIẾT SPRINT & ĐỐI CHIẾU KPI CHẤT LƯỢNG DOANH NGHIỆP</td>
      </tr>
      <tr>
        <td colspan="8" style="background-color: #f1f5f9; text-align: right; font-style: italic;">Thời điểm xuất báo cáo: ${new Date().toLocaleString('vi-VN')}</td>
      </tr>
    </table>

    <!-- PHẦN 1 -->
    <table>
      <tr><td colspan="4" class="section-banner">[PHẦN 1: THÔNG TIN TỔNG QUAN SPRINT & DỰ ÁN]</td></tr>
      <tr><td style="font-weight:bold; width:220px; background:#f8fafc;">Tên Sprint:</td><td colspan="3">${sprint.name}</td></tr>
      <tr><td style="font-weight:bold; background:#f8fafc;">Mã & Tên Dự Án:</td><td colspan="3"><strong>${sprint.projectCode || 'N/A'}</strong> - ${sprint.projectName}</td></tr>
      <tr><td style="font-weight:bold; background:#f8fafc;">Khách Hàng / Đối Tác:</td><td colspan="3">${sprint.clientName}</td></tr>
      <tr><td style="font-weight:bold; background:#f8fafc;">Mục Tiêu Sprint:</td><td colspan="3">${sprint.goal || 'Hoàn tất các chức năng cam kết'}</td></tr>
      <tr><td style="font-weight:bold; background:#f8fafc;">Kế Hoạch & Dự Kiến:</td><td colspan="3">${sprint.startDate} đến ${sprint.endDate} (Dự kiến xong: ${sprint.forecastEndDate || sprint.endDate})</td></tr>
      <tr><td style="font-weight:bold; background:#f8fafc;">Tiến Độ & Trễ Hạn:</td><td colspan="3">${sprint.forecastStatus === 'on_track' ? 'Đúng tiến độ' : 'Chậm tiến độ'} (${sprint.delayDays ? `${sprint.delayDays} ngày` : '0 ngày'}) ${sprint.delayReason ? ` - Lý do: ${sprint.delayReason}` : ''}</td></tr>
    </table>

    <!-- PHẦN 2 -->
    <table>
      <tr><td colspan="4" class="section-banner">[PHẦN 2: TIẾN ĐỘ THỰC HIỆN & STORY POINTS]</td></tr>
      <tr style="background:#f1f5f9;">
        <th>Chỉ Số Tiến Độ</th>
        <th class="num">Giá Trị</th>
        <th>Đơn Vị</th>
        <th>Ghi Chú</th>
      </tr>
      <tr><td>Tổng Story Points Cam Kết</td><td class="num">${sprint.committedPoints}</td><td>SP</td><td>Tổng quy mô cam kết ban đầu</td></tr>
      <tr><td>Đã Hoàn Thành (Done)</td><td class="num">${sprint.completedPoints}</td><td>SP</td><td>${sprint.progress}% tiến độ</td></tr>
      <tr><td>Điểm Còn Lại (Remaining)</td><td class="num">${Math.max(0, sprint.committedPoints - sprint.completedPoints)}</td><td>SP</td><td>Cần đốt trong thời gian còn lại</td></tr>
      <tr><td>Vận Tốc Đốt (Velocity)</td><td class="num">${sprint.velocity || 7.4}</td><td>SP/ngày</td><td>Tốc độ giải quyết trung bình</td></tr>
      <tr><td>Tổng Số Lượng Task</td><td class="num">${totalTasks}</td><td>Task</td><td>Toàn bộ Feature / Bug / CR / Rework</td></tr>
      <tr><td>Task Đã Xong (Done)</td><td class="num">${doneTasks}</td><td>Task</td><td>${totalTasks > 0 ? ((doneTasks / totalTasks) * 100).toFixed(1) : 0}% hoàn thành</td></tr>
      <tr><td>Task Đang Làm (In Progress)</td><td class="num">${inProgressTasks}</td><td>Task</td><td>${totalTasks > 0 ? ((inProgressTasks / totalTasks) * 100).toFixed(1) : 0}%</td></tr>
      <tr><td>Task Chờ Làm (Todo)</td><td class="num">${todoTasks}</td><td>Task</td><td>${totalTasks > 0 ? ((todoTasks / totalTasks) * 100).toFixed(1) : 0}%</td></tr>
    </table>

    <!-- PHẦN 3 -->
    <table>
      <tr><td colspan="6" class="section-banner">[PHẦN 3: ĐÁNH GIÁ ĐỐI CHIẾU KPI CHẤT LƯỢNG VỚI QUY ĐỊNH CÔNG TY (NĂM ${activeConfig?.year || 2026})]</td></tr>
      <tr style="background:#f1f5f9;">
        <th>Chỉ Số Chất Lượng</th>
        <th class="text-center">Số Lượng Vi Phạm / Tổng</th>
        <th class="num">Tỷ Lệ Thực Tế</th>
        <th class="num">Hạn Mức KPI Cam Kết</th>
        <th class="text-center">Đánh Giá Tuân Thủ</th>
        <th>Trạng Thái</th>
      </tr>
      <tr>
        <td>Tỷ Lệ Task Trễ Hạn</td>
        <td class="text-center">${overdueTasks}/${totalTasks}</td>
        <td class="num">${overdueRate}%</td>
        <td class="num">&le; ${maxOverdue}%</td>
        <td class="text-center ${overdueRate <= maxOverdue ? 'badge-ok' : 'badge-fail'}">${overdueRate <= maxOverdue ? 'ĐẠT MỤC TIÊU' : `VƯỢT HẠN MỨC (+${(overdueRate - maxOverdue).toFixed(1)}%)`}</td>
        <td>${overdueRate <= maxOverdue ? 'Tốt hơn mục tiêu' : 'Cảnh báo đỏ'}</td>
      </tr>
      <tr>
        <td>Tỷ Lệ Task Bug Phát Sinh</td>
        <td class="text-center">${bugTasks}/${totalTasks}</td>
        <td class="num">${bugRate}%</td>
        <td class="num">&le; ${maxBug}%</td>
        <td class="text-center ${bugRate <= maxBug ? 'badge-ok' : 'badge-fail'}">${bugRate <= maxBug ? 'ĐẠT MỤC TIÊU' : `VƯỢT HẠN MỨC (+${(bugRate - maxBug).toFixed(1)}%)`}</td>
        <td>${bugRate <= maxBug ? 'Tốt hơn mục tiêu' : 'Cảnh báo đỏ'}</td>
      </tr>
      <tr>
        <td>Tỷ Lệ Task Phải Re-work</td>
        <td class="text-center">${reworkTasks}/${totalTasks}</td>
        <td class="num">${reworkRate}%</td>
        <td class="num">&le; ${maxRework}%</td>
        <td class="text-center ${reworkRate <= maxRework ? 'badge-ok' : 'badge-fail'}">${reworkRate <= maxRework ? 'ĐẠT MỤC TIÊU' : `VƯỢT HẠN MỨC (+${(reworkRate - maxRework).toFixed(1)}%)`}</td>
        <td>${reworkRate <= maxRework ? 'Tốt hơn mục tiêu' : 'Cảnh báo đỏ'}</td>
      </tr>
    </table>

    <!-- PHẦN 4 -->
    <table>
      <tr><td colspan="8" class="section-banner">[PHẦN 4: PHÂN BỔ TẢI TRỌNG NHÂN SỰ & CẢNH BÁO QUÁ TẢI (OVERLOAD)]</td></tr>
      <tr style="background:#f1f5f9;">
        <th class="text-center">STT</th>
        <th>Họ Và Tên Thành Viên</th>
        <th class="num">Số Task Đảm Nhận</th>
        <th class="num">Tổng Story Points</th>
        <th class="num">Ước Tính Giờ Công (h)</th>
        <th class="num">Task Bị Trễ</th>
        <th class="text-center">Đánh Giá Tải Trọng</th>
        <th>Khuyến Nghị Phân Bổ</th>
      </tr>
      ${members
        .map((m, idx) => {
          const isOverload = m.points >= 25 || m.hours >= 45 || m.taskCount >= 4;
          const isAvailable = m.points < 12 && m.hours < 20;
          const status = isOverload ? 'QUÁ TẢI (OVERLOAD)' : isAvailable ? 'CÒN TẢI (AVAILABLE)' : 'CÂN BẰNG (BALANCED)';
          const badgeClass = isOverload ? 'badge-fail' : isAvailable ? 'badge-warn' : 'badge-ok';
          const rec = isOverload
            ? 'Nguy cơ chậm tiến độ cao. Cần san tải bớt task hoặc bổ sung hỗ trợ!'
            : isAvailable
            ? 'Có thể nhận thêm 1-2 user stories / tasks'
            : 'Tải trọng phù hợp, tiếp tục theo dõi tiến độ';
          return `
            <tr>
              <td class="text-center">${idx + 1}</td>
              <td><strong>${m.name}</strong></td>
              <td class="num">${m.taskCount}</td>
              <td class="num">${m.points} SP</td>
              <td class="num">${m.hours}h</td>
              <td class="num">${m.overdueCount}</td>
              <td class="text-center ${badgeClass}">${status}</td>
              <td>${rec}</td>
            </tr>
          `;
        })
        .join('')}
    </table>

    <!-- PHẦN 5 -->
    <table>
      <tr><td colspan="14" class="section-banner">[PHẦN 5: DANH SÁCH CHI TIẾT TẤT CẢ USER STORIES & TASKS TRONG SPRINT]</td></tr>
      <tr style="background:#f1f5f9;">
        <th class="text-center">STT</th>
        <th>Mã Task</th>
        <th>Tiêu Đề Công Việc</th>
        <th>Người Phụ Trách</th>
        <th class="num">Điểm SP</th>
        <th class="num">Giờ Kế Hoạch</th>
        <th class="num">Giờ Thực Tế</th>
        <th class="text-center">Loại Task</th>
        <th class="text-center">Độ Ưu Tiên</th>
        <th class="text-center">Trạng Thái</th>
        <th class="text-center" style="width:110px;">Hạn Chót</th>
        <th class="text-center">Bị Trễ Hạn</th>
        <th class="num">Số Ngày Trễ</th>
        <th>Nguyên Nhân Trễ (Nếu Có)</th>
      </tr>
      ${tasks
        .map((t, idx) => {
          const statusText = t.status === 'done' ? 'Đã hoàn thành' : t.status === 'in_progress' ? 'Đang thực hiện' : 'Chờ làm';
          const typeText = t.type.toUpperCase();
          const priorityText = t.priority === 'urgent' ? 'Khẩn cấp' : t.priority === 'high' ? 'Cao' : 'Trung bình';
          const isOverdueText = t.isOverdue ? 'TRỄ HẠN' : 'Đúng hạn';
          const overdueClass = t.isOverdue ? 'badge-fail' : '';

          return `
            <tr>
              <td class="text-center">${idx + 1}</td>
              <td><strong>${t.code}</strong></td>
              <td>${t.title}</td>
              <td>${t.assigneeName || 'N/A'}</td>
              <td class="num">${t.storyPoints || 0}</td>
              <td class="num">${t.estimatedHours || 0}h</td>
              <td class="num">${t.actualHours || 0}h</td>
              <td class="text-center">${typeText}</td>
              <td class="text-center">${priorityText}</td>
              <td class="text-center">${statusText}</td>
              <td class="text-center" style="mso-number-format:'\\@';">${t.dueDate || 'N/A'}</td>
              <td class="text-center ${overdueClass}">${isOverdueText}</td>
              <td class="num">${t.delayDays ? `${t.delayDays} ngày` : '0'}</td>
              <td>${t.delayReason || ''}</td>
            </tr>
          `;
        })
        .join('')}
    </table>
  </body>
  </html>
  `;
}

/**
 * Downloads a professionally formatted Excel spreadsheet (.xls) for a Sprint
 */
export function downloadSprintExcel(sprint: Sprint, kpiConfig: CompanyKPIConfig = DEFAULT_KPI_CONFIG): void {
  const htmlContent = generateSprintExcelHtml(sprint, kpiConfig);
  const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeName = (sprint.projectCode || sprint.name).replace(/[^a-zA-Z0-9_-]/g, '_');
  link.setAttribute('href', url);
  link.setAttribute('download', `Bao_Cao_Sprint_${safeName}_${new Date().toISOString().slice(0, 10)}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a clean Sprint CSV
 */
export function downloadSprintCSV(sprint: Sprint, kpiConfig: CompanyKPIConfig = DEFAULT_KPI_CONFIG): void {
  const csvContent = generateSprintCSV(sprint, kpiConfig);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeName = (sprint.projectCode || sprint.name).replace(/[^a-zA-Z0-9_-]/g, '_');
  link.setAttribute('href', url);
  link.setAttribute('download', `Bao_Cao_Sprint_${safeName}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates an executive, comprehensive CSV for a Project matching exact reporting template
 */
export function generateProjectCSV(
  project: Project,
  sprints: Sprint[] = [],
  tasksOrKpi?: Task[] | CompanyKPIConfig,
  maybeKpi?: CompanyKPIConfig
): string {
  let tasks: Task[] = [];
  let kpiConfig: CompanyKPIConfig = DEFAULT_KPI_CONFIG;

  if (Array.isArray(tasksOrKpi)) {
    tasks = tasksOrKpi;
    if (maybeKpi) kpiConfig = maybeKpi;
  } else if (tasksOrKpi && 'maxOverdueRate' in tasksOrKpi) {
    kpiConfig = tasksOrKpi as CompanyKPIConfig;
  }

  const projectTasks = tasks.filter((t) => t.projectId === project.id || t.projectName === project.name || t.projectId === project.code);
  const totalTasks = project.tasksCount || (projectTasks.length || 243);
  const completedTasks = project.completedTasksCount || projectTasks.filter((t) => t.status === 'done').length || 215;
  const overdueTasks = project.overdueTasksCount || 6;
  const crTasks = project.crTasksCount || 32;

  const lines: string[] = [];

  // Title Banner
  lines.push(`BÁO CÁO TOÀN DIỆN VÒNG ĐỜI DỰ ÁN & TIẾN ĐỘ THỰC HIỆN CHI TIẾT`);
  lines.push(`Thời điểm trích xuất:,${cleanCSV(new Date().toLocaleString('vi-VN'))}`);
  lines.push(``);

  // Section 1: Long-term Project Profile
  lines.push(`[PHẦN 1: HỒ SƠ VÒNG ĐỜI DỰ ÁN DÀI HẠN]`);
  lines.push(`Mã Dự Án (Code):,${cleanCSV(project.code)}`);
  lines.push(`Tên Dự Án (Project Name):,${cleanCSV(project.name)}`);
  lines.push(`Quản Lý Dự Án (PM):,${cleanCSV(project.pmName || 'Nguyễn Văn A (PM Lead)')}`);
  lines.push(`Khách Hàng / Chủ Đầu Tư:,${cleanCSV(project.client || 'CÔNG TY CỔ PHẦN CHIPS (#CUST-1092)')}`);
  lines.push(`Ngày Bắt Đầu Thực Tế:,${cleanCSV(project.startDate || '01/11/2025')}`);
  lines.push(`Deadline Kế Hoạch Ban Đầu:,${cleanCSV(project.plannedDeadline || project.deadline || '01/07/2026 (35 Tuần)')}`);
  lines.push(`Dự Kiến Hoàn Thành Thực Tế:,${cleanCSV(project.actualExpectedDeadline || '01/08/2026 (39 Tuần)')}`);
  lines.push(`Thời Gian Kéo Dài / Phát Sinh:,${cleanCSV(project.delayWeeks ? `+${project.delayWeeks} Tuần (Do thêm Scope CR)` : 'Đúng hạn')}`);
  lines.push(
    `Phạm Vi Dự Án & Nguyên Nhân Kéo Dài Thời Gian:,${cleanCSV(
      project.scopeDescription || project.delayReasonSummary || 'Dự án quy mô lớn kéo dài 35 tuần chính thức + 4 tuần phát sinh thêm 2 module mới: Định vị GPS nâng cao và Tự động hóa Báo cáo KPI cho Kế toán. Đội ngũ gồm 10 nhân sự Kỹ thuật, QA, BA, Mobile và Infra cùng phối hợp triển khai.'
    )}`
  );
  lines.push(``);

  // Section 2: Phases / Sprints List
  lines.push(`[PHẦN 2: DANH SÁCH CÁC SPRINT / GIAI ĐOẠN TRONG VÒNG ĐỜI DỰ ÁN]`);
  lines.push(`STT,Giai Đoạn / Sprint,Thời Gian Triển Khai,Mục Tiêu Chính,Số Task,Giờ Est / Kế Hoạch (h),Giờ Thực Tế (h),Trạng Thái Nghiệm Thu`);
  const phases = project.phases && project.phases.length > 0 ? project.phases : [
    { id: 'p1', name: 'Phase 1: Khởi Tạo & Core IAM', period: 'Tuần 01 - Tuần 08 (Nov - Dec 2025)', mainGoal: 'Xây dựng hạ tầng Authen & IAM', taskCount: 55, plannedHours: 740, actualHours: 720, status: 'completed' as const, acceptanceRate: 100 },
    { id: 'p2', name: 'Phase 2: Module Ticket & GPS', period: 'Tuần 09 - Tuần 20 (Jan - Mar 2026)', mainGoal: 'Phát triển Ticket CS & GPS Tracking', taskCount: 72, plannedHours: 1120, actualHours: 1180, status: 'completed' as const, acceptanceRate: 100 },
    { id: 'p3', name: 'Phase 3: Module Daily Report', period: 'Tuần 21 - Tuần 30 (Apr - Jun 2026)', mainGoal: 'Báo cáo ngày & Socket real-time', taskCount: 58, plannedHours: 980, actualHours: 1040, status: 'completed' as const, acceptanceRate: 100 },
    { id: 'p4', name: 'Phase 4: CR Báo Cáo Kế Toán & Optimization', period: 'Tuần 31 - Tuần 39 (Jul - Aug 2026)', mainGoal: 'Phát sinh thêm Báo cáo Kế toán & Tối ưu SQL', taskCount: 58, plannedHours: 1360, actualHours: 1640, status: 'in_progress' as const, acceptanceRate: 85 },
  ];
  phases.forEach((ph, idx) => {
    const statusText = ph.status === 'completed' ? 'Đã Nghiệm Thu' : 'Đang Triển Khai';
    lines.push(`${idx + 1},${cleanCSV(ph.name)},${cleanCSV(ph.period)},${cleanCSV(ph.mainGoal || '')},${ph.taskCount || 0} Task,${ph.plannedHours}h,${ph.actualHours}h,${cleanCSV(statusText)}`);
  });
  lines.push(``);

  // Section 3: Overview Progress & Budget Metrics
  lines.push(`[PHẦN 3: TỔNG QUAN CHỈ SỐ TIẾN ĐỘ & NGÂN SÁCH GIỜ CÔNG TOÀN DỰ ÁN]`);
  lines.push(`Chỉ Số Quản Trị,Giá Trị Thực Tế,Định Mức / Kế Hoạch,Đánh Giá & Ghi Chú`);
  lines.push(`Tiến Độ Vòng Đời Dự Án,${project.progress}%,${project.plannedProgress || 92}%,Đã xong ${completedTasks}/${totalTasks} Task (10 Nhân sự)`);
  lines.push(`Ngân Sách Giờ Công Tích Lũy,${project.actualHours}h,${project.totalBudgetHours}h,Thực tế ${project.actualHours > project.totalBudgetHours ? `vượt +${project.actualHours - project.totalBudgetHours}h do phát sinh CR` : 'nằm trong ngân sách'}`);
  lines.push(`Số Task Phát Sinh (CR),${crTasks} Task,${totalTasks} Task,Chiếm ${((crTasks / totalTasks) * 100).toFixed(1)}% tổng khối lượng dự án`);
  lines.push(`Độ Trễ Tổng Thể Kéo Dài,${project.delayWeeks ? `+${project.delayWeeks} Tuần` : '0 Tuần'},${project.plannedDeadline || '35 Tuần'},Kéo dài do thêm phạm vi CR`);
  lines.push(`Tỷ Lệ Đúng Hạn Tổng Thể (SLA OTD),${project.slaOtd || 94.1}%,Mục tiêu >= 90%,Đạt chuẩn cam kết chất lượng`);
  lines.push(``);

  // Section 4: 10 Members Statistics (No letter grade A, B, C)
  lines.push(`[PHẦN 4: THỐNG KÊ 10 MEMBER TOÀN DỰ ÁN]`);
  lines.push(`STT,Thành Viên,Vai Trò Dự Án,Tổng Task,Kế Hoạch (Baseline),Phát Sinh (CR),Giờ Est (h),Giờ Thực Tế (h),Task Bị Trễ,Tỷ Lệ Đúng Hạn (%),Đánh Giá Năng Suất`);
  const members = project.memberStats && project.memberStats.length > 0 ? project.memberStats : [
    { id: 'm1', name: 'Nguyễn Văn A', role: 'Frontend Lead', totalTasks: 34, baselineTasks: 30, crTasks: 4, estimatedHours: 520, actualHours: 500, overdueTasks: 2, onTimeRate: 94.1, performanceRating: 'Xuất Sắc' as const },
    { id: 'm2', name: 'Trần Thị B', role: 'Backend Lead', totalTasks: 38, baselineTasks: 32, crTasks: 6, estimatedHours: 610, actualHours: 680, overdueTasks: 4, onTimeRate: 89.4, performanceRating: 'Khá (Vượt Giờ)' as const },
    { id: 'm3', name: 'Lê Văn C', role: 'QA / Tester Lead', totalTasks: 35, baselineTasks: 32, crTasks: 3, estimatedHours: 480, actualHours: 470, overdueTasks: 1, onTimeRate: 97.1, performanceRating: 'Xuất Sắc' as const },
    { id: 'm4', name: 'Phạm Văn D', role: 'Fullstack Dev', totalTasks: 30, baselineTasks: 24, crTasks: 6, estimatedHours: 450, actualHours: 590, overdueTasks: 3, onTimeRate: 90.0, performanceRating: 'Khá (Vượt Giờ)' as const },
    { id: 'm5', name: 'Hoàng Thị E', role: 'DevOps / Infra', totalTasks: 22, baselineTasks: 18, crTasks: 4, estimatedHours: 360, actualHours: 350, overdueTasks: 1, onTimeRate: 95.5, performanceRating: 'Xuất Sắc' as const },
    { id: 'm6', name: 'Đỗ Văn F', role: 'Senior Backend Dev', totalTasks: 28, baselineTasks: 24, crTasks: 4, estimatedHours: 480, actualHours: 520, overdueTasks: 2, onTimeRate: 92.8, performanceRating: 'Tốt' as const },
    { id: 'm7', name: 'Vũ Thị G', role: 'UI/UX Designer', totalTasks: 16, baselineTasks: 14, crTasks: 2, estimatedHours: 280, actualHours: 270, overdueTasks: 0, onTimeRate: 100, performanceRating: 'Xuất Sắc' as const },
    { id: 'm8', name: 'Đặng Văn H', role: 'Mobile Dev', totalTasks: 20, baselineTasks: 16, crTasks: 4, estimatedHours: 420, actualHours: 440, overdueTasks: 2, onTimeRate: 90.0, performanceRating: 'Tốt' as const },
    { id: 'm9', name: 'Bùi Thị I', role: 'Business Analyst', totalTasks: 12, baselineTasks: 10, crTasks: 2, estimatedHours: 240, actualHours: 230, overdueTasks: 0, onTimeRate: 100, performanceRating: 'Xuất Sắc' as const },
    { id: 'm10', name: 'Ngô Văn K', role: 'Security Specialist', totalTasks: 8, baselineTasks: 6, crTasks: 2, estimatedHours: 180, actualHours: 170, overdueTasks: 0, onTimeRate: 100, performanceRating: 'Xuất Sắc' as const },
  ];
  members.forEach((m, idx) => {
    lines.push(`${idx + 1},${cleanCSV(m.name)},${cleanCSV(m.role)},${m.totalTasks},${m.baselineTasks},${m.crTasks},${m.estimatedHours}h,${m.actualHours}h,${m.overdueTasks},${m.onTimeRate}%,${cleanCSV(m.performanceRating)}`);
  });
  lines.push(``);

  // Section 5: Overdue Tasks Analysis
  lines.push(`[PHẦN 5: PHÂN TÍCH TASK TRỄ HẠN & NGUYÊN NHÂN KÉO DÀI DỰ ÁN]`);
  lines.push(`Mã Task,Tên Công Việc / Module,Loại Scope,Người Phụ Trách,Reviewer / QA,Deadline Gốc,Hoàn Thành Thực Tế,Số Ngày Trễ,Lý Do Chi Tiết Phân Tích`);
  const overdues = project.overdueAnalysis && project.overdueAnalysis.length > 0 ? project.overdueAnalysis : [
    { code: 'CS-CR-01', title: 'Phát sinh Module Báo Cáo Dự Án Cho Kế Toán', type: 'CR (Phát sinh)', assignee: 'PhamVanD', reviewer: 'NguyenVanA', dueDate: '15/07/2026', actualCompletionDate: '28/07/2026', delayDays: 13, reason: 'Yêu cầu nghiệp vụ Kế toán bổ sung thêm Hồ sơ dự án & Toggle đóng mở khối' },
    { code: 'CS-108', title: 'Tối ưu hóa query SQL Báo cáo KPI Tổng hợp', type: 'Baseline (Kế hoạch)', assignee: 'PhamVanD', reviewer: 'TranThiB', dueDate: '20/06/2026', actualCompletionDate: '05/07/2026', delayDays: 15, reason: 'Dữ liệu task_logs lớn hơn dự kiến, cần viết lại stored procedure' },
    { code: 'CS-102', title: 'Tích hợp Socket Real-time cho Report Module', type: 'Baseline (Kế hoạch)', assignee: 'TranThiB', reviewer: 'NguyenVanA', dueDate: '18/05/2026', actualCompletionDate: '28/05/2026', delayDays: 10, reason: 'Phát sinh bug memory leak khi nhận event socket liên tục' },
    { code: 'CS-CR-05', title: 'Tích hợp Hạ tầng Authen IAM Public Key mới', type: 'CR (Phát sinh)', assignee: 'HoangThiE', reviewer: 'TranThiB', dueDate: '10/04/2026', actualCompletionDate: '22/04/2026', delayDays: 12, reason: 'Chờ nâng cấp Server HSM hạ tầng mạng từ phía đối tác' },
    { code: 'CS-110', title: 'Xử lý sai lệch tọa độ GPS trên ứng dụng Mobile App', type: 'Baseline (Kế hoạch)', assignee: 'DangVanH', reviewer: 'LeVanC', dueDate: '12/03/2026', actualCompletionDate: '24/03/2026', delayDays: 12, reason: 'Thiết bị Android đời cũ bị trôi định vị trong môi trường nhà cao tầng' },
    { code: 'CS-118', title: 'Cấu hình Cluster Server chịu tải cho API Backend', type: 'Baseline (Kế hoạch)', assignee: 'DoVanF', reviewer: 'HoangThiE', dueDate: '05/02/2026', actualCompletionDate: '15/02/2026', delayDays: 10, reason: 'Phát sinh tranh chấp tài nguyên RAM giữa Docker containers' },
  ];
  overdues.forEach((o) => {
    lines.push(`${cleanCSV(o.code)},${cleanCSV(o.title)},${cleanCSV(o.type)},${cleanCSV(o.assignee)},${cleanCSV(o.reviewer)},${cleanCSV(o.dueDate)},${cleanCSV(o.actualCompletionDate || o.dueDate)},+${o.delayDays} Ngày,${cleanCSV(o.reason)}`);
  });
  lines.push(``);

  // Section 6: Detailed Work Logs
  lines.push(`[PHẦN 6: NHẬT KÝ CHI TIẾT CÔNG VIỆC MEMBER CÓ PHÂN TRANG (MÔ PHỎNG 25 TASK)]`);
  lines.push(`STT,Mã Task,Thành Viên,Tên Công Việc Thực Hiện,Giai Đoạn / Sprint,Giờ Est (h),Giờ Thực Tế (h),Trạng Thái,Kết Quả / Sản Phẩm Nghiệm Thu`);
  const workLogs = project.detailedWorkLogs && project.detailedWorkLogs.length > 0 ? project.detailedWorkLogs : [
    { id: '1', code: 'CS-101', memberName: 'Nguyễn Văn A', taskTitle: 'Thiết kế Layout Báo Cáo Daily Report mới', phaseSprint: 'Phase 3 (Sprint 11)', estimatedHours: 16, actualHours: 14, statusLabel: 'Đã Hoàn Thành', deliveryResult: 'Đã merge PR UI hoạt động mượt mà' },
    { id: '2', code: 'CS-102', memberName: 'Trần Thị B', taskTitle: 'Tích hợp Socket Real-time cho Report Module', phaseSprint: 'Phase 3 (Sprint 12)', estimatedHours: 24, actualHours: 30, statusLabel: 'Trễ Hạn', deliveryResult: 'Đã fix xong bug memory leak đã deploy staging' },
    { id: '3', code: 'CS-103', memberName: 'Lê Văn C', taskTitle: 'Kiểm thử chéo module Quản lý Sprint', phaseSprint: 'Phase 3 (Sprint 13)', estimatedHours: 16, actualHours: 16, statusLabel: 'Đã Hoàn Thành', deliveryResult: 'Bắt được 4 bugs Major trước khi release' },
    { id: '4', code: 'CS-104', memberName: 'Phạm Văn D', taskTitle: 'Tối ưu hóa query SQL Báo cáo KPI Tổng hợp', phaseSprint: 'Phase 4 (Sprint 16)', estimatedHours: 20, actualHours: 32, statusLabel: 'Trễ Hạn', deliveryResult: 'Giảm thời gian phản hồi query từ 4.2s xuống 120ms' },
    { id: '5', code: 'CS-105', memberName: 'Nguyễn Văn A', taskTitle: 'Tạo file mẫu baocao.html cho Kế toán', phaseSprint: 'Phase 4 (Tuần 36)', estimatedHours: 12, actualHours: 10, statusLabel: 'Đã Hoàn Thành', deliveryResult: 'Đã hoàn thành mẫu HTML responsive print & toggle' },
    { id: '6', code: 'CS-106', memberName: 'Hoàng Thị E', taskTitle: 'Cấu hình Docker Swarm & CI/CD Pipeline', phaseSprint: 'Phase 1 (Sprint 02)', estimatedHours: 32, actualHours: 30, statusLabel: 'Đã Hoàn Thành', deliveryResult: 'Tự động hóa deploy lên Staging server' },
    { id: '7', code: 'CS-107', memberName: 'Đỗ Văn F', taskTitle: 'Cấu hình Redis Cache cho Session người dùng', phaseSprint: 'Phase 1 (Sprint 03)', estimatedHours: 24, actualHours: 26, statusLabel: 'Đã Hoàn Thành', deliveryResult: 'Giảm tải cho database MySQL 40%' },
    { id: '8', code: 'CS-108', memberName: 'Vũ Thị G', taskTitle: 'Thiết kế Wireframe & UI Kit chuẩn Figma cho CS', phaseSprint: 'Phase 1 (Sprint 01)', estimatedHours: 40, actualHours: 38, statusLabel: 'Đã Hoàn Thành', deliveryResult: 'Đã bàn giao Design System đầy đủ' },
    { id: '9', code: 'CS-109', memberName: 'Đặng Văn H', taskTitle: 'Xây dựng ứng dụng Mobile CS trên React Native', phaseSprint: 'Phase 2 (Sprint 05)', estimatedHours: 60, actualHours: 68, statusLabel: 'Đã Hoàn Thành', deliveryResult: 'Build thành công file APK & IPA' },
    { id: '10', code: 'CS-110', memberName: 'Bùi Thị I', taskTitle: 'Khảo sát & Viết SRS Yêu cầu Nghiệp vụ Kế toán', phaseSprint: 'Phase 4 (Sprint 15)', estimatedHours: 20, actualHours: 18, statusLabel: 'Đã Hoàn Thành', deliveryResult: 'Đã chốt xong tài liệu URS với Kế toán trưởng' },
  ];
  workLogs.forEach((w, idx) => {
    lines.push(`${idx + 1},${cleanCSV(w.code)},${cleanCSV(w.memberName)},${cleanCSV(w.taskTitle)},${cleanCSV(w.phaseSprint)},${w.estimatedHours}h,${w.actualHours}h,${cleanCSV(w.statusLabel)},${cleanCSV(w.deliveryResult)}`);
  });

  return '\uFEFF' + lines.join('\r\n');
}

/**
 * Generates an Excel Spreadsheet HTML with full styling for long-term project report
 */
export function generateProjectExcelHtml(
  project: Project,
  sprints: Sprint[] = [],
  tasksOrKpi?: Task[] | CompanyKPIConfig,
  maybeKpi?: CompanyKPIConfig
): string {
  let tasks: Task[] = [];
  if (Array.isArray(tasksOrKpi)) {
    tasks = tasksOrKpi;
  }

  const projectTasks = tasks.filter((t) => t.projectId === project.id || t.projectName === project.name || t.projectId === project.code);
  const totalTasks = project.tasksCount || (projectTasks.length || 243);
  const completedTasks = project.completedTasksCount || projectTasks.filter((t) => t.status === 'done').length || 215;
  const overdueTasks = project.overdueTasksCount || 6;
  const crTasks = project.crTasksCount || 32;

  const phases = project.phases && project.phases.length > 0 ? project.phases : [
    { id: 'p1', name: 'Phase 1: Khởi Tạo & Core IAM', period: 'Tuần 01 - Tuần 08 (Nov - Dec 2025)', mainGoal: 'Xây dựng hạ tầng Authen & IAM', taskCount: 55, plannedHours: 740, actualHours: 720, status: 'completed' as const, acceptanceRate: 100 },
    { id: 'p2', name: 'Phase 2: Module Ticket & GPS', period: 'Tuần 09 - Tuần 20 (Jan - Mar 2026)', mainGoal: 'Phát triển Ticket CS & GPS Tracking', taskCount: 72, plannedHours: 1120, actualHours: 1180, status: 'completed' as const, acceptanceRate: 100 },
    { id: 'p3', name: 'Phase 3: Module Daily Report', period: 'Tuần 21 - Tuần 30 (Apr - Jun 2026)', mainGoal: 'Báo cáo ngày & Socket real-time', taskCount: 58, plannedHours: 980, actualHours: 1040, status: 'completed' as const, acceptanceRate: 100 },
    { id: 'p4', name: 'Phase 4: CR Báo Cáo Kế Toán & Optimization', period: 'Tuần 31 - Tuần 39 (Jul - Aug 2026)', mainGoal: 'Phát sinh thêm Báo cáo Kế toán & Tối ưu SQL', taskCount: 58, plannedHours: 1360, actualHours: 1640, status: 'in_progress' as const, acceptanceRate: 85 },
  ];

  const members = project.memberStats && project.memberStats.length > 0 ? project.memberStats : [
    { id: 'm1', name: 'Nguyễn Văn A', role: 'Frontend Lead', totalTasks: 34, baselineTasks: 30, crTasks: 4, estimatedHours: 520, actualHours: 500, overdueTasks: 2, onTimeRate: 94.1, performanceRating: 'Xuất Sắc' as const },
    { id: 'm2', name: 'Trần Thị B', role: 'Backend Lead', totalTasks: 38, baselineTasks: 32, crTasks: 6, estimatedHours: 610, actualHours: 680, overdueTasks: 4, onTimeRate: 89.4, performanceRating: 'Khá (Vượt Giờ)' as const },
    { id: 'm3', name: 'Lê Văn C', role: 'QA / Tester Lead', totalTasks: 35, baselineTasks: 32, crTasks: 3, estimatedHours: 480, actualHours: 470, overdueTasks: 1, onTimeRate: 97.1, performanceRating: 'Xuất Sắc' as const },
    { id: 'm4', name: 'Phạm Văn D', role: 'Fullstack Dev', totalTasks: 30, baselineTasks: 24, crTasks: 6, estimatedHours: 450, actualHours: 590, overdueTasks: 3, onTimeRate: 90.0, performanceRating: 'Khá (Vượt Giờ)' as const },
    { id: 'm5', name: 'Hoàng Thị E', role: 'DevOps / Infra', totalTasks: 22, baselineTasks: 18, crTasks: 4, estimatedHours: 360, actualHours: 350, overdueTasks: 1, onTimeRate: 95.5, performanceRating: 'Xuất Sắc' as const },
    { id: 'm6', name: 'Đỗ Văn F', role: 'Senior Backend Dev', totalTasks: 28, baselineTasks: 24, crTasks: 4, estimatedHours: 480, actualHours: 520, overdueTasks: 2, onTimeRate: 92.8, performanceRating: 'Tốt' as const },
    { id: 'm7', name: 'Vũ Thị G', role: 'UI/UX Designer', totalTasks: 16, baselineTasks: 14, crTasks: 2, estimatedHours: 280, actualHours: 270, overdueTasks: 0, onTimeRate: 100, performanceRating: 'Xuất Sắc' as const },
    { id: 'm8', name: 'Đặng Văn H', role: 'Mobile Dev', totalTasks: 20, baselineTasks: 16, crTasks: 4, estimatedHours: 420, actualHours: 440, overdueTasks: 2, onTimeRate: 90.0, performanceRating: 'Tốt' as const },
    { id: 'm9', name: 'Bùi Thị I', role: 'Business Analyst', totalTasks: 12, baselineTasks: 10, crTasks: 2, estimatedHours: 240, actualHours: 230, overdueTasks: 0, onTimeRate: 100, performanceRating: 'Xuất Sắc' as const },
    { id: 'm10', name: 'Ngô Văn K', role: 'Security Specialist', totalTasks: 8, baselineTasks: 6, crTasks: 2, estimatedHours: 180, actualHours: 170, overdueTasks: 0, onTimeRate: 100, performanceRating: 'Xuất Sắc' as const },
  ];

  const overdues = project.overdueAnalysis && project.overdueAnalysis.length > 0 ? project.overdueAnalysis : [
    { code: 'CS-CR-01', title: 'Phát sinh Module Báo Cáo Dự Án Cho Kế Toán', type: 'CR (Phát sinh)', assignee: 'PhamVanD', reviewer: 'NguyenVanA', dueDate: '15/07/2026', actualCompletionDate: '28/07/2026', delayDays: 13, reason: 'Yêu cầu nghiệp vụ Kế toán bổ sung thêm Hồ sơ dự án & Toggle đóng mở khối' },
    { code: 'CS-108', title: 'Tối ưu hóa query SQL Báo cáo KPI Tổng hợp', type: 'Baseline (Kế hoạch)', assignee: 'PhamVanD', reviewer: 'TranThiB', dueDate: '20/06/2026', actualCompletionDate: '05/07/2026', delayDays: 15, reason: 'Dữ liệu task_logs lớn hơn dự kiến, cần viết lại stored procedure' },
    { code: 'CS-102', title: 'Tích hợp Socket Real-time cho Report Module', type: 'Baseline (Kế hoạch)', assignee: 'TranThiB', reviewer: 'NguyenVanA', dueDate: '18/05/2026', actualCompletionDate: '28/05/2026', delayDays: 10, reason: 'Phát sinh bug memory leak khi nhận event socket liên tục' },
    { code: 'CS-CR-05', title: 'Tích hợp Hạ tầng Authen IAM Public Key mới', type: 'CR (Phát sinh)', assignee: 'HoangThiE', reviewer: 'TranThiB', dueDate: '10/04/2026', actualCompletionDate: '22/04/2026', delayDays: 12, reason: 'Chờ nâng cấp Server HSM hạ tầng mạng từ phía đối tác' },
    { code: 'CS-110', title: 'Xử lý sai lệch tọa độ GPS trên ứng dụng Mobile App', type: 'Baseline (Kế hoạch)', assignee: 'DangVanH', reviewer: 'LeVanC', dueDate: '12/03/2026', actualCompletionDate: '24/03/2026', delayDays: 12, reason: 'Thiết bị Android đời cũ bị trôi định vị trong môi trường nhà cao tầng' },
    { code: 'CS-118', title: 'Cấu hình Cluster Server chịu tải cho API Backend', type: 'Baseline (Kế hoạch)', assignee: 'DoVanF', reviewer: 'HoangThiE', dueDate: '05/02/2026', actualCompletionDate: '15/02/2026', delayDays: 10, reason: 'Phát sinh tranh chấp tài nguyên RAM giữa Docker containers' },
  ];

  return `
  <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <style>
      body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; font-size: 11pt; color: #1e293b; }
      table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
      th { background-color: #1e3a8a; color: #ffffff; font-weight: bold; border: 1px solid #94a3b8; padding: 8px 10px; text-align: left; }
      td { border: 1px solid #cbd5e1; padding: 6px 10px; mso-number-format:'\\@'; }
      .num { text-align: right; mso-number-format:'#,##0'; }
      .text-center { text-align: center; }
      .section-banner { background-color: #0284c7; color: #ffffff; font-weight: bold; font-size: 12pt; padding: 10px; }
      .title-banner { background-color: #0f172a; color: #ffffff; font-size: 15pt; font-weight: bold; text-align: center; padding: 14px; }
      .badge-ok { background-color: #dcfce7; color: #15803d; font-weight: bold; }
      .badge-fail { background-color: #fee2e2; color: #b91c1c; font-weight: bold; }
    </style>
  </head>
  <body>
    <table>
      <tr>
        <td colspan="9" class="title-banner">BÁO CÁO TOÀN DIỆN VÒNG ĐỜI DỰ ÁN & TIẾN ĐỘ THỰC HIỆN CHI TIẾT</td>
      </tr>
      <tr>
        <td colspan="9" style="background-color: #f1f5f9; text-align: right; font-style: italic;">Thời điểm xuất báo cáo: ${new Date().toLocaleString('vi-VN')}</td>
      </tr>
    </table>

    <!-- PHẦN 1 -->
    <table>
      <tr><td colspan="4" class="section-banner">[PHẦN 1: HỒ SƠ VÒNG ĐỜI DỰ ÁN DÀI HẠN]</td></tr>
      <tr><td style="font-weight:bold; width:220px; background:#f8fafc;">Mã & Tên Dự Án:</td><td colspan="3"><strong>${project.code}</strong> - ${project.name}</td></tr>
      <tr><td style="font-weight:bold; background:#f8fafc;">Quản Lý Dự Án (PM):</td><td colspan="3">${project.pmName || 'Nguyễn Văn A (PM Lead)'}</td></tr>
      <tr><td style="font-weight:bold; background:#f8fafc;">Khách Hàng / Chủ Đầu Tư:</td><td colspan="3">${project.client || 'CÔNG TY CỔ PHẦN CHIPS (#CUST-1092)'}</td></tr>
      <tr><td style="font-weight:bold; background:#f8fafc;">Lịch Trình Triển Khai:</td><td colspan="3">Bắt đầu: ${project.startDate || '01/11/2025'} | Deadline kế hoạch: ${project.plannedDeadline || project.deadline || '01/07/2026'} | Dự kiến xong: ${project.actualExpectedDeadline || '01/08/2026'}</td></tr>
      <tr><td style="font-weight:bold; background:#f8fafc;">Thời Gian Kéo Dài:</td><td colspan="3">${project.delayWeeks ? `+${project.delayWeeks} Tuần (Do bổ sung phạm vi CR)` : 'Đúng hạn'}</td></tr>
      <tr><td style="font-weight:bold; background:#f8fafc;">Phạm Vi & Nguyên Nhân Kéo Dài:</td><td colspan="3">${project.scopeDescription || project.delayReasonSummary || 'Dự án quy mô lớn kéo dài 35 tuần chính thức + 4 tuần phát sinh thêm module Báo cáo KPI cho Kế toán & GPS nâng cao.'}</td></tr>
    </table>

    <!-- PHẦN 2 -->
    <table>
      <tr><td colspan="7" class="section-banner">[PHẦN 2: DANH SÁCH CÁC SPRINT / GIAI ĐOẠN TRONG VÒNG ĐỜI DỰ ÁN]</td></tr>
      <tr style="background:#f1f5f9;">
        <th class="text-center">STT</th>
        <th>Giai Đoạn / Sprint</th>
        <th>Thời Gian Triển Khai</th>
        <th>Mục Tiêu Chính</th>
        <th class="num">Số Task</th>
        <th class="num">Giờ Kế Hoạch</th>
        <th class="num">Giờ Thực Tế</th>
      </tr>
      ${phases
        .map(
          (ph, idx) => `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td><strong>${ph.name}</strong></td>
          <td>${ph.period}</td>
          <td>${ph.mainGoal || ''}</td>
          <td class="num">${ph.taskCount || 0}</td>
          <td class="num">${ph.plannedHours}h</td>
          <td class="num">${ph.actualHours}h</td>
        </tr>
      `
        )
        .join('')}
    </table>

    <!-- PHẦN 3 -->
    <table>
      <tr><td colspan="4" class="section-banner">[PHẦN 3: TỔNG QUAN CHỈ SỐ TIẾN ĐỘ & NGÂN SÁCH GIỜ CÔNG TOÀN DỰ ÁN]</td></tr>
      <tr style="background:#f1f5f9;">
        <th>Chỉ Số Quản Trị</th>
        <th class="num">Giá Trị Thực Tế</th>
        <th class="num">Định Mức / Kế Hoạch</th>
        <th>Đánh Giá & Ghi Chú</th>
      </tr>
      <tr><td>Tiến Độ Vòng Đời Dự Án</td><td class="num">${project.progress}%</td><td class="num">${project.plannedProgress || 92}%</td><td>Đã xong ${completedTasks}/${totalTasks} Task (10 Nhân sự)</td></tr>
      <tr><td>Ngân Sách Giờ Công Tích Lũy</td><td class="num">${project.actualHours}h</td><td class="num">${project.totalBudgetHours}h</td><td>${project.actualHours > project.totalBudgetHours ? `Thực tế vượt +${project.actualHours - project.totalBudgetHours}h do phát sinh CR` : 'Nằm trong ngân sách'}</td></tr>
      <tr><td>Số Task Phát Sinh (CR)</td><td class="num">${crTasks} Task</td><td class="num">${totalTasks} Task</td><td>Chiếm ${((crTasks / totalTasks) * 100).toFixed(1)}% khối lượng dự án</td></tr>
      <tr><td>Độ Trễ Tổng Thể</td><td class="num">${project.delayWeeks ? `+${project.delayWeeks} Tuần` : '0 Tuần'}</td><td class="num">${project.plannedDeadline || '35 Tuần'}</td><td>Kéo dài do thêm phạm vi CR Báo cáo Kế toán</td></tr>
      <tr><td>Tỷ Lệ Đúng Hạn Tổng Thể (SLA OTD)</td><td class="num">${project.slaOtd || 94.1}%</td><td class="num">&ge; 90%</td><td>Đạt chuẩn cam kết chất lượng OTD</td></tr>
    </table>

    <!-- PHẦN 4 -->
    <table>
      <tr><td colspan="10" class="section-banner">[PHẦN 4: THỐNG KÊ 10 MEMBER TOÀN DỰ ÁN (ĐÃ LOẠI BỎ XẾP LOẠI A, B, C)]</td></tr>
      <tr style="background:#f1f5f9;">
        <th class="text-center">STT</th>
        <th>Thành Viên</th>
        <th>Vai Trò Dự Án</th>
        <th class="num">Tổng Task</th>
        <th class="num">Baseline</th>
        <th class="num">Phát Sinh (CR)</th>
        <th class="num">Giờ Est (h)</th>
        <th class="num">Giờ Thực Tế (h)</th>
        <th class="num">Task Trễ</th>
        <th class="num">Đúng Hạn (%)</th>
      </tr>
      ${members
        .map(
          (m, idx) => `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td><strong>${m.name}</strong></td>
          <td>${m.role}</td>
          <td class="num">${m.totalTasks}</td>
          <td class="num">${m.baselineTasks}</td>
          <td class="num">${m.crTasks}</td>
          <td class="num">${m.estimatedHours}h</td>
          <td class="num">${m.actualHours}h</td>
          <td class="num">${m.overdueTasks}</td>
          <td class="num">${m.onTimeRate}%</td>
        </tr>
      `
        )
        .join('')}
    </table>

    <!-- PHẦN 5 -->
    <table>
      <tr><td colspan="9" class="section-banner">[PHẦN 5: PHÂN TÍCH TASK TRỄ HẠN & NGUYÊN NHÂN KÉO DÀI DỰ ÁN]</td></tr>
      <tr style="background:#f1f5f9;">
        <th>Mã Task</th>
        <th>Tên Công Việc / Module</th>
        <th class="text-center">Loại Scope</th>
        <th>Người Phụ Trách</th>
        <th>Reviewer / QA</th>
        <th class="text-center" style="width:110px;">Deadline Gốc</th>
        <th class="text-center" style="width:110px;">Hoàn Thành Thực Tế</th>
        <th class="num">Số Ngày Trễ</th>
        <th>Lý Do Chi Tiết Phân Tích</th>
      </tr>
      ${overdues
        .map(
          (o) => `
        <tr>
          <td><strong>${o.code}</strong></td>
          <td>${o.title}</td>
          <td class="text-center">${o.type}</td>
          <td>${o.assignee}</td>
          <td>${o.reviewer}</td>
          <td class="text-center" style="mso-number-format:'\\@';">${o.dueDate}</td>
          <td class="text-center" style="mso-number-format:'\\@';">${o.actualCompletionDate || o.dueDate}</td>
          <td class="num badge-fail">+${o.delayDays} Ngày</td>
          <td>${o.reason}</td>
        </tr>
      `
        )
        .join('')}
    </table>
  </body>
  </html>
  `;
}

/**
 * Downloads a professionally formatted Excel spreadsheet (.xls) for a Project
 */
export function downloadProjectExcel(
  project: Project,
  sprints: Sprint[] = [],
  tasksOrKpi?: Task[] | CompanyKPIConfig,
  maybeKpi?: CompanyKPIConfig
): void {
  const htmlContent = generateProjectExcelHtml(project, sprints, tasksOrKpi, maybeKpi);
  const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeName = (project.code || project.name).replace(/[^a-zA-Z0-9_-]/g, '_');
  link.setAttribute('href', url);
  link.setAttribute('download', `Bao_Cao_Du_An_${safeName}_${new Date().toISOString().slice(0, 10)}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a clean Project CSV
 */
export function downloadProjectCSV(
  project: Project,
  sprints: Sprint[] = [],
  tasksOrKpi?: Task[] | CompanyKPIConfig,
  maybeKpi?: CompanyKPIConfig
): void {
  const csvContent = generateProjectCSV(project, sprints, tasksOrKpi, maybeKpi);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeName = (project.code || project.name).replace(/[^a-zA-Z0-9_-]/g, '_');
  link.setAttribute('href', url);
  link.setAttribute('download', `Bao_Cao_Du_An_${safeName}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates an Excel Spreadsheet HTML for Comprehensive Member Performance & Quality Report
 */
export function generateMemberExcelHtml(
  employees: Employee[],
  tasks: Task[] = [],
  kpiConfig: CompanyKPIConfig = DEFAULT_KPI_CONFIG
): string {
  const activeConfig = kpiConfig && typeof kpiConfig === 'object' && kpiConfig.year ? kpiConfig : DEFAULT_KPI_CONFIG;
  const targetOverdue = activeConfig.maxOverdueRate ?? 5.0;
  const targetBug = activeConfig.maxBugRate ?? 8.0;
  const targetRework = activeConfig.maxReworkRate ?? 5.0;

  const totalEmployees = employees.length;
  const totalTasks = employees.reduce((sum, e) => sum + (e.totalTasks || 0), 0);
  const totalHours = employees.reduce((sum, e) => sum + (e.totalHours || 0), 0);
  const avgOverdue = totalEmployees > 0 ? (employees.reduce((sum, e) => sum + e.overdueRate, 0) / totalEmployees).toFixed(1) : '0';
  const avgBug = totalEmployees > 0 ? (employees.reduce((sum, e) => sum + e.bugRate, 0) / totalEmployees).toFixed(1) : '0';
  const avgRework = totalEmployees > 0 ? (employees.reduce((sum, e) => sum + e.reworkRate, 0) / totalEmployees).toFixed(1) : '0';

  return `
  <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <style>
      body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; font-size: 11pt; color: #1e293b; }
      table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
      th { background-color: #1e3a8a; color: #ffffff; font-weight: bold; border: 1px solid #94a3b8; padding: 8px 10px; text-align: left; }
      td { border: 1px solid #cbd5e1; padding: 6px 10px; mso-number-format:'\\@'; }
      .num { text-align: right; mso-number-format:'#,##0'; }
      .text-center { text-align: center; }
      .section-banner { background-color: #0284c7; color: #ffffff; font-weight: bold; font-size: 12pt; padding: 10px; }
      .title-banner { background-color: #0f172a; color: #ffffff; font-size: 15pt; font-weight: bold; text-align: center; padding: 14px; }
      .badge-ok { background-color: #dcfce7; color: #15803d; font-weight: bold; }
      .badge-fail { background-color: #fee2e2; color: #b91c1c; font-weight: bold; }
      .badge-warn { background-color: #fef3c7; color: #b45309; font-weight: bold; }
    </style>
  </head>
  <body>
    <table>
      <tr>
        <td colspan="12" class="title-banner">BÁO CÁO TOÀN DIỆN HIỆU SUẤT & CHẤT LƯỢNG THÀNH VIÊN (MEMBER PERFORMANCE REPORT)</td>
      </tr>
      <tr>
        <td colspan="12" style="background-color: #f1f5f9; text-align: right; font-style: italic;">Thời điểm xuất báo cáo: ${new Date().toLocaleString('vi-VN')} | Áp dụng cấu hình KPI năm: ${activeConfig.year || 2026}</td>
      </tr>
    </table>

    <!-- PHẦN 1: TỔNG HỢP CHỈ SỐ NHÂN SỰ TOÀN HỆ THỐNG -->
    <table>
      <tr><td colspan="4" class="section-banner">[PHẦN 1: TỔNG QUAN CHỈ SỐ NHÂN SỰ & CHẤT LƯỢNG TOÀN DOANH NGHIỆP]</td></tr>
      <tr>
        <td style="font-weight:bold; width:250px; background:#f8fafc;">Tổng Số Lực Lượng Nhân Sự:</td>
        <td><strong>${totalEmployees} Thành viên</strong> (100% Đang Hoạt Động)</td>
        <td style="font-weight:bold; width:250px; background:#f8fafc;">Tổng Khối Lượng Task Đã Giao:</td>
        <td><strong>${totalTasks} Tasks</strong> (${totalHours} Giờ Công Tích Lũy)</td>
      </tr>
      <tr>
        <td style="font-weight:bold; background:#f8fafc;">Tỷ Lệ Trễ Hạn Trung Bình:</td>
        <td class="${Number(avgOverdue) <= targetOverdue ? 'badge-ok' : 'badge-fail'}">${avgOverdue}% (Mục tiêu công ty: &le; ${targetOverdue}%)</td>
        <td style="font-weight:bold; background:#f8fafc;">Tỷ Lệ Bug Phát Sinh Trung Bình:</td>
        <td class="${Number(avgBug) <= targetBug ? 'badge-ok' : 'badge-fail'}">${avgBug}% (Mục tiêu công ty: &le; ${targetBug}%)</td>
      </tr>
      <tr>
        <td style="font-weight:bold; background:#f8fafc;">Tỷ Lệ Rework Trung Bình:</td>
        <td class="${Number(avgRework) <= targetRework ? 'badge-ok' : 'badge-fail'}">${avgRework}% (Mục tiêu công ty: &le; ${targetRework}%)</td>
        <td style="font-weight:bold; background:#f8fafc;">Quy Chuẩn Định Mức Giờ / Ngày:</td>
        <td>8.0h / ngày (Tải trọng an toàn có ít nhất 1.5h đệm)</td>
      </tr>
    </table>

    <!-- PHẦN 2: BẢNG CHI TIẾT HIỆU SUẤT TỪNG THÀNH VIÊN -->
    <table>
      <tr><td colspan="12" class="section-banner">[PHẦN 2: DANH SÁCH CHI TIẾT THÀNH VIÊN & ĐỐI CHIẾU MỤC TIÊU KPI]</td></tr>
      <tr style="background:#f1f5f9;">
        <th class="text-center">STT</th>
        <th>Mã NV</th>
        <th>Họ và Tên</th>
        <th>Chức Danh & Vị Trí</th>
        <th>Phòng Ban</th>
        <th class="num">Tổng Task</th>
        <th class="num">Tổng Giờ (h)</th>
        <th class="num">Tải Trọng Hôm Nay</th>
        <th class="text-center">Trễ Hạn (&le; ${targetOverdue}%)</th>
        <th class="text-center">Bug (&le; ${targetBug}%)</th>
        <th class="text-center">Rework (&le; ${targetRework}%)</th>
        <th class="text-center">Đánh Giá Năng Suất</th>
      </tr>
      ${employees
        .map((emp, idx) => {
          const isOverdueExceeded = emp.overdueRate > targetOverdue;
          const isBugExceeded = emp.bugRate > targetBug;
          const isReworkExceeded = emp.reworkRate > targetRework;
          const workloadStatus = emp.allocatedHoursToday >= 7.5 ? 'Quá tải' : emp.allocatedHoursToday >= 6.0 ? 'Cân bằng' : 'Còn trống';
          const rating = emp.performanceRating || (emp.overdueRate <= 3 && emp.reworkRate <= 3 ? 'Xuất Sắc' : emp.overdueRate <= 5 ? 'Tốt' : 'Cần Cải Thiện');

          return `
          <tr>
            <td class="text-center">${idx + 1}</td>
            <td style="font-family:monospace; font-weight:bold;">${emp.code}</td>
            <td><strong>${emp.name}</strong></td>
            <td>${emp.role}</td>
            <td>${emp.department}</td>
            <td class="num">${emp.totalTasks}</td>
            <td class="num">${emp.totalHours}h</td>
            <td class="num">${emp.allocatedHoursToday}h / 8h (${workloadStatus})</td>
            <td class="text-center ${isOverdueExceeded ? 'badge-fail' : 'badge-ok'}">${emp.overdueRate}% ${isOverdueExceeded ? '⚠️ Vượt' : '✓ Đạt'}</td>
            <td class="text-center ${isBugExceeded ? 'badge-fail' : 'badge-ok'}">${emp.bugRate}% ${isBugExceeded ? '⚠️ Vượt' : '✓ Đạt'}</td>
            <td class="text-center ${isReworkExceeded ? 'badge-fail' : 'badge-ok'}">${emp.reworkRate}% ${isReworkExceeded ? '⚠️ Vượt' : '✓ Đạt'}</td>
            <td class="text-center"><strong>${rating}</strong></td>
          </tr>
        `;
        })
        .join('')}
    </table>

    <!-- PHẦN 3: DANH SÁCH TOÀN BỘ CÔNG VIỆC PHÂN BỔ CHO CÁC THÀNH VIÊN -->
    <table>
      <tr><td colspan="8" class="section-banner">[PHẦN 3: DANH SÁCH CHI TIẾT CÁC TASK CÔNG VIỆC ĐƯỢC PHÂN CÔNG]</td></tr>
      <tr style="background:#f1f5f9;">
        <th class="text-center">STT</th>
        <th>Mã Task</th>
        <th>Tên Công Việc</th>
        <th>Người Phụ Trách</th>
        <th>Dự Án</th>
        <th class="text-center">Loại Task</th>
        <th class="num">Giờ Est (h)</th>
        <th class="text-center">Trạng Thái</th>
      </tr>
      ${tasks.slice(0, 100).map((t, idx) => `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td style="font-family:monospace; font-weight:bold;">${t.code}</td>
          <td>${t.title}</td>
          <td><strong>${t.assigneeName}</strong></td>
          <td>${t.projectName}</td>
          <td class="text-center">${t.type.toUpperCase()}</td>
          <td class="num">${t.estimatedHours}h</td>
          <td class="text-center ${t.status === 'done' ? 'badge-ok' : t.isOverdueToday ? 'badge-fail' : 'badge-warn'}">${t.status === 'done' ? 'Đã Xong' : t.isOverdueToday ? 'Trễ Hạn' : 'Đang Làm'}</td>
        </tr>
      `).join('')}
    </table>
  </body>
  </html>
  `;
}

/**
 * Downloads a professionally formatted Excel spreadsheet (.xls) for Member Report
 */
export function downloadMemberExcel(
  employees: Employee[],
  tasks: Task[] = [],
  kpiConfig: CompanyKPIConfig = DEFAULT_KPI_CONFIG
): void {
  const htmlContent = generateMemberExcelHtml(employees, tasks, kpiConfig);
  const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Bao_Cao_Member_Toan_Doi_Ngu_${new Date().toISOString().slice(0, 10)}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates a clean CSV for Member Report
 */
export function generateMemberCSV(
  employees: Employee[],
  tasks: Task[] = [],
  kpiConfig: CompanyKPIConfig = DEFAULT_KPI_CONFIG
): string {
  const activeConfig = kpiConfig && typeof kpiConfig === 'object' && kpiConfig.year ? kpiConfig : DEFAULT_KPI_CONFIG;
  const lines: string[] = [];

  lines.push(`BÁO CÁO HIỆU SUẤT & CHẤT LƯỢNG THÀNH VIÊN`);
  lines.push(`Thời điểm trích xuất:,${cleanCSV(new Date().toLocaleString('vi-VN'))}`);
  lines.push(`Áp dụng hạn mức KPI năm:,${activeConfig.year || 2026}`);
  lines.push(``);

  lines.push(`STT,Mã NV,Họ Tên,Chức Danh,Phòng Ban,Tổng Task,Tổng Giờ (h),Tải Trọng Hôm Nay (h),Tỷ Lệ Trễ (%),Mục Tiêu Trễ (%),Tỷ Lệ Bug (%),Mục Tiêu Bug (%),Tỷ Lệ Rework (%),Mục Tiêu Rework (%),Đánh Giá Năng Suất`);
  employees.forEach((emp, idx) => {
    lines.push(
      `${idx + 1},${cleanCSV(emp.code)},${cleanCSV(emp.name)},${cleanCSV(emp.role)},${cleanCSV(emp.department)},${emp.totalTasks},${emp.totalHours},${emp.allocatedHoursToday},${emp.overdueRate}%,${emp.targetOverdueRate}%,${emp.bugRate}%,${emp.targetBugRate}%,${emp.reworkRate}%,${emp.targetReworkRate}%,${cleanCSV(emp.performanceRating || 'Tốt')}`
    );
  });

  return '\uFEFF' + lines.join('\r\n');
}

/**
 * Downloads a clean Member CSV
 */
export function downloadMemberCSV(
  employees: Employee[],
  tasks: Task[] = [],
  kpiConfig: CompanyKPIConfig = DEFAULT_KPI_CONFIG
): void {
  const csvContent = generateMemberCSV(employees, tasks, kpiConfig);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Bao_Cao_Member_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates an Excel Spreadsheet HTML specifically for an Individual Member Report
 */
export function generateIndividualMemberExcelHtml(
  employee: Employee,
  memberTasks: Task[] = [],
  projects: { id: string; name: string; code: string; progress: number; client?: string }[] = [],
  sprints: { id: string; name: string; projectName: string; status: string; progress: number }[] = [],
  kpiConfig: CompanyKPIConfig = DEFAULT_KPI_CONFIG
): string {
  const activeConfig = kpiConfig && typeof kpiConfig === 'object' && kpiConfig.year ? kpiConfig : DEFAULT_KPI_CONFIG;
  const targetOverdue = activeConfig.maxOverdueRate ?? 5.0;
  const targetBug = activeConfig.maxBugRate ?? 8.0;
  const targetRework = activeConfig.maxReworkRate ?? 5.0;

  const totalTasks = memberTasks.length;
  const completedTasks = memberTasks.filter((t) => t.status === 'done').length;
  const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : '0';
  const totalEstHours = memberTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
  const totalActHours = memberTasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);

  const isOverdueExceeded = employee.overdueRate > targetOverdue;
  const isBugExceeded = employee.bugRate > targetBug;
  const isReworkExceeded = employee.reworkRate > targetRework;

  return `
  <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <style>
      body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; font-size: 11pt; color: #1e293b; }
      table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
      th { background-color: #1e3a8a; color: #ffffff; font-weight: bold; border: 1px solid #94a3b8; padding: 8px 10px; text-align: left; }
      td { border: 1px solid #cbd5e1; padding: 6px 10px; mso-number-format:'\\@'; }
      .num { text-align: right; mso-number-format:'#,##0.0'; }
      .text-center { text-align: center; }
      .section-banner { background-color: #0284c7; color: #ffffff; font-weight: bold; font-size: 12pt; padding: 10px; }
      .title-banner { background-color: #0f172a; color: #ffffff; font-size: 16pt; font-weight: bold; text-align: center; padding: 14px; }
      .badge-ok { background-color: #dcfce7; color: #15803d; font-weight: bold; }
      .badge-fail { background-color: #fee2e2; color: #b91c1c; font-weight: bold; }
      .badge-warn { background-color: #fef3c7; color: #b45309; font-weight: bold; }
    </style>
  </head>
  <body>
    <table>
      <tr>
        <td colspan="10" class="title-banner">BÁO CÁO CÁ NHÂN THÀNH VIÊN (INDIVIDUAL MEMBER PERFORMANCE & TASK REPORT)</td>
      </tr>
      <tr>
        <td colspan="10" style="background-color: #f1f5f9; text-align: right; font-style: italic;">Thời điểm xuất báo cáo: ${new Date().toLocaleString('vi-VN')} | Áp dụng khung KPI: ${activeConfig.year || 2026}</td>
      </tr>
    </table>

    <!-- PHẦN 1: HỒ SƠ THÀNH VIÊN -->
    <table>
      <tr><td colspan="4" class="section-banner">[PHẦN 1: HỒ SƠ NHÂN SỰ & THÔNG TIN CÔNG TÁC]</td></tr>
      <tr>
        <td style="font-weight:bold; width:220px; background:#f8fafc;">Họ và Tên:</td>
        <td><strong>${employee.name}</strong></td>
        <td style="font-weight:bold; width:220px; background:#f8fafc;">Mã Nhân Viên:</td>
        <td style="font-family:monospace; font-weight:bold;">${employee.code}</td>
      </tr>
      <tr>
        <td style="font-weight:bold; background:#f8fafc;">Chức Danh & Vị Trí:</td>
        <td>${employee.role}</td>
        <td style="font-weight:bold; background:#f8fafc;">Phòng Ban Quản Lý:</td>
        <td>${employee.department}</td>
      </tr>
      <tr>
        <td style="font-weight:bold; background:#f8fafc;">Email:</td>
        <td>${employee.email || 'Chưa cập nhật'}</td>
        <td style="font-weight:bold; background:#f8fafc;">Số Điện Thoại:</td>
        <td>${employee.phone || 'Chưa cập nhật'}</td>
      </tr>
      <tr>
        <td style="font-weight:bold; background:#f8fafc;">Tải Trọng Hôm Nay:</td>
        <td><strong>${employee.allocatedHoursToday}h / 8.0h</strong> (${employee.remainingHoursToday}h đệm an toàn)</td>
        <td style="font-weight:bold; background:#f8fafc;">Xếp Loại Năng Suất:</td>
        <td><strong>${employee.performanceRating || 'Tốt'}</strong> (KPI Grade: ${employee.kpiGrade || 'A'})</td>
      </tr>
    </table>

    <!-- PHẦN 2: CHỈ SỐ KPI CHẤT LƯỢNG & NĂNG SUẤT -->
    <table>
      <tr><td colspan="4" class="section-banner">[PHẦN 2: TỔNG HỢP CHỈ SỐ KPI & ĐỐI CHIẾU MỤC TIÊU CÔNG TY]</td></tr>
      <tr>
        <td style="font-weight:bold; background:#f8fafc;">Tổng Số Task:</td>
        <td>${totalTasks} Tasks (${completedTasks} Đã xong - ${completionRate}%)</td>
        <td style="font-weight:bold; background:#f8fafc;">Tổng Giờ Ước Tính vs Thực Tế:</td>
        <td>${totalEstHours}h Est / ${totalActHours}h Actual</td>
      </tr>
      <tr>
        <td style="font-weight:bold; background:#f8fafc;">Tỷ Lệ Trễ Hạn:</td>
        <td class="${isOverdueExceeded ? 'badge-fail' : 'badge-ok'}">
          ${employee.overdueRate}% (Mục tiêu: &le; ${targetOverdue}% | ${isOverdueExceeded ? '⚠️ VƯỢT HẠN MỨC' : '✓ ĐẠT CHUẨN'})
        </td>
        <td style="font-weight:bold; background:#f8fafc;">Tỷ Lệ Bug:</td>
        <td class="${isBugExceeded ? 'badge-fail' : 'badge-ok'}">
          ${employee.bugRate}% (Mục tiêu: &le; ${targetBug}% | ${isBugExceeded ? '⚠️ VƯỢT HẠN MỨC' : '✓ ĐẠT CHUẨN'})
        </td>
      </tr>
      <tr>
        <td style="font-weight:bold; background:#f8fafc;">Tỷ Lệ Rework:</td>
        <td class="${isReworkExceeded ? 'badge-fail' : 'badge-ok'}">
          ${employee.reworkRate}% (Mục tiêu: &le; ${targetRework}% | ${isReworkExceeded ? '⚠️ VƯỢT HẠN MỨC' : '✓ ĐẠT CHUẨN'})
        </td>
        <td style="font-weight:bold; background:#f8fafc;">Số Dự Án & Sprint Đang Tham Gia:</td>
        <td><strong>${projects.length} Dự Án</strong> / <strong>${sprints.length} Sprint</strong></td>
      </tr>
    </table>

    <!-- PHẦN 3: DANH SÁCH DỰ ÁN & SPRINT THAM GIA -->
    <table>
      <tr><td colspan="5" class="section-banner">[PHẦN 3: CÁC DỰ ÁN THÀNH VIÊN ĐANG THAM GIA ĐÓNG GÓP]</td></tr>
      <tr style="background:#f1f5f9;">
        <th class="text-center" style="width:50px;">STT</th>
        <th>Mã Dự Án</th>
        <th>Tên Dự Án</th>
        <th>Khách Hàng</th>
        <th class="text-center">Tiến Độ Dự Án</th>
      </tr>
      ${projects.length > 0 ? projects.map((p, idx) => `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td style="font-family:monospace; font-weight:bold;">${p.code}</td>
          <td><strong>${p.name}</strong></td>
          <td>${p.client || 'Khách hàng trọng điểm'}</td>
          <td class="text-center font-bold">${p.progress}%</td>
        </tr>
      `).join('') : '<tr><td colspan="5" class="text-center">Chưa có dự án nào được gán</td></tr>'}
    </table>

    <!-- PHẦN 4: DANH SÁCH SPRINT LIÊN QUAN -->
    <table>
      <tr><td colspan="5" class="section-banner">[PHẦN 4: CÁC SPRINT THÀNH VIÊN THAM GIA ĐỢT NÀY]</td></tr>
      <tr style="background:#f1f5f9;">
        <th class="text-center" style="width:50px;">STT</th>
        <th>Tên Sprint</th>
        <th>Thuộc Dự Án</th>
        <th class="text-center">Trạng Thái</th>
        <th class="text-center">Tiến Độ Sprint</th>
      </tr>
      ${sprints.length > 0 ? sprints.map((s, idx) => `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td><strong>${s.name}</strong></td>
          <td>${s.projectName}</td>
          <td class="text-center">${s.status === 'in_progress' ? 'Đang thực hiện' : s.status === 'completed' ? 'Hoàn thành' : 'Kế hoạch'}</td>
          <td class="text-center font-bold">${s.progress}%</td>
        </tr>
      `).join('') : '<tr><td colspan="5" class="text-center">Chưa có Sprint nào</td></tr>'}
    </table>

    <!-- PHẦN 5: CHI TIẾT TẤT CẢ CÁC TASK CỦA THÀNH VIÊN -->
    <table>
      <tr><td colspan="10" class="section-banner">[PHẦN 5: CHI TIẾT TẤT CẢ CÁC TASK CÔNG VIỆC CỦA THÀNH VIÊN]</td></tr>
      <tr style="background:#f1f5f9;">
        <th class="text-center" style="width:40px;">STT</th>
        <th>Mã Task</th>
        <th>Tiêu Đề Công Việc</th>
        <th>Dự Án</th>
        <th>Sprint</th>
        <th class="text-center">Loại</th>
        <th class="text-center">Độ Ưu Tiên</th>
        <th class="num">Est (h)</th>
        <th class="num">Act (h)</th>
        <th class="text-center">Trạng Thái</th>
      </tr>
      ${memberTasks.length > 0 ? memberTasks.map((t, idx) => `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td style="font-family:monospace; font-weight:bold;">${t.code}</td>
          <td>${t.title}</td>
          <td>${t.projectName}</td>
          <td>${t.sprintName || 'Sprint hiện tại'}</td>
          <td class="text-center"><strong>${t.type.toUpperCase()}</strong></td>
          <td class="text-center">${t.priority ? t.priority.toUpperCase() : 'MEDIUM'}</td>
          <td class="num">${t.estimatedHours || 0}</td>
          <td class="num">${t.actualHours || 0}</td>
          <td class="text-center ${t.status === 'done' ? 'badge-ok' : t.isOverdueToday ? 'badge-fail' : 'badge-warn'}">
            ${t.status === 'done' ? 'Hoàn thành' : t.isOverdueToday ? 'Trễ hạn' : 'Đang làm'}
          </td>
        </tr>
      `).join('') : '<tr><td colspan="10" class="text-center">Chưa có task nào được ghi nhận</td></tr>'}
    </table>
  </body>
  </html>
  `;
}

/**
 * Downloads a formatted Excel spreadsheet for an Individual Member Report
 */
export function downloadIndividualMemberExcel(
  employee: Employee,
  memberTasks: Task[] = [],
  projects: { id: string; name: string; code: string; progress: number; client?: string }[] = [],
  sprints: { id: string; name: string; projectName: string; status: string; progress: number }[] = [],
  kpiConfig: CompanyKPIConfig = DEFAULT_KPI_CONFIG
): void {
  const htmlContent = generateIndividualMemberExcelHtml(employee, memberTasks, projects, sprints, kpiConfig);
  const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const cleanName = employee.name.replace(/[^a-zA-Z0-9]/g, '_');
  link.setAttribute('download', `Bao_Cao_Ca_Nhan_${employee.code}_${cleanName}_${new Date().toISOString().slice(0, 10)}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

