import request from '@/utils/request'

// 查询通行记录列表
export function listRecord(query) {
  return request({
    url: '/transit/record/list',
    method: 'get',
    params: query
  })
}

// 查询通行记录详细
export function getRecord(id) {
  return request({
    url: '/transit/record/' + id,
    method: 'get'
  })
}

// 新增通行记录
export function addRecord(data) {
  return request({
    url: '/transit/record',
    method: 'post',
    data: data
  })
}

// 修改通行记录
export function updateRecord(data) {
  return request({
    url: '/transit/record',
    method: 'put',
    data: data
  })
}

// 删除通行记录
export function delRecord(data) {
  return request({
    url: '/transit/record/'+data,
    method: 'delete'
  });
}

export function reAuth(data) {
  return request({
    url: '/transit/record/reAuth/'+data,
    method: 'get',
  });
}
