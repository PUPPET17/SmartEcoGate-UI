import request from '@/utils/request'

// 新增场外车辆信息
export function addOffSiteVehicleNoAuth(data) {
  return request({
    url: '/wx/vehicle/addVehicle',
    method: 'post',
    data: data,
    headers: {
      skipAuth: true
    }
  })
}

//开闸消息
export function openGate(companyId,plateNo) {
  return request({
    url: '/wx/vehicle/openGate',
    method: 'get',
    headers: {
      skipAuth: true
    },
    params: {
      companyId: companyId,
      plateNo: plateNo
    }
  })
}

export function selectIds(companyId) {
  return request({
    url: '/wx/vehicle/queryStrategy/' + companyId,
    method: 'get'
  })
}

export function supplement(data){
  return request({
    url: '/wx/vehicle/modifyVehicle',
    method: 'post',
    data: data
  })
}

// 添加管控策略检查方法
export function checkOffSiteVehicle(data) {
  return request({
    url: '/measures/rule/check',
    method: 'post',
    data: data
  })
}