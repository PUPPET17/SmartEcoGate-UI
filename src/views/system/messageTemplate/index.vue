<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="企业名称" prop="companyId">
        <el-tooltip class="item" effect="light" content="支持输入过滤" placement="bottom" popper-class="fade">
              <el-select v-model="queryParams.companyId" placeholder="请选择企业" clearable filterable style="width: 180px;">
                <el-option v-for="item in enterpriseIds" :key="item.companyId" :label="item.companyName"
                  :value="item.companyId" />
              </el-select>
            </el-tooltip>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['system:messageTemplate:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['system:messageTemplate:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['system:messageTemplate:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['system:messageTemplate:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="messageTemplateList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="企业名称" align="center" prop="companyId" >
        <template #default="scope">
          {{ getCompanyName(scope.row.companyId) }}
        </template>
      </el-table-column>/>
      <el-table-column label="通知标题" align="center" prop="messageTemplate.title" />
      <el-table-column label="通知内容" align="center" prop="messageTemplate.content" />
      <el-table-column label="消息类型" align="center" prop="massageType" >
        <template #default="scope">
          <dict-tag :options="message_type" :value="scope.row.massageType" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['system:messageTemplate:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['system:messageTemplate:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改通知模板对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="messageTemplateRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="企业名称" prop="companyId">
          <el-select v-model="form.companyId" placeholder="请选择企业" clearable filterable>
                <el-option v-for="item in enterpriseIds" :key="item.companyId" :label="item.companyName"
                  :value="item.companyId" />
              </el-select>
        </el-form-item>
        <el-form-item label="消息标题" prop="messageTemplate.title">
          <el-input v-model="form.messageTemplate.title" placeholder="请输入消息标题" />
        </el-form-item>
        <el-form-item label="消息内容" prop="messageTemplate.content">
          <el-input v-model="form.messageTemplate.content" type="textarea" :rows="4" placeholder="请输入消息内容" />
        </el-form-item>
        <el-form-item label="消息类型" prop="massageType">
          <el-select v-model="form.massageType" placeholder="请选择消息类型" clearable filterable>
            <el-option v-for="item in message_type" :key="item.value" :label="item.label" :value="Number(item.value)" />
          </el-select>
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

<script setup name="MessageTemplate">
import { listMessageTemplate, getMessageTemplate, delMessageTemplate, addMessageTemplate, updateMessageTemplate } from "@/api/system/messageTemplate";
import { selectIds } from "@/api/system/info";
const { proxy } = getCurrentInstance();
const { message_type } = proxy.useDict('message_type');

const messageTemplateList = ref([]);
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
    id: null,
    companyId: null,
    messageTemplate: {
      title: '',
      content: ''
    },
    createTime: null,
    updateTime: null
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    companyId: null,
    messageTemplate: null,
  },
  rules: {
    'messageTemplate.title': [
      { required: true, message: '消息标题不能为空', trigger: 'blur' }
    ],
    'messageTemplate.content': [
      { required: true, message: '消息内容不能为空', trigger: 'blur' }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询通知模板列表 */
function getList() {
  loading.value = true;
  listMessageTemplate(queryParams.value).then(response => {
    messageTemplateList.value = response.rows;
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
    messageTemplate: {
      title: '',
      content: ''
    },
    createTime: null,
    updateTime: null
  };
  proxy.resetForm("messageTemplateRef");
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
  title.value = "添加通知模板";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getMessageTemplate(_id).then(response => {
    form.value = {
      ...response.data,
      messageTemplate: response.data.messageTemplate || { title: '', content: '' }
    };
    open.value = true;
    title.value = "修改通知模板";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["messageTemplateRef"].validate(valid => {
    if (valid) {
      const submitData = {
        ...form.value
      };
      
      if (form.value.id != null) {
        updateMessageTemplate(submitData).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addMessageTemplate(submitData).then(response => {
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
  proxy.$modal.confirm('是否确认删除通知模板编号为"' + _ids + '"的数据项？').then(function () {
    return delMessageTemplate(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/messageTemplate/export', {
    ...queryParams.value
  }, `messageTemplate_${new Date().getTime()}.xlsx`)
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
