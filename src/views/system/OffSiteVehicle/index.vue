<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" label-width="70px" :inline="true" v-show="showSearch"
      label-position="left">
      <el-row :gutter="10">
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
            <el-tooltip class="item" effect="light" content="支持输入过滤" placement="bottom" popper-class="fade">
              <el-input v-model="queryParams.plateNumber" placeholder="请输入车牌号" clearable @keyup.enter="handleQuery" />
            </el-tooltip>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="车牌颜色" prop="plateColor">
            <el-select v-model="queryParams.plateColor" placeholder="请选择车牌颜色" style="width: 180px;" clearable>
              <el-option v-for="dict in plate_color" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="燃油类型" prop="fuelType">
            <el-select v-model="queryParams.fuelType" placeholder="请选择燃油类型" style="width: 180px;" clearable>
              <el-option v-for="dict in fuel_type" :key="dict.value" :label="dict.label" :value="dict.value" />
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
          v-hasPermi="['system:OffSiteVehicle:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['system:OffSiteVehicle:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['system:OffSiteVehicle:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Warning" :disabled="multiple" @click="checkBlacklist">检查黑名单</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['system:OffSiteVehicle:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="OffSiteVehicleList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="企业名称" align="center" width="120" show-overflow-tooltip>
        <template #default="scope">
          {{ getCompanyName(scope.row.companyId) }}
        </template>
      </el-table-column>
      <el-table-column label="车牌号" align="center" prop="plateNumber" width="100" />
      <el-table-column label="VIN" align="center" prop="vin" show-overflow-tooltip />
      <el-table-column label="车辆类型" align="center" prop="vehicleType" width="100">
        <template #default="scope">
          <dict-tag :options="vehicle_type" :value="scope.row.vehicleType" />
        </template>
      </el-table-column>
      <el-table-column label="车辆种类" align="center" prop="carType" width="100">
        <template #default="scope">
          <dict-tag :options="car_type" :value="scope.row.carType" />
        </template>
      </el-table-column>
      <el-table-column label="排放阶段" align="center" prop="emissionStage" width="100">
        <template #default="scope">
          <dict-tag :options="emission_standard" :value="scope.row.emissionStage" />
        </template>
      </el-table-column>
      <el-table-column label="环保等级编码" align="center" prop="environmentalRatingCode" :show-overflow-tooltip="true" />
      <el-table-column label="品牌型号" align="center" prop="brandModel" width="100" />
      <el-table-column label="车牌颜色" align="center" prop="plateColor" width="100">
        <template #default="scope">
          <dict-tag :options="plate_color" :value="scope.row.plateColor" />
        </template>
      </el-table-column>
      <el-table-column label="使用性质" align="center" prop="usageProperty" width="100">
        <template #default="scope">
          <dict-tag :options="usage_property" :value="scope.row.usageProperty" />
        </template>
      </el-table-column>
      <el-table-column label="发动机号" align="center" prop="engineNumber" width="100" />
      <el-table-column label="核定载人数" align="center" prop="loadingCapacity" width="100" />
      <el-table-column label="总质量 (KG)" align="center" prop="totalWeight" width="100" />
      <el-table-column label="燃油类型" align="center" prop="fuelType" width="100">
        <template #default="scope">
          <dict-tag :options="fuel_type" :value="scope.row.fuelType" />
        </template>
      </el-table-column>
      <el-table-column label="认证状态" align="center" prop="vehicleStatus" width="100">
        <template #default="scope">
          <dict-tag :options="certified" :value="scope.row.vehicleStatus" />
        </template>
      </el-table-column>
      <el-table-column label="平台信息" align="center" prop="msg" width="150" :show-overflow-tooltip="true" />
      <el-table-column label="行驶证图片" align="center" prop="drivingImage" width="100">
        <template #default="scope">
          <image-preview :src="scope.row.drivingImage" :width="50" :height="50" />
        </template>
      </el-table-column>
      <el-table-column label="车辆图片" align="center" prop="chassisImage" width="100">
        <template #default="scope">
          <image-preview :src="scope.row.chassisImage" :width="50" :height="50" />
        </template>
      </el-table-column>
      <el-table-column label="随车清单" align="center" prop="accompanyingDocumentsImage" width="100">
        <template #default="scope">
          <image-preview :src="scope.row.accompanyingDocumentsImage" :width="50" :height="50" />
        </template>
      </el-table-column>
      <el-table-column label="车辆所属人" align="center" prop="ownerName" width="100" />
      <el-table-column label="来访事由" align="center" prop="inReason" width="100" />
      <el-table-column label="操作" align="center" fixed="right">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['system:OffSiteVehicle:edit']">修改</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['system:OffSiteVehicle:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改场外车辆信息对话框 -->
    <el-dialog :title="title" v-model="open" width="1300px" append-to-body>
      <el-form ref="OffSiteVehicleRef" :model="form" :rules="rules" label-width="120px" label-position="left">
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
            <el-form-item label="车牌号" prop="plateNumber">
              <div class="plate-number-container">
                <el-input v-model="form.plateNumber" placeholder="请输入车牌号" style="width: calc(100% - 45px)" />
                <el-button type="primary" :icon="Search" circle @click="checkSinglePlateBlacklist"
                  :disabled="!form.plateNumber" style="margin-left: 5px" />
              </div>
            </el-form-item>
          </el-col>

          <el-col :span="7">
            <el-form-item label="发动机号" prop="engineNumber">
              <el-input v-model="form.engineNumber" placeholder="请输入发动机号" />
            </el-form-item>
          </el-col>

          <el-col :span="14">
            <el-form-item label="VIN" prop="vin">
              <el-input v-model="form.vin" placeholder="请输入VIN" autosize show-word-limit maxlength="17" />
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="车辆类型" prop="vehicleType">
              <el-select v-model="form.vehicleType" placeholder="请选择车辆类型" filterable>
                <el-option v-for="dict in vehicle_type" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="7">
            <el-form-item label="车辆种类" prop="carType">
              <el-select v-model="form.carType" placeholder="请选择车辆种类" filterable>
                <el-option v-for="dict in car_type" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
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
            <el-form-item label="品牌型号" prop="brandModel">
              <el-input v-model="form.brandModel" placeholder="请输入品牌型号" />
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="车辆所属人" prop="ownerName">
              <el-input v-model="form.ownerName" placeholder="请输入车辆所属人" @input="onOwnerNameChange" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="14" v-if="showAddressField">
            <el-form-item label="车辆所属人住址" prop="address" label-width="120" :rules="addressRules">
              <el-input v-model="form.address" placeholder="请输入车辆所属人住址" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="7" v-if="showEngineFields">
            <el-form-item label="发动机型号" prop="engineType" :rules="engineTypeRules">
              <el-input v-model="form.engineType" placeholder="请输入发动机型号" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="7" v-if="showEngineFields">
            <el-form-item label="发动机厂商" prop="engineManufacturer" :rules="engineManufacturerRules">
              <el-input v-model="form.engineManufacturer" placeholder="请输入发动机厂商" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="注册日期" prop="registrationDate">
              <el-date-picker clearable v-model="form.registrationDate" type="date" value-format="YYYY-MM-DD"
                placeholder="请选择注册日期" />
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="发证日期" prop="certDate">
              <el-date-picker clearable v-model="form.certDate" type="date" value-format="YYYY-MM-DD"
                placeholder="请选择发证日期" />
            </el-form-item>
          </el-col>

          <el-col :span="7">
            <el-form-item label="车牌颜色" prop="plateColor">
              <el-select v-model="form.plateColor" placeholder="请选择车牌颜色">
                <el-option v-for="dict in plate_color" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="使用性质" prop="usageProperty">
              <el-select v-model="form.usageProperty" placeholder="请选择使用性质">
                <el-option v-for="dict in usage_property" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="7">
            <el-form-item label="来访事由" prop="inReason">
              <el-input v-model="form.inReason" placeholder="请输入来访事由" />
            </el-form-item>
          </el-col>

          <el-col :span="7">
            <el-form-item label="核定载人数" prop="loadingCapacity">
              <el-input v-model="form.loadingCapacity" placeholder="请输入核定载人数" type="number" />
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="核载质量" prop="totalWeight">
              <el-input v-model="form.totalWeight" placeholder="请输入核载质量" type="number" />
            </el-form-item>
          </el-col>

          <el-col :span="7" v-if="showFleetNameInput">
            <el-form-item label="车队名称" prop="fleetName">
              <el-input v-model="form.fleetName" @input="onFleetNameInputChange" placeholder="请输入车队名称" />
            </el-form-item>
          </el-col>
          <el-col :span="7" v-if="!showFleetNameInput">
            <el-form-item label="车队名称" prop="fleetName">
              <el-select v-model="form.fleetName" placeholder="请选择车队名称" clearable>
                <el-option label="自有" value="自有" />
                <el-option label="个人" value="个人" />
                <el-option v-if="form.companyId" :label="getCompanyName(form.companyId)"
                  :value="getCompanyName(form.companyId)" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="燃油类型" prop="fuelType">
              <el-select v-model="form.fuelType" placeholder="请选择燃油类型">
                <el-option v-for="dict in fuel_type" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-row :gutter="20">
            <el-col :span="7">
              <el-form-item label="行驶证图片" prop="drivingImage">
                <image-upload v-model="form.drivingImage" :companyId="form.companyId" />
              </el-form-item>
            </el-col>
            <el-col :span="7">
              <el-form-item label="车辆图片" prop="chassisImage">
                <image-upload v-model="form.chassisImage" :companyId="form.companyId" />
              </el-form-item>
            </el-col>

            <el-col :span="7">
              <el-form-item label="随车清单" prop="accompanyingDocumentsImage">
                <image-upload v-model="form.accompanyingDocumentsImage" :companyId="form.companyId" />
              </el-form-item>
            </el-col>
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
                  <el-option v-for="dict in goods_type" :key="dict.value" :label="dict.label"
                    :value="dict.value"></el-option>
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

<script setup name="OffSiteVehicle">
import { listOffSiteVehicle, getOffSiteVehicle, delOffSiteVehicle, addOffSiteVehicle, updateOffSiteVehicle } from "@/api/system/OffSiteVehicle";
import { selectIds } from "@/api/system/info";
import { getEmissionByPlateNo } from "@/api/system/emission";
import { ElNotification } from "element-plus";
import { Search } from '@element-plus/icons-vue'

const { proxy } = getCurrentInstance();
const { plate_color, emission_standard, fuel_type, vehicle_type, usage_property, car_type, certified, goods_type } = proxy.useDict
  ('plate_color', 'emission_standard', 'fuel_type', 'vehicle_type', 'usage_property', 'car_type', 'certified', 'goods_type');

const OffSiteVehicleList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const enterpriseIds = ref([]);

const isFleetNameChanged = ref(false);

const outboundSupplement = ref(true);
const inboundSupplement = ref(true);

const data = reactive({
  form: {
    id: null,
    companyId: null,
    plateNumber: null,
    vin: null,
    vehicleType: null,
    carType: null,
    emissionStage: null,
    environmentalRatingCode: null,
    brandModel: null,
    registrationDate: null,
    certDate: null,
    plateColor: null,
    usageProperty: null,
    engineNumber: null,
    inReason: null,
    ownerName: null,
    address: null,
    loadingCapacity: null,
    totalWeight: null,
    fleetName: null,
    fuelType: null,
    vehicleStatus: null,
    msg: null,
    fileSyncStatus: null,
    hasObd: null,
    startTime: null,
    endTime: null,
    drivingImage: null,
    chassisImage: null,
    accompanyingDocumentsImage: null,
    engineType: null,
    engineManufacturer: null,
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
    carType: null,
    emissionStage: null,
    environmentalRatingCode: null,
    brandModel: null,
    plateColor: null,
    usageProperty: null,
    engineNumber: null,
    inReason: null,
    ownerName: null,
    address: null,
    loadingCapacity: null,
    totalWeight: null,
    fuelType: null,
    vehicleStatus: null,
    msg: null,
    fileSyncStatus: null,
    drivingImage: null,
    chassisImage: null,
    accompanyingDocumentsImage: null,
    autoInboundSupplement: null,
    autoOutboundSupplement: null,
  },
  rules: {
    companyId: [{ required: true, message: '公司id不能为空', trigger: 'blur' }],
    plateNumber: [
      { required: true, message: '传统车牌7个字符，新能源车8个字符', trigger: 'blur' },
      { min: 7, max: 8, message: '传统车牌7个字符，新能源车8个字符', trigger: 'blur' }
    ],
    vin: [
      { required: true, message: 'VIN不能为空', trigger: 'blur' },
      { len: 17, message: 'VIN必须是17位字符', trigger: 'blur' }
    ],
    vehicleType: [{ required: true, message: '车辆类型不能为空', trigger: 'blur' }],
    carType: [{ required: true, message: '车辆类型不能为空', trigger: 'blur' }],
    emissionStage: [{ required: true, message: '排放标准不能为空', trigger: 'blur' }],
    brandModel: [{ required: true, message: '品牌型号不能为空', trigger: 'blur' }],
    registrationDate: [
      { required: true, message: '注册日期不能为空', trigger: 'blur' }
    ],
    certDate: [
      { required: true, message: '发证日期不能为空', trigger: 'blur' }
    ],
    plateColor: [{ required: true, message: '车牌颜色不能为空', trigger: 'blur' }],
    usageProperty: [{ required: true, message: '使用性质不能为空', trigger: 'blur' }],
    engineNumber: [{ required: true, message: '发动机号不能为空', trigger: 'blur' }],
    ownerName: [{ required: true, message: '车辆所属人不能为空', trigger: 'blur' }],
    loadingCapacity: [
      { required: true, message: '核定载人数不能为空', trigger: 'blur' },
      { pattern: /^[1-9]\d{0,1}$/, message: '核定载人数必须是1-2位数字', trigger: 'blur' }
    ],
    totalWeight: [
      { required: true, message: '总质量不能为空', trigger: 'blur' },
      { pattern: /^\d+$/, message: '总质量必须是数字', trigger: 'blur' }
    ],
    fuelType: [{ required: true, message: '燃油类型不能为空', trigger: 'blur' }],
    ownerPhone: [{ required: true, message: '联系电话不能为空', trigger: 'blur' }],
    fleetName: [{ required: true, message: '车队名称不能为空', trigger: 'blur' }],
    drivingImage: [{ required: true, message: '行驶证图片不能为空', trigger: 'change' }],
    chassisImage: [{ required: true, message: '车辆图片不能为空', trigger: 'change' }],
    accompanyingDocumentsImage: [{ required: true, message: '随车清单不能为空', trigger: 'change' }],
    engineType: [{ required: true, message: '发动机型号不能为空', trigger: 'blur' }],
    engineManufacturer: [{ required: true, message: '发动机厂商不能为空', trigger: 'blur' }],
    outboundName: [{ required: true, message: '出场货物不能为空', trigger: 'blur' }],
    outboundVolume: [{ required: true, message: '出场运输量不能为空', trigger: 'blur' }],
    outboundUnit: [{ required: true, message: '出场货物单位不能为空', trigger: 'blur' }],
    outboundGoodsType: [{ required: true, message: '出场货物类型不能为空', trigger: 'blur' }],
    inboundName: [{ required: true, message: '入场货物不能为空', trigger: 'blur' }],
    inboundVolume: [{ required: true, message: '入场运输量不能为空', trigger: 'blur' }],
    inboundUnit: [{ required: true, message: '入场货物单位不能为空', trigger: 'blur' }],
    inboundGoodsType: [{ required: true, message: '入场货物类型不能为空', trigger: 'blur' }],
    goodsOrigin: [{ required: true, message: '货物来源地不能为空', trigger: 'blur' }],
    goodsDestination: [{ required: true, message: '货物目的地不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

const unit_options = [
  'T',
  'L',
  'P',
];

// 添加计算属性判断是否显示地址字段
const showAddressField = computed(() => {
  const selectedCompany = enterpriseIds.value.find(item => item.companyId === form.value.companyId);
  return selectedCompany?.apiStrategy === 3;
});

// 添加计算属性判断是否显示发动机相关字段
const showEngineFields = computed(() => {
  const selectedCompany = enterpriseIds.value.find(item => item.companyId === form.value.companyId);
  return selectedCompany?.apiStrategy === 4;
});

// 添加动态地址验证规则
const addressRules = computed(() => {
  if (showAddressField.value) {
    return [{ required: true, message: '车辆所属人住址不能为空', trigger: 'blur' }];
  }
  return [];
});

// 添加动态验证规则
const engineTypeRules = computed(() => {
  if (showEngineFields.value) {
    return [{ required: true, message: '发动机型号不能为空', trigger: 'blur' }];
  }
  return [];
});

const engineManufacturerRules = computed(() => {
  if (showEngineFields.value) {
    return [{ required: true, message: '发动机厂商不能为空', trigger: 'blur' }];
  }
  return [];
});

// 监听企业选择变化
watch(() => form.value.companyId, (newVal) => {
  // 如果切换到非三门峡接口的企业，清空地址
  if (!showAddressField.value) {
    form.value.address = '';
  }
  // 如果切换到非apiStrategy为4的企业，清空发动机相关字段
  if (!showEngineFields.value) {
    form.value.engineType = '';
    form.value.engineManufacturer = '';
  }
});

/** 查询场外车辆信息列表 */
function getList() {
  loading.value = true;
  listOffSiteVehicle(queryParams.value).then(response => {
    OffSiteVehicleList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
  getEnterpriseList();
}

function onOwnerNameChange(newVal) {
  const selectedCompany = enterpriseIds.value.find(item => item.companyId === form.value.companyId);
  if (selectedCompany?.apiStrategy !== 1) {
    form.value.fleetName = newVal;
  }
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
    plateNumber: null,
    vin: null,
    vehicleType: null,
    carType: null,
    emissionStage: null,
    environmentalRatingCode: null,
    brandModel: null,
    registrationDate: null,
    certDate: null,
    plateColor: null,
    usageProperty: null,
    engineNumber: null,
    inReason: null,
    ownerName: null,
    address: null,
    loadingCapacity: null,
    totalWeight: null,
    fleetName: null,
    fuelType: null,
    vehicleStatus: null,
    msg: null,
    fileSyncStatus: null,
    hasObd: null,
    startTime: null,
    endTime: null,
    drivingImage: null,
    chassisImage: null,
    accompanyingDocumentsImage: null,
    engineType: null,
    engineManufacturer: null,
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
  };
  outboundSupplement.value = true;
  inboundSupplement.value = true;
  isFleetNameChanged.value = false;
  proxy.resetForm("OffSiteVehicleRef");
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
  title.value = "添加场外车辆信息";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value;
  getOffSiteVehicle(_id).then(response => {
    const data = response.data;
    data.inboundGoodsType = data.inboundGoodsType?.toString();
    data.outboundGoodsType = data.outboundGoodsType?.toString();

    form.value = data;
    outboundSupplement.value = data.autoOutboundSupplement === 1;
    inboundSupplement.value = data.autoInboundSupplement === 1;

    open.value = true;
    title.value = "修改场外车辆信息";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["OffSiteVehicleRef"].validate(valid => {
    if (valid) {
      form.value.autoOutboundSupplement = outboundSupplement.value ? 1 : 0;
      form.value.autoInboundSupplement = inboundSupplement.value ? 1 : 0;
      if (form.value.id != null) {
        updateOffSiteVehicle(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        form.vehicleStatus = 0 // 未认证市局
        addOffSiteVehicle(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除场外车辆信息编号为"' + _ids + '"的数据项？').then(function () {
    return delOffSiteVehicle(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/OffSiteVehicle/export', {
    ...queryParams.value
  }, `OffSiteVehicle_${new Date().getTime()}.xlsx`)
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

// 添加复选框切换方法
function toggleOutboundSupplement(value) {
  outboundSupplement.value = !value;
}

function toggleInboundSupplement(value) {
  inboundSupplement.value = !value;
}

// 添加动态验证规则
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

// 添加计算属性
const showFleetNameInput = computed(() => {
  const selectedCompany = enterpriseIds.value.find(item => item.companyId === form.value.companyId);
  return selectedCompany?.apiStrategy !== 1;
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
  const selectedRecords = OffSiteVehicleList.value.filter(record => 
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
