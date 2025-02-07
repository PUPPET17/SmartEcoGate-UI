import request from '@/utils/request'

// 查询黑名单车辆列表
export function listEmission(query) {
  return request({
    url: '/emission/list',
    method: 'get',
    params: query
  })
}

// 根据车牌号查询排放数据
export function getEmissionByPlateNo(apiStrategy, plateNo) {
  return request({
    url: `/emission/plateNo/`,
    method: 'get',
    params: {
      apiStrategy: apiStrategy,
      plateNo: plateNo
    }
  })
} 