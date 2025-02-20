import request from '@/utils/request'

// 查询道闸管理列表
export function listGate(query) {
  return request({
    url: '/system/gate/list',
    method: 'get',
    params: query
  })
}

// 查询道闸管理详细
export function getGate(id) {
  return request({
    url: '/system/gate/' + id,
    method: 'get'
  })
}

// 新增道闸管理
export function addGate(data) {
  return request({
    url: '/system/gate',
    method: 'post',
    data: data
  })
}

// 修改道闸管理
export function updateGate(data) {
  return request({
    url: '/system/gate',
    method: 'put',
    data: data
  })
}

// 删除道闸管理
export function delGate(id) {
  return request({
    url: '/system/gate/' + id,
    method: 'delete'
  })
}

export function getIds() {
  return request({
    url: '/system/gate/ids',
    method: 'get'
  })
}

export function getGateInfoByCompanyId(companyId) {
  return request({
    url: '/system/gate/c/' + companyId,
    method: 'get'
  })
}

