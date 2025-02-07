<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px"
      label-position="left">
      <el-row :gutter="20">
        <el-col :span="4">
          <el-form-item label="企业名称" prop="companyName">
            <el-tooltip class="item" effect="light" content="支持输入过滤" placement="bottom" popper-class="fade">
              <el-select v-model="queryParams.companyId" placeholder="请选择企业" clearable filterable style="width: 180px;">
                <el-option v-for="item in enterpriseIds" :key="item.companyId" :label="item.companyName"
                  :value="item.companyId" />
              </el-select>
            </el-tooltip>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="车牌号" prop="plateNumber">
            <el-input v-model="queryParams.plateNumber" placeholder="请输入车牌号" clearable @keyup.enter="handleQuery" />
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="排放阶段" prop="emissionStage">
            <el-select v-model="queryParams.emissionStage" placeholder="请选择排放阶段" style="width: 180px;" clearable>
              <el-option v-for="dict in emission_standard" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="认证状态" prop="vehicleStatus">
            <el-select v-model="queryParams.vehicleStatus" placeholder="请选择认证状态" clearable style="width: 180px;">
              <el-option v-for="dict in certified" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['system:onSiteVehicle:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['system:onSiteVehicle:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['system:onSiteVehicle:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Warning" :disabled="multiple" @click="checkBlacklist">检查黑名单</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['system:onSiteVehicle:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="onSiteVehicleList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="企业名称" align="center" prop="companyName" />
      <el-table-column label="车牌号" align="center" prop="plateNumber" />
      <el-table-column label="车牌颜色" align="center" prop="plateColor">
        <template #default="scope">
          <dict-tag :options="plate_color" :value="scope.row.plateColor" />
        </template>
      </el-table-column>
      <el-table-column label="VIN" align="center" prop="vin" />
      <el-table-column label="车辆类型" align="center" prop="vehicleType">
        <template #default="scope">
          <dict-tag :options="vehicle_type" :value="scope.row.vehicleType" />
        </template>
      </el-table-column>
      <el-table-column label="排放阶段" align="center" prop="emissionStage">
        <template #default="scope">
          <dict-tag :options="emission_standard" :value="scope.row.emissionStage" />
        </template>
      </el-table-column>
      <el-table-column label="环保登记编码" align="center" prop="environmentalRatingCode" />
      <el-table-column label="品牌型号" align="center" prop="brandModel" />
      <el-table-column label="注册日期" align="center" prop="registrationDate">
        <template #default="scope">
          <span>{{ parseTime(scope.row.registrationDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="发证日期" align="center" prop="certDate">
        <template #default="scope">
          <span>{{ parseTime(scope.row.certDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="使用性质" align="center" prop="usageProperty">
        <template #default="scope">
          <dict-tag :options="usage_property" :value="scope.row.usageProperty" />
        </template>
      </el-table-column>
      <el-table-column label="发动机号" align="center" prop="engineNumber" />
      <el-table-column label="车辆所属人" align="center" prop="ownerName" />
      <el-table-column label="燃油类型" align="center" prop="fuelType">
        <template #default="scope">
          <dict-tag :options="fuel_type" :value="scope.row.fuelType" />
        </template>
      </el-table-column>
      <el-table-column label="车辆状态" align="center" prop="vehicleStatus">
        <template #default="scope">
          <dict-tag :options="certified" :value="scope.row.vehicleStatus" />
        </template>
      </el-table-column>
      <el-table-column label="认证信息" align="center" prop="msg" show-overflow-tooltip>
      </el-table-column>/>
      <el-table-column label="行驶证图片" align="center" prop="drivingImage" width="100">
        <template #default="scope">
          <image-preview :src="scope.row.drivingImage" :width="50" :height="50" />
        </template>
      </el-table-column>
      <!-- <el-table-column label="随车清单" align="center" prop="accompanyingDocumentsImage" width="100">
        <template #default="scope">
          <image-preview :src="scope.row.accompanyingDocumentsImage" :width="50" :height="50" />
        </template>
      </el-table-column> -->
      <el-table-column label="操作" align="center" fixed="right">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['system:onSiteVehicle:edit']">修改</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['system:onSiteVehicle:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改场内车辆信息对话框 -->
    <el-dialog :title="title" v-model="open" width="1300px" append-to-body>
      <el-form ref="onSiteVehicleRef" :model="form" :rules="rules" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="企业名称" prop="companyId">
              <el-select v-model="form.companyId" placeholder="请选择企业" clearable filterable>
                <el-option v-for="item in enterpriseIds" :key="item.companyId" :label="item.companyName"
                  :value="item.companyId" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="车牌号" prop="plateNumber">
              <div class="plate-number-container">
                <el-input v-model="form.plateNumber" placeholder="请输入车牌号" style="width: calc(100% - 45px)" />
                <el-button type="primary" :icon="Search" circle @click="checkSinglePlateBlacklist"
                  :disabled="!form.plateNumber" style="margin-left: 5px" />
              </div>
            </el-form-item>
          </el-col>

          <template v-if="showFields.includes('plateColor')">
            <el-col :span="8">
              <el-form-item label="车牌颜色" prop="plateColor">
                <el-select v-model="form.plateColor" placeholder="请选择车牌颜色">
                  <el-option v-for="dict in plate_color" :key="dict.value" :label="dict.label" :value="dict.value" />
                </el-select>
              </el-form-item>
            </el-col>
          </template>

          <template v-if="showFields.includes('vin')">
            <el-col :span="8">
              <el-form-item label="VIN" prop="vin">
                <el-input v-model="form.vin" placeholder="请输入车辆VIN码" minlength="17" maxlength="17" show-word-limit />
              </el-form-item>
            </el-col>
          </template>

          <template v-if="showFields.includes('vehicleType')">
            <el-col :span="8">
              <el-form-item label="车辆类型" prop="vehicleType">
                <el-select v-model="form.vehicleType" placeholder="请选择车辆类型" filterable>
                  <el-option v-for="dict in vehicle_type" :key="dict.value" :label="dict.label" :value="dict.value" />
                </el-select>
              </el-form-item>
            </el-col>
          </template>

          <template v-if="showFields.includes('emissionStage')">
            <el-col :span="8">
              <el-form-item label="排放标准" prop="emissionStage">
                <el-select v-model="form.emissionStage" placeholder="请选择排放标准">
                  <el-option v-for="dict in emission_standard" :key="dict.value" :label="dict.label"
                    :value="dict.value" />
                </el-select>
              </el-form-item>
            </el-col>
          </template>

          <template v-if="showFields.includes('environmentalRatingCode')">
            <el-col :span="8">
              <el-form-item label="环保登记编码" prop="environmentalRatingCode">
                <el-input v-model="form.environmentalRatingCode" placeholder="请输入环保登记编码" />
              </el-form-item>
            </el-col>
          </template>

          <template v-if="showFields.includes('provRegisCode')">
            <el-col :span="8">
              <el-form-item label="天津市登记编码" prop="provRegisCode">
                <el-input v-model="form.provRegisCode" placeholder="请输入天津市登记编码" />
              </el-form-item>
            </el-col>
          </template>

          <template v-if="showFields.includes('brandModel')">
            <el-col :span="8">
              <el-form-item label="品牌型号" prop="brandModel">
                <el-input v-model="form.brandModel" placeholder="请输入品牌型号" />
              </el-form-item>
            </el-col>
          </template>

          <template v-if="showFields.includes('usageProperty')">
            <el-col :span="8">
              <el-form-item label="使用性质" prop="usageProperty">
                <el-select v-model="form.usageProperty" placeholder="请选择使用性质">
                  <el-option v-for="dict in usage_property" :key="dict.value" :label="dict.label" :value="dict.value" />
                </el-select>
              </el-form-item>
            </el-col>
          </template>

          <template v-if="showFields.includes('registrationDate')">
            <el-col :span="8">
              <el-form-item label="注册日期" prop="registrationDate">
                <el-date-picker clearable v-model="form.registrationDate" type="date" value-format="YYYY-MM-DD"
                  placeholder="请选择注册日期" />
              </el-form-item>
            </el-col>
          </template>

          <template v-if="showFields.includes('certDate')">
            <el-col :span="8">
              <el-form-item label="发证日期" prop="certDate">
                <el-date-picker clearable v-model="form.certDate" type="date" value-format="YYYY-MM-DD"
                  placeholder="请选择发证日期" />
              </el-form-item>
            </el-col>
          </template>

          <template v-if="showFields.includes('prodDate')">
            <el-col :span="8">
              <el-form-item label="生产日期" prop="prodDate">
                <el-date-picker clearable v-model="form.prodDate" type="date" value-format="YYYY-MM-DD"
                  placeholder="请选择生产日期" />
              </el-form-item>
            </el-col>
          </template>

          <template v-if="showFields.includes('engineNumber')">
            <el-col :span="8">
              <el-form-item label="发动机号" prop="engineNumber">
                <el-input v-model="form.engineNumber" placeholder="请输入发动机号" />
              </el-form-item>
            </el-col>
          </template>

          <template v-if="showFields.includes('ownerName')">
            <el-col :span="8">
              <el-form-item label="车辆所属单位" prop="ownerName">
                <el-input v-model="form.ownerName" placeholder="请输入车辆所属单位" />
              </el-form-item>
            </el-col>
          </template>

          <template v-if="showFields.includes('fuelType')">
            <el-col :span="8">
              <el-form-item label="燃料类型" prop="fuelType">
                <el-select v-model="form.fuelType" placeholder="请选择燃料类型">
                  <el-option v-for="dict in fuel_type" :key="dict.value" :label="dict.label" :value="dict.value" />
                </el-select>
              </el-form-item>
            </el-col>
          </template>

          <el-row :gutter="20">
            <template v-if="showFields.includes('drivingImage')">
              <el-col :span="12">
                <el-form-item label="行驶证照片" prop="drivingImage">
                  <image-upload v-model="form.drivingImage" :companyId="form.companyId" />
                </el-form-item>
              </el-col>
            </template>

            <template v-if="showFields.includes('accompanyingDocumentsImage')">
              <el-col :span="12">
                <el-form-item label="随车清单照片" prop="accompanyingDocumentsImage">
                  <image-upload v-model="form.accompanyingDocumentsImage" :companyId="form.companyId" />
                </el-form-item>
              </el-col>
            </template>
          </el-row>

          <!-- 添加复选框 -->
          <el-col :span="12">
            <el-form-item label="入场补录">
              <el-checkbox v-model="inboundSupplement">自动入场补录</el-checkbox>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出场补录">
              <el-checkbox v-model="outboundSupplement">自动出场补录</el-checkbox>
            </el-form-item>
          </el-col>

          <!-- 入场货物信息 -->
          <template v-if="inboundSupplement">
            <el-col :span="6">
              <el-form-item label="入场货物名称" prop="inboundName" :rules="inboundNameRules">
                <el-input v-model="form.inboundName" placeholder="输入入场货物名称" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="入场运输量" prop="inboundVolume" :rules="inboundVolumeRules">
                <el-input v-model="form.inboundVolume" placeholder="输入入场运输量" type="number" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="入场货物单位" prop="inboundUnit" :rules="inboundUnitRules">
                <el-select v-model="form.inboundUnit" placeholder="选择货物单位">
                  <el-option v-for="unit in unit_options" :key="unit" :label="unit" :value="unit" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="入场货物类型" prop="inboundGoodsType" :rules="inboundGoodsTypeRules">
                <el-select v-model="form.inboundGoodsType" placeholder="选择入场货物类型">
                  <el-option v-for="dict in goods_type" :key="dict.value" :label="dict.label" :value="dict.value" />
                </el-select>
              </el-form-item>
            </el-col>
          </template>

          <!-- 出场货物信息 -->
          <template v-if="outboundSupplement">
            <el-col :span="6">
              <el-form-item label="出场货物名称" prop="outboundName" :rules="outboundNameRules">
                <el-input v-model="form.outboundName" placeholder="输入出场货物名称" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="出场运输量" prop="outboundVolume" :rules="outboundVolumeRules">
                <el-input v-model="form.outboundVolume" placeholder="输入出场运输量" type="number" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="出场货物单位" prop="outboundUnit" :rules="outboundUnitRules">
                <el-select v-model="form.outboundUnit" placeholder="选择货物单位">
                  <el-option v-for="unit in unit_options" :key="unit" :label="unit" :value="unit" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="出场货物类型" prop="outboundGoodsType" :rules="outboundGoodsTypeRules">
                <el-select v-model="form.outboundGoodsType" placeholder="选择出场货物类型">
                  <el-option v-for="dict in goods_type" :key="dict.value" :label="dict.label" :value="dict.value" />
                </el-select>
              </el-form-item>
            </el-col>
          </template>

          <!-- 货物来源地和目的地 -->
          <template v-if="outboundSupplement || inboundSupplement">
            <el-col :span="6">
              <el-form-item label="货物来源地" prop="goodsOrigin" :rules="goodsOriginRules">
                <el-input v-model="form.goodsOrigin" placeholder="输入货物来源地" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="货物目的地" prop="goodsDestination" :rules="goodsDestinationRules">
                <el-input v-model="form.goodsDestination" placeholder="输入货物目的地" />
              </el-form-item>
            </el-col>
          </template>

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

<script setup name="onSiteVehicle">
import { listOnSiteVehicle, getOnSiteVehicle, delOnSiteVehicle, addOnSiteVehicle, updateOnSiteVehicle } from "@/api/system/onSiteVehicle";
import { selectIds } from "@/api/system/info";
import { getEmissionByPlateNo } from "@/api/system/emission";
import { ElNotification } from "element-plus";
import { Search } from '@element-plus/icons-vue'

const { proxy } = getCurrentInstance();
const { plate_color, emission_standard, fuel_type, vehicle_type, usage_property, certified, goods_type } = proxy.useDict('plate_color', 'emission_standard', 'fuel_type', 'vehicle_type', 'usage_property', 'certified', 'goods_type');

const onSiteVehicleList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const enterpriseIds = ref([]);

// 添加计算属性判断当前企业的apiStrategy
const currentApiStrategy = computed(() => {
  const selectedCompany = enterpriseIds.value.find(item => item.companyId === form.value.companyId);
  return selectedCompany?.apiStrategy;
});

// 控制字段显示的计算属性
const showFields = computed(() => {
  const strategy = currentApiStrategy.value;

  // 基础字段（所有策略都显示）
  const baseFields = ['companyId', 'plateNumber'];

  // apiStrategy为1时显示的字段
  if (strategy === 1) {
    return [
      ...baseFields,
      'vehicleType',
      'plateColor',
      'usageProperty',
      'vin',
      'environmentalRatingCode',
      'registrationDate',
      'prodDate',
      'brandModel',
      'emissionStage',
      'engineNumber',
      'fuelType',
      'ownerName',
      'drivingImage',
      'accompanyingDocumentsImage'
    ];
  }

  // apiStrategy为2时显示的字段
  if (strategy === 2) {
    return [
      ...baseFields,
      'vin',
      'environmentalRatingCode',
      'registrationDate',
      'prodDate',
      'brandModel',
      'emissionStage',
      'fuelType',
      'ownerName',
      'drivingImage'
    ];
  }

  // apiStrategy为3时显示的字段
  if (strategy === 3) {
    return [
      ...baseFields,
      'vehicleType',
      'plateColor',
      'usageProperty',
      'vin',
      'environmentalRatingCode',
      'registrationDate',
      'prodDate',
      'certDate',
      'brandModel',
      'emissionStage',
      'fuelType',
      'engineNumber',
      'drivingImage',
      'ownerName'
    ];
  }

  // apiStrategy为4时显示的字段
  if (strategy === 4) {
    return [
      ...baseFields,
      'vin',
      'environmentalRatingCode',
      'provRegisCode',
      'registrationDate',
      'prodDate',
      'certDate',
      'brandModel',
      'emissionStage',
      'fuelType',
      'ownerName',
      'drivingImage'
    ];
  }

  // 默认显示所有字段
  return Object.keys(form.value);
});

const data = reactive({
  form: {
    id: null,
    companyId: null,
    plateNumber: null,
    vin: null,
    vehicleType: null,
    emissionStage: null,
    environmentalRatingCode: null,
    provRegisCode: null,
    brandModel: null,
    registrationDate: null,
    certDate: null,
    prodDate: null,
    plateColor: null,
    usageProperty: null,
    engineNumber: null,
    ownerName: null,
    fuelType: null,
    vehicleStatus: null,
    drivingImage: null,
    accompanyingDocumentsImage: null,
    outboundName: null,
    outboundVolume: null,
    outboundUnit: null,
    outboundGoodsType: null,
    inboundName: null,
    inboundVolume: null,
    inboundUnit: null,
    inboundGoodsType: null,
    goodsOrigin: null,
    goodsDestination: null,
    autoInboundSupplement: null,
    autoOutboundSupplement: null,
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    companyId: null,
    plateNumber: null,
    vin: null,
    vehicleType: null,
    emissionStage: null,
    environmentalRatingCode: null,
    brandModel: null,
    plateColor: null,
    usageProperty: null,
    engineNumber: null,
    ownerName: null,
    fuelType: null,
    vehicleStatus: null
  }
});

const outboundSupplement = ref(true);
const inboundSupplement = ref(true);

const { queryParams, form } = toRefs(data);

// 使用计算属性动态生成验证规则
const rules = computed(() => {
  // 基础规则
  const baseRules = {
    companyId: [{ required: true, message: "企业名称不能为空" }],
    plateNumber: [
      { required: true, message: "车牌号不能为空" },
      { pattern: /^[\u4e00-\u9fa5]{1}[A-Z]{1}[A-Z0-9]{5,6}$/, message: "请输入正确的车牌号格式" }
    ],
    outboundName: [{ required: true, message: '出场货物不能为空', trigger: 'blur' }],
    outboundVolume: [{ required: true, message: '出场运输量不能为空', trigger: 'blur' }],
    outboundUnit: [{ required: true, message: '出场货物单位不能为空', trigger: 'blur' }],
    outboundGoodsType: [{ required: true, message: '出场货物类型不能为空', trigger: 'blur' }],
    inboundName: [{ required: true, message: '入场货物不能为空', trigger: 'blur' }],
    inboundVolume: [{ required: true, message: '入场运输量不能为空', trigger: 'blur' }],
    inboundUnit: [{ required: true, message: '入场货物单位不能为空', trigger: 'blur' }],
    inboundGoodsType: [{ required: true, message: '入场货物类型不能为空', trigger: 'blur' }],
    goodsOrigin: [{ required: true, message: '货物来源地不能为空', trigger: 'blur' }],
    goodsDestination: [{ required: true, message: '货物目的地不能为空', trigger: 'blur' }],
  };

  const strategy = currentApiStrategy.value;

  // apiStrategy为1时的规则
  if (strategy === 1) {
    return {
      ...baseRules,
      vin: [
        { required: true, message: "VIN不能为空" },
        { len: 17, message: 'VIN必须是17位字符', trigger: 'blur' }
      ],
      engineNumber: [{ required: true, message: "发动机号不能为空" }],
      usageProperty: [{ required: true, message: "使用性质不能为空" }],
      vehicleType: [{ required: true, message: "车辆类型不能为空" }],
      plateColor: [{ required: true, message: "车牌颜色不能为空" }],
      environmentalRatingCode: [{ required: true, message: "环保登记编码不能为空" }],
      registrationDate: [{ required: true, message: "注册日期不能为空" }],
      prodDate: [{ required: true, message: "生产日期不能为空" }],
      brandModel: [{ required: true, message: "品牌型号不能为空" }],
      emissionStage: [{ required: true, message: "排放标准不能为空" }],
      fuelType: [{ required: true, message: "燃料类型不能为空" }],
      ownerName: [{ required: true, message: "车辆所属单位不能为空" }],
      drivingImage: [{ required: true, message: "行驶证照片不能为空" }]
    };
  }

  // apiStrategy为2时的规则
  if (strategy === 2) {
    return {
      ...baseRules,
      vin: [
        { required: true, message: "VIN不能为空" },
        { len: 17, message: 'VIN必须是17位字符', trigger: 'blur' }
      ],
      environmentalRatingCode: [{ required: true, message: "环保登记编码不能为空" }],
      registrationDate: [{ required: true, message: "注册日期不能为空" }],
      prodDate: [{ required: true, message: "生产日期不能为空" }],
      brandModel: [{ required: true, message: "品牌型号不能为空" }],
      emissionStage: [{ required: true, message: "排放标准不能为空" }],
      fuelType: [{ required: true, message: "燃料类型不能为空" }],
      ownerName: [{ required: true, message: "车辆所属单位不能为空" }],
      drivingImage: [{ required: true, message: "行驶证照片不能为空" }]
    };
  }

  // apiStrategy为3时的规则
  if (strategy === 3) {
    return {
      ...baseRules,
      vehicleType: [{ required: true, message: "车辆类型不能为空" }],
      plateColor: [{ required: true, message: "车牌颜色不能为空" }],
      usageProperty: [{ required: true, message: "使用性质不能为空" }],
      vin: [{ required: true, message: "VIN不能为空" },
      { len: 17, message: 'VIN必须是17位字符', trigger: 'blur' }],
      environmentalRatingCode: [{ required: true, message: "环保登记编码不能为空" }],
      registrationDate: [{ required: true, message: "注册日期不能为空" }],
      prodDate: [{ required: true, message: "生产日期不能为空" }],
      certDate: [{ required: true, message: "发证日期不能为空" }],
      brandModel: [{ required: true, message: "品牌型号不能为空" }],
      emissionStage: [{ required: true, message: "排放标准不能为空" }],
      fuelType: [{ required: true, message: "燃料类型不能为空" }],
      engineNumber: [{ required: true, message: "发动机号码不能为空" }],
      drivingImage: [{ required: true, message: "行驶证照片不能为空" }],
      ownerName: [{ required: true, message: "车辆所属单位不能为空" }]
    };
  }

  // apiStrategy为4时的规则
  if (strategy === 4) {
    return {
      ...baseRules,
      vin: [{ required: true, message: "VIN不能为空" },
      { len: 17, message: 'VIN必须是17位字符', trigger: 'blur' }],
      environmentalRatingCode: [{ required: true, message: "环保登记编码不能为空" }],
      provRegisCode: [{ required: true, message: "天津市登记码不能为空" }],
      registrationDate: [{ required: true, message: "注册日期不能为空" }],
      prodDate: [{ required: true, message: "生产日期不能为空" }],
      brandModel: [{ required: true, message: "品牌型号不能为空" }],
      emissionStage: [{ required: true, message: "排放标准不能为空" }],
      fuelType: [{ required: true, message: "燃料类型不能为空" }],
      ownerName: [{ required: true, message: "车辆所属单位不能为空" }],
      drivingImage: [{ required: true, message: "行驶证照片不能为空" }]
    };
  }
});

/** 查询场内车辆信息列表 */
function getList() {
  loading.value = true;
  listOnSiteVehicle(queryParams.value).then(response => {
    console.log("req.params: " + JSON.stringify(queryParams.value));
    onSiteVehicleList.value = response.rows;
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
    plateNumber: null,
    plateColor: null,
    vin: null,
    vehicleType: null,
    emissionStage: null,
    environmentalRatingCode: null,
    provRegisCode: null,
    brandModel: null,
    registrationDate: null,
    certDate: null,
    prodDate: null,
    usageProperty: null,
    engineNumber: null,
    ownerName: null,
    fuelType: null,
    vehicleStatus: null,
    drivingImage: null,
    accompanyingDocumentsImage: null,
    userId: null,
    deptId: null,
    outboundName: null,
    outboundVolume: null,
    outboundUnit: null,
    outboundGoodsType: '',
    inboundName: null,
    inboundVolume: null,
    inboundUnit: null,
    inboundGoodsType: '',
    goodsOrigin: null,
    goodsDestination: null,
    autoInboundSupplement: null,
    autoOutboundSupplement: null,
  };
  outboundSupplement.value = true;
  inboundSupplement.value = true;
  proxy.resetForm("onSiteVehicleRef");
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
  title.value = "添加场内车辆信息";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getOnSiteVehicle(_id).then(response => {
    const data = response.data;
    data.inboundGoodsType = data.inboundGoodsType?.toString();
    data.outboundGoodsType = data.outboundGoodsType?.toString();

    form.value = data;
    outboundSupplement.value = data.autoOutboundSupplement === 1;
    inboundSupplement.value = data.autoInboundSupplement === 1;

    open.value = true;
    title.value = "修改场内车辆信息";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["onSiteVehicleRef"].validate(valid => {
    form.value.autoOutboundSupplement = outboundSupplement.value ? 1 : 0;
    form.value.autoInboundSupplement = inboundSupplement.value ? 1 : 0;
    if (valid) {
      if (form.value.id != null) {
        updateOnSiteVehicle(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addOnSiteVehicle(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除场内车辆信息编号为"' + _ids + '"的数据项？').then(function () {
    return delOnSiteVehicle(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/onSiteVehicle/export', {
    ...queryParams.value
  }, `onSiteVehicle_${new Date().getTime()}.xlsx`)
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

const unit_options = [
  '升',
  '吨',
  '公斤',
  '立方米',
  '箱',
  '件'
];

const outboundNameRules = computed(() => {
  return !outboundSupplement.value ? [{ required: true, message: '出场货物名称不能为空', trigger: 'blur' }] : [];
});

const outboundVolumeRules = computed(() => {
  return !outboundSupplement.value ? [{ required: true, message: '出场运输量不能为空', trigger: 'blur' }] : [];
});

const outboundUnitRules = computed(() => {
  return !outboundSupplement.value ? [{ required: true, message: '出场货物单位不能为空', trigger: 'blur' }] : [];
});

const outboundGoodsTypeRules = computed(() => {
  return !outboundSupplement.value ? [{ required: true, message: '出场货物类型不能为空', trigger: 'blur' }] : [];
});

const inboundNameRules = computed(() => {
  return !inboundSupplement.value ? [{ required: true, message: '入场货物名称不能为空', trigger: 'blur' }] : [];
});

const inboundVolumeRules = computed(() => {
  return !inboundSupplement.value ? [{ required: true, message: '入场运输量不能为空', trigger: 'blur' }] : [];
});

const inboundUnitRules = computed(() => {
  return !inboundSupplement.value ? [{ required: true, message: '入场货物单位不能为空', trigger: 'blur' }] : [];
});

const inboundGoodsTypeRules = computed(() => {
  return !inboundSupplement.value ? [{ required: true, message: '入场货物类型不能为空', trigger: 'blur' }] : [];
});

const goodsOriginRules = computed(() => {
  return (!outboundSupplement.value || !inboundSupplement.value) ? [{ required: true, message: '货物来源地不能为空', trigger: 'blur' }] : [];
});

const goodsDestinationRules = computed(() => {
  return (!outboundSupplement.value || !inboundSupplement.value) ? [{ required: true, message: '货物目的地不能为空', trigger: 'blur' }] : [];
});

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
  const selectedRecords = onSiteVehicleList.value.filter(record => 
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

<style scoped>
.plate-number-container {
  display: flex;
  align-items: center;
}

:deep(.el-input) {
  margin-right: 5px;
}
</style>
