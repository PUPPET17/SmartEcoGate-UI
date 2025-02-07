import request from "@/utils/request";

// 查询企业信息列表
export function listInfo(query) {
  return request({
    url: "/system/info/list",
    method: "get",
    params: query,
  });
}

// 查询企业信息详细
export function getInfo(id) {
  return request({
    url: "/system/info/" + id,
    method: "get",
  });
}

// 新增企业信息
export function addInfo(data) {
  return request({
    url: "/system/info",
    method: "post",
    data: data,
  });
}

// 修改企业信息
export function updateInfo(data) {
  return request({
    url: "/system/info",
    method: "put",
    data: data,
  });
}

// 删除企业信息
export function delInfo(id) {
  return request({
    url: "/system/info/" + id,
    method: "delete",
  });
}

export function selectIds() {
  const res = request({
    url: "/system/info/ids",
    method: "get",
  });
  return res;
}

export function idsWithNonRegistered() {
  const res = request({
    url: "/system/info/idsWithNonRegistered",
    method: "get",
  });
  return res;
}

export async function getStaticQrCode(companyId) {
  const res = await request({
    url: "/qr/static?aid=" + companyId,
    method: "get",
    responseType: "arraybuffer", // Ensure responseType is set for binary data
  });
  return res;
}

export function getDynamicQrCode(companyId) {
  const res = request({
    url: "/qr/dynamic?aid=" + companyId,
    method: "get",
    responseType: "arraybuffer",
  });
  return res;
}

export function getSupplementQrCode(companyId) {
  const res = request({
    url: "/qr/supplementQr?aid=" + companyId,
    method: "get",
    responseType: "arraybuffer",
  });
  return res;
}

export function getAPIConfig(companyId, apiStrategy) {
  return request({
    url: "/system/info/api",
    method: "get",
    params: {
      companyId: companyId,
      apiStrategy: apiStrategy,
    },
  });
}

export function addApi(data) {
  return request({
    url: "/system/info/api",
    method: "post",
    data: data,
  });
}

export function getConfig(companyId) {
  return request({
    url: "/system/info/config",
    method: "get",
    params: companyId,
  });
}

export function syncConfig(companyId) {
  return request({
    url: "/system/info/sync/" + companyId,
    method: "get",
  });
}

export function isAlive(data) {
  return request({
    url: "/alive/isAlive",
    method: "post",
    data: data,
  });
}
