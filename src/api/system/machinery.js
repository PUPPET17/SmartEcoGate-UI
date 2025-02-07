import request from '@/utils/request'

// 查询非道路机械列表
export function listMachinery(query) {
  return request({
    url: '/system/machinery/list',
    method: 'get',
    params: query
  })
}

// 查询非道路机械详细
export function getMachinery(id) {
  return request({
    url: '/system/machinery/' + id,
    method: 'get'
  })
}

// 新增非道路机械
export function addMachinery(data) {
  return request({
    url: '/system/machinery',
    method: 'post',
    data: data
  })
}

// 修改非道路机械
export function updateMachinery(data) {
  return request({
    url: '/system/machinery',
    method: 'put',
    data: data
  })
}

// 删除非道路机械
export function delMachinery(id) {
  return request({
    url: '/system/machinery/' + id,
    method: 'delete'
  })
}
