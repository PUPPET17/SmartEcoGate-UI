<template>
    <div class="app-container">
        <div class="form-container">
            <el-form ref="supplementFormRef" :model="form" :rules="rules" label-width="100px" label-position="right"
                size="large">
                <el-row :gutter="20">
                    <!-- 车牌号码 -->
                    <el-col :span="24">
                        <el-form-item label="车牌号" prop="plateNumber">
                            <el-input v-model="form.plateNumber" placeholder="请输入车牌号" show-word-limit maxlength="8" />
                        </el-form-item>
                    </el-col>

                    <!-- 入场货物信息 -->
                    <el-col :span="24">
                        <el-form-item label="入场货物名称" prop="inboundName">
                            <el-input v-model="form.inboundName" placeholder="请输入入场货物名称" />
                        </el-form-item>
                    </el-col>

                    <el-col :span="24">
                        <el-form-item label="入场运输量" prop="inboundVolume">
                            <el-input v-model="form.inboundVolume" placeholder="请输入入场运输量" type="number" />
                        </el-form-item>
                    </el-col>

                    <el-col :span="24">
                        <el-form-item label="入场货物单位" prop="inboundUnit">
                            <el-select v-model="form.inboundUnit" placeholder="请选择货物单位">
                                <el-option v-for="unit in unit_options" :key="unit" :label="unit" :value="unit" />
                            </el-select>
                        </el-form-item>
                    </el-col>

                    <el-col :span="24">
                        <el-form-item label="入场货物类型" prop="inboundGoodsType">
                            <el-select v-model="form.inboundGoodsType" placeholder="请选择入场货物类型">
                                <el-option v-for="dict in goods_type" :key="dict.value" :label="dict.label"
                                    :value="dict.value" />
                            </el-select>
                        </el-form-item>
                    </el-col>

                    <!-- 出场货物信息 -->
                    <el-col :span="24">
                        <el-form-item label="出场货物名称" prop="outboundName">
                            <el-input v-model="form.outboundName" placeholder="请输入出场货物名称" />
                        </el-form-item>
                    </el-col>

                    <el-col :span="24">
                        <el-form-item label="出场运输量" prop="outboundVolume">
                            <el-input v-model="form.outboundVolume" placeholder="请输入出场运输量" type="number" />
                        </el-form-item>
                    </el-col>

                    <el-col :span="24">
                        <el-form-item label="出场货物单位" prop="outboundUnit">
                            <el-select v-model="form.outboundUnit" placeholder="请选择货物单位">
                                <el-option v-for="unit in unit_options" :key="unit" :label="unit" :value="unit" />
                            </el-select>
                        </el-form-item>
                    </el-col>

                    <el-col :span="24">
                        <el-form-item label="出场货物类型" prop="outboundGoodsType">
                            <el-select v-model="form.outboundGoodsType" placeholder="请选择出场货物类型">
                                <el-option v-for="dict in goods_type" :key="dict.value" :label="dict.label"
                                    :value="dict.value" />
                            </el-select>
                        </el-form-item>
                    </el-col>

                    <!-- 公共信息 -->
                    <el-col :span="24">
                        <el-form-item label="货物来源地" prop="goodsOrigin">
                            <el-input v-model="form.goodsOrigin" placeholder="请输入货物来源地" />
                        </el-form-item>
                    </el-col>

                    <el-col :span="24">
                        <el-form-item label="货物目的地" prop="goodsDestination">
                            <el-input v-model="form.goodsDestination" placeholder="请输入货物目的地" />
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
import { getCurrentInstance, reactive, toRefs, onMounted, h } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { supplement } from '@/api/wx/offSite';

const { proxy } = getCurrentInstance();
const { goods_type } = proxy.useDict('goods_type');
const route = useRoute();

const data = reactive({
    form: {
        companyId: null,
        plateNumber: null,
        inboundName: null,
        inboundVolume: null,
        inboundUnit: null,
        inboundGoodsType: null,
        outboundName: null,
        outboundVolume: null,
        outboundUnit: null,
        outboundGoodsType: null,
        goodsOrigin: null,
        goodsDestination: null,
    },
    rules: {
        plateNumber: [
            { required: true, message: '车牌号不能为空', trigger: 'blur' },
            { min: 7, max: 8, message: '传统车牌7个字符，新能源车8个字符', trigger: 'blur' }
        ],
        inboundName: [
            { required: true, message: '入场货物名称不能为空', trigger: 'blur' },
            { whitespace: true, message: '入场货物名称不能为空格', trigger: 'blur' }
        ],
        inboundVolume: [
            { required: true, message: '入场运输量不能为空', trigger: 'blur' },
            { pattern: /^[1-9]\d*(\.\d+)?$/, message: '入场运输量必须为正数', trigger: 'blur' }
        ],
        inboundUnit: [
            { required: true, message: '入场货物单位不能为空', trigger: 'change' }
        ],
        inboundGoodsType: [
            { required: true, message: '入场货物类型不能为空', trigger: 'change' }
        ],
        outboundName: [
            { required: true, message: '出场货物名称不能为空', trigger: 'blur' },
            { whitespace: true, message: '出场货物名称不能为空格', trigger: 'blur' }
        ],
        outboundVolume: [
            { required: true, message: '出场运输量不能为空', trigger: 'blur' },
            { pattern: /^[1-9]\d*(\.\d+)?$/, message: '出场运输量必须为正数', trigger: 'blur' }
        ],
        outboundUnit: [
            { required: true, message: '出场货物单位不能为空', trigger: 'change' }
        ],
        outboundGoodsType: [
            { required: true, message: '出场货物类型不能为空', trigger: 'change' }
        ],
        goodsOrigin: [
            { required: true, message: '货物来源地不能为空', trigger: 'blur' },
            { whitespace: true, message: '货物来源地不能为空格', trigger: 'blur' }
        ],
        goodsDestination: [
            { required: true, message: '货物目的地不能为空', trigger: 'blur' },
            { whitespace: true, message: '货物目的地不能为空格', trigger: 'blur' }
        ]
    }
});

const { form, rules } = toRefs(data);

const unit_options = [
    '个',
    '升',
    '吨',
    '公斤',
    '立方米',
    '箱',
    '件'
];

// 提交表单
function submitForm() {
    proxy.$refs["supplementFormRef"].validate((valid, fields) => {
        if (valid) {
            // 在提交前进行额外的数据验证
            if (!form.value.plateNumber.trim()) {
                ElMessage.error('车牌号不能为空');
                return;
            }
            if (!form.value.inboundName?.trim()) {
                ElMessage.error('入场货物名称不能为空');
                return;
            }
            if (!form.value.inboundVolume || form.value.inboundVolume <= 0) {
                ElMessage.error('入场运输量必须大于0');
                return;
            }
            if (!form.value.outboundName?.trim()) {
                ElMessage.error('出场货物名称不能为空');
                return;
            }
            if (!form.value.outboundVolume || form.value.outboundVolume <= 0) {
                ElMessage.error('出场运输量必须大于0');
                return;
            }
            if (!form.value.goodsOrigin?.trim()) {
                ElMessage.error('货物来源地不能为空');
                return;
            }
            if (!form.value.goodsDestination?.trim()) {
                ElMessage.error('货物目的地不能为空');
                return;
            }

            supplement(form.value).then(response => {
                console.log("补录成功:", response);
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
                            // 重新设置公司ID，因为重置会清空所有字段
                            form.value.companyId = route.query.aid;
                        }
                    }
                });
            }).catch(error => {
                ElMessage.error(error.message || "请求失败，请稍后重试");
            });
            console.log("提交的表单数据:", form.value);
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
</style>
