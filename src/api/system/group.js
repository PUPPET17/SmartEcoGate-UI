import request from '@/utils/request'

// 查询企业组列表
export function listGroup(query) {
  return request({
    url: '/system/group/list',
    method: 'get',
    params: query
  })
}

// 查询企业组详细
export function getGroup(id) {
  return request({
    url: '/system/group/' + id,
    method: 'get'
  })
}

// 新增企业组
export function addGroup(data) {
  return request({
    url: '/system/group',
    method: 'post',
    data: data
  })
}

// 修改企业组
export function updateGroup(data) {
  return request({
    url: '/system/group',
    method: 'put',
    data: data
  })
}

// 删除企业组
export function delGroup(id) {
  return request({
    url: '/system/group/' + id,
    method: 'delete'
  })
}

// 查询企业组列表按组ID
export function getGroupById(groupId) {
  return request({
    url: '/system/group/list/' + groupId,
    method: 'get'
  })
}

// 获取所有企业组及企业数量
export function getAllGroupsCount() {
  return request({
    url: '/system/group/count',
    method: 'get'
  })
}

// 检查企业是否在任意企业组中
export function checkCompanyInGroup(companyId) {
  return request({
    url: '/system/group/check/' + companyId,
    method: 'get'
  })
}
