import { ApplicationRecord, ApplicationStatus, DisasterType, AuditLog } from '../types';
import {
  saveApplicationToCloud,
  queryApplicationsFromCloud,
  updateApplicationStatusInCloud,
} from './cloudbase';

const STORAGE_KEY = 'suizhou_qxj_applications_v2';

// 步骤配置（题目要求的7个办理状态）
export const STATUS_STEPS: { key: ApplicationStatus; label: string; desc: string }[] = [
  { key: 'SUBMITTED', label: '已提交', desc: '申请人线上提交材料' },
  { key: 'ACCEPTED', label: '受理中', desc: '政务窗口核验申报材料' },
  { key: 'PREPARING', label: '证明开具中', desc: '气象台比对国家站观测数据' },
  { key: 'PENDING_AUDIT', label: '待审批', desc: '业务科室负责人审核签发' },
  { key: 'APPROVED', label: '审批通过', desc: '系统加盖气象证明电子印章' },
  { key: 'AWAITING_PICKUP', label: '待领取', desc: '电子证明已生成，支持下载' },
  { key: 'COMPLETED', label: '已完成', desc: '证明已成功发放并归档' },
];

// 身份证校验（18位格式与校验码算法）
export function validateIdCard(id: string): { valid: boolean; message?: string } {
  const trimmed = id.trim().toUpperCase();
  if (!trimmed) {
    return { valid: false, message: '请输入身份证号' };
  }
  if (trimmed.length !== 18) {
    return {
      valid: false,
      message: `身份证号位数不对（应为18位，当前已输入 ${trimmed.length} 位）`,
    };
  }
  const reg = /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dX]$/;
  if (!reg.test(trimmed)) {
    return {
      valid: false,
      message: '身份证号格式不对，请输入标准的18位有效公民身份证号码',
    };
  }
  // 校验码计算
  const factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const parity = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += parseInt(trimmed.charAt(i), 10) * factor[i];
  }
  const checkCode = parity[sum % 11];
  if (trimmed.charAt(17) !== checkCode) {
    return {
      valid: false,
      message: `身份证号末位校验码错误（输入为 ${trimmed.charAt(17)}，计算应为 ${checkCode}）`,
    };
  }
  return { valid: true };
}

// 手机号码校验（11位数字）
export function validatePhone(phone: string): { valid: boolean; message?: string } {
  const trimmed = phone.trim();
  if (!trimmed) {
    return { valid: false, message: '请输入联系电话' };
  }
  const reg = /^1[3-9]\d{9}$/;
  if (!reg.test(trimmed)) {
    return { valid: false, message: '请输入正确的11位中国大陆手机号码' };
  }
  return { valid: true };
}

// 统一社会信用代码校验（18位）
export function validateCreditCode(code: string): { valid: boolean; message?: string } {
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) {
    return { valid: false, message: '请输入统一社会信用代码' };
  }
  const reg = /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/;
  if (!reg.test(trimmed)) {
    return { valid: false, message: '统一社会信用代码格式不正确（18位规范代码）' };
  }
  return { valid: true };
}

// 随州市气象观测模拟数据生成器
export function generateObservationData(disasterType: DisasterType, date: string, location: string) {
  let station = '随州市国家气象观测站 (站号: 57381)';
  if (location.includes('广水')) {
    station = '广水市国家气象观测站 (站号: 57382)';
  } else if (location.includes('随县') || location.includes('厉山')) {
    station = '随县高新区域气象监测站 (站号: Y7385)';
  }

  let extremeValues = '';
  let conclusion = '';

  switch (disasterType) {
    case '暴雨':
      extremeValues = '当日08:00至次日08:00过程累计降水量达到 108.4 mm（暴雨量级），其中最大小时雨强为 42.6 mm/h（发生在16:20-17:20）。';
      conclusion = `经查验气象台实况数据，${date}该区域确有短时强降水及暴雨天气发生，达到气象灾害认定标准。`;
      break;
    case '大风':
      extremeValues = '当日观测站测得瞬时极大风速达 21.8 m/s（相当于9级烈风），极大风向为西北偏北（NNW）。';
      conclusion = `经查验，${date}受强对流云团过境影响，受灾地点出现强阵风，极大风力达9级，符合强对流大风特征。`;
      break;
    case '雷电':
      extremeValues = '随州市闪电定位系统当日记录该区域地闪频次 146 次，平均雷电流幅值为 -38.2 kA，峰值达 -62.4 kA。';
      conclusion = `经查验，${date}受影响区域发生强烈雷电活动，雷电密度处于高风险区间，存在雷击事实。`;
      break;
    case '冰雹':
      extremeValues = '气象多普勒雷达探测显示强对流反射率因子达 62 dBZ，人工防雹站及巡查记录冰雹最大直径约 15-20 mm。';
      conclusion = `经查验，${date}该局地伴随短时局地降雹过程，地面灾情调查与雷达回波特征吻合。`;
      break;
    case '暴雪':
      extremeValues = '24小时新增积雪深度 14 cm，降雪量累计达 12.8 mm（达暴雪等级），最低气温 -5.6 ℃。';
      conclusion = `经查验，${date}该区域出现大范围强降雪与道路结冰天气，属于气象灾害认定范畴。`;
      break;
    case '高温':
      extremeValues = '当日国家站日最高气温达 39.8 ℃（达到红色高温预警标准），地表最高温度达 64.2 ℃。';
      conclusion = `经查验，${date}受副热带高压持续控制，出现极端高温热浪天气。`;
      break;
    case '低温':
      extremeValues = '极端最低气温降至 -8.4 ℃，持续低温霜冻日数达3天，伴有严重低温凝冻。';
      conclusion = `经查验，${date}强寒潮天气席卷当地，达到严重农业气象低温冻害标准。`;
      break;
    default:
      extremeValues = '气象观测要素显示该区域遭遇灾害性局地异常天气变化，现场气象要素明显偏离常年同期水平。';
      conclusion = `经气象技术人员现场复核与雷达实况反演，认定${date}该区域存在突发性气象灾害事实。`;
  }

  return {
    stationName: station,
    stationId: station.match(/\d+/)?.[0] || '57381',
    date,
    disasterType,
    extremeValues,
    conclusion,
  };
}

// 预设样例数据
const DEFAULT_APPLICATIONS: ApplicationRecord[] = [
  {
    id: 'QX202609078821',
    type: 'personal',
    createdAt: '2026-09-07 09:30:15',
    status: 'APPROVED',
    applicantName: '张明远',
    idCardNumber: '421302198806151234',
    phone: '13872886699',
    disasterType: '暴雨',
    disasterDate: '2026-09-05',
    disasterLocation: '随州市曾都区白云湖西路香城花园3栋',
    purpose: '因暴雨积水导致家庭地下储藏室及家用车受损，用于中国人保财险理赔凭证',
    idCardFrontImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=60',
    idCardBackImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=60',
    certificateNo: '随气证字[2026]第0907-0038号',
    issueDate: '2026-09-07',
    observationData: generateObservationData('暴雨', '2026-09-05', '随州市曾都区白云湖西路'),
    logs: [
      {
        status: 'SUBMITTED',
        title: '申请材料已提交',
        timestamp: '2026-09-07 09:30:15',
        operator: '申请人本人',
        remark: '线上填报完成，身份证与申请信息无误',
      },
      {
        status: 'ACCEPTED',
        title: '政务服务窗口受理通过',
        timestamp: '2026-09-07 10:05:22',
        operator: '窗口受理员-王静',
        remark: '材料齐全符合法定受理条件，已转交气象台数据核验',
      },
      {
        status: 'PREPARING',
        title: '气象灾害实况数据比对完成',
        timestamp: '2026-09-07 11:20:45',
        operator: '气象台工程师-李建国',
        remark: '比对国家站57381历史实况及雷达记录，暴雨数据核对无误，草拟证明书',
      },
      {
        status: 'PENDING_AUDIT',
        title: '提交业务科室审批',
        timestamp: '2026-09-07 14:10:00',
        operator: '防灾减灾科',
        remark: '证明材料送科室负责人核验审核',
      },
      {
        status: 'APPROVED',
        title: '行政审批通过并签章',
        timestamp: '2026-09-07 15:45:10',
        operator: '主管局长-陈志强',
        remark: '同意开具证明，系统已自动加盖【随州市气象局气象证明专用章】',
      },
    ],
  },
  {
    id: 'QX202609066215',
    type: 'unit',
    createdAt: '2026-09-06 14:20:10',
    status: 'ACCEPTED',
    unitName: '随州市现代农业发展投资有限公司',
    creditCode: '91421300MA49XX889Q',
    contactName: '刘振海',
    phone: '13986445588',
    disasterType: '大风',
    disasterDate: '2026-09-04',
    disasterLocation: '随州市随县厉山镇神农现代农业产业园B区',
    purpose: '园区智能连栋大棚受强阵风吹毁，用于国家农业政策性保险核灾减灾理赔',
    unitLetterFile: {
      name: '关于申请气象灾害证明的公函(盖章).pdf',
      size: '1.8 MB',
    },
    logs: [
      {
        status: 'SUBMITTED',
        title: '单位申请材料提交',
        timestamp: '2026-09-06 14:20:10',
        operator: '刘振海（经办人）',
        remark: '上传加盖公章公函及统一社会信用代码信息',
      },
      {
        status: 'ACCEPTED',
        title: '窗口材料初审通过',
        timestamp: '2026-09-06 15:00:30',
        operator: '窗口审核员-张丽',
        remark: '单位资质与公函印章真实有效，进入气象观测比对程序',
      },
    ],
  },
];

// 读取所有存储申请
export function getApplications(): ApplicationRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_APPLICATIONS));
      return DEFAULT_APPLICATIONS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_APPLICATIONS));
      return DEFAULT_APPLICATIONS;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to read from localStorage:', err);
    return DEFAULT_APPLICATIONS;
  }
}

// 写入申请列表
export function saveApplications(apps: ApplicationRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

// 新增申请（支持写入腾讯云开发 CloudBase "applications" 集合及本地缓存）
export async function createApplication(
  data: Omit<ApplicationRecord, 'id' | 'createdAt' | 'status' | 'logs'>,
  filePathsList: string[] = []
): Promise<ApplicationRecord> {
  const apps = getApplications();
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const random4 = Math.floor(1000 + Math.random() * 9000);
  const id = `QX${yyyy}${mm}${dd}${random4}`;
  const timestamp = `${yyyy}-${mm}-${dd} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  const observation = generateObservationData(data.disasterType, data.disasterDate, data.disasterLocation);

  const newApp: ApplicationRecord = {
    ...data,
    id,
    createdAt: timestamp,
    status: 'SUBMITTED',
    certificateNo: `随气证字[${yyyy}]第${mm}${dd}-${random4}号`,
    issueDate: `${yyyy}-${mm}-${dd}`,
    observationData: observation,
    logs: [
      {
        status: 'SUBMITTED',
        title: '申请已成功在线提交',
        timestamp,
        operator: data.type === 'personal' ? (data.applicantName || '申请人') : (data.contactName || '单位经办人'),
        remark: '申报信息与证明材料已入库，排队进入政务服务大厅初审',
      },
    ],
  };

  // 1. 存入腾讯云开发 CloudBase 云数据库 "applications" 集合
  try {
    await saveApplicationToCloud(newApp, filePathsList);
  } catch (cloudErr) {
    console.warn('[CloudBase] 写入云数据库 applications 集合提示:', cloudErr);
  }

  // 2. 同时存入本地缓存，保证秒级响应与离线保障
  apps.unshift(newApp);
  saveApplications(apps);
  return newApp;
}

// 同步新增方法（保留向后兼容）
export function createApplicationSync(
  data: Omit<ApplicationRecord, 'id' | 'createdAt' | 'status' | 'logs'>,
  filePathsList: string[] = []
): ApplicationRecord {
  const apps = getApplications();
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const random4 = Math.floor(1000 + Math.random() * 9000);
  const id = `QX${yyyy}${mm}${dd}${random4}`;
  const timestamp = `${yyyy}-${mm}-${dd} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  const observation = generateObservationData(data.disasterType, data.disasterDate, data.disasterLocation);

  const newApp: ApplicationRecord = {
    ...data,
    id,
    createdAt: timestamp,
    status: 'SUBMITTED',
    certificateNo: `随气证字[${yyyy}]第${mm}${dd}-${random4}号`,
    issueDate: `${yyyy}-${mm}-${dd}`,
    observationData: observation,
    logs: [
      {
        status: 'SUBMITTED',
        title: '申请已成功在线提交',
        timestamp,
        operator: data.type === 'personal' ? (data.applicantName || '申请人') : (data.contactName || '单位经办人'),
        remark: '申报信息与证明材料已入库，排队进入政务服务大厅初审',
      },
    ],
  };

  // 异步触发云数据库存储
  saveApplicationToCloud(newApp, filePathsList).catch((err) => {
    console.warn('[CloudBase] 异步同步云数据库提示:', err);
  });

  apps.unshift(newApp);
  saveApplications(apps);
  return newApp;
}

// 异步从云数据库拉取所有申请记录
export async function fetchAllApplicationsAsync(): Promise<ApplicationRecord[]> {
  try {
    const cloudResults = await queryApplicationsFromCloud('');
    if (cloudResults && cloudResults.length > 0) {
      const local = getApplications();
      const map = new Map<string, ApplicationRecord>();
      cloudResults.forEach((item) => map.set(item.id, item));
      local.forEach((item) => {
        if (!map.has(item.id)) map.set(item.id, item);
      });
      const merged = Array.from(map.values());
      saveApplications(merged);
      return merged;
    }
  } catch (err) {
    console.warn('[CloudBase] 拉取云数据库数据提示:', err);
  }
  return getApplications();
}

// 异步根据申请编号或手机号从云数据库查询
export async function queryApplicationsAsync(queryText: string): Promise<ApplicationRecord[]> {
  const keyword = queryText.trim();
  if (!keyword) {
    return fetchAllApplicationsAsync();
  }

  try {
    // 优先从腾讯云开发 CloudBase "applications" 集合查询
    const cloudResults = await queryApplicationsFromCloud(keyword);
    if (cloudResults && cloudResults.length > 0) {
      console.log('[CloudBase] 成功从云数据库检索到匹配记录:', cloudResults);
      // 同步到本地缓存
      const local = getApplications();
      const map = new Map<string, ApplicationRecord>();
      cloudResults.forEach((item) => map.set(item.id, item));
      local.forEach((item) => {
        if (!map.has(item.id)) map.set(item.id, item);
      });
      saveApplications(Array.from(map.values()));
      return cloudResults;
    }
  } catch (err) {
    console.warn('[CloudBase] 异步查询云数据库异常，使用本地检索备用:', err);
  }

  // 降级回退本地缓存检索
  return queryApplications(keyword);
}

// 根据单号或手机号查找（本地检索方法）
export function queryApplications(queryText: string): ApplicationRecord[] {
  const keyword = queryText.trim().toLowerCase();
  if (!keyword) return getApplications();
  const apps = getApplications();
  return apps.filter((item) => {
    return (
      item.id.toLowerCase().includes(keyword) ||
      item.phone.includes(keyword) ||
      (item.applicantName && item.applicantName.toLowerCase().includes(keyword)) ||
      (item.unitName && item.unitName.toLowerCase().includes(keyword))
    );
  });
}

// 修改申请状态（用于演示切换，支持云端与本地同步）
export function updateApplicationStatus(id: string, newStatus: ApplicationStatus): ApplicationRecord | null {
  const apps = getApplications();
  const targetIndex = apps.findIndex((a) => a.id === id);
  if (targetIndex === -1) return null;

  const app = { ...apps[targetIndex] };
  const now = new Date();
  const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  const stepMeta = STATUS_STEPS.find((s) => s.key === newStatus);

  // 添加或覆盖log
  app.status = newStatus;
  const existingLogIndex = app.logs.findIndex((l) => l.status === newStatus);
  const newLog: AuditLog = {
    status: newStatus,
    title: stepMeta?.label || newStatus,
    timestamp,
    operator: '随州市气象局审批系统',
    remark: stepMeta?.desc || '状态已更新',
  };

  if (existingLogIndex >= 0) {
    app.logs[existingLogIndex] = newLog;
  } else {
    app.logs.push(newLog);
  }

  apps[targetIndex] = app;
  saveApplications(apps);

  // 异步同步至云数据库
  updateApplicationStatusInCloud(id, newStatus, newLog).catch((err) => {
    console.warn('[CloudBase] 同步更新云数据库状态提示:', err);
  });

  return app;
}
