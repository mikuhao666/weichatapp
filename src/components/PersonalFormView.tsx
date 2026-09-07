import React, { useState } from 'react';
import {
  UserCheck,
  Upload,
  AlertCircle,
  CheckCircle2,
  Calendar,
  MapPin,
  FileText,
  ShieldCheck,
  X,
  Sparkles,
  ArrowRight,
  Eye,
  Camera,
  Send,
  Trash2,
  ZoomIn,
} from 'lucide-react';
import { DisasterType, ApplicationRecord } from '../types';
import {
  validateIdCard,
  validatePhone,
  createApplication,
} from '../utils/storage';
import { uploadToCloudStorage, dataURLtoBlob } from '../utils/cloudbase';

interface PersonalFormViewProps {
  onSuccess: (record: ApplicationRecord) => void;
  onCancel: () => void;
}

export const PersonalFormView: React.FC<PersonalFormViewProps> = ({
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
    '随州市曾都区东城街道',
    '随州市曾都区白云湖西路',
    '随州市随县厉山镇',
    '随州市广水市应山街道',
    '随州高新技术产业开发区',
  ];

  const quickPurposes = [
    '用于居民家庭财产因暴雨内涝受损，向中国人保申请车损与财产理赔凭证。',
    '用于农业大棚受强风毁损，向中华联合财险申报农业灾害赔付。',
    '用于家用电器遭遇雷击故障，向保险机构出具法定气象实况证明。',
  ];

  // 表单状态
  const [applicantName, setApplicantName] = useState('');
  const [idCardNumber, setIdCardNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [disasterType, setDisasterType] = useState<DisasterType>('暴雨');
  const [disasterDate, setDisasterDate] = useState(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  });
  const [disasterLocation, setDisasterLocation] = useState('');
  const [purpose, setPurpose] = useState('');
  const [idCardFrontImage, setIdCardFrontImage] = useState<string>('');
  const [idCardBackImage, setIdCardBackImage] = useState<string>('');
  const [frontRawFile, setFrontRawFile] = useState<File | null>(null);
  const [backRawFile, setBackRawFile] = useState<File | null>(null);
  const [agreement, setAgreement] = useState(true);

  // 缩略图大图弹窗预览
  const [previewModalImage, setPreviewModalImage] = useState<{
    src: string;
    title: string;
  } | null>(null);

  // 错误提示状态
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitTip, setSubmitTip] = useState('正在提交申请并存入腾讯云开发数据库...');

  // 身份证输入与实时格式校验
  const handleIdCardChange = (val: string) => {
    const upper = val.toUpperCase().replace(/[^0-9X]/g, '').slice(0, 18);
    setIdCardNumber(upper);
    if (upper.length === 18) {
      const check = validateIdCard(upper);
      if (!check.valid) {
        setErrors((prev) => ({
          ...prev,
          idCard: check.message || '身份证号格式不对，请输入标准的18位有效公民身份证号码',
        }));
      } else {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.idCard;
          return next;
        });
      }
    } else if (errors.idCard) {
      setErrors((prev) => ({
        ...prev,
        idCard: `身份证号格式不对：须输入完整的18位字符（当前已输入 ${upper.length} 位）`,
      }));
    }
  };

  const handleIdCardBlur = () => {
    if (!idCardNumber.trim()) {
      setErrors((prev) => ({
        ...prev,
        idCard: '身份证号不能为空，请输入18位公民身份证号码',
      }));
      return;
    }
    const check = validateIdCard(idCardNumber);
    if (!check.valid) {
      setErrors((prev) => ({
        ...prev,
        idCard: check.message || '身份证号格式不对，请输入标准的18位有效公民身份证号码',
      }));
    } else {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.idCard;
        return next;
      });
    }
  };

  // 处理图片文件上传读取
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    side: 'front' | 'back'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请选择JPG或PNG格式的图片文件');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert('图片大小不能超过8MB');
      return;
    }

    if (side === 'front') {
      setFrontRawFile(file);
    } else {
      setBackRawFile(file);
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (side === 'front') {
        setIdCardFrontImage(result);
        setErrors((prev) => ({ ...prev, front: '' }));
      } else {
        setIdCardBackImage(result);
        setErrors((prev) => ({ ...prev, back: '' }));
      }
    };
    reader.readAsDataURL(file);
  };

  // 一键填入演示样例数据
  const handleFillDemo = () => {
    setApplicantName('周建华');
    setIdCardNumber('421302198908182216');
    setPhone('13677218899');
    setDisasterType('暴雨');
    setDisasterLocation('随州市曾都区南郊街道黄鸡楼村二组');
    setPurpose(
      '因强暴雨导致自建平房后院地质滑坡及杂物间积水受损，用于中华财险农村住房保险理赔查勘。'
    );
    // 简易示例证件占位
    setIdCardFrontImage(
      'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=60'
    );
    setIdCardBackImage(
      'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=60'
    );
    setFrontRawFile(null);
    setBackRawFile(null);
    setErrors({});
  };

  // 表单校验与提交至腾讯云开发 CloudBase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!applicantName.trim()) {
      newErrors.name = '请输入申请人真实姓名（必填项）';
    }

    const idCheck = validateIdCard(idCardNumber);
    if (!idCheck.valid) {
      newErrors.idCard = idCheck.message || '身份证号无效（必填项）';
    }

    const phoneCheck = validatePhone(phone);
    if (!phoneCheck.valid) {
      newErrors.phone = phoneCheck.message || '手机号无效（必填项）';
    }

    if (!disasterLocation.trim()) {
      newErrors.location = '请输入灾害发生具体地点（必填项）';
    }

    if (!purpose.trim()) {
      newErrors.purpose = '请输入证明用途说明（必填项）';
    } else if (purpose.length > 200) {
      newErrors.purpose = '用途说明需在200字以内';
    }

    if (!idCardFrontImage) {
      newErrors.front = '请上传身份证人像面照片（必填项）';
    }

    if (!idCardBackImage) {
      newErrors.back = '请上传身份证国徽面照片（必填项）';
    }

    if (!agreement) {
      newErrors.agreement = '请阅读并勾选承诺声明（必勾选）';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // 滚动到顶部提示
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    setErrors({});
    setSubmitTip('正在将申报材料上传至腾讯云开发存储...');

    const uploadedCloudPaths: string[] = [];
    let frontCloudUrl = idCardFrontImage;
    let backCloudUrl = idCardBackImage;

    try {
      // 1. 上传身份证正面至云存储
      if (frontRawFile) {
        const res = await uploadToCloudStorage(frontRawFile, frontRawFile.name || 'idcard_front.jpg');
        if (res.fileID) {
          uploadedCloudPaths.push(res.fileID);
          if (res.downloadUrl) frontCloudUrl = res.downloadUrl;
        }
      } else if (idCardFrontImage.startsWith('data:')) {
        const blob = dataURLtoBlob(idCardFrontImage);
        const res = await uploadToCloudStorage(blob, 'idcard_front.jpg');
        if (res.fileID) {
          uploadedCloudPaths.push(res.fileID);
          if (res.downloadUrl) frontCloudUrl = res.downloadUrl;
        }
      }

      // 2. 上传身份证反面至云存储
      if (backRawFile) {
        const res = await uploadToCloudStorage(backRawFile, backRawFile.name || 'idcard_back.jpg');
        if (res.fileID) {
          uploadedCloudPaths.push(res.fileID);
          if (res.downloadUrl) backCloudUrl = res.downloadUrl;
        }
      } else if (idCardBackImage.startsWith('data:')) {
        const blob = dataURLtoBlob(idCardBackImage);
        const res = await uploadToCloudStorage(blob, 'idcard_back.jpg');
        if (res.fileID) {
          uploadedCloudPaths.push(res.fileID);
          if (res.downloadUrl) backCloudUrl = res.downloadUrl;
        }
      }

      setSubmitTip('材料上传完成，正在向腾讯云数据库 "applications" 集合写入申请记录...');

      // 3. 提交至云数据库并生成申请编号
      const created = await createApplication(
        {
          type: 'personal',
          applicantName: applicantName.trim(),
          idCardNumber: idCardNumber.trim().toUpperCase(),
          phone: phone.trim(),
          disasterType,
          disasterDate,
          disasterLocation: disasterLocation.trim(),
          purpose: purpose.trim(),
          idCardFrontImage: frontCloudUrl,
          idCardBackImage: backCloudUrl,
        },
        uploadedCloudPaths
      );

      setSubmitting(false);
      onSuccess(created);
    } catch (err) {
      console.error('个人申请提交异常:', err);
      // 降级使用基础创建
      const fallbackCreated = await createApplication({
        type: 'personal',
        applicantName: applicantName.trim(),
        idCardNumber: idCardNumber.trim().toUpperCase(),
        phone: phone.trim(),
        disasterType,
        disasterDate,
        disasterLocation: disasterLocation.trim(),
        purpose: purpose.trim(),
        idCardFrontImage,
        idCardBackImage,
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
          className="text-xs bg-white hover:bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-medium flex items-center space-x-1 border border-slate-200 hover:border-blue-300 shadow-xs transition-colors cursor-pointer"
          title="快速填入合规模拟数据，方便即刻测试"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>填入示例数据</span>
        </button>
      </div>

      {/* 标题卡片 */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800">
              个人申请表单
            </h2>
            <p className="text-xs text-slate-400">
              随州市辖区个人气象灾害实况证明申请
            </p>
          </div>
        </div>
      </div>

      {/* 主表单 */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 基本身份信息 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-blue-900 flex items-center space-x-2 border-b border-slate-100 pb-2.5">
            <span className="w-1 h-4 bg-blue-600 rounded"></span>
            <span>申请人基本信息</span>
          </h3>

          {/* 姓名 */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              申请人姓名 <span className="text-rose-500">*</span>
            </label>
            <input
              id="personal-name-input"
              type="text"
              value={applicantName}
              onChange={(e) => setApplicantName(e.target.value)}
              placeholder="请输入与身份证一致的姓名"
              className={`w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border ${
                errors.name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              } focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all`}
            />
            {errors.name && (
              <p className="text-[11px] text-rose-500 mt-1 flex items-center space-x-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.name}</span>
              </p>
            )}
          </div>

          {/* 身份证号 */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              身份证号 <span className="text-rose-500">*</span>
              <span className="text-slate-400 font-normal ml-1 lowercase">
                （18位公民身份证号码）
              </span>
            </label>
            <input
              id="personal-idcard-input"
              type="text"
              maxLength={18}
              value={idCardNumber}
              onChange={(e) => handleIdCardChange(e.target.value)}
              onBlur={handleIdCardBlur}
              placeholder="请输入18位身份证号码"
              className={`w-full font-mono text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border ${
                errors.idCard
                  ? 'border-rose-500 bg-rose-50/50 text-rose-900 focus:border-rose-600 focus:ring-1 focus:ring-rose-500'
                  : 'border-slate-200'
              } focus:outline-hidden focus:border-[#003366] focus:ring-1 focus:ring-[#003366] transition-all`}
            />
            {errors.idCard && (
              <div className="text-xs text-rose-600 font-medium mt-1.5 flex items-center space-x-1.5 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errors.idCard}</span>
              </div>
            )}
          </div>

          {/* 联系电话 */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              联系电话 <span className="text-rose-500">*</span>
              <span className="text-slate-400 font-normal ml-1 lowercase">
                （用于接收办理进度短信）
              </span>
            </label>
            <input
              id="personal-phone-input"
              type="tel"
              maxLength={11}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="请输入11位手机号码"
              className={`w-full font-mono text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border ${
                errors.phone ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              } focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all`}
            />
            {errors.phone && (
              <p className="text-[11px] text-rose-500 mt-1 flex items-center space-x-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.phone}</span>
              </p>
            )}
          </div>
        </div>

        {/* 灾害情况信息 */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2 border-b border-slate-100 pb-2.5">
            <span className="w-2 h-4 bg-blue-600 rounded-sm"></span>
            <span>气象灾害申报详情</span>
          </h3>

          {/* 气象灾害类型 */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              气象灾害类型 <span className="text-rose-500">*</span>
            </label>
            <select
              id="personal-disaster-select"
              value={disasterType}
              onChange={(e) => setDisasterType(e.target.value as DisasterType)}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-800"
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
            <div className="relative">
              <input
                id="personal-date-input"
                type="date"
                max={new Date().toISOString().split('T')[0]}
                value={disasterDate}
                onChange={(e) => setDisasterDate(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-slate-800"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              请选择灾害性天气发生的准确日期（用于比对气象历史数据）
            </p>
          </div>

          {/* 灾害发生地点 */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              灾害发生地点 <span className="text-rose-500">*</span>
            </label>
            <input
              id="personal-location-input"
              type="text"
              value={disasterLocation}
              onChange={(e) => setDisasterLocation(e.target.value)}
              placeholder="如：随州市曾都区白云湖西路香城花园3栋"
              className={`w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border ${
                errors.location
                  ? 'border-rose-400 bg-rose-50/30'
                  : 'border-slate-300'
              } focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all`}
            />
            {errors.location && (
              <p className="text-[11px] text-rose-500 mt-1 flex items-center space-x-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.location}</span>
              </p>
            )}

            {/* 随州辖区快捷填充标签 */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[11px] text-slate-400 self-center">
                随州快捷：
              </span>
              {quickLocations.map((loc) => (
                <button
                  type="button"
                  key={loc}
                  onClick={() => setDisasterLocation(loc)}
                  className="text-[10px] bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 px-2 py-0.5 rounded-md transition-colors"
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
              id="personal-purpose-input"
              rows={3}
              maxLength={200}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="请简述开具气象证明的具体用途（如：用于向保险公司报案理赔地下室积水货物损失）"
              className={`w-full text-xs sm:text-sm p-3 rounded-xl border ${
                errors.purpose
                  ? 'border-rose-400 bg-rose-50/30'
                  : 'border-slate-300'
              } focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all resize-none`}
            />
            {errors.purpose && (
              <p className="text-[11px] text-rose-500 mt-1 flex items-center space-x-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.purpose}</span>
              </p>
            )}

            {/* 快捷理由 */}
            <div className="space-y-1 mt-1.5">
              <span className="text-[10px] text-slate-400">常见用途参考：</span>
              <div className="flex flex-wrap gap-1.5">
                {quickPurposes.map((p, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setPurpose(p)}
                    className="text-[10px] text-left bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-600 p-1.5 rounded-lg border border-slate-200 transition-colors"
                  >
                    {p.slice(0, 24)}...
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 证件材料上传（身份证正面/反面 缩略图预览及管理） */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-sm font-bold text-[#003366] flex items-center space-x-2">
              <span className="w-1.5 h-4 bg-[#003366] rounded-xs"></span>
              <span>上传身份证照片（附缩略图预览）</span>
            </h3>
            <span className="text-[11px] text-slate-400">
              支持手机拍照 / 本地相册
            </span>
          </div>

          <p className="text-xs text-slate-500">
            请上传申请人清晰、完整、无反光遮挡的二代居民身份证原件正反面，系统将在上传后自动生成缩略图供您核验。
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 身份证正面 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  身份证正面（人像面）<span className="text-rose-500">*</span>
                </label>
                {idCardFrontImage && (
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                    缩略图已生成
                  </span>
                )}
              </div>

              {idCardFrontImage ? (
                /* 缩略图预览卡片 */
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center space-x-3 transition-all hover:border-blue-300">
                  <div
                    onClick={() =>
                      setPreviewModalImage({
                        src: idCardFrontImage,
                        title: '身份证正面（人像面）大图核验',
                      })
                    }
                    className="relative w-24 h-16 sm:w-28 sm:h-20 bg-slate-200 rounded-lg overflow-hidden border border-slate-300 shrink-0 cursor-pointer group shadow-xs"
                    title="点击放大查看大图"
                  >
                    <img
                      src={idCardFrontImage}
                      alt="身份证正面缩略图"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <ZoomIn className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      人像面照片预览
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewModalImage({
                          src: idCardFrontImage,
                          title: '身份证正面（人像面）大图核验',
                        })
                      }
                      className="text-[11px] text-[#003366] hover:underline flex items-center space-x-1 font-medium cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>点击放大查看</span>
                    </button>
                    <div className="flex items-center space-x-2 pt-1">
                      <label className="text-[11px] text-[#003366] hover:text-blue-800 font-semibold cursor-pointer flex items-center space-x-1">
                        <Upload className="w-3 h-3" />
                        <span>更换</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'front')}
                        />
                      </label>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => setIdCardFrontImage('')}
                        className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold cursor-pointer flex items-center space-x-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>删除</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* 上传未完成状态 */
                <label className="border-2 border-dashed border-slate-300 hover:border-[#003366] rounded-xl h-32 flex flex-col items-center justify-center p-3 cursor-pointer bg-slate-50 hover:bg-blue-50/30 transition-all">
                  <Camera className="w-6 h-6 text-[#003366] mb-1.5" />
                  <span className="text-xs font-medium text-slate-700">
                    点击上传身份证人像面照片
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    上传后系统自动生成缩略图预览
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'front')}
                  />
                </label>
              )}

              {errors.front && (
                <div className="text-xs text-rose-600 font-medium mt-1 flex items-center space-x-1 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.front}</span>
                </div>
              )}
            </div>

            {/* 身份证反面 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  身份证反面（国徽面）<span className="text-rose-500">*</span>
                </label>
                {idCardBackImage && (
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                    缩略图已生成
                  </span>
                )}
              </div>

              {idCardBackImage ? (
                /* 缩略图预览卡片 */
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center space-x-3 transition-all hover:border-blue-300">
                  <div
                    onClick={() =>
                      setPreviewModalImage({
                        src: idCardBackImage,
                        title: '身份证反面（国徽面）大图核验',
                      })
                    }
                    className="relative w-24 h-16 sm:w-28 sm:h-20 bg-slate-200 rounded-lg overflow-hidden border border-slate-300 shrink-0 cursor-pointer group shadow-xs"
                    title="点击放大查看大图"
                  >
                    <img
                      src={idCardBackImage}
                      alt="身份证反面缩略图"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <ZoomIn className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      国徽面照片预览
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewModalImage({
                          src: idCardBackImage,
                          title: '身份证反面（国徽面）大图核验',
                        })
                      }
                      className="text-[11px] text-[#003366] hover:underline flex items-center space-x-1 font-medium cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>点击放大查看</span>
                    </button>
                    <div className="flex items-center space-x-2 pt-1">
                      <label className="text-[11px] text-[#003366] hover:text-blue-800 font-semibold cursor-pointer flex items-center space-x-1">
                        <Upload className="w-3 h-3" />
                        <span>更换</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'back')}
                        />
                      </label>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => setIdCardBackImage('')}
                        className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold cursor-pointer flex items-center space-x-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>删除</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* 上传未完成状态 */
                <label className="border-2 border-dashed border-slate-300 hover:border-[#003366] rounded-xl h-32 flex flex-col items-center justify-center p-3 cursor-pointer bg-slate-50 hover:bg-blue-50/30 transition-all">
                  <Camera className="w-6 h-6 text-[#003366] mb-1.5" />
                  <span className="text-xs font-medium text-slate-700">
                    点击上传身份证国徽面照片
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    上传后系统自动生成缩略图预览
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'back')}
                  />
                </label>
              )}

              {errors.back && (
                <div className="text-xs text-rose-600 font-medium mt-1 flex items-center space-x-1 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.back}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 诚信承诺 */}
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3.5 space-y-2">
          <label className="flex items-start space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={agreement}
              onChange={(e) => setAgreement(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-[#003366] focus:ring-[#003366] border-slate-300"
            />
            <span className="text-xs text-slate-700 leading-relaxed">
              本人郑重承诺：上述所填写的姓名、身份证号、受灾时间地点与受灾用途真实可靠，所附证件属实。如因提供虚假材料造成不良法律后果，愿承担全部法律责任。
            </span>
          </label>
          {errors.agreement && (
            <p className="text-[11px] text-rose-600 font-medium flex items-center space-x-1 pl-6">
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
            id="btn-submit-personal-form"
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
                <Send className="w-4 h-4" />
                <span>确认并提交申请</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* 图片全屏缩略图预览模态框 */}
      {previewModalImage && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#003366] text-white px-4 py-3 flex items-center justify-between">
              <span className="font-bold text-xs sm:text-sm">
                {previewModalImage.title}
              </span>
              <button
                type="button"
                onClick={() => setPreviewModalImage(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-slate-100 flex items-center justify-center max-h-[70vh] overflow-auto">
              <img
                src={previewModalImage.src}
                alt={previewModalImage.title}
                className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-md border border-slate-300"
              />
            </div>
            <div className="p-3 bg-white text-right border-t border-slate-200">
              <button
                type="button"
                onClick={() => setPreviewModalImage(null)}
                className="px-4 py-2 bg-[#003366] text-white rounded-lg text-xs font-bold hover:bg-[#00274d] transition-colors cursor-pointer"
              >
                关闭预览
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
