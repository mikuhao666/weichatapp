import React, { useState } from 'react';
import {
  UserCheck,
  Building2,
  FileText,
  Clock,
  AlertTriangle,
  HelpCircle,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
  Search,
  Award,
  CloudLightning,
  Info,
} from 'lucide-react';
import { TabType } from '../types';

interface HomeViewProps {
  onNavigate: (tab: TabType) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: '气象证明主要用于哪些场景？',
      a: '主要用于因暴雨、大风、雷电、冰雹、暴雪等灾害性天气造成的财产损失、人身伤害或农作物受损后的保险公司理赔、司法诉讼事实认定、工期延误核实以及政府救灾救助申请。',
    },
    {
      q: '证明办理需要多长时间？',
      a: '网上申请提交后，政务窗口1个工作日内完成受理初审，随州市气象台比对实况观测资料并在1-3个工作日内办结签发。如遇特急保险理赔，可拨打加急电话 0722-3592188 申请绿色通道当日办结。',
    },
    {
      q: '线上下载的电子证明和纸质证明效力一样吗？',
      a: '完全一致。依据《电子签名法》及气象政务规定，系统开具的电子证明书附带“随州市气象局气象证明专用章”数字印章及防伪验证二维码，与窗口纸质盖章证明具有同等法定证明效力，保险机构全国认可。',
    },
    {
      q: '如果在偏远乡镇没有国家站，如何证明发生了强对流或暴雨？',
      a: '随州市已建成覆盖曾都区、广水市、随县全部乡镇的区域自动气象站网、高频闪电定位仪和新一代多普勒天气雷达。即使灾害点无独立国家基准站，专家也会调取附近区域站及雷达反演数据进行权威研判。',
    },
  ];

  return (
    <div className="space-y-4 pb-8">
      {/* 办理须知（遵从 Professional Polish 主题第一视觉模块） */}
      <div className="bg-white rounded-xl p-5 shadow-xs border border-slate-200">
        <h2 className="text-[#003366] font-bold mb-3 flex items-center gap-2">
          <span className="w-1.5 h-4 bg-[#003366] rounded-xs"></span>
          办理须知
        </h2>
        <ul className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
          <li className="flex gap-2">
            <span className="text-[#003366] font-bold">01.</span>
            <span>申请人需确保证明用途合法有效，灾情信息填报真实准确。</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[#003366] font-bold">02.</span>
            <span>需准备身份证正反面照片（单位需准备加盖公章的申请函）。</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[#003366] font-bold">03.</span>
            <span>审核时限为1至3个工作日，可在进度查询页实时追踪办理流转。</span>
          </li>
        </ul>
      </div>

      {/* 两个核心入口按钮（个人申请入口 / 单位申请入口） */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        {/* 个人申请入口 */}
        <button
          id="btn-personal-apply"
          onClick={() => onNavigate('personal')}
          className="group relative overflow-hidden bg-white hover:bg-blue-50/50 border-2 border-[#003366] p-5 sm:p-6 rounded-2xl transition-all text-left shadow-xs hover:shadow-md cursor-pointer"
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-[#003366] font-bold text-base sm:text-lg">个人申请入口</h3>
              <p className="text-slate-500 text-xs mt-1">适用于居民家庭、车损、农作物个人财产损失申领</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-[#003366] font-bold text-lg group-hover:translate-x-1 transition-transform shrink-0">
              →
            </div>
          </div>
        </button>

        {/* 单位申请入口 */}
        <button
          id="btn-unit-apply"
          onClick={() => onNavigate('unit')}
          className="group relative overflow-hidden bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-[#003366] p-5 sm:p-6 rounded-2xl transition-all text-left shadow-xs hover:shadow-md cursor-pointer"
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-slate-800 font-bold text-base sm:text-lg">单位申请入口</h3>
              <p className="text-slate-500 text-xs mt-1">适用于企事业单位、基建项目证明与工期延误</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg group-hover:translate-x-1 transition-transform shrink-0">
              →
            </div>
          </div>
        </button>
      </div>

      {/* 温馨提示 Callout Banner */}
      <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-700 leading-relaxed flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <span>温馨提示：随州市范围内气象灾害证明线上申领完全免费，请勿相信任何有偿代办信息。</span>
      </div>

      {/* 快捷功能卡（进度查询 + 证明领取） */}
      <div className="grid grid-cols-2 gap-3">
        <button
          id="btn-quick-query"
          onClick={() => onNavigate('query')}
          className="bg-white hover:bg-slate-50 border border-slate-200 p-3.5 rounded-xl shadow-xs text-left flex items-center space-x-3 transition-all cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
            <Search className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-800">
              进度查询
            </h4>
            <p className="text-[11px] text-slate-400">查状态 / 看审核流转</p>
          </div>
        </button>

        <button
          id="btn-quick-certificate"
          onClick={() => onNavigate('certificate')}
          className="bg-white hover:bg-slate-50 border border-slate-200 p-3.5 rounded-xl shadow-xs text-left flex items-center space-x-3 transition-all cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-800">
              证明领取
            </h4>
            <p className="text-[11px] text-slate-400">线上下载 / 线下指引</p>
          </div>
        </button>
      </div>

      {/* 办理须知模块（题目明确要求：所需材料、办理时限、注意事项） */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-700" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              办事指南 · 办理须知
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">随州市气象局发布</span>
        </div>

        {/* 1. 所需材料 */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
            <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-800 flex items-center justify-center text-[11px]">
              1
            </span>
            <span>申报所需材料清单</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pl-7">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <p className="font-semibold text-blue-900 mb-1">个人申请：</p>
              <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
                <li>申请人有效居民身份证（正面及反面照片）</li>
                <li>灾害发生详细时间与具体受灾地址</li>
                <li>用途说明（如保险报案号、受损情况）</li>
              </ul>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <p className="font-semibold text-indigo-900 mb-1">单位申请：</p>
              <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
                <li>单位名称与18位统一社会信用代码</li>
                <li>经办人姓名及联系手机号码</li>
                <li>加盖单位公章的申请函原件扫描件/清晰照片</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 2. 办理时限 */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
            <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center text-[11px]">
              2
            </span>
            <span>办理时限与服务流程</span>
          </div>
          <div className="pl-7 space-y-1.5 text-xs text-slate-600">
            <div className="flex items-start space-x-2">
              <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="text-slate-800">法定办结时限：</strong>
                1至3个工作日（材料齐全且实况数据比对吻合的，一般在提交后24小时内办结并生成防伪电子证明）。
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="text-slate-800">加急绿色通道：</strong>
                若面临保险理赔截止或紧急诉讼，可在提交后致电窗口申请紧急核验。
              </p>
            </div>
          </div>
        </div>

        {/* 3. 注意事项 */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
            <span className="w-5 h-5 rounded-md bg-rose-100 text-rose-800 flex items-center justify-center text-[11px]">
              3
            </span>
            <span>重要注意事项与法律责任</span>
          </div>
          <div className="pl-7 space-y-1.5 text-[11px] text-slate-600 leading-relaxed bg-amber-50/50 p-2.5 rounded-lg border border-amber-200/60">
            <div className="flex items-start space-x-1.5 text-amber-900">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>真实性承诺：</strong>
                申请人须确保填报信息及上传凭证真实有效。提供虚假资料骗取气象证明用于欺诈理赔者，将移送公安机关并记入失信记录。
              </span>
            </div>
            <div className="flex items-start space-x-1.5 text-slate-700">
              <Info className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>地点精确度：</strong>
                灾害发生地点需精确到随州市各乡镇/街道、村社或小区楼栋，便于气象专家调取最邻近的区域观测站实况微气候数据。
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 常见问题解答 FAQ */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
          <HelpCircle className="w-4 h-4 text-blue-700" />
          <span>常见疑问解答 (FAQ)</span>
        </div>
        <div className="space-y-2">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div
                key={index}
                className="border border-slate-100 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="w-full text-left p-3 bg-slate-50/80 hover:bg-slate-100/80 transition-colors flex items-center justify-between text-xs font-semibold text-slate-800"
                >
                  <span>{faq.q}</span>
                  <ChevronRight
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      isOpen ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="p-3 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 底部政务服务公开与咨询电话 */}
      <div className="text-center text-xs text-slate-400 py-3 space-y-1">
        <p>主办单位：随州市气象局（随州市气象灾害防御中心）</p>
        <p>业务咨询及投诉监督电话：0722-3592188 / 0722-3592199</p>
        <p>地址：湖北省随州市曾都区白云湖南路36号气象局综合业务楼</p>
      </div>
    </div>
  );
};
