<template>
  <div class="vehicle-info-entry">
    <header class="header">
      <h1>{{ companyName || '访客' }}</h1>
    </header>

    <main class="main-content">
      <div class="container">
        <p class="subtitle">请选择使用的录入方式：</p>
        <div class="btn-container">
          <button v-if="errorMessage" type="button" class="btn" @click="showErrorNotification(errorMessage)">
            手动录入
          </button>
          <button v-else type="button" class="btn" @click="submitCarInfo">
            手动录入
          </button>
          <button v-if="errorMessage" type="button" class="btn" @click="showErrorNotification(errorMessage)">
            自动识别录入
          </button>
          <button v-else type="button" class="btn" @click="submitCarImg">
            自动识别录入
          </button>
        </div>

        <p class="price-info">
          <template v-if="price < 0">
            当前厂家未开通自动识别录入服务，请联系相关负责人开通
          </template>
          <!-- <template v-else>
            当前自动识别录入金额为 <span style="color: red; font-weight: bold; font-size: 24px;">{{ price }}</span> 每次
          </template> -->
        </p>

        <p class="mt-4 text-left text-sm text-gray-500">
          使用自动识别录入时，您只需上传行驶证照片，系统将自动录入部分车辆信息
        </p>
      </div>
    </main>
    <footer class="footer">
      <p>© 2024-2025 车辆信息录入 保留所有权利.</p>
    </footer>
  </div>
</template>

<script>
import request from '@/utils/request';
import { ElMessage } from 'element-plus';

export default {
  data() {
    return {
      companyName: '',
      price: 0,
      aid: '',
      errorMessage: '',
    };
  },
  methods: {
    submitCarImg() {
      console.log(this.aid);
      this.$router.push(`/wx/ocr?aid=${this.aid}`);
      // this.$router.push({ name: 'OcrPage', params: { id: 123 } });
    },
    submitCarInfo() {
      console.log(this.aid);
      this.$router.push(`/wx/carinfo?aid=${this.aid}`);
    },
    getQueryParams() {
      const params = new URLSearchParams(window.location.search);
      this.aid = params.get('aid');
    },
    fetchCompanyData() {
      request.get(`/wx/getCompanyInfo?aid=${this.aid}`)
        .then(response => {
          // 确保 response.data 存在且格式正确
          if (response && response.companyName && response.price !== undefined) {
            this.companyName = response.companyName;
            this.price = response.price;
            this.errorMessage = "";
          } else {
            this.showErrorNotification("未获取到有效的公司信息,请检查二维码是否有效");
            this.errorMessage = "未获取到有效的公司信息,请检查二维码是否有效"; // 设置错误信息
          }
        })
        .catch(err => {
          console.error(err);
          this.showErrorNotification("获取公司信息失败");
          this.errorMessage = "获取公司信息失败"; // 设置错误信息
        });
    },
    showErrorNotification(message) {
      ElMessage({
        message: message,
        type: 'error',
        duration: 3000 // 显示时间，3秒
      });
    },
  },
  created() {
    this.getQueryParams();
    this.fetchCompanyData();
  },
};
</script>

<style scoped>
.vehicle-info-entry {
  background-color: #f0f4f8;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  margin: 0;
}

.header,
.footer {
  color: #4a5568;
  padding: 1rem;
  text-align: center;
}

.header {
  font-size: 1rem;
  font-weight: bold;
}

.main-content {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem;
}

.container {
  max-width: 500px;
  width: 90%;
  padding: 2rem;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.subtitle {
  font-size: 1.1rem;
  color: #4a5568;
  margin-bottom: 1.5rem;
}

.btn-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.btn {
  display: inline-block;
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  background-color: rgb(11, 152, 84);
  border-radius: 0.5rem;
  text-decoration: none;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.btn[disabled] {
  background-color: gray;
  pointer-events: none;
  /* 防止按钮点击 */
}


.btn:hover:enabled {
  background-color: rgb(19, 193, 115);
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.price-info {
  font-size: 0.9rem;
  color: #718096;
  margin-top: 0.5rem;
}

.footer {
  font-size: 0.8rem;
  padding: 0.75rem;
}
</style>
