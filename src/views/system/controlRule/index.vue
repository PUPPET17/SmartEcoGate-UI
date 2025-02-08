<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
            <el-col :span="5">
                <el-form-item label="企业名称" prop="companyId">
                    <el-select v-model="queryParams.companyId" placeholder="请选择企业" clearable style="width: 200px;">
                        <el-option v-for="item in enterpriseIds" :key="item.companyId" :label="item.companyName"
                            :value="item.companyId" />
                    </el-select>
                </el-form-item>
            </el-col>
            <el-form-item label="规则名称" prop="ruleName">
                <el-input v-model="queryParams.ruleName" placeholder="请输入规则名称" clearable style="width: 200px"
                    @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="状态" prop="enabled">
                <el-select v-model="queryParams.enabled" placeholder="规则状态" clearable style="width: 200px">
                    <el-option label="启用" :value="true" />
                    <el-option label="禁用" :value="false" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button type="primary" plain icon="Plus" @click="handleAddRule">新增</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdateRule">修改</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="danger" plain icon="Delete" :disabled="multiple"
                    @click="handleDeleteRule">删除</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="warning" plain icon="Download" @click="handleExport">导出</el-button>
            </el-col>
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="ruleList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column label="企业名称" align="center" show-overflow-tooltip>
                <template #default="scope">
                    {{ getCompanyName(scope.row.companyId) }}
                </template>
            </el-table-column>
            <el-table-column label="规则名称" align="center" prop="ruleName" />
            <el-table-column label="车辆类型" align="center" prop="classifyTitle">
                  <template #default="scope">
                    <div class="tag-container">
                      <template v-if="scope.row.classifyTitle && scope.row.classifyTitle.length">
                        <dict-tag v-for="(type, index) in scope.row.classifyTitle.slice(0, 2)" :key="type"
                          :options="classify_title" :value="type" class="tag-item" />
                        <el-tooltip v-if="scope.row.classifyTitle.length > 2" placement="top" class="custom-tooltip"
                          :content="getFullTagContent(scope.row.classifyTitle, classify_title)">
                          <el-tag size="small" type="info">+{{ scope.row.classifyTitle.length - 2 }}</el-tag>
                        </el-tooltip>
                      </template>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="车牌颜色" align="center" prop="plateColor">
                  <template #default="scope">
                    <div class="tag-container">
                      <template v-if="scope.row.plateColor && scope.row.plateColor.length">
                        <dict-tag v-for="(color, index) in scope.row.plateColor.slice(0, 2)" :key="color"
                          :options="plate_color" :value="color" class="tag-item" />
                        <el-tooltip v-if="scope.row.plateColor.length > 2" placement="top" class="custom-tooltip"
                          :content="getFullTagContent(scope.row.plateColor, plate_color)">
                          <el-tag size="small" type="info">+{{ scope.row.plateColor.length - 2 }}</el-tag>
                        </el-tooltip>
                      </template>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="燃料类型" align="center" prop="fuelType">
                  <template #default="scope">
                    <div class="tag-container">
                      <template v-if="scope.row.fuelType && scope.row.fuelType.length">
                        <dict-tag v-for="(type, index) in scope.row.fuelType.slice(0, 2)" :key="type"
                          :options="fuel_type" :value="type" class="tag-item" />
                        <el-tooltip v-if="scope.row.fuelType.length > 2" placement="top" class="custom-tooltip"
                          :content="getFullTagContent(scope.row.fuelType, fuel_type)">
                          <el-tag size="small" type="info">+{{ scope.row.fuelType.length - 2 }}</el-tag>
                        </el-tooltip>
                      </template>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="车辆种类" align="center" prop="vehicleClass">
                  <template #default="scope">
                    <div class="tag-container">
                      <template v-if="scope.row.vehicleClass && scope.row.vehicleClass.length">
                        <dict-tag v-for="(type, index) in scope.row.vehicleClass.slice(0, 2)" :key="type"
                          :options="vehicle_type" :value="type" class="tag-item" />
                        <el-tooltip v-if="scope.row.vehicleClass.length > 2" placement="top" class="custom-tooltip"
                          :content="getFullTagContent(scope.row.vehicleClass, vehicle_type)">
                          <el-tag size="small" type="info">+{{ scope.row.vehicleClass.length - 2 }}</el-tag>
                        </el-tooltip>
                      </template>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="排放标准" align="center" prop="emissionStandard">
                  <template #default="scope">
                    <div class="tag-container">
                      <template v-if="scope.row.emissionStandard && scope.row.emissionStandard.length">
                        <dict-tag v-for="(standard, index) in scope.row.emissionStandard.slice(0, 2)" :key="standard"
                          :options="emission_standard" :value="standard" class="tag-item" />
                        <el-tooltip v-if="scope.row.emissionStandard.length > 2" placement="top" class="custom-tooltip"
                          :content="getFullTagContent(scope.row.emissionStandard, emission_standard)">
                          <el-tag size="small" type="info">+{{ scope.row.emissionStandard.length - 2 }}</el-tag>
                        </el-tooltip>
                      </template>
                    </div>
                  </template>
                </el-table-column>
            <el-table-column label="状态" align="center">
                <template #default="scope">
                    <el-switch v-model="scope.row.enabled" active-text="启用" inactive-text="禁用"
                        @change="handleStatusChange(scope.row)" />
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template #default="scope">
                    <el-button link icon="Edit" @click="handleUpdateRule(scope.row)">修改</el-button>
                    <el-button link icon="Delete" @click="handleDeleteRule(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 添加分页组件 -->
        <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize" @pagination="getList" />

        <!-- 添加或修改禁行规则对话框 -->
        <el-dialog :title="title" v-model="ruleOpen" width="900px" append-to-body>
            <!-- 添加管控措施展示区域 -->
            <el-collapse v-model="activeControl" v-if="controlInfo" class="mb8">
                <el-collapse-item title="最新管控措施" name="1">
                    <div class="control-info">
                        <el-descriptions :column="2" border>
                            <el-descriptions-item label="预警等级">
                                <el-tag :type="getWarningLevelType(controlInfo.warningLevel)">{{
                                    getWarningLevelText(controlInfo.warningLevel) }}</el-tag>
                            </el-descriptions-item>
                            <el-descriptions-item label="响应等级">
                                <el-tag :type="getResponseLevelType(controlInfo.responseLevel)">{{
                                    getResponseLevelText(controlInfo.responseLevel) }}</el-tag>
                            </el-descriptions-item>
                            <el-descriptions-item label="管控时间" :span="2">{{ controlInfo.startTime }} 至 {{
                                controlInfo.endTime
                                }}</el-descriptions-item>
                            <el-descriptions-item label="管控措施" :span="2">
                                <div class="control-measures">
                                    <template v-if="controlInfo.controlMeasure">
                                        <template v-if="/^\d+$/.test(controlInfo.controlMeasure)">
                                            {{ getMeasureText(controlInfo.controlMeasure) }}
                                        </template>
                                        <template v-else>
                                            <template
                                                v-if="getVehicleTypes(controlInfo.controlMeasure).length > 0 || getEmissionStandards(controlInfo.controlMeasure).length > 0">
                                                <div v-if="getVehicleTypes(controlInfo.controlMeasure).length > 0"
                                                    class="measure-item">
                                                    <div class="measure-label">限行车辆类型：</div>
                                                    <div class="measure-content">{{
                                                        getVehicleTypes(controlInfo.controlMeasure).join('、') }}</div>
                                                </div>
                                                <div v-if="getEmissionStandards(controlInfo.controlMeasure).length > 0"
                                                    class="measure-item">
                                                    <div class="measure-label">限行排放阶段：</div>
                                                    <div class="measure-content">{{
                                                        getEmissionStandards(controlInfo.controlMeasure).join('、') }}
                                                    </div>
                                                </div>
                                            </template>
                                            <template v-else>
                                                {{ controlInfo.controlMeasure }}
                                            </template>
                                        </template>
                                    </template>
                                </div>
                            </el-descriptions-item>
                        </el-descriptions>
                    </div>
                </el-collapse-item>
            </el-collapse>

            <el-form ref="ruleRef" :model="form" :rules="rules" label-width="120px">
                <el-form-item label="企业名称" prop="companyId">
                    <el-col :span="8">
                        <el-select v-model="form.companyId" placeholder="请选择企业" clearable style="width: 200px;"
                            @change="handleCompanyChange">
                            <el-option v-for="item in enterpriseIds" :key="item.companyId" :label="item.companyName"
                                :value="item.companyId" />
                        </el-select>
                    </el-col>
                    <el-col :span="8">
                        <el-button type="info" plain icon="InfoFilled" @click="getLatestControl"
                            :disabled="!form.companyId">查询最新管控</el-button>
                    </el-col>
                </el-form-item>
                <el-form-item label="规则名称" prop="ruleName">
                    <el-input v-model="form.ruleName" placeholder="请输入规则名称" />
                </el-form-item>
                <el-form-item label="禁行日期" prop="forbiddenWeekdays">
                    <el-checkbox-group v-model="selectedWeekdays">
                        <el-checkbox :value="1">周一</el-checkbox>
                        <el-checkbox :value="2">周二</el-checkbox>
                        <el-checkbox :value="3">周三</el-checkbox>
                        <el-checkbox :value="4">周四</el-checkbox>
                        <el-checkbox :value="5">周五</el-checkbox>
                        <el-checkbox :value="6">周六</el-checkbox>
                        <el-checkbox :value="0">周日</el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
                <el-form-item label="禁行时间段">
                    <div v-for="(time, index) in form.forbiddenTimes" :key="index" class="time-range">
                        <el-time-picker v-model="time.start" format="HH:mm" value-format="HH:mm:ss"
                            placeholder="开始时间" />
                        <span class="time-separator">至</span>
                        <el-time-picker v-model="time.end" format="HH:mm" value-format="HH:mm:ss" placeholder="结束时间" />
                        <el-button type="danger" icon="Delete" circle @click="removeForbiddenTime(index)"
                            size="small" />
                        <el-button type="primary" icon="Plus" @click="addForbiddenTime" size="small">添加时间段</el-button>
                    </div>
                </el-form-item>
                <el-form-item label="规则生效日期">
                    <div v-for="(range, index) in form.dateRanges" :key="index" class="date-range">
                        <el-date-picker v-model="range.start" type="date" placeholder="开始日期" />
                        <span class="time-separator">至</span>
                        <el-date-picker v-model="range.end" type="date" placeholder="结束日期" />
                        <el-button type="danger" icon="Delete" circle @click="removeDateRange(index)" size="small" />
                        <el-button type="primary" icon="Plus" @click="addDateRange" size="small">添加日期区间</el-button>
                    </div>
                </el-form-item>
                <el-form-item v-for="(item, index) in selectItems" :key="index" :label="item.label" :prop="item.prop">
                    <el-select v-model="form[item.prop]" multiple clearable collapse-tags
                        :placeholder="item.placeholder" popper-class="custom-header" :max-collapse-tags="7">
                        <template #header>
                            <el-checkbox v-model="selectStates[item.prop].checkAll"
                                :indeterminate="selectStates[item.prop].indeterminate"
                                @change="handleCheckAll(item.prop, item.options)">
                                全选
                            </el-checkbox>
                        </template>
                        <el-option v-for="dict in item.options" :key="dict.value" :label="dict.label"
                            :value="dict.value" />
                    </el-select>
                </el-form-item>
                <el-form-item label="状态">
                    <el-radio-group v-model="form.enabled">
                        <el-radio :value="true">启用</el-radio>
                        <el-radio :value="false">禁用</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="备注" prop="remark">
                    <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button type="primary" @click="submitRuleForm">确 定</el-button>
                    <el-button @click="cancelRule">取 消</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup name="ControlRule">
import { listForbiddenRule, getForbiddenRule, delForbiddenRule, addForbiddenRule, updateForbiddenRule, exportForbiddenRule } from "@/api/system/forbiddenRule";
import { queryLatestControl } from "@/api/system/measure";
import { selectIds } from "@/api/system/info";

const { proxy } = getCurrentInstance();
const { plate_color, emission_standard, fuel_type, vehicle_type, classify_title } = proxy.useDict(
    'plate_color', 'emission_standard', 'fuel_type', 'vehicle_type', 'classify_title'
);

const enterpriseIds = ref([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const controlInfo = ref(null);
const activeControl = ref(['1']);
const form = ref({
    id: undefined,
    companyId: undefined,
    ruleName: undefined,
    plateColor: [],
    fuelType: [],
    vehicleClass: [],
    emissionStandard: [],
    forbiddenWeekdays: 0,
    forbiddenTimes: [{ start: '', end: '' }],
    dateRanges: [{ start: '', end: '' }],
    enabled: true,
    remark: undefined
});

const data = reactive({
    queryParams: {
        pageNum: 1,
        pageSize: 10,
        ruleName: undefined,
        enabled: undefined
    },
    rules: {
        ruleName: [
            { required: true, message: "规则名称不能为空", trigger: "change" }
        ],
        enabled: [
            { required: true, message: "规则状态不能为空", trigger: "change" }
        ]
    },
    ruleOpen: false,
    selectedWeekdays: [],
    ruleList: []
});

const { queryParams, rules, ruleList, ruleOpen } = toRefs(data);
const selectedWeekdays = ref([]);

// 使用 reactive 来管理选择项的状态
const selectStates = reactive({
    classifyTitle: { checkAll: false, indeterminate: false },
    plateColor: { checkAll: false, indeterminate: false },
    fuelType: { checkAll: false, indeterminate: false },
    vehicleClass: { checkAll: false, indeterminate: false },
    emissionStandard: { checkAll: false, indeterminate: false }
});

const selectItems = ref([
    {
        label: "禁行车辆类型",
        prop: "classifyTitle",
        placeholder: "请选择禁行车辆类型",
        options: classify_title
    },
    {
        label: "车牌颜色",
        prop: "plateColor",
        placeholder: "请选择车牌颜色",
        options: plate_color
    },
    {
        label: "燃料类型",
        prop: "fuelType",
        placeholder: "请选择燃料类型",
        options: fuel_type
    },
    {
        label: "车辆类型",
        prop: "vehicleClass",
        placeholder: "请选择车辆类型",
        options: vehicle_type
    },
    {
        label: "排放标准",
        prop: "emissionStandard",
        placeholder: "请选择排放标准",
        options: emission_standard
    }
]);

// 修改 handleCheckAll 函数
const handleCheckAll = (prop, options) => {
    const state = selectStates[prop];
    if (form.value[prop].length === options.length) {
        form.value[prop] = [];
        state.checkAll = false;
        state.indeterminate = false;
    } else {
        form.value[prop] = options.map(option => option.value);
        state.checkAll = true;
        state.indeterminate = false;
    }
};

// 监听每个选择框的变化
selectItems.value.forEach(item => {
    watch(() => form.value[item.prop], (val) => {
        const state = selectStates[item.prop];
        if (val.length === 0) {
            state.checkAll = false;
            state.indeterminate = false;
        } else if (val.length === item.options.length) {
            state.checkAll = true;
            state.indeterminate = false;
        } else {
            state.indeterminate = true;
            state.checkAll = false;
        }
    });
});

/** 查询规则列表 */
function getList() {
    loading.value = true;
    listForbiddenRule(queryParams.value).then(response => {
        ruleList.value = response.rows;
        total.value = response.total;
        loading.value = false;
    });
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

/** 新增按钮操作 */
function handleAddRule() {
    reset();
    ruleOpen.value = true;
    title.value = "添加禁行规则";
}

/** 修改按钮操作 */
function handleUpdateRule(row) {
    reset();
    const id = row.id || ids.value;
    getForbiddenRule(id).then(response => {
        const data = response.data;
        if (data.forbiddenTimes) {
            data.forbiddenTimes = data.forbiddenTimes.map(time => ({
                start: parseTimeToDate(time.start),
                end: parseTimeToDate(time.end)
            }));
        }
        if (data.dateRanges) {
            data.dateRanges = data.dateRanges.map(range => ({
                start: new Date(range.start),
                end: new Date(range.end)
            }));
        }
        form.value = { ...data };
        selectedWeekdays.value = getWeekdaysFromBitmap(data.forbiddenWeekdays);
        ruleOpen.value = true;
        title.value = "修改禁行规则";
    });
}

// 取消按钮
function cancelRule() {
    ruleOpen.value = false;
    resetRule();
}

// 表单重置
function reset() {
    form.value = {
        id: null,
        ruleName: undefined,
        plateColor: [],
        fuelType: [],
        vehicleClass: [],
        emissionStandard: [],
        forbiddenWeekdays: 0,
        forbiddenTimes: [{ start: '', end: '' }],
        dateRanges: [{ start: '', end: '' }],
        enabled: true,
        remark: undefined
    };
    selectedWeekdays.value = [];
    proxy.resetForm("ruleRef");
}

// 企业选择变化处理
function handleCompanyChange(value) {
    if (value) {
        getLatestControl();
    } else {
        controlInfo.value = null;
    }
}

// 查询最新管控措施
function getLatestControl() {
    if (!form.value.companyId) {
        proxy.$modal.msgWarning("请先选择企业");
        return;
    }

    queryLatestControl(form.value.companyId).then(response => {
        if (response.code === 200) {
            controlInfo.value = response.data;
            activeControl.value = ['1'];
            proxy.$modal.msgSuccess("查询成功");
        } else {
            proxy.$modal.msgError(response.msg);
        }
    }).catch(error => {
        console.error('Failed to fetch latest control:', error);
        proxy.$modal.msgError('获取最新管控措施失败');
    });
}

// 获取预警等级文本
function getWarningLevelText(level) {
    const levels = {
        '1': '一级预警',
        '2': '二级预警',
        '3': '三级预警',
        '4': '四级预警',
        '5': '五级预警'
    };
    return levels[level] || `${level}级预警`;
}

// 获取预警等级类型
function getWarningLevelType(level) {
    const types = {
        '1': 'danger',
        '2': 'danger',
        '3': 'warning',
        '4': 'warning',
        '5': 'info'
    };
    return types[level] || '';
}

// 获取响应等级文本
function getResponseLevelText(level) {
    const levels = {
        '1': '一级响应',
        '2': '二级响应',
        '3': '三级响应',
        '4': '四级响应',
        '5': '五级响应'
    };
    return levels[level] || `${level}级响应`;
}

// 获取响应等级类型
function getResponseLevelType(level) {
    const types = {
        '1': 'danger',
        '2': 'warning',
        '3': 'info',
    };
    return types[level] || '';
}

// 从管控措施文本中提取车辆类型
function getVehicleTypes(measure) {
    if (!measure) return [];
    const match = measure.match(/限行车辆类型：(.*?)(?=，|$)/);
    if (match) {
        return match[1].split(' ').filter(Boolean);
    }
    return [];
}

// 从管控措施文本中提取排放标准
function getEmissionStandards(measure) {
    if (!measure) return [];
    const match = measure.match(/限行排放阶段：(.*?)(?=，|$)/);
    if (match) {
        return match[1].split(' ').filter(Boolean);
    }
    return [];
}

const getMeasureText = (measure) => {
    // 如果是纯数字，则进行映射
    if (/^\d+$/.test(measure)) {
        const measureMap = {
            '1': '禁行国三及以下重型柴油车（燃气）车通行',
            '2': '禁行国四及以下重型柴油（燃气）车通行',
            '3': '禁行国四及以下重型柴油与国五及以下燃气车通行',
            '4': '停止公路运输'
        };
        return measureMap[measure] || measure;
    }
    return measure;
};

// 将位图转换为星期几数组
function getWeekdaysFromBitmap(bitmap) {
    const weekdays = [];
    for (let i = 0; i < 7; i++) {
        if ((bitmap & (1 << i)) !== 0) {
            weekdays.push(i);
        }
    }
    return weekdays;
}

// 将星期几数组转换为位图
function getWeekdaysBitmap() {
    let bitmap = 0;
    selectedWeekdays.value.forEach(day => {
        bitmap |= (1 << parseInt(day));
    });
    return bitmap;
}

// 删除禁行规则按钮操作
function handleDeleteRule(row) {
    const ids = row.id || ids.value;
    proxy.$modal.confirm('是否确认删除禁行规则编号为"' + ids + '"的数据项？').then(function () {
        return delForbiddenRule(ids);
    }).then(() => {
        getList();
        proxy.$modal.msgSuccess("删除成功");
    }).catch(() => { });
}

// 提交禁行规则表单
function submitRuleForm() {
    proxy.$refs["ruleRef"].validate(valid => {
        if (valid) {
            // 将选中的星期几转换为位图
            form.value.forbiddenWeekdays = getWeekdaysBitmap();

            // 格式化时间段
            if (form.value.forbiddenTimes) {
                form.value.forbiddenTimes = form.value.forbiddenTimes.map(time => ({
                    start: formatTime(time.start),
                    end: formatTime(time.end)
                }));
            }

            // 格式化日期区间
            if (form.value.dateRanges) {
                form.value.dateRanges = form.value.dateRanges.map(range => ({
                    start: formatDate(range.start),
                    end: formatDate(range.end)
                }));
            }

            if (form.value.id != null) {
                updateForbiddenRule(form.value).then(response => {
                    proxy.$modal.msgSuccess("修改成功");
                    ruleOpen.value = false;
                    getList();
                });
            } else {
                addForbiddenRule(form.value).then(response => {
                    proxy.$modal.msgSuccess("新增成功");
                    ruleOpen.value = false;
                    getList();
                });
            }
        }
    });
}

// 修改状态处理函数
function handleStatusChange(row) {
    let text = row.enabled ? "启用" : "停用";
    proxy.$modal.confirm('确认要"' + text + '""' + row.ruleName + '"规则吗？').then(function () {
        return updateForbiddenRule(row);
    }).then(() => {
        proxy.$modal.msgSuccess(text + "成功");
    }).catch(function () {
        row.enabled = !row.enabled;
    });
}

// 格式化时间为 HH:mm:ss
function formatTime(time) {
    if (!time) return '';
    if (typeof time === 'string') return time;
    return time;
}

// 将 HH:mm:ss 格式的时间转换为字符串
function parseTimeToDate(timeStr) {
    if (!timeStr) return null;
    return timeStr;
}

// 格式化日期为 yyyy-MM-dd
function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 导出按钮操作
function handleExport() {
    proxy.$modal.confirm('是否确认导出所有禁行规则数据项？').then(() => {
        exportForbiddenRule({
            companyId: currentCompany.value?.companyId
        });
    });
}

// 多选框选中数据
function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.id);
    single.value = selection.length !== 1;
    multiple.value = !selection.length;
}

// 添加时间段
function addForbiddenTime() {
    form.value.forbiddenTimes.push({
        start: '',
        end: ''
    });
}

// 删除时间段
function removeForbiddenTime(index) {
    form.value.forbiddenTimes.splice(index, 1);
    if (form.value.forbiddenTimes.length === 0) {
        form.value.forbiddenTimes.push({ start: '', end: '' });
    }
}

// 添加日期区间
function addDateRange() {
    form.value.dateRanges.push({
        start: '',
        end: ''
    });
}

// 删除日期区间
function removeDateRange(index) {
    form.value.dateRanges.splice(index, 1);
    if (form.value.dateRanges.length === 0) {
        form.value.dateRanges.push({ start: '', end: '' });
    }
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

// 添加一个辅助函数来获取完整的标签内容
const getFullTagContent = (values, options) => {
  if (!values || !options) return '';
  return values
    .map(value => options.find(opt => opt.value === value)?.label || value)
    .join('、');
};

const getCompanyName = (companyId) => {
    const company = enterpriseIds.value.find(item => item.companyId === companyId)
    return company ? company.companyName : companyId
}

// 初始化
getEnterpriseList();
getList();
</script>

<style scoped>
/* 添加 transform 和 will-change 属性，启用GPU加速 */
.box-card {
    margin-bottom: 10px;
    transition: all 0.3s;
    transform: translateZ(0);
    will-change: transform;
}

.box-card:hover {
    box-shadow: 0 4px 12px rgba(85, 85, 85, 0.3);
}

/* 避免频繁改变布局属性 */
.card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    transform: translateZ(0);
    will-change: transform;
    position: relative;
}

.header-left {
    display: flex;
    align-items: center;
}

.header-left .el-icon {
    margin-right: 8px;
    color: var(--el-color-primary);
}

.header-right {
    display: flex;
    gap: 8px;
}

.info-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 5px;
    margin-bottom: 5px;
    padding: 8px;
    border-radius: 8px;
    transition: background-color var(--transition-duration);
    transform: translateZ(0);
    will-change: transform;
}

.info-item:hover {
    background-color: var(--hover-bg-color);
}

.info-item .label {
    min-width: 140px;
    display: flex;
    align-items: center;
    flex-shrink: 0;
}

.info-item .label .el-icon {
    margin-right: 8px;
    color: var(--el-color-primary);
}

.info-item :deep(.el-tag),
.info-item .value {
    margin-left: auto;
}

.custom-input-number :deep(.el-input__wrapper) {
    box-shadow: 0 0 0 1px var(--el-border-color-lighter) inset;
}

.custom-style .el-segmented {
    --el-segmented-item-selected-color: #F2F6FC;
    --el-segmented-item-selected-bg-color: #409EFF;
    --el-border-radius-base: 12px;
}

/* 优化动画性能 */
.dialog-fade-enter-active,
.dialog-fade-leave-active {
    transition: opacity 0.3s ease;
    will-change: opacity;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
    opacity: 0;
}

.custom-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 3px 8px;
    font-size: 14px;
    background-color: #f0f7ff;
    color: #409EFF;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid #d9ecff;
    /* 修改这里，设置固定宽度 */
    width: 100%;
    /* 根据最长的按钮文字设置合适的宽度 */
    height: 45px;
    /* 统一高度 */
    overflow: hidden;
    /* 防止文字溢出 */
    text-overflow: ellipsis;
    /* 文字溢出时显示省略号 */
}

.custom-btn:hover {
    background-color: #409EFF;
    color: white;
    transform: translateY(-1px);
}

.custom-btn:active {
    background-color: #3398ff;
}

.custom-btn:focus {
    outline: none;
}

.qrcode-dialog .el-dialog {
    margin-top: 0 !important;
    border-radius: 8px;
    overflow: hidden;
}

.qrcode-dialog .el-dialog__header {
    margin: 0;
    padding: 16px 20px;
    border-bottom: 1px solid #f0f0f0;
    background-color: #fafafa;
}

.qrcode-dialog .el-dialog__title {
    font-size: 16px;
    font-weight: 500;
    color: #333;
}

.qrcode-dialog .el-dialog__body {
    padding: 24px;
}

.qrcode-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
}

.qrcode-container img,
.qrcode-image {
    width: 310px;
    height: 310px;
    object-fit: contain;
    border: 1px solid #ebeef5;
    padding: 8px;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.qrcode-dialog .el-overlay {
    display: flex;
    align-items: center;
    justify-content: center;
}

.qrcode-container img {
    width: 310px;
    height: 310px;
    object-fit: contain;
    border: 1px solid #ebeef5;
    padding: 8px;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.custom-dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    backdrop-filter: blur(3px);
}

.custom-dialog {
    background: white;
    border-radius: 8px;
    width: 360px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
    transform-origin: center;
}

.dialog-header {
    padding: 16px 20px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    border-radius: 8px;
    justify-content: space-between;
    align-items: center;
    background-color: #fafafa;
}

.dialog-header span {
    font-size: 16px;
    font-weight: 500;
    color: #333;
    opacity: 0;
    animation: fadeInUp 0.4s ease forwards;
    animation-delay: 0.2s;
}

.dialog-header i {
    cursor: pointer;
    font-size: 18px;
    color: #909399;
    transition: all 0.3s ease;
    opacity: 0;
    animation: fadeInUp 0.4s ease forwards;
    animation-delay: 0.3s;
}

.dialog-header i:hover {
    color: #333;
    transform: rotate(90deg);
}

.dialog-body {
    padding: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.qrcode-image {
    width: 310;
    height: 310px;
    object-fit: contain;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid #e4e7ed;
    opacity: 0;
    animation: qrcodeFadeIn 0.6s ease forwards;
    animation-delay: 0.3s;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    background-color: #fff;
}

.qrcode-image:hover {
    transform: scale(1.05);
    border-color: #409EFF;
    background-color: #f0f7ff;
    cursor: pointer;
}

@keyframes qrcodeFadeIn {
    from {
        opacity: 0;
        transform: scale3d(0.9, 0.9, 1);
    }

    to {
        opacity: 1;
        transform: scale3d(1, 1, 1);
    }
}

@keyframes overlayFadeIn {
    from {
        opacity: 0;
        backdrop-filter: blur(0);
    }

    to {
        opacity: 1;
        backdrop-filter: blur(3px);
    }
}

@keyframes dialogSlideIn {
    from {
        opacity: 0;
        transform: scale(0.95) translateY(-20px);
    }

    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

.custom-dialog-overlay.closing {
    animation: overlayFadeOut 0.3s ease forwards;
}

.custom-dialog-overlay.closing .custom-dialog {
    animation: dialogSlideOut 0.3s ease forwards;
}

@keyframes overlayFadeOut {
    from {
        opacity: 1;
        backdrop-filter: blur(3px);
    }

    to {
        opacity: 0;
        backdrop-filter: blur(0);
    }
}

@keyframes dialogSlideOut {
    from {
        opacity: 1;
        transform: scale(1) translateY(0);
    }

    to {
        opacity: 0;
        transform: scale(0.95) translateY(20px);
    }
}

.dialog-fade-enter-active {
    animation: overlayFadeIn 0.3s ease;
}

.dialog-fade-enter-active .custom-dialog {
    animation: dialogSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.dialog-fade-leave-active {
    animation: overlayFadeOut 0.3s ease forwards;
}

.dialog-fade-leave-active .custom-dialog {
    animation: dialogSlideOut 0.3s ease forwards;
}

.qrcode-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
}

.download-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 20px;
    border-radius: 4px;
    background-color: #f0f7ff;
    color: #409EFF;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid #d9ecff;
    opacity: 0;
    animation: fadeInUp 0.4s ease forwards;
    animation-delay: 0.6s;
}

.download-button:hover {
    background-color: #409EFF;
    color: white;
    transform: translateY(-2px);
}

.download-button:active {
    transform: translateY(0);
}

.download-button i {
    font-size: 16px;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translate3d(0, 10px, 0);
    }

    to {
        opacity: 1;
        transform: translate3d(0, 0, 0);
    }
}

.el-divider {
    margin: 24px 0 16px;
}

.el-row {
    transition: all 0.3s ease-in-out;
}

.el-input.is-password :deep(.el-input__inner) {
    letter-spacing: 1px;
}

.card-footer {
    margin-top: 5px;
    margin-bottom: -10px;
    padding: 10px;
    border-top: 1px solid #ebeef5;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #409EFF;
    transition: all 0.3s;
    border-radius: 10px;
}

.card-footer:hover {
    background-color: #f0f7ff;
    color: #409EFF;
}

.card-footer .el-icon {
    margin-right: 8px;
    font-size: 16px;
}

.time-range,
.date-range {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    gap: 10px;
    transform: translateZ(0);
    will-change: transform;
}

.time-separator {
    margin: 0 10px;
    color: #909399;
}

.tag-item {
    margin-right: 5px;
    margin-bottom: 5px;
}

.content-section {
    background-color: #fff;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.fullscreen-dialog-content {
    padding: 20px;
    height: calc(100vh - 120px);
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    will-change: transform;
}

/* 优化表格性能 */
.el-table {
    transform: translateZ(0);
    will-change: transform;
}

/* 优化动画元素 */
.qrcode-image,
.download-button,
.custom-btn {
    transform: translateZ(0);
    will-change: transform;
}

/* 使用 CSS 变量优化动态样式计算 */
:root {
    --transition-duration: 0.3s;
    --primary-color: #409EFF;
    --hover-bg-color: #f0f7ff;
    --border-color: #ebeef5;
}

/* 优化动画性能 */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translate3d(0, 10px, 0);
    }

    to {
        opacity: 1;
        transform: translate3d(0, 0, 0);
    }
}

.control-info {
    padding: 10px;
    background-color: #f8f9fa;
    border-radius: 4px;
}

.mb8 {
    margin-bottom: 8px;
}

.control-measures {
    .measure-item {
        margin-bottom: 8px;
        line-height: 1.8;
    }

    .measure-label {
        font-weight: bold;
        color: #606266;
        margin-right: 8px;
        display: inline-block;
    }

    .measure-content {
        color: #303133;
        display: inline-block;
    }
}

/* 添加相关样式 */
.time-range,
.date-range {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
}

.time-separator {
    margin: 0 8px;
}

.el-button.is-circle {
    padding: 8px;
}

/* 确保时间选择器和日期选择器的宽度合适 */
:deep(.el-time-picker),
:deep(.el-date-picker) {
    width: 140px;
}

.custom-header {
    .el-checkbox {
        display: flex;
        height: unset;
    }
}

:deep(.el-date-picker) {
  width: 140px;
}

.tag-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  justify-content: center;
}

.custom-tooltip {
  background-color: #f5f5f5; /* 背景颜色 */
  border: 1px solid #dcdfe6; /* 边框颜色 */
  border-radius: 4px; /* 圆角 */
  padding: 8px; /* 内边距 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); /* 阴影效果 */
  color: #333; /* 字体颜色 */
  font-size: 14px; /* 字体大小 */
}

.custom-tooltip .el-tooltip__popper {
  /* 额外的样式可以在这里添加 */
}
</style>