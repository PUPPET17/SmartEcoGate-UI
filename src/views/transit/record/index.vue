<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="90px"
      label-position="left">
      <el-row :gutter="0">
        <el-col :span="6">
          <el-form-item label="企业名称" prop="companyName">
            <el-tooltip class="item" effect="light" content="支持输入过滤" placement="bottom" popper-class="fade">
              <el-select v-model="queryParams.companyId" placeholder="请选择企业" clearable filterable style="width: 180px;">
                <el-option v-for="item in enterpriseIds" :key="item.companyId" :label="item.companyName"
                  :value="item.companyId" />
              </el-select>
            </el-tooltip>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="车牌号码" prop="plateNo">
            <el-tooltip class="item" effect="light" content="支持模糊搜索" placement="bottom" popper-class="fade">
              <el-input v-model="queryParams.plateNo" placeholder="请输入车牌号码" clearable @keyup.enter="handleQuery"
                style="width: 180px;" />
            </el-tooltip>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="车牌颜色" prop="plateColorType" style="margin-bottom: 18px;">
            <el-select v-model="queryParams.plateColorType" placeholder="请选择车牌颜色" clearable style="width: 180px;">
              <el-option v-for="dict in plate_color_type" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="车辆类型" prop="classifyTitle" style="margin-bottom: 18px;">
            <el-select v-model="queryParams.classifyTitle" placeholder="请选择车辆类型" clearable style="width: 180px;">
              <el-option v-for="dict in classify_title" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="排放标准" prop="emissionStage" style="margin-bottom: 18px;">
            <el-select v-model="queryParams.emissionStage" placeholder="请选择排放标准" clearable style="width: 180px;">
              <el-option v-for="dict in emission_standard" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="创建时间" prop="dateRange">
            <el-date-picker v-model="dateRange" type="datetimerange" range-separator="至" start-placeholder="开始日期"
              end-placeholder="结束日期" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%;"
              @change="handleDateRangeChange" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="入场补录方式" prop="isInboundAutoEntry" label-width="100px">
            <el-select v-model="queryParams.isInboundAutoEntry" placeholder="请选择入场补录方式" style="width: 170px;">
              <el-option v-for="item in auto_cargo_info" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="出场补录方式" prop="isOutboundAutoEntry" label-width="100px">
            <el-select v-model="queryParams.isOutboundAutoEntry" placeholder="请选择出场补录方式" style="width: 170px;">
              <el-option v-for="item in auto_cargo_info" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col> 
        <el-col :span="6">
          <el-form-item label="通行状态" prop="state">
            <el-select v-model="queryParams.state" placeholder="请选择通行状态" clearable style="width: 180px;">
              <el-option v-for="dict in transit_status" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="入场认证状态" prop="inboundCertStatus" label-width="100px">
            <el-select v-model="queryParams.inboundCertStatus" placeholder="请选择入场认证状态" style="width: 180px;">
              <el-option v-for="item in certified" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="出场认证状态" prop="outboundCertStatus" label-width="100px">
            <el-select v-model="queryParams.outboundCertStatus" placeholder="请选择出场认证状态" style="width: 180px;">
              <el-option v-for="item in certified" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6"></el-col>
        
        <el-col :span="24" style="text-align: left;margin-bottom: 20px;">
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Refresh" :disabled="multiple" @click="handleReAuth">重新上传记录</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Warning" :disabled="multiple" @click="checkBlacklist">检查黑名单</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" :type="isVioMode ? 'success' : 'primary'" plain icon="Warning" @click="toggleVioMode">
          {{ isVioMode ? '正常记录' : '违规记录' }}
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button :loading="exportingOffsite" @click="handleExportOffsite" v-hasPermi="['transit:record:export']">
          <el-icon>
            <Download />
          </el-icon>导出场外车辆台账
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button :loading="exportingOnsite" @click="handleExportOnsite" v-hasPermi="['transit:record:export']">
          <el-icon>
            <Download />
          </el-icon>导出厂内车辆台账
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button :loading="exportingMachine" @click="handleExportMachine" v-hasPermi="['transit:record:export']">
          <el-icon>
            <Download />
          </el-icon>导出非道路车辆台账
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button :loading="exportingMachine" @click="handleExportLangFang" v-hasPermi="['transit:record:export']">
          <el-icon>
            <Download />
          </el-icon>廊坊导出通行记录
        </el-button>
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button type="warning" plain icon="Refresh" :disabled="multiple"
          @click="handleReAuthLedger">重新补录记录</el-button>
      </el-col> -->
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="recordList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column v-if="columns[0].visible" label="公司名称" align="center" prop="areaName" />
      <el-table-column v-if="columns[1].visible" label="车牌号码" align="center" prop="plateNo" width="100" />
      <el-table-column v-if="columns[2].visible" label="车辆类型" align="center" prop="classifyTitle">
        <template #default="scope">
          <dict-tag :options="classify_title" :value="scope.row.classifyTitle" />
        </template>
      </el-table-column>
      <el-table-column v-if="columns[3].visible" label="车牌颜色码" align="center" prop="plateColorType">
        <template #default="scope">
          <dict-tag :options="plate_color_type" :value="scope.row.plateColorType" />
        </template>
      </el-table-column>
      <el-table-column v-if="columns[4].visible" label="入场照片" align="center" prop="inImg" width="100">
        <template #default="scope">
          <image-preview :src="scope.row.inImg" :width="50" :height="50" />
        </template>
      </el-table-column>
      <el-table-column v-if="columns[5].visible" label="入场车身照片" align="center" prop="inSmallImg" width="100">
        <template #default="scope">
          <image-preview :src="scope.row.inSmallImg" :width="50" :height="50" />
        </template>
      </el-table-column>
      <el-table-column v-if="columns[6].visible" label="出场照片" align="center" prop="outImg" width="100">
        <template #default="scope">
          <image-preview :src="scope.row.outImg" :width="50" :height="50" />
        </template>
      </el-table-column>
      <el-table-column v-if="columns[7].visible" label="出场车身照片" align="center" prop="outSmallImg" width="100">
        <template #default="scope">
          <image-preview :src="scope.row.outSmallImg" :width="50" :height="50" />
        </template>
      </el-table-column>
      <!-- <el-table-column v-if="columns[8].visible" label="创建时间" align="center" prop="createDate" width="96">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createDate, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column> -->
      <el-table-column v-if="columns[9].visible" label="通行状态" align="center" prop="state">
        <template #default="scope">
          <dict-tag :options="transit_status" :value="scope.row.state" />
        </template>
      </el-table-column>
      <el-table-column v-if="columns[14].visible" label="入场日期" align="center" prop="startDate" width="96">
        <template #default="scope">
          <span>{{ parseTime(scope.row.startDate, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="columns[10].visible" label="入场放行状态" align="center" prop="inboundAccess" width="120"
        show-overflow-tooltip>
        <template #default="scope">
          <dict-tag :options="inbound_outbound_access" :value="scope.row.inboundAccess" />
        </template>
      </el-table-column>
      <el-table-column v-if="columns[18].visible" label="出场日期" align="center" prop="endDate" width="96">
        <template #default="scope">
          <span>{{ parseTime(scope.row.endDate, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="columns[11].visible" label="出场放行状态" align="center" prop="outboundAccess" width="120"
        show-overflow-tooltip>
        <template #default="scope">
          <dict-tag :options="inbound_outbound_access" :value="scope.row.outboundAccess" />
        </template>
      </el-table-column>
      <el-table-column label="认证状态" align="center" width="140">
        <template #default="scope">
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="margin-right: 8px;">入场:</span>
              <dict-tag :options="certified" :value="scope.row.inboundCertStatus" />
              <el-tooltip v-if="scope.row.certMessage" :content="scope.row.certMessage" placement="top">
                <el-icon style="margin-left: 2px;">
                  <InfoFilled />
                </el-icon>
              </el-tooltip>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="margin-right: 8px;">出场:</span>
              <dict-tag :options="certified" :value="scope.row.outboundCertStatus" />
              <el-tooltip v-if="scope.row.userName" :content="scope.row.userName" placement="top">
                <el-icon style="margin-left: 2px;">
                  <InfoFilled />
                </el-icon>
              </el-tooltip>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column v-if="columns[12].visible" label="电话号码" align="center" prop="tel" />


      <el-table-column v-if="columns[15].visible" label="入场货物名称" align="center" prop="inboundName" />
      <el-table-column v-if="columns[16].visible" label="入场货物质量" align="center" prop="inboundVolume" />
      <el-table-column v-if="columns[17].visible" label="入场货物单位" align="center" prop="inboundUnit" />

      <el-table-column v-if="columns[19].visible" label="出场货物名称" align="center" prop="outboundName" />
      <el-table-column v-if="columns[20].visible" label="出场货物质量" align="center" prop="outboundVolume" />
      <el-table-column v-if="columns[21].visible" label="出场货物单位" align="center" prop="outboundUnit" />
      <el-table-column v-if="columns[27].visible" label="货物来源地" align="center" prop="goodsOrigin" />
      <el-table-column v-if="columns[28].visible" label="货物目的地" align="center" prop="goodsDestination" />
      <el-table-column v-if="columns[22].visible" label="入场自动补录" align="center" prop="isInboundAutoEntry">
        <template #default="scope">
          <dict-tag :options="auto_cargo_info" :value="scope.row.isInboundAutoEntry" />
        </template>
      </el-table-column>
      <el-table-column v-if="columns[23].visible" label="出场自动补录" align="center" prop="isOutboundAutoEntry">
        <template #default="scope">
          <dict-tag :options="auto_cargo_info" :value="scope.row.isOutboundAutoEntry" />
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" min-width="120" fixed="right">
        <template #default="scope">
          <div class="operation-container">
            <template v-if="needLedger(scope.row.companyId)">
              <div class="ledger-status">
                <el-tag size="small" :type="getLedgerStatusType(ledgerInfo[scope.row.id]?.inStatus)" class="status-tag">
                  入场{{ getLedgerStatusText(ledgerInfo[scope.row.id]?.inStatus) }}
                </el-tag>
                <el-tag size="small" :type="getLedgerStatusType(ledgerInfo[scope.row.id]?.outStatus)"
                  class="status-tag">
                  出场{{ getLedgerStatusText(ledgerInfo[scope.row.id]?.outStatus) }}
                </el-tag>
              </div>
              <el-button link type="warning" size="small" @click="handleReAuthLedger(scope.row)"
                v-if="ledgerInfo[scope.row.id]?.inStatus === 2 || ledgerInfo[scope.row.id]?.outStatus === 2">
                <el-icon>
                  <Refresh />
                </el-icon>
                <span class="reauth-text">重新补录</span>
              </el-button>
              <el-button link type="primary" size="small" @click="handleSupplementCargo(scope.row)">
                <el-icon>
                  <EditPen />
                </el-icon>
                <span class="supplement-text">补录货物</span>
              </el-button>
            </template>
            <el-button link type="primary" size="small" @click="handlePlayVideo(scope.row)"
              v-if="scope.row.cameraId || scope.row.outCameraId">
              <el-icon>
                <VideoPlay />
              </el-icon>
              <span class="play-text">查看视频</span>
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(scope.row)"
              v-hasPermi="['transit:transitrecord:remove']">
              <el-icon>
                <Delete />
              </el-icon>
              <span class="delete-text">删除</span>
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" hide-on-single-page />

    <!-- 视频播放弹窗 -->
    <el-dialog v-model="videoDialog.visible" title="通行视频"
      :width="(videoDialog.inUrl && videoDialog.outUrl) ? '80%' : '40%'" :close-on-click-modal="false"
      :close-on-press-escape="false" @close="handleCloseVideo" class="video-dialog">
      <div class="video-container" :class="{ 'single-video': !(videoDialog.inUrl && videoDialog.outUrl) }">
        <div v-if="videoDialog.inUrl" class="video-box">
          <div class="video-title">入场视频</div>
          <video ref="inVideoRef" controls autoplay class="video-player" :src="videoDialog.inUrl"
            type="video/mp4"></video>
        </div>
        <div v-if="videoDialog.outUrl" class="video-box">
          <div class="video-title">出场视频</div>
          <video ref="outVideoRef" controls autoplay class="video-player" :src="videoDialog.outUrl"
            type="video/mp4"></video>
        </div>
      </div>
    </el-dialog>

    <!-- 货物信息补录弹窗 -->
    <cargo-supplement-dialog
      v-model:visible="cargoSupplementVisible"
      :record="currentRecord"
      :ledger-info="currentLedgerInfo"
      @refresh="getList"
    />
  </div>
</template>

<script setup name="Record">
import { listRecord, getRecord, delRecord, addRecord, updateRecord, reAuth, getLedgerInfo, reAuthLedger, getRecordVideoUrl, listVio } from "@/api/transit/record";
import { ref } from "vue";
import { selectIds } from "@/api/system/info";
import { getEmissionByPlateNo } from "@/api/system/emission";
import { ElNotification } from "element-plus";
import { VideoPlay, InfoFilled, EditPen, Refresh } from '@element-plus/icons-vue';
import CargoSupplementDialog from './cargoSupplementDialog.vue';

const { proxy } = getCurrentInstance();
const { plate_color_type, classify_title, transit_status, certified, auto_cargo_info, inbound_outbound_access } = proxy.useDict('plate_color_type', 'classify_title', 'transit_status', 'certified', 'auto_cargo_info', 'inbound_outbound_access');

// 自定义排放标准字典
const emission_standard = ref([
  { value: '4', label: '国四及以下' },
  { value: '5', label: '国五' },
  { value: '6', label: '国六' },
  { value: '7', label: '国七' },
  { value: 'D', label: '电动' },
  { value: 'X', label: '排放标准未知' }
]);

const recordList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const dateRange = ref([]);
const enterpriseIds = ref([]);
const exportingOffsite = ref(false);
const exportingOnsite = ref(false);
const exportingMachine = ref(false);
const exportingLangFang = ref(false);
const ledgerInfo = ref({});
const enterpriseMap = ref({});
const isVioMode = ref(false);

// 视频播放相关
const videoDialog = ref({
  visible: false,
  inUrl: '',
  outUrl: ''
});
const inVideoRef = ref(null);
const outVideoRef = ref(null);

const currentRecord = ref(null);
const currentLedgerInfo = ref(null);
const cargoSupplementVisible = ref(false);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    companyId: null,
    startTime: null,
    endTime: null,
    plateNo: null,
    plateColorType: null,
    goodsOrigin: null,
    goodsDestination: null,
    classifyTitle: null,
    outboundCertStatus: null,
    inboundCertStatus: null,
    state: null,
    emissionStage: null
  },
  rules: {
  },
  columns: [
    { key: 'areaName', label: '公司名称', visible: true },
    { key: 'plateNo', label: '车牌号码', visible: true },
    { key: 'classifyTitle', label: '车辆类型', visible: true },
    { key: 'plateColorType', label: '车牌颜色', visible: true },
    { key: 'inImg', label: '入场照片', visible: true },
    { key: 'inSmallImg', label: '入场车身照片', visible: true },
    { key: 'outImg', label: '出场照片', visible: true },
    { key: 'outSmallImg', label: '出场车身照片', visible: true },
    { key: 'createDate', label: '创建时间', visible: true },
    { key: 'state', label: '通行状态', visible: true },
    { key: 'inboundAccess', label: '入场放行状态', visible: true },
    { key: 'outboundAccess', label: '出场放行状态', visible: true },
    { key: 'tel', label: '电话号码', visible: false },
    { key: 'userName', label: '出场认证信息', visible: true },
    { key: 'startDate', label: '入场日期', visible: true },
    { key: 'inboundName', label: '入场货物名称', visible: true },
    { key: 'inboundVolume', label: '入场货物质量', visible: true },
    { key: 'inboundUnit', label: '入场货物单位', visible: true },
    { key: 'endDate', label: '出场日期', visible: true },
    { key: 'outboundName', label: '出场货物名称', visible: true },
    { key: 'outboundVolume', label: '出场货物质量', visible: true },
    { key: 'outboundUnit', label: '出场货物单位', visible: true },
    { key: 'isInboundAutoEntry', label: '入场自动补录', visible: true },
    { key: 'isOutboundAutoEntry', label: '出场自动补录', visible: true },
    { key: 'inboundCertStatus', label: '入场认证状态', visible: true },
    { key: 'outboundCertStatus', label: '出场认证状态', visible: true },
    { key: 'certMessage', label: '入场认证信息', visible: true },
    { key: 'goodsOrigin', label: '货物来源地', visible: true },
    { key: 'goodsDestination', label: '货物目的地', visible: true },
    { key: 'inLedgerStatus', label: '入场补录状态', visible: true },
    { key: 'outLedgerStatus', label: '出场补录状态', visible: true }
  ]
});

const { queryParams, form, rules, columns } = toRefs(data);

/** 查询通行记录列表 */
async function getList() {
  loading.value = true;
  try {
    const response = await (isVioMode.value ? listVio(queryParams.value) : listRecord(queryParams.value));
    // 将主键 ID 转换为字符串
    const records = response.rows.map(item => ({
      ...item,
      state: item.state.toString(),
      id: item.id.toString()
    }));

    recordList.value = records;

    // 获取所有记录的ID
    const recordIds = records.map(record => record.id);
    if (recordIds.length > 0) {
      // 查询补录情况
      const ledgerResponse = await getLedgerInfo(recordIds);
      if (ledgerResponse.code === 200) {
        // 将补录信息转换为以记录ID为key的对象，方便查找
        ledgerInfo.value = ledgerResponse.data.reduce((acc, item) => {
          acc[item.recordId] = item;
          return acc;
        }, {});
      }
    }

    total.value = response.total;
  } catch (error) {
    console.error('获取通行记录列表失败:', error);
  } finally {
    loading.value = false;
  }
}

/** 检查黑名单状态 */
async function checkBlacklist() {
  const selectedRecords = recordList.value.filter(record => ids.value.includes(record.id));

  for (let record of selectedRecords) {
    try {
      const blacklistResponse = await getEmissionByPlateNo('1', record.plateNo);
      console.info("黑名单状态：" + JSON.stringify(blacklistResponse));
      const isBlacklist = blacklistResponse.msg !== "未查询到排放数据";
      console.info("黑名单状态：" + isBlacklist);
      if (isBlacklist) {
        ElNotification({
          title: '黑名单提醒',
          message: `车牌号 ${record.plateNo} 在黑名单中`,
          type: 'warning',
          position: 'bottom-right',
          duration: 0
        });
        record.isBlacklist = true;
      } else {
        ElNotification({
          title: '检查结果',
          message: `车牌号 ${record.plateNo} 不在黑名单中`,
          type: 'success',
          position: 'bottom-right',
          duration: 3000
        });
        record.isBlacklist = false;
      }
    } catch (error) {
      console.error('检查黑名单状态失败:', error);
      ElNotification({
        title: '检查失败',
        message: `车牌号 ${record.plateNo} 检查失败: ${error.message}`,
        type: 'error',
        position: 'bottom-right',
        duration: 3000
      });
    }
  }
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    createDate: null,
    areaName: null,
    companyId: null,
    plateNo: null,
    carSize: null,
    carType: null,
    cashierID: null,
    classifyTitle: null,
    plateColor: null,
    plateColorType: null,
    cost: null,
    inImg: null,
    inSmallImg: null,
    outSmallImg: null,
    outImg: null,
    paidFee: null,
    parkingType: null,
    state: null,
    statisticsId: null,
    stopTime: null,
    tel: null,
    unitPrice: null,
    userName: null,
    cameraSn: null,
    cameraId: null,
    cameraName: null,
    startDate: null,
    inboundName: null,
    inboundVolume: null,
    inboundUnit: null,
    endDate: null,
    outboundName: null,
    outboundVolume: null,
    outboundUnit: null,
    goodsOrigin: null,
    goodsDestination: null,
    isInboundAutoEntry: null,
    isOutboundAutoEntry: null,
    inboundCertStatus: null,
    outboundCertStatus: null,
    certMessage: null
  };
  proxy.resetForm("transitrecordRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = [];
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加通行记录";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getRecord(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改通行记录";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["recordRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateRecord(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addRecord(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const records = row.id ? [row] : recordList.value.filter(record => ids.value.includes(record.id));

  // 筛选出未认证的记录
  const unCertifiedRecords = records.filter(record =>
    record.inboundCertStatus !== '1' && record.outboundCertStatus !== '1'
  );

  if (unCertifiedRecords.length === 0) {
    ElNotification({
      title: '提示',
      message: '选中的记录均为已认证数据，无法删除',
      type: 'warning',
      duration: 3000
    });
    return;
  }

  if (unCertifiedRecords.length < records.length) {
    ElNotification({
      title: '提示',
      message: '已自动排除已认证的记录',
      type: 'warning',
      duration: 3000
    });
  }

  const _ids = unCertifiedRecords.map(record => record.id);
  proxy.$modal.confirm(`是否确认删除选中的 ${unCertifiedRecords.length} 条记录？`).then(function () {
    const res = delRecord(_ids);
    console.info("删除结果：" + JSON.stringify(res));
    return res;
  }).then(() => {
    getList();
    ElNotification({
      title: '成功',
      message: '删除成功',
      type: 'success',
      duration: 2000
    });
  }).catch(() => { });
}

/** 重新上传通行记录数据 */
function handleReAuth() {
  let _ids = ids.value;
  _ids = Array.isArray(_ids) ? _ids : [_ids];
  proxy.$modal.confirm('是否重新上传编号为"' + _ids + '"的记录？').then(function () {
    return reAuth(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("重新上传成功");
  }).catch(() => { });
}

/** 导出按钮操作 */
async function handleExportOffsite() {
  try {
    exportingOffsite.value = true;
    ElNotification({
      title: '导出进度',
      message: '正在导出数据，请稍候...',
      type: 'info',
      position: 'bottom-right',
      duration: 0
    });

    // 使用 timeout 确保请求不会无限等待
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('导出请求超时')), 30000); // 30秒超时
    });

    // 实际的导出请求
    const exportPromise = proxy.download('transit/record/export/offsite', {
      ...queryParams.value
    }, `record_${new Date().getTime()}.xlsx`);

    // 使用 Promise.race 处理超时情况
    await Promise.race([exportPromise, timeoutPromise]);

    ElNotification.closeAll();
    ElNotification.success('导出成功');
  } catch (error) {
    console.error('导出失败:', error);
    ElNotification.closeAll();
    ElNotification.error(error.message || '导出失败，请重试');
  } finally {
    exportingOffsite.value = false;
  }
}

async function handleExportOnsite() {
  try {
    exportingOnsite.value = true;
    ElNotification({
      title: '导出进度',
      message: '正在导出数据，请稍候...',
      type: 'info',
      position: 'bottom-right',
      duration: 0
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('导出请求超时')), 30000);
    });

    const exportPromise = proxy.download('transit/record/export/onsite', {
      ...queryParams.value
    }, `record_${new Date().getTime()}.xlsx`);

    await Promise.race([exportPromise, timeoutPromise]);

    ElNotification.closeAll();
    ElNotification.success('导出成功');
  } catch (error) {
    console.error('导出失败:', error);
    ElNotification.closeAll();
    ElNotification.error(error.message || '导出失败，请重试');
  } finally {
    exportingOnsite.value = false;
  }
}

async function handleExportMachine() {
  try {
    exportingMachine.value = true;
    ElNotification({
      title: '导出进度',
      message: '正在导出数据，请稍候...',
      type: 'info',
      position: 'bottom-right',
      duration: 0
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('导出请求超时')), 30000);
    });

    const exportPromise = proxy.download('transit/record/export/machine', {
      ...queryParams.value
    }, `record_${new Date().getTime()}.xlsx`);

    await Promise.race([exportPromise, timeoutPromise]);

    ElNotification.closeAll();
    ElNotification.success('导出成功');
  } catch (error) {
    console.error('导出失败:', error);
    ElNotification.closeAll();
    ElNotification.error(error.message || '导出失败，请重试');
  } finally {
    exportingMachine.value = false;
  }
}

async function handleExportLangFang() {
  try {
    exportingLangFang.value = true;
    ElNotification({
      title: '导出进度',
      message: '正在导出数据，请稍候...',
      type: 'info',
      position: 'bottom-right',
      duration: 0
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('导出请求超时')), 30000);
    });

    const exportPromise = proxy.download('transit/record/export/lf', {
      ...queryParams.value
    }, `record_${new Date().getTime()}.xlsx`);

    await Promise.race([exportPromise, timeoutPromise]);

    ElNotification.closeAll();
    ElNotification.success('导出成功');
  } catch (error) {
    console.error('导出失败:', error);
    ElNotification.closeAll();
    ElNotification.error(error.message || '导出失败，请重试');
  } finally {
    exportingMachine.value = false;
  }
}

// 处理日期范围变化
function handleDateRangeChange(val) {
  if (val) {
    queryParams.value.startTime = val[0];
    queryParams.value.endTime = val[1];
  } else {
    queryParams.value.startTime = null;
    queryParams.value.endTime = null;
  }
}

async function getEnterpriseList() {
  try {
    const response = await selectIds();
    enterpriseIds.value = response.rows;
    // 将企业信息转换为以 companyId 为键的对象，方便查找
    enterpriseMap.value = response.rows.reduce((acc, item) => {
      acc[item.companyId] = item;
      return acc;
    }, {});
  } catch (error) {
    console.log("获取企业列表失败", error);
  }
}

// 添加判断企业是否需要补录的函数
const needLedger = (companyId) => {
  const enterprise = enterpriseMap.value[companyId];
  return enterprise && (enterprise.apiStrategy === 2 || enterprise.apiStrategy === 3);
};

// 修改状态判断函数
const getLedgerStatusType = (status) => {
  if (status === 1) {
    return 'success'; // 已补录使用绿色
  } else if (status === undefined || status === null) {
    return 'info'; // 未知状态使用info
  } else {
    return 'warning'; // 未补录状态使用警告色
  }
};

const getLedgerStatusText = (status) => {
  if (status === 1) {
    return '已补录';
  } else if (status === undefined || status === null) {
    return '未知';
  } else {
    return '未补录';
  }
};

// 重新补录处理函数
function handleReAuthLedger(row) {
  let _ids = row ? [row.id] : ids.value;
  _ids = Array.isArray(_ids) ? _ids : [_ids];

  proxy.$modal.confirm('是否重新补录编号为"' + _ids + '"的记录？').then(function () {
    return reAuthLedger(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("重新补录提交成功");
  }).catch(() => { });
}

// 处理视频播放
async function handlePlayVideo(row) {
  try {
    videoDialog.value.visible = true;
    const response = await getRecordVideoUrl(row);
    if (response.code === 200) {
      videoDialog.value.inUrl = response.data.in;
      videoDialog.value.outUrl = response.data.out;
    } else {
      throw new Error(response.msg || '获取视频地址失败');
    }
  } catch (error) {
    console.error('获取视频地址失败:', error);
    ElNotification({
      title: '错误',
      message: error.message || '获取视频地址失败',
      type: 'error',
      duration: 3000
    });
    videoDialog.value.visible = false;
  }
}

// 处理视频弹窗关闭
function handleCloseVideo() {
  if (inVideoRef.value) {
    inVideoRef.value.pause();
    inVideoRef.value.currentTime = 0;
  }
  if (outVideoRef.value) {
    outVideoRef.value.pause();
    outVideoRef.value.currentTime = 0;
  }
  videoDialog.value.inUrl = '';
  videoDialog.value.outUrl = '';
}

// 切换违规记录查询模式
function toggleVioMode() {
  isVioMode.value = !isVioMode.value;
  handleQuery();
}

// 处理补录货物信息
function handleSupplementCargo(row) {
  currentRecord.value = row;
  currentLedgerInfo.value = ledgerInfo.value[row.id] || {};
  cargoSupplementVisible.value = true;
}

getEnterpriseList();
getList();
</script>
<style scoped>
.custom-style .el-segmented {
  --el-segmented-item-selected-color: #F2F6FC;
  --el-segmented-item-selected-bg-color: #409EFF;
  --el-border-radius-base: 12px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease-in-out;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.operation-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 4px;
}

.ledger-status {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.status-tag {
  width: 100%;
  text-align: center;
  margin: 0;
  font-size: 12px;
  padding: 0 8px;
  height: 24px;
  line-height: 24px;
}

/* 为不同状态的标签添加特定样式 */
.status-tag.el-tag--success {
  background-color: var(--el-color-success-light-9);
  border-color: var(--el-color-success-light-5);
  color: var(--el-color-success);
}

.status-tag.el-tag--danger {
  background-color: var(--el-color-danger-light-9);
  border-color: var(--el-color-danger-light-5);
  color: var(--el-color-danger);
}

.status-tag.el-tag--warning {
  background-color: var(--el-color-warning-light-9);
  border-color: var(--el-color-warning-light-5);
  color: var(--el-color-warning);
}

.delete-text {
  margin-left: 4px;
}

/* 删除按钮悬停效果 */
.el-button.el-button--danger.el-button--link:hover {
  opacity: 0.8;
}

/* 确保图标和文字垂直对齐 */
.el-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.reauth-text {
  margin-left: 4px;
}

.el-button.el-button--warning.el-button--link {
  margin-bottom: 4px;
}

.el-button.el-button--warning.el-button--link:hover {
  opacity: 0.8;
}

.video-container {
  display: flex;
  gap: 20px;
  justify-content: center;
  width: 100%;
}

.video-container.single-video {
  gap: 0;
}

.video-container.single-video .video-box {
  flex: none;
  width: 100%;
  max-width: none;
}

.video-box {
  flex: 1;
  width: 50%;
  min-width: 300px;
  max-width: 600px;
}

.video-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
  color: var(--el-text-color-primary);
}

.video-player {
  width: 100%;
  aspect-ratio: 16 / 9;
  max-height: 70vh;
  border-radius: 4px;
  background-color: #000;
  object-fit: contain;
}

:deep(.video-dialog .el-dialog__body) {
  padding: 20px;
}

.play-text {
  margin-left: 4px;
}

/* 确保按钮垂直居中对齐 */
.operation-container .el-button {
  margin: 2px 0;
}
</style>