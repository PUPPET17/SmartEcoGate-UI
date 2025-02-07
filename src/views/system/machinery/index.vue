<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="企业id" prop="companyId">
        <el-input v-model="queryParams.companyId" placeholder="请输入企业id" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="车牌号" prop="plateNumber">
        <el-input v-model="queryParams.plateNumber" placeholder="请输入车牌号" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="排放标准" prop="emissionStage">
        <el-select v-model="queryParams.emissionStage" placeholder="请选择排放标准" clearable style="width: 180px;">
          <el-option v-for="dict in emission_standard" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="燃料类型" prop="flueType">
        <el-select v-model="queryParams.flueType" placeholder="请选择燃料类型" clearable style="width: 180px;">
          <el-option v-for="dict in fuel_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="认证状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择认证状态" clearable style="width: 180px;">
          <el-option v-for="dict in certified" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-col :span="24">
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-col>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['system:machinery:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['system:machinery:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['system:machinery:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Warning" :disabled="multiple" @click="checkBlacklist">检查黑名单</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['system:machinery:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="machineryList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="企业名称" align="center" show-overflow-tooltip>
        <template #default="scope">
          {{ getCompanyName(scope.row.companyId) }}
        </template>
      </el-table-column>
      <el-table-column label="环保登记编码" align="center" prop="envCode" />
      <!-- <el-table-column label="天津编码" align="center" prop="tjCode" /> -->
      <el-table-column label="pin" align="center" prop="pin" />
      <el-table-column label="车牌号" align="center" prop="plateNumber" />
      <el-table-column label="生产日期" align="center" prop="prodDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.prodDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="机械种类" align="center" prop="machineryType">
        <template #default="scope">
          <dict-tag :options="machinery_type" :value="scope.row.machineryType" />
        </template>
      </el-table-column>
      <el-table-column label="机械型号" align="center" prop="machineryModel" />
      <el-table-column label="发动机型号" align="center" prop="engineNo" />
      <el-table-column label="发动机生产厂商" align="center" prop="engineFactory" />
      <el-table-column label="发动机名牌图片" align="center" prop="enginePic" width="100">
        <template #default="scope">
          <image-preview :src="scope.row.enginePic" :width="50" :height="50" />
        </template>
      </el-table-column>
      <el-table-column label="整车铭牌图片" align="center" prop="fullPic" width="100">
        <template #default="scope">
          <image-preview :src="scope.row.fullPic" :width="50" :height="50" />
        </template>
      </el-table-column>
      <el-table-column label="机械环保信息标签图片" align="center" prop="envLabelPic" width="100">
        <template #default="scope">
          <image-preview :src="scope.row.envLabelPic" :width="50" :height="50" />
        </template>
      </el-table-column>
      <el-table-column label="排放标准" align="center" prop="emissionStage">
        <template #default="scope">
          <dict-tag :options="emission_standard" :value="scope.row.emissionStage" />
        </template>
      </el-table-column>
      <el-table-column label="燃料类型" align="center" prop="flueType">
        <template #default="scope">
          <dict-tag :options="fuel_type" :value="scope.row.flueType" />
        </template>
      </el-table-column>
      <el-table-column label="所属单位" align="center" prop="owner" />
      <el-table-column label="认证状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="certified" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="认证信息" align="center" prop="msg" show-overflow-tooltip/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['system:machinery:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['system:machinery:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改非道路机械对话框 -->
    <el-dialog :title="title" v-model="open" width="1200px" append-to-body>
      <el-form ref="machineryRef" :model="form" :rules="rules" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="7">
            <el-form-item label="企业名称" prop="companyId">
              <el-select v-model="form.companyId" placeholder="请选择企业" clearable filterable>
                <el-option v-for="item in enterpriseIds" :key="item.companyId" :label="item.companyName"
                  :value="item.companyId" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="环保登记编码" prop="envCode">
              <el-input v-model="form.envCode" placeholder="请输入环保登记编码" />
            </el-form-item>
          </el-col>
          <el-col :span="7" v-show="showTjCode">
            <el-form-item label="天津编码" prop="tjCode">
              <el-input v-model="form.tjCode" placeholder="请输入天津编码" />
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="pin" prop="pin">
              <el-input v-model="form.pin" placeholder="请输入pin" />
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="车牌号" prop="plateNumber">
              <el-input v-model="form.plateNumber" placeholder="请输入车牌号" />
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="机械型号" prop="machineryModel">
              <el-input v-model="form.machineryModel" placeholder="请输入机械型号" />
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="发动机型号" prop="engineNo">
              <el-input v-model="form.engineNo" placeholder="请输入发动机型号" />
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="发动机生产厂商" prop="engineFactory">
              <el-input v-model="form.engineFactory" placeholder="请输入发动机生产厂商" />
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="排放阶段" prop="emissionStage">
              <el-select v-model="form.emissionStage" placeholder="请选择排放阶段">
                <el-option v-for="dict in emission_standard" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="燃料类型" prop="flueType">
              <el-select v-model="form.flueType" placeholder="请选择燃料类型">
                <el-option v-for="dict in fuel_type" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="所属单位" prop="owner">
              <el-input v-model="form.owner" placeholder="请输入所属单位" />
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="生产日期" prop="prodDate">
              <el-date-picker clearable v-model="form.prodDate" type="date" value-format="YYYY-MM-DD"
                placeholder="请选择生产日期">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="机械种类" prop="machineryType">
              <el-select v-model="form.machineryType" placeholder="请选择机械种类">
                <el-option v-for="dict in machinery_type" :key="dict.value" :label="dict.label"
                  :value="parseInt(dict.value)"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-row>
            <el-col :span="8">
              <el-form-item label="发动机名牌图片" prop="enginePic">
                <image-upload v-model="form.enginePic" :companyId="form.companyId" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="整车铭牌图片" prop="fullPic">
                <image-upload v-model="form.fullPic" :companyId="form.companyId" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="机械环保信息标签图片" prop="envLabelPic">
                <image-upload v-model="form.envLabelPic" :companyId="form.companyId" />
              </el-form-item>
            </el-col>
          </el-row>

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

<script setup name="Machinery">
import { listMachinery, getMachinery, delMachinery, addMachinery, updateMachinery } from "@/api/system/machinery";
import { selectIds } from "@/api/system/info";
import { getEmissionByPlateNo } from "@/api/system/emission";
import { ElNotification } from "element-plus";

const { proxy } = getCurrentInstance();
const { machinery_type, certified, fuel_type, emission_standard } = proxy.useDict('machinery_type', 'certified', 'fuel_type', 'emission_standard');

const machineryList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const daterangeProdDate = ref([]);
const enterpriseIds = ref([]);

const data = reactive({
  form: {
    id: null,
    companyId: null,
    envCode: null,
    tjCode: null,
    pin: null,
    plateNumber: null,
    prodDate: null,
    machineryType: null,
    machineryModel: null,
    engineNo: null,
    engineFactory: null,
    enginePic: null,
    fullPic: null,
    envLabelPic: null,
    emissionStage: null,
    flueType: null,
    owner: null,
    status: null,
    msg: null
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    companyId: null,
    pin: null,
    plateNumber: null,
    prodDate: null,
    machineryType: null,
    machineryModel: null,
    engineNo: null,
    engineFactory: null,
    emissionStage: null,
    flueType: null,
    owner: null,
    status: null,
  },
  rules: {
    companyId: [{ required: true, message: '企业名称不能为空', trigger: 'change' }],
    envCode: [{ required: true, message: '环保登记编码不能为空', trigger: 'blur' }],
    tjCode: computed(() => {
      return showTjCode.value ? [{ required: true, message: '天津编码不能为空', trigger: 'blur' }] : [];
    }),
    pin: [{ required: true, message: 'pin不能为空', trigger: 'blur' }],
    plateNumber: [{ required: true, message: '车牌号不能为空', trigger: 'blur' }],
    emissionStage: [{ required: true, message: '排放阶段不能为空', trigger: 'change' }],
    flueType: [{ required: true, message: '燃料类型不能为空', trigger: 'change' }],
    owner: [{ required: true, message: '所属单位不能为空', trigger: 'blur' }],
    prodDate: [{ required: true, message: '生产日期不能为空', trigger: 'change' }],
    machineryType: [{ required: true, message: '机械种类不能为空', trigger: 'change' }],
    enginePic: [{ required: true, message: '发动机名牌图片不能为空', trigger: 'change' }],
    fullPic: [{ required: true, message: '整车铭牌图片不能为空', trigger: 'change' }],
    envLabelPic: [{ required: true, message: '机械环保信息标签图片不能为空', trigger: 'change' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

// 添加计算属性判断是否显示天津编码字段
const showTjCode = computed(() => {
  const selectedCompany = enterpriseIds.value.find(item => item.companyId === form.value.companyId);
  return selectedCompany?.apiStrategy === 4;
});

// 监听企业选择变化
watch(() => form.value.companyId, (newVal) => {
  // 如果切换到非apiStrategy为4的企业，清空天津编码
  if (!showTjCode.value) {
    form.value.tjCode = '';
  }
});

/** 查询非道路机械列表 */
function getList() {
  loading.value = true;
  queryParams.value.params = {};
  if (null != daterangeProdDate && '' != daterangeProdDate) {
    queryParams.value.params["beginProdDate"] = daterangeProdDate.value[0];
    queryParams.value.params["endProdDate"] = daterangeProdDate.value[1];
  }
  listMachinery(queryParams.value).then(response => {
    machineryList.value = response.rows;
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
    envCode: null,
    tjCode: null,
    pin: null,
    plateNumber: null,
    prodDate: null,
    machineryType: null,
    machineryModel: null,
    engineNo: null,
    engineFactory: null,
    enginePic: null,
    fullPic: null,
    envLabelPic: null,
    emissionStage: null,
    flueType: null,
    owner: null,
    status: null,
    msg: null,
    userId: null,
    deptId: null
  };
  proxy.resetForm("machineryRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  daterangeProdDate.value = [];
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
  title.value = "添加非道路机械";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getMachinery(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改非道路机械";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["machineryRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateMachinery(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addMachinery(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除非道路机械编号为"' + _ids + '"的数据项？').then(function () {
    return delMachinery(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/machinery/export', {
    ...queryParams.value
  }, `machinery_${new Date().getTime()}.xlsx`)
}

async function getEnterpriseList() {
  try {
    console.log(proxy.$auth.hasRole("admin"));
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

// 检查单个车牌号的黑名单状态
const checkBlacklistStatus = async (plateNumber, companyId) => {
  try {
    // 获取企业的 apiStrategy
    const selectedCompany = enterpriseIds.value.find(item => item.companyId === companyId);
    if (!selectedCompany) {
      throw new Error('请先选择企业');
    }

    const blacklistResponse = await getEmissionByPlateNo(selectedCompany.apiStrategy, plateNumber);
    console.info("黑名单状态：", blacklistResponse);
    return {
      isBlacklist: blacklistResponse.msg !== "未查询到排放数据",
      message: blacklistResponse.msg
    };
  } catch (error) {
    console.error('检查黑名单状态失败:', error);
    throw error;
  }
};

// 验证企业和车牌号是否已选择
const validateInput = (plateNumber, companyId) => {
  if (!companyId) {
    ElNotification({
      title: '提示',
      message: '请先选择企业',
      type: 'warning',
      duration: 3000
    });
    return false;
  }
  if (!plateNumber) {
    ElNotification({
      title: '提示',
      message: '请先输入车牌号',
      type: 'warning',
      duration: 3000
    });
    return false;
  }
  return true;
};

// 单个车牌号黑名单检查
const checkSinglePlateBlacklist = async () => {
  const plateNumber = form.value.plateNumber;
  const companyId = form.value.companyId;
  
  if (!validateInput(plateNumber, companyId)) return;

  try {
    const { isBlacklist } = await checkBlacklistStatus(plateNumber, companyId);
    showBlacklistNotification(plateNumber, isBlacklist);
  } catch (error) {
    showErrorNotification(plateNumber, error);
  }
};

// 批量检查黑名单
const checkBlacklist = async () => {
  const selectedRecords = machineryList.value.filter(record => 
    ids.value.includes(record.id)
  );

  for (let record of selectedRecords) {
    try {
      const { isBlacklist } = await checkBlacklistStatus(record.plateNumber, record.companyId);
      showBlacklistNotification(record.plateNumber, isBlacklist);
      record.isBlacklist = isBlacklist;
    } catch (error) {
      showErrorNotification(record.plateNumber, error);
    }
  }
};

// 显示黑名单检查结果通知
const showBlacklistNotification = (plateNumber, isBlacklist) => {
  if (isBlacklist) {
    ElNotification({
      title: '黑名单提醒',
      message: `车牌号 ${plateNumber} 在黑名单中`,
      type: 'warning',
      position: 'bottom-right',
      duration: 0
    });
  } else {
    ElNotification({
      title: '检查结果',
      message: `车牌号 ${plateNumber} 不在黑名单中`,
      type: 'success',
      position: 'bottom-right',
      duration: 3000
    });
  }
};

// 显示错误通知
const showErrorNotification = (plateNumber, error) => {
  ElNotification({
    title: '检查失败',
    message: `车牌号 ${plateNumber} 检查失败: ${error.message}`,
    type: 'error',
    position: 'bottom-right',
    duration: 3000
  });
};

getEnterpriseList();
getList();
</script>
