import http from '@/services/http'
import { cleanParams } from '@/utils/query'

/**
 * Indicadores consolidados del dashboard y consulta del registro de auditoría.
 */
export const dashboardService = {
  stats: () => http.get('/dashboard/stats'),
}

export const activityLogsService = {
  list: (filters = {}) => http.get('/activity-logs', { params: cleanParams(filters) }),
}

export default dashboardService