import request from '@/utils/request'

// 查询支付配置列表
export function listPaymentConfig(query) {
  return request({
    url: '/system/paymentConfig/list',
    method: 'get',
    params: query
  })
}

// 查询支付配置详细
export function getPaymentConfig(id) {
  return request({
    url: '/system/paymentConfig/' + id,
    method: 'get'
  })
}

// 新增支付配置
export function addPaymentConfig(data) {
  return request({
    url: '/system/paymentConfig',
    method: 'post',
    data: data
  })
}

// 修改支付配置
export function updatePaymentConfig(data) {
  return request({
    url: '/system/paymentConfig',
    method: 'put',
    data: data
  })
}

// 删除支付配置
export function delPaymentConfig(id) {
  return request({
    url: '/system/paymentConfig/' + id,
    method: 'delete'
  })
}


// 获取支付链接
export function getPayUrl(data) {
  return request({
    url: '/api/pay/url',
    method: 'post',
    data: data
  })
}

export function getQrPayUrl(data){
  return request({
    url: '/api/pay/qr',
    method: 'post',
    data: data
  })
}

export function getSeviceFee(companyId){
  return request({
    url: '/system/subject/service/'+companyId,
    method: 'post',
  })
}