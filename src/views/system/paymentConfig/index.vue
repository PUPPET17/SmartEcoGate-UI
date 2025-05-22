<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="appId" prop="appId">
        <el-input v-model="queryParams.appId" placeholder="请输入appId" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="apiKey" prop="apiKey">
        <el-input v-model="queryParams.apiKey" placeholder="请输入apiKey" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="商户号" prop="mchNo">
        <el-input v-model="queryParams.mchNo" placeholder="请输入商户号" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['system:paymentConfig:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['system:paymentConfig:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['system:paymentConfig:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['system:paymentConfig:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="paymentConfigList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="企业名称" align="center" width="120" show-overflow-tooltip>
        <template #default="scope">
          {{ getCompanyName(scope.row.companyId) }}
        </template>
      </el-table-column>
      <el-table-column label="AppId" align="center" prop="appId" />
      <el-table-column label="ApiKey" align="center" prop="apiKey" />
      <el-table-column label="商户号" align="center" prop="mchNo" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['system:paymentConfig:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['system:paymentConfig:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改支付配置对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="paymentConfigRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="企业名称" prop="companyId">
              <el-select v-model="form.companyId" placeholder="请选择企业" clearable filterable>
                <el-option v-for="item in enterpriseIds" :key="item.companyId" :label="item.companyName"
                  :value="item.companyId" />
              </el-select>
            </el-form-item>
        <el-form-item label="AppId" prop="appId">
          <el-input v-model="form.appId" placeholder="请输入AppId" />
        </el-form-item>
        <el-form-item label="ApiKey" prop="apiKey">
          <el-input v-model="form.apiKey" placeholder="请输入ApiKey" />
        </el-form-item>
        <el-form-item label="商户号" prop="mchNo">
          <el-input v-model="form.mchNo" placeholder="请输入商户号" />
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

<script setup name="PaymentConfig">
import { listPaymentConfig, getPaymentConfig, delPaymentConfig, addPaymentConfig, updatePaymentConfig } from "@/api/system/paymentConfig";
import { selectIds } from "@/api/system/info";
const { proxy } = getCurrentInstance();

const paymentConfigList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const enterpriseIds = ref([]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    appId: null,
    apiKey: null,
    mchNo: null,
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询支付配置列表 */
function getList() {
  loading.value = true;
  listPaymentConfig(queryParams.value).then(response => {
    paymentConfigList.value = response.rows;
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
    appId: null,
    apiKey: null,
    mchNo: null,
    createTime: null,
    updateTime: null
  };
  proxy.resetForm("paymentConfigRef");
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
  title.value = "添加支付配置";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getPaymentConfig(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改支付配置";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["paymentConfigRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updatePaymentConfig(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addPaymentConfig(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除支付配置编号为"' + _ids + '"的数据项？').then(function () {
    return delPaymentConfig(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/paymentConfig/export', {
    ...queryParams.value
  }, `paymentConfig_${new Date().getTime()}.xlsx`)
}

async function getEnterpriseList() {
  try {
    const response = await selectIds();
    enterpriseIds.value = response.rows;
    console.log("企业列表：\n" + JSON.stringify(enterpriseIds.value));
  } catch (error) {
    console.log("获取企业列表失败", error);
  }
}

const getCompanyName = (companyId) => {
  const company = enterpriseIds.value.find(item => item.companyId === companyId)
  return company ? company.companyName : companyId
}

getEnterpriseList();

getList();
</script>
