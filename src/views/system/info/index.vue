<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="auto"
      label-position="left">
      <el-row>
        <el-col :span="6">
          <el-form-item label="企业名称" prop="companyName">
            <el-tooltip class="item" effect="light" content="支持模糊搜索" placement="bottom" popper-class="fade">
              <el-input v-model="queryParams.companyName" placeholder="请输入企业名称" clearable @keyup.enter="handleQuery" />
            </el-tooltip>
          </el-form-item>
        </el-col>
        <el-col :span="18">
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>


    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:info:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['system:info:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['system:info:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['system:info:export']">导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Refresh" @click="syncToken" :disabled="single">同步token</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    <transition name="dialog-fade">
      <div v-if="qrcodeDialogVisible" class="custom-dialog-overlay" @click.self="closeQRCodeDialog">
        <div class="custom-dialog">
          <div class="dialog-header">
            <span>车辆信息录入二维码</span>
            <i class="el-icon-close" @click="closeQRCodeDialog"></i>
          </div>
          <div class="dialog-body">
            <div class="qrcode-wrapper">
              <img :src="qrcode" alt="QR Code" class="qrcode-image" />
              <div class="download-button" @click="downloadQRCode">
                <i class="el-icon-download"></i>
                <span>下载二维码</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <el-table v-loading="loading" :data="infoList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="企业名称" align="center" prop="companyName" />
      <el-table-column label="二维码" align="center" width="100">
        <template #default="scope">
          <div @click="getQRCode(scope.row)" class="custom-btn">
            二维码
          </div>
        </template>
      </el-table-column>
      <el-table-column label="行政区划编码" align="center" prop="region" />
      <el-table-column label="创建时间" align="center" prop="createDate" width="130">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column label="联网状态" align="center" prop="isOnline">
        <template #default="scope">
          <dict-tag :options="is_online" :value="scope.row.isOnline" />
        </template>
      </el-table-column> -->
      <el-table-column label="企业地址" align="center" prop="address" show-overflow-tooltip />
      <el-table-column label="企业评级" align="center" prop="level">
        <template #default="scope">
          <dict-tag :options="etp_level" :value="scope.row.level" />
        </template>
      </el-table-column>
      <el-table-column label="法人代表" align="center" prop="legalRpst" />
      <el-table-column label="ocr收费标准" align="center" prop="ocrFeeStandard" />
      <el-table-column label="服务费" align="center" prop="serviceFee" />
      <el-table-column label="服务失效时间" align="center" prop="expireTime" width="110">
        <template #default="scope">
          <span>{{ parseTime(scope.row.expireTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column label="自动开闸" align="center" prop="isAutoOpen">
        <template #default="scope">
          <dict-tag :options="is_auto_open" :value="scope.row.isAutoOpen" />
        </template>
      </el-table-column>
      <el-table-column label="录入车辆" align="center" prop="isRegis">
        <template #default="scope">
          <dict-tag :options="is_regis" :value="scope.row.isRegis" />
        </template>
      </el-table-column> -->
      <el-table-column label="企业分类" align="center" prop="classifi" show-overflow-tooltip>
        <template #default="scope">
          <dict-tag :options="ei_classification" :value="scope.row.classifi?.toString()" />
        </template>
      </el-table-column>/>
      <!-- <el-table-column label="禁行排放等级" align="center" prop="emissionState">
        <template #default="scope">
          <dict-tag :options="emission_state" :value="scope.row.emissionState" />
        </template>
      </el-table-column> -->
      <!-- <el-table-column label="接口平台" align="center" prop="apiStrategy">
        <template #default="scope">
          <dict-tag :options="api_strategy" :value="scope.row.apiStrategy" />
        </template>
      </el-table-column> -->
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['system:info:edit']">修改</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['system:info:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改企业信息对话框 -->
    <el-dialog :title="title" v-model="open" width="800px" append-to-body>
      <el-form ref="infoRef" :model="form" :rules="rules" label-width="100px" label-position="left">
        <!-- 使用一个el-row布局所有项 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="企业名称" prop="companyName">
              <el-input v-model="form.companyName" placeholder="请输入企业名称" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="行政区划" prop="region">
              <el-select v-model="form.region" placeholder="请选择行政区划" clearable filterable>
                <el-option v-for="region in regionOptions" :key="region.value" :label="region.label"
                  :value="region.value" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="所属单位统一" class="compact-form-item" prop="identifier">
              <template #label>
                <div class="compact-label">
                  <div>所属单位统一</div>
                  <div>社会代码</div>
                </div>
              </template>
              <el-input v-model="form.identifier" placeholder="请输入所属单位统一社会代码" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="企业地址" prop="address">
              <el-input v-model="form.address" placeholder="请输入企业地址" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="企业评级" prop="level">
              <el-select v-model="form.level" placeholder="请选择企业评级">
                <el-option v-for="dict in etp_level" :key="dict.value" :value="dict.value" :label="dict.label" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="法人代表" prop="legalRpst">
              <el-input v-model="form.legalRpst" placeholder="请输入法人代表" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="ocr收费标准" prop="ocrFeeStandard">
              <el-input v-model="form.ocrFeeStandard" placeholder="请输入ocr收费标准" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="服务费" prop="serviceFee">
              <el-input v-model="form.serviceFee" placeholder="请输入服务费" type="number" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="服务失效时间" prop="expireTime">
              <el-date-picker clearable v-model="form.expireTime" type="date" value-format="YYYY-MM-DD"
                placeholder="请选择服务失效时间" />
            </el-form-item>
          </el-col>

          <!-- <el-col :span="12">
            <el-form-item label="自动开闸" prop="isAutoOpen">
              <el-radio-group v-model="form.isAutoOpen">
                <el-radio v-for="dict in is_auto_open" :key="dict.value" :value="parseInt(dict.value)">{{ dict.label
                  }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="录入车辆" prop="isRegis">
              <el-radio-group v-model="form.isRegis">
                <el-radio v-for="dict in is_regis" :key="dict.value" :value="parseInt(dict.value)">{{ dict.label
                  }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col> -->

          <el-col :span="12">
            <el-form-item label="企业分类" prop="classifi">
              <el-select v-model="form.classifi" placeholder="请选择企业分类" filterable>
                <el-option v-for="dict in ei_classification" :key="dict.value" :label="dict.label"
                  :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>

          <!-- <el-col :span="12">
            <el-form-item label="禁行排放等级" prop="emissionState">
              <el-select v-model="form.emissionState" placeholder="请选择禁行排放等级">
                <el-option v-for="dict in emission_state" :key="dict.value" :label="dict.label"
                  :value="parseInt(dict.value)" />
              </el-select>
            </el-form-item>
          </el-col> -->

          <el-col :span="12">
            <el-form-item label="地磅系统密码" prop="weightPassword">
              <el-input v-model="form.weightPassword" placeholder="请输入地磅系统密码" />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="接口平台" prop="apiStrategy">
              <el-checkbox-group v-model="selectedApiStrategies" @change="handleStrategyChange">
                <el-checkbox v-for="dict in api_strategy" :key="dict.value" :label="parseInt(dict.value)"
                  :disabled="isCheckboxDisabled(parseInt(dict.value))">
                  {{ dict.label }}
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template v-if="form.apiStrategy">
        <el-divider content-position="left" border-style="solid">
          接口平台信息配置
        </el-divider>
        <el-row :gutter="20">
          <!-- 平台4配置（天津） -->
          <template v-if="selectedApiStrategies.includes(4)">
            <el-divider content-position="right">天津</el-divider>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="用户名" label-width="120px" label-position="left">
                  <el-input v-model="platformConfig.platform4.username" placeholder="请输入用户名" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="密码" label-width="120px" label-position="left">
                  <el-input v-model="platformConfig.platform4.password" placeholder="请输入密码" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="SM2私钥" label-width="120px" label-position="left">
                  <el-input v-model="platformConfig.platform4.prksm2" placeholder="请输入SM2私钥" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="企业唯一编码" label-width="120px" label-position="left">
                  <el-input v-model="platformConfig.platform4.identifier" placeholder="请输入企业唯一编码" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="接口地址" label-width="120px" label-position="left">
                  <el-radio-group v-model="platformConfig.platform4.isProd">
                    <el-radio :value="1">测试</el-radio>
                    <el-radio :value="2">正式</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>
          </template>
        </el-row>

        <el-row :gutter="20">
          <!-- 平台5配置（经开区） -->
          <template v-if="selectedApiStrategies.includes(5)">
            <el-divider content-position="right">经开区</el-divider>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="用户名" label-width="120px" label-position="left">
                  <el-input v-model="platformConfig.platform5.username" placeholder="请输入用户名" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="密码" label-width="120px" label-position="left">
                  <el-input v-model="platformConfig.platform5.password" placeholder="请输入密码" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="企业唯一编码" label-width="120px" label-position="left">
                  <el-input v-model="platformConfig.platform5.identifier" placeholder="请输入企业唯一编码" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="company-key" label-width="120px" label-position="left">
                  <el-input v-model="platformConfig.platform5.companyKey" placeholder="请输入company-key" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="接口地址" label-width="120px" label-position="left">
                  <el-radio-group v-model="platformConfig.platform5.isProd">
                    <el-radio :value="1">测试</el-radio>
                    <el-radio :value="2">正式</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>
          </template>
        </el-row>
        <el-row :gutter="20">
          <template v-if="selectedApiStrategies.includes(1)">
            <!-- 香河配置 -->
            <el-col :span="12">
              <el-form-item label="企业唯一代码" label-width="100px" label-position="left">
                <el-input v-model="platformConfig.platform1.userName" placeholder="请输入企业唯一代码" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="企业编号" label-width="100px" label-position="left">
                <el-input v-model="platformConfig.platform1.password" placeholder="请输入企业编号" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="接口地址" label-width="100px" label-position="left">
                <el-input v-model="platformConfig.platform1.remoteEp" placeholder="请输入接口地址" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="备用接口地址" label-width="100px" label-position="left">
                <el-input v-model="platformConfig.platform1.alternateEp" placeholder="请输入备用接口地址" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="BT面板地址" label-width="100px" label-position="left">
                <el-input v-model="platformConfig.platform1.btEp" placeholder="请输入BT面板地址" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="BT用户名" label-width="100px" label-position="left">
                <el-input v-model="platformConfig.platform1.btUsername" placeholder="请输入BT用户名" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="BT密码" label-width="100px" label-position="left">
                <el-input v-model="platformConfig.platform1.btPassword" placeholder="请输入BT密码" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="远程控制码" label-width="100px" label-position="left">
                <el-input v-model="platformConfig.platform1.remoteControlCode" placeholder="请输入远程控制码" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="临时密码" label-width="100px" label-position="left">
                <el-input v-model="platformConfig.platform1.temporaryCode" placeholder="请输入远程控制临时密码" />
              </el-form-item>
            </el-col>
          </template>
        </el-row>
        <el-row :gutter="20">
          <template v-if="selectedApiStrategies.includes(2)">
            <!-- 唐山配置 -->
            <el-col :span="12">
              <el-form-item label="用户名" label-width="100px" label-position="left">
                <el-input v-model="platformConfig.platform2.username" placeholder="请输入用户名" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="密码" label-width="100px" label-position="left">
                <el-input v-model="platformConfig.platform2.password" placeholder="请输入密码" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="ClientId" label-width="100px" label-position="left">
                <el-input v-model="platformConfig.platform2.clientId" placeholder="请输入ClientId" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="ClientSecret" label-width="100px" label-position="left">
                <el-input v-model="platformConfig.platform2.clientSecret" placeholder="请输入clientSecret" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="RSA公钥" label-width="100px" label-position="left">
                <el-input v-model="platformConfig.platform2.pukrsa" placeholder="请输入RSA公钥" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="RSA私钥" label-width="100px" label-position="left">
                <el-input v-model="platformConfig.platform2.prkrsa" placeholder="请输入RSA私钥" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="SM2公钥" label-width="100px" label-position="left">
                <el-input v-model="platformConfig.platform2.puksm2" placeholder="请输入SM2公钥" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="SM2私钥" label-width="100px" label-position="left">
                <el-input v-model="platformConfig.platform2.prksm2" placeholder="请输入SM2私钥" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="CallerID" label-width="100px" label-position="left">
                <el-input v-model="platformConfig.platform2.callerId" placeholder="请输入CallerID" />
              </el-form-item>
            </el-col>
          </template>
        </el-row>
        <el-row :gutter="20">
          <template v-if="selectedApiStrategies.includes(3)">
            <!-- 三门峡配置 -->
            <el-col :span="12">
              <el-form-item label="用户名" label-width="80px" label-position="left">
                <el-input v-model="platformConfig.platform3.username" placeholder="请输入用户名" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="密码" label-width="80px" label-position="left">
                <el-input v-model="platformConfig.platform3.password" placeholder="请输入密码" />
              </el-form-item>
            </el-col>

          </template>
        </el-row>
      </template>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Info">
import { listInfo, getInfo, delInfo, addInfo, updateInfo, getStaticQrCode, getAPIConfig, addApi, syncConfig } from "@/api/system/info";
// import RegionSelector from '@/components/RegionSelector.vue'

import axios from 'axios'
import { getToken } from '@/utils/auth'

const { proxy } = getCurrentInstance();
const { api_strategy, ei_classification, etp_level } = proxy.useDict('api_strategy', 'ei_classification', 'etp_level');

const infoList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const selectedRegions = ref([])

const data = reactive({
  qrcode: null,
  qrcodeDialogVisible: false,
  form: {},
  configForm: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    companyName: null,
    region: null,
    companyId: null,
    createDate: null,
    identifier: null,
    isOnline: null,
    address: null,
    level: null,
    legalRpst: null,
    ocrFeeStandard: null,
    serviceFee: null,
    expireTime: null,
    isAutoOpen: null,
    isRegis: null,
    classifi: null,
    emissionState: null,
    apiStrategy: null,
    userId: null,
    deptId: null,
    weightPassword: null
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);
const { qrcode, qrcodeDialogVisible } = toRefs(data);

// 接口平台配置对象
const platformConfig = reactive({
  // 香河 接口平台配置
  platform1: {
    id: '',
    companyId: '',
    identifier: '',
    companyName: '',
    userName: '',
    password: '',
    remoteEp: '',
    alternateEp: '',
    btEp: '',
    btUsername: '',
    btPassword: '',
    remoteControlCode: '',
    temporaryCode: ''
  },
  // 唐山 接口平台配置
  platform2: {
    id: '',
    companyId: '',
    identifier: '',
    companyName: '',
    username: '',
    password: '',
    callerId: '',
    pukrsa: '',
    prkrsa: '',
    puksm2: '',
    prksm2: '',
    clientId: '',
    clientSecret: ''
  },
  // 三门峡 接口平台配置
  platform3: {
    id: '',
    companyId: '',
    identifier: '',
    companyName: '',
    username: '',
    password: '',
  },
  platform4: {
    id: '',
    companyId: '',
    identifier: '', // 实际为 companyCode 企业唯一码
    companyName: '',
    username: '',
    password: '',
    prksm2: '',
    puksm2: '',
    isProd: null
  },
  // 天津经开区 接口平台配置
  platform5: {
    id: '',
    companyId: '',
    identifier: '',
    companyName: '',
    companyKey: '',
    username: '',
    password: '',
    isProd: null,
    createDate: null
  }
});

// 添加选中的接口平台数组
const selectedApiStrategies = ref([]);

// 计算最终的 apiStrategy
const computeApiStrategy = (strategies) => {
  // 当同时选中天津和经开区时（假设天津是4，经开区是5）
  if (strategies.includes(4) && strategies.includes(5)) {
    return 6;
  }
  // 如果只选中一个，返回该值
  return strategies.length === 1 ? strategies[0] : null;
};

// 处理平台切换
const handleStrategyChange = (value) => {
  // 设置 form 的 apiStrategy
  form.value.apiStrategy = computeApiStrategy(value);
};

/** 查询企业信息列表 */
function getList() {
  loading.value = true;
  // console.log(queryParams.value)
  listInfo(queryParams.value).then(response => {
    infoList.value = response.rows;
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
  selectedRegions.value = null;
  selectedApiStrategies.value = [];
  form.value = {
    id: null,
    companyName: null,
    region: null,
    companyId: null,
    createDate: null,
    identifier: null,
    isOnline: null,
    address: null,
    level: null,
    legalRpst: null,
    ocrFeeStandard: null,
    serviceFee: null,
    expireTime: null,
    isAutoOpen: null,
    isRegis: null,
    classifi: null,
    emissionState: null,
    apiStrategy: null,
    userId: null,
    deptId: null,
    weightPassword: null
  };

  // 重置所有平台配置
  Object.keys(platformConfig).forEach(platform => {
    Object.keys(platformConfig[platform]).forEach(key => {
      platformConfig[platform][key] = '';
    });
  });

  proxy.resetForm("infoRef");
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
  title.value = "添加企业信息";
}

async function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value[0];
  const selectedRow = infoList.value?.find(item => item.id === _id);

  try {
    // 获取企业基本信息
    const infoResponse = await getInfo(_id);
    form.value = infoResponse.data;
    form.value.region = infoResponse.data.region || null;

    // 如果是天津和经开区组合（apiStrategy = 6）
    if (selectedRow.apiStrategy === 6) {
      selectedApiStrategies.value = [4, 5]; // 设置多选框选中状态

      // 获取天津的配置
      const tjResponse = await getAPIConfig(selectedRow.companyId, 4);
      if (tjResponse.data.data) {
        platformConfig.platform4 = {
          ...platformConfig.platform4,
          ...tjResponse.data.data
        };
      }

      // 获取经开区的配置
      const jkResponse = await getAPIConfig(selectedRow.companyId, 5);
      if (jkResponse.data.data) {
        platformConfig.platform5 = {
          ...platformConfig.platform5,
          ...jkResponse.data.data
        };
      }
    } else {
      // 其他情况，获取单个平台的配置
      selectedApiStrategies.value = [selectedRow.apiStrategy]; // 设置多选框选中状态
      const apiResponse = await getAPIConfig(selectedRow.companyId, selectedRow.apiStrategy);
      if (apiResponse.data.data && selectedRow.apiStrategy) {
        const platform = `platform${selectedRow.apiStrategy}`;
        platformConfig[platform] = {
          ...platformConfig[platform],
          ...apiResponse.data.data
        };
      }
    }

    open.value = true;
    title.value = "修改企业信息";
  } catch (error) {
    console.error("获取信息时出错:", error);
    proxy.$modal.msgError("获取信息失败: " + error.message);
  }
}

// 获取二维码
function getQRCode(row) {
  if (!row || !row.companyId) {
    console.error("Invalid row or missing companyId");
    return;
  }
  const companyId = row.companyId;
  getStaticQrCode(companyId).then(response => {
    console.log("二维码响应:", response);
    if (!response) {
      console.error("No QR code data returned");
      return;
    }

    const qrCodeData = response;
    console.log("QR code data:", qrCodeData);
    const blob = new Blob([qrCodeData], { type: 'image/png' });
    data.qrcode = URL.createObjectURL(blob);
    data.qrcodeDialogVisible = true;
  }).catch(error => {
    console.error("Failed to fetch QR code:", error);
  });
}

// 关闭qrcode弹窗
function closeQRCodeDialog() {
  data.qrcodeDialogVisible = false;
}

function submitForm() {
  proxy.$refs["infoRef"].validate(async valid => {
    if (!valid) return;
    console.log("form.value:", form.value, selectedRegions);
    // form.value.region = selectedRegions._value[2]

    console.log("form.value:", form.value);
    try {
      // 处理企业信息保存
      const saveInfoPromise = form.value.id ?
        updateInfo(form.value) :
        addInfo(form.value);

      const saveInfoResult = await saveInfoPromise;
      console.log("saveInfoResult:", saveInfoResult);

      const companyId = saveInfoResult.msg;
      // 处理API配置
      if (form.value.apiStrategy) {
        if (!validatePlatformConfig()) return;
        console.log("companyId:", companyId);
        await saveApiConfig(companyId);
      }

      queryParams.value.region = null;

      proxy.$modal.msgSuccess(form.value.id ? "修改成功" : "新增成功");
      open.value = false;
      getList();

    } catch (error) {
      console.error("保存失败:", error);
      proxy.$modal.msgError("保存失败: " + error.message);
    }
  });
}

// 校验单个平台的配置
const validatePlatform = (platform, fields) => {
  for (const [field, label] of fields) {
    if (!platform[field]) {
      proxy.$modal.msgError(`请输入${label}`);
      return false;
    }
  }
  return true;
};

// 校验接口平台配置信息
const validatePlatformConfig = () => {
  const strategies = selectedApiStrategies.value;
  if (!strategies.length) return true;

  const validations = {
    1: [['userName', '企业唯一代码']],
    2: [
      ['username', '用户名'],
      ['password', '密码'],
      ['callerId', 'callerId'],
      ['pukrsa', 'RSA公钥'],
      ['prkrsa', 'RSA私钥'],
      ['puksm2', 'SM2公钥'],
      ['prksm2', 'SM2私钥'],
      ['clientId', '客户端ID'],
      ['clientSecret', '客户端密钥']
    ],
    3: [['username', '用户名'], ['password', '密码']],
    4: [['username', '用户名'], ['password', '密码'], ['prksm2', 'SM2私钥'], ['identifier', '企业唯一编码'], ['isProd', '是否启用正式环境']],
    5: [['companyKey', 'company-key'], ['username', '用户名'], ['password', '密码'], ['identifier', '企业唯一编码'], ['isProd', '是否启用正式环境']]
  };

  // 检查每个选中的平台配置
  return strategies.every(strategy =>
    validatePlatform(platformConfig[`platform${strategy}`], validations[strategy])
  );
};

// 保存API配置的辅助函数
async function saveApiConfig(companyId) {
  const strategies = selectedApiStrategies.value;

  // 保存每个选中平台的配置
  for (const strategy of strategies) {
    const platformData = platformConfig[`platform${strategy}`];

    // 设置公司相关信息
    platformData.companyId = companyId;
    platformData.identifier = form.value.identifier;

    const submitData = {
      apiStrategy: strategy, // 使用原始的策略值
      data: platformData
    };

    console.log(`提交平台${strategy}的API配置数据:`, submitData);

    const response = await addApi(submitData);

    if (response?.code !== 200) {
      throw new Error(response?.message || `平台${strategy}的API配置添加失败`);
    }

    console.log(`平台${strategy}的API配置添加成功`);
  }
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除企业信息编号为"' + _ids + '"的数据项？').then(function () {
    return delInfo(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/info/export', {
    ...queryParams.value
  }, `info_${new Date().getTime()}.xlsx`)
}

function downloadQRCode() {
  const link = document.createElement('a');
  link.href = qrcode.value;
  link.download = '车辆信息录入二维码.png';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 获取平台标题
const getPlatformTitle = (strategy) => {
  const platform = api_strategy.value.find(item => item.value === strategy);
  return platform ? platform.label : '';
};

const regionOptions = ref([]);

// 基础配置
const baseUrl = import.meta.env.VITE_APP_BASE_API;
const headers = { Authorization: "Bearer " + getToken() };

// 获取行政区划数据
const fetchRegions = async (parent = null) => {
  try {
    const response = await axios.get(`${baseUrl}/api/region/base/child/list`, {
      params: { parent },
      headers
    });
    const dataArray = Array.isArray(response.data) ? response.data : response.data.data;
    if (dataArray && Array.isArray(dataArray)) {
      return dataArray.map(item => ({
        value: item.deviceId,
        label: item.name,
        leaf: item.isLeaf,
        children: item.isLeaf ? undefined : [] // 非叶子节点需要设置空children数组
      }));
    }
    return [];
  } catch (error) {
    console.error('获取行政区划数据时出错:', error);
    return [];
  }
}

// 初始化加载根级数据
fetchRegions().then(data => {
  regionOptions.value = data;
});

// 在script setup部分添加以下函数
const isCheckboxDisabled = (value) => {
  // 如果没有选中任何选项，则所有选项都可选
  if (selectedApiStrategies.value.length === 0) {
    return false;
  }

  // 如果当前选中的是天津(4)或经开区(5)
  if (selectedApiStrategies.value.includes(4) || selectedApiStrategies.value.includes(5)) {
    // 只允许选择天津(4)和经开区(5)
    return value !== 4 && value !== 5;
  }

  // 如果选中了其他选项(1,2,3)，则禁用所有其他选项
  return !selectedApiStrategies.value.includes(value);
};

getList();
</script>
<style scoped>
.custom-style .el-segmented {
  --el-segmented-item-selected-color: #F2F6FC;
  --el-segmented-item-selected-bg-color: #409EFF;
  --el-border-radius-base: 12px;
}

.fade-enter-active,
.fade-leave-active {
  transition: transform 0.3s var(--el-transition-function-fast-bezier);
}

.fade-enter,
.fade-leave-to {
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
  min-width: 80px;
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
    transform: scale(0.9);
  }

  to {
    opacity: 1;
    transform: scale(1);
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

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
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
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
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

.compact-form-item :deep(.el-form-item__label) {
  line-height: 1.2;
  padding-bottom: 0;
}

.compact-label {
  line-height: 1.2;
  text-align: left;
}

.compact-label div {
  margin: 0;
  padding: 0;
}
</style>