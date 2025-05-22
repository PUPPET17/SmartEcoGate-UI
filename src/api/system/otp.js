import request from '@/utils/request'

// 生成OTP验证码
export function generateOtpApi() {
  return request({
    url: '/api/otp/generate',
    method: 'post'
  })
}

// 验证OTP
export function verifyOtpApi(data) {
  return request({
    url: '/api/otp/verify',
    method: 'post',
    data: data
  })
}