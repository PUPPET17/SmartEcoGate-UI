<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="auto"
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
          <el-form-item label="屏幕品牌" prop="screenBrand">
            <el-select v-model="queryParams.screenBrand" placeholder="请选择屏幕品牌" style="width: 180px;" clearable>
              <el-option v-for="dict in screen_brand" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item label="出入口标识" prop="entranceFlag">
            <div class="custom-style">
              <el-segmented v-model="queryParams.entranceFlag"
                :options="gate_type.map(dict => ({ label: dict.label, value: dict.value }))" size="" />
            </div>
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item label="认证状态" prop="isValid">
            <el-select v-model="queryParams.isValid" placeholder="请选择认证状态" style="width: 180px;" clearable>
              <el-option v-for="dict in certified" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item label="道闸类型" prop="gateType">
            <div class="custom-style">
              <el-segmented v-model="queryParams.gateType"
                :options="tunnel_type.map(dict => ({ label: dict.label, value: dict.value }))" size="" />
            </div>
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item label="相机名" prop="cameraName">
            <el-tooltip class="item" effect="light" content="支持模糊搜索" placement="bottom" popper-class="fade">
              <el-input v-model="queryParams.cameraName" placeholder="请输入相机名" clearable @keyup.enter="handleQuery">
                <template #prefix>
                  <el-icon class="el-input__icon">
                    <search />
                  </el-icon>
                </template>
              </el-input>
            </el-tooltip>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="相机类型" prop="captureType">
            <div class="custom-style">
              <el-segmented v-model="queryParams.captureType"
                :options="cam_type.map(dict => ({ label: dict.label, value: dict.value }))" size="" />
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>


    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:camera:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['system:camera:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['system:camera:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['system:camera:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="cameraList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="企业编码" align="center" prop="identifier" />
      <el-table-column label="相机名称" align="center" prop="cameraName" />
      <el-table-column label="相机类型" align="center" prop="captureType">
        <template #default="scope">
          <dict-tag :options="cam_type" :value="scope.row.captureType" />
        </template>
      </el-table-column>
      <el-table-column label="相机序列号" align="center" prop="cameraSn" />
      <el-table-column label="违规抓拍相机序列号" align="center" prop="violationCamSn" />
      <el-table-column label="屏幕序列号" align="center" prop="screenSn" />
      <el-table-column label="出入口编号" align="center" prop="entranceNo">
        <template #default="scope">
          <dict-tag :options="entrance_no" :value="scope.row.entranceNo" />
        </template>
      </el-table-column>
      <el-table-column label="道闸编号" align="center" prop="turnNo" />
      <el-table-column label="通道号" align="center" prop="channels" />
      <el-table-column label="出入口标识" align="center" prop="entranceFlag">
        <template #default="scope">
          <dict-tag :options="gate_type" :value="scope.row.entranceFlag" />
        </template>
      </el-table-column>
      <el-table-column label="认证状态" align="center" prop="isValid">
        <template #default="scope">
          <dict-tag :options="certified" :value="scope.row.isValid" />
        </template>
      </el-table-column>
      <el-table-column label="道闸类型" align="center" prop="gateType">
        <template #default="scope">
          <dict-tag :options="tunnel_type" :value="scope.row.gateType" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createdDate" width="110">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createDate, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" prop="updatedDate" width="110">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updatedDate, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="接口平信息" align="center" prop="message" show-overflow-tooltip />
      <el-table-column label="视频播放路径" align="center" prop="vedioSrc" show-overflow-tooltip />
      <el-table-column label="视频回放路径" align="center" prop="vedioReplay" show-overflow-tooltip />

      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['system:camera:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['system:camera:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" hide-on-single-page />

    <!-- 添加或修改相机管理对话框 -->
    <el-dialog :title="title" v-model="open" width="800px" append-to-body>
      <el-form ref="cameraRef" :model="form" :rules="rules" label-width="90" label-position="left">
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
            <el-form-item label="道闸名称" prop="gateId">
              <el-select v-model="form.gateId" placeholder="请选择道闸" clearable filterable>
                <el-option v-for="item in gateIds" :key="item.gateId" :label="item.gateName" :value="item.gateId" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="相机名称" prop="cameraName" label-width="auto">
              <el-input v-model="form.cameraName" placeholder="请输入相机名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="相机品牌" prop="cameraBrand">
              <el-select v-model="form.cameraBrand" placeholder="请选择相机品牌" clearable>
                <el-option v-for="dict in camera_brand" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="屏幕品牌" prop="screenBrand" label-width="auto">
              <el-select v-model="form.screenBrand" placeholder="请选择屏幕品牌" clearable>
                <el-option v-for="dict in screen_brand" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="相机序列号" prop="cameraSn" label-width="auto">
              <el-input v-model="form.cameraSn" placeholder="请输入相机序列号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="屏幕序列号" prop="screenSn" label-width="auto">
              <el-input v-model="form.screenSn" placeholder="请输入屏幕序列号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="违规抓拍相机序列号" prop="violationCamSn" label-width="auto">
              <el-input v-model="form.violationCamSn" placeholder="请输入违规抓拍相机序列号" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="道闸编号" prop="turnNo" label-width="auto">
              <el-input v-model="form.turnNo" placeholder="道闸顺序编号,如01,02(必须是两位数字)" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <!-- A,B,C 选项 -->
            <el-form-item label="出入口编号" prop="entranceNo" style="width: 100%; margin-bottom: 20px;" label-width="auto">
              <div class="custom-style">
                <el-segmented v-model="form.entranceNo"
                  :options="entrance_no.map(dict => ({ label: dict.label, value: dict.value }))" size="" />
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="相机经度" prop="longitude" label-width="auto">
              <el-input v-model="form.longitude" placeholder="请输入相机经度" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="相机纬度" prop="latitude" label-width="auto">
              <el-input v-model="form.latitude" placeholder="请输入相机纬度" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="IP地址" prop="ip" label-width="auto">
              <el-input v-model="form.ip" placeholder="请输入IP地址" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="端口号" prop="port" label-width="auto">
              <el-input v-model="form.port" placeholder="请输入端口号" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="通道号" prop="channels" label-width="auto">
              <el-input v-model="form.channels" placeholder="请输入通道号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用户名" prop="username" label-width="auto">
              <el-input v-model="form.username" placeholder="请输入用户名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="密码" prop="password" label-width="auto">
              <el-input v-model="form.password" placeholder="请输入密码" show-password />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="相机类型" prop="captureType" label-width="auto">
              <div class="custom-style">
                <el-segmented v-model="form.captureType"
                  :options="cam_type.map(dict => ({ label: dict.label, value: dict.value }))" size="" />
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="道闸类型" prop="gateType" label-width="auto">
              <div class="custom-style">
                <el-segmented v-model="form.gateType"
                  :options="tunnel_type.map(dict => ({ label: dict.label, value: dict.value }))" size="" />
              </div>
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

<script setup name="Camera">
import { listCamera, getCamera, delCamera, addCamera, updateCamera } from "@/api/system/camera";
import { selectIds } from "@/api/system/info";
import { getIds } from "@/api/system/gate";

const { proxy } = getCurrentInstance();
const { screen_brand, gate_type, entrance_no, camera_brand, tunnel_type, cam_type, certified } = proxy.useDict('screen_brand', 'gate_type', 'entrance_no', 'camera_brand', 'tunnel_type', 'cam_type', 'certified');

const cameraList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const enterpriseIds = ref([]);
const gateIds = ref([]);

const data = reactive({
  form: {},
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
  },
  rules: {
    companyId: [
      { required: true, message: '企业名称不能为空', trigger: 'change' }
    ],
    gateId: [
      { required: true, message: '道闸名称不能为空', trigger: 'change' }
    ],
    cameraName: [
      { required: true, message: '相机名称不能为空', trigger: 'blur' }
    ],
    cameraBrand: [
      { required: true, message: '相机品牌不能为空', trigger: 'change' }
    ],
    screenBrand: [
      { required: true, message: '屏幕品牌不能为空', trigger: 'change' }
    ],
    cameraSn: [
      { required: true, message: '相机序列号不能为空', trigger: 'blur' }
    ],
    screenSn: [
      { required: true, message: '屏幕序列号不能为空', trigger: 'blur' }
    ],
    violationCamSn: [
      { required: true, message: '违规抓拍相机序列号不能为空', trigger: 'blur' }
    ],
    turnNo: [
      { required: true, message: '道闸编号不能为空', trigger: 'blur' }
    ],
    entranceNo: [
      { required: true, message: '出入口编号不能为空', trigger: 'change' }
    ],
    longitude: [
      { required: true, message: '相机经度不能为空', trigger: 'blur' },
      {
        validator: (rule, value, callback) => {
          if (!value || isNaN(value) || value < -180 || value > 180) {
            callback(new Error('相机经度必须在-180到180之间'));
          } else {
            callback();
          }
        }, trigger: 'blur'
      }
    ],
    latitude: [
      { required: true, message: '相机纬度不能为空', trigger: 'blur' },
      {
        validator: (rule, value, callback) => {
          if (!value || isNaN(value) || value < -90 || value > 90) {
            callback(new Error('相机纬度必须在-90到90之间'));
          } else {
            callback();
          }
        }, trigger: 'blur'
      }
    ],
    ip: [
      { required: true, message: 'IP地址不能为空', trigger: 'blur' },
      { pattern: /^(?:\d{1,3}\.){3}\d{1,3}$/, message: '请输入合法的IP地址', trigger: 'blur' }
    ],
    port: [
      { required: true, message: '端口号不能为空', trigger: 'blur' },
      { pattern: /^\d{1,5}$/, message: '请输入合法的端口号', trigger: 'blur' }
    ],
    channels: [
      { required: true, message: '通道号不能为空', trigger: 'blur' }
    ],
    username: [
      { required: true, message: '用户名不能为空', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '密码不能为空', trigger: 'blur' }
    ],
    captureType: [
      { required: true, message: '相机类型不能为空', trigger: 'change' }
    ],
    gateType: [
      { required: true, message: '道闸类型不能为空', trigger: 'change' }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询相机管理列表 */
function getList() {
  loading.value = true;
  listCamera(queryParams.value).then(response => {
    cameraList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
  getEnterpriseList();
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  queryParams.value.companyId = null;
  form.value = {
    id: null,
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
  };
  proxy.resetForm("cameraRef");
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
  title.value = "添加相机管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getCamera(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改相机管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["cameraRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateCamera(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addCamera(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除相机管理编号为"' + _ids + '"的数据项？').then(function () {
    return delCamera(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/camera/export', {
    ...queryParams.value
  }, `camera_${new Date().getTime()}.xlsx`)
}

async function getEnterpriseList() {
  try {
    const response = await selectIds();
    enterpriseIds.value = response.rows;
    console.log("企业列表", enterpriseIds.value);
  } catch (error) {
    console.log("获取企业列表失败", error);
  }
}

async function getGateList() {
  try {
    const response = await getIds();
    gateIds.value = response.rows;
    console.log("道闸列表", gateIds.value);
  } catch (error) {
    console.log("获取道闸列表失败", error);
  }
}

getGateList();
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