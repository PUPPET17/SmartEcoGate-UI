<template>
  <el-row :gutter="10">
    <el-col :xs="24" :sm="24" :md="6" class="card-box">
      <el-card class="custom-card">
        <template #header>
          <span>接入流程</span>
        </template>
        <VueFlow :nodes="nodes" :edges="edges" class="flow-chart">
          <Background pattern-color="#aaa" :gap="14" variant="dots" />
          <MiniMap class="hide-on-mobile" />
        </VueFlow>
      </el-card>
    </el-col>

    <el-col :xs="24" :sm="24" :md="9" class="card-box">
      <el-card class="custom-card">
        <template #header>
          <span>离线日志</span>
        </template>
        <OfflineLog />
      </el-card>
    </el-col>

    <el-col :xs="24" :sm="24" :md="9" class="card-box">
      <el-card class="custom-card fixed-height-card" style="margin-bottom: 10px;">
        <template #header>
          <div class="card-header-with-button">
            <span>在线情况</span>
          </div>
        </template>

        <el-form>
          <el-row :gutter="10">
            <el-col :xs="24" :sm="14">
              <el-form-item label="企业名称" prop="companyId" class="mobile-form-item">
                <el-select v-model="selectedCompanyId" placeholder="请选择企业" clearable filterable class="full-width-select">
                  <el-option v-for="item in enterpriseIds" :key="item.companyId" :label="item.companyName"
                    :value="item.companyId" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="10">
              <el-form-item class="mobile-form-item">
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

      <el-card class="custom-card fixed-height-card" style="margin-top: 10px;">
        <template #header>
          <div class="card-header-with-button">
            <span>最新管控措施</span>
            <el-button type="primary" link icon="Plus" @click="goToControlRule" class="mobile-button">管理管控规则</el-button>
          </div>
        </template>

        <el-form>
          <el-row :gutter="10">
            <el-col :xs="24" :sm="14">
              <el-form-item label="企业名称" prop="companyId" class="mobile-form-item">
                <el-select v-model="selectedControlCompanyId" placeholder="请选择企业" clearable filterable class="full-width-select">
                  <el-option v-for="item in enterpriseIds" :key="item.companyId" :label="item.companyName"
                    :value="item.companyId" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="10">
              <el-form-item class="mobile-form-item">
                <el-button type="info" plain icon="InfoFilled" @click="getLatestControl(selectedControlCompanyId)"
                  :disabled="!selectedControlCompanyId" class="full-width-button">查询最新管控</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>

        <div class="status-list scrollable-content">
          <!-- 管理员且未选择企业时显示企业列表 -->
          <template v-if="userStore.roles.includes('admin') && !selectedControlCompanyId">
            <div v-for="item in enterpriseIds" :key="item.companyId" class="status-item">
              <div class="status-content">
                <span class="interface-name clickable" @click="handleControlCompanyClick(item.companyId)">
                  {{ item.companyName }}
                </span>
              </div>
            </div>
          </template>
          <!-- 选择企业后或非管理员时显示管控信息 -->
          <template v-else>
            <div v-if="controlInfo" class="control-info">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="预警等级">
                  <el-tag :type="getWarningLevelType(controlInfo.warningLevel)">
                    {{ getWarningLevelText(controlInfo.warningLevel) }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="响应等级">
                  <el-tag :type="getResponseLevelType(controlInfo.responseLevel)">
                    {{ getResponseLevelText(controlInfo.responseLevel) }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="管控时间" :span="2">
                  {{ controlInfo.startTime }} 至 {{ controlInfo.endTime }}
                </el-descriptions-item>
                <el-descriptions-item label="管控措施" :span="2">
                  <div class="control-measures">
                    <template v-if="controlInfo.controlMeasure">
                      <template v-if="/^\d+$/.test(controlInfo.controlMeasure)">
                        {{ getMeasureText(controlInfo.controlMeasure) }}
                      </template>
                      <template v-else>
                        <template v-if="getVehicleTypes(controlInfo.controlMeasure).length > 0 || getEmissionStandards(controlInfo.controlMeasure).length > 0">
                          <div v-if="getVehicleTypes(controlInfo.controlMeasure).length > 0" class="measure-item">
                            <div class="measure-label">限行车辆类型：</div>
                            <div class="measure-content">{{ getVehicleTypes(controlInfo.controlMeasure).join('、') }}</div>
                          </div>
                          <div v-if="getEmissionStandards(controlInfo.controlMeasure).length > 0" class="measure-item">
                            <div class="measure-label">限行排放阶段：</div>
                            <div class="measure-content">{{ getEmissionStandards(controlInfo.controlMeasure).join('、') }}</div>
                          </div>
                        </template>
                        <template v-else>
                          {{ controlInfo.controlMeasure }}
                        </template>
                      </template>
                    </template>
                  </div>
                </el-descriptions-item>
              </el-descriptions>
            </div>
            <div v-else class="empty-container">
              <el-empty description="暂无管控措施" />
            </div>
          </template>
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
import { queryLatestControl } from "@/api/system/measure";
import { useRouter } from 'vue-router';

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

const selectedControlCompanyId = ref(null);
const controlInfo = ref(null);

// 获取最新管控措施
const getLatestControl = async (companyId) => {
  if (!companyId) {
    return;
  }
  try {
    const response = await queryLatestControl(companyId);
    if (response.code === 200) {
      controlInfo.value = response.data;
    }
  } catch (error) {
    console.error('获取最新管控措施失败:', error);
  }
};

onMounted(() => {
  const initialize = async () => {
    await getEnterpriseList();
    if (!userStore.roles.includes('admin') && enterpriseIds.value.length > 0) {
      selectedCompanyId.value = enterpriseIds.value[0].companyId;
      selectedControlCompanyId.value = enterpriseIds.value[0].companyId;
      await getLatestControl(selectedControlCompanyId.value);
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

const handleCompanyClick = (companyId) => {
  selectedCompanyId.value = companyId;
};

// 添加 watch
watch(selectedControlCompanyId, async (newCompanyId) => {
  if (newCompanyId) {
    await getLatestControl(newCompanyId);
  } else {
    controlInfo.value = null;
  }
});

// 添加辅助函数
const getWarningLevelText = (level) => {
  const levels = {
    '1': '一级预警',
    '2': '二级预警',
    '3': '三级预警',
    '4': '四级预警',
    '5': '五级预警'
  };
  return levels[level] || `${level}级预警`;
};

const getWarningLevelType = (level) => {
  const types = {
    '1': 'danger',
    '2': 'danger',
    '3': 'warning',
    '4': 'warning',
    '5': 'info'
  };
  return types[level] || '';
};

const getResponseLevelText = (level) => {
  const levels = {
    '1': '一级响应',
    '2': '二级响应',
    '3': '三级响应',
    '4': '四级响应',
    '5': '五级响应'
  };
  return levels[level] || `${level}级响应`;
};

const getResponseLevelType = (level) => {
  const types = {
    '1': 'danger',
    '2': 'warning',
    '3': 'info',
  };
  return types[level] || '';
};

const getMeasureText = (measure) => {
  const measureMap = {
    '1': '禁行国三及以下重型柴油车（燃气）车通行',
    '2': '禁行国四及以下重型柴油（燃气）车通行',
    '3': '禁行国四及以下重型柴油与国五及以下燃气车通行',
    '4': '停止公路运输'
  };
  return measureMap[measure] || measure;
};

const getVehicleTypes = (measure) => {
  if (!measure) return [];
  const match = measure.match(/限行车辆类型：(.*?)(?=，|$)/);
  return match ? match[1].split(' ').filter(Boolean) : [];
};

const getEmissionStandards = (measure) => {
  if (!measure) return [];
  const match = measure.match(/限行排放阶段：(.*?)(?=，|$)/);
  return match ? match[1].split(' ').filter(Boolean) : [];
};

const handleControlCompanyClick = (companyId) => {
  selectedControlCompanyId.value = companyId;
};

const router = useRouter();

const goToControlRule = () => {
  router.push('/controlRule');
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
  position: relative;
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

.card-header-with-button {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.empty-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
}

.el-empty {
  padding: 0;
  margin: 0;
}

/* 移动端适配样式 */
@media screen and (max-width: 768px) {
  .card-box {
    margin-top: 10px;
  }

  .custom-card {
    margin-bottom: 10px;
  }

  .flow-chart {
    height: 50vh;
  }

  .hide-on-mobile {
    display: none !important;
  }

  .mobile-form-item {
    margin-bottom: 10px;
  }

  .full-width-select {
    width: 100%;
  }

  .full-width-button {
    width: 100%;
  }

  .mobile-button {
    font-size: 12px;
    padding: 4px 8px;
  }

  .status-item {
    flex-direction: column;
    gap: 5px;
  }

  .status-time {
    align-self: flex-start;
    margin-left: 20px;
  }

  .el-descriptions {
    width: 100%;
  }

  .el-descriptions__cell {
    padding: 8px !important;
  }

  .measure-item {
    flex-direction: column;
    margin-bottom: 8px;
  }

  .measure-label {
    margin-bottom: 4px;
  }

  .card-header-with-button {
    flex-wrap: wrap;
    gap: 8px;
  }

  .scrollable-content {
    max-height: 40vh;
  }

  /* 优化表单在移动端的显示 */
  :deep(.el-form-item__label) {
    float: none;
    display: block;
    text-align: left;
    margin-bottom: 8px;
  }

  :deep(.el-form-item__content) {
    margin-left: 0 !important;
  }

  /* 优化switch在移动端的显示 */
  :deep(.el-switch__label) {
    font-size: 12px;
  }
}

/* 添加平滑过渡效果 */
.el-col {
  transition: all 0.3s ease-in-out;
}

.custom-card {
  transition: all 0.3s ease-in-out;
}

/* 优化滚动条样式 */
.scrollable-content {
  scrollbar-width: thin;
  scrollbar-color: #909399 #f4f4f5;
}

.scrollable-content::-webkit-scrollbar {
  width: 6px;
}

.scrollable-content::-webkit-scrollbar-track {
  background: #f4f4f5;
  border-radius: 3px;
}

.scrollable-content::-webkit-scrollbar-thumb {
  background: #909399;
  border-radius: 3px;
}

/* 优化加载状态显示 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
</style>