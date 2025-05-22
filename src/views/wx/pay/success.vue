<template>
  <div class="pay-success-container">
    <div class="success-content">
      <div class="success-icon-wrapper">
        <div class="loader"></div>
      </div>
      <h2 class="success-title">支付成功</h2>
      <p class="success-desc">系统将在稍后自动为您续期服务</p>
      <div class="decoration-line"></div>
    </div>
  </div>
</template>

<script setup>
// 组件逻辑
</script>

<style scoped>
.pay-success-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
  padding: 20px;
}

.success-content {
  text-align: center;
  padding: 40px 30px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  position: relative;
  animation: slideIn 0.6s ease-out;
  max-width: 90%;
  width: 360px;
}

.success-icon-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 30px;
  width: 80px;
  height: 80px;
}

.loader {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 4px solid rgba(103, 194, 58, 0.2);
  border-left-color: #67c23a;
  animation: animation_collect 0.6s linear 1 both;
}

.loader::before {
  position: absolute;
  content: '';
  top: 50%;
  left: 15px;
  border: 4px solid #67c23a;
  border-left-width: 0;
  border-bottom-width: 0;
  transform: scaleX(-1) rotate(135deg);
  transform-origin: left top;
  animation: animation_true 0.3s 0.6s linear 1 both;
  opacity: 0;
}

.success-title {
  font-size: 28px;
  color: #303133;
  margin-bottom: 16px;
  font-weight: 600;
  animation: fadeIn 0.3s ease-out 0.9s both;
}

.success-desc {
  font-size: 16px;
  color: #606266;
  margin: 0;
  line-height: 1.6;
  animation: fadeIn 0.3s ease-out 1s both;
}

.decoration-line {
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, #67c23a, #95d475);
  margin: 24px auto 0;
  border-radius: 2px;
  animation: lineExpand 0.4s ease-out 1.1s both;
}

@keyframes animation_collect {
  0% {
    transform: rotate(270deg);
    border-left-color: #67c23a;
  }
  25% {
    border-left-color: #67c23a;
  }
  50% {
    border-left-color: #67c23a;
  }
  75% {
    border-left-color: #67c23a;
  }
  100% {
    border-left-color: rgba(103, 194, 58, 0.2);
    transform: rotate(0deg);
  }
}

@keyframes animation_true {
  0% {
    opacity: 0;
    width: 0px;
    height: 0px;
  }
  33% {
    opacity: 1;
    width: 20px;
    height: 0px;
  }
  100% {
    opacity: 1;
    width: 20px;
    height: 40px;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes lineExpand {
  from {
    width: 0;
    opacity: 0;
  }
  to {
    width: 60px;
    opacity: 1;
  }
}

/* 移动端适配 */
@media screen and (max-width: 480px) {
  .success-content {
    padding: 30px 20px;
  }

  .success-icon-wrapper {
    width: 70px;
    height: 70px;
  }

  .loader {
    width: 70px;
    height: 70px;
  }

  .success-title {
    font-size: 24px;
  }

  .success-desc {
    font-size: 15px;
  }
}
</style> 