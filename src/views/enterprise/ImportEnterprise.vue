<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>企业批量导入</span>
      </div>
      
      <el-upload
        class="upload-demo"
        drag
        action=""
        :auto-upload="false"
        :on-change="handleFileChange"
        accept=".csv"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将企业文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip" slot="tip">只能上传企业 csv 文件</div>
      </el-upload>

      <div class="upload-group">
        <el-upload
          class="upload-demo"
          drag
          action=""
          :auto-upload="false"
          :on-change="handleGateFileChange"
          accept=".csv"
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将道闸文件拖到此处，或<em>点击上传</em></div>
          <div class="el-upload__tip" slot="tip">只能上传道闸 csv 文件</div>
        </el-upload>

        <el-upload
          class="upload-demo"
          drag
          action=""
          :auto-upload="false"
          :on-change="handleCameraFileChange"
          accept=".csv"
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将摄像头文件拖到此处，或<em>点击上传</em></div>
          <div class="el-upload__tip" slot="tip">只能上传摄像头 csv 文件</div>
        </el-upload>
      </div>

      <div v-if="enterprises.length" class="enterprise-list">
        
        <el-table :data="enterprises" style="width: 100%; margin-top: 20px">
          <el-table-column type="expand">
            <template #default="{ row }">
              <div class="device-info">
                <div v-if="getRelatedDevices(row.remark).gates.length > 0">
                  <h3>设备信息</h3>
                  <el-table :data="getRelatedDevices(row.remark).gates" border>
                    <!-- 道闸信息 -->
                    <el-table-column label="道闸信息" align="center">
                      <el-table-column prop="ip" label="IP地址" />
                      <el-table-column prop="serialNumber" label="序列号" />
                      <el-table-column prop="way" label="通道" />
                      <el-table-column prop="wayAddress" label="通道地址" />
                      <el-table-column prop="serialNo" label="序列号" />
                      <el-table-column prop="videoId" label="关联视频ID" />
                      <el-table-column prop="videoSerial" label="视频序列号" />
                      <el-table-column prop="address" label="地址" />
                      <el-table-column prop="companyPerson" label="企业联系人" />
                      <el-table-column prop="companyPhone" label="企业联系电话" />
                      <el-table-column prop="identifier" label="标识符" />
                      <el-table-column prop="latitude" label="纬度" />
                      <el-table-column prop="longitude" label="经度" />
                      <el-table-column prop="managerCompany" label="管理公司" />
                      <el-table-column prop="managerPerson" label="管理人员" />
                      <el-table-column prop="managerPhone" label="管理电话" />
                      <el-table-column prop="pushState" label="推送状态" />
                      <el-table-column prop="turnNo" label="转向编号" />
                    </el-table-column>
                    
                    <!-- 关联的摄像头信息 -->
                    <el-table-column label="关联摄像头信息" align="center">
                      <template #default="scope">
                        <template v-if="getRelatedCamera(scope.row)">
                          <el-table :data="[getRelatedCamera(scope.row)]" border>
                            <el-table-column prop="id" label="ID" />
                            <el-table-column prop="companyId" label="企业ID" />
                            <el-table-column prop="areaName" label="区域名称" />
                            <el-table-column prop="door" label="门" />
                            <el-table-column prop="identifier" label="标识符" />
                            <el-table-column prop="ip" label="IP地址" />
                            <el-table-column prop="name" label="名称" />
                            <el-table-column prop="password" label="密码" />
                            <el-table-column prop="state" label="状态" />
                            <el-table-column prop="type" label="类型" />
                            <el-table-column prop="userName" label="用户名" />
                            <el-table-column prop="videoSerial" label="视频序列号" />
                            <el-table-column prop="videoSrc" label="视频源" />
                            <el-table-column prop="videoSrcHf" label="高清视频源" />
                            <el-table-column prop="wayId" label="通道ID" />
                            <el-table-column prop="channels" label="通道号" />
                            <el-table-column prop="port" label="端口" />
                            <el-table-column prop="way" label="通道" />
                            <el-table-column prop="wayAddress" label="通道地址" />
                            <el-table-column prop="serialNo" label="序列号" />
                            <el-table-column prop="turnNo" label="转向编号" />
                            <el-table-column prop="vendorModel" label="厂商型号" />
                            <el-table-column prop="vendorName" label="厂商名称" />
                          </el-table>
                        </template>
                        <el-empty v-else description="无关联摄像头" />
                      </template>
                    </el-table-column>

                    <!-- 添加操作列 -->
                    <el-table-column label="操作" width="120" fixed="right">
                      <template #default="scope">
                        <el-button 
                          type="primary" 
                          size="small"
                          :loading="scope.row.loading"
                          @click="handleSubmitGateCamera(scope.row, getRelatedCamera(scope.row))"
                        >
                          提交设备
                        </el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="companyName" label="企业名称" width="200" />
          <el-table-column prop="loginName" label="登录名" width="200">
            <template #default="{ row }">
              <el-input v-model="row.loginName" placeholder="请输入登录名" width="200" />
            </template>
          </el-table-column>
          <el-table-column prop="expireDate" label="过期时间" width="250">
            <template #default="{ row }">
              <el-date-picker
                v-model="row.expireDate"
                type="date"
                placeholder="选择过期时间"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                :default-value="new Date()"
              />
            </template>
          </el-table-column>
          <el-table-column prop="identifier" label="标识符" width="200" />
          <el-table-column prop="username" label="用户名" width="200" />
          <el-table-column prop="password" label="密码" width="200" />
          <el-table-column prop="callerId" label="调用者ID" width="200" />
          <el-table-column prop="prkrsa" label="RSA私钥" width="200">
            <template #default="{ row }">
              <el-input v-model="row.prkrsa" type="textarea" :rows="2" placeholder="RSA私钥" />
            </template>
          </el-table-column>
          <el-table-column prop="prksm2" label="SM2私钥" width="200">
            <template #default="{ row }">
              <el-input v-model="row.prksm2" type="textarea" :rows="2" placeholder="SM2私钥" />
            </template>
          </el-table-column>
          <el-table-column prop="pukrsa" label="RSA公钥" width="200">
            <template #default="{ row }">
              <el-input v-model="row.pukrsa" type="textarea" :rows="2" placeholder="RSA公钥" />
            </template>
          </el-table-column>
          <el-table-column prop="puksm2" label="SM2公钥" width="200">
            <template #default="{ row }">
              <el-input v-model="row.puksm2" type="textarea" :rows="2" placeholder="SM2公钥" />
            </template>
          </el-table-column>
          <el-table-column prop="clientId" label="客户端ID" width="200">
            <template #default="{ row }">
              <el-input v-model="row.clientId" placeholder="客户端ID" />
            </template>
          </el-table-column>
          <el-table-column prop="clientSecret" label="客户端密钥" width="200">
            <template #default="{ row }">
              <el-input v-model="row.clientSecret" placeholder="客户端密钥" />
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" width="200">
            <template #default="{ row }">
              <el-input v-model="row.remark" placeholder="备注" />
            </template>
          </el-table-column>
          <el-table-column prop="level" label="企业等级" width="200">
            <template #default="{ row }">
              <el-input v-model="row.level" placeholder="企业等级" />
            </template>
          </el-table-column>
          <el-table-column prop="address" label="地址" width="200">
            <template #default="{ row }">
              <el-input v-model="row.address" placeholder="地址" />
            </template>
          </el-table-column>
          <el-table-column prop="createDate" label="创建时间" width="200">
            <template #default="{ row }">
              <el-input v-model="row.createDate" placeholder="创建时间" />
            </template>
          </el-table-column>
          <el-table-column label="状态" width="200" fixed="right">
            <template #default="{ row }">
              <el-tag :type="row.status === 'success' ? 'success' : row.status === 'error' ? 'danger' : 'info'">
                {{ row.statusText || '待提交' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button 
                type="primary" 
                size="small" 
                :loading="row.loading"
                :disabled="row.status === 'success'"
                @click="handleSubmitSingle(row)"
              >
                提交
              </el-button>
            </template>
          </el-table-column>
          
        </el-table>

        <div class="submit-section">
          <el-button type="primary" @click="handleSubmitAll" :loading="loading">
            批量提交
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { parseCSV } from '@/utils/csvParser'
import { importEnterprise, submitGateCamera } from '@/api/enterprise'
import { ElMessage } from 'element-plus'

export default {
  name: 'ImportEnterprise',
  data() {
    return {
      enterprises: [],
      gates: [],      // 存储道闸数据
      cameras: [],    // 存储摄像头数据
      loading: false,
      _relatedDevicesCache: null
    }
  },
  methods: {
    formatDate(dateStr) {
      if (!dateStr) return '';
      try {
        // 解析日期字符串 "26/7/2024 14:32:07"
        const [datePart, timePart] = dateStr.split(' ');
        const [day, month, year] = datePart.split('/');
        // 补零，确保月份和日期是两位数
        const formattedMonth = month.padStart(2, '0');
        const formattedDay = day.padStart(2, '0');
        
        // 如果有时间部分，保留时间；如果没有，使用 00:00:00
        const time = timePart || '00:00:00';
        
        // 返回符合java.util.Date格式的字符串：yyyy-MM-dd'T'HH:mm:ss.SSSX
        const date = new Date(`${year}-${formattedMonth}-${formattedDay}T${time}.000Z`);
        return date.toISOString();
      } catch (error) {
        console.error('日期格式化错误:', error);
        return '';
      }
    },
    async handleFileChange(file) {
      try {
        const enterprises = await parseCSV(file.raw)
        this.enterprises = enterprises.map(ent => ({
          companyName: ent.areaName || ent.companyName,
          loginName: '',
          expireDate: ent.expireDate,
          identifier: ent.identifier_ || ent.identifier,
          username: ent.username || ent.user_name_,
          password: ent.password_ || ent.password,
          callerId: ent.caller_id_ || ent.callerId,
          prkrsa: ent.prkrsa_ || ent.prkrsa,
          prksm2: ent.prksm2_ || ent.prksm2,
          pukrsa: ent.pukrsa_ || ent.pukrsa,
          puksm2: ent.puksm2_ || ent.puksm2,
          clientId: ent.client_id_ || ent.clientId,
          clientSecret: ent.client_secret_ || ent.clientSecret,
          remark: ent.company_id_ || ent.remark,
          level: ent.enterpriseLevel_ || ent.level,
          address: ent.areaDescription || ent.address,
          createDate: this.formatDate(ent.create_date_ || ent.createDate),
          status: 'pending',
          statusText: '待提交',
          loading: false
        }))
      } catch (error) {
        ElMessage.error(error.message)
      }
    },
    validateEnterprise(enterprise) {
      const requiredFields = {
        loginName: '登录名',
        expireDate: '过期时间',
        identifier: '标识符',
        username: '用户名',
        password: '密码',
        callerId: '调用者ID',
        clientId: '客户端ID',
        clientSecret: '客户端密钥'
      }

      for (const [field, label] of Object.entries(requiredFields)) {
        if (!enterprise[field]) {
          return `请填写${label}`
        }
      }

      return null
    },
    async handleSubmitSingle(enterprise) {
      const error = this.validateEnterprise(enterprise)
      if (error) {
        ElMessage.warning(error)
        return
      }

      // 确保日期格式正确
      if (!enterprise.expireDate || !/^\d{4}-\d{2}-\d{2}$/.test(enterprise.expireDate)) {
        ElMessage.warning('请选择正确的过期时间')
        return
      }

      console.log("企业数据:", JSON.stringify(enterprise, null, 2))
      console.log("关键字段:", {
        companyName: enterprise.companyName,
        identifier: enterprise.identifier,
        expireDate: enterprise.expireDate,
        callerId: enterprise.callerId,
        prkrsa: enterprise.prkrsa,
        prksm2: enterprise.prksm2,
        pukrsa: enterprise.pukrsa,
        puksm2: enterprise.puksm2,
        clientId: enterprise.clientId,
        clientSecret: enterprise.clientSecret,
        remark: enterprise.remark
      })

      enterprise.loading = true
      try {
        await importEnterprise(enterprise)
        enterprise.status = 'success'
        enterprise.statusText = '导入成功'
        ElMessage.success(`企业 ${enterprise.companyName} 导入成功`)
      } catch (error) {
        enterprise.status = 'error'
        enterprise.statusText = error.message || '导入失败'
        ElMessage.error(`企业 ${enterprise.companyName} 导入失败: ${enterprise.statusText}`)
      } finally {
        enterprise.loading = false
      }
    },
    async handleSubmitAll() {
      const pendingEnterprises = this.enterprises.filter(
        ent => ent.status !== 'success'
      )

      if (pendingEnterprises.length === 0) {
        ElMessage.warning('没有待提交的企业')
        return
      }

      this.loading = true
      for (const enterprise of pendingEnterprises) {
        await this.handleSubmitSingle(enterprise)
      }
      this.loading = false
    },
    getRelatedDevices(companyId) {
      // 使用计算好的结果避免重复计算
      if (!this._relatedDevicesCache) {
        this._relatedDevicesCache = new Map();
      }

      if (this._relatedDevicesCache.has(companyId)) {
        return this._relatedDevicesCache.get(companyId);
      }

      console.log('查找关联设备，企业ID:', companyId);
      
      const relatedGates = this.gates.filter(gate => gate.companyId === companyId);
      const relatedCameras = this.cameras.filter(camera => camera.companyId === companyId);
      
      console.log('找到的关联道闸:', relatedGates);
      console.log('找到的关联摄像头:', relatedCameras);

      // 为每个道闸找到对应的摄像头
      const result = {
        gates: relatedGates.map(gate => ({
          ...gate,
          relatedCamera: relatedCameras.find(camera => 
            // 尝试多种匹配方式
            camera.id === gate.videoId || 
            camera.videoSerial === gate.videoSerial ||
            (camera.way === gate.way && camera.companyId === gate.companyId)
          )
        }))
      };
      
      this._relatedDevicesCache.set(companyId, result);
      return result;
    },
    getRelatedCamera(gate) {
      return gate.relatedCamera;
    },
    async handleGateFileChange(file) {
      try {
        const gates = await parseCSV(file.raw)
        console.log('解析到的道闸原始数据:', gates[0]);
        this.gates = gates.map(gate => ({
          companyId: gate.company_id_,
          ip: gate.ip_,
          serialNumber: gate.serialnumber_,
          way: gate.way_,
          wayAddress: gate.way_address_,
          serialNo: gate.serial_no_,
          videoId: gate.videoID_,
          videoSerial: gate.video_serial_,
          address: gate.address_,
          companyPerson: gate.company_person_,
          companyPhone: gate.company_phone_,
          identifier: gate.identifier_,
          latitude: gate.latitude_,
          longitude: gate.longitude_,
          managerCompany: gate.manager_company_,
          managerPerson: gate.manager_person_,
          managerPhone: gate.manager_phone_,
          pushState: gate.push_state_,
          turnNo: gate.trun_no_,
          violationCamSn: gate.serialnumber1
        }))
        console.log('处理后的第一条道闸数据:', this.gates[0]);
        // 清除缓存
        this._relatedDevicesCache = new Map();
      } catch (error) {
        console.error('道闸数据导入错误:', error);
        ElMessage.error('道闸数据导入失败：' + error.message)
      }
    },
    async handleCameraFileChange(file) {
      try {
        const cameras = await parseCSV(file.raw)
        this.cameras = cameras.map(camera => ({
          id: camera.id_,
          companyId: camera.company_id_,
          areaName: camera.area_name_,
          door: camera.door_,
          identifier: camera.identifier_,
          ip: camera.ip_,
          name: camera.name_,
          password: camera.password_,
          state: camera.state_,
          type: camera.type_,
          userName: camera.user_name_,
          videoSerial: camera.video_serial_,
          videoSrc: camera.video_src_,
          videoSrcHf: camera.video_srchf_,
          wayId: camera.way_id_,
          channels: camera.channels_,
          port: camera.port_,
          way: camera.way_,
          wayAddress: camera.way_address_,
          serialNo: camera.serial_no_,
          turnNo: camera.trun_no_,
          vendorModel: camera.vendor_model_,
          vendorName: camera.vendor_name_
        }))
        console.log('处理后的第一条摄像头数据:', this.cameras[0]);
        // 清除缓存
        this._relatedDevicesCache = new Map();
      } catch (error) {
        console.error('摄像头数据导入错误:', error);
        ElMessage.error('摄像头数据导入失败：' + error.message)
      }
    },
    async handleSubmitGateCamera(gate, camera) {
      if (!gate || !camera) {
        ElMessage.warning('道闸或摄像头数据不完整')
        return
      }

      // 设置loading状态
      gate.loading = true

      try {
        // 构建提交表单数据
        const formData = {
          // 这里是模板映射，您可以根据实际字段对应关系修改
          turnName: gate.wayAddress,           // 道闸序列号作为名称
          cameraName: camera.name,               // 摄像头名称
          cameraSn: gate.serialNumber,          // 摄像头序列号
          entranceNo: gate.way,                  // 道闸通道号
          turnNo: gate.turnNo,                   // 道闸编号
          turnAddress: gate.address,          // 道闸地址
          longitude: gate.longitude,             // 经度
          latitude: gate.latitude,               // 纬度
          ip: camera.ip,                         // 摄像头IP
          port: camera.port,                     // 摄像头端口
          username: camera.userName,             // 摄像头用户名
          vedioSrc: camera.videoSrc,            // 视频源
          vedioReplay: camera.videoSrcHf,       // 高清视频源作为回放源
          violationCamSn: gate.violationCamSn,       // 摄像头序列号
          password: camera.password,             // 摄像头密码
          inCharge: gate.companyPerson,         // 企业联系人
          inChargeContact: gate.companyPhone,    // 企业联系电话
          maintenanceCompany: gate.managerCompany, // 管理公司
          maintenanceContact: gate.managerPerson,  // 管理人员
          maintenancePhone: gate.managerPhone,// 管理电话
          company_id_: gate.companyId      
        }

        // TODO: 调用后端API
        await submitGateCamera(formData)
        console.log('提交的设备数据:', formData)

        ElMessage.success('设备提交成功')
      } catch (error) {
        console.error('设备提交错误:', error)
        ElMessage.error('设备提交失败：' + error.message)
      } finally {
        gate.loading = false
      }
    },
  }
}
</script>

<style scoped>
.enterprise-list {
  margin-top: 20px;
}
.submit-section {
  margin-top: 20px;
  text-align: center;
}
.upload-group {
  display: flex;
  justify-content: space-around;
  margin: 20px 0;
}

.upload-group .upload-demo {
  width: 45%;
}

.device-info {
  padding: 20px;
}

.device-info h3 {
  margin: 10px 0;
  color: #606266;
}

:deep(.el-descriptions__label) {
  width: 120px;
  font-weight: bold;
}

:deep(.el-descriptions__content) {
  word-break: break-all;
}
</style> 