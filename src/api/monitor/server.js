import request from '@/utils/request'

// 获取服务信息
export function getServer() {
  return request({
    url: '/monitor/server',
    method: 'get'
  })
}

export function getLogLevels() {
  return request({
    url: '/logger/levels',
    method: 'get',
  })
}

export function changeLogLevel(packageName, levelName) {
  console.log(packageName, levelName)
  return request({
    url: '/logger/level/',
    method: 'put',
    params: { packageName, levelName }
  })
}