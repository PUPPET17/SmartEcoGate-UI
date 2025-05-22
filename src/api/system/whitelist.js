import request from '@/utils/request'

// 查询白名单车辆信息列表
export function listWhitelist(query) {
  return request({
    url: '/system/whitelist/list',
    method: 'get',
    params: query
  })
}

// 查询白名单车辆信息详细
export function getWhitelist(id) {
  return request({
    url: '/system/whitelist/' + id,
    method: 'get'
  })
}

// 新增白名单车辆信息
export function addWhitelist(data) {
  return request({
    url: '/system/whitelist',
    method: 'post',
    data: data
  })
}

// 修改白名单车辆信息
export function updateWhitelist(data) {
  return request({
    url: '/system/whitelist',
    method: 'put',
    data: data
  })
}

// 删除白名单车辆信息
export function delWhitelist(id) {
  return request({
    url: '/system/whitelist/' + id,
    method: 'delete'
  })
}
