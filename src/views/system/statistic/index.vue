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
      <!-- <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['system:statistic:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['system:statistic:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['system:statistic:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['system:statistic:export']">导出</el-button>
      </el-col> -->
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Upload" :disabled="multiple" @click="handleBatchReAuth"
          v-hasPermi="['system:statistic:list']">批量重新上传</el-button>
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
      <el-table-column label="当日企业车辆台账总数" align="center" prop="vehicleNum" />
      <el-table-column label="当日企业厂内车辆总数" align="center" prop="inVehicleNum" />
      <el-table-column label="当天非道路车辆数目总数" align="center" prop="nrVehicleNum" />
      <el-table-column label="当天车辆过车记录总数" align="center" prop="vehiclePassingNum" />
      <el-table-column label="当天厂内车辆过车记录总数" align="center" prop="inVehiclePassingNum" />
      <el-table-column label="当天非道路机械过车记录总数" align="center" prop="nrVehiclePassingNum" />
      <el-table-column label="当天货物台账记录总数" align="center" prop="cargoLedgerNum" />
      <el-table-column label="当天违规车辆核查记录总数" align="center" prop="checkVehicleNum" />
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
      <el-table-column label="状态" align="center" prop="state">
        <template #default="scope">
          <dict-tag :options="certified" :value="scope.row.state" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <!-- <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['system:statistic:edit']">修改</el-button> -->
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['system:statistic:remove']">删除</el-button>
          <el-button link type="primary" icon="Upload" @click="handleReAuth(scope.row)"
            v-hasPermi="['system:statistic:list']">重新上传</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改唐山日上报对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="statisticRef" :model="form" :rules="rules" label-width="80px">
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Statistic">
import { listStatistic, getStatistic, delStatistic, addStatistic, updateStatistic, reAuthStatistic } from "@/api/system/statistic";
import { selectIds } from "@/api/system/info";

const { proxy } = getCurrentInstance();
const { certified } = proxy.useDict('certified');

const statisticList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const daterangeRecordDate = ref([]);
const daterangeUploadDate = ref([]);
const enterpriseIds = ref([]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    companyId: null,
    recordDate: null,
    uploadDate: null,
    state: null,
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询唐山日上报列表 */
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
  listStatistic(queryParams.value).then(response => {
    statisticList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
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
    companyId: null,
    vehicleNum: null,
    inVehicleNum: null,
    nrVehicleNum: null,
    vehiclePassingNum: null,
    inVehiclePassingNum: null,
    nrVehiclePassingNum: null,
    cargoLedgerNum: null,
    checkVehicleNum: null,
    recordDate: null,
    uploadDate: null,
    state: null,
    userId: null,
    deptId: null
  };
  proxy.resetForm("statisticRef");
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

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加唐山日上报";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getStatistic(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改唐山日上报";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["statisticRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateStatistic(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addStatistic(form.value).then(response => {
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
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除唐山日上报编号为"' + _ids + '"的数据项？').then(function () {
    return delStatistic(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/statistic/export', {
    ...queryParams.value
  }, `statistic_${new Date().getTime()}.xlsx`)
}

/** 重新上传按钮操作 */
function handleReAuth(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认重新上传该统计数据？').then(function() {
    return reAuthStatistic(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("重新上传成功");
  }).catch(() => {});
}

/** 批量重新上传按钮操作 */
function handleBatchReAuth() {
  proxy.$modal.confirm('是否确认批量重新上传所选统计数据？').then(function() {
    return reAuthStatistic(ids.value);
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
