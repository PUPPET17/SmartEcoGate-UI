<template>
  <el-row>

    <el-col :span="6" class="card-box">
      <el-card class="custom-card">
        <template #header>
          <span>接入流程</span>
        </template>
        <VueFlow :nodes="nodes" :edges="edges" class="flow-chart">
          <Background pattern-color="#aaa" :gap="14" variant="dots" />
          <MiniMap />
        </VueFlow>
      </el-card>
    </el-col>

    <el-col :span="9" class="card-box">
        <el-card class="custom-card">
          <template #header>
            <span>离线日志</span>
          </template>
          <OfflineLog />
        </el-card>
    </el-col>

    <el-col :span="9" class="card-box">
      <el-card class="custom-card fixed-height-card">
        <template #header>
          <span>在线情况</span>
        </template>

        <el-form>
          <el-row :gutter="10">
            <el-col :span="14">
              <el-form-item label="企业名称" prop="companyId">
                <el-select v-model="selectedCompanyId" placeholder="请选择企业" clearable filterable>
                  <el-option v-for="item in enterpriseIds" :key="item.companyId" :label="item.companyName"
                    :value="item.companyId" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="0"></el-col>
            <el-col :span="8">
              <el-form-item>
                <el-switch v-model="showOfflineOnly" active-text="仅离线" inactive-text="全部" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>

        <div class="status-list scrollable-content">
          <div v-for="item in filteredInterfaceStatus" :key="item.name" class="status-item">
            <div class="status-content">
              <span class="status-dot" :style="{ backgroundColor: item.status ? 'green' : 'red' }"></span>
              <span class="interface-name clickable" :class="{ 'online': item.status, 'offline': !item.status }"
                @click="handleCompanyClick(item.companyId)">{{ item.name }}</span>
            </div>
            <div class="status-time">{{ formatTime(item.time) }}</div>
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup>
import { ref, reactive, onMounted, toRefs, computed, watch } from 'vue';
import { VueFlow, MarkerType } from "@vue-flow/core";
import { Background } from '@vue-flow/background'
import { MiniMap } from '@vue-flow/minimap'
import { selectIds, isAlive } from "@/api/system/info";
import { listCamera } from "@/api/system/camera";
import useUserStore from '@/store/modules/user';
import OfflineLog from '@/components/OfflineLog/index.vue';

const enterpriseIds = ref([]);
const nodes = ref([
  {
    id: "1",
    type: "input",
    position: { x: 190, y: 40 },
    data: { label: "添加企业(车厂)基本信息" },
    class: "bold-node",
    draggable: true
  },
  {
    id: "2",
    position: { x: 15, y: 145 },
    data: { label: "绑定系统账号" },
    class: "highlight-node",
    draggable: true
  },
  {
    id: "3",
    position: { x: 190, y: 245 },
    data: { label: "新增企业(车厂)道闸配置信息" },
    class: "bold-node",
    draggable: true
  },
  {
    id: "4",
    position: { x: 15, y: 365 },
    data: { label: "录入企业(车厂)车辆信息" },
    class: "bold-node",
    draggable: true
  }
]);

const edges = ref([
  {
    id: "e1->2",
    source: "1",
    target: "2",
    type: 'smoothstep',
    style: { stroke: '#3498db', strokeWidth: 2 },
    animated: true,
    markerEnd: MarkerType.Arrow
  },
  {
    id: "e2->3",
    source: "2",
    target: "3",
    type: 'smoothstep',
    style: { stroke: '#3498db', strokeWidth: 2 },
    animated: true,
    markerEnd: MarkerType.Arrow
  },
  {
    id: "e3->4",
    source: "3",
    target: "4",
    type: 'smoothstep',
    style: { stroke: '#3498db', strokeWidth: 2 },
    animated: true,
    markerEnd: MarkerType.Arrow
  },
  {
    id: "e4->5",
    source: "4",
    target: "5",
    type: 'smoothstep',
    style: { stroke: '#3498db', strokeWidth: 2 },
    animated: true,
    markerEnd: MarkerType.Arrow
  },
]);

const interfaceStatus = ref([]);

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    companyId: null,
    gateId: null,
    identifier: null,
    cameraBrand: null,
    cameraModel: null,
    cameraSn: null,
    screenBrand: null,
    screenModel: null,
    screenSn: null,
    entranceNo: null,
    turnNo: null,
    ip: null,
    port: null,
    username: null,
    password: null,
    channels: null,
    captureType: null,
    entranceFlag: null,
    isValid: null,
    gateType: null,
    createdDate: null,
    updatedDate: null,
    vedioSrc: null,
    vedioReplay: null,
    cameraName: null,
    message: null,
    violationCamSn: null
  }
});

const { queryParams } = toRefs(data);

const getInterfaceStatus = async () => {
  try {
    const req = {
      enterpriseReqList: enterpriseIds.value,
      cameraReqList: cameraList.value
    };
    const response = await isAlive(req);
    console.log("API 响应：", response);
    interfaceStatus.value = response;
  } catch (error) {
    console.error('获取接口状态失败:', error);
  }
};

const selectedCompanyId = ref(null);
const userStore = useUserStore();

const showOfflineOnly = ref(false);

const filteredInterfaceStatus = computed(() => {
  let filtered = [];

  // 如果是管理员且没有选择特定企业，显示所有企业的接口状态
  if (userStore.roles.includes('admin') && !selectedCompanyId.value) {
    filtered = interfaceStatus.value.filter(item => item.type === 1);
  } else if (selectedCompanyId.value) {
    // 根据选择的企业过滤显示
    filtered = interfaceStatus.value.filter(item =>
      item.companyId === selectedCompanyId.value
    );
  }

  // 根据离线状态过滤
  if (showOfflineOnly.value) {
    filtered = filtered.filter(item => !item.status);
  }

  return filtered;
});

function formatTime(time) {
  if (!time) return '';

  // 直接解析后端返回的时间字符串
  const [, month, day, timeStr, , year] = time.split(' ');
  const [hours, minutes, seconds] = timeStr.split(':');

  // 月份映射
  const monthMap = {
    'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
    'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
    'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
  };

  return `${year}/${monthMap[month]}/${day.padStart(2, '0')} ${hours}:${minutes}:${seconds}`;
}

const cameraList = ref([]);
const loading = ref(true);

async function getCameraList(companyId = null) {
  loading.value = true;
  try {
    const params = { ...queryParams.value };
    if (companyId) {
      params.companyId = companyId;
    }
    const response = await listCamera(params);
    loading.value = false;
    return response;
  } catch (error) {
    console.error("获取相机列表失败", error);
    loading.value = false;
    return { rows: [] };
  }
}

// 监听选择的企业ID变化
watch(selectedCompanyId, async (newCompanyId) => {
  if (newCompanyId) {
    const response = await getCameraList(newCompanyId);
    const uniqueCameras = new Set([...cameraList.value.map(cam => JSON.stringify(cam))]);
    response.rows.forEach(camera => {
      uniqueCameras.add(JSON.stringify(camera));
    });
    cameraList.value = Array.from(uniqueCameras).map(cam => JSON.parse(cam));
    // 获取新的相机列表后，更新接口状态
    getInterfaceStatus();
  }
});

onMounted(() => {
  const initialize = async () => {
    await getEnterpriseList();
    if (!userStore.roles.includes('admin') && enterpriseIds.value.length > 0) {
      selectedCompanyId.value = enterpriseIds.value[0].companyId;
    }
    // 如果是普通企业用户，只获取自己企业的相机列表
    if (!userStore.roles.includes('admin')) {
      const response = await getCameraList(selectedCompanyId.value);
      cameraList.value = response.rows;
    }
    getInterfaceStatus();
  };

  initialize();
  setInterval(getInterfaceStatus, 60000);
});

async function getEnterpriseList() {
  try {
    const response = await selectIds();
    enterpriseIds.value = response.rows;
  } catch (error) {
    console.log("获取企业列表失败", error);
  }
}

getEnterpriseList();

const handleCompanyClick = (companyId) => {
  selectedCompanyId.value = companyId;
};
</script>

<style>
@import "@vue-flow/core/dist/style.css";
@import "@vue-flow/core/dist/theme-default.css";

.card-box {
  margin-top: 10px;
}

.small-card-box {
  margin-top: 5px;
}

.custom-card {
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.flow-chart {
  height: 75vh;
  width: 100%;
  margin: 0 auto;
  border-radius: 10px;
}

.highlight-node {
  border: 2px solid #ff0000;
  background-color: #ffe6e6;
  font-weight: bold;
  font-size: 18px;
  color: #e62121;
}

.bold-node {
  font-weight: bold;
  font-size: 15px;
  color: #1a1a1a;
}

.status-list {
  padding: 10px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
  flex-wrap: wrap;
  width: 100%;
}

.status-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-indicator {
  width: 60px;
  text-align: center;
}

.interface-name {
  font-size: 14px;
  color: #333;
}

.status-time {
  color: #999;
  font-size: 12px;
}

.status-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 5px;
}

.fixed-height-card {
  min-height: 50%;
  max-height: 50%;
  display: flex;
  flex-direction: column;
}

.el-form {
  flex: 0 0 auto;
  padding: 10px;
  margin-bottom: 10px;
}

.status-list.scrollable-content {
  flex: 1 1 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 5px;
  min-height: 200px;
  height: 0;
}

.clickable {
  cursor: pointer;
  position: relative;
  padding: 2px 4px;
  transition: all 0.3s ease;
  border-radius: 4px;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    transition: width 0.3s ease;
  }

  &:hover {
    color: #141414;
    background-color: rgba(0, 0, 0, 0);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgb(255, 255, 255);

    &::after {
      width: 100%;
    }
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 4px rgb(255, 255, 255);
  }
}

.online::after {
  background: linear-gradient(90deg, #67C23A, #67C23A);
}

.offline::after {
  background: linear-gradient(90deg, #F56C6C, #F56C6C);
}

/* 添加离线日志卡片的样式 */
.fixed-height-card :deep(.el-card__body) {
  height: calc(100% - 55px);
  overflow: hidden;
  padding: 0;
}

.fixed-height-card :deep(.app-container) {
  height: 100%;
  padding: 10px;
  overflow: auto;
}
</style>