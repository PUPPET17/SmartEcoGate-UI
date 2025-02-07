import request from '@/utils/request'

// 查询离线日志列表
export function listLog(query) {
  return request({
    url: '/offline/log/list',
    method: 'get',
    params: query
  })
}
