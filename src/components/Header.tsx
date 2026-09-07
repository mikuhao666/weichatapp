import React from 'react';
import { CloudSun, Phone, Smartphone, Monitor } from 'lucide-react';

interface HeaderProps {
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean) => void;
  onNavigateHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isMobileFrame,
  setIsMobileFrame,
  onNavigateHome,
}) => {
  return (
    <header className="bg-[#003366] text-white pt-6 sm:pt-7 pb-4 px-4 sm:px-6 flex flex-col items-center shrink-0 relative shadow-md">
      {/* 顶部微型政务信息与视口切换小按钮 */}
      <div className="w-full flex items-center justify-between text-[11px] text-blue-100/80 mb-2.5 pb-2 border-b border-white/10">
        <div className="flex items-center space-x-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>随州市政务服务网直通平台</span>
        </div>
        <div className="flex items-center space-x-2">
          <a
            href="tel:07223592188"
            className="flex items-center space-x-1 hover:text-white transition-colors"
          >
            <Phone className="w-3 h-3 text-blue-200" />
            <span className="font-mono">0722-3592188</span>
          </a>
          <button
            onClick={() => setIsMobileFrame(!isMobileFrame)}
            className="hidden sm:inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-white/15 hover:bg-white/25 text-[10px] text-white transition-colors cursor-pointer"
            title="切换仿真视图"
          >
            {isMobileFrame ? (
              <>
                <Monitor className="w-3 h-3" />
                <span>宽屏</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3 h-3" />
                <span>仿真</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 中心品牌徽标与系统标题（与设计稿一脉相承） */}
      <div
        onClick={onNavigateHome}
        className="flex flex-col items-center cursor-pointer group text-center"
        id="header-brand-logo"
      >
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold text-base text-white border border-white/30 group-hover:scale-105 transition-transform shadow-xs">
            <span>S</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-wide text-white font-sans">
            随州市气象局
          </h1>
        </div>
        <p className="text-xs text-blue-100/90 tracking-wide font-normal">
          气象证明在线申请系统
        </p>
      </div>
    </header>
  );
};
