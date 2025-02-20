<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="企业名称" prop="companyName">
        <el-tooltip class="item" effect="light" content="支持输入过滤" placement="bottom" popper-class="fade">
          <el-select v-model="queryParams.companyId" placeholder="请选择企业" clearable filterable style="width: 180px;">
            <el-option v-for="item in enterpriseIds" :key="item.companyId" :label="item.companyName"
              :value="item.companyId" />
          </el-select>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="道闸编号" prop="gateSn">
        <el-input v-model="queryParams.gateSn" placeholder="请输入道闸编号" clearable style="width: 180px" />
      </el-form-item>
      <el-form-item label="记录日期" style="width: 308px">
        <el-date-picker v-model="daterangeRecordDate" value-format="YYYY-MM-DD" type="daterange" range-separator="-"
          start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
      </el-form-item>
      <el-form-item label="上传日期" style="width: 308px">
        <el-date-picker v-model="daterangeUploadDate" value-format="YYYY-MM-DD" type="daterange" range-separator="-"
          start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
      </el-form-item>
      <el-form-item label="状态" prop="state">
        <el-select v-model="queryParams.state" placeholder="请选择状态" clearable>
          <el-option v-for="dict in certified" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Upload" :disabled="multiple" @click="handleBatchReAuth"
          v-hasPermi="['api:TransitStatisticTj:list']">批量重新上传</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="statisticList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="企业名称" align="center" show-overflow-tooltip>
        <template #default="scope">
          {{ getCompanyName(scope.row.companyId) }}
        </template>
      </el-table-column>
      <el-table-column label="道闸编号" align="center" prop="gateSn" />
      <el-table-column label="出入口编号" align="center" prop="entranceNo" />
      <el-table-column label="记录数" align="center" prop="recordNum" />
      <el-table-column label="记录日期" align="center" prop="recordDate" width="120">
        <template #default="scope">
          <span>{{ parseTime(scope.row.recordDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="上传日期" align="center" prop="uploadDate" width="120">
        <template #default="scope">
          <span>{{ parseTime(scope.row.uploadDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="state" width="120">
        <template #default="scope">
          <dict-tag :options="certified" :value="scope.row.state" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['api:TransitStatisticTj:remove']">删除</el-button>
          <el-button link type="primary" icon="Upload" @click="handleReAuth(scope.row)"
            v-hasPermi="['api:TransitStatisticTj:list']">重新上传</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />
  </div>
</template>

<script setup name="StatisticTj">
import { listTransitStatisticTj, delTransitStatisticTj, reAuthTransitStatisticTj } from "@/api/system/statisticTj";
import { selectIds } from "@/api/system/info";

const { proxy } = getCurrentInstance();
const { certified } = proxy.useDict('certified');

const statisticList = ref([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const daterangeRecordDate = ref([]);
const daterangeUploadDate = ref([]);
const enterpriseIds = ref([]);

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    companyId: null,
    gateSn: null,
    recordDate: null,
    uploadDate: null,
    state: null,
  }
});

const { queryParams } = toRefs(data);

/** 查询天津日上报列表 */
function getList() {
  loading.value = true;
  queryParams.value.params = {};
  if (null != daterangeRecordDate && '' != daterangeRecordDate) {
    queryParams.value.params["beginRecordDate"] = daterangeRecordDate.value[0];
    queryParams.value.params["endRecordDate"] = daterangeRecordDate.value[1];
  }
  if (null != daterangeUploadDate && '' != daterangeUploadDate) {
    queryParams.value.params["beginUploadDate"] = daterangeUploadDate.value[0];
    queryParams.value.params["endUploadDate"] = daterangeUploadDate.value[1];
  }
  listTransitStatisticTj(queryParams.value).then(response => {
    statisticList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  daterangeRecordDate.value = [];
  daterangeUploadDate.value = [];
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除天津日上报编号为"' + _ids + '"的数据项？').then(function () {
    return delTransitStatisticTj(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 重新上传按钮操作 */
function handleReAuth(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认重新上传该统计数据？').then(function() {
    return reAuthTransitStatisticTj(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("重新上传成功");
  }).catch(() => {});
}

/** 批量重新上传按钮操作 */
function handleBatchReAuth() {
  proxy.$modal.confirm('是否确认批量重新上传所选统计数据？').then(function() {
    return reAuthTransitStatisticTj(ids.value);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("批量重新上传成功");
  }).catch(() => {});
}

const getCompanyName = (companyId) => {
  const company = enterpriseIds.value.find(item => item.companyId === companyId)
  return company ? company.companyName : companyId
}

async function getEnterpriseList() {
  try {
    const response = await selectIds();
    enterpriseIds.value = response.rows;
    console.log(enterpriseIds.value);
  } catch (error) {
    console.log("获取企业列表失败", error);
  }
}

getEnterpriseList();
getList();
</script> 