import request from '@/utils/request'

export function importEnterprise(data) {
  return request({
    url: '/import/create',
    method: 'post',
    data: data
  })
} 

export function submitGateCamera(data) {
  return request({
    url: '/import/gate',
    method: 'post',
    data: data
  })
}