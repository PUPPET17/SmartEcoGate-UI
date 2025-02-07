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
              <el-option v-for="dict in plate_color" :key="dict.value" :label="dict.label" :value="dict.value" />
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
        <!-- <el-col :span="6">
          <el-form-item label="货物来源地" prop="goodsOrigin">
            <el-tooltip class="item" effect="light" content="支持模糊搜索" placement="bottom" popper-class="fade">
              <el-input v-model="queryParams.goodsOrigin" placeholder="请输入货物来源地" clearable @keyup.enter="handleQuery" style="width: 180px;"/>
            </el-tooltip>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="货物目的地" prop="goodsDestination">
            <el-tooltip class="item" effect="light" content="支持模糊搜索" placement="bottom" popper-class="fade">
              <el-input v-model="queryParams.goodsDestination" placeholder="请输入货物目的地" clearable style="width: 180px;"
                @keyup.enter="handleQuery" />
            </el-tooltip>
          </el-form-item>
        </el-col> -->
        <el-col :span="12">
          <el-form-item label="创建时间" prop="dateRange">
            <el-date-picker v-model="dateRange" type="datetimerange" range-separator="至" start-placeholder="开始日期"
              end-placeholder="结束日期" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%;"
              @change="handleDateRangeChange" />
          </el-form-item>
        </el-col>
        <el-col :span = "12"></el-col>
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
        <el-button 
          :loading="exportingOffsite"
          @click="handleExportOffsite"
          v-hasPermi="['transit:record:export']"
        >
          <el-icon><Download /></el-icon>导出场外车辆台账
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button 
          :loading="exportingOnsite"
          @click="handleExportOnsite"
          v-hasPermi="['transit:record:export']"
        >
          <el-icon><Download /></el-icon>导出厂内车辆台账
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button 
          :loading="exportingMachine"
          @click="handleExportMachine"
          v-hasPermi="['transit:record:export']"
        >
          <el-icon><Download /></el-icon>导出非道路车辆台账
        </el-button>
      </el-col>
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
          <dict-tag :options="plate_color" :value="scope.row.plateColorType" />
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
      <el-table-column v-if="columns[8].visible" label="创建时间" align="center" prop="createDate" width="120">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createDate, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="columns[9].visible" label="通行状态" align="center" prop="state">
        <template #default="scope">
          <dict-tag :options="transit_status" :value="scope.row.state" />
        </template>
      </el-table-column>
      <el-table-column v-if="columns[14].visible" label="入场日期" align="center" prop="startDate" width="120">
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
      <el-table-column v-if="columns[18].visible" label="出场日期" align="center" prop="endDate" width="130">
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
      <el-table-column v-if="columns[24].visible" label="入场认证" align="center" prop="inboundCertStatus">
        <template #default="scope">
          <dict-tag :options="certified" :value="scope.row.inboundCertStatus" />
        </template>
      </el-table-column>
      <el-table-column v-if="columns[25].visible" label="出场认证" align="center" prop="outboundCertStatus">
        <template #default="scope">
          <dict-tag :options="certified" :value="scope.row.outboundCertStatus" />
        </template>
      </el-table-column>
      <el-table-column v-if="columns[26].visible" label="入场认证信息" align="center" prop="certMessage" width="120"
        show-overflow-tooltip />
      <el-table-column v-if="columns[13].visible" label="出场认证信息" align="center" prop="userName" width="120"
        show-overflow-tooltip />
      <el-table-column label="操作" align="center" fixed="right">
        <template #default="scope">
          <el-button size="small" icon="Delete" type="danger" @click="handleDelete(scope.row)"
            v-hasPermi="['transit:transitrecord:remove']" />
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" hide-on-single-page />
  </div>
</template>

<script setup name="Record">
import { listRecord, getRecord, delRecord, addRecord, updateRecord, reAuth } from "@/api/transit/record";
import { ref } from "vue";
import { selectIds } from "@/api/system/info";
import { getEmissionByPlateNo } from "@/api/system/emission";
import { ElNotification } from "element-plus";

const { proxy } = getCurrentInstance();
const { plate_color, classify_title, transit_status, certified, auto_cargo_info, inbound_outbound_access } = proxy.useDict('plate_color', 'classify_title', 'transit_status', 'certified', 'auto_cargo_info', 'inbound_outbound_access');

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

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    companyId: null,
    startTime: null,
    endTime: null,
    plateNo: null,
    plateColorType:null,
    goodsOrigin: null,
    goodsDestination: null,
    classifyTitle: null,
    outboundCertStatus: null,
    inboundCertStatus: null,
    state: null
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
    { key: 'goodsDestination', label: '货物目的地', visible: true }
  ]
});

const { queryParams, form, rules, columns } = toRefs(data);

/** 查询通行记录列表 */
async function getList() {
  loading.value = true;
  try {
    const response = await listRecord(queryParams.value);
    // 将主键 ID 转换为字符串
    const records = response.rows.map(item => ({
      ...item,
      state: item.state.toString(),
      id: item.id.toString()
    }));

    recordList.value = records;
    console.info(recordList.value);
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
    // console.log("企业列表：\n" + JSON.stringify(enterpriseIds.value));
  } catch (error) {
    console.log("获取企业列表失败", error);
  }
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
</style>