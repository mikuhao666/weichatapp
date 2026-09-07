import React, { useState, useEffect } from 'react';
import {
  Award,
  Download,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Building,
  FileText,
  Printer,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Navigation as NavIcon,
} from 'lucide-react';
import { ApplicationRecord, TabType } from '../types';
import { getApplications, updateApplicationStatus } from '../utils/storage';
import { OfficialCertificate } from './OfficialCertificate';

interface CertificateViewProps {
  onNavigateTab: (tab: TabType) => void;
  selectedRecord?: ApplicationRecord | null;
}

export const CertificateView: React.FC<CertificateViewProps> = ({
  onNavigateTab,
  selectedRecord: initialSelectedRecord,
}) => {
  const [pickupMethod, setPickupMethod] = useState<'online' | 'offline'>('online');
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [activeApp, setActiveApp] = useState<ApplicationRecord | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  useEffect(() => {
    const apps = getApplications();
    setApplications(apps);

    if (initialSelectedRecord) {
      setActiveApp(initialSelectedRecord);
      return;
    }

    // 默认优先选中已审批通过的，若无则选中第一条
    const approved = apps.find(
      (a) =>
        a.status === 'APPROVED' ||
        a.status === 'AWAITING_PICKUP' ||
        a.status === 'COMPLETED'
    );
    setActiveApp(approved || (apps.length > 0 ? apps[0] : null));
  }, [initialSelectedRecord]);

  const isApproved =
    activeApp?.status === 'APPROVED' ||
    activeApp?.status === 'AWAITING_PICKUP' ||
    activeApp?.status === 'COMPLETED';

  // 快捷模拟审批通过（方便用户体验下载）
  const handleQuickApprove = () => {
    if (!activeApp) return;
    const updated = updateApplicationStatus(activeApp.id, 'APPROVED');
    if (updated) {
      setActiveApp(updated);
      setApplications(getApplications());
    }
  };

  return (
    <div className="space-y-4 pb-16">
      {/* 头部标题与说明 */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              气象证明书领取与凭证出具
            </h2>
            <p className="text-xs text-slate-500">
              随州市气象局防灾减灾中心官方防伪查验出件窗口
            </p>
          </div>
        </div>

        {/* 申请记录选择器 */}
        {applications.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <p className="text-[11px] text-slate-500 mb-1.5">
              选择领取的申报记录：
            </p>
            <div className="flex flex-wrap gap-1.5">
              {applications.map((app) => {
                const isSelected = activeApp?.id === app.id;
                const canDownload =
                  app.status === 'APPROVED' ||
                  app.status === 'AWAITING_PICKUP' ||
                  app.status === 'COMPLETED';

                return (
                  <button
                    key={app.id}
                    onClick={() => setActiveApp(app)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all flex items-center space-x-1.5 ${
                      isSelected
                        ? 'bg-blue-700 text-white border-blue-700 font-bold shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span>
                      {app.type === 'personal'
                        ? app.applicantName
                        : app.unitName?.slice(0, 6)}
                    </span>
                    <span className="text-[10px] opacity-80">
                      ({app.disasterType})
                    </span>
                    {canDownload && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 领取方式切换（线上下载 / 线下领取） */}
      <div className="bg-white rounded-xl p-1.5 border border-slate-200 shadow-xs flex">
        <button
          id="tab-pickup-online"
          onClick={() => setPickupMethod('online')}
          className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
            pickupMethod === 'online'
              ? 'bg-[#004a99] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>线上下载电子证明（推荐）</span>
        </button>
        <button
          id="tab-pickup-offline"
          onClick={() => setPickupMethod('offline')}
          className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
            pickupMethod === 'offline'
              ? 'bg-[#004a99] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>线下窗口领取（纸质）</span>
        </button>
      </div>

      {/* 1. 线上下载面板 */}
      {pickupMethod === 'online' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            {activeApp && isApproved ? (
              <div>
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xl mb-3 font-bold">
                  ✓
                </div>
                <h3 className="text-lg font-bold text-slate-800">证明已签发开具</h3>
                <p className="text-xs text-slate-400 mt-1 mb-5">
                  您的气象证明已完成法定审批，加盖随州市气象局电子公章，可随时提取或打印。
                </p>

                <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs mb-5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-blue-900 font-bold">
                      文号：{activeApp.certificateNo || '随气证字[2026]第0907号'}
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold text-[10px]">
                      官方电子印章有效
                    </span>
                  </div>
                  <div className="text-slate-700">
                    <strong>申请主体：</strong>
                    {activeApp.type === 'personal' ? activeApp.applicantName : activeApp.unitName}
                  </div>
                  <div className="text-slate-700">
                    <strong>受灾事实：</strong>
                    {activeApp.disasterDate} · {activeApp.disasterLocation} · <span className="text-blue-700 font-bold">{activeApp.disasterType}</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <button
                    id="btn-download-pdf"
                    onClick={() => setShowCertificateModal(true)}
                    className="w-full bg-[#004a99] hover:bg-[#003875] text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-900/20 active:scale-[0.98] flex items-center justify-center space-x-2 transition-all cursor-pointer text-xs sm:text-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>查看并下载电子版证明 (PDF/打印)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCertificateModal(true)}
                    className="w-full py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg text-xs transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                    <span>预览正式红章公文</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">该申请仍在审批流程中，暂未签发公章</p>
                    <p className="text-[11px] text-amber-700 mt-1 leading-relaxed">
                      随州市气象台业务人员正在核验气象实况数据。待审批通过后，电子公章将自动盖印生成。
                    </p>
                  </div>
                </div>

                {activeApp && (
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={handleQuickApprove}
                      className="text-xs text-blue-700 hover:text-blue-900 underline font-medium cursor-pointer"
                    >
                      [演示模式] 模拟通过审批，以便立即体验开具红章电子证明 &rarr;
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. 线下领取面板（线下窗口领取指引） */}
      {pickupMethod === 'offline' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-slate-800">线下窗口领取指引</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              如需随州市气象局加盖鲜红物理公章的纸质版证明原件，可凭身份证件前往政务大厅窗口领取。
            </p>

            <div className="border-t border-slate-100 pt-4 space-y-4">
              <div className="flex items-start gap-3">
                <div className="text-blue-600 mt-0.5 text-base">📍</div>
                <div>
                  <h5 className="text-xs font-bold text-slate-700">随州市气象局大厅 2楼 204室</h5>
                  <p className="text-[10px] text-slate-400">曾都区交通大道128号（随州市气象局综合业务楼）</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-blue-600 mt-0.5 text-base">⏰</div>
                <div>
                  <h5 className="text-xs font-bold text-slate-700">周一至周五 08:30 - 17:30</h5>
                  <p className="text-[10px] text-slate-400">法定节假日除外，中午 12:00 - 14:30 轮流值班</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-blue-600 mt-0.5 text-base">📞</div>
                <div>
                  <h5 className="text-xs font-bold text-slate-700">0722-3288110</h5>
                  <p className="text-[10px] text-slate-400">防灾减灾气象证明服务热线</p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowCertificateModal(true)}
                className="w-full bg-[#004a99] hover:bg-[#003875] text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all cursor-pointer text-xs sm:text-sm"
              >
                下载电子版预审 (PDF)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 电子证明书全屏预览/下载弹窗 */}
      {showCertificateModal && activeApp && (
        <OfficialCertificate
          application={activeApp}
          onClose={() => setShowCertificateModal(false)}
        />
      )}
    </div>
  );
};
