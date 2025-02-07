<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="" prop="companyId">
        <el-input
          v-model="queryParams.companyId"
          placeholder="请输入"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="qymc" prop="companyName">
        <el-input
          v-model="queryParams.companyName"
          placeholder="请输入qymc"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="kssj" prop="startTime">
        <el-date-picker clearable
          v-model="queryParams.startTime"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择kssj">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="jssj" prop="endTime">
        <el-date-picker clearable
          v-model="queryParams.endTime"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择jssj">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="yjjb" prop="waringLevel">
        <el-select v-model="queryParams.waringLevel" placeholder="请选择yjjb" clearable>
          <el-option
            v-for="dict in warning_level"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="xyjb" prop="responseLevel">
        <el-select v-model="queryParams.responseLevel" placeholder="请选择xyjb" clearable>
          <el-option
            v-for="dict in response_level"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="${comment}" prop="createDate">
        <el-date-picker clearable
          v-model="queryParams.createDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择${comment}">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="${comment}" prop="updateDate">
        <el-date-picker clearable
          v-model="queryParams.updateDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择${comment}">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['system:measure:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:measure:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:measure:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['system:measure:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="measureList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="" align="center" prop="id" />
      <el-table-column label="" align="center" prop="companyId" />
      <el-table-column label="qymc" align="center" prop="companyName" />
      <el-table-column label="kssj" align="center" prop="startTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.startTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="jssj" align="center" prop="endTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.endTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="yjjb" align="center" prop="waringLevel">
        <template #default="scope">
          <dict-tag :options="warning_level" :value="scope.row.waringLevel"/>
        </template>
      </el-table-column>
      <el-table-column label="xyjb" align="center" prop="responseLevel">
        <template #default="scope">
          <dict-tag :options="response_level" :value="scope.row.responseLevel"/>
        </template>
      </el-table-column>
      <el-table-column label="gkcs" align="center" prop="controlMeasure" />
      <el-table-column label="${comment}" align="center" prop="createDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="${comment}" align="center" prop="updateDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:measure:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:measure:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改管控措施对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="measureRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="kssj" prop="startTime">
          <el-date-picker clearable
            v-model="form.startTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择kssj">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="jssj" prop="endTime">
          <el-date-picker clearable
            v-model="form.endTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择jssj">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="yjjb" prop="waringLevel">
          <el-select v-model="form.waringLevel" placeholder="请选择yjjb">
            <el-option
              v-for="dict in warning_level"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="xyjb" prop="responseLevel">
          <el-select v-model="form.responseLevel" placeholder="请选择xyjb">
            <el-option
              v-for="dict in response_level"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="gkcs" prop="controlMeasure">
          <el-input v-model="form.controlMeasure" type="textarea" placeholder="请输入内容" />
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

<script setup name="Measure">
import { listMeasure, getMeasure, delMeasure, addMeasure, updateMeasure } from "@/api/system/measure";

const { proxy } = getCurrentInstance();
const { warning_level, response_level } = proxy.useDict('warning_level', 'response_level');

const measureList = ref([]);
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
    companyId: null,
    companyName: null,
    startTime: null,
    endTime: null,
    waringLevel: null,
    responseLevel: null,
    controlMeasure: null,
    createDate: null,
    updateDate: null
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询管控措施列表 */
function getList() {
  loading.value = true;
  listMeasure(queryParams.value).then(response => {
    measureList.value = response.rows;
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
    companyName: null,
    startTime: null,
    endTime: null,
    waringLevel: null,
    responseLevel: null,
    controlMeasure: null,
    userId: null,
    deptId: null,
    createDate: null,
    updateDate: null
  };
  proxy.resetForm("measureRef");
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
  title.value = "添加管控措施";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getMeasure(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改管控措施";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["measureRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateMeasure(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addMeasure(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除管控措施编号为"' + _ids + '"的数据项？').then(function() {
    return delMeasure(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/measure/export', {
    ...queryParams.value
  }, `measure_${new Date().getTime()}.xlsx`)
}

getList();
</script>
