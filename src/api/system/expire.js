import request from '@/utils/request'

export function checkIfExpired(companyId) {
  return request({
    url: '/expire/check',
    method: 'get',
    params: {
      companyId
    }
  })
}