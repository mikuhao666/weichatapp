import React, { useState } from 'react';
import {
  Building2,
  Upload,
  AlertCircle,
  CheckCircle2,
  Calendar,
  MapPin,
  FileText,
  ShieldCheck,
  Sparkles,
  Paperclip,
  X,
  FileCheck,
} from 'lucide-react';
import { DisasterType, ApplicationRecord } from '../types';
import {
  validateCreditCode,
  validatePhone,
  createApplication,
} from '../utils/storage';
import { uploadToCloudStorage } from '../utils/cloudbase';

interface UnitFormViewProps {
  onSuccess: (record: ApplicationRecord) => void;
  onCancel: () => void;
}

export const UnitFormView: React.FC<UnitFormViewProps> = ({
  onSuccess,
  onCancel,
}) => {
  const disasterOptions: DisasterType[] = [
    '暴雨',
    '大风',
    '雷电',
    '冰雹',
    '暴雪',
    '高温',
    '低温',
    '其他',
  ];

  const quickLocations = [
    '随州市曾都区经济开发区',
    '随州高新区季梁大道8号',
    '随州市随县厉山镇神农现代产业园',
    '随州市广水市十里工业园',
  ];

  const quickPurposes = [
    '企业生产厂房屋面受极端强对流大风毁损，申请气象实况证明用于阳光财产保险定损。',
    '建筑工程施工项目因持续特大暴雨导致基坑积水停工，用于申请工期不可抗力免责证明。',
    '农业科技示范基地温室大棚受冰雹灾害穿透性破坏，申请政策性农业保险专项理赔。',
  ];

  // 表单状态
  const [unitName, setUnitName] = useState('');
  const [creditCode, setCreditCode] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [disasterType, setDisasterType] = useState<DisasterType>('大风');
  const [disasterDate, setDisasterDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 2);
    return d.toISOString().split('T')[0];
  });
  const [disasterLocation, setDisasterLocation] = useState('');
  const [purpose, setPurpose] = useState('');
  const [letterFile, setLetterFile] = useState<{
    name: string;
    size: string;
    url?: string;
  } | null>(null);
  const [letterRawFile, setLetterRawFile] = useState<File | null>(null);
  const [agreement, setAgreement] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitTip, setSubmitTip] = useState('正在提交申请并存入腾讯云开发数据库...');

  // 文件上传处理
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 格式检查
    const validExts = ['pdf', 'jpg', 'jpeg', 'png'];
    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
    if (!validExts.includes(fileExt)) {
      alert('请上传加盖公章的申请函（支持 PDF, JPG, PNG 格式）');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      alert('文件大小不能超过15MB');
      return;
    }

    const sizeStr =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${(file.size / 1024).toFixed(0)} KB`;

    setLetterRawFile(file);
    setLetterFile({
      name: file.name,
      size: sizeStr,
    });
    setErrors((prev) => ({ ...prev, file: '' }));
  };

  // 一键填入演示单位
  const handleFillDemo = () => {
    setUnitName('随州市神农现代生态农业科技有限公司');
    setCreditCode('91421300MA4898XX72');
    setContactName('陈建国');
    setPhone('13872887766');
    setDisasterType('大风');
    setDisasterLocation('随州市随县厉山镇神农现代农业示范园3号大棚基地');
    setPurpose(
      '现代农业示范园连栋智能化玻璃温室大棚遭受瞬时极大风毁损，申请气象权威数据用于人保财险政策性农业险理赔。'
    );
    setLetterRawFile(null);
    setLetterFile({
      name: '关于申请开具气象灾害实况证明的公函(盖章版).pdf',
      size: '2.4 MB',
      url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=60',
    });
    setErrors({});
  };

  // 提交至腾讯云开发 CloudBase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!unitName.trim()) {
      newErrors.unitName = '请输入单位全称（必填项）';
    }

    const codeCheck = validateCreditCode(creditCode);
    if (!codeCheck.valid) {
      newErrors.creditCode = codeCheck.message || '统一社会信用代码格式不正确（必填项）';
    }

    if (!contactName.trim()) {
      newErrors.contactName = '请输入单位联系人或经办人姓名（必填项）';
    }

    const phoneCheck = validatePhone(phone);
    if (!phoneCheck.valid) {
      newErrors.phone = phoneCheck.message || '联系电话格式不正确（必填项）';
    }

    if (!disasterLocation.trim()) {
      newErrors.location = '请输入灾害发生具体地点（必填项）';
    }

    if (!purpose.trim()) {
      newErrors.purpose = '请输入证明用途说明（必填项）';
    } else if (purpose.length > 200) {
      newErrors.purpose = '用途说明需在200字以内';
    }

    if (!letterFile) {
      newErrors.file = '请上传加盖单位公章的正式申请函件（支持PDF/JPG/PNG，必传项）';
    }

    if (!agreement) {
      newErrors.agreement = '请阅读并确认单位诚信申报承诺（必勾选）';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    setErrors({});
    setSubmitTip('正在将单位公函证明材料上传至腾讯云开发存储...');

    const uploadedCloudPaths: string[] = [];
    let letterCloudUrl = letterFile?.url;

    try {
      if (letterRawFile) {
        const res = await uploadToCloudStorage(
          letterRawFile,
          letterRawFile.name || 'unit_letter.pdf',
          'applications/unit_letters'
        );
        if (res.fileID) {
          uploadedCloudPaths.push(res.fileID);
          if (res.downloadUrl) letterCloudUrl = res.downloadUrl;
        }
      }

      setSubmitTip('材料上传完成，正在向腾讯云数据库 "applications" 集合写入申请记录...');

      const created = await createApplication(
        {
          type: 'unit',
          unitName: unitName.trim(),
          creditCode: creditCode.trim().toUpperCase(),
          contactName: contactName.trim(),
          phone: phone.trim(),
          disasterType,
          disasterDate,
          disasterLocation: disasterLocation.trim(),
          purpose: purpose.trim(),
          unitLetterFile: letterFile
            ? {
                name: letterFile.name,
                size: letterFile.size,
                url: letterCloudUrl || letterFile.url,
              }
            : undefined,
        },
        uploadedCloudPaths
      );

      setSubmitting(false);
      onSuccess(created);
    } catch (err) {
      console.error('单位申请提交异常:', err);
      // 降级使用基础创建
      const fallbackCreated = await createApplication({
        type: 'unit',
        unitName: unitName.trim(),
        creditCode: creditCode.trim().toUpperCase(),
        contactName: contactName.trim(),
        phone: phone.trim(),
        disasterType,
        disasterDate,
        disasterLocation: disasterLocation.trim(),
        purpose: purpose.trim(),
        unitLetterFile: letterFile || undefined,
      });
      setSubmitting(false);
      onSuccess(fallbackCreated);
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* 顶部返回导航与快捷填入 */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 text-xs font-medium cursor-pointer transition-colors"
        >
          <span>←</span>
          <span>返回办事指南首页</span>
        </button>
        <button
          type="button"
          onClick={handleFillDemo}
          className="text-xs bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg font-medium flex items-center space-x-1 border border-slate-200 hover:border-slate-300 shadow-xs transition-colors cursor-pointer"
          title="快速填入合规单位数据"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>填入示例数据</span>
        </button>
      </div>

      {/* 头部卡片 */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800">
              单位申请表单
            </h2>
            <p className="text-xs text-slate-400">
              法人单位灾害核实、工期延误、涉水涉灾证明
            </p>
          </div>
        </div>
      </div>

      {/* 主表单 */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 单位主体信息 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-blue-900 flex items-center space-x-2 border-b border-slate-100 pb-2.5">
            <span className="w-1 h-4 bg-blue-600 rounded"></span>
            <span>单位及经办人信息</span>
          </h3>

          {/* 单位名称 */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              单位名称 <span className="text-rose-500">*</span>
            </label>
            <input
              id="unit-name-input"
              type="text"
              value={unitName}
              onChange={(e) => setUnitName(e.target.value)}
              placeholder="请输入工商登记或事业单位法人证书上的全称"
              className={`w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border ${
                errors.unitName
                  ? 'border-rose-400 bg-rose-50/30'
                  : 'border-slate-200'
              } focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all`}
            />
            {errors.unitName && (
              <p className="text-[11px] text-rose-500 mt-1 flex items-center space-x-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.unitName}</span>
              </p>
            )}
          </div>

          {/* 统一社会信用代码 */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              统一社会信用代码 <span className="text-rose-500">*</span>
              <span className="text-slate-400 font-normal ml-1 lowercase">
                （18位统一代码，字母及数字）
              </span>
            </label>
            <input
              id="unit-creditcode-input"
              type="text"
              maxLength={18}
              value={creditCode}
              onChange={(e) => setCreditCode(e.target.value.toUpperCase())}
              placeholder="如：91421300MA4898XX72"
              className={`w-full font-mono text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border ${
                errors.creditCode
                  ? 'border-rose-400 bg-rose-50/30'
                  : 'border-slate-200'
              } focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all`}
            />
            {errors.creditCode && (
              <p className="text-[11px] text-rose-500 mt-1 flex items-center space-x-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.creditCode}</span>
              </p>
            )}
          </div>

          {/* 联系人姓名 & 电话 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                联系人姓名 <span className="text-rose-500">*</span>
              </label>
              <input
                id="unit-contact-input"
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="单位指定经办人姓名"
                className={`w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border ${
                  errors.contactName
                    ? 'border-rose-400 bg-rose-50/30'
                    : 'border-slate-300'
                } focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all`}
              />
              {errors.contactName && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.contactName}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                联系电话 <span className="text-rose-500">*</span>
              </label>
              <input
                id="unit-phone-input"
                type="tel"
                maxLength={11}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="11位手机号码"
                className={`w-full font-mono text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border ${
                  errors.phone
                    ? 'border-rose-400 bg-rose-50/30'
                    : 'border-slate-300'
                } focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all`}
              />
              {errors.phone && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.phone}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 灾害申报情况 */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2 border-b border-slate-100 pb-2.5">
            <span className="w-2 h-4 bg-indigo-600 rounded-sm"></span>
            <span>气象灾害事实申报</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 气象灾害类型 */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                气象灾害类型 <span className="text-rose-500">*</span>
              </label>
              <select
                id="unit-disaster-select"
                value={disasterType}
                onChange={(e) => setDisasterType(e.target.value as DisasterType)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all font-medium text-slate-800"
              >
                {disasterOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* 灾害发生日期 */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                灾害发生日期 <span className="text-rose-500">*</span>
              </label>
              <input
                id="unit-date-input"
                type="date"
                max={new Date().toISOString().split('T')[0]}
                value={disasterDate}
                onChange={(e) => setDisasterDate(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800"
              />
            </div>
          </div>

          {/* 灾害发生地点 */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              灾害发生地点 <span className="text-rose-500">*</span>
            </label>
            <input
              id="unit-location-input"
              type="text"
              value={disasterLocation}
              onChange={(e) => setDisasterLocation(e.target.value)}
              placeholder="如：随州市曾都区经济开发区淅河大道88号项目工地"
              className={`w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border ${
                errors.location
                  ? 'border-rose-400 bg-rose-50/30'
                  : 'border-slate-300'
              } focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all`}
            />
            {errors.location && (
              <p className="text-[11px] text-rose-500 mt-1 flex items-center space-x-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.location}</span>
              </p>
            )}

            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[11px] text-slate-400 self-center">
                随州工业园快捷：
              </span>
              {quickLocations.map((loc) => (
                <button
                  type="button"
                  key={loc}
                  onClick={() => setDisasterLocation(loc)}
                  className="text-[10px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 px-2 py-0.5 rounded-md transition-colors"
                >
                  {loc.replace('随州市', '')}
                </button>
              ))}
            </div>
          </div>

          {/* 用途说明（200字以内） */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                用途说明 <span className="text-rose-500">*</span>
              </label>
              <span
                className={`text-[11px] font-mono ${
                  purpose.length > 200 ? 'text-rose-500 font-bold' : 'text-slate-400'
                }`}
              >
                {purpose.length}/200字
              </span>
            </div>
            <textarea
              id="unit-purpose-input"
              rows={3}
              maxLength={200}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="请明确说明用于企业财产定损、建筑工程工期延误核验、诉讼纠纷等具体用途"
              className={`w-full text-xs sm:text-sm p-3 rounded-xl border ${
                errors.purpose
                  ? 'border-rose-400 bg-rose-50/30'
                  : 'border-slate-300'
              } focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all resize-none`}
            />
            {errors.purpose && (
              <p className="text-[11px] text-rose-500 mt-1 flex items-center space-x-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.purpose}</span>
              </p>
            )}

            <div className="space-y-1 mt-1.5">
              <span className="text-[10px] text-slate-400">常见单位用途参考：</span>
              <div className="flex flex-wrap gap-1.5">
                {quickPurposes.map((p, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setPurpose(p)}
                    className="text-[10px] text-left bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 p-1.5 rounded-lg border border-slate-200 transition-colors"
                  >
                    {p.slice(0, 24)}...
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 上传加盖公章的申请函（题目要求：上传加盖公章的申请函，支持PDF/JPG/PNG） */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2 border-b border-slate-100 pb-2.5">
            <span className="w-2 h-4 bg-indigo-600 rounded-sm"></span>
            <span>上传加盖公章的申请函件</span>
          </h3>
          <p className="text-xs text-slate-500">
            请上传由本单位出具并加盖鲜红印章的正式申请报告/公函（支持 PDF、JPG、PNG 格式，大小不超过15MB）
          </p>

          {letterFile ? (
            <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900">
                    {letterFile.name}
                  </p>
                  <p className="text-[11px] text-indigo-700 mt-0.5">
                    文件大小：{letterFile.size} · 已成功载入
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLetterFile(null)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="删除重选"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-indigo-200 hover:border-indigo-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-indigo-50/30 transition-colors">
              <Paperclip className="w-8 h-8 text-indigo-600 mb-2" />
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                点击选择或拖拽文件上传加盖公章函件
              </span>
              <span className="text-[11px] text-slate-500 mt-1">
                支持格式：PDF、JPG、PNG（红章清晰可辨）
              </span>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          )}

          {errors.file && (
            <p className="text-[11px] text-rose-500 flex items-center space-x-1">
              <AlertCircle className="w-3 h-3" />
              <span>{errors.file}</span>
            </p>
          )}
        </div>

        {/* 诚信承诺 */}
        <div className="bg-indigo-50/60 border border-indigo-200 rounded-xl p-3.5 space-y-2">
          <label className="flex items-start space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={agreement}
              onChange={(e) => setAgreement(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
            />
            <span className="text-xs text-slate-700 leading-relaxed">
              本单位在此声明：申报的灾害事实、单位公章及证明用途真实有效。本单位承诺如实使用随州市气象局所出具的权威证明，不得用于虚报冒领、骗保骗补等违法违规行为。
            </span>
          </label>
          {errors.agreement && (
            <p className="text-[11px] text-rose-500 flex items-center space-x-1 pl-6">
              <AlertCircle className="w-3 h-3" />
              <span>{errors.agreement}</span>
            </p>
          )}
        </div>

        {/* 提交按钮与取消 */}
        <div className="flex items-center space-x-3 pt-3">
          <button
            type="button"
            onClick={onCancel}
            className="w-1/3 py-3 px-4 rounded-lg border border-slate-200 text-slate-600 font-medium text-xs sm:text-sm hover:bg-slate-50 transition-colors cursor-pointer"
          >
            返回首页
          </button>
          <button
            id="btn-submit-unit-form"
            type="submit"
            disabled={submitting}
            className="w-2/3 py-3 px-4 rounded-lg bg-[#003366] hover:bg-[#00274d] text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-900/20 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0"></span>
                <span className="truncate text-xs">{submitTip}</span>
              </>
            ) : (
              <>
                <FileCheck className="w-4 h-4" />
                <span>确认并提交申请</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
