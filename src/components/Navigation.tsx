import React from 'react';
import { Home, UserCheck, Building2, SearchCheck, Award } from 'lucide-react';
import { TabType } from '../types';

interface NavigationProps {
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
  pendingCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  setCurrentTab,
  pendingCount = 0,
}) => {
  const tabs = [
    { id: 'home' as TabType, label: '首页', icon: Home },
    { id: 'personal' as TabType, label: '个人申请', icon: UserCheck },
    { id: 'unit' as TabType, label: '单位申请', icon: Building2 },
    { id: 'query' as TabType, label: '进度查询', icon: SearchCheck },
    { id: 'certificate' as TabType, label: '证明领取', icon: Award },
  ];

  return (
    <nav className="bg-white border-b border-slate-100 px-2 sm:px-3 py-2 shrink-0 shadow-xs z-20">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex flex-col items-center gap-1 transition-colors px-2 py-1 relative cursor-pointer ${
                isActive ? 'text-[#003366]' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 text-[#003366]' : 'text-slate-400'
                  }`}
                />
                {tab.id === 'query' && pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#003366] rounded-full ring-2 ring-white animate-pulse"></span>
                )}
              </div>
              <span className={`text-[10px] whitespace-nowrap ${isActive ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-1 left-2 right-2 h-0.5 bg-[#003366] rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
