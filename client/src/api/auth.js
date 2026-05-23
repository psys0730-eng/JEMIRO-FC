import axiosInstance from './axiosInstance'

/**
 * 로그인 API 호출
 */
export const loginAPI = async (email, password) => {
  const response = await axiosInstance.post('/auth/login', { email, password })
  return response.data
}

/**
 * 회원가입 API 호출
 */
export const registerAPI = async (name, email, password) => {
  const response = await axiosInstance.post('/auth/register', { name, email, password })
  return response.data
}

