import React, { useState } from 'react';
import {
  Trophy,
  TrendingDown,
  Users,
  Search,
  AlertCircle,
  CheckCircle,
  ShieldCheck,
  ArrowUpRight,
  Award,
  Clock,
  CheckSquare,
} from 'lucide-react';
import { Employee } from '../types';
import { UserAvatar } from './UserAvatar';

interface EmployeePerformanceProps {
  topHighestTasks: Employee[];
  topHighestHours: Employee[];
  topLowestTasks: Employee[];
  topLowestHours: Employee[];
  allEmployees: Employee[];
  onSelectEmployee: (emp: Employee) => void;
  isDark?: boolean;
}

export const EmployeePerformance: React.FC<EmployeePerformanceProps> = ({
  topHighestTasks = [],
  topHighestHours = [],
  topLowestTasks = [],
  topLowestHours = [],
  allEmployees = [],
  onSelectEmployee,
  isDark = true,
}) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  // Filter department list
  const departments = ['ALL', ...Array.from(new Set((allEmployees || []).map((e) => e.department)))];

  const filteredEmployees = (allEmployees || []).filter((emp) => {
    const matchSearch =
      emp.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      emp.code.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchDept = selectedDept === 'ALL' || emp.department === selectedDept;
    return matchSearch && matchDept;
  });

  return (
    <section id="section-employee" className="space-y-5">
      <div>
        <h2
          className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${
            isDark ? 'text-blue-300' : 'text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          MỤC 4: HIỆU SUẤT & CHỈ SỐ CHẤT LƯỢNG NHÂN VIÊN
        </h2>
        <p className="text-xs text-slate-400 font-medium">
          Vinh danh Top 3 cao nhất, nhận diện Top 3 thấp nhất và bảng so sánh chi tiết tỷ lệ Trễ, Bug, Rework so với mục tiêu
        </p>
      </div>

      {/* TOP 3 CAO NHẤT VÀ TOP 3 THẤP NHẤT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* BLOCK 1: TOP 3 CAO NHẤT */}
        <div
          className={`p-4 rounded-2xl border shadow-lg space-y-3 ${
            isDark ? 'bg-[#0f172a] border-emerald-900/60' : 'bg-white border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between pb-2 border-b border-emerald-800/40">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
                <Trophy className="w-4 h-4 text-amber-300" />
              </div>
              <h3 className="text-xs font-black uppercase text-emerald-400 tracking-wider">
                TOP 3 CAO NHẤT (HIỆU SUẤT XUẤT SẮC)
              </h3>
            </div>
            <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
              Khối lượng & Giờ công dẫn đầu
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* 1. Top 3 nhân viên có tổng số Task cao nhất */}
            <div
              className={`p-3 rounded-xl border shadow-xs space-y-2 ${
                isDark ? 'bg-[#141e33] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="font-extrabold text-slate-200 flex items-center gap-1.5 pb-1 border-b border-slate-800">
                <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>Top 3 Tổng Số Task Cao Nhất</span>
              </div>
              <div className="space-y-1.5">
                {topHighestTasks.map((emp, idx) => (
                  <div
                    key={emp.id}
                    onClick={() => onSelectEmployee(emp)}
                    className="flex items-center justify-between p-1.5 hover:bg-emerald-950/40 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] text-white ${
                          idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-slate-400' : 'bg-amber-700'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-slate-100">{emp.name}</div>
                        <div className="text-[10px] text-slate-400">{emp.role}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-emerald-400 text-xs">{emp.totalTasks} Task</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Top 3 nhân viên có tổng số giờ làm việc cao nhất */}
            <div
              className={`p-3 rounded-xl border shadow-xs space-y-2 ${
                isDark ? 'bg-[#141e33] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="font-extrabold text-slate-200 flex items-center gap-1.5 pb-1 border-b border-slate-800">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Top 3 Tổng Giờ Cao Nhất</span>
              </div>
              <div className="space-y-1.5">
                {topHighestHours.map((emp, idx) => (
                  <div
                    key={emp.id}
                    onClick={() => onSelectEmployee(emp)}
                    className="flex items-center justify-between p-1.5 hover:bg-emerald-950/40 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] text-white ${
                          idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-slate-400' : 'bg-amber-700'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-slate-100">{emp.name}</div>
                        <div className="text-[10px] text-slate-400">{emp.role}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-emerald-400 text-xs">{emp.totalHours} Giờ</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* BLOCK 2: TOP 3 THẤP NHẤT */}
        <div
          className={`p-4 rounded-2xl border shadow-lg space-y-3 ${
            isDark ? 'bg-[#0f172a] border-rose-900/60' : 'bg-white border-rose-200'
          }`}
        >
          <div className="flex items-center justify-between pb-2 border-b border-rose-800/40">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
                <TrendingDown className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-xs font-black uppercase text-rose-400 tracking-wider">
                TOP 3 THẤP NHẤT (CẦN TỐI ƯU HÓA)
              </h3>
            </div>
            <span className="text-[10px] font-bold text-rose-300 bg-rose-950 px-2 py-0.5 rounded-full border border-rose-800">
              Nhận diện điểm nghẽn
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* 1. TOP 3 NHÂN VIÊN CÓ TỔNG SỐ TASK CAO NHẤT */}
            <div
              className={`p-3 rounded-xl border shadow-xs space-y-2 ${
                isDark ? 'bg-[#141e33] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div
                className={`font-extrabold flex items-center gap-1.5 pb-1 border-b uppercase text-[11px] tracking-wide ${
                  isDark ? 'text-slate-200 border-slate-800' : 'text-slate-800 border-slate-200'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>TOP 3 NHÂN VIÊN CÓ TỔNG SỐ TASK CAO NHẤT</span>
              </div>
              <div className="space-y-1.5">
                {topHighestTasks.map((emp, idx) => (
                  <div
                    key={emp.id}
                    onClick={() => onSelectEmployee(emp)}
                    className={`flex items-center justify-between p-1.5 rounded-lg cursor-pointer transition-colors ${
                      isDark ? 'hover:bg-emerald-950/40' : 'hover:bg-emerald-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] text-white ${
                          idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-slate-400' : 'bg-amber-700'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <UserAvatar avatar={emp.avatar} name={emp.name} className="w-6 h-6 shrink-0" badgeColor="blue" />
                      <div>
                        <div className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                          {emp.name} <span className="text-[10px] font-mono text-slate-400">({emp.code})</span>
                        </div>
                        <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {emp.role}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-emerald-400 text-xs">{emp.totalTasks} tasks</div>
                      <div className="text-[10px] text-emerald-500 font-semibold">
                        {Math.round(emp.totalTasks * 0.9)} đã xong
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. TOP 3 NHÂN VIÊN CÓ TỔNG GIỜ LÀM VIỆC CAO NHẤT */}
            <div
              className={`p-3 rounded-xl border shadow-xs space-y-2 ${
                isDark ? 'bg-[#141e33] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div
                className={`font-extrabold flex items-center gap-1.5 pb-1 border-b uppercase text-[11px] tracking-wide ${
                  isDark ? 'text-slate-200 border-slate-800' : 'text-slate-800 border-slate-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>TOP 3 NHÂN VIÊN CÓ TỔNG GIỜ LÀM VIỆC CAO NHẤT</span>
              </div>
              <div className="space-y-1.5">
                {topHighestHours.map((emp, idx) => (
                  <div
                    key={emp.id}
                    onClick={() => onSelectEmployee(emp)}
                    className={`flex items-center justify-between p-1.5 rounded-lg cursor-pointer transition-colors ${
                      isDark ? 'hover:bg-blue-950/40' : 'hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] text-white ${
                          idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-slate-400' : 'bg-amber-700'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <UserAvatar avatar={emp.avatar} name={emp.name} className="w-6 h-6 shrink-0" badgeColor="blue" />
                      <div>
                        <div className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                          {emp.name} <span className="text-[10px] font-mono text-slate-400">({emp.code})</span>
                        </div>
                        <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {emp.role}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-blue-400 text-xs">{emp.totalHours} giờ</div>
                      <div className="text-[10px] text-slate-400 font-semibold">
                        TB {(emp.totalHours / 22).toFixed(1)}h/ngày
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* BLOCK 2: TOP 3 THẤP NHẤT (HỖ TRỢ CÂN BẰNG KHỐI LƯỢNG CÔNG VIỆC - THEO HÌNH 1) */}
        <div
          className={`p-4 rounded-2xl border shadow-lg space-y-3 ${
            isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs shadow-md">
                <TrendingDown className="w-4 h-4 text-slate-400" />
              </div>
              <h3 className="text-xs font-black uppercase text-slate-200 tracking-wider">
                TOP 3 THẤP NHẤT (HỖ TRỢ CÂN BẰNG KHỐI LƯỢNG CÔNG VIỆC)
              </h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
              Phân bổ lại tải công việc
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* 3. TOP 3 NHÂN VIÊN CÓ TỔNG SỐ TASK THẤP NHẤT */}
            <div
              className={`p-3 rounded-xl border shadow-xs space-y-2 ${
                isDark ? 'bg-[#141e33] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div
                className={`font-extrabold flex items-center gap-1.5 pb-1 border-b uppercase text-[11px] tracking-wide ${
                  isDark ? 'text-slate-200 border-slate-800' : 'text-slate-800 border-slate-200'
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5 text-slate-400" />
                <span>TOP 3 NHÂN VIÊN CÓ TỔNG SỐ TASK THẤP NHẤT</span>
              </div>
              <div className="space-y-1.5">
                {topLowestTasks.map((emp, idx) => (
                  <div
                    key={emp.id}
                    onClick={() => onSelectEmployee(emp)}
                    className={`flex items-center justify-between p-1.5 rounded-lg cursor-pointer transition-colors ${
                      isDark ? 'hover:bg-slate-800/60' : 'hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      <UserAvatar avatar={emp.avatar} name={emp.name} className="w-6 h-6 shrink-0" badgeColor="blue" />
                      <div>
                        <div className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                          {emp.name} <span className="text-[10px] font-mono text-slate-400">({emp.code})</span>
                        </div>
                        <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {emp.role}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-slate-200 text-xs">{emp.totalTasks} tasks</div>
                      <div className="text-[10px] text-slate-400 font-semibold">
                        {Math.round(emp.totalTasks * 0.8)} hoàn thành
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. TOP 3 NHÂN VIÊN CÓ TỔNG GIỜ LÀM VIỆC THẤP NHẤT */}
            <div
              className={`p-3 rounded-xl border shadow-xs space-y-2 ${
                isDark ? 'bg-[#141e33] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div
                className={`font-extrabold flex items-center gap-1.5 pb-1 border-b uppercase text-[11px] tracking-wide ${
                  isDark ? 'text-slate-200 border-slate-800' : 'text-slate-800 border-slate-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>TOP 3 NHÂN VIÊN CÓ TỔNG GIỜ LÀM VIỆC THẤP NHẤT</span>
              </div>
              <div className="space-y-1.5">
                {topLowestHours.map((emp, idx) => (
                  <div
                    key={emp.id}
                    onClick={() => onSelectEmployee(emp)}
                    className={`flex items-center justify-between p-1.5 rounded-lg cursor-pointer transition-colors ${
                      isDark ? 'hover:bg-slate-800/60' : 'hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      <UserAvatar avatar={emp.avatar} name={emp.name} className="w-6 h-6 shrink-0" badgeColor="blue" />
                      <div>
                        <div className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                          {emp.name} <span className="text-[10px] font-mono text-slate-400">({emp.code})</span>
                        </div>
                        <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {emp.role}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-slate-200 text-xs">{emp.totalHours} giờ</div>
                      <div className="text-[10px] text-slate-400 font-semibold">
                        TB {(emp.totalHours / 22).toFixed(1)}h/ngày
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CHỈ SỐ CHẤT LƯỢNG THEO NHÂN VIÊN (TABLE) */}
      <div
        className={`p-5 rounded-2xl border shadow-xl space-y-3 ${
          isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-xs font-black uppercase text-slate-100 tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              CHỈ SỐ CHẤT LƯỢNG THEO NHÂN VIÊN (ĐỐI CHIẾU MỤC TIÊU CÔNG TY)
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              Đối với từng nhân viên: Hiển thị Tỷ lệ Task trễ vs Mục tiêu, Tỷ lệ Task Bug vs Mục tiêu, Tỷ lệ Task Rework vs Mục tiêu
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Tìm nhân viên, chức danh..."
                className={`pl-8 pr-3 py-1.5 border rounded-lg text-xs w-48 sm:w-56 focus:outline-none ${
                  isDark
                    ? 'bg-[#141e33] border-slate-700 text-slate-200 focus:border-blue-500'
                    : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
                }`}
              />
            </div>

            {/* Dept filter */}
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className={`px-2.5 py-1.5 border rounded-lg text-xs focus:outline-none cursor-pointer font-medium ${
                isDark
                  ? 'bg-[#141e33] border-slate-700 text-slate-200 focus:border-blue-500'
                  : 'bg-white border-slate-300 text-slate-700 focus:border-blue-500'
              }`}
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d === 'ALL' ? 'Tất cả phòng ban' : d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quality Table */}
        {/* OLD: <div className="overflow-x-auto scrollbar-thin"> <table className="w-full min-w-[960px] ..."> */}
        {/* Bảng dữ liệu tự co giãn 100% w-full không xuất hiện thanh cuộn ngang (No horizontal scrollbar) */}
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-xs text-left border-collapse" id="table-employee-quality">
            <thead
              className={`uppercase font-bold border-b text-[11px] ${
                isDark ? 'bg-[#141e33] text-slate-300 border-slate-800' : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <tr>
                <th className="px-2 py-2.5 text-center whitespace-nowrap">STT</th>
                <th className="px-3 py-2.5 min-w-[170px]">Nhân viên</th>
                <th className="px-2.5 py-2.5 min-w-[130px]">Phòng ban & Vị trí</th>
                <th className="px-2 py-2.5 text-center whitespace-nowrap">Task / Giờ</th>
                <th className="px-2 py-2.5 text-center bg-rose-950/20 text-rose-300 whitespace-nowrap">
                  Trễ (&le; {allEmployees[0]?.targetOverdueRate || 5}%)
                </th>
                <th className="px-2 py-2.5 text-center bg-amber-950/20 text-amber-300 whitespace-nowrap">
                  Bug (&le; {allEmployees[0]?.targetBugRate || 8}%)
                </th>
                <th className="px-2 py-2.5 text-center bg-purple-950/20 text-purple-300 whitespace-nowrap">
                  Rework (&le; {allEmployees[0]?.targetReworkRate || 5}%)
                </th>
                <th className="px-2 py-2.5 text-center whitespace-nowrap">Đánh giá</th>
                <th className="px-2 py-2.5 text-center whitespace-nowrap">Hành động</th>
              </tr>
            </thead>
            <tbody className={`divide-y font-medium ${isDark ? 'divide-slate-800/80 text-slate-300' : 'divide-slate-100 text-slate-800'}`}>
              {filteredEmployees.map((emp, idx) => {
                const isOverdueExceeded = emp.overdueRate > emp.targetOverdueRate;
                const isBugExceeded = emp.bugRate > emp.targetBugRate;
                const isReworkExceeded = emp.reworkRate > emp.targetReworkRate;

                return (
                  <tr
                    key={emp.id}
                    onClick={() => onSelectEmployee(emp)}
                    className={`transition-colors cursor-pointer ${
                      isDark ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* STT */}
                    <td className="px-2 py-2.5 text-slate-500 font-bold text-center whitespace-nowrap">{idx + 1}</td>

                    {/* Nhân viên */}
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          avatar={emp.avatar}
                          name={emp.name}
                          className="w-7 h-7 shrink-0"
                          badgeColor="blue"
                        />
                        <div className="min-w-0">
                          <div className={`font-bold truncate ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            {emp.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono truncate">{emp.code}</div>
                        </div>
                      </div>
                    </td>

                    {/* Phòng ban & Vị trí */}
                    <td className="px-2.5 py-2.5">
                      <div className={`font-semibold truncate text-[11px] ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        {emp.role}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{emp.department}</div>
                    </td>

                    {/* Tổng Task / Giờ */}
                    <td className="px-2 py-2.5 text-center whitespace-nowrap">
                      <div className={`font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                        {emp.totalTasks} Tasks
                      </div>
                      <div className="text-[10px] text-slate-400">{emp.totalHours}h làm việc</div>
                    </td>

                    {/* 1. Tỷ lệ Task trễ */}
                    <td className="px-2 py-2.5 text-center bg-rose-950/10 whitespace-nowrap">
                      <div className="flex flex-col items-center justify-center">
                        <span className={`font-black text-xs ${isOverdueExceeded ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {emp.overdueRate}%
                        </span>
                        {isOverdueExceeded ? (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-rose-300 bg-rose-950 px-1.5 py-0.2 rounded mt-0.5 border border-rose-800">
                            <AlertCircle className="w-2.5 h-2.5" /> Vượt MT
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-300 bg-emerald-950 px-1.5 py-0.2 rounded mt-0.5 border border-emerald-800">
                            <CheckCircle className="w-2.5 h-2.5" /> Đạt MT
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 2. Tỷ lệ Task Bug */}
                    <td className="px-2 py-2.5 text-center bg-amber-950/10 whitespace-nowrap">
                      <div className="flex flex-col items-center justify-center">
                        <span className={`font-black text-xs ${isBugExceeded ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {emp.bugRate}%
                        </span>
                        {isBugExceeded ? (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-300 bg-amber-950 px-1.5 py-0.2 rounded mt-0.5 border border-amber-800">
                            <AlertCircle className="w-2.5 h-2.5" /> Vượt MT
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-300 bg-emerald-950 px-1.5 py-0.2 rounded mt-0.5 border border-emerald-800">
                            <CheckCircle className="w-2.5 h-2.5" /> Đạt MT
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 3. Tỷ lệ Task Rework */}
                    <td className="px-2 py-2.5 text-center bg-purple-950/10 whitespace-nowrap">
                      <div className="flex flex-col items-center justify-center">
                        <span className={`font-black text-xs ${isReworkExceeded ? 'text-purple-400' : 'text-emerald-400'}`}>
                          {emp.reworkRate}%
                        </span>
                        {isReworkExceeded ? (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-purple-300 bg-purple-950 px-1.5 py-0.2 rounded mt-0.5 border border-purple-800">
                            <AlertCircle className="w-2.5 h-2.5" /> Vượt MT
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-300 bg-emerald-950 px-1.5 py-0.2 rounded mt-0.5 border border-emerald-800">
                            <CheckCircle className="w-2.5 h-2.5" /> Đạt MT
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Đánh giá Năng suất */}
                    <td className="px-2 py-2.5 text-center whitespace-nowrap">
                      {(() => {
                        const rating = emp.performanceRating || (emp.overdueRate <= 3 && emp.reworkRate <= 3 ? 'Xuất Sắc' : emp.overdueRate <= 5 ? 'Tốt' : emp.allocatedHoursToday > emp.quotaHours ? 'Khá (Vượt Giờ)' : 'Cần Cải Thiện');
                        const colorCls = rating === 'Xuất Sắc'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                          : rating === 'Tốt'
                          ? 'bg-blue-950/80 text-blue-300 border-blue-700'
                          : rating.includes('Vượt Giờ') || rating === 'Khá'
                          ? 'bg-amber-950/80 text-amber-300 border-amber-700'
                          : 'bg-rose-950/80 text-rose-300 border-rose-700';
                        return (
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] inline-block border ${colorCls}`}>
                            {rating}
                          </span>
                        );
                      })()}
                    </td>

                    {/* Hành động */}
                    <td className="px-2 py-2.5 text-center whitespace-nowrap w-[44px]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEmployee(emp);
                        }}
                        className="p-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-lg border border-blue-400/40 text-xs transition inline-flex items-center justify-center shadow-md shadow-blue-900/30"
                        title="Xem chi tiết danh sách công việc & hồ sơ"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {/* OLD:
              //           <ArrowUpRight className="w-3 h-3" />
              //         </button>
              //       </td>
              //     </tr>
              //   );
              // })} */}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
