import request from "@/utils/request";

// 查询相机管理列表
export function listCamera(query) {
  return request({
    url: "/system/camera/list",
    method: "get",
    params: query,
  });
}

// 查询相机管理详细
export function getCamera(id) {
  return request({
    url: "/system/camera/" + id,
    method: "get",
  });
}

// 新增相机管理
export function addCamera(data) {
  return request({
    url: "/system/camera",
    method: "post",
    data: data,
  });
}

// 修改相机管理
export function updateCamera(data) {
  return request({
    url: "/system/camera",
    method: "put",
    data: data,
  });
}

// 删除相机管理
export function delCamera(id) {
  return request({
    url: "/system/camera/" + id,
    method: "delete",
  });
}

// 认证相机
export function authCamera(data) {
  return request({
    url: "/system/camera/auth",
    method: "post",
    data: data,
  });
}

// 获取相机信息
export function getCameraInfoByCompanyId(companyId) {
  return request({
    url: "/system/camera/c/" + companyId,
    method: "get",
  });
}

// 获取加密配置
export function getEncryptConfig(sn) {
  return request({
    url: `/mqtt/getpass/${sn}`,
    method: "get",
  });
}

// 保存加密配置
export function saveEncryptConfig(data) {
  return request({
    url: "/mqtt/config",
    method: "post",
    data: data,
  });
}

// 检查相机MQTT连接状态
export function checkCameraConnectionStatus(clientId) {
  return request({
    url: `/mqtt/client/${clientId}`,
    method: "get",
  });
}
