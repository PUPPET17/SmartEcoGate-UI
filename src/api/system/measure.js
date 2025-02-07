import request from '@/utils/request'

// 查询管控措施列表
export function listMeasure(query) {
  return request({
    url: '/system/measure/list',
    method: 'get',
    params: query
  })
}

// 查询管控措施详细
export function getMeasure(id) {
  return request({
    url: '/system/measure/' + id,
    method: 'get'
  })
}

// 新增管控措施
export function addMeasure(data) {
  return request({
    url: '/system/measure',
    method: 'post',
    data: data
  })
}

// 修改管控措施
export function updateMeasure(data) {
  return request({
    url: '/system/measure',
    method: 'put',
    data: data
  })
}

// 删除管控措施
export function delMeasure(id) {
  return request({
    url: '/system/measure/' + id,
    method: 'delete'
  })
}

// 查询最新管控措施
export function queryLatestControl(companyId) {
  return request({
    url: '/system/measure/latest/' + companyId,
    method: 'get'
  })
}
