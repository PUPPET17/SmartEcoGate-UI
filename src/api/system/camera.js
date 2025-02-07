import request from '@/utils/request'

// 查询相机管理列表
export function listCamera(query) {
  return request({
    url: '/system/camera/list',
    method: 'get',
    params: query
  })
}

// 查询相机管理详细
export function getCamera(id) {
  return request({
    url: '/system/camera/' + id,
    method: 'get'
  })
}

// 新增相机管理
export function addCamera(data) {
  return request({
    url: '/system/camera',
    method: 'post',
    data: data
  })
}

// 修改相机管理
export function updateCamera(data) {
  return request({
    url: '/system/camera',
    method: 'put',
    data: data
  })
}

// 删除相机管理
export function delCamera(id) {
  return request({
    url: '/system/camera/' + id,
    method: 'delete'
  })
}
