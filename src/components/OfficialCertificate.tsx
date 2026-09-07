import React, { useRef } from 'react';
import { ApplicationRecord } from '../types';
import {
  Printer,
  Download,
  Share2,
  CheckCircle2,
  ShieldCheck,
  Building,
  Calendar,
  MapPin,
  FileText,
  Copy,
  Check,
} from 'lucide-react';

interface OfficialCertificateProps {
  application: ApplicationRecord;
  onClose?: () => void;
}

export const OfficialCertificate: React.FC<OfficialCertificateProps> = ({
  application,
  onClose,
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  const applicantDisplayName =
    application.type === 'personal'
      ? application.applicantName || '申请人'
      : application.unitName || '申请单位';

  const idCodeDisplay =
    application.type === 'personal'
      ? application.idCardNumber
        ? `${application.idCardNumber.slice(0, 6)}********${application.idCardNumber.slice(14)}`
        : '已实名核验'
      : application.creditCode || '已核验登记';

  const certNumber =
    application.certificateNo ||
    `随气证字[2026]第${application.id.replace(/[^0-9]/g, '').slice(-6)}号`;

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(certNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-xs fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* 顶部工具栏 */}
        <div className="bg-blue-900 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-sm sm:text-base">
              电子气象证明书查验与下载
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1 bg-blue-700 hover:bg-blue-600 text-white text-xs px-2.5 py-1.5 rounded-lg transition-colors"
              title="打印证明"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">打印/保存PDF</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="text-blue-200 hover:text-white text-sm px-2 py-1 rounded-md hover:bg-blue-800 transition-colors"
              >
                关闭
              </button>
            )}
          </div>
        </div>

        {/* 证书主体（支持打印） */}
        <div className="overflow-y-auto p-4 sm:p-8 bg-amber-50/30 flex-1 print:p-0 print:bg-white">
          <div
            ref={certificateRef}
            id="printable-certificate"
            className="bg-white border-4 border-double border-blue-900/60 p-6 sm:p-8 rounded-lg shadow-sm relative overflow-hidden text-slate-800"
          >
            {/* 证书底纹水印 */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-5 select-none rotate-[-25deg]">
              <div className="text-center">
                <p className="text-5xl font-black text-blue-950 tracking-widest uppercase">
                  随州市气象局
                </p>
                <p className="text-3xl font-bold tracking-widest mt-2">
                  官方气象证明专用
                </p>
              </div>
            </div>

            {/* 证书抬头 */}
            <div className="text-center border-b-2 border-red-700 pb-4 mb-5">
              <div className="flex items-center justify-center space-x-2 mb-1.5">
                <span className="w-3 h-3 rounded-full bg-red-600 inline-block"></span>
                <span className="text-xs sm:text-sm font-semibold tracking-widest text-red-700">
                  中华人民共和国 随州市气象局
                </span>
                <span className="w-3 h-3 rounded-full bg-red-600 inline-block"></span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-wider font-serif">
                气 象 灾 害 证 明 书
              </h2>
              <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 mt-3 px-1">
                <span>
                  证明编号：
                  <strong className="text-slate-800 font-mono">
                    {certNumber}
                  </strong>
                </span>
                <span>
                  签发日期：
                  <strong className="text-slate-800">
                    {application.issueDate || '2026-09-07'}
                  </strong>
                </span>
              </div>
            </div>

            {/* 证书正文表格 */}
            <div className="border border-slate-300 rounded-md overflow-hidden text-xs sm:text-sm">
              <div className="grid grid-cols-4 border-b border-slate-200">
                <div className="bg-slate-100 p-2 font-medium text-slate-600 col-span-1 border-r border-slate-200 flex items-center">
                  {application.type === 'personal' ? '申请人姓名' : '申请单位名称'}
                </div>
                <div className="p-2 font-semibold text-slate-800 col-span-3 flex items-center justify-between">
                  <span>{applicantDisplayName}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-normal">
                    {application.type === 'personal' ? '公民个人' : '法人单位'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-4 border-b border-slate-200">
                <div className="bg-slate-100 p-2 font-medium text-slate-600 col-span-1 border-r border-slate-200 flex items-center">
                  {application.type === 'personal' ? '身份证号码' : '统一社会信用代码'}
                </div>
                <div className="p-2 font-mono text-slate-700 col-span-3">
                  {idCodeDisplay}
                </div>
              </div>

              <div className="grid grid-cols-4 border-b border-slate-200">
                <div className="bg-slate-100 p-2 font-medium text-slate-600 col-span-1 border-r border-slate-200 flex items-center">
                  灾害类型
                </div>
                <div className="p-2 col-span-1 border-r border-slate-200 font-bold text-red-700">
                  {application.disasterType}
                </div>
                <div className="bg-slate-100 p-2 font-medium text-slate-600 col-span-1 border-r border-slate-200 flex items-center">
                  发生日期
                </div>
                <div className="p-2 col-span-1 text-slate-800 font-mono">
                  {application.disasterDate}
                </div>
              </div>

              <div className="grid grid-cols-4 border-b border-slate-200">
                <div className="bg-slate-100 p-2 font-medium text-slate-600 col-span-1 border-r border-slate-200 flex items-center">
                  灾害发生地点
                </div>
                <div className="p-2 text-slate-800 col-span-3">
                  {application.disasterLocation}
                </div>
              </div>

              <div className="grid grid-cols-4 border-b border-slate-200">
                <div className="bg-slate-100 p-2 font-medium text-slate-600 col-span-1 border-r border-slate-200 flex items-center">
                  气象观测站实况
                </div>
                <div className="p-2 text-slate-700 col-span-3 space-y-1.5 leading-relaxed">
                  <p className="font-semibold text-blue-900">
                    观测台站：{application.observationData?.stationName || '随州市国家气象观测站（站号57381）'}
                  </p>
                  <p className="text-slate-600">
                    实测要素：{application.observationData?.extremeValues || '当日监测要素达到严重气象灾害指标。'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-4 border-b border-slate-200">
                <div className="bg-slate-100 p-2 font-medium text-slate-600 col-span-1 border-r border-slate-200 flex items-center">
                  气象局认定意见
                </div>
                <div className="p-2 text-slate-800 col-span-3 leading-relaxed font-medium">
                  {application.observationData?.conclusion ||
                    `经随州市气象台历史气象探测实况数据及雷达反演，核验申请人申报的${application.disasterType}天气情况属实。`}
                </div>
              </div>

              <div className="grid grid-cols-4">
                <div className="bg-slate-100 p-2 font-medium text-slate-600 col-span-1 border-r border-slate-200 flex items-center">
                  用途说明
                </div>
                <div className="p-2 text-slate-700 col-span-3 text-xs leading-relaxed">
                  {application.purpose || '用于保险理赔及政策性灾害损失减免凭证'}
                </div>
              </div>
            </div>

            {/* 法定声明 */}
            <div className="mt-4 p-3 bg-blue-50/60 rounded border border-blue-100 text-[11px] text-blue-900 leading-relaxed">
              <strong>法定效力声明：</strong>
              本证明书由随州市气象局依据《中华人民共和国气象法》第十三条及湖北省气象灾害防御条例开具，数据真实准确，加盖电子专用公章，具备法律公证效力。任何涂改、伪造无效。
            </div>

            {/* 印章与署名区域 */}
            <div className="mt-6 flex items-end justify-between relative min-h-[110px]">
              {/* 防伪二维码 */}
              <div className="flex items-center space-x-2">
                <div className="w-16 h-16 border border-slate-300 p-1 bg-white rounded shadow-2xs flex flex-col items-center justify-center">
                  <div className="w-full h-full bg-slate-900 flex items-center justify-center p-0.5">
                    {/* 模拟二维码矢量 */}
                    <div className="w-full h-full bg-white grid grid-cols-4 gap-0.5 p-1">
                      <div className="bg-black col-span-2 row-span-2"></div>
                      <div className="bg-black"></div>
                      <div className="bg-black"></div>
                      <div className="bg-black"></div>
                      <div className="bg-black col-span-2 row-span-2"></div>
                      <div className="bg-black"></div>
                      <div className="bg-black"></div>
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500">
                  <p className="font-semibold text-slate-700">官方防伪核验码</p>
                  <p className="font-mono">{application.id}</p>
                  <p className="text-emerald-700">全国气象证明系统可查</p>
                </div>
              </div>

              {/* 随州市气象局鲜红公章与签发日期 */}
              <div className="relative text-right pr-2">
                {/* 仿真红色公章 */}
                <div className="absolute -top-12 -right-3 sm:right-2 w-32 h-32 pointer-events-none select-none opacity-90">
                  <div className="w-full h-full rounded-full border-4 border-red-600/90 flex flex-col items-center justify-center relative p-1">
                    {/* 外圈虚线与文字 */}
                    <div className="absolute inset-0.5 rounded-full border border-red-500/80 border-dashed"></div>
                    {/* 弧形字 */}
                    <p className="text-[11px] font-black text-red-600 tracking-wider text-center leading-tight">
                      随州市气象局
                    </p>
                    {/* 五角星 */}
                    <span className="text-red-600 text-lg leading-none my-0.5">
                      ★
                    </span>
                    <p className="text-[10px] font-bold text-red-600 tracking-tight">
                      气象证明专用章
                    </p>
                    <p className="text-[8px] font-mono text-red-600/80 mt-0.5">
                      (4213000088921)
                    </p>
                  </div>
                </div>

                <div className="relative z-10 space-y-1 text-xs">
                  <p className="font-bold text-slate-900 tracking-wider">
                    签发机构：随州市气象局
                  </p>
                  <p className="font-medium text-slate-700">
                    承办单位：气象灾害防御服务中心
                  </p>
                  <p className="font-mono text-slate-600">
                    签发日期：{application.issueDate || '2026-09-07'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部操作与复制栏 */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2 text-xs text-slate-600">
            <span>证明编号：{certNumber}</span>
            <button
              onClick={handleCopyCode}
              className="inline-flex items-center space-x-1 text-blue-700 hover:text-blue-900 font-medium cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">已复制</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>复制编号</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="bg-blue-700 hover:bg-blue-800 text-white text-xs px-4 py-2 rounded-lg font-medium shadow-xs flex items-center space-x-1.5 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>下载/保存证明</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs px-3.5 py-2 rounded-lg font-medium transition-colors"
              >
                返回
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
