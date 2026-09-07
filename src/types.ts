/**
 * 随州市气象局气象证明在线申请系统 - 数据类型定义
 */

export type DisasterType =
  | '暴雨'
  | '大风'
  | '雷电'
  | '冰雹'
  | '暴雪'
  | '高温'
  | '低温'
  | '其他';

export type ApplicationStatus =
  | 'SUBMITTED'      // 已提交
  | 'ACCEPTED'       // 受理中
  | 'PREPARING'      // 证明开具中
  | 'PENDING_AUDIT'  // 待审批
  | 'APPROVED'       // 审批通过
  | 'AWAITING_PICKUP'// 待领取
  | 'COMPLETED';     // 已完成

export type TabType = 'home' | 'personal' | 'unit' | 'query' | 'certificate';

export interface AuditLog {
  status: ApplicationStatus;
  title: string;
  timestamp: string;
  operator: string;
  remark: string;
}

export interface WeatherObservationData {
  stationName: string;
  stationId: string;
  date: string;
  disasterType: DisasterType;
  extremeValues: string;
  conclusion: string;
}

export interface ApplicationRecord {
  id: string; // e.g. "SZQX-20260907-8821"
  type: 'personal' | 'unit';
  createdAt: string;
  status: ApplicationStatus;
  
  // 个人特有
  applicantName?: string;
  idCardNumber?: string;
  idCardFrontImage?: string; // base64 or placeholder
  idCardBackImage?: string;

  // 单位特有
  unitName?: string;
  creditCode?: string;
  contactName?: string;
  unitLetterFile?: {
    name: string;
    size: string;
    url?: string;
  };

  // 共有信息
  phone: string;
  disasterType: DisasterType;
  disasterDate: string;
  disasterLocation: string;
  purpose: string;

  // 证明相关
  certificateNo?: string;
  issueDate?: string;
  observationData?: WeatherObservationData;
  logs: AuditLog[];
}
