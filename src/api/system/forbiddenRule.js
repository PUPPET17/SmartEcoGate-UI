import request from '@/utils/request'

// 查询禁行规则列表
export function listForbiddenRule(query) {
  return request({
    url: '/measures/rule/list',
    method: 'get',
    params: query
  })
}

// 查询禁行规则详细
export function getForbiddenRule(id) {
  return request({
    url: '/measures/rule/' + id,
    method: 'get'
  })
}

// 新增禁行规则
export function addForbiddenRule(data) {
  return request({
    url: '/measures/rule',
    method: 'post',
    data: data
  })
}

// 修改禁行规则
export function updateForbiddenRule(data) {
  return request({
    url: '/measures/rule',
    method: 'put',
    data: data
  })
}

// 删除禁行规则
export function delForbiddenRule(id) {
  return request({
    url: '/measures/rule/' + id,
    method: 'delete'
  })
}

// 导出禁行规则
export function exportForbiddenRule(query) {
  return request({
    url: '/measures/rule/export',
    method: 'post',
    params: query
  })
} 