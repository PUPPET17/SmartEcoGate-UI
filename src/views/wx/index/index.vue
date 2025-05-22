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
          <button v-else type="button" class="btn" :disabled="loading" @click="handleAutoRecognition">
            {{ loading ? '正在获取支付链接...' : '自动识别录入' }}
          </button>
        </div>

        <p class="price-info">
          <template v-if="price < 0">
            当前厂家未开通自动识别录入服务，请联系相关负责人开通
          </template>
          <template v-else>
            当前自动识别录入金额为 <span style="color: red; font-weight: bold; font-size: 24px;">{{ price }}元</span> 每次
          </template>
        </p>

        <p class="mt-4 text-left text-sm text-gray-500">
          使用自动识别录入时，您只需上传行驶证照片，系统将自动录入部分车辆信息
        </p>
      </div>
    </main>
    <footer class="footer">
      <p>© 2024-2025 车辆信息录入 保留所有权利.</p>
    </footer>

    <!-- 车牌号输入对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="请输入车牌号"
      width="80%"
      :close-on-click-modal="false"
      :show-close="true"
    >
      <el-input
        v-model="plateNumber"
        placeholder="请输入车牌号"
        maxlength="8"
        clearable
      ></el-input>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="submitWithPlateNumber" 
            :disabled="!plateNumber || validateLoading"
            :loading="validateLoading"
          >
            {{ validateLoading ? '验证中...' : '确定' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request';
import { useRoute, useRouter } from 'vue-router';
import { addOffSiteVehicleNoAuth, openGate, selectIds, checkOffSiteVehicle, queryOffSiteVehicle } from "@/api/wx/offSite";
import { ElMessage } from 'element-plus';

export default {
  setup() {
    const route = useRoute();
    const router = useRouter();

    return {
      route,
      router
    };
  },
  data() {
    return {
      companyName: '',
      price: 0,
      aid: '',
      errorMessage: '',
      loading: false,
      dialogVisible: false,
      plateNumber: '',
      validateLoading: false,
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
    handleAutoRecognition() {
      try {
        if (this.price < 0) {
          this.showErrorNotification('当前厂家未开通自动识别录入服务，请联系相关负责人开通');
          return;
        }

        if (this.price == 0) {
          this.submitCarImg();
          return;
        }

        // 显示车牌号输入弹窗
        this.plateNumber = '';
        this.dialogVisible = true;

      } catch (error) {
        console.error('操作失败，详细错误：', error);
        this.showErrorNotification(error.message || '操作失败，请稍后重试');
      }
    },
    // 验证车牌号
    async validatePlateNumber(plateNumber) {
      if (!plateNumber) {
        return { valid: false, message: '请输入车牌号' };
      }

      const invalidCharsRegex = /[^\u4e00-\u9fa5a-zA-Z0-9]/;
      if (invalidCharsRegex.test(plateNumber)) {
        return { valid: false, message: '车牌号不能包含空格或特殊字符' };
      }
      
      try {
        // 调用查询车牌号是否存在的接口
        const response = await queryOffSiteVehicle(this.aid, plateNumber);
        
        // 根据接口返回判断车牌号是否可用
        if (response.msg === "正常") {
          // 车牌号不存在，可以使用
          return { valid: true };
        } else if (response.msg === "车辆已存在") {
          // 车牌号已存在
          return { valid: false, message: '该车牌号已被注册' };
        } else {
          // 其他情况
          return { valid: false, message: '车牌号验证失败，请重试' };
        }
      } catch (error) {
        console.error('车牌号验证失败:', error);
        return { valid: false, message: '车牌号验证失败，请稍后重试' };
      }
    },
    async submitWithPlateNumber() {
      if (!this.plateNumber) {
        this.showErrorNotification('请输入车牌号');
        return;
      }
      
      this.validateLoading = true;
      try {
        // 验证车牌号
        const validateResult = await this.validatePlateNumber(this.plateNumber);
        if (!validateResult.valid) {
          this.showErrorNotification(validateResult.message);
          this.validateLoading = false;
          return;
        }
        
        // 验证通过，关闭对话框并开始请求
        this.dialogVisible = false;
        this.loading = true;
        
        const data = {
          companyId: this.aid,
          type: '2',
          extParam: this.plateNumber
        };

        request.post('/api/pay/url', data).then(res => {
          window.location.href = res;
        }).catch(err => {
          this.showErrorNotification(err.message || '获取支付链接失败，请稍后重试');
        }).finally(() => {
          this.loading = false;
        });
      } catch (error) {
        this.showErrorNotification('验证车牌号时发生错误');
        console.error('验证车牌号时发生错误:', error);
      } finally {
        this.validateLoading = false;
      }
    }
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
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.7;
}

.btn:not([disabled]):hover {
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
}
</style>
