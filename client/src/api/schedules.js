// ============================================================
// api/schedules.js - 경기 일정 API 함수
// ============================================================

import axiosInstance from './axiosInstance'

export const getSchedulesAPI = async () => {
  const res = await axiosInstance.get('/schedules')
  return res.data.schedules
}

export const createScheduleAPI = async (data) => {
  const res = await axiosInstance.post('/schedules', data)
  return res.data
}

export const updateScheduleAPI = async (id, data) => {
  const res = await axiosInstance.patch(`/schedules/${id}`, data)
  return res.data
}

export const deleteScheduleAPI = async (id) => {
  const res = await axiosInstance.delete(`/schedules/${id}`)
  return res.data
}

export const completeScheduleAPI = async (id) => {
  const res = await axiosInstance.patch(`/schedules/${id}/complete`)
  return res.data
}

export const voteScheduleAPI = async (id, status) => {
  const res = await axiosInstance.patch(`/schedules/${id}/vote`, { status })
  return res.data
}
