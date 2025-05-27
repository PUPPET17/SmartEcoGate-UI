<template>
  <div class="navbar">
    <hamburger id="hamburger-container" :is-active="appStore.sidebar.opened" class="hamburger-container"
      @toggleClick="toggleSideBar" />
    <breadcrumb id="breadcrumb-container" class="breadcrumb-container" v-if="!settingsStore.topNav" />
    <top-nav id="topmenu-container" class="topmenu-container" v-if="settingsStore.topNav" />

    <div class="right-menu">
      <template v-if="appStore.device !== 'mobile'">
        <div class="notice-container right-menu-item" v-if="showNotice" :class="{ 'hidden': isHeaderSearchActive }">
          <el-tooltip :content="expirationNotice" placement="bottom" effect="dark">
            <div class="scrolling-text">
              {{ expirationNotice }}
            </div>
          </el-tooltip>
        </div>

        <header-search id="header-search" class="right-menu-item" @click="handleHeaderSearchClick" />

        <!-- <el-tooltip content="源码地址" effect="dark" placement="bottom">
          <ruo-yi-git id="ruoyi-git" class="right-menu-item hover-effect" />
        </el-tooltip>

        <el-tooltip content="文档地址" effect="dark" placement="bottom">
          <ruo-yi-doc id="ruoyi-doc" class="right-menu-item hover-effect" />
        </el-tooltip> -->

        <screenfull id="screenfull" class="right-menu-item hover-effect" />

        <el-tooltip content="布局大小" effect="dark" placement="bottom">
          <size-select id="size-select" class="right-menu-item hover-effect" />
        </el-tooltip>
      </template>
      <div class="avatar-container">
        <el-dropdown @command="handleCommand" class="right-menu-item hover-effect" trigger="click">
          <div class="avatar-wrapper">
            <img :src="userStore.avatar" class="user-avatar" />
            <el-icon><caret-bottom /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <router-link to="/user/profile">
                <el-dropdown-item>个人中心</el-dropdown-item>
              </router-link>
              <el-dropdown-item command="payQrOrder" v-if="selectedCompanyId">
                <span>续费</span>
              </el-dropdown-item>
              <el-dropdown-item command="setLayout" v-if="settingsStore.showSettings">
                <span>布局设置</span>
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <span>退出登录</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 修改支付弹窗 -->
    <el-dialog v-model="showPayDialog" :title="showQrCode ? '扫码支付' : '服务续费'" width="400px" :close-on-click-modal="false"
      :close-on-press-escape="false" :show-close="!isExpired" @closed="closePayDialog">
      <div v-if="!showQrCode" class="order-container">
        <el-skeleton :rows="3" animated v-if="!serviceInfo" />
        <template v-else>
          <div class="service-info">
            <h3>{{ serviceInfo.subject }}</h3>
            <div class="price">￥{{ (serviceInfo.amount / 100).toFixed(2) }}</div>
            <div class="description">{{ serviceInfo.body }}</div>
            <div v-if="isExpired" class="expired-notice">您的企业服务已过期，需要续费后才能继续使用系统</div>
          </div>
          <div class="quantity-selector">
            <span class="label">续费年数：</span>
            <el-input-number v-model="quantity" :min="1" :max="99" size="small" />
            <span class="unit">年</span>
          </div>
          <div class="total-amount">
            <span>总计：</span>
            <span class="amount">￥{{ ((serviceInfo.amount * quantity) / 100).toFixed(2) }}</span>
          </div>
        </template>
      </div>

      <div v-else class="qr-container">
        <el-empty v-if="payDialogLoading" description="正在生成支付二维码..." />
        <template v-else>
          <div v-if="qrCodeUrl" class="qr-wrapper">
            <img :src="qrCodeUrl" alt="支付二维码" class="qr-code" />
            <p class="qr-tip">请使用微信扫描二维码完成支付</p>
            <p class="amount-tip">支付金额：￥{{ ((serviceInfo?.amount * quantity) / 100).toFixed(2) }}</p>
          </div>
          <el-empty v-else description="获取支付二维码失败" />
        </template>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closePayDialog" v-if="!isExpired">{{ showQrCode ? '关闭' : '取消' }}</el-button>
          <el-button type="danger" @click="logout">退出登录</el-button>
          <template v-if="!showQrCode">
            <el-button type="primary" @click="handleCreateOrder" :loading="!serviceInfo">
              确认下单
            </el-button>
          </template>
          <template v-else>
            <el-button type="primary" @click="payQrOrder" :loading="payDialogLoading">
              刷新二维码
            </el-button>
          </template>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ElMessageBox, ElMessage } from 'element-plus'
import Breadcrumb from '@/components/Breadcrumb'
import TopNav from '@/components/TopNav'
import Hamburger from '@/components/Hamburger'
import Screenfull from '@/components/Screenfull'
import SizeSelect from '@/components/SizeSelect'
import HeaderSearch from '@/components/HeaderSearch'
import useAppStore from '@/store/modules/app'
import useUserStore from '@/store/modules/user'
import { selectAllIds } from "@/api/system/info";
import { checkIfExpired } from '@/api/system/expire'
import { getQrPayUrl, getSeviceFee } from '@/api/system/paymentConfig'
import useSettingsStore from '@/store/modules/settings'
import { ref, computed, watch } from 'vue'
import { getSelectMessageTemplate } from '@/api/system/messageTemplate'

const appStore = useAppStore()
const userStore = useUserStore()
const settingsStore = useSettingsStore()
const enterpriseIds = ref([]);
const selectedCompanyId = ref(null);
const selectedCompanyName = ref('');
const expirationNotice = ref('');
const showPayDialog = ref(false)
const qrCodeUrl = ref('')
const payDialogLoading = ref(false)
const serviceInfo = ref(null)
const quantity = ref(1)
const showQrCode = ref(false)
const isExpired = ref(false)

const showNotice = computed(() => {
  const isNotAdmin = !userStore.roles.includes('admin')
  const isNotCommon = !userStore.roles.includes('common')
  const shouldShow = isNotAdmin && isNotCommon 
  
  console.log('调试信息：', {
    isNotAdmin,
    isNotCommon,
    expirationNoticeValue: expirationNotice.value,
    shouldShow
  })
  
  return shouldShow
})

const isHeaderSearchActive = ref(false)

function handleHeaderSearchClick() {
  isHeaderSearchActive.value = !isHeaderSearchActive.value
}

function toggleSideBar() {
  appStore.toggleSideBar()
}

function handleCommand(command) {
  switch (command) {
    case "setLayout":
      setLayout();
      break;
    case "logout":
      logout();
      break;
    case "payQrOrder":
      payQrOrder();
      break;
    default:
      break;
  }
}

function logout() {
  ElMessageBox.confirm('确定注销并退出系统吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logOut().then(() => {
      location.href = '/index';
    })
  }).catch(() => { });
}

function handleButtonClick() {
  ElMessageBox.alert('按钮被点击了！', '提示', {
    confirmButtonText: '确定'
  });
}

function handleMouseOver() {
  console.log('鼠标悬停在按钮上');
}

function handleMouseLeave() {
  console.log('鼠标离开按钮');
}

async function  getEnterpriseList() {
  try {
    const response = await selectAllIds();
    if (!response) {
      return;
    }

    enterpriseIds.value = response.rows || [];

    if (!userStore.roles.includes('admin') && !userStore.roles.includes('common') && enterpriseIds.value.length > 0) {
      selectedCompanyId.value = enterpriseIds.value[0].companyId;
      selectedCompanyName.value = enterpriseIds.value[0].companyName;
    }
  } catch (error) {
    if (error.response) {
      console.error('错误响应数据:', error.response.data);
      console.error('错误状态码:', error.response.status);
    }
  }
}

async function checkExpiration() {
  if (!selectedCompanyId.value) {
    console.error('企业ID为空');
    return;
  }

  try {
    const result = await checkIfExpired(selectedCompanyId.value);

    if (result) {
      const expireDate = new Date(result.exprieDate);
      const today = new Date();
      const daysRemaining = Math.ceil((expireDate - today) / (1000 * 60 * 60 * 24));
      
      // 设置是否过期的状态
      isExpired.value = result.isExpired || daysRemaining <= 0;

      // 获取消息模板
      const getTemplate = async (massageType) => {
        try {
          const templateRes = await getSelectMessageTemplate({
            companyId: selectedCompanyId.value,
            massageType: massageType
          });
          if (templateRes.code === 200 && templateRes.data) {
            return templateRes.data.messageTemplate;
          }
          return null;
        } catch (error) {
          console.error('获取消息模板失败:', error);
          return null;
        }
      };

      let messageTemplate;
      let title;
      let type;

      if (daysRemaining <= 0) {
        // 已过期 - 假设 massageType = 1 表示过期模板
        messageTemplate = await getTemplate(1);
        title = '服务过期提醒';
        type = 'error';
      } else if (daysRemaining <= 30) {
        // 即将过期 - 假设 massageType = 2 表示即将过期模板
        messageTemplate = await getTemplate(2);
        title = '服务到期提醒';
        type = 'warning';
      }

      if (daysRemaining <= 30) {
        // 处理模板内容
        let content = '';
        if (messageTemplate) {
          try {
            // messageTemplate已经是对象，不需要JSON.parse
            content = messageTemplate.content || '';
            // 替换模板中的变量
            content = content.replace(/\${companyName}/g, result.companyName)
                          .replace(/\${daysRemaining}/g, daysRemaining);
          } catch (error) {
            console.error('解析消息模板失败:', error);
            // 使用默认提醒内容
            content = daysRemaining <= 0 
              ? `${result.companyName}的企业服务已过期。为避免数据丢失，请您尽快完成续费。如需帮助，请联系技术支持。`
              : `提醒：${result.companyName}的企业服务将在${daysRemaining}天后到期。为确保业务不受影响，建议您及时续费。`;
          }
        } else {
          // 使用默认提醒内容
          content = daysRemaining <= 0 
            ? `${result.companyName}的企业服务已过期。为避免数据丢失，请您尽快完成续费。如需帮助，请联系技术支持。`
            : `提醒：${result.companyName}的企业服务将在${daysRemaining}天后到期。为确保业务不受影响，建议您及时续费。`;
        }

        expirationNotice.value = content;
        
        ElMessageBox.alert(content, title, {
          confirmButtonText: '确定',
          type: type,
          showClose: !isExpired.value,
          closeOnClickModal: !isExpired.value, 
          closeOnPressEscape: !isExpired.value,
          callback: (action) => {
            if (action === 'confirm') {
              // 可以在这里添加点击确定后的操作，比如跳转到续费页面
              payQrOrder();
            }
          }
        }).catch(() => {
          // 如果已过期且用户尝试关闭弹窗，强制显示续费窗口
          if (isExpired.value) {
            payQrOrder();
          }
        });
        
        // 如果已过期，直接打开支付对话框
        if (isExpired.value) {
          payQrOrder();
        }
      } else {
        expirationNotice.value = `${result.companyName}的企业服务有效期还剩${daysRemaining}天。如需续费，请提前安排。`;
      }
    }
    return result;
  } catch (error) {
    console.error('检查过期状态时出错:', error?.response?.data || error);
    return null;
  }
}

// 监听 selectedCompanyId 的变化
watch(selectedCompanyId, async (newVal) => {
  if (newVal) {
    await checkExpiration();
    await getSubject();
  }
});

// 页面加载时获取企业列表
getEnterpriseList();

const emits = defineEmits(['setLayout'])
function setLayout() {
  emits('setLayout')
}

async function getSubject() {
  const res = await getSeviceFee(selectedCompanyId.value);
  if (res.code === 200) {
    serviceInfo.value = res.data;
  } else {
    ElMessage.error(res.msg || '获取服务费失败');
  }
}

async function payQrOrder() {
  if (!selectedCompanyId.value) {
    ElMessage.warning('未选择企业，无法获取支付信息');
    return;
  }

  if (!showQrCode.value) {
    showPayDialog.value = true;
    await getSubject();
    return;
  }

  payDialogLoading.value = true;
  try {
    const data = {
      companyId: selectedCompanyId.value,
      type: '1',
      quantity: quantity.value
    };
    const res = await getQrPayUrl(data);
    if (res) {
      qrCodeUrl.value = res;
    } else {
      ElMessage.error(res.msg || '获取支付二维码失败');
    }
  } catch (error) {
    console.error('获取支付二维码出错:', error);
    ElMessage.error('获取支付二维码失败，请稍后重试');
  } finally {
    payDialogLoading.value = false;
  }
}

function handleCreateOrder() {
  if (quantity.value < 1) {
    ElMessage.warning('请选择有效的购买数量');
    return;
  }
  showQrCode.value = true;
  payQrOrder();
}

function closePayDialog() {
  // 如果已过期，不允许关闭对话框
  if (isExpired.value) {
    return;
  }
  
  showPayDialog.value = false;
  showQrCode.value = false;
  qrCodeUrl.value = '';
  quantity.value = 1;
}
</script>

<style lang='scss' scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .topmenu-container {
    position: absolute;
    left: 50px;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;
    display: flex;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }

    .avatar-container {
      margin-right: 40px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        i {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }

    .notice-container {
      max-width: 600px;
      overflow: hidden;
      padding: 0 15px;
      transition: opacity 0.3s ease;

      &.hidden {
        opacity: 0;
        width: 0;
        padding: 0;
      }

      .scrolling-text {
        white-space: nowrap;
        animation: scrollText 10s linear infinite;
        color: #E6A23C;
        font-size: 18px;
      }
    }

    @keyframes scrollText {
      0% {
        transform: translateX(100%);
      }

      100% {
        transform: translateX(-100%);
      }
    }
  }
}

.order-container {
  padding: 20px 0;

  .service-info {
    text-align: center;
    margin-bottom: 20px;

    h3 {
      margin: 0 0 10px;
      font-size: 18px;
      color: #303133;
    }

    .price {
      font-size: 24px;
      color: #F56C6C;
      margin: 10px 0;
      font-weight: bold;
    }

    .description {
      color: #909399;
      font-size: 14px;
    }
    
    .expired-notice {
      margin-top: 12px;
      color: #F56C6C;
      font-weight: bold;
      font-size: 14px;
      padding: 8px;
      border: 1px solid #F56C6C;
      border-radius: 4px;
      background-color: #FEF0F0;
    }
  }

  .quantity-selector {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 20px 0;

    .label {
      margin-right: 10px;
      color: #606266;
    }

    .unit {
      margin-left: 10px;
      color: #606266;
    }
  }

  .total-amount {
    text-align: right;
    margin-top: 20px;
    padding-right: 20px;

    .amount {
      font-size: 20px;
      color: #F56C6C;
      font-weight: bold;
      margin-left: 10px;
    }
  }
}

.qr-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;

  .qr-wrapper {
    text-align: center;

    .qr-code {
      max-width: 200px;
      max-height: 200px;
    }

    .qr-tip {
      margin-top: 15px;
      color: #909399;
      font-size: 14px;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
