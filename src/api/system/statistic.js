import request from '@/utils/request'

// 查询唐山日上报列表
export function listStatistic(query) {
  return request({
    url: '/system/statistic/list',
    method: 'get',
    params: query
  })
}

// 查询唐山日上报详细
export function getStatistic(id) {
  return request({
    url: '/system/statistic/' + id,
    method: 'get'
  })
}

// 新增唐山日上报
export function addStatistic(data) {
  return request({
    url: '/system/statistic',
    method: 'post',
    data: data
  })
}

// 修改唐山日上报
export function updateStatistic(data) {
  return request({
    url: '/system/statistic',
    method: 'put',
    data: data
  })
}

// 删除唐山日上报
export function delStatistic(id) {
  return request({
    url: '/system/statistic/' + id,
    method: 'delete'
  })
}

// 重新上传统计数据
export function reAuthStatistic(ids) {
  return request({
    url: '/system/statistic/reAuth/' + ids,
    method: 'get'
  })
}
