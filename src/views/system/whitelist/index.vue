<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="号牌号码" prop="plateNumber">
        <el-input v-model="queryParams.plateNumber" placeholder="请输入号牌号码" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['system:whitelist:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['system:whitelist:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['system:whitelist:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['system:whitelist:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="whitelistList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="所属省份" align="center" prop="province" />
      <el-table-column label="所属城市" align="center" prop="city" />
      <el-table-column label="品牌型号" align="center" prop="brandModel" />
      <el-table-column label="号牌号码" align="center" prop="plateNumber" />
      <el-table-column label="注册日期" align="center" prop="registerDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.registerDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="车辆类型" align="center" prop="vehicleType" />
      <el-table-column label="排放阶段" align="center" prop="emissionStandard" >
        <template #default="scope">
          <dict-tag :options="emission_standard" :value="scope.row.emissionStandard" />
        </template>
      </el-table-column>
      <el-table-column label="豁免类型" align="center" prop="exemptionType" />
      <el-table-column label="备注" align="center" prop="remarks" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['system:whitelist:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['system:whitelist:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改白名单车辆信息对话框 -->
    <el-dialog :title="title" v-model="open" width="700px" append-to-body>
      <el-form ref="whitelistRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="所属省份" prop="province">
          <el-input v-model="form.province" placeholder="请输入所属省份" />
        </el-form-item>
        <el-form-item label="所属城市" prop="city">
          <el-input v-model="form.city" placeholder="请输入所属城市" />
        </el-form-item>
        <el-form-item label="品牌型号" prop="brandModel">
          <el-input v-model="form.brandModel" placeholder="请输入品牌型号" />
        </el-form-item>
        <el-form-item label="号牌号码" prop="plateNumber">
          <el-input v-model="form.plateNumber" placeholder="请输入号牌号码" />
        </el-form-item>
        <el-form-item label="车辆别代号(VIN)" prop="vin">
          <el-input v-model="form.vin" placeholder="请输入车辆别代号(VIN)" />
        </el-form-item>
        <el-form-item label="注册日期" prop="registerDate" >
          <el-date-picker clearable v-model="form.registerDate" type="date" value-format="YYYY-MM-DD"
            placeholder="请选择注册日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="排放阶段" prop="emissionStandard">
          <el-select v-model="form.emissionStandard" placeholder="请选择排放阶段">
            <el-option v-for="dict in emission_standard" :key="dict.value" :label="dict.label"
              :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input v-model="form.remarks" placeholder="请输入备注" />
        </el-form-item>
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

<script setup name="Whitelist">
import { listWhitelist, getWhitelist, delWhitelist, addWhitelist, updateWhitelist } from "@/api/system/whitelist";
const { proxy } = getCurrentInstance();
const { emission_standard } = proxy.useDict
  ('emission_standard');

const whitelistList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    plateNumber: null,
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询白名单车辆信息列表 */
function getList() {
  loading.value = true;
  listWhitelist(queryParams.value).then(response => {
    whitelistList.value = response.rows;
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
    province: null,
    city: null,
    brandModel: null,
    plateNumber: null,
    vin: null,
    registerDate: null,
    vehicleType: null,
    emissionStandard: null,
    exemptionType: null,
    remarks: null
  };
  proxy.resetForm("whitelistRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
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
  title.value = "添加白名单车辆信息";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getWhitelist(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改白名单车辆信息";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["whitelistRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateWhitelist(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addWhitelist(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除白名单车辆信息编号为"' + _ids + '"的数据项？').then(function () {
    return delWhitelist(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/whitelist/export', {
    ...queryParams.value
  }, `whitelist_${new Date().getTime()}.xlsx`)
}

getList();
</script>
