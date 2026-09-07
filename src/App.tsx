import React, { useState, useEffect } from 'react';
import { TabType, ApplicationRecord } from './types';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { HomeView } from './components/HomeView';
import { PersonalFormView } from './components/PersonalFormView';
import { UnitFormView } from './components/UnitFormView';
import { QueryView } from './components/QueryView';
import { CertificateView } from './components/CertificateView';
import { SuccessModal } from './components/SuccessModal';
import { getApplications } from './utils/storage';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [isMobileFrame, setIsMobileFrame] = useState(false);
  const [submittedRecord, setSubmittedRecord] = useState<ApplicationRecord | null>(null);
  const [queryId, setQueryId] = useState<string | undefined>(undefined);
  const [certificateRecord, setCertificateRecord] = useState<ApplicationRecord | null>(null);
  const [applicationsCount, setApplicationsCount] = useState(0);

  useEffect(() => {
    // 确保默认演示数据已初始化
    const apps = getApplications();
    setApplicationsCount(apps.length);
  }, [currentTab]);

  // 提交成功回调
  const handleSubmissionSuccess = (record: ApplicationRecord) => {
    setSubmittedRecord(record);
    const updated = getApplications();
    setApplicationsCount(updated.length);
  };

  // 从弹窗直接跳往进度查询
  const handleGoToQuery = (id: string) => {
    setSubmittedRecord(null);
    setQueryId(id);
    setCurrentTab('query');
  };

  // 从进度查询直接前往证明领取
  const handleGoToCertificate = (record: ApplicationRecord) => {
    setCertificateRecord(record);
    setCurrentTab('certificate');
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans flex items-center justify-center p-0 sm:p-4 lg:p-6 overflow-x-hidden" style={{ backgroundColor: '#f1f5f9' }}>
      {/* 居中主容器结构 */}
      <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center w-full max-w-6xl mx-auto">
        
        {/* 移动端主界面窗口：采用专业精致手机外壳风格 */}
        <div
          className={`w-full bg-white shadow-2xl flex flex-col relative transition-all duration-300 ${
            isMobileFrame
              ? 'max-w-[414px] min-h-[736px] sm:min-h-[820px] rounded-none sm:rounded-[3rem] border-0 sm:border-[12px] sm:border-slate-800 overflow-hidden'
              : 'max-w-xl min-h-screen sm:min-h-[860px] rounded-none sm:rounded-2xl border border-slate-200 overflow-hidden'
          }`}
        >
          {/* 仿真手机听筒 / 灵动岛凹槽 */}
          {isMobileFrame && (
            <div className="hidden sm:block absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-slate-800 rounded-b-2xl z-50 pointer-events-none">
              <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mt-2"></div>
            </div>
          )}

          {/* 顶部政务规范 Header */}
          <Header
            isMobileFrame={isMobileFrame}
            setIsMobileFrame={setIsMobileFrame}
            onNavigateHome={() => setCurrentTab('home')}
          />

          {/* 步骤/Tab切换导航 */}
          <Navigation
            currentTab={currentTab}
            setCurrentTab={(tab) => {
              setCurrentTab(tab);
            }}
            pendingCount={applicationsCount}
          />

          {/* 主视口内容区 */}
          <main className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-5 space-y-4">
            {currentTab === 'home' && (
              <HomeView onNavigate={(tab) => setCurrentTab(tab)} />
            )}

            {currentTab === 'personal' && (
              <PersonalFormView
                onSuccess={handleSubmissionSuccess}
                onCancel={() => setCurrentTab('home')}
              />
            )}

            {currentTab === 'unit' && (
              <UnitFormView
                onSuccess={handleSubmissionSuccess}
                onCancel={() => setCurrentTab('home')}
              />
            )}

            {currentTab === 'query' && (
              <QueryView
                initialQueryId={queryId}
                onSelectCertificate={handleGoToCertificate}
                onNavigateTab={(tab) => setCurrentTab(tab)}
              />
            )}

            {currentTab === 'certificate' && (
              <CertificateView
                selectedRecord={certificateRecord}
                onNavigateTab={(tab) => setCurrentTab(tab)}
              />
            )}
          </main>

          {/* 底部移动端版权栏 */}
          <footer className="bg-[#002d5e] text-white/90 py-3.5 px-4 text-center text-xs shrink-0 border-t border-blue-900/30">
            <p className="font-semibold text-white tracking-wide">随州市气象局 © 2026</p>
            <p className="text-[11px] text-blue-200/70 mt-0.5">
              随州市气象灾害防御中心 · 官方气象证明在线申领便民服务系统
            </p>
          </footer>
        </div>

        {/* 桌面端大屏右侧辅助信息卡片（Professional Polish Theme 特色侧边指引） */}
        <div className="hidden lg:flex flex-col ml-8 xl:ml-12 max-w-xs space-y-4 text-slate-500 py-6 sticky top-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-2 text-[#004a99] font-bold mb-2">
              <span className="w-1.5 h-4 bg-blue-600 rounded-sm"></span>
              <h3 className="text-slate-800 font-bold text-base">随州气象证明系统</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              本系统为移动端H5适配设计，采用「Professional Polish 专业稳重」政务视觉主题，符合国家电子政务办事系统的规范与无障碍准则。
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>随州市气象局防灾减灾中心</span>
              <span className="text-blue-600 font-medium">政务认证</span>
            </div>
          </div>

          <div className="bg-[#004a99] p-6 rounded-2xl text-white shadow-lg shadow-blue-900/15 space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-widest text-blue-200/80">
              便民核心指标
            </h4>
            <div className="space-y-3">
              <div>
                <p className="text-3xl font-bold font-mono text-white">24h</p>
                <p className="text-[11px] text-blue-100/80 mt-0.5">全天候提交申报与自动分流受理</p>
              </div>
              <div className="h-px bg-white/20 w-full"></div>
              <div>
                <p className="text-3xl font-bold font-mono text-white">100%</p>
                <p className="text-[11px] text-blue-100/80 mt-0.5">电子证照合规有效，全国保险互认</p>
              </div>
              <div className="h-px bg-white/20 w-full"></div>
              <div>
                <p className="text-3xl font-bold font-mono text-white">0元</p>
                <p className="text-[11px] text-blue-100/80 mt-0.5">气象证明线上申领全程免费办理</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">服务监督电话：</p>
            <p className="font-mono text-blue-800 font-bold">0722-3592188 / 3592199</p>
            <p className="text-[11px] text-slate-400">周一至周五 08:30 - 17:30</p>
          </div>
        </div>

      </div>

      {/* 提交成功弹窗 */}
      {submittedRecord && (
        <SuccessModal
          record={submittedRecord}
          onGoToQuery={handleGoToQuery}
          onClose={() => {
            setSubmittedRecord(null);
            setCurrentTab('home');
          }}
        />
      )}
    </div>
  );
}
