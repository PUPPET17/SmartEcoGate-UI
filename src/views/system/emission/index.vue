<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch">
            <el-row :gutter="20">
                <el-col :span="3">
                    <el-form-item label="车牌号码" prop="licenseNo">
                        <el-input v-model="queryParams.licenseNo" placeholder="请输入车牌号码" clearable style="width: 150px"
                            @keyup.enter="handleQuery" />
                    </el-form-item>
                </el-col>
                <el-col :span="3">
                    <el-form-item label="车牌颜色" prop="licenseColor">
                        <el-select v-model="queryParams.licenseColor" placeholder="请选择车牌颜色" clearable style="width: 150px">
                            <el-option label="蓝牌" :value="0" />
                            <el-option label="黄牌" :value="1" />
                            <el-option label="白牌" :value="2" />
                            <el-option label="黑牌" :value="3" />
                            <el-option label="新能源绿牌" :value="4" />
                            <el-option label="其他" :value="5" />
                            <el-option label="新能源绿黄牌" :value="6" />
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="3">
                    <el-form-item label="状态" prop="state">
                        <el-select v-model="queryParams.state" placeholder="请选择状态" clearable style="width: 150px">
                            <el-option label="未解除" :value="0" />
                            <el-option label="解除" :value="1" />
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="24">
                    <el-form-item>
                        <el-button type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
                        <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>

        <el-table v-loading="loading" :data="emissionList" stripe border>
            <el-table-column label="车牌号码" align="center" prop="licenseNo" />
            <el-table-column label="车牌颜色" align="center" prop="licenseColor">
                <template #default="scope">
                    <span>{{ scope.row.licenseColor === 0 ? '蓝牌' :
                        scope.row.licenseColor === 1 ? '黄牌' :
                        scope.row.licenseColor === 2 ? '白牌' :
                        scope.row.licenseColor === 3 ? '黑牌' :
                        scope.row.licenseColor === 4 ? '新能源绿牌' :
                        scope.row.licenseColor === 5 ? '其他' :
                        scope.row.licenseColor === 6 ? '新能源绿黄牌' : ''
                    }}</span>
                </template>
            </el-table-column>
            <el-table-column label="状态" align="center" prop="state">
                <template #default="scope">
                    <dict-tag :options="[
                        { label: '未解除', value: '0' ,type:'danger'},
                        { label: '已解除', value: '1' ,type:'success'}
                    ]" :value="scope.row.state" />
                </template>
            </el-table-column>
            <el-table-column label="排放标准" align="center" prop="standard">
                <template #default="scope">
                    <dict-tag :options="emission_standard" :value="scope.row.standard" />
                </template>
            </el-table-column>
            <el-table-column label="车辆识别号" align="center" prop="vin" />
            <el-table-column label="燃料类型" align="center" prop="fuelType">
                <template #default="scope">
                    <dict-tag :options="fuel_type" :value="scope.row.fuelType" />
                </template>
            </el-table-column>
            <el-table-column label="超标原因" align="center" prop="reason" :show-overflow-tooltip="true">
                <template #default="scope">
                    <span>{{ scope.row.reason === '1' ? '环保定期检验' :
                        scope.row.reason === '2' ? '远程监控' :
                        scope.row.reason === '3' ? '路检路查' :
                        scope.row.reason === '4' ? '入户检查' :
                        scope.row.reason === '5' ? '尾气遥感监测' :
                        scope.row.reason === '6' ? '黑烟举报' :
                        scope.row.reason === '7' ? '其他' : ''
                    }}</span>
                </template>
            </el-table-column>
            <el-table-column label="下发时间" align="center" prop="deliveryTime" width="180" />
            <el-table-column label="解除时间" align="center" prop="releaseTime" width="180" />
        </el-table>

        <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize" @pagination="getList" />
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, toRefs } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import { listEmission } from "@/api/system/emission"

const { proxy } = getCurrentInstance();
const {  emission_standard, fuel_type } = proxy.useDict('emission_standard', 'fuel_type');

const queryFormRef = ref()
const loading = ref(true)
const showSearch = ref(true)
const total = ref(0)
const emissionList = ref([])

const data = reactive({
    queryParams: {
        pageNum: 1,
        pageSize: 20,
        licenseNo: null,
        licenseColor: null,
        state: null
    }
})

const { queryParams } = toRefs(data)

/** 查询黑名单车辆列表 */
function getList() {
    loading.value = true;
    listEmission(queryParams.value).then(response => {
        emissionList.value = response.rows;
        total.value = response.total;
        loading.value = false;
    });
}

/** 搜索按钮操作 */
const handleQuery = () => {
    queryParams.value.pageNum = 1
    getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
    queryFormRef.value?.resetFields()
    handleQuery()
}

onMounted(() => {
    getList()
})
</script>