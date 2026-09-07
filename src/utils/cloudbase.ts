import { ApplicationRecord, ApplicationStatus } from '../types';

/**
 * 腾讯云开发 CloudBase 客户端配置与操作模块
 * 环境ID: weathersuizhou-d5guy17wnc64dbda3
 */
export const CLOUDBASE_ENV_ID = 'weathersuizhou-d5guy17wnc64dbda3';
export const APPLICATIONS_COLLECTION = 'applications';

declare global {
  interface Window {
    tcb?: any;
    cloudbase?: any;
  }
}

let tcbAppInstance: any = null;
let authPromise: Promise<any> | null = null;

/**
 * 获取或初始化 CloudBase App 实例
 */
export function getCloudbaseApp() {
  if (tcbAppInstance) return tcbAppInstance;

  const tcb = window.tcb || window.cloudbase;
  if (!tcb) {
    console.warn('[CloudBase] 腾讯云开发 SDK 尚未加载完成，请确认网络连接或 index.html 引用');
    return null;
  }

  try {
    tcbAppInstance = tcb.init({
      env: CLOUDBASE_ENV_ID,
    });
    console.log('[CloudBase] SDK 初始化成功，环境ID:', CLOUDBASE_ENV_ID);
    return tcbAppInstance;
  } catch (err) {
    console.error('[CloudBase] SDK 初始化失败:', err);
    return null;
  }
}

/**
 * 确保匿名身份登录（Web 端无凭据免登访问 CloudBase）
 */
export async function ensureAuth() {
  const app = getCloudbaseApp();
  if (!app) return null;

  if (authPromise) return authPromise;

  authPromise = (async () => {
    try {
      const auth = app.auth({ persistence: 'local' });
      const loginState = await auth.getLoginState();
      if (!loginState) {
        console.log('[CloudBase] 正在进行匿名登录认证...');
        await auth.signInAnonymously();
        console.log('[CloudBase] 匿名身份认证成功');
      }
      return auth;
    } catch (err) {
      console.warn('[CloudBase] 认证状态检查或登录提示（将尝试直接操作或本地缓存同步）:', err);
      return null;
    } finally {
      authPromise = null;
    }
  })();

  return authPromise;
}

/**
 * Base64 DataURL 转换为 Blob
 */
export function dataURLtoBlob(dataurl: string): Blob {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * 将文件或图片上传到腾讯云开发云存储 (Cloud Storage)
 * 返回 cloudPath/fileID 以及临时访问链接
 */
export async function uploadToCloudStorage(
  fileOrBlob: File | Blob,
  fileName: string,
  subFolder = 'applications'
): Promise<{ fileID: string; downloadUrl: string; cloudPath: string }> {
  const app = getCloudbaseApp();
  const timestamp = Date.now();
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const cloudPath = `${subFolder}/${timestamp}_${safeName}`;

  if (!app) {
    console.warn('[CloudBase Storage] SDK 实例不可用，保留原始对象路径');
    return {
      fileID: cloudPath,
      downloadUrl: '',
      cloudPath,
    };
  }

  try {
    await ensureAuth();
    console.log(`[CloudBase Storage] 正在上传文件至云存储: ${cloudPath}`);
    const uploadRes = await app.uploadFile({
      cloudPath,
      filePath: fileOrBlob,
    });

    const fileID = uploadRes.fileID || `cloud://${CLOUDBASE_ENV_ID}/${cloudPath}`;
    let downloadUrl = '';

    // 尝试获取可访问的临时下载/预览 URL
    try {
      const tempUrlRes = await app.getTempFileURL({
        fileList: [fileID],
      });
      if (tempUrlRes?.fileList?.[0]?.tempFileURL) {
        downloadUrl = tempUrlRes.fileList[0].tempFileURL;
      }
    } catch (tempErr) {
      console.warn('[CloudBase Storage] 获取文件临时访问链接提示:', tempErr);
    }

    console.log('[CloudBase Storage] 文件上传成功:', { fileID, downloadUrl });
    return {
      fileID,
      downloadUrl,
      cloudPath,
    };
  } catch (err) {
    console.error('[CloudBase Storage] 上传至云存储失败:', err);
    // 返回占位路径，确保流程不中断
    return {
      fileID: `cloud://${CLOUDBASE_ENV_ID}/${cloudPath}`,
      downloadUrl: '',
      cloudPath,
    };
  }
}

/**
 * 将申请记录存储至腾讯云开发云数据库 "applications" 集合
 * 严格包含：申请编号、类型、申请人信息、灾害信息、文件路径、提交时间、状态（默认"已提交"）
 */
export async function saveApplicationToCloud(record: ApplicationRecord, filePathsList: string[] = []): Promise<boolean> {
  const app = getCloudbaseApp();
  if (!app) {
    console.warn('[CloudBase DB] SDK 未就绪，数据将暂存本地缓存');
    return false;
  }

  try {
    await ensureAuth();
    const db = app.database();
    const collection = db.collection(APPLICATIONS_COLLECTION);

    // 构造符合题意要求的每条记录结构
    const cloudRecord = {
      // 1. 申请编号（格式QX+年月日+4位随机数）
      id: record.id,
      applicationNo: record.id,

      // 2. 类型
      type: record.type,

      // 3. 申请人信息
      applicantInfo: {
        name: record.applicantName || record.contactName || '',
        idCardNumber: record.idCardNumber || '',
        creditCode: record.creditCode || '',
        contactName: record.contactName || '',
        phone: record.phone,
        unitName: record.unitName || '',
      },
      // 兼容原有扁平化字段
      applicantName: record.applicantName || '',
      idCardNumber: record.idCardNumber || '',
      creditCode: record.creditCode || '',
      contactName: record.contactName || '',
      phone: record.phone,
      unitName: record.unitName || '',

      // 4. 灾害信息
      disasterInfo: {
        disasterType: record.disasterType,
        disasterDate: record.disasterDate,
        disasterLocation: record.disasterLocation,
        purpose: record.purpose,
      },
      disasterType: record.disasterType,
      disasterDate: record.disasterDate,
      disasterLocation: record.disasterLocation,
      purpose: record.purpose,

      // 5. 文件路径（存入云存储的文件ID或路径）
      filePaths: filePathsList.length > 0 ? filePathsList : [
        record.idCardFrontImage || '',
        record.idCardBackImage || '',
        record.unitLetterFile?.url || ''
      ].filter(Boolean),
      idCardFrontImage: record.idCardFrontImage || '',
      idCardBackImage: record.idCardBackImage || '',
      unitLetterFile: record.unitLetterFile,

      // 6. 提交时间
      createdAt: record.createdAt,

      // 7. 状态（默认"已提交"）
      statusName: '已提交',
      status: record.status || 'SUBMITTED',

      // 业务附加信息（证明公文、气象观测站实况台账数据与流转日志）
      certificateNo: record.certificateNo,
      issueDate: record.issueDate,
      observationData: record.observationData,
      logs: record.logs || [],
    };

    console.log('[CloudBase DB] 正在写入 applications 集合:', cloudRecord);
    const res = await collection.add(cloudRecord);
    console.log('[CloudBase DB] 成功写入 applications 集合，记录 ID:', res.id || res._id);
    return true;
  } catch (err) {
    console.error('[CloudBase DB] 写入云数据库 applications 异常:', err);
    return false;
  }
}

/**
 * 从云数据库 applications 集合中查询申请记录
 * 支持输入申请编号或手机号进行匹配
 */
export async function queryApplicationsFromCloud(keyword = ''): Promise<ApplicationRecord[]> {
  const app = getCloudbaseApp();
  if (!app) {
    return [];
  }

  try {
    await ensureAuth();
    const db = app.database();
    const collection = db.collection(APPLICATIONS_COLLECTION);
    const trimmed = keyword.trim();

    let res: any;

    if (!trimmed) {
      // 查询最新 30 条记录
      res = await collection.orderBy('createdAt', 'desc').limit(30).get();
    } else {
      // 先尝试按申请编号精准/匹配查询
      const _ = db.command;
      try {
        res = await collection
          .where(
            _.or([
              { id: trimmed },
              { applicationNo: trimmed },
              { phone: trimmed },
              { applicantName: trimmed },
              { unitName: trimmed },
            ])
          )
          .get();
      } catch (whereErr) {
        console.warn('[CloudBase DB] 复合 where 查询降级，拉取列表并在客户端精准匹配:', whereErr);
        res = await collection.orderBy('createdAt', 'desc').limit(50).get();
      }
    }

    if (res?.data && Array.isArray(res.data)) {
      const records: ApplicationRecord[] = res.data.map((item: any) => {
        return {
          id: item.id || item.applicationNo || item._id,
          type: item.type || 'personal',
          createdAt: item.createdAt || '',
          status: (item.status as ApplicationStatus) || 'SUBMITTED',
          applicantName: item.applicantName || item.applicantInfo?.name,
          idCardNumber: item.idCardNumber || item.applicantInfo?.idCardNumber,
          unitName: item.unitName || item.applicantInfo?.unitName,
          creditCode: item.creditCode || item.applicantInfo?.creditCode,
          contactName: item.contactName || item.applicantInfo?.contactName,
          phone: item.phone || item.applicantInfo?.phone || '',
          disasterType: item.disasterType || item.disasterInfo?.disasterType || '暴雨',
          disasterDate: item.disasterDate || item.disasterInfo?.disasterDate || '',
          disasterLocation: item.disasterLocation || item.disasterInfo?.disasterLocation || '',
          purpose: item.purpose || item.disasterInfo?.purpose || '',
          idCardFrontImage: item.idCardFrontImage || (item.filePaths && item.filePaths[0]) || '',
          idCardBackImage: item.idCardBackImage || (item.filePaths && item.filePaths[1]) || '',
          unitLetterFile: item.unitLetterFile,
          certificateNo: item.certificateNo,
          issueDate: item.issueDate,
          observationData: item.observationData,
          logs: item.logs || [],
        };
      });

      if (trimmed) {
        const lower = trimmed.toLowerCase();
        return records.filter(
          (r) =>
            r.id.toLowerCase().includes(lower) ||
            r.phone.includes(lower) ||
            (r.applicantName && r.applicantName.toLowerCase().includes(lower)) ||
            (r.unitName && r.unitName.toLowerCase().includes(lower))
        );
      }

      return records;
    }

    return [];
  } catch (err) {
    console.error('[CloudBase DB] 查询云数据库异常:', err);
    return [];
  }
}

/**
 * 更新云数据库中的状态（例如审核进度切换测试）
 */
export async function updateApplicationStatusInCloud(id: string, newStatus: ApplicationStatus, newLog: any): Promise<boolean> {
  const app = getCloudbaseApp();
  if (!app) return false;

  try {
    await ensureAuth();
    const db = app.database();
    const collection = db.collection(APPLICATIONS_COLLECTION);
    const _ = db.command;

    const queryRes = await collection.where({ id }).get();
    if (queryRes?.data && queryRes.data.length > 0) {
      const docId = queryRes.data[0]._id;
      await collection.doc(docId).update({
        status: newStatus,
        statusName: newStatus === 'SUBMITTED' ? '已提交' : newStatus,
        logs: _.push(newLog),
      });
      console.log(`[CloudBase DB] 成功更新文档 ${docId} 状态为 ${newStatus}`);
      return true;
    }
    return false;
  } catch (err) {
    console.warn('[CloudBase DB] 更新云端状态提示:', err);
    return false;
  }
}
