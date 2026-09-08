import React from 'react';
import { X, Check, RotateCcw, MoveUp, MoveDown, Eye, EyeOff, LayoutGrid, CheckSquare, Minimize2, Maximize2 } from 'lucide-react';
import { WidgetConfig } from '../types';

interface CustomWidgetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  widgets: WidgetConfig[];
  onToggleWidget: (id: string) => void;
  onToggleCollapse: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onResetDefault: () => void;
  isDark?: boolean;
}

export const CustomWidgetsModal: React.FC<CustomWidgetsModalProps> = ({
  isOpen,
  onClose,
  widgets = [],
  onToggleWidget,
  onToggleCollapse,
  onMoveUp,
  onMoveDown,
  onResetDefault,
  isDark = true,
}) => {
  if (!isOpen) return null;

  const safeWidgets = Array.isArray(widgets) ? widgets : [];
  const enabledCount = safeWidgets.filter((w) => w && w.enabled).length;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border overflow-hidden ${
          isDark ? 'bg-[#0f172a] text-slate-100 border-slate-700/80' : 'bg-white text-slate-900 border-slate-300'
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isDark ? 'bg-[#0b1120] border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase text-blue-400 tracking-wide">
                Tùy Chỉnh Widget & Bố Cục Dashboard
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Bật/tắt, sắp xếp thứ tự hiển thị hoặc thu gọn các khối tiện ích theo nhu cầu quản trị ({enabledCount}/{safeWidgets.length} đang hiển thị)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of widgets */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-1 border-b border-slate-800">
            <span>Danh sách Widget ({safeWidgets.length})</span>
            <span>Thao tác sắp xếp & Trạng thái</span>
          </div>

          {safeWidgets.map((widget, index) => (
            <div
              key={widget.id}
              className={`p-3.5 rounded-xl border flex items-center justify-between transition gap-3 ${
                widget.enabled
                  ? isDark
                    ? 'bg-[#141e33] border-slate-700/80 text-slate-100'
                    : 'bg-white border-slate-300 text-slate-900'
                  : isDark
                  ? 'bg-slate-900/40 border-slate-800/60 text-slate-500 opacity-60'
                  : 'bg-slate-100 border-slate-200 text-slate-400 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onToggleWidget(widget.id)}
                  className={`w-6 h-6 rounded-md flex items-center justify-center transition border ${
                    widget.enabled
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-transparent'
                  }`}
                  title={widget.enabled ? 'Ẩn widget' : 'Hiện widget'}
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold">{widget.title}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold ${
                        widget.sectionCategory === 'today'
                          ? 'bg-emerald-950 text-emerald-300'
                          : widget.sectionCategory === 'overview'
                          ? 'bg-blue-950 text-blue-300'
                          : widget.sectionCategory === 'charts'
                          ? 'bg-purple-950 text-purple-300'
                          : 'bg-amber-950 text-amber-300'
                      }`}
                    >
                      {widget.sectionCategory}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Collapse / Expand toggle */}
                <button
                  onClick={() => onToggleCollapse(widget.id)}
                  className={`p-1.5 rounded-lg text-xs transition border ${
                    widget.collapsed
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                  title={widget.collapsed ? 'Đang thu gọn (nhấn để mở)' : 'Đang mở (nhấn để thu gọn)'}
                >
                  {widget.collapsed ? (
                    <span className="flex items-center gap-1 text-[11px]">
                      <Maximize2 className="w-3 h-3" /> Thu gọn
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px]">
                      <Minimize2 className="w-3 h-3" /> Mở rộng
                    </span>
                  )}
                </button>

                {/* Move Up */}
                <button
                  onClick={() => onMoveUp(index)}
                  disabled={index === 0}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-300 border border-slate-700 transition"
                  title="Di chuyển lên trên"
                >
                  <MoveUp className="w-3.5 h-3.5" />
                </button>

                {/* Move Down */}
                <button
                  onClick={() => onMoveDown(index)}
                  disabled={index === widgets.length - 1}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-300 border border-slate-700 transition"
                  title="Di chuyển xuống dưới"
                >
                  <MoveDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-3.5 border-t flex items-center justify-between ${
            isDark ? 'bg-[#0b1120] border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <button
            onClick={onResetDefault}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi phục mặc định ban đầu</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs transition"
          >
            Áp dụng cấu hình
          </button>
        </div>
      </div>
    </div>
  );
};
