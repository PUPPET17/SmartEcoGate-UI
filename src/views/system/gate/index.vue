<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-row :gutter="10">
        <el-col :span="4">
          <el-form-item label="道闸名称" prop="turnName">
            <el-tooltip class="item" effect="light" content="支持模糊搜索" placement="bottom" popper-class="fade">
              <el-input v-model="queryParams.turnName" placeholder="请输入道闸名称" clearable @keyup.enter="handleQuery" />
            </el-tooltip>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="运维单位" prop="maintenanceCompany">
            <el-tooltip class="item" effect="light" content="支持模糊搜索" placement="bottom" popper-class="fade">
              <el-input v-model="queryParams.maintenanceCompany" placeholder="请输入运维单位" clearable
                @keyup.enter="handleQuery" />
            </el-tooltip>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="认证状态" prop="isValid">
            <div class="custom-style">
              <el-segmented v-model="queryParams.isValid"
                :options="certified.map(dict => ({ label: dict.label, value: dict.value }))" size="small" />
            </div>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="6">
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>


    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:gate:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['system:gate:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['system:gate:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['system:gate:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="gateList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="企业编码" align="center" prop="identifier" />
      <el-table-column label="出入口编号" align="center" prop="entranceNo">
        <template #default="scope">
          <dict-tag :options="entrance_no" :value="scope.row.entranceNo" />
        </template>
      </el-table-column>
      <el-table-column label="道闸编号" align="center" prop="turnNo" />
      <el-table-column label="道闸名称" align="center" prop="turnName" />
      <el-table-column label="道闸地址" align="center" prop="turnAddress" />
      <el-table-column label="道闸负责人" align="center" prop="inCharge" />
      <el-table-column label="负责人联系方式" align="center" prop="inChargeContact" />
      <el-table-column label="运维单位负责人" align="center" prop="maintenanceContact" />
      <el-table-column label="运维单位" align="center" prop="maintenanceCompany" />
      <el-table-column label="运维单位联系方式" align="center" prop="maintenancePhone" />
      <el-table-column label="认证状态" align="center" prop="isValid">
        <template #default="scope">
          <dict-tag :options="certified" :value="scope.row.isValid" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['system:gate:edit']">修改</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['system:gate:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改道闸管理对话框 -->
    <el-dialog :title="title" v-model="open" width="800px" append-to-body>
      <el-form ref="gateRef" :model="form" :rules="rules" label-width="140px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="企业名称" prop="companyId">
              <el-select v-model="form.companyId" placeholder="请选择企业" clearable filterable>
                <el-option v-for="item in enterpriseIds" :key="item.companyId" :label="item.companyName"
                  :value="item.companyId" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="道闸名称" prop="turnName">
              <el-input v-model="form.turnName" placeholder="请输入道闸名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出入口编号" prop="entranceNo" style="width: 100%; margin-bottom: 20px;">
              <div class="custom-style">
                <el-segmented v-model="form.entranceNo"
                  :options="entrance_no.map(dict => ({ label: dict.label, value: dict.value }))" size="small" />
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="道闸编号" prop="turnNo">
              <el-input v-model="form.turnNo" placeholder="如01,02(必须是两位数字)" maxlength="2" minlength="2"
                show-word-limit="true" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="道闸地址" prop="turnAddress">
              <el-input v-model="form.turnAddress" placeholder="请输入道闸地址" autosize type="textarea" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="道闸经度" prop="longitude">
              <el-input v-model="form.longitude" placeholder="请输入道闸经度" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="道闸纬度" prop="latitude">
              <el-input v-model="form.latitude" placeholder="请输入道闸纬度" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="道闸负责人" prop="inCharge">
              <el-input v-model="form.inCharge" placeholder="请输入道闸负责人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人联系方式" prop="inChargeContact">
              <el-input v-model="form.inChargeContact" placeholder="请输入负责人联系方式" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="运维单位负责人" prop="maintenanceContact">
              <el-input v-model="form.maintenanceContact" placeholder="请输入运维单位联系人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="运维单位" prop="maintenanceCompany">
              <el-input v-model="form.maintenanceCompany" placeholder="请输入运维单位" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="运维单位联系方式" prop="maintenancePhone">
              <el-input v-model="form.maintenancePhone" placeholder="请输入运维单位联系方式" />
            </el-form-item>
          </el-col>
        </el-row>
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

<script setup name="Gate">
import { listGate, getGate, delGate, addGate, updateGate } from "@/api/system/gate";
import { selectIds } from "@/api/system/info";

const { proxy } = getCurrentInstance();
const { screen_brand, entrance_no, camera_brand, certified } = proxy.useDict('screen_brand', 'entrance_no', 'camera_brand', 'certified');

const gateList = ref([]);
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
    companyId: null,
    identifier: null,
    // cameraBrand: null,
    // cameraSn: null,
    // screenBrand: null,
    // screenSn: null,
    entranceNo: null,
    turnNo: null,
    turnName: null,
    turnAddress: null,
    longitude: null,
    latitude: null,
    ip: null,
    inCharge: null,
    inChargeContact: null,
    maintenanceContact: null,
    maintenanceCompany: null,
    maintenancePhone: null,
    isValid: null
  },
  rules: {
    companyId: [
      { required: true, message: '企业名称不能为空', trigger: 'change' }
    ],
    turnName: [
      { required: true, message: '道闸名称不能为空', trigger: 'blur' }
    ],
    entranceNo: [
      { required: true, message: '出入口编号不能为空', trigger: 'change' }
    ],
    turnNo: [
      { required: true, message: '道闸编号不能为空', trigger: 'blur' },
      { pattern: /^\d{2}$/, message: '道闸编号必须是两位数字', trigger: 'blur' }
    ],
    turnAddress: [
      { required: true, message: '道闸地址不能为空', trigger: 'blur' }
    ],
    longitude: [
      { required: true, message: '道闸经度不能为空', trigger: 'blur' },
      {
        validator: (rule, value, callback) => {
          if (!value || isNaN(value) || value < -180 || value > 180) {
            callback(new Error('道闸经度必须在-180到180之间'));
          } else {
            callback();
          }
        }, trigger: 'blur'
      }
    ],
    latitude: [
      { required: true, message: '道闸纬度不能为空', trigger: 'blur' },
      {
        validator: (rule, value, callback) => {
          if (!value || isNaN(value) || value < -90 || value > 90) {
            callback(new Error('道闸纬度必须在-90到90之间'));
          } else {
            callback();
          }
        }, trigger: 'blur'
      }
    ],
    inCharge: [
      { required: true, message: '道闸负责人不能为空', trigger: 'blur' }
    ],
    inChargeContact: [
      { required: true, message: '负责人联系方式不能为空', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入合法的手机号', trigger: 'blur' }
    ],
    maintenanceContact: [
      { required: true, message: '运维单位联系人不能为空', trigger: 'blur' }
    ],
    maintenanceCompany: [
      { required: true, message: '运维单位不能为空', trigger: 'blur' }
    ],
    maintenancePhone: [
      { required: true, message: '运维单位联系方式不能为空', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入合法的手机号', trigger: 'blur' }
    ],
  },
});

const { queryParams, form, rules } = toRefs(data);

/** 查询道闸管理列表 */
function getList() {
  loading.value = true;
  listGate(queryParams.value).then(response => {
    gateList.value = response.rows;
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
    identifier: null,
    // cameraBrand: null,
    // cameraSn: null,
    // screenBrand: null,
    // screenSn: null,
    entranceNo: null,
    turnNo: null,
    turnName: null,
    turnAddress: null,
    longitude: null,
    latitude: null,
    ip: null,
    inCharge: null,
    inChargeContact: null,
    maintenanceContact: null,
    maintenanceCompany: null,
    maintenancePhone: null,
    createdDate: null,
    updatedDate: null,
    isValid: null
  };
  proxy.resetForm("gateRef");
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
  title.value = "添加道闸管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getGate(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改道闸管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["gateRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateGate(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addGate(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除道闸管理编号为"' + _ids + '"的数据项？').then(function () {
    return delGate(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/gate/export', {
    ...queryParams.value
  }, `gate_${new Date().getTime()}.xlsx`)
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
<style scoped>
.custom-style .el-segmented {
  --el-segmented-item-selected-color: #F2F6FC;
  --el-segmented-item-selected-bg-color: #409EFF;
  --el-border-radius-base: 12px;
}

.fade-enter-active,
.fade-leave-active {
  transition: transform 0.3s var(--el-transition-function-fast-bezier);
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>