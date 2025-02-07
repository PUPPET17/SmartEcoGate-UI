import request from '@/utils/request'

// 查询场外车辆信息列表
export function listOffSiteVehicle(query) {
  return request({
    url: '/system/OffSiteVehicle/list',
    method: 'get',
    params: query
  })
}

// 查询场外车辆信息详细
export function getOffSiteVehicle(id) {
  return request({
    url: '/system/OffSiteVehicle/' + id,
    method: 'get'
  })
}

// 新增场外车辆信息
export function addOffSiteVehicle(data) {
  return request({
    url: '/system/OffSiteVehicle',
    method: 'post',
    data: data
  })
}

// 修改场外车辆信息
export function updateOffSiteVehicle(data) {
  return request({
    url: '/system/OffSiteVehicle',
    method: 'put',
    data: data
  })
}

// 删除场外车辆信息
export function delOffSiteVehicle(id) {
  return request({
    url: '/system/OffSiteVehicle/' + id,
    method: 'delete'
  })
}

export function addOffSiteVehicleNoAuth(data) {
  return request({
    url: '/system/OffSiteVehicle',
    method: 'post',
    data: data,
    headers: {
      skipAuth: true
    }
  })
}