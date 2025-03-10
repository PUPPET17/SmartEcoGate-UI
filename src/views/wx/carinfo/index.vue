<template>
  <div class="app-container">
    <div class="form-container">
      <el-steps :active="activeStep" finish-status="success" simple style="margin-bottom: 40px">
        <el-step title="基本信息" />
        <el-step title="详细信息" />
        <el-step title="图片信息" />
      </el-steps>

      <el-form ref="OffSiteVehicleRef" :model="form" :rules="rules" label-width="110px" label-position="right"
        size="large">
        <!-- Step 1: 基本信息 -->
        <div v-if="activeStep === 0">
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item prop="plateNumber">
                <el-input v-model="form.plateNumber" placeholder="请输入车牌号" show-word-limit maxlength="8" />
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item prop="fuelType">
                <el-select v-model="form.fuelType" placeholder="请选择燃油类型" size="large">
                  <el-option v-for="dict in fuel_type" :key="dict.value" :label="dict.label" :value="dict.value" />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item prop="plateColor">
                <el-select v-model="form.plateColor" placeholder="请选择车牌颜色">
                  <el-option v-for="dict in plate_color" :key="dict.value" :label="dict.label" :value="dict.value" />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item prop="usageProperty">
                <el-select v-model="form.usageProperty" placeholder="请选择使用性质">
                  <el-option v-for="dict in usage_property" :key="dict.value" :label="dict.label" :value="dict.value" />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item prop="carType">
                <el-select v-model="form.carType" placeholder="请选择车辆种类" clearable>
                  <el-option v-for="dict in car_type" :key="dict.value" :label="dict.label" :value="dict.value" />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item prop="emissionStage">
                <el-select v-model="form.emissionStage" placeholder="请选择排放阶段" clearable>
                  <el-option v-for="dict in emission_standard" :key="dict.value" :label="dict.label"
                    :value="dict.value" />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item prop="vehicleType">
                <el-select v-model="form.vehicleType" placeholder="请选择车辆类型" filterable clearable>
                  <el-option v-for="dict in vehicle_type" :key="dict.value" :label="dict.label" :value="dict.value" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- Step 2: 详细信息 -->
        <div v-if="activeStep === 1">
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item prop="engineNumber">
                <el-input v-model="form.engineNumber" placeholder="请输入发动机号" />
              </el-form-item>
            </el-col>

            <el-col :span="24" v-if="showEngineFields">
              <el-form-item prop="engineType" :rules="engineTypeRules">
                <el-input v-model="form.engineType" placeholder="请输入发动机型号" clearable />
              </el-form-item>
            </el-col>

            <el-col :span="24" v-if="showEngineFields">
              <el-form-item prop="engineManufacturer" :rules="engineManufacturerRules">
                <el-input v-model="form.engineManufacturer" placeholder="请输入发动机厂商" clearable />
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item prop="vin">
                <el-input v-model="form.vin" placeholder="请输入VIN" autosize show-word-limit maxlength="17" />
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item prop="brandModel">
                <el-input v-model="form.brandModel" placeholder="请输入品牌型号" clearable />
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item prop="ownerName">
                <el-input v-model="form.ownerName" placeholder="请输入车辆所属人" @input="onOwnerNameChange" clearable />
              </el-form-item>
            </el-col>

            <el-col :span="24" v-if="showAddressField">
              <el-form-item prop="address" :rules="addressRules">
                <el-input v-model="form.address" placeholder="请输入车辆所属人住址" clearable />
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item prop="registrationDate">
                <el-date-picker clearable v-model="form.registrationDate" type="date" value-format="YYYY-MM-DD"
                  :editable=false placeholder="请选择注册日期" style="width: 300px;" />
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item prop="certDate">
                <el-date-picker clearable v-model="form.certDate" type="date" value-format="YYYY-MM-DD" :editable=false
                  placeholder="请选择发证日期" style="width: 300px;" />
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item prop="loadingCapacity">
                <el-input v-model="form.loadingCapacity" placeholder="请输入核定载人数" type="number" min="1" :precision="0"
                  @input="handleLoadingCapacityInput" />
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item prop="totalWeight">
                <el-input v-model="form.totalWeight" placeholder="请输入核载质量" type="number" min="1" :precision="0"
                  @input="handleTotalWeightInput" />
              </el-form-item>
            </el-col>

            <el-col :span="24" v-if="showFleetNameInput">
              <el-form-item prop="fleetName">
                <el-input v-model="form.fleetName" @update:modelValue="onFleetNameInputChange" placeholder="请输入车队名称" />
              </el-form-item>
            </el-col>
            <el-col :span="24" v-if="!showFleetNameInput">
              <el-form-item prop="fleetName">
                <el-select v-model="form.fleetName" placeholder="请选择车队名称" clearable>
                  <el-option label="自有" value="自有" />
                  <el-option label="个人" value="个人" />
                  <el-option 
                    v-if="enterpriseIds[0]?.companyName" 
                    :label="enterpriseIds[0].companyName"
                    :value="enterpriseIds[0].companyName" 
                  />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item>
                <el-checkbox :value="inboundSupplement" @change="toggleInboundSupplement">自动入场补录</el-checkbox>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item>
                <el-checkbox :value="outboundSupplement" @change="toggleOutboundSupplement">自动出场补录</el-checkbox>
              </el-form-item>
            </el-col>

            <!-- 根据入场复选框的状态显示入场相关表单 -->
            <div v-if="!inboundSupplement" style="width: 100%;">
              <el-col :span="24">
                <el-form-item prop="inboundName" :rules="inboundNameRules">
                  <el-input v-model="form.inboundName" placeholder="请输入入场货物名称" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item prop="inboundVolume" :rules="inboundVolumeRules">
                  <el-input v-model="form.inboundVolume" placeholder="请输入入场运输量" type="number" min="0" :precision="0"
                    @input="handleInboundVolumeInput" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item prop="inboundUnit" :rules="inboundUnitRules">
                  <el-select v-model="form.inboundUnit" placeholder="请选择货物单位">
                    <el-option v-for="unit in unit_options" :key="unit" :label="unit" :value="unit" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item prop="inboundGoodsType" :rules="inboundGoodsTypeRules">
                  <el-select v-model="form.inboundGoodsType" placeholder="请选择入场货物类型">
                    <el-option v-for="dict in goods_type" :key="dict.value" :label="dict.label" :value="dict.value" />
                  </el-select>
                </el-form-item>
              </el-col>
            </div>
            <!-- 根据出场复选框的状态显示出场相关表单 -->
            <div v-if="!outboundSupplement" style="width: 100%;">
              <el-col :span="24">
                <el-form-item prop="outboundName" :rules="outboundNameRules">
                  <el-input v-model="form.outboundName" placeholder="请输入出场货物名称" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item prop="outboundVolume" :rules="outboundVolumeRules">
                  <el-input v-model="form.outboundVolume" placeholder="请输入出场运输量" type="number" min="0" :precision="0"
                    @input="handleOutboundVolumeInput" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item prop="outboundUnit" :rules="outboundUnitRules">
                  <el-select v-model="form.outboundUnit" placeholder="请选择货物单位">
                    <el-option v-for="unit in unit_options" :key="unit" :label="unit" :value="unit" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item prop="outboundGoodsType" :rules="outboundGoodsTypeRules">
                  <el-select v-model="form.outboundGoodsType" placeholder="请选择出场货物类型">
                    <el-option v-for="dict in goods_type" :key="dict.value" :label="dict.label"
                      :value="dict.value"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <!-- 根据复选框的状态显示表单 -->
              <div v-if="!outboundSupplement || !inboundSupplement">
                <el-col :span="24">
                  <el-form-item prop="goodsOrigin" :rules="goodsOriginRules">
                    <el-input v-model="form.goodsOrigin" placeholder="请输入货物来源地" />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item prop="goodsDestination" :rules="goodsDestinationRules">
                    <el-input v-model="form.goodsDestination" placeholder="请输入货物目的地" />
                  </el-form-item>
                </el-col>
              </div>
            </div>
          </el-row>
        </div>

        <!-- Step 3: 图片信息 -->
        <div v-if="activeStep === 2">
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item prop="drivingImage">
                <div class="upload-container">
                  <div class="upload-label">行驶证图片</div>
                  <div class="upload-box">
                    <image-upload-rectangle v-model="form.drivingImage" :companyId="form.companyId" />
                  </div>
                </div>
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item prop="chassisImage">
                <div class="upload-container">
                  <div class="upload-label">车辆图片</div>
                  <div class="upload-box">
                    <image-upload-rectangle v-model="form.chassisImage" :companyId="form.companyId" />
                  </div>
                </div>
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item prop="accompanyingDocumentsImage">
                <div class="upload-container">
                  <div class="upload-label">随车清单</div>
                  <div class="upload-box">
                    <image-upload-rectangle v-model="form.accompanyingDocumentsImage" :companyId="form.companyId" />
                  </div>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>

      <!-- 步骤控制按钮 -->
      <div class="form-footer">
        <el-button v-if="activeStep > 0" @click="previousStep">上一步</el-button>
        <el-button v-if="activeStep < 2" type="primary" @click="nextStep">下一步</el-button>
        <el-button v-if="activeStep === 2" type="primary" @click="submitForm">提交</el-button>
      </div>
    </div>

    <!-- 修改对话框实现 -->
    <el-dialog v-model="dialogVisible" title="操作成功" :show-close="false" :close-on-click-modal="false"
      :close-on-press-escape="false" width="400px" center destroy-on-close>
      <div class="dialog-content">
        <el-icon class="success-icon">
          <CircleCheckFilled />
        </el-icon>
        <div class="success-message">场外车辆新增成功</div>
        <div class="dialog-footer">
          <el-button v-if="autoOpen && autoOpen !== '0'" type="primary" size="large"
            @click="openTheGate">打开道闸</el-button>
          <el-button type="primary" size="large" @click="goBack">返回列表</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="js">
import { addOffSiteVehicleNoAuth, openGate, selectIds, checkOffSiteVehicle } from "@/api/wx/offSite";
import { useRoute, useRouter } from 'vue-router';

import { onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { CircleCheckFilled } from '@element-plus/icons-vue'

const { proxy } = getCurrentInstance();
const { plate_color, emission_standard, fuel_type, vehicle_type, usage_property, car_type, goods_type } = proxy.useDict('plate_color', 'emission_standard', 'fuel_type', 'vehicle_type', 'usage_property', 'car_type', 'goods_type');
const route = useRoute();
const router = useRouter();

const enterpriseIds = ref([]);
const isFleetNameChanged = ref(false);

const data = reactive({
  form: {
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
    hasObd: null,
    drivingImage: null,
    chassisImage: null,
    accompanyingDocumentsImage: null,
    engineType: null,
    engineManufacturer: null,
    inboundName: null,
    inboundVolume: null,
    inboundUnit: null,
    outboundName: null,
    outboundVolume: null,
    outboundUnit: null,
    goodsOrigin: null,
    goodsDestination: null,
    inboundGoodsType: null,
    outboundGoodsType: null,
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
    registrationDate: [{ required: true, message: '注册日期不能为空', trigger: 'blur' }],
    certDate: [{ required: true, message: '发证日期不能为空', trigger: 'blur' }],
    plateColor: [{ required: true, message: '车牌颜色不能为空', trigger: 'blur' }],
    usageProperty: [{ required: true, message: '使用性质不能为空', trigger: 'blur' }],
    engineNumber: [{ required: true, message: '发动机号不能为空', trigger: 'blur' }],
    ownerName: [{ required: true, message: '车辆所属人不能为空', trigger: 'blur' }],
    loadingCapacity: [
      { required: true, message: '核定载人数不能为空', trigger: 'blur' },
      { pattern: /^[1-9]\d{0,1}$/, message: '核定载人数必须是1-2位数字', trigger: 'blur' }
    ],
    totalWeight: [
      { required: true, message: '核载质量不能为空', trigger: 'blur' },
      { pattern: /^[1-9]\d*$/, message: '请输入正整数', trigger: 'blur' }
    ],
    fuelType: [{ required: true, message: '燃油类型不能为空', trigger: 'blur' }],
    ownerPhone: [{ required: true, message: '联系电话不能为空', trigger: 'blur' }],
    fleetName: [{ required: true, message: '车队名称不能为空', trigger: 'blur' }],
    drivingImage: [{ required: true, message: '行驶证图片不能为空', trigger: 'change' }],
    chassisImage: [{ required: true, message: '车辆图片不能为空', trigger: 'change' }],
    accompanyingDocumentsImage: [{ required: true, message: '随车清单不能为空', trigger: 'change' }],
    engineType: [{ required: true, message: '发动机型号不能为空', trigger: 'blur' }],
    engineManufacturer: [{ required: true, message: '发动机厂商不能为空', trigger: 'blur' }],
  },
});
const outboundSupplement = ref(false); // 出场复选框状态，默认为 false(不自动补录)
const inboundSupplement = ref(false); // 入场复选框状态，默认为 false(不自动补录)
// 方法来切换出场复选框状态
function toggleOutboundSupplement(value) {
  outboundSupplement.value = !value;
}

// 方法来切换入场复选框状态
function toggleInboundSupplement(value) {
  inboundSupplement.value = !value;
}
const { form, rules } = toRefs(data);

// 确保 dialogVisible 是响应式的
const dialogVisible = ref(false)

// 表单重置
function reset() {
  Object.keys(form.value).forEach(key => {
    form.value[key] = null;
  });
  form.value.companyId = route.query.aid;
}

function onOwnerNameChange(newVal) {
  if (enterpriseIds.value[0]?.apiStrategy !== 1) {
    form.value.fleetName = newVal;
  }
}

const onFleetNameInputChange = (value) => {
  if (enterpriseIds.value[0]?.apiStrategy !== 1) {
    isFleetNameChanged.value = true;
    form.value.fleetName = value;
  }
};

// 添加 autoOpen 响应式变量
const autoOpen = route.query.isAutoOpen;

// 添加步骤相关的响应式变量
const activeStep = ref(0)

// 修改 nextStep 方法
const nextStep = async () => {
  try {
    // 表单验证
    await proxy.$refs["OffSiteVehicleRef"].validate();
    
    // 如果是第一步，需要进行管控策略检查
    if (activeStep.value === 0) {
      const checkParams = {
        companyId: route.query.aid,
        plateNumber: form.value.plateNumber,
        fuelType: form.value.fuelType,
        plateColor: form.value.plateColor,
        usageProperty: form.value.usageProperty,
        carType: form.value.carType,
        emissionStage: form.value.emissionStage,
        vehicleType: form.value.vehicleType
      };

      console.log("checkParams + ", checkParams)

      const res = await checkOffSiteVehicle(checkParams);
      if (res === "passed") {
        activeStep.value++;
      } else {
        // 检查不通过，显示 MessageBox
        await ElMessageBox({
          title: '违反管控策略禁止注册',
          message: `<div class="warning-message-content">
            <div class="warning-title">规则名称:<span style="color: #f56c6c;">${res}</span></div>
          </div>`,
          type: 'warning',
          showClose: false,
          closeOnClickModal: false,
          closeOnPressEscape: false,
          confirmButtonText: '确定',
          customClass: 'custom-message-box',
          center: true,
          dangerouslyUseHTMLString: true
        });
      }
    } else {
      activeStep.value++;
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('请完成必填项');
    }
  }
}

const previousStep = () => {
  activeStep.value--
}

// 修改提交方法，确保在最后一步才能提交
const submitForm = () => {
  if (activeStep.value !== 2) {
    return
  }
  form.value.companyId = route.query.aid;
  console.log("提交的表单数据:", form.value);
  proxy.$refs["OffSiteVehicleRef"].validate((valid, fields) => {
    if (valid) {
      form.value.autoOutboundSupplement = outboundSupplement.value ? 0 : 1;
      form.value.autoInboundSupplement = inboundSupplement.value ? 0 : 1;
      addOffSiteVehicleNoAuth(form.value).then(response => {
        console.log("返回的数据:", response);
        if (response.code === 200) {
          ElMessage.success("新增成功");
          dialogVisible.value = true;
          console.log("dialogVisible 状态:", dialogVisible.value);
        } else {
          ElMessage.error(response.msg || "操作失败");
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

function openTheGate() {
  openGate(route.query.aid, form.value.plateNumber).then(response => {
    console.log(response);
    if (response === "已发送开闸命令") {

      ElMessage.success("操作成功");
    } else {
      ElMessage.error(response.msg || "操作失败");
    }
  }).catch(error => {
    ElMessage.error(error.message || "请求失败，请稍后重试");
  })
}

const parsedOcrData = ref(null);

onMounted(() => {
  document.body.addEventListener('touchstart', disableDoubleTapZoom, { passive: false });
  const ocrData = route.query.ocrData;
  const aid = route.query.aid;
  if (ocrData) {
    try {
      parsedOcrData.value = JSON.parse(ocrData);
      form.value.companyId = aid;
      form.value.plateNumber = parsedOcrData.value.vehicleLicenseId || null;
      form.value.vin = parsedOcrData.value.vehicleIdentificationCode || null;
      form.value.vehicleType = parsedOcrData.value.vehicleType || null;
      form.value.carType = null;
      form.value.emissionStage = parsedOcrData.value.emissionStage || null;
      form.value.brandModel = parsedOcrData.value.vehicleBrandType || null;
      form.value.registrationDate = parsedOcrData.value.vehicleLicenseDateStart || null;
      form.value.certDate = parsedOcrData.value.vehicleLicenseFirstDate || null;
      form.value.plateColor = null;
      form.value.usageProperty = parsedOcrData.value.vehicleUse || null;
      form.value.engineNumber = parsedOcrData.value.vehicleEngineId || null;
      form.value.ownerName = parsedOcrData.value.vehicleLicenseOwner || null;
      form.value.address = parsedOcrData.value.vehicleLicenseAddress || null;
      form.value.loadingCapacity = null;
      form.value.totalWeight = parsedOcrData.value.weight || null;
      form.value.fuelType = parsedOcrData.value.flueType || null;
      form.value.fleetName = null;
      form.value.drivingImage = null;
      form.value.chassisImage = null;
      form.value.accompanyingDocumentsImage = null;
      form.value.engineType = parsedOcrData.value.engine || null;
      form.value.engineManufacturer = parsedOcrData.value.engineManufacturer || null;
    } catch (error) {
      ElMessage.error('解析 OCR 数据失败:', error);
    }
  }
});

const disableDoubleTapZoom = (e) => {
  if (e.touches.length > 1) {
    e.preventDefault();
  }
};

async function getEnterpriseList() {
  try {
    console.log("开始获取企业信息...");
    const response = await selectIds(route.query.aid);
    console.log("企业信息API响应:", response);
    if (response && response.code === 200) {
      // 确保设置完整的企业信息
      enterpriseIds.value = [{
        apiStrategy: response.data?.apiStrategy || 1,
        companyId: route.query.aid,
        companyName: response.data?.companyName || '默认企业'
      }];
      console.log("设置企业信息成功:", enterpriseIds.value);
    } else {
      console.error("API响应失败:", response);
      enterpriseIds.value = [];
    }
  } catch (error) {
    console.error("获取企业信息失败:", error);
    enterpriseIds.value = [];
  }
}

getEnterpriseList();

const showAddressField = computed(() => {
  const apiStrategy = enterpriseIds.value[0]?.apiStrategy;
  return apiStrategy === 3;
});

const showEngineFields = computed(() => {
  const apiStrategy = enterpriseIds.value[0]?.apiStrategy;
  return apiStrategy === 4;
});

const showFleetNameInput = computed(() => {
  if (!enterpriseIds.value || !enterpriseIds.value[0]) {
    console.log("企业信息未加载完成");
    return false;
  }
  const apiStrategy = enterpriseIds.value[0]?.apiStrategy;
  console.log("当前 apiStrategy:", apiStrategy);
  // 如果 apiStrategy 未定义，默认返回 false（显示下拉框）
  if (typeof apiStrategy === 'undefined' || apiStrategy === null) {
    console.log("apiStrategy未定义，显示下拉框");
    return false;
  }
  if (apiStrategy !== 1) {
    console.log("非apiStrategy=1的情况，显示输入框");
    return true;
  } else {
    console.log("apiStrategy=1的情况，显示下拉框");
    return false;
  }
});

const addressRules = computed(() => {
  if (showAddressField.value) {
    return [{ required: true, message: '车辆所属人住址不能为空', trigger: 'blur' }];
  }
  return [];
});

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

// 3. 修改 watch 逻辑
watch(() => form.value.companyId, (newVal) => {
  if (!showAddressField.value && parsedOcrData.value) {
    form.value.address = parsedOcrData.value.vehicleLicenseAddress;
  }
  if (!showEngineFields.value && parsedOcrData.value) {
    form.value.engineType = parsedOcrData.value.engine;
    form.value.engineManufacturer = parsedOcrData.value.engineManufacturer;
  }
  console.log("form.value:", form.value);
});

const outboundNameRules = computed(() => {
  return outboundSupplement.value ? [] : [{ required: true, message: '出场货物名称不能为空', trigger: 'blur' }];
});

const outboundVolumeRules = computed(() => {
  return outboundSupplement.value ? [] : [
    { required: true, message: '出场运输量不能为空', trigger: 'blur' },
    { pattern: /^\d*$/, message: '请输入非负整数', trigger: 'blur' }
  ];
});

const outboundUnitRules = computed(() => {
  return outboundSupplement.value ? [] : [{ required: true, message: '出场货物单位不能为空', trigger: 'blur' }];
});

const outboundGoodsTypeRules = computed(() => {
  return outboundSupplement.value ? [] : [{ required: true, message: '出场货物类型不能为空', trigger: 'blur' }];
});

const inboundNameRules = computed(() => {
  return inboundSupplement.value ? [] : [{ required: true, message: '入场货物名称不能为空', trigger: 'blur' }];
});

const inboundVolumeRules = computed(() => {
  return inboundSupplement.value ? [] : [
    { required: true, message: '入场运输量不能为空', trigger: 'blur' },
    { pattern: /^\d*$/, message: '请输入非负整数', trigger: 'blur' }
  ];
});

const inboundUnitRules = computed(() => {
  return inboundSupplement.value ? [] : [{ required: true, message: '入场货物单位不能为空', trigger: 'blur' }];
});

const inboundGoodsTypeRules = computed(() => {
  return inboundSupplement.value ? [] : [{ required: true, message: '入场货物类型不能为空', trigger: 'blur' }];
});

const goodsOriginRules = computed(() => {
  return (!outboundSupplement.value || !inboundSupplement.value) ? [{ required: true, message: '货物来源地不能为空', trigger: 'blur' }] : [];
});

const goodsDestinationRules = computed(() => {
  return (!outboundSupplement.value || !inboundSupplement.value) ? [{ required: true, message: '货物目的地不能为空', trigger: 'blur' }] : [];
});

const unit_options = [
  'T',
  'L',
  'P',
];

const goBack = () => {
  router.go(-1)
}

const handleLoadingCapacityInput = (value) => {
  // 移除小数点和非数字字符
  form.value.loadingCapacity = value.toString().replace(/[^\d]/g, '');
  // 确保不为0
  if (form.value.loadingCapacity === '0') {
    form.value.loadingCapacity = '';
  }
};

const handleTotalWeightInput = (value) => {
  // 移除小数点和非数字字符
  form.value.totalWeight = value.toString().replace(/[^\d]/g, '');
  // 确保不为0
  if (form.value.totalWeight === '0') {
    form.value.totalWeight = '';
  }
};

// 添加处理函数
const handleInboundVolumeInput = (value) => {
  // 移除小数点和非数字字符
  form.value.inboundVolume = value.toString().replace(/[^\d]/g, '');
};

const handleOutboundVolumeInput = (value) => {
  // 移除小数点和非数字字符
  form.value.outboundVolume = value.toString().replace(/[^\d]/g, '');
};

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

.el-button:hover {
  background-color: #e6e6e6;
}

:deep(.el-dialog) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-dialog__header) {
  margin: 0;
  padding: 20px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  text-align: center;
  font-size: 20px;
  font-weight: bold;
}

:deep(.el-dialog__body) {
  padding: 30px 20px;
}

:deep(.el-dialog__footer) {
  padding: 10px 20px 20px;
  text-align: center;
}

.dialog-footer {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 10px;
}

.dialog-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.success-icon {
  font-size: 56px;
  color: #67C23A;
  margin-bottom: 20px;
}

.success-message {
  font-size: 18px;
  color: #303133;
  margin-bottom: 30px;
}

:deep(.el-button--large) {
  padding: 12px 30px;
  font-size: 16px;
  min-width: 120px;
}

.upload-form-item {
  margin-bottom: 24px;
}

.upload-container {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-label {
  font-size: 14px;
  font-weight: bold;
  color: #606266;
  margin-bottom: 8px;
  width: 100%;
}

:deep(.el-form-item__content) {
  margin-left: 0 !important;
  display: flex;
  justify-content: center;
  width: 100%;
}

.form-footer {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

:deep(.custom-notification) {
  width: 400px;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:deep(.custom-notification .el-notification__title) {
  font-size: 16px;
  font-weight: bold;
  color: #e6a23c;
}

:deep(.custom-notification .el-notification__content) {
  font-size: 14px;
  margin: 10px 0;
  color: #666;
  text-align: left;
}

:deep(.custom-notification.el-notification--warning) {
  background-color: #fdf6ec;
  border-color: #faecd8;
}

:deep(.custom-message-box) {
  width: 450px;
  border-radius: 8px;
}

:deep(.custom-message-box .el-message-box__header) {
  padding: 20px;
  background-color: #fdf6ec;
  border-bottom: 1px solid #faecd8;
}

:deep(.custom-message-box .el-message-box__title) {
  color: #e6a23c;
  font-size: 20px;
  font-weight: bold;
}

:deep(.custom-message-box .el-message-box__content) {
  padding: 30px 20px;
}

:deep(.warning-message-content) {
  text-align: center;
}

:deep(.warning-title) {
  font-size: 25px;
  font-weight: bold;
  color: #e6a23c;
  margin-bottom: 15px;
}

:deep(.warning-rules) {
  font-size: 25px;
  color: #606266;
  line-height: 1.6;
  white-space: pre-line;
  margin-top: 10px;
}

:deep(.custom-message-box .el-message-box__btns) {
  padding: 10px 20px 20px;
}

:deep(.custom-message-box .el-button--primary) {
  background-color: #e6a23c;
  border-color: #e6a23c;
  width: 120px;
  height: 40px;
  font-size: 16px;
  font-weight: bold;
}

:deep(.custom-message-box .el-button--primary:hover) {
  background-color: #ebb563;
  border-color: #ebb563;
}

:deep(.el-message-box__status) {
  font-size: 24px;
  position: absolute;
  top: 20px;
  left: 20px;
}

:deep(.el-select .el-input__wrapper) {
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

:deep(.el-select .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c0c4cc inset;
}

:deep(.el-select-dropdown__item) {
  padding: 0 20px;
  font-size: 14px;
}

:deep(.el-select-dropdown__item.selected) {
  color: #409eff;
  font-weight: bold;
}
</style>