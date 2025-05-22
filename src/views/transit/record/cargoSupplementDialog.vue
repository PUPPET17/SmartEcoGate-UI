<template>
  <el-dialog 
    :title="'货物信息补录 - ' + (record ? record.plateNo : '')" 
    v-model="dialogVisible" 
    width="700px"
    :close-on-click-modal="false"
    append-to-body
    @close="handleClose"
    class="cargo-supplement-dialog">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
      <!-- 基本信息卡片 -->
      <el-card class="base-info-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span class="header-title">基本信息</span>
          </div>
        </template>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="车牌号码" prop="plateNo">
              <el-input v-model="record.plateNo" disabled class="disabled-input" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="企业名称" prop="areaName">
              <el-input v-model="record.areaName" disabled class="disabled-input" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="货物来源地" prop="goodsOrigin">
              <el-input v-model="form.goodsOrigin" placeholder="请输入货物来源地" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="货物目的地" prop="goodsDestination">
              <el-input v-model="form.goodsDestination" placeholder="请输入货物目的地" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>
      
      <!-- 入场信息卡片 -->
      <el-card v-if="record.startDate" class="cargo-info-card in-bound-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <div class="header-with-tag">
              <span class="header-title">入场信息</span>
              <el-tag 
                :type="getLedgerStatusType(ledgerInfo?.inStatus)" 
                size="small"
                effect="light"
                class="status-tag">
                {{ getLedgerStatusText(ledgerInfo?.inStatus) }}
              </el-tag>
            </div>
            <span class="time-info">{{ parseTime(record.startDate, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
          </div>
        </template>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="货物名称" prop="inCargo.cargoName">
              <el-input v-model="form.inCargo.cargoName" placeholder="请输入货物名称" :disabled="ledgerInfo?.inStatus === 1" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="货物类型" prop="inCargo.goodsType">
              <el-select v-model="form.inCargo.goodsType" placeholder="请选择货物类型" style="width: 100%" :disabled="ledgerInfo?.inStatus === 1">
                <el-option v-for="dict in goods_type" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="货物数量" prop="inCargo.volume">
              <el-input-number v-model="form.inCargo.volume" controls-position="right" :precision="2" :step="0.01" style="width: 100%" :disabled="ledgerInfo?.inStatus === 1" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计量单位" prop="inCargo.unit">
              <el-select v-model="form.inCargo.unit" placeholder="请选择单位" style="width: 100%" :disabled="ledgerInfo?.inStatus === 1">
                <el-option v-for="unit in unit_options" :key="unit" :label="unit" :value="unit" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>
      <div v-else class="empty-placeholder">
        <el-empty description="无入场记录" />
      </div>

      <!-- 出场信息卡片 -->
      <el-card v-if="record.endDate" class="cargo-info-card out-bound-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <div class="header-with-tag">
              <span class="header-title">出场信息</span>
              <el-tag 
                :type="getLedgerStatusType(ledgerInfo?.outStatus)" 
                size="small"
                effect="light"
                class="status-tag">
                {{ getLedgerStatusText(ledgerInfo?.outStatus) }}
              </el-tag>
            </div>
            <span class="time-info">{{ parseTime(record.endDate, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
          </div>
        </template>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="货物名称" prop="outCargo.cargoName">
              <el-input v-model="form.outCargo.cargoName" placeholder="请输入货物名称" :disabled="ledgerInfo?.outStatus === 1" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="货物类型" prop="outCargo.goodsType">
              <el-select v-model="form.outCargo.goodsType" placeholder="请选择货物类型" style="width: 100%" :disabled="ledgerInfo?.outStatus === 1">
                <el-option v-for="dict in goods_type" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="货物数量" prop="outCargo.volume">
              <el-input-number v-model="form.outCargo.volume" controls-position="right" :precision="2" :step="0.01" style="width: 100%" :disabled="ledgerInfo?.outStatus === 1" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计量单位" prop="outCargo.unit">
              <el-select v-model="form.outCargo.unit" placeholder="请选择单位" style="width: 100%" :disabled="ledgerInfo?.outStatus === 1">
                <el-option v-for="unit in unit_options" :key="unit" :label="unit" :value="unit" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>
      <div v-else class="empty-placeholder">
        <el-empty description="无出场记录" />
      </div>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose" plain>取 消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting">确 定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick, getCurrentInstance } from 'vue';
import { supplementLedger } from '@/api/transit/record';
import { ElNotification } from 'element-plus';
import { parseTime } from '@/utils/ruoyi';

const { proxy } = getCurrentInstance();
const { goods_type } = proxy.useDict('goods_type');

// 货物单位选项
const unit_options = ref([
  'T',
  'L',
  'P',
]);

const props = defineProps({
  visible: Boolean,
  record: {
    type: Object,
    default: () => ({})
  },
  ledgerInfo: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update:visible', 'refresh']);

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
});

const formRef = ref(null);
const submitting = ref(false);

// 表单数据
const form = reactive({
  recordId: null,
  companyId: null,
  goodsOrigin: '',
  goodsDestination: '',
  inCargo: {
    cargoName: '',
    volume: null,
    goodsType: '',
    unit: ''
  },
  outCargo: {
    cargoName: '',
    volume: null,
    goodsType: '',
    unit: ''
  }
});

// 表单校验规则
const rules = {
  goodsOrigin: [
    { required: false, message: '请输入货物来源地', trigger: 'blur' }
  ],
  goodsDestination: [
    { required: false, message: '请输入货物目的地', trigger: 'blur' }
  ],
  'inCargo.cargoName': [
    { required: false, message: '请输入入场货物名称', trigger: 'blur' }
  ],
  'inCargo.volume': [
    { required: false, message: '请输入入场货物数量', trigger: 'blur' }
  ],
  'inCargo.unit': [
    { required: false, message: '请选择入场货物单位', trigger: 'change' }
  ],
  'outCargo.cargoName': [
    { required: false, message: '请输入出场货物名称', trigger: 'blur' }
  ],
  'outCargo.volume': [
    { required: false, message: '请输入出场货物数量', trigger: 'blur' }
  ],
  'outCargo.unit': [
    { required: false, message: '请选择出场货物单位', trigger: 'change' }
  ]
};

// 监听弹窗打开状态变化
watch(() => props.visible, (newVal) => {
  if (newVal && props.record) {
    // 当弹窗打开时初始化数据
    nextTick(() => {
      initFormData();
    });
  }
}, { immediate: true });

// 初始化表单数据的函数
const initFormData = () => {
  if (!props.record || !props.record.id) return;
  
  form.recordId = props.record.id;
  form.companyId = props.record.companyId;
  form.goodsOrigin = props.record.goodsOrigin || '';
  form.goodsDestination = props.record.goodsDestination || '';
  
  // 入场信息
  form.inCargo.cargoName = props.record.inboundName || '';
  form.inCargo.volume = props.record.inboundVolume !== undefined && props.record.inboundVolume !== null ? 
                        props.record.inboundVolume : null;
  form.inCargo.unit = props.record.inboundUnit || '';
  form.inCargo.goodsType = props.record.inboundGoodsType || ''; // 假设后端没有这个字段，前端需要补充
  
  // 出场信息
  form.outCargo.cargoName = props.record.outboundName || '';
  form.outCargo.volume = props.record.outboundVolume !== undefined && props.record.outboundVolume !== null ? 
                         props.record.outboundVolume : null;
  form.outCargo.unit = props.record.outboundUnit || '';
  form.outCargo.goodsType = props.record.outboundGoodsType || ''; // 假设后端没有这个字段，前端需要补充
};

// 补录状态相关函数
const getLedgerStatusType = (status) => {
  if (status === 1) {
    return 'success'; // 已补录使用绿色
  } else if (status === undefined || status === null) {
    return 'info'; // 未知状态使用info
  } else {
    return 'warning'; // 未补录状态使用警告色
  }
};

const getLedgerStatusText = (status) => {
  if (status === 1) {
    return '已补录';
  } else if (status === undefined || status === null) {
    return '未知';
  } else {
    return '未补录';
  }
};

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false;
  formRef.value?.resetFields();
  // 重置表单数据
  resetForm();
};

// 新增重置表单数据函数
const resetForm = () => {
  form.recordId = null;
  form.companyId = null;
  form.goodsOrigin = '';
  form.goodsDestination = '';
  form.inCargo.cargoName = '';
  form.inCargo.volume = null;
  form.inCargo.goodsType = '';
  form.inCargo.unit = '';
  form.outCargo.cargoName = '';
  form.outCargo.volume = null;
  form.outCargo.goodsType = '';
  form.outCargo.unit = '';
};

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    
    // 检查是否有内容需要提交
    const hasInContent = !props.ledgerInfo?.inStatus || props.ledgerInfo?.inStatus !== 1;
    const hasOutContent = !props.ledgerInfo?.outStatus || props.ledgerInfo?.outStatus !== 1;
    
    if (!hasInContent && !hasOutContent) {
      ElNotification({
        title: '提示',
        message: '没有需要补录的数据',
        type: 'warning'
      });
      return;
    }
    
    // 准备提交数据
    const submitData = {
      recordId: form.recordId,
      companyId: form.companyId,
      goodsOrigin: form.goodsOrigin,
      goodsDestination: form.goodsDestination
    };
    
    // 只有未补录的数据才需要提交
    if (hasInContent && props.record.startDate) {
      // 确保入场货物信息完整
      if (!form.inCargo.cargoName || form.inCargo.volume === null || form.inCargo.volume === undefined || !form.inCargo.unit) {
        ElNotification({
          title: '错误',
          message: '入场货物信息不完整，请填写完整后再提交',
          type: 'error'
        });
        return;
      }
      submitData.inCargo = { ...form.inCargo };
    }
    
    if (hasOutContent && props.record.endDate) {
      // 确保出场货物信息完整
      if (!form.outCargo.cargoName || form.outCargo.volume === null || form.outCargo.volume === undefined || !form.outCargo.unit) {
        ElNotification({
          title: '错误',
          message: '出场货物信息不完整，请填写完整后再提交',
          type: 'error'
        });
        return;
      }
      submitData.outCargo = { ...form.outCargo };
    }
    
    submitting.value = true;
    const response = await supplementLedger(submitData);
    
    if (response.code === 200) {
      ElNotification({
        title: '成功',
        message: '货物信息补录成功',
        type: 'success'
      });
      emit('refresh');
      handleClose();
    } else {
      ElNotification({
        title: '错误',
        message: response.msg || '补录失败',
        type: 'error'
      });
    }
  } catch (error) {
    console.error('表单验证或提交失败:', error);
    ElNotification({
      title: '错误',
      message: '表单验证失败，请检查输入',
      type: 'error'
    });
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.cargo-supplement-dialog :deep(.el-dialog__body) {
  padding: 15px 20px;
}

.base-info-card {
  margin-bottom: 16px;
  border-radius: 8px;
  overflow: hidden;
}

.cargo-info-card {
  margin-bottom: 16px;
  border-radius: 8px;
  overflow: hidden;
}

.in-bound-card {
  border-top: 3px solid #67c23a;
}

.out-bound-card {
  border-top: 3px solid #409eff;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 5px;
}

.header-with-tag {
  display: flex;
  align-items: center;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.status-tag {
  margin-left: 10px;
  font-size: 12px;
  border-radius: 4px;
}

.time-info {
  font-size: 13px;
  color: #909399;
}

.empty-placeholder {
  margin: 16px 0;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

:deep(.disabled-input .el-input__inner) {
  background-color: #f5f7fa;
  color: #606266;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 10px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-input-number .el-input__wrapper) {
  padding-right: 0;
}

:deep(.el-card__body) {
  padding: 15px 20px;
}

:deep(.el-empty) {
  padding: 20px 0;
}
</style> 