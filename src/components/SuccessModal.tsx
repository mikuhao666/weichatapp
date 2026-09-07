import React, { useState } from 'react';
import { ApplicationRecord } from '../types';
import {
  CheckCircle2,
  Copy,
  Check,
  Search,
  ArrowRight,
  ShieldCheck,
  Clock,
  X,
  FileText,
} from 'lucide-react';

interface SuccessModalProps {
  record: ApplicationRecord;
  onGoToQuery: (id: string) => void;
  onClose: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  record,
  onGoToQuery,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(record.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const name =
    record.type === 'personal' ? record.applicantName : record.unitName;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* 顶部深蓝政务规范成功头部 */}
        <div className="bg-[#003366] p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            title="关闭"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/20">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold tracking-wider">提交成功</h3>
          <p className="text-xs text-blue-100/90 mt-1">
            随州市气象局政务服务窗口已成功受理您的气象证明申请
          </p>
        </div>

        {/* 内容详情 */}
        <div className="p-5 space-y-4 text-xs bg-white">
          {/* 专属申请编号卡片 */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-500">
              您的申请编号（已生成）
            </span>
            <div className="flex items-center justify-center space-x-2">
              <span className="font-mono text-lg font-bold text-[#003366] tracking-wide bg-blue-50/80 px-3 py-1 rounded-lg border border-blue-200/80 select-all">
                {record.id}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 text-blue-700 hover:text-blue-900 hover:bg-blue-100 rounded-lg border border-blue-200 bg-white transition-colors cursor-pointer flex items-center space-x-1"
                title="复制单号"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-[11px] text-emerald-700 font-bold">已复制</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#003366]" />
                    <span className="text-[11px] text-[#003366] font-medium">复制</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              编号规则：气象标识(QX) + 年月日 + 4位随机码，凭此单号可随时查询进度
            </p>
          </div>

          {/* 申报信息摘要 */}
          <div className="space-y-2 text-slate-600 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center pb-1.5 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">申请主体：</span>
              <span className="font-semibold text-slate-900">{name}</span>
            </div>
            <div className="flex justify-between items-center pb-1.5 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">气象灾害：</span>
              <span className="font-bold text-[#003366] bg-blue-50 px-2 py-0.5 rounded">
                {record.disasterType}
              </span>
            </div>
            <div className="flex justify-between items-center pb-1.5 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">发生日期：</span>
              <span className="font-mono text-slate-800">{record.disasterDate}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">联系电话：</span>
              <span className="font-mono text-slate-800">{record.phone}</span>
            </div>
          </div>

          {/* 温馨提示 */}
          <div className="flex items-start space-x-2 text-slate-600 text-[11px] bg-amber-50/70 border border-amber-200/80 p-3 rounded-xl">
            <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900">办理时限提示：</p>
              <p className="text-amber-800 mt-0.5">
                正常办理时限为 1-3 个工作日。气象台将自动核验国家站观测数据并签发红章公文。
              </p>
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="space-y-2 pt-1">
            <button
              id="btn-modal-go-query"
              onClick={() => onGoToQuery(record.id)}
              className="w-full py-3 px-4 rounded-lg bg-[#003366] hover:bg-[#00274d] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer active:scale-[0.99]"
            >
              <Search className="w-4 h-4" />
              <span>查看此申请的办理进度</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors cursor-pointer"
            >
              返回系统首页
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
