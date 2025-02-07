<template>
  <div class="camera-config">
    <!-- 左侧树形结构 -->
    <div class="tree-container">
      <div class="tree-header">
        <el-input v-model="searchKeyword" placeholder="搜索企业名称" class="search-input" clearable :prefix-icon="Search"
          @input="handleSearch" />
        <el-button type="primary" :icon="Refresh" circle @click="handleRefresh" />
        <el-tooltip :content="hideAddNodes ? '显示新增节点' : '隐藏新增节点'" placement="top">
          <el-button :type="hideAddNodes ? 'info' : 'primary'" :icon="hideAddNodes ? 'Hide' : 'View'" circle
            @click="toggleAddNodes" />
        </el-tooltip>
      </div>
      <el-tree ref="treeRef" :data="treeData" :props="defaultProps" lazy :load="loadNode" @node-click="handleNodeClick"
        :filter-node-method="filterNode">
        <template #default="{ node, data }">
          <span class="custom-tree-node">
            <el-icon v-if="data.type === 'camera'">
              <VideoCamera />
            </el-icon>
            <el-icon v-else-if="data.type === 'screen'">
              <Monitor />
            </el-icon>
            <el-icon v-else-if="data.type === 'gate'">
              <SetUp />
            </el-icon>
            <el-icon v-else-if="data.type === 'add_screen' || data.type === 'add_camera' || data.type === 'add_gate'">
              <Plus />
            </el-icon>
            <el-icon v-else></el-icon>
            <span>{{ node.label }}</span>
          </span>
        </template>
      </el-tree>
    </div>

    <div class="config-form">
      <el-form v-if="selectedType === 'screen'" :model="formData" label-width="120px" :rules="screenRules"
        ref="formRef">
        <div class="section-title">基础信息</div>
        <el-row :gutter="20">
          <el-col :span="5">
            <el-form-item label="屏幕序列号" prop="ledSn">
              <el-input v-model="formData.ledSn" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="屏幕型号" prop="model">
              <el-select v-model="formData.model" clearable>
                <el-option v-for="dict in screen_brand" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="屏幕类型" prop="ledType">
              <el-select v-model="formData.ledType" clearable>
                <el-option label="主屏" :value="1" />
                <el-option label="入口道闸" :value="2" />
                <el-option label="出口道闸" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="总行数" prop="rowTotal">
              <el-select v-model="formData.rowTotal" clearable>
                <el-option label="2行" :value="2" />
                <el-option label="4行" :value="4" />
                <el-option label="8行" :value="8" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <div class="section-title">显示内容配置</div>
        <div class="display-content">
          <el-row :gutter="20">
            <el-col :span="24">
              <el-collapse class="help-collapse">
                <el-collapse-item>
                  <template #title>
                    <div class="help-title">
                      <el-icon>
                        <QuestionFilled />
                      </el-icon>
                      <span>使用说明</span>
                    </div>
                  </template>
                  <div class="help-content">
                    <div class="help-item">
                      <span class="help-number">1.</span>
                      <span class="help-text">点击"添加新行"按钮新增显示内容</span>
                    </div>

                    <div class="help-item">
                      <span class="help-number">2.</span>
                      <span class="help-text">支持以下显示类型：</span>
                    </div>
                    <div class="help-types">
                      <div class="type-item">
                        <span class="type-label">车牌号：</span>
                        <span>显示为实时识别的车牌号</span>
                      </div>
                      <div class="type-item">
                        <span class="type-label">时间：</span>
                        <span>显示为当前系统时间</span>
                      </div>
                      <div class="type-item">
                        <span class="type-label">排放标准：</span>
                        <span>显示车辆的排放标准信息</span>
                      </div>
                      <div class="type-item">
                        <span class="type-label">通行消息：</span>
                        <span>显示通行消息(包括允许通行、拒绝原因)</span>
                      </div>
                      <div class="type-item">
                        <span class="type-label">自定义：</span>
                        <span>可输入自定义文本内容，支持车牌号 <span style="color: #FF4500;">{plateNo}</span> 、时间 <span
                            style="color: #FF4500;">{time}</span> 、
                          排放标准 <span style="color: #FF4500;">{emission}</span> 、通行消息 <span
                            style="color: #FF4500;">{msg}</span>
                          等变量占位符</span>
                      </div>
                    </div>
                    <div class="help-item">
                      <span class="help-number">3.</span>

                      <span class="help-text">
                        推荐使用 ’自定义’ 选项，配合变量占位符灵活配置显示文字，<br>
                        例如可以配置为：<span style="color: #FF4500;">{plateNo} ，当前时间{time} ，排放标准{emission}
                          ，{msg}</span>，<br>
                        则当允许通行时显示结果为：<span style="color: #FF4500;">京A12345 ，当前时间2024-12-28 08:00:00
                          ，排放标准国六 ，欢迎光临
                          <br>
                        </span>
                        当因车辆为黑名单车辆拒绝通行时显示结果为：<span style="color: #FF4500;">京A12345 ，当前时间2024-12-28 08:00:00
                          ，排放标准国六 ，黑名单车辆禁止入内<br>
                        </span>
                      </span>
                    </div>
                    <div class="help-item">
                      <span class="help-number">4.</span>
                      <span class="help-text">主屏最多支持<strong>8</strong>行显示，道闸屏最多支持<strong>4</strong>行显示</span>
                    </div>
                    <div class="help-item">
                      <span class="help-number">5.</span>
                      <span class="help-text">可通过拖拽左侧 <el-icon>
                          <Rank />
                        </el-icon> 图标调整显示顺序</span>
                    </div>
                  </div>
                </el-collapse-item>
              </el-collapse>
            </el-col>
            <el-col :span="6">
              <el-form-item label="显示时间(秒)" prop="showTime">
                <el-input v-model="formData.showTime" type="number" />
              </el-form-item>
            </el-col>
          </el-row>


          <!-- draggable -->
          <draggable v-if="formData.content.length" v-model="formData.content" item-key="id" handle=".drag-handle"
            :animation="200" class="content-list" @end="updateLineIds">
            <template #item="{ element: item, index }">
              <el-form-item :label="`第${index + 1}行`" label-width="60px">
                <div class="content-row">
                  <div class="drag-handle">
                    <el-icon>
                      <Rank />
                    </el-icon>
                  </div>
                  <div class="content-config-group">
                    <div class="select-row">
                      <span class="select-label">颜色：</span>
                      <el-select v-model="item.color_index" class="color-select" popper-class="color-select-dropdown">
                        <template #prefix>
                          <i class="color-dot" :class="getColorClass(item.color_index)"></i>
                        </template>
                        <el-option label="红色" value="0">
                          <span class="color-option">
                            <i class="color-dot red"></i>
                            红色
                          </span>
                        </el-option>
                        <el-option label="绿色" value="1">
                          <span class="color-option">
                            <i class="color-dot green"></i>
                            绿色
                          </span>
                        </el-option>
                        <el-option label="蓝色" value="2">
                          <span class="color-option">
                            <i class="color-dot blue"></i>
                            蓝色
                          </span>
                        </el-option>
                        <el-option label="黄色" value="3">
                          <span class="color-option">
                            <i class="color-dot yellow"></i>
                            黄色
                          </span>
                        </el-option>
                        <el-option label="青色" value="4">
                          <span class="color-option">
                            <i class="color-dot cyan"></i>
                            青色
                          </span>
                        </el-option>
                        <el-option label="紫色" value="5">
                          <span class="color-option">
                            <i class="color-dot purple"></i>
                            紫色
                          </span>
                        </el-option>
                        <el-option label="白色" value="6">
                          <span class="color-option">
                            <i class="color-dot white"></i>
                            白色
                          </span>
                        </el-option>
                      </el-select>
                    </div>
                    <div class="select-row">
                      <span class="select-label">字体：</span>
                      <!-- 当 model 为 'C' 时显示 findex 选项 -->
                      <el-select v-if="formData.model === 'C'" v-model="item.font_index" class="config-select">
                        <el-option v-for="dict in findex" :key="dict.value" :label="dict.label" :value="dict.value" />
                      </el-select>
                      <!-- 其他情况显示 font_index 选项 -->
                      <el-select v-else v-model="item.font_index" class="config-select">
                        <el-option v-for="dict in font_index" :key="dict.value" :label="dict.label"
                          :value="dict.value" />
                      </el-select>
                    </div>
                  </div>

                  <div class="content-type-group">
                    <div class="select-row">
                      <el-radio-group v-model="item.type" class="custom-radio-group" @change="updateText(item)">
                        <el-radio :value="'1'">自定义</el-radio>
                        <el-radio :value="'2'">车牌号</el-radio>
                        <el-radio :value="'3'">时间</el-radio>
                        <el-radio :value="'4'">排放标准</el-radio>
                        <el-radio :value="'5'">允许通行/拒绝原因</el-radio>
                      </el-radio-group>
                    </div>
                    <div class="select-row">
                      <el-input v-if="item.type === '1'" v-model="item.text" placeholder="请输入显示内容" />
                    </div>
                  </div>

                  <el-button type="danger" circle @click="removeRow(index)" class="delete-btn"
                    :class="{ 'delete-btn-hover': true }">
                    <el-icon>
                      <Delete />
                    </el-icon>
                  </el-button>
                </div>
              </el-form-item>
            </template>
          </draggable>

          <el-button type="primary" @click="addRow" class="add-row-btn" :disabled="isMaxRows"
            :class="{ 'is-disabled': isMaxRows }">
            <el-icon class="mr-5">
              <Plus />
            </el-icon>
            添加新行 {{ formData.content.length }}/{{ maxRows }}
          </el-button>
        </div>

        <!-- 保存按钮 -->
        <el-form-item class="save-btn">
          <div class="save-btn-container">
            <el-button type="success" @click="handleAdd"
              :disabled="!(isAddingScreen || isAddingCamera || isAddingGate)">保存新增</el-button>
            <el-button type="primary" @click="handleUpdate"
              :disabled="isAddingScreen || isAddingCamera || isAddingGate || !hasChanges">保存修改</el-button>
          </div>
        </el-form-item>
      </el-form>

      <el-form v-if="selectedType === 'camera'" :model="cameraForm" label-width="120px" :rules="cameraRules"
        ref="formRef">
        <div class="section-title">基础信息</div>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="相机名称" prop="cameraName">
              <el-input v-model="cameraForm.cameraName" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="序列号" prop="cameraSn">
              <el-input v-model="cameraForm.cameraSn" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="相机品牌" prop="cameraBrand">
              <el-select v-model="cameraForm.cameraBrand">
                <el-option v-for="dict in camera_brand" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6"></el-col>
          <el-col :span="6">
            <el-form-item label="相机类型" prop="captureType">
              <el-select v-model="cameraForm.captureType" placeholder="请选择摄像头类型" clearable>
                <el-option
                  v-for="option in filteredOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :span="6">
            <el-form-item label="车身相机序列号" prop="violationCamSn">
              <el-input v-model="cameraForm.violationCamSn" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="车身相机品牌" prop="screenBrand">
              <el-select v-model="cameraForm.screenBrand">
                <el-option v-for="dict in camera_brand" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6"></el-col>
          <el-col :span="6">
            <el-form-item label="主屏" prop="screenSn">
              <el-input v-model="cameraForm.screenSn" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="道闸类型" prop="gateType">
              <el-select v-model="cameraForm.gateType" clearable>
                <el-option v-for="dict in tunnel_type" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <div class="section-title">硬盘录像机配置</div>
        <el-row :gutter="0">
          <el-col :span="6">
            <el-form-item label="IP" prop="ip">
              <el-input v-model="cameraForm.ip" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="端口" prop="port">
              <el-input v-model="cameraForm.port" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="通道号" prop="channels">
              <el-select v-model="cameraForm.channels" clearable>
                <el-option v-for="dict in nvr_channels" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6"></el-col>
          <el-col :span="6">
            <el-form-item label="相机用户名" prop="username">
              <el-input v-model="cameraForm.username" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="相机密码" prop="password">
              <el-input v-model="cameraForm.password" />
            </el-form-item>
          </el-col>
        </el-row>

        <div class="section-title">位置信息</div>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="出入口编号" prop="entranceNo">
              <el-select v-model="cameraForm.entranceNo">
                <el-option v-for="dict in entrance_no" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="道闸编号" prop="turnNo">
              <el-input v-model="cameraForm.turnNo" placeholder="01,02(必须是两位数字)" maxlength="2"
                :show-word-limit="true" />
            </el-form-item>
          </el-col>
          <el-col :span="12"></el-col>
          <el-col :span="6">
            <el-form-item label="相机经度" prop="longitude">
              <el-input v-model="cameraForm.longitude" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="相机纬度" prop="latitude">
              <el-input v-model="cameraForm.latitude" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 只在非新增状态下显示视频配置和认证信息 -->
        <template v-if="!isAddingCamera">
          <div class="section-title">视频配置</div>
          <el-row :gutter="20">
            <el-col :span="10">
              <el-form-item label="视频播放地址">
                <el-input v-model="cameraForm.vedioSrc" class="w-full" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="10">
              <el-form-item label="回放视频地址">
                <el-input v-model="cameraForm.vedioReplay" class="w-full" disabled />
              </el-form-item>
            </el-col>
          </el-row>

          <div class="section-title">认证信息</div>
          <el-row :gutter="20">
            <el-col :span="54">
              <el-form-item label="是否认证">
                <el-tag :type="cameraForm.isValid == 1 ? 'success' : 'info'">
                  {{ cameraForm.isValid == 1 ? '已认证' : '未认证' }}
                </el-tag>
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item label="认证信息">
                <el-tooltip :content="cameraForm.message" placement="top">
                  <el-input v-model="cameraForm.message" disabled />
                </el-tooltip>
              </el-form-item>
            </el-col>
          </el-row>
        </template>

        <!-- 保存钮 -->
        <el-form-item class="save-btn">
          <div class="save-btn-container">
            <el-button type="success" @click="handleAdd" :disabled="!(isAddingCamera || isAddingGate)">保存新增</el-button>
            <el-button type="primary" @click="handleUpdate" :disabled="isAddingCamera || isAddingGate">保存修改</el-button>
          </div>
        </el-form-item>
      </el-form>

      <!-- 当选中道闸时显示道闸配置表单 -->
      <el-form v-if="selectedType === 'gate'" :model="gateForm" label-width="120px" :rules="gateRules" ref="formRef">
        <div class="section-title">基础信息</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="道闸名称" prop="turnName">
              <el-input v-model="gateForm.turnName" />
            </el-form-item>
          </el-col>
          <el-col :span="12" />
          <el-col :span="6">
            <el-form-item label="出入口编号" prop="entranceNo" style="width: 100%; margin-bottom: 20px;">
              <div class="custom-style">
                <el-segmented v-model="gateForm.entranceNo"
                  :options="entrance_no.map(dict => ({ label: dict.label, value: dict.value }))" size="small" />
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="道闸编号" prop="turnNo">
              <el-input v-model="gateForm.turnNo" placeholder="01,02(必须是两位数字)" maxlength="2" minlength="2"
                :show-word-limit="true" />
            </el-form-item>
          </el-col>
          <el-col :span="12" />
          <el-col :span="12">
            <el-form-item label="道闸地址" prop="turnAddress">
              <el-input v-model="gateForm.turnAddress" class="w-full" />
            </el-form-item>
          </el-col>
        </el-row>

        <div class="section-title">位置信息</div>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="经度" prop="longitude">
              <el-input v-model="gateForm.longitude" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="纬度" prop="latitude">
              <el-input v-model="gateForm.latitude" />
            </el-form-item>
          </el-col>
        </el-row>

        <div class="section-title">联系人信息</div>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="道闸负责人" prop="inCharge">
              <el-input v-model="gateForm.inCharge" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="负责人联系方式" prop="inChargeContact">
              <el-input v-model="gateForm.inChargeContact" />
            </el-form-item>
          </el-col>
          <el-col :span="12"></el-col>
          <el-col :span="6">
            <el-form-item label="运维单位" prop="maintenanceCompany">
              <el-input v-model="gateForm.maintenanceCompany" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="运维方联系人" prop="maintenanceContact">
              <el-input v-model="gateForm.maintenanceContact" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="运维方联系方式" prop="maintenancePhone">
              <el-input v-model="gateForm.maintenancePhone" />
            </el-form-item>
          </el-col>
        </el-row>

        <div class="section-title" v-if="!isAddingGate">认证信息</div>
        <el-row :gutter="20" v-if="!isAddingGate">
          <el-col :span="54">
            <el-form-item label="是否认证" v-if="!isAddingGate">
              <el-tag :type="gateForm.isValid == 1 ? 'success' : 'info'">
                {{ gateForm.isValid == 1 ? '已认证' : '未认证' }}
              </el-tag>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item class="save-btn">
          <div class="save-btn-container">
            <el-button type="success" @click="handleAdd" :disabled="!isAddingGate">保存新增</el-button>
            <el-button type="primary" @click="handleUpdate" :disabled="isAddingGate">保存修改</el-button>
          </div>
        </el-form-item>

      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { VideoCamera, Monitor, SetUp, Refresh, Delete, Plus, Rank, Search, QuestionFilled } from '@element-plus/icons-vue'
import { selectIds } from "@/api/system/info";
import { getGateList, getDeviceList, getGateInfo, saveScreen, updateScreen } from '@/api/system/device'
import { addCamera, updateCamera } from '@/api/system/camera'
import { addGate, updateGate } from '@/api/system/gate'
import { ElMessage } from 'element-plus'
import draggable from 'vuedraggable'
import { cloneDeep, isEqual } from 'lodash-es'
const { proxy } = getCurrentInstance();
const { screen_brand, entrance_no, camera_brand, cam_type, tunnel_type, font_index, findex, nvr_channels } = proxy.useDict('screen_brand', 'entrance_no', 'camera_brand', 'cam_type', 'tunnel_type', 'font_index', 'findex', 'nvr_channels');

// 树形数据结构
const treeData = ref([])
const isAddingScreen = ref(false)

const defaultProps = {
  children: 'children',
  label: 'label',
  isLeaf: 'isLeaf'
}

// 当前选中的设备类型
const selectedType = ref('')

// 屏幕配置表单数据
const formData = reactive({
  id: null,
  ledSn: '', // 屏幕序列号
  model: '', // 品牌型号
  ledType: 1, // 1:主屏 2:入口道闸 3:出口道闸
  cameraId: null, // 关联相机ID
  content: [],
  showTime: null, // 显示时间
  rowTotal: null, // 行数
  userId: null,    // 用户ID
  deptId: null,    // 部门ID
})

// 相机配置表单数据
const cameraForm = reactive({
  id: null,
  cameraName: '',    // 相机名称
  cameraBrand: '',   // 相机品牌
  cameraSn: '',      // 序列号
  captureType: '',   // 相机类型
  gateType: '',      // 道闸类型
  violationCamSn: '', // 车身相机序列号
  screenBrand: '', // 车身相机序列号
  screenSn: '', // 主屏序列号

  // 网络配置
  ip: '',           // IP地址
  port: '',         // 端口
  username: '',     // 用户名
  password: '',     // 密码
  channels: '',     // 通道号

  // 视频配置
  vedioSrc: '',     // 视频播放地址
  vedioReplay: '',  // 回放视频地址

  // 位置信息
  entranceNo: '',   // 出入口编号
  turnNo: '',        // 道闸编号
  longitude: null,
  latitude: null,

  // 认证信息
  isValid: null,    // 是否认证
  message: '',      // 认证信息
  userId: null,    // 用户ID
  deptId: null,    // 部门ID
})

// 道闸配置表单数据
const gateForm = reactive({
  id: null,
  companyId: '', // 企业ID
  identifier: '', // 企业编码
  // cameraBrand: '', // 相机品牌
  // cameraSn: '', // 相机序列号
  entranceNo: '', // 出入口编号
  turnNo: '', // 道闸编号
  turnName: '', // 道闸名称
  turnAddress: '', // 道闸地址
  longitude: null, // 经度
  latitude: null, // 纬度
  ip: '', // IP地址
  inCharge: '', // 道闸负责人
  inChargeContact: '', // 负责人联系方式
  maintenanceContact: '', // 运维联系人
  maintenanceCompany: '', // 运维单位
  maintenancePhone: '', // 运维联系方式
  isValid: null, // 是否认证
  userId: null, // 用户ID
  deptId: null // 部门ID
})

const isAddingGate = ref(false)

// 添加一个 ref 来存储当前中的节点
const currentNode = ref(null)

// 添加新增相机状态标志
const isAddingCamera = ref(false)

// 添加控制显示/隐藏的状态
const hideAddNodes = ref(false)

// 添加切换方法
const toggleAddNodes = () => {
  hideAddNodes.value = !hideAddNodes.value
  // 重新加载树
  if (treeRef.value) {
    treeRef.value.store.setData([])
    initEnterpriseList()
  }
}

// 处理树节点点击
const handleNodeClick = async (data, node) => {
  currentNode.value = node

  if (data.type === 'screen') {
    selectedType.value = 'screen'
    isAddingScreen.value = false
    const processedData = { ...data.deviceData }
    if (processedData.content) {
      try {
        if (Array.isArray(processedData.content)) {
          if (typeof processedData.content[0] === 'string') {
            processedData.content = JSON.parse(processedData.content[0])
          }
        } else {
          processedData.content = []
        }
      } catch (error) {
        processedData.content = []
      }
    } else {
      processedData.content = []
    }
    Object.assign(formData, processedData)
    // 保存原始数据副本
    originalFormData.value = cloneDeep(formData)
    return
  }

  if (data.type === 'add_screen') {
    selectedType.value = 'screen'
    formData.id = null
    formData.ledSn = ''
    formData.model = ''
    formData.ledType = 1
    formData.cameraId = null
    formData.content = []
    formData.showTime = null
    formData.userId = null
    formData.deptId = null
    formData.rowTotal = null
    isAddingScreen.value = true
    return
  }
  if (data.type === 'add_camera') {
    selectedType.value = 'camera'
    isAddingCamera.value = true
    Object.keys(cameraForm).forEach(key => {
      cameraForm[key] = null
    })
    cameraForm.gateId = data.parentId
    return
  }

  if (data.type === 'add_gate') {
    selectedType.value = 'gate'
    isAddingGate.value = true
    Object.keys(gateForm).forEach(key => {
      gateForm[key] = null
    })
    gateForm.companyId = data.parentId
    return
  }

  selectedType.value = data.type

  if (data.type === 'gate') {
    isAddingGate.value = false
    try {
      const response = await getGateInfo(data.id)
      if (response.data) {
        Object.assign(gateForm, response.data)
        originalGateForm.value = cloneDeep(gateForm)
      }
    } catch (error) {
      console.error('加载道闸信息失败:', error)
      ElMessage.error('加载道闸信息失败')
    }
  } else if (data.type === 'camera') {
    selectedType.value = 'camera'
    isAddingCamera.value = false
    Object.assign(cameraForm, data.deviceData)
    originalCameraForm.value = cloneDeep(cameraForm)
  }
}

// 保存配置
const handleUpdate = async () => {
  if (selectedType.value === 'screen') {
    await formRef.value.validate()
    const saveData = {
      id: formData.id,
      companyId: currentNode.value?.parent?.data?.parentId,
      ledSn: formData.ledSn,
      model: formData.model,
      ledType: formData.ledType,
      cameraId: formData.cameraId,
      content: formData.content,
      showTime: formData.showTime,
      rowTotal: formData.rowTotal,
      gateId: currentNode.value?.parent?.data?.id,
      userId: formData.userId,
      deptId: formData.deptId
    }
    console.log('保存屏幕配置:', saveData)
    try {
      await updateScreen(saveData)
      ElMessage.success('保存成功')
    } catch (error) {
      console.error('保存失败:', error)
      ElMessage.error('保存失败')
    }
  } else if (selectedType.value === 'camera') {
    await formRef.value.validate()
    const saveData = {
      id: cameraForm.id,
      companyId: currentNode.value?.parent?.data?.parentId,
      cameraName: cameraForm.cameraName,
      cameraBrand: cameraForm.cameraBrand,
      cameraSn: cameraForm.cameraSn,
      captureType: cameraForm.captureType,
      gateType: cameraForm.gateType,
      entranceNo: cameraForm.entranceNo,
      turnNo: cameraForm.turnNo,
      longitude: cameraForm.longitude,
      latitude: cameraForm.latitude,
      ip: cameraForm.ip,
      port: cameraForm.port,
      violationCamSn: cameraForm.violationCamSn,
      screenBrand: cameraForm.screenBrand,
      screenSn: cameraForm.screenSn,
      username: cameraForm.username,
      password: cameraForm.password,
      channels: cameraForm.channels,
    }
    try {
      await updateCamera(saveData)
      ElMessage.success('保存成功')
    } catch (error) {
      console.error('保存失败:', error)
      ElMessage.error('保存失败')
    }
  } else if (selectedType.value === 'gate') {
    await formRef.value.validate()
    try {
      await updateGate(gateForm)
      console.log("保存道闸配置:", gateForm)
      ElMessage.success('保存成功')
    } catch (error) {
      console.error('保存道闸配置失败:', error)
      ElMessage.error('保存失败')
    }
  }
}

const handleAdd = async () => {
  try {
    if (selectedType.value === 'screen') {
      await formRef.value.validate()
      const saveData = {
        id: formData.id,
        companyId: currentNode.value?.parent?.data?.parentId,
        ledSn: formData.ledSn,
        model: formData.model,
        ledType: formData.ledType,
        cameraId: formData.cameraId,
        content: formData.content,
        showTime: formData.showTime,
        rowTotal: formData.rowTotal,
        gateId: currentNode.value?.parent?.data?.id,
        userId: formData.userId,
        deptId: formData.deptId
      }
      try {
        await saveScreen(saveData)
        ElMessage.success('保存成功')
      } catch (error) {
        console.error('保存失败:', error)
        ElMessage.error('保存失败')
      }
    } else if (selectedType.value === 'camera') {
      await formRef.value.validate()
      const saveData = {
        id: cameraForm.id,
        companyId: currentNode.value?.parent?.data?.parentId,
        cameraName: cameraForm.cameraName,
        cameraBrand: cameraForm.cameraBrand,
        cameraSn: cameraForm.cameraSn,
        captureType: cameraForm.captureType,
        gateType: cameraForm.gateType,
        entranceNo: cameraForm.entranceNo,
        turnNo: cameraForm.turnNo,
        longitude: cameraForm.longitude,
        latitude: cameraForm.latitude,
        ip: cameraForm.ip,
        port: cameraForm.port,
        violationCamSn: cameraForm.violationCamSn,
        screenBrand: cameraForm.screenBrand,
        screenSn: cameraForm.screenSn,
        username: cameraForm.username,
        password: cameraForm.password,
        channels: cameraForm.channels,
        gateId: currentNode.value?.parent?.data?.id,
      }
      try {
        await addCamera(saveData)
        ElMessage.success('新增相机成功')
      } catch (error) {
        console.error('新增相机失败:', error)
        ElMessage.error('新增失败')
      }
    } else if (selectedType.value === 'gate') {
      await formRef.value.validate()
      await addGate(gateForm)
      ElMessage.success('新增道闸成功')
    }
    await handleRefresh()
  } catch (error) {
    console.error('新增配置失败:', error)
    ElMessage.error('新增失败')
  }
}

async function initEnterpriseList() {
  try {
    const response = await selectIds()
    treeData.value = response.rows.map(item => ({
      id: item.companyId,
      label: item.companyName,
      type: 'company',
      isLeaf: false
    }))
    console.log("企业列表", treeData.value)
  } catch (error) {
    console.error("获取企业列表失败", error)
  }
}

const loadNode = async (node, resolve) => {
  if (node.level === 0) {
    return resolve(treeData.value)
  }

  const { data } = node
  try {
    if (data.type === 'company') {
      const response = await getGateList(data.id)
      const gates = response.rows || response.data || []
      const gateNodes = gates.map(gate => ({
        id: gate.id,
        label: gate.turnName || gate.name,
        type: 'gate',
        isLeaf: false,
        parentId: data.id,
        icon: Plus
      }))

      // 只在非隐藏状态下添加新增节点，并放在最后
      if (!hideAddNodes.value) {
        gateNodes.push({
          id: 'add_gate',
          label: '新增道闸',
          type: 'add_gate',
          isLeaf: true,
          parentId: data.id,
          icon: Plus
        })
      }

      resolve(gateNodes)
    }
    else if (data.type === 'gate') {
      const { data: devices } = await getDeviceList(data.id)
      const deviceNodes = []

      // 先添加已有设备节点
      devices.screen?.forEach(screen => {
        const ledTypeMap = {
          1: '主屏',
          2: '入口道闸',
          3: '出口道闸'
        }
        if (screen.content) {
          try {
            if (Array.isArray(screen.content)) {
              if (typeof screen.content[0] === 'string') {
                screen.content = JSON.parse(screen.content[0])
              }
            } else {
              screen.content = []
            }
          } catch (error) {
            console.error('解析 content 失败:', error)
            screen.content = []
          }
        } else {
          screen.content = []
        }

        deviceNodes.push({
          id: `screen_${screen.id}`,
          label: `LED屏-[${ledTypeMap[screen.ledType] || '未知'}] ${screen.ledSn}`,
          type: 'screen',
          isLeaf: true,
          deviceData: screen
        })
      })

      devices.camera?.forEach(camera => {
        const captureTypeMap = {
          '1': '识别抓拍',
          '2': '违规抓拍'
        }

        deviceNodes.push({
          id: `camera_${camera.id}`,
          label: `相机-[${camera.cameraName}] ${camera.ip}`,
          tooltip: `${captureTypeMap[camera.captureType]} | SN:${camera.cameraSn}`,
          type: 'camera',
          isLeaf: true,
          deviceData: camera
        })
      })

      // 只在非隐藏状态下添加新增节点，并放在最后
      if (!hideAddNodes.value) {
        deviceNodes.push({
          id: 'add_screen',
          label: '新增屏幕',
          type: 'add_screen',
          isLeaf: true,
          parentId: data.id,
          icon: Plus
        })

        deviceNodes.push({
          id: 'add_camera',
          label: '新增相机',
          type: 'add_camera',
          isLeaf: true,
          parentId: data.id,
          icon: Plus
        })
      }

      resolve(deviceNodes)
    }
    else {
      resolve([])
    }
  } catch (error) {
    console.error('加载节点数据失败:', error)
    resolve([])
  }
}

const handleRefresh = async () => {
  try {
    selectedType.value = ''
    treeData.value = []
    await initEnterpriseList()
    ElMessage.success('刷新成功')
  } catch (error) {
    console.error('刷新失败:', error)
    ElMessage.error('刷新失败')
  }
}

initEnterpriseList()

const addRow = () => {
  if (formData.content.length >= maxRows.value) {
    ElMessage.warning(`${formData.ledType === 1 ? '主屏' : '道闸屏'}最多只能添加${maxRows.value}行`)
    return
  }
  formData.content.push({
    line_id: formData.content.length,
    type: '1',
    text: '',
    color_index: '',
    font_index: ''
  })
}

const updateLineIds = () => {
  formData.content.forEach((item, index) => {
    item.line_id = index
  })
}

const removeRow = (index) => {
  formData.content.splice(index, 1)
  updateLineIds()
}

const updateText = (item) => {
  if (item.type === '2') {
    item.text = '{plateNo}';
  } else if (item.type === '3') {
    item.text = '{time}';
  } else if (item.type === '4') {
    item.text = '{emission}';
  } else if (item.type === '5') {
    item.text = '{msg}';
  } else {
    item.text = '';
  }
}

const maxRows = computed(() => {
  return formData.ledType === 1 ? 8 : 4
})

const isMaxRows = computed(() => {
  return formData.content.length >= maxRows.value
})

watch(() => formData.ledType, (newType) => {
  const maxAllowedRows = newType === 1 ? 8 : 4
  if (formData.content.length > maxAllowedRows) {
    formData.content = formData.content.slice(0, maxAllowedRows)
    ElMessage.warning(`${newType === 1 ? '主屏' : '道闸屏'}最多只能显示${maxAllowedRows}行，超出部分已被删除`)
  }
})

const searchKeyword = ref('')
const treeRef = ref(null)

const filterNode = (value, data) => {
  if (!value) return true
  if (data.type === 'company') {
    return data.label.toLowerCase().includes(value.toLowerCase())
  }
  return true
}

watch(searchKeyword, async (val) => {
  if (treeRef.value) {
    if (!val) {
      treeData.value = []
      await initEnterpriseList()
    }
    treeRef.value.filter(val)
  }
})

const handleSearch = (value) => {
  if (treeRef.value) {
    treeRef.value.filter(value)
  }
}

const screenRules = {
  ledSn: [{ required: true, message: '请输入屏幕序列号', trigger: 'blur' }],
  model: [{ required: true, message: '请选择屏幕型号', trigger: 'change' }],
  ledType: [{ required: true, message: '请选择屏幕类型', trigger: 'change' }],
  showTime: [{ required: true, message: '请输入显示时间', trigger: 'blur' }],
  content: [{
    validator: (rule, value, callback) => {
      if (!value || !Array.isArray(value) || value.length === 0) {
        callback(new Error('请至少添加一行显示内容'));
        return;
      }

      // 检查每一行的必填项
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        if (!item.type) {
          callback(new Error(`第${i + 1}行：请选择显示类型`));
          return;
        }
        if (!item.color_index) {
          callback(new Error(`第${i + 1}行：请选择显示颜色`));
          return;
        }
        if (!item.font_index) {
          callback(new Error(`第${i + 1}行：请选择字体`));
          return;
        }
        if (item.type === '1' && !item.text) {
          callback(new Error(`第${i + 1}行：请输入自定义显示内容`));
          return;
        }
      }
      callback();
    },
    trigger: ['blur', 'change']
  }]
}

const cameraRules = {
  cameraName: [{ required: true, message: '请输入相机名称', trigger: 'blur' }],
  cameraBrand: [{ required: true, message: '请选择相机品牌', trigger: 'change' }],
  cameraSn: [{ required: true, message: '请输入序列号', trigger: 'blur' }],
  captureType: [{ required: true, message: '请选择相机类型', trigger: 'change' }],
  gateType: [{ required: true, message: '请选择道闸类型', trigger: 'change' }],
  violationCamSn: [{ required: true, message: '请输入车身相机序列号', trigger: 'blur' }],
  screenBrand: [{ required: true, message: '请选择车身相机品牌', trigger: 'change' }],
  longitude: [{ required: true, message: '请输入相机经度', trigger: 'blur' },
  {
    validator: (rule, value, callback) => {
      if (!value || isNaN(value) || value < -180 || value > 180) {
        callback(new Error('道闸经度必须在-180到180之间'));
      } else {
        callback();
      }
    }, trigger: 'blur'
  }
  ],
  latitude: [{ required: true, message: '请输入相机纬度', trigger: 'blur' },
  {
    validator: (rule, value, callback) => {
      if (!value || isNaN(value) || value < -90 || value > 90) {
        callback(new Error('道闸纬度必须在-90到90之间'));
      } else {
        callback();
      }
    }, trigger: 'blur'
  }
  ],
  ip: [{ required: true, message: '请输入IP地址', trigger: 'blur' },
  { pattern: /^(?:\d{1,3}\.){3}\d{1,3}$/, message: '请输入合法的IP地址', trigger: 'blur' }
  ],
  port: [{ required: true, message: '请输入端口', trigger: 'blur' }],
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  channels: [{ required: true, message: '请输入通道号', trigger: 'blur' }],
  entranceNo: [{ required: true, message: '请选择出入口编号', trigger: 'change' }],
  turnNo: [{ required: true, message: '请输入道闸编号', trigger: 'blur' },
  { pattern: /^\d{2}$/, message: '道闸编号必须是两位数字', trigger: 'blur' }
  ]
}

const gateRules = {
  turnName: [{ required: true, message: '请输入道闸名称', trigger: 'blur' }],
  entranceNo: [{ required: true, message: '请选择出入口编号', trigger: 'change' }],
  turnNo: [{ required: true, message: '请输入道闸编号', trigger: 'blur' },
  { pattern: /^\d{2}$/, message: '道闸编号必须是两位数字', trigger: 'blur' }
  ],
  turnAddress: [{ required: true, message: '请输入道闸地址', trigger: 'blur' }],
  longitude: [{ required: true, message: '请输入相机经度', trigger: 'blur' },
  {
    validator: (rule, value, callback) => {
      if (!value || isNaN(value) || value < -180 || value > 180) {
        callback(new Error('道闸经度必须在-180到180之间'));
      } else {
        callback();
      }
    }, trigger: 'blur'
  }
  ],
  latitude: [{ required: true, message: '请输入相机纬度', trigger: 'blur' },
  {
    validator: (rule, value, callback) => {
      if (!value || isNaN(value) || value < -90 || value > 90) {
        callback(new Error('道闸纬度必须在-90到90之间'));
      } else {
        callback();
      }
    }, trigger: 'blur'
  }
  ],
  inCharge: [{ required: true, message: '请输入道闸负责人', trigger: 'blur' }],
  inChargeContact: [{ required: true, message: '请输入负责人联系方式', trigger: 'blur' },
  { pattern: /^1[3-9]\d{9}$/, message: '请输入合法的手机号', trigger: 'blur' }],
  maintenanceContact: [{ required: true, message: '请输入运维联系人', trigger: 'blur' }],
  maintenanceCompany: [{ required: true, message: '请输入运维单位', trigger: 'blur' }],
  maintenancePhone: [{ required: true, message: '请输入运维联系方式', trigger: 'blur' },
  { pattern: /^1[3-9]\d{9}$/, message: '请输入合法的手机号', trigger: 'blur' }]
}

// 添加表单引用
const formRef = ref(null)

// 添加一个辅助函数来获取颜色类名
const getColorClass = (color_index) => {
  const colorMap = {
    '0': 'red',
    '1': 'green',
    '2': 'blue',
    '3': 'yellow',
    '4': 'cyan',
    '5': 'purple',
    '6': 'white'
  }
  return colorMap[color_index]
}

const getFontOptions = (model) => {
  return model === 'C' ? findex : font_index;
}

// 添加原始数据副本
const originalFormData = ref(null)
const originalCameraForm = ref(null)
const originalGateForm = ref(null)

// 添加计算属性判断是否有修改
const hasChanges = computed(() => {
  if (selectedType.value === 'screen' && !isAddingScreen.value) {
    if (!originalFormData.value) return false
    return !isEqual(formData, originalFormData.value)
  }

  if (selectedType.value === 'camera' && !isAddingCamera.value) {
    if (!originalCameraForm.value) return false
    return !isEqual(cameraForm, originalCameraForm.value)
  }

  if (selectedType.value === 'gate' && !isAddingGate.value) {
    if (!originalGateForm.value) return false
    return !isEqual(gateForm, originalGateForm.value)
  }

  return false
})

const selectedCamType = ref(null);

// 监听 cameraForm.captureType 的变化
watch(() => cameraForm.captureType, (newValue) => {
  selectedCamType.value = newValue;
}, { immediate: true });

// 定义所有选项
const camOptionsGroups = {
  normal: [
    { label: "入口识别相机", value: "1" },
    { label: "入口违规相机", value: "2" },
    { label: "出口识别相机", value: "3" },
    { label: "出口违规相机", value: "4" }
  ],
  single: [
    { label: "入口-逻辑违规相机", value: "5" },
    { label: "出口-逻辑违规相机", value: "6" }
  ]
}

// 计算属性，根据选择的类型过滤选项
const filteredOptions = computed(() => {
  if (!selectedCamType.value) {
    return [...camOptionsGroups.normal, ...camOptionsGroups.single];
  }
  
  const type = Number(selectedCamType.value);
  return type <= 4 ? camOptionsGroups.normal : camOptionsGroups.single;
});

</script>

<style scoped>
.camera-config {
  display: flex;
  gap: 20px;
  padding: 20px;
}

.tree-container {
  width: 20%;
  border-right: 1px solid #dcdfe6;
}

.config-form {
  flex: 1;
  padding-bottom: 80px;
}

.custom-tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
}

.custom-tree-node .el-icon {
  font-size: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin: 20px 0 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
  color: #606266;
  display: flex;
  align-items: center;
  gap: 8px;
}

.display-content {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 20px;
  background-color: #f8f9fb;
}

.content-list {
  min-height: 50px;
}

.content-row {
  display: flex;
  align-items: center;
  gap: 20px;
  width: 100%;
  padding: 16px 20px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #ebeef5;
}

.drag-handle {
  cursor: move;
  padding: 4px 8px;
  border-radius: 4px;
  color: #909399;
  transition: all 0.3s ease;
}

.drag-handle:hover {
  background-color: #f5f7fa;
  color: #409EFF;
}

.drag-handle .el-icon {
  font-size: 18px;
}

.drag-hint {
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.content-row:hover .drag-hint {
  opacity: 1;
}

.color-select {
  width: 120px;
}

.color-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-dot {
  width: 12px;
  height: 12px;
  border: 1px solid #5a5a5c;
  border-radius: 50%;
}

.color-dot.red {
  background-color: #f56c6c;
}

.color-dot.green {
  background-color: #67c23a;
}

.color-dot.blue {
  background-color: #409eff;
}

.color-dot.yellow {
  background-color: #e6a23c;
}

.color-dot.cyan {
  background-color: #33c2cc;
}

.color-dot.purple {
  background-color: #9461eb;
}

.color-dot.white {
  background-color: #fff;
}

.radio-group-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.content-type-group {
  width: 100%;
}

.custom-radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  height: 44px;
  width: 100%;
}

.content-config-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.config-select {
  width: 160px;
}

:deep(.el-radio) {
  margin-right: 0;
  margin-bottom: 8px;
}

:deep(.el-radio__label) {
  font-size: 14px;
}

.delete-btn {
  transition: all 0.3s ease;
  opacity: 0.7;
}

.delete-btn:hover {
  opacity: 1;
  transform: scale(1.1);
}

.add-row-btn {
  margin-top: 16px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 44px;
  background-color: #fff;
  border: 1px dashed #409eff;
  color: #409eff;
}

.add-row-btn.is-disabled {
  background-color: #f5f7fa;
  border-color: #dcdfe6;
  color: #c0c4cc;
  cursor: not-allowed;
}

.add-row-btn.is-disabled:hover {
  background-color: #f5f7fa;
  border-color: #dcdfe6;
  color: #c0c4cc;
}

.sortable-ghost {
  opacity: 0.5;
  background: #e6f1fc !important;
  border: 2px dashed #409eff !important;
}

.sortable-drag {
  opacity: 0.9;
  background: #fff;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1) !important;
}

.mr-5 {
  margin-right: 5px;
}

.custom-tree-node .el-icon.is-add {
  color: #409EFF;
}

.tree-header {
  display: flex;
  gap: 10px;
  padding: 10px;
  align-items: center;
}

.search-input {
  flex: 1;
}

:deep(.el-input__wrapper) {
  border-radius: 4px;
}

:deep(.el-input__inner) {
  height: 32px;
}

:deep(.el-input__prefix) {
  display: flex;
  align-items: center;
  left: 8px;
}

.el-button.is-circle {
  margin-left: 8px;
}

:deep(.el-tooltip__trigger) {
  outline: none;
}

.save-btn {
  position: fixed;
  bottom: 0;
  right: 20px;
  left: calc(20% + 40px);
  padding: 16px 40px;
  background-color: #fff;
  border-top: 1px solid #dcdfe6;
  z-index: 1000;
  margin: 0;
}

.save-btn-container {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.empty-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 120px;
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 16px;
}

.help-icon {
  font-size: 16px;
  color: #909399;
  cursor: help;
}

.help-icon:hover {
  color: #409EFF;
}

.help-content {
  padding: 16px 8px 8px;
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
}

.help-item {
  display: flex;
  margin-bottom: 14px;
  align-items: flex-start;
}

.help-number {
  font-weight: bold;
  margin-right: 12px;
  color: #409EFF;
}

.help-types {
  margin-left: 24px;
  margin-top: 8px;
}

.type-item {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.type-label {
  font-weight: 500;
  margin-right: 4px;
  color: #303133;
  width: 75px;
}

.help-collapse {
  margin-bottom: 20px;
}

.help-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
}

:deep(.el-collapse-item__header) {
  background-color: #f8f9fb;
}

.message-config {
  margin-bottom: 20px;
  padding: 16px;
  background-color: #f8f9fb;
  border-radius: 4px;
}

.select-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.select-label {
  width: 45px;
  color: #606266;
  font-size: 14px;
}

.color-select,
.config-select {
  width: 160px;
}

</style>
