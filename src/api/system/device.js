import request from '@/utils/request'

export function getGateList(companyId) {
  return request({
    url: '/system/gate/list',
    method: 'get',
    params: { companyId }
  })
}

export function getDeviceList(gateId) {
  return request({
    url: '/system/gate/device/' + gateId,
    method: 'get',
  })
}

export function getGateInfo(id) {
  return request({
    url: '/system/gate/' + id,
    method: 'get',
  })
}

export function saveScreen(data) {
  return request({
    url: '/ledMsgTemplate/create',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json' 
    }
  })
}

export function updateScreen(data) {
  return request({
    url: '/ledMsgTemplate/update',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json' 
    }
  })
}
