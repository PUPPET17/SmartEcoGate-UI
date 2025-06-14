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

// 查询货物补录情况
export function getLedgerInfo(ids) {
  return request({
    url: `/system/ledger/${ids}`,
    method: 'get'
  })
}

export function reAuthLedger(ids) {
  return request({
    url: `/system/ledger/reAuth/${ids}`,
    method: 'get'
  })
}

export function getLatestRecord(companyId,casherId) {
  return request({
    url: `/transit/record/recent/${companyId}/${casherId}`,
    method: 'get'
  })
}

export function getstat(companyId) {
  return request({
    url: `/transit/record/stat/${companyId}`,
    method: 'get'
  })
}

export function getRecordVideoUrl(data){
  return request({
    url: `/gb28181/record`,
    method: 'post',
    data: data
  })
}

// 查询违规通行记录列表
export function listVio(query) {
  return request({
    url: '/transit/record/listVio',
    method: 'get',
    params: query
  })
}

// 补录货物信息
export function supplementLedger(data) {
  return request({
    url: '/system/ledger/supplement',
    method: 'post',
    data: data
  })
}
