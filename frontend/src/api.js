import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('access')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401) {
      const refresh = localStorage.getItem('refresh')
      if (refresh) {
        try {
          const res = await axios.post('/api/token/refresh/', { refresh })
          localStorage.setItem('access', res.data.access)
          err.config.headers.Authorization = `Bearer ${res.data.access}`
          return api(err.config)
        } catch {
          localStorage.removeItem('access')
          localStorage.removeItem('refresh')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(err)
  }
)

export default api
