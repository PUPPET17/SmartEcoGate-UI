import request from '@/utils/request'

// 查询Redis中现有的车辆类型key内容
export function getRedisContents() {
  return request({
    url: '/api/vehicleType/redisContents',
    method: 'get'
  })
}

// 查询完整的车辆类型字典列表
export function getFullDictList() {
  return request({
    url: '/api/vehicleType/fullList',
    method: 'get'
  })
}

// 修改Redis中的车辆类型key内容
export function updateRedisContents(data) {
  return request({
    url: '/api/vehicleType/updateRedisContents',
    method: 'post',
    data: data
  })
}

// 重置为默认筛选条件
export function resetToDefault() {
  return request({
    url: '/api/vehicleType/resetToDefault',
    method: 'post'
  })
} 