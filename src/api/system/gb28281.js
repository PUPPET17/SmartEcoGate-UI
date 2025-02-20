import request from "@/utils/request";

export function auth(deviceId,channelId) {
    return request({
      url: "/gb28181/onplay/"+deviceId+"/"+channelId,
      method: "get",
    });
  }

  export function getBaseUrl(){
    return request({
      url: "/gb28181/stream",
      method: "get",
    });
  }
