import request from '@/utils/request'

// 查询天津日上报列表
export function listTransitStatisticTj(query) {
  return request({
    url: '/api/TransitStatisticTj/list',
    method: 'get',
    params: query
  })
}

// 删除天津日上报
export function delTransitStatisticTj(id) {
  return request({
    url: '/api/TransitStatisticTj/' + id,
    method: 'delete'
  })
}

// 重新上传天津日上报
export function reAuthTransitStatisticTj(id) {
  return request({
    url: '/api/TransitStatisticTj/reAuth/' + id,
    method: 'get'
  })
} 