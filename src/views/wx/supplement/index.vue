<template>
    <div class="app-container">
        <div class="form-container">
            <!-- 添加记录信息显示区域 -->
            <div v-if="recordInfo" class="record-info">
                <el-row :gutter="20">
                    <el-col :span="12">
                        <div class="record-section">
                            <h3>入场</h3>
                            <p>时间：{{ recordInfo.startDate }}</p>
                            <div class="image-container" v-if="recordInfo.inImg">
                                <el-image 
                                    :src="recordInfo.inImg" 
                                    :preview-src-list="[recordInfo.inImg]"
                                    fit="cover"
                                    class="record-image">
                                    <template #error>
                                        <div class="image-error">
                                            <el-icon><Picture /></el-icon>
                                            <span>加载失败</span>
                                        </div>
                                    </template>
                                </el-image>
                            </div>
                        </div>
                    </el-col>
                    <el-col :span="12">
                        <div class="record-section">
                            <h3>出场</h3>
                            <template v-if="recordInfo.endDate">
                                <p>时间：{{ recordInfo.endDate }}</p>
                                <div class="image-container" v-if="recordInfo.outImg">
                                    <el-image 
                                        :src="recordInfo.outImg" 
                                        :preview-src-list="[recordInfo.outImg]"
                                        fit="cover"
                                        class="record-image">
                                        <template #error>
                                            <div class="image-error">
                                                <el-icon><Picture /></el-icon>
                                                <span>加载失败</span>
                                            </div>
                                        </template>
                                    </el-image>
                                </div>
                            </template>
                            <template v-else>
                                <div class="no-outbound">
                                    <el-icon><Warning /></el-icon>
                                    <span>未出场</span>
                                </div>
                            </template>
                        </div>
                    </el-col>
                </el-row>
            </div>

            <el-form ref="supplementFormRef" :model="form" :rules="rules" label-width="100px" label-position="right"
                size="large">
                <el-row :gutter="20">
                    <!-- 车牌号码 -->
                    <el-col :span="24">
                        <el-form-item label="车牌号" prop="plateNumber">
                            <div class="plate-search">
                                <el-input v-model="form.plateNumber" placeholder="请输入车牌号" show-word-limit maxlength="8" />
                                <el-button type="primary" @click="handleSearch" :loading="searching">查询</el-button>
                            </div>
                        </el-form-item>
                    </el-col>

                    <!-- 入场货物信息 -->
                    <el-col :span="24">
                        <el-form-item label="入场货物名称" prop="inCargo.cargoName">
                            <el-input v-model="form.inCargo.cargoName" placeholder="请输入入场货物名称" :disabled="!recordInfo" />
                        </el-form-item>
                    </el-col>

                    <el-col :span="24">
                        <el-form-item label="入场运输量" prop="inCargo.volume">
                            <el-input v-model="form.inCargo.volume" placeholder="请输入入场运输量" type="number" :disabled="!recordInfo" />
                        </el-form-item>
                    </el-col>

                    <el-col :span="24">
                        <el-form-item label="入场货物单位" prop="inCargo.unit">
                            <el-select v-model="form.inCargo.unit" placeholder="请选择货物单位" :disabled="!recordInfo">
                                <el-option v-for="unit in unit_options" :key="unit.value" :label="unit.label"
                                    :value="unit.value" />
                            </el-select>
                        </el-form-item>
                    </el-col>

                    <el-col :span="24">
                        <el-form-item label="入场货物类型" prop="inCargo.goodsType">
                            <el-select v-model="form.inCargo.goodsType" placeholder="请选择入场货物类型" :disabled="!recordInfo">
                                <el-option v-for="dict in goods_type" :key="dict.value" :label="dict.label"
                                    :value="dict.value" />
                            </el-select>
                        </el-form-item>
                    </el-col>

                    <!-- 出场货物信息 -->
                    <el-col :span="24" v-if="recordInfo?.endDate">
                        <el-form-item label="出场货物名称" prop="outCargo.cargoName">
                            <el-input v-model="form.outCargo.cargoName" placeholder="请输入出场货物名称" :disabled="!recordInfo" />
                        </el-form-item>
                    </el-col>

                    <el-col :span="24" v-if="recordInfo?.endDate">
                        <el-form-item label="出场运输量" prop="outCargo.volume">
                            <el-input v-model="form.outCargo.volume" placeholder="请输入出场运输量" type="number" :disabled="!recordInfo" />
                        </el-form-item>
                    </el-col>

                    <el-col :span="24" v-if="recordInfo?.endDate">
                        <el-form-item label="出场货物单位" prop="outCargo.unit">
                            <el-select v-model="form.outCargo.unit" placeholder="请选择货物单位" :disabled="!recordInfo">
                                <el-option v-for="unit in unit_options" :key="unit.value" :label="unit.label"
                                    :value="unit.value" />
                            </el-select>
                        </el-form-item>
                    </el-col>

                    <el-col :span="24" v-if="recordInfo?.endDate">
                        <el-form-item label="出场货物类型" prop="outCargo.goodsType">
                            <el-select v-model="form.outCargo.goodsType" placeholder="请选择出场货物类型" :disabled="!recordInfo">
                                <el-option v-for="dict in goods_type" :key="dict.value" :label="dict.label"
                                    :value="dict.value" />
                            </el-select>
                        </el-form-item>
                    </el-col>

                    <!-- 公共信息 -->
                    <el-col :span="24">
                        <el-form-item label="货物来源地" prop="goodsOrigin">
                            <el-input v-model="form.goodsOrigin" placeholder="请输入货物来源地" :disabled="!recordInfo" />
                        </el-form-item>
                    </el-col>

                    <el-col :span="24">
                        <el-form-item label="货物目的地" prop="goodsDestination">
                            <el-input v-model="form.goodsDestination" placeholder="请输入货物目的地" :disabled="!recordInfo" />
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>

            <div class="form-footer">
                <el-button type="primary" @click="submitForm">提交补录</el-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { getCurrentInstance, reactive, toRefs, onMounted, h, ref } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { recentRecord } from '@/api/wx/offSite';
import { supplementLedger } from '@/api/transit/record';
import { Picture, Warning } from '@element-plus/icons-vue';

const { proxy } = getCurrentInstance();
const { goods_type } = proxy.useDict('goods_type');
const route = useRoute();

const data = reactive({
    form: {
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
    },
    rules: {
        goodsOrigin: [
            { required: true, message: '请输入货物来源地', trigger: 'blur' },
            { whitespace: true, message: '货物来源地不能为空格', trigger: 'blur' }
        ],
        goodsDestination: [
            { required: true, message: '请输入货物目的地', trigger: 'blur' },
            { whitespace: true, message: '货物目的地不能为空格', trigger: 'blur' }
        ],
        'inCargo.cargoName': [
            { required: true, message: '请输入入场货物名称', trigger: 'blur' },
            { whitespace: true, message: '入场货物名称不能为空格', trigger: 'blur' }
        ],
        'inCargo.volume': [
            { required: true, message: '请输入入场货物数量', trigger: 'blur' },
            { pattern: /^[1-9]\d*(\.\d+)?$/, message: '入场货物数量必须为正数', trigger: 'blur' }
        ],
        'inCargo.unit': [
            { required: true, message: '请选择入场货物单位', trigger: 'change' }
        ],
        'inCargo.goodsType': [
            { required: true, message: '请选择入场货物类型', trigger: 'change' }
        ],
        'outCargo.cargoName': [
            { required: true, message: '请输入出场货物名称', trigger: 'blur' },
            { whitespace: true, message: '出场货物名称不能为空格', trigger: 'blur' }
        ],
        'outCargo.volume': [
            { required: true, message: '请输入出场货物数量', trigger: 'blur' },
            { pattern: /^[1-9]\d*(\.\d+)?$/, message: '出场货物数量必须为正数', trigger: 'blur' }
        ],
        'outCargo.unit': [
            { required: true, message: '请选择出场货物单位', trigger: 'change' }
        ],
        'outCargo.goodsType': [
            { required: true, message: '请选择出场货物类型', trigger: 'change' }
        ]
    }
});

const { form, rules } = toRefs(data);

const unit_options = [
  { label: '吨', value: 'T' },
  { label: '升', value: 'L' },
  { label: '包', value: 'P' },
];

const recordInfo = ref(null);
const searching = ref(false);

// 提交表单
function submitForm() {
    proxy.$refs["supplementFormRef"].validate((valid, fields) => {
        if (valid) {
            // 准备提交数据
            const submitData = {
                recordId: form.value.recordId,
                companyId: form.value.companyId,
                goodsOrigin: form.value.goodsOrigin,
                goodsDestination: form.value.goodsDestination,
                inCargo: { ...form.value.inCargo },
                outCargo: { ...form.value.outCargo }
            };
            console.log(submitData);

            supplementLedger(submitData).then(response => {
                if (response.code === 200) {
                    // 显示成功对话框
                    proxy.$msgbox({
                        title: '补录成功',
                        message: h('div', null, [
                            h('i', { class: 'el-icon-success', style: 'color: #67C23A; font-size: 24px; margin-right: 10px;' }),
                            h('span', null, '信息已成功补录！')
                        ]),
                        confirmButtonText: '确定',
                        callback: (action) => {
                            if (action === 'confirm') {
                                // 重置表单
                                proxy.$refs["supplementFormRef"].resetFields();
                                // 重新设置公司ID
                                form.value.companyId = route.query.aid;
                                // 清空记录信息
                                recordInfo.value = null;
                            }
                        }
                    });
                } else {
                    ElMessage.error(response.msg || '补录失败');
                }
            }).catch(error => {
                ElMessage.error(error.message || "请求失败，请稍后重试");
            });
        } else {
            // 获取第一个错误信息并显示
            const firstField = Object.values(fields)[0];
            if (firstField) {
                ElMessage.error(firstField[0].message);
            } else {
                ElMessage.error('表单验证失败，请检查必填项');
            }
        }
    });
}

const disableDoubleTapZoom = (e) => {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
};

onMounted(() => {
    document.body.addEventListener('touchstart', disableDoubleTapZoom, { passive: false });
    form.value.companyId = route.query.aid;
});

// 处理查询按钮点击
async function handleSearch() {
    if (!form.value.plateNumber?.trim()) {
        ElMessage.warning('请输入车牌号');
        return;
    }
    
    searching.value = true;
    try {
        const response = await recentRecord(route.query.aid, form.value.plateNumber);
        if (response.data) {
            // 保存完整记录信息用于显示
            recordInfo.value = response.data;
            
            // 填充表单数据
            form.value.recordId = response.data.id;
            form.value.companyId = response.data.companyId;
            form.value.goodsOrigin = response.data.goodsOrigin || '';
            form.value.goodsDestination = response.data.goodsDestination || '';
            
            // 入场信息
            form.value.inCargo.cargoName = response.data.inboundName || '';
            form.value.inCargo.volume = response.data.inboundVolume;
            form.value.inCargo.unit = response.data.inboundUnit || '';
            form.value.inCargo.goodsType = response.data.inboundGoodsType || '';
            
            // 出场信息
            form.value.outCargo.cargoName = response.data.outboundName || '';
            form.value.outCargo.volume = response.data.outboundVolume;
            form.value.outCargo.unit = response.data.outboundUnit || '';
            form.value.outCargo.goodsType = response.data.outboundGoodsType || '';
            
            ElMessage.success('已获取最新记录数据');
        } else {
            ElMessage.warning('未查询到相关记录');
            recordInfo.value = null;
        }
    } catch (error) {
        console.error('获取最新记录失败:', error);
        ElMessage.error('获取最新记录失败，请稍后重试');
        recordInfo.value = null;
    } finally {
        searching.value = false;
    }
}

</script>

<style scoped>
.app-container {
    padding: 20px;
    background-color: #f0f2f5;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.form-container {
    background-color: #ffffff;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}

.el-form-item {
    margin-bottom: 20px;
}

.el-input,
.el-select {
    border-radius: 5px;
    height: 42px;
    transition: border-color 0.3s;
}

.el-input:focus,
.el-select:focus {
    border-color: #409EFF;
}

.form-footer {
    margin-top: 20px;
    text-align: center;
}

.el-button {
    width: 100%;
    margin-top: 15px;
    transition: background-color 0.3s, border-color 0.3s;
}

.el-button.type-primary {
    background-color: #409EFF;
    border-color: #409EFF;
}

.el-button.type-primary:hover {
    background-color: #66b1ff;
}

/* 添加动画效果 */
@keyframes successAnimation {
    0% { transform: scale(0.7); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
}

:deep(.el-message-box) {
    animation: successAnimation 0.3s ease-out forwards;
}

/* 美化确认按钮 */
:deep(.el-message-box__btns .el-button--primary) {
    background-color: #67C23A;
    border-color: #67C23A;
    padding: 10px 20px;
}

:deep(.el-message-box__btns .el-button--primary:hover) {
    background-color: #85ce61;
    border-color: #85ce61;
}

.record-info {
    margin-bottom: 20px;
    padding: 15px;
    background-color: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
}

.record-section {
    padding: 10px;
    background-color: #fff;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.record-section h3 {
    margin: 0 0 10px 0;
    color: #303133;
    font-size: 16px;
}

.record-section p {
    margin: 5px 0;
    color: #606266;
}

.image-container {
    margin-top: 10px;
}

.record-image {
    width: 100%;
    height: 200px;
    border-radius: 4px;
    object-fit: cover;
}

.image-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    background-color: #f5f7fa;
    color: #909399;
}

.image-error .el-icon {
    font-size: 24px;
    margin-bottom: 8px;
}

.no-outbound {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    color: #909399;
}

.no-outbound .el-icon {
    font-size: 24px;
    margin-bottom: 8px;
    color: #E6A23C;
}

.no-outbound span {
    font-size: 14px;
}

.plate-search {
    display: flex;
    gap: 10px;
    align-items: center;
}

.plate-search .el-input {
    flex: 1;
}

.plate-search .el-input :deep(.el-input__wrapper) {
    height: 40px;
}

.plate-search .el-button {
    width: 80px;
    height: 40px;
    margin: 0;
    padding: 0;
}
</style>
