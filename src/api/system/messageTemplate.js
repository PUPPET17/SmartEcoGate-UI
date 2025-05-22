import request from '@/utils/request'

// 查询通知模板列表
export function listMessageTemplate(query) {
  return request({
    url: '/system/messageTemplate/list',
    method: 'get',
    params: query
  })
}

// 查询通知模板详细
export function getMessageTemplate(id) {
  return request({
    url: '/system/messageTemplate/' + id,
    method: 'get'
  })
}

// 新增通知模板
export function addMessageTemplate(data) {
  return request({
    url: '/system/messageTemplate',
    method: 'post',
    data: data
  })
}

// 修改通知模板
export function updateMessageTemplate(data) {
  return request({
    url: '/system/messageTemplate',
    method: 'put',
    data: data
  })
}

// 删除通知模板
export function delMessageTemplate(id) {
  return request({
    url: '/system/messageTemplate/' + id,
    method: 'delete'
  })
}


export function getSelectMessageTemplate(query) {
  return request({
    url: '/system/messageTemplate/template',
    method: 'get',
    params: query
  })
}
