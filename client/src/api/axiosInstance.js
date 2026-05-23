// ============================================================
// api/axiosInstance.js - Axios 기본 설정
// ============================================================
// 모든 API 요청에서 이 인스턴스를 공통으로 사용합니다.
// baseURL이 설정되어 있어 '/api/auth/login' 처럼 짧게 쓸 수 있습니다.
// ============================================================

import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: '/api', // vite.config.js의 proxy 설정으로 → http://localhost:5000/api
  headers: {
    'Content-Type': 'application/json',
  },
})

// 요청 인터셉터: 매 요청마다 자동으로 JWT 토큰을 헤더에 추가
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 응답 인터셉터: 401 에러 시 토큰 삭제 후 루트로 이동 (자동 로그아웃)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/' // SPA 루트로 이동 → 로그인 화면이 뜸
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
