import request from '@/utils/request'

// 查询商品列表列表
export function listSubject(query) {
  return request({
    url: '/system/subject/list',
    method: 'get',
    params: query
  })
}

// 查询商品列表详细
export function getSubject(id) {
  return request({
    url: '/system/subject/' + id,
    method: 'get'
  })
}

// 新增商品列表
export function addSubject(data) {
  return request({
    url: '/system/subject',
    method: 'post',
    data: data
  })
}

// 修改商品列表
export function updateSubject(data) {
  return request({
    url: '/system/subject',
    method: 'put',
    data: data
  })
}

// 删除商品列表
export function delSubject(id) {
  return request({
    url: '/system/subject/' + id,
    method: 'delete'
  })
}
