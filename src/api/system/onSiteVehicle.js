import request from '@/utils/request'

// 查询场内车辆信息列表
export function listOnSiteVehicle(query) {
  return request({
    url: '/system/onSiteVehicle/list',
    method: 'get',
    params: query
  })
}

// 查询场内车辆信息详细
export function getOnSiteVehicle(id) {
  return request({
    url: '/system/onSiteVehicle/' + id,
    method: 'get'
  })
}

// 新增场内车辆信息
export function addOnSiteVehicle(data) {
  return request({
    url: '/system/onSiteVehicle',
    method: 'post',
    data: data
  })
}

// 修改场内车辆信息
export function updateOnSiteVehicle(data) {
  return request({
    url: '/system/onSiteVehicle',
    method: 'put',
    data: data
  })
}

// 删除场内车辆信息
export function delOnSiteVehicle(id) {
  return request({
    url: '/system/onSiteVehicle/' + id,
    method: 'delete'
  })
}
