import request from '@/utils/request'

// 查询企业详细配置列表
export function listEnterpriseConfig(query) {
  return request({
    url: '/system/enterpriseConfig/list',
    method: 'get',
    params: query
  })
}

// 查询企业详细配置详细
export function getEnterpriseConfig(id) {
  return request({
    url: '/system/enterpriseConfig/' + id,
    method: 'get'
  })
}

// 新增企业详细配置
export function addEnterpriseConfig(data) {
  return request({
    url: '/system/enterpriseConfig',
    method: 'post',
    data: data
  })
}

// 修改企业详细配置
export function updateEnterpriseConfig(data) {
  return request({
    url: '/system/enterpriseConfig',
    method: 'put',
    data: data
  })
}

// 删除企业详细配置
export function delEnterpriseConfig(id) {
  return request({
    url: '/system/enterpriseConfig/' + id,
    method: 'delete'
  })
}
