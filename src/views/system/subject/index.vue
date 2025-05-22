<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="商品名称" prop="subject">
        <el-input v-model="queryParams.subject" placeholder="请输入商品名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="金额" prop="amount">
        <el-input v-model="queryParams.amount" placeholder="请输入金额(元)" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="商品描述" prop="body">
        <el-input v-model="queryParams.body" placeholder="请输入商品描述" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['system:subject:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['system:subject:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['system:subject:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['system:subject:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="subjectList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="企业名称" align="center" width="120" show-overflow-tooltip>
        <template #default="scope">
          {{ getCompanyName(scope.row.companyId) }}
        </template>
      </el-table-column>
      <el-table-column label="商品名称" align="center" prop="subject" />
      <el-table-column label="商品类型" align="center" prop="type" >
        <template #default="scope">
          <dict-tag :options="subject_type" :value="scope.row.type" />
        </template>
      </el-table-column>
      <el-table-column label="金额(元)" align="center" prop="amount">
        <template #default="scope">
          {{ formatToYuan(scope.row.amount) }}
        </template>
      </el-table-column>
      <el-table-column label="商品描述" align="center" prop="body" />
      <el-table-column label="分成模式" align="center" prop="divisionMode">
        <template #default="scope">
          {{ scope.row.divisionMode === 0 ? '不允许分账' : 
             scope.row.divisionMode === 1 ? '自动分账' : 
             scope.row.divisionMode === 2 ? '手动分账' : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['system:subject:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['system:subject:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改商品列表对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="subjectRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="企业名称" prop="companyId">
              <el-select v-model="form.companyId" placeholder="请选择企业" clearable filterable>
                <el-option v-for="item in enterpriseIds" :key="item.companyId" :label="item.companyName"
                  :value="item.companyId" />
              </el-select>
            </el-form-item>
        <el-form-item label="商品名称" prop="subject">
          <el-input v-model="form.subject" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="金额" prop="amount">
          <el-input v-model="form.amountYuan" placeholder="请输入金额(元)" />
        </el-form-item>
        <el-form-item label="商品描述" prop="body">
          <el-input v-model="form.body" placeholder="请输入商品描述" />
        </el-form-item>
        <el-form-item label="商品类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio v-for="dict in subject_type" :key="dict.value" :label="Number(dict.value)">{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="分账模式" prop="divisionMode">
          <el-radio-group v-model="form.divisionMode">
            <el-radio :label="0">不允许分账</el-radio>
            <el-radio :label="1">自动分账</el-radio>
            <el-radio :label="2">手动分账</el-radio>
          </el-radio-group>
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

<script setup name="Subject">
import { listSubject, getSubject, delSubject, addSubject, updateSubject } from "@/api/system/subject";
import { selectIds } from "@/api/system/info";

const { proxy } = getCurrentInstance();
const { subject_type } = proxy.useDict('subject_type');
const subjectList = ref([]);
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
  form: {
    amountYuan: null // 用于存储以元为单位的金额
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    subject: null,
    amount: null,
    body: null,
    type: null,
  },
  rules: {
    amountYuan: [
      { required: true, message: "金额不能为空", trigger: "blur" },
      { pattern: /^([1-9]\d*|0)(\.\d{1,2})?$/, message: '请输入正确的金额格式，最多两位小数', trigger: 'blur' }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

// 分转元(显示)
function formatToYuan(fen) {
  if (!fen && fen !== 0) return '';
  return (parseInt(fen) / 100).toFixed(2);
}

// 元转分(提交)
function yuanToFen(yuan) {
  if (!yuan && yuan !== 0) return 0;
  return Math.round(parseFloat(yuan) * 100);
}

/** 查询商品列表列表 */
function getList() {
  loading.value = true;
  listSubject(queryParams.value).then(response => {
    subjectList.value = response.rows;
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
    subject: null,
    amount: null,
    amountYuan: null,
    body: null,
    type: null,
    divisionMode: 0,
    createTime: null,
    updateTime: null,
    companyId: null
  };
  proxy.resetForm("subjectRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  // 搜索时如果输入了金额，转换为分
  if (queryParams.value.amount) {
    queryParams.value.amount = yuanToFen(queryParams.value.amount);
  }
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
  title.value = "添加商品列表";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getSubject(_id).then(response => {
    form.value = response.data;
    // 将分转换为元显示
    form.value.amountYuan = formatToYuan(form.value.amount);
    open.value = true;
    title.value = "修改商品列表";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["subjectRef"].validate(valid => {
    if (valid) {
      // 提交前将元转换为分
      if (form.value.amountYuan !== null && form.value.amountYuan !== undefined) {
        form.value.amount = yuanToFen(form.value.amountYuan);
      }
      
      if (form.value.id != null) {
        updateSubject(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addSubject(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除商品列表编号为"' + _ids + '"的数据项？').then(function () {
    return delSubject(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/subject/export', {
    ...queryParams.value
  }, `subject_${new Date().getTime()}.xlsx`)
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
