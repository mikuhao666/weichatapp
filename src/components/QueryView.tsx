import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  Building2,
  User,
  AlertCircle,
  FileCheck2,
  ArrowRight,
  Sparkles,
  Award,
  RefreshCw,
} from 'lucide-react';
import { ApplicationRecord, ApplicationStatus, TabType } from '../types';
import {
  STATUS_STEPS,
  getApplications,
  queryApplications,
  queryApplicationsAsync,
  fetchAllApplicationsAsync,
  updateApplicationStatus,
} from '../utils/storage';
import { CLOUDBASE_ENV_ID } from '../utils/cloudbase';

interface QueryViewProps {
  onSelectCertificate: (record: ApplicationRecord) => void;
  onNavigateTab: (tab: TabType) => void;
  initialQueryId?: string;
}

export const QueryView: React.FC<QueryViewProps> = ({
  onSelectCertificate,
  onNavigateTab,
  initialQueryId,
}) => {
  const [searchInput, setSearchInput] = useState(initialQueryId || '');
  const [allApplications, setAllApplications] = useState<ApplicationRecord[]>([]);
  const [selectedApp, setSelectedApp] = useState<ApplicationRecord | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cloudSyncing, setCloudSyncing] = useState(false);

  const loadData = async () => {
    const apps = getApplications();
    setAllApplications(apps);

    if (initialQueryId) {
      const match = apps.find((a) => a.id === initialQueryId);
      if (match) {
        setSelectedApp(match);
        setHasSearched(true);
      }
    } else if (apps.length > 0 && !selectedApp) {
      setSelectedApp(apps[0]);
    }

    // 从腾讯云开发数据库同步最新数据
    setCloudSyncing(true);
    try {
      const cloudApps = await fetchAllApplicationsAsync();
      if (cloudApps.length > 0) {
        setAllApplications(cloudApps);
        if (initialQueryId) {
          const cloudMatch = cloudApps.find((a) => a.id === initialQueryId);
          if (cloudMatch) setSelectedApp(cloudMatch);
        } else if (!selectedApp) {
          setSelectedApp(cloudApps[0]);
        }
      }
    } catch (err) {
      console.warn('从腾讯云开发同步数据异常:', err);
    } finally {
      setCloudSyncing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [initialQueryId]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setHasSearched(true);

    const queryTerm = searchInput.trim();
    if (!queryTerm) {
      if (allApplications.length > 0) {
        setSelectedApp(allApplications[0]);
      }
      return;
    }

    setLoading(true);
    try {
      // 优先从腾讯云开发数据库进行跨字段匹配（编号、手机号、身份证号、统一代码）
      const cloudResults = await queryApplicationsAsync(queryTerm);
      if (cloudResults.length > 0) {
        setSelectedApp(cloudResults[0]);
      } else {
        const localResults = queryApplications(queryTerm);
        setSelectedApp(localResults.length > 0 ? localResults[0] : null);
      }
    } catch (err) {
      console.error('云数据库查询异常，使用本地备选数据:', err);
      const localResults = queryApplications(queryTerm);
      setSelectedApp(localResults.length > 0 ? localResults[0] : null);
    } finally {
      setLoading(false);
    }
  };

  // 演示模式：修改当前状态以测试各节点体验
  const handleQuickStatusChange = async (newStatus: ApplicationStatus) => {
    if (!selectedApp) return;
    const updated = await updateApplicationStatus(selectedApp.id, newStatus);
    if (updated) {
      setSelectedApp(updated);
      setAllApplications(getApplications());
    }
  };

  // 获取当前状态在7步里的索引
  const currentStepIndex = selectedApp
    ? STATUS_STEPS.findIndex((s) => s.key === selectedApp.status)
    : -1;

  const isApprovedOrReady =
    selectedApp?.status === 'APPROVED' ||
    selectedApp?.status === 'AWAITING_PICKUP' ||
    selectedApp?.status === 'COMPLETED';

  return (
    <div className="space-y-4 pb-16">
      {/* 搜索栏卡片 */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-[#003366]" />
            <span className="text-xs sm:text-sm font-bold text-slate-800">
              气象证明进度与实况查验
            </span>
          </div>
          <div className="flex items-center space-x-1.5 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>云数据库直连</span>
            {cloudSyncing && (
              <RefreshCw className="w-3 h-3 animate-spin text-emerald-600" />
            )}
          </div>
        </div>

        <form onSubmit={handleSearch} className="relative flex items-center">
          <input
            id="query-input-search"
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="输入申请编号（如QX...）或预留手机号查询"
            className="w-full pl-3.5 pr-20 py-2.5 border border-slate-200 rounded-lg text-xs sm:text-sm outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-mono"
          />
          <button
            id="btn-query-search"
            type="submit"
            disabled={loading}
            className="absolute right-2 px-3 py-1.5 bg-[#003366] hover:bg-[#00274d] text-white rounded-md font-bold text-xs cursor-pointer flex items-center space-x-1 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>查询中</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>查询</span>
              </>
            )}
          </button>
        </form>

        {/* 最近申请快速标签列表 */}
        {allApplications.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <p className="text-[11px] text-slate-400 mb-1.5 flex items-center space-x-1">
              <span>快捷选择历史记录：</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {allApplications.map((app) => {
                const isCurrent = selectedApp?.id === app.id;
                const displayName =
                  app.type === 'personal'
                    ? `${app.applicantName} (${app.disasterType})`
                    : `${app.unitName?.slice(0, 8)}... (${app.disasterType})`;

                return (
                  <button
                    key={app.id}
                    onClick={() => {
                      setSelectedApp(app);
                      setSearchInput(app.id);
                    }}
                    className={`text-[11px] px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs font-semibold'
                        : 'bg-slate-50 hover:bg-blue-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    <span>{displayName}</span>
                    <span className="ml-1 opacity-80">
                      · {STATUS_STEPS.find((s) => s.key === app.status)?.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 查询结果详情 */}
      {selectedApp ? (
        <div className="space-y-4">
          {/* Timeline Result Card */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">
                  {STATUS_STEPS.find((s) => s.key === selectedApp.status)?.label}
                </span>
                <h4 className="font-bold text-slate-800 mt-1.5 text-sm sm:text-base">
                  {selectedApp.type === 'personal' ? '个人气象证明' : '单位气象证明'} ({selectedApp.disasterType})
                </h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  单号: {selectedApp.id}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">办理时限</span>
                <p className="text-xs font-bold text-slate-700">1-3个工作日</p>
              </div>
            </div>

            {/* 申请详情概要 */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/60 p-3 rounded-lg border border-slate-100">
              <div>
                <span className="text-slate-400">申请主体：</span>
                <span className="font-semibold text-slate-700 ml-1">
                  {selectedApp.type === 'personal' ? selectedApp.applicantName : selectedApp.unitName}
                </span>
              </div>
              <div>
                <span className="text-slate-400">受灾日期：</span>
                <span className="font-mono text-slate-700 ml-1">{selectedApp.disasterDate}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400">受灾地点：</span>
                <span className="text-slate-700 ml-1">{selectedApp.disasterLocation}</span>
              </div>
            </div>

            {/* 若已审批通过，提供直接领取证明快捷按钮 */}
            {isApprovedOrReady && (
              <div className="bg-emerald-50/80 border border-emerald-200 p-3 rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-2 text-emerald-900">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold">气象灾害证明书已审批通过并签章！</p>
                    <p className="text-[10px] text-emerald-700">
                      文号：{selectedApp.certificateNo || '随气证字[2026]第0907号'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onSelectCertificate(selectedApp)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-lg font-bold shadow-xs flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>立即查验/领取</span>
                </button>
              </div>
            )}

            {/* Stepper 流程追踪 */}
            <div className="pt-2">
              <h5 className="text-xs font-bold text-slate-800 mb-4 flex items-center gap-1.5">
                <span className="w-1 h-3.5 bg-blue-600 rounded"></span>
                <span>审批全流程时间线</span>
              </h5>
              <div className="relative pl-6 space-y-6 border-l-2 border-slate-100 ml-2">
                {selectedApp.logs.map((log, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[31px] bg-blue-600 w-4 h-4 rounded-full border-2 border-white ring-2 ring-blue-100"></div>
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-slate-800">{log.title}</h5>
                      <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">{log.operator} · {log.remark}</p>
                  </div>
                ))}

                {/* 待完成步骤 */}
                {!isApprovedOrReady && (
                  <>
                    <div className="relative">
                      <div className="absolute -left-[31px] bg-slate-200 w-4 h-4 rounded-full border-2 border-white"></div>
                      <h5 className="text-xs font-bold text-slate-400">法制及业务负责人审签并盖印</h5>
                      <p className="text-[10px] text-slate-400 mt-0.5">待完成</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[31px] bg-slate-200 w-4 h-4 rounded-full border-2 border-white"></div>
                      <h5 className="text-xs font-bold text-slate-400">出具带随州市气象局电子印章证明</h5>
                      <p className="text-[10px] text-slate-400 mt-0.5">待完成</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 体验与测试演示工具栏（方便随时测试7步各个状态） */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>状态演示调节器（体验不同审批阶段）</span>
              </span>
              <span className="text-[10px] text-slate-400">
                可点击任意状态模拟系统推进
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_STEPS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => handleQuickStatusChange(s.key)}
                  className={`text-[11px] px-2 py-1 rounded-lg transition-colors ${
                    selectedApp.status === s.key
                      ? 'bg-blue-700 text-white font-bold shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : hasSearched ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">未查询到相关申报记录</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            请确认输入的申请编号（如 QX202609071234）或预留手机号码是否正确。云数据库将自动进行实时检索。
          </p>
        </div>
      ) : null}
    </div>
  );
};
