// api/settings.js - 설정 API 함수

import axiosInstance from './axiosInstance'

// 설정 조회 (잔액 포함)
export const getSettingsAPI = async () => {
  const res = await axiosInstance.get('/settings')
  return res.data.settings
}

// 잔액 수정 (관리자만)
export const updateBalanceAPI = async (balance, balanceMemo) => {
  const res = await axiosInstance.patch('/settings/balance', { balance, balanceMemo })
  return res.data
}
