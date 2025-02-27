<template>
  <!-- 添加公司选择对话框 -->
  <el-dialog
    v-model="showCompanySelector"
    title="选择公司"
    width="30%"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
  >
    <el-form>
      <el-form-item label="选择公司">
        <el-select v-model="selectedCompanyId" placeholder="请选择公司" style="width: 100%">
          <el-option
            v-for="company in companyList"
            :key="company.companyId"
            :label="company.companyName"
            :value="company.companyId"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="handleCompanySelect" :disabled="!selectedCompanyId">
          确认
        </el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 原有的大屏内容 -->
  <div v-if="!showCompanySelector" class="gateway-monitor">
    <!-- 顶部标题 -->
    <div class="header">
      <div class="left">
        <span class="time">{{ currentTime }}</span>
      </div>
      <div class="right">
        <span class="phone">{{ phone }}</span>
        <span class="system">{{ companyName }}</span>
        <screenfull id="screenfull" class="right-menu-item hover-effect" />
      </div>
    </div>

    <div class="center-title">
      <div class="title">环保门禁平台</div>
    </div>

    <!-- 数据概览卡片 -->
    <div class="stats-cards">
      <div v-for="(card, index) in statsCards" :key="index" class="stat-card">
        <div class="card-header">
          <span class="card-title">{{ card.title }}</span>
          <el-icon :class="card.iconColor">
            <component :is="card.icon" />
          </el-icon>
        </div>
        <div class="card-value">
          <span class="number"
            :class="{ 'text-success': card.value === '在线' && index === 2, 'text-danger': card.value === '离线' && index === 2 }">{{
              card.value }}</span>
          <!-- <span :class="['trend', card.trend > 0 ? 'up' : 'down']">
            {{ card.trend > 0 ? '+' : '' }}{{ card.trend }}%
          </span> -->
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="content">
      <!-- 车辆监控卡片 -->
      <div class="monitor-cards">
        <el-carousel :interval="100000" :autoplay="true" trigger="click" indicator-position="outside" height="35vh">
          <el-carousel-item v-for="chunk in monitorDataChunks" :key="chunk[0].entranceName">
            <div class="carousel-content">
              <div class="card" v-for="item in chunk" :key="item.entranceName">
                <div class="card-header">
                  <div class="card-title">{{ item.entranceName }}</div>
                  <div class="header-actions">
                    <el-tag :type="item.isAlive ? 'success' : 'danger'" size="small" class="status-tag">
                      {{ item.isAlive ? '在线' : '离线' }}
                    </el-tag>
                  </div>
                </div>
                <div class="card-content">
                  <div class="image-section">
                    <template v-if="!item.isPlaying">
                      <el-image 
                        :src="item.latestRecord?.bodyImg" 
                        alt="监控画面"
                        fit="cover"
                        style="width: 100%; height: 100%;"
                        :preview-src-list="[item.latestRecord?.bodyImg]"
                        :initial-index="0"
                        :preview-teleported="true"
                        :hide-on-click-modal="false"
                      />
                      <div class="image-overlay">
                        <span class="time-badge">{{ formatTime(item.latestRecord?.passTime) }}</span>
                      </div>
                    </template>
                    <template v-else>
                      <VideoPlayer 
                        :stream-url="item.videoUrl" 
                        @error="(error) => handleVideoError(error, item)"
                        @play="(event) => handleVideoEvent('play', item)"
                        @pause="(event) => handleVideoEvent('pause', item)"
                        @waiting="(event) => handleVideoEvent('waiting', item)"
                        @playing="(event) => handleVideoEvent('playing', item)"
                        @loadstart="(event) => handleVideoEvent('loadstart', item)"
                        @loadeddata="(event) => handleVideoEvent('loadeddata', item)"
                        @canplay="(event) => handleVideoEvent('canplay', item)"
                      />
                    </template>
                  </div>
                  <div class="info-section">
                    <div class="info">
                      <div class="info-grid">
                        <template v-if="!item.isPlaying && item.latestRecord">
                          <div class="info-item">
                            <span class="label">车牌号码</span>
                            <span class="value">{{ item.latestRecord.plateNumber }}</span>
                          </div>
                          <div class="info-item">
                            <span class="label">通行时间</span>
                            <span class="value">{{ formatTime(item.latestRecord.passTime) }}</span>
                          </div>
                          <div class="info-item">
                            <span class="label">通行方向</span>
                            <span class="value">{{ item.latestRecord.direction }}</span>
                          </div>
                          <div class="info-item">
                            <span class="label">通行结果</span>
                            <span class="value" :class="item.latestRecord.accessState === '允许通行' ? 'success' : 'danger'">
                              {{ item.latestRecord.accessState }}
                            </span>
                          </div>
                          <div class="vehicle-image">
                            <el-image 
                              :src="item.latestRecord.plateImg"
                              :preview-src-list="[item.latestRecord.plateImg]"
                              fit="contain"
                              style="width: 100%; height: 80px;"
                              :initial-index="0"
                              :preview-teleported="true"
                              :hide-on-click-modal="false"
                            />
                          </div>
                        </template>
                        <template v-else>
                          <div class="video-logs">
                            <div class="log-title">播放日志</div>
                            <div class="log-content">
                              <p>开始时间: {{ item.startTime }}</p>
                              <p>摄像头: {{ item.entranceName }}</p>
                              <div class="log-events" v-if="item.playbackLogs && item.playbackLogs.length">
                                <p v-for="(log, index) in item.playbackLogs" :key="index" :class="log.type">
                                  {{ log.time }} - {{ log.message }}
                                </p>
                              </div>
                            </div>
                          </div>
                        </template>
                      </div>
                    </div>
                    <div class="actions">
                      <el-button v-if="item.isPlaying" type="warning"
                        @click="item.isPlaying = false; item.videoUrl = ''">
                        关闭视频
                      </el-button>
                      <el-button v-else type="primary" :icon="VideoPlay" :disabled="!item.isAlive"
                        @click="handlePlayVideo(item)">
                        播放视频
                      </el-button>
                      <el-button type="success" :icon="Open">开闸</el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>

      <!-- 底部统计区域 -->
      <div class="statistics">
        <!-- 实时状态监控部分 -->
        <div class="status-monitor">
          <div class="card-header">
            <span class="title">管控措施</span>
          </div>
          <div class="status-content">
            <div v-if="statusMonitorData.latestControl" class="control-info">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="预警等级">
                  <el-tag :type="getWarningLevelType(statusMonitorData.latestControl.warningLevel)">
                    {{ getWarningLevelText(statusMonitorData.latestControl.warningLevel) }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="响应等级">
                  <el-tag :type="getResponseLevelType(statusMonitorData.latestControl.responseLevel)">
                    {{ getResponseLevelText(statusMonitorData.latestControl.responseLevel) }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="管控时间" :span="2">
                  {{ statusMonitorData.latestControl.controlTime }}
                </el-descriptions-item>
                <el-descriptions-item label="管控措施" :span="2">
                  <div class="control-measures">
                    <template v-if="statusMonitorData.latestControl.controlMeasure">
                      <template v-if="/^\d+$/.test(statusMonitorData.latestControl.controlMeasure)">
                        {{ getMeasureText(statusMonitorData.latestControl.controlMeasure) }}
                      </template>
                      <template v-else>
                        <template
                          v-if="getVehicleTypes(statusMonitorData.latestControl.controlMeasure).length > 0 || getEmissionStandards(statusMonitorData.latestControl.controlMeasure).length > 0">
                          <div v-if="getVehicleTypes(statusMonitorData.latestControl.controlMeasure).length > 0"
                            class="measure-item">
                            <div class="measure-label">限行车辆类型：</div>
                            <div class="measure-content">{{
                              getVehicleTypes(statusMonitorData.latestControl.controlMeasure).join('、') }}</div>
                          </div>
                          <div v-if="getEmissionStandards(statusMonitorData.latestControl.controlMeasure).length > 0"
                            class="measure-item">
                            <div class="measure-label">限行排放阶段：</div>
                            <div class="measure-content">{{
                              getEmissionStandards(statusMonitorData.latestControl.controlMeasure).join('、') }}</div>
                          </div>
                        </template>
                        <template v-else>
                          {{ statusMonitorData.latestControl.controlMeasure }}
                        </template>
                      </template>
                    </template>
                  </div>
                </el-descriptions-item>
              </el-descriptions>
            </div>
            <div v-else class="empty-container">
              <el-empty description="暂无管控措施" />
            </div>
          </div>
        </div>

        <div class="chart-container">
          <div class="card-header">
            <span class="title">实时车辆统计</span>
            <el-button type="primary" link :icon="Refresh" @click="refreshData">刷新</el-button>
          </div>
          <div class="chart">
            <canvas ref="chartRef"></canvas>
          </div>
        </div>

        <div class="device-status">
          <div class="card-header">
            <span class="title">设备状态监控</span>
          </div>
          <div class="pie-chart">
            <canvas ref="pieChartRef"></canvas>
          </div>
        </div>

        <div class="control-info">
          <div class="card-header">
            <span class="title">通行管控示牌</span>
            <el-tag :type="getControlStatusType(controlInfo.status)">{{ controlInfo.status }}</el-tag>
          </div>
          <div class="info-content">
            <div class="info-grid">
              <div class="info-item">
                <span class="label">企业名称</span>
                <span class="value">{{ controlInfo.companyName }}</span>
              </div>
              <div class="info-item">
                <span class="label">企业标识</span>
                <span class="value">{{ controlInfo.identifier }}</span>
              </div>
              <div class="info-item">
                <span class="label">企业地址</span>
                <span class="value">{{ controlInfo.address }}</span>
              </div>
              <div class="info-item">
                <span class="label">法定代表人</span>
                <span class="value">{{ controlInfo.contact }}</span>
              </div>
              <div class="info-item">
                <span class="label">企业评级</span>
                <span class="value">{{ controlInfo.level }}</span>
              </div>
              <div class="info-item">
                <span class="label">行政区划</span>
                <span class="value">{{ controlInfo.region }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import Screenfull from '@/components/Screenfull'
import { Upload, Document, Open, Close, Warning, Refresh, VideoPlay } from '@element-plus/icons-vue'
import { ElNotification } from 'element-plus'
import { Chart } from 'chart.js/auto'
import { getCompanyInfo, isAlive, selectIds } from '@/api/system/info'
import { getCameraInfoByCompanyId } from '@/api/system/camera'
import { queryLatestControl } from '@/api/system/measure'
import { getLatestRecord, getstat } from '@/api/transit/record'
import { auth, getBaseUrl } from '@/api/system/gb28281'
import VideoPlayer from '@/components/VideoPlayer/index.vue'
export default {
  name: 'GatewayMonitor',
  components: {
    Screenfull,
    VideoPlayer
  },
  setup() {
    const currentTime = ref('')
    const phone = ref('')
    const chartRef = ref(null)
    const pieChartRef = ref(null)
    const deviceTimeRange = ref('today')
    const companyName = ref('')
    const loading = ref(false)
    let barChart = null
    let doughnutChart = null

    // 添加查询参数定义
    const queryParams = ref({
      pageNum: 1,
      pageSize: 10,
      companyId: null,
      gateId: null,
      identifier: null,
      cameraBrand: null,
      cameraModel: null,
      cameraSn: null,
      screenBrand: null,
      screenModel: null,
      screenSn: null,
      entranceNo: null,
      turnNo: null,
      ip: null,
      port: null,
      username: null,
      password: null,
      channels: null,
      captureType: null,
      entranceFlag: null,
      isValid: null,
      gateType: null,
      createdDate: null,
      updatedDate: null,
      vedioSrc: null,
      vedioReplay: null,
      cameraName: null,
      message: null,
      violationCamSn: null
    })

    // 添加状态监控数据
    const statusMonitorData = ref({
      online: true,
      warningLevel: 'red',
      warningMessage: '红色预警',
      lastUpdateTime: new Date().toLocaleString(),
      latestControl: null
    })

    // 模拟数据
    const monitorData = ref([])  // 清空初始数据
    const activeVideoUrl = ref('')
    const showVideo = ref(false)

    const controlInfo = ref({
      companyName: '',
      contact: '',
      phone: '',
      strategy: '',
      plateNumber: '',
      emissionPhase: '',
      passTime: '',
      status: '',
      transportCompany: ''
    })

    // 数据概览卡片数据
    const statsCards = ref([
      {
        title: '在线设备',
        value: '0',
        trend: 0,
        icon: 'TrendCharts',
        iconColor: 'text-blue-500'
      },
      {
        title: '离线设备',
        value: '0',
        trend: 0,
        icon: 'Monitor',
        iconColor: 'text-green-500'
      },
      {
        title: '企业在线状态',
        value: '0',
        trend: 0,
        icon: 'Warning',
        iconColor: 'text-yellow-500'
      },
      {
        title: '上报成功',
        value: '0',
        trend: 0,
        icon: 'CircleClose',
        iconColor: 'text-red-500'
      }
    ])

    const monitorDataChunks = computed(() => {
      const chunks = []
      for (let i = 0; i < monitorData.value.length; i += 2) {
        chunks.push(monitorData.value.slice(i, i + 2))
      }
      return chunks
    })

    // 添加新的响应式变量
    const showCompanySelector = ref(true)
    const selectedCompanyId = ref('')
    const companyList = ref([])

    const refreshInterval = ref(null) // 添加定时器引用

    // 获取公司列表
    const fetchCompanyList = async () => {
      try {
        const response = await selectIds()
        if (response.code === 200) {
          companyList.value = response.rows
          
          // 如果只有一个公司，自动选择它
          if (companyList.value.length === 1) {
            selectedCompanyId.value = companyList.value[0].companyId
            // 直接调用选择处理方法
            await handleCompanySelect()
          } else if (companyList.value.length > 1) {
            // 多个公司时显示选择对话框
            showCompanySelector.value = true
          } else {
            // 没有公司时显示提示
            ElNotification({
              title: '提示',
              message: '没有可用的公司数据',
              type: 'warning'
            })
          }
        } else {
          ElNotification({
            title: '错误',
            message: '获取公司列表失败',
            type: 'error'
          })
        }
      } catch (error) {
        console.error('获取公司列表失败:', error)
        ElNotification({
          title: '错误',
          message: '获取公司列表失败',
          type: 'error'
        })
      }
    }

    // 处理公司选择
    const handleCompanySelect = async () => {
      if (selectedCompanyId.value) {
        showCompanySelector.value = false
        
        // 等待 DOM 更新完成后再初始化图表
        await nextTick()
        
        // 先初始化图表
        initChart()
        initPieChart()
        
        // 然后获取数据
        await fetchCompanyInfo()
        await Promise.all([
          fetchLatestControl(),
          fetchStatData()
        ])

        // 启动自动刷新
        startAutoRefresh()
      }
    }

    // 验证并获取企业信息
    const fetchCompanyInfo = async () => {
      try {
        const response = await getCompanyInfo(selectedCompanyId.value)
        if (response.code === 200 && response.data) {
          const { companyName: name, address, legalRpst, identifier, region, level } = response.data
          companyName.value = name
          controlInfo.value = {
            ...controlInfo.value,
            companyName: name,
            contact: legalRpst,
            address: address,
            identifier: identifier,
            region: region,
            level: level
          }
          // 获取企业信息成功后，获取门禁信息
          await fetchGateInfo(selectedCompanyId.value)
        }
      } catch (error) {
        console.error('获取企业信息失败:', error)
        ElNotification({
          title: '错误',
          message: '获取企业信息失败',
          type: 'error'
        })
      }
    }

    // 获取门禁信息
    const fetchGateInfo = async (companyId) => {
      loading.value = true
      try {
        queryParams.value.companyId = companyId
        const response = await getCameraInfoByCompanyId(companyId)
        console.log('cameraInfo response', response)

        if (response.code === 200 && response.rows) {
          // 过滤掉 captureType 为 2 和 4 的相机
          const filteredCameras = response.rows.filter(camera => 
            camera.captureType !== '2' && camera.captureType !== '4'
          )
          
          // 构建 isAlive 请求参数
          const aliveRequestData = {
            enterpriseReqList: [{
              companyId: companyId,
              companyName: companyName.value,
              apiStrategy: null,
            }],
            cameraReqList: response.rows
          }

          // 获取设备在线状态
          const aliveResponse = await isAlive(aliveRequestData)
          const aliveStatusMap = new Map()

          if (Array.isArray(aliveResponse)) {
            // 先过滤出设备类型的数据（type === 2）
            const deviceStatuses = aliveResponse.filter(item => item.type === 2)

            // 存储设备状态
            deviceStatuses.forEach(item => {
              aliveStatusMap.set(item.name, item.status)
            })

            // 更新统计卡片数据
            const onlineDevices = deviceStatuses.filter(item => item.status).length
            const offlineDevices = deviceStatuses.filter(item => !item.status).length
            const enterpriseStatus = aliveResponse.find(item => item.type === 1)?.status || false

            // 更新统计卡片
            statsCards.value[0].value = onlineDevices
            statsCards.value[1].value = offlineDevices
            statsCards.value[2].value = enterpriseStatus ? '在线' : '离线'
            statsCards.value[2].iconColor = enterpriseStatus ? 'text-green-500' : 'text-red-500'
            statsCards.value[3].value = response.rows.length

            // 更新饼图数据
            if (doughnutChart) {
              console.log('更新饼图数据', [onlineDevices, offlineDevices])
              doughnutChart.data.datasets[0].data = [onlineDevices, offlineDevices]
              doughnutChart.update()
            } else {
              console.error('饼图实例不存在，重新初始化')
              await nextTick()
              initPieChart()
              if (doughnutChart) {
                doughnutChart.data.datasets[0].data = [onlineDevices, offlineDevices]
                doughnutChart.update()
              }
            }
          }

          // 保存当前正在播放视频的摄像头状态
          const playingCameras = new Map()
          monitorData.value.forEach(camera => {
            if (camera.isPlaying) {
              playingCameras.set(camera.cameraSn, {
                isPlaying: true,
                videoUrl: camera.videoUrl,
                startTime: camera.startTime,
                playbackLogs: camera.playbackLogs
              })
            }
          })

          // 处理每个摄像头的数据
          const processedCameras = await Promise.all(
            filteredCameras.map(async camera => {
              try {
                const recordResponse = await getLatestRecord(companyId, camera.cameraSn)
                let latestRecord = null
                console.log('recordResponse', recordResponse)
                if (recordResponse.code === 200 && recordResponse.data) {
                  latestRecord = {
                    plateNumber: recordResponse.data.plateNo,
                    passTime: recordResponse.data.recordTime,
                    direction: recordResponse.data.direction === 1 ? '进场' : '出场',
                    accessState: (() => {
                      switch (recordResponse.data.accessState) {
                        case '1':
                          return '自动抬杆';
                        case '0':
                          return '禁止通行';
                        case '-1':
                          return '手动抬杆';
                        case '-2':
                          return '无识别记录';
                        default:
                          return '未知状态';
                      }
                    })(),
                    plateImg: recordResponse.data.plateImg,
                    bodyImg: recordResponse.data.bodyImg
                  }
                }

                // 获取之前的播放状态
                const playingState = playingCameras.get(camera.cameraSn)

                return {
                  image: latestRecord?.bodyImg || '',
                  entranceName: camera.cameraName || '--',
                  status: camera.isValid === 1 ? '已认证' : '未认证',
                  ip: camera.ip,
                  port: camera.port,
                  username: camera.username,
                  vedioSrc: camera.vedioSrc,
                  vedioReplay: camera.vedioReplay,
                  identifier: camera.identifier,
                  cameraSn: camera.cameraSn,
                  turnNo: camera.turnNo,
                  entranceNo: camera.entranceNo,
                  captureType: camera.captureType,
                  entranceFlag: camera.entranceFlag,
                  deviceId: camera.deviceId,
                  channelId: camera.channelId,
                  latestRecord: latestRecord,
                  isAlive: aliveStatusMap.get(camera.cameraName) || false,
                  // 如果之前在播放,保持播放状态
                  isPlaying: playingState ? playingState.isPlaying : false,
                  videoUrl: playingState ? playingState.videoUrl : '',
                  startTime: playingState ? playingState.startTime : null,
                  playbackLogs: playingState ? playingState.playbackLogs : []
                }
              } catch (error) {
                console.error('处理摄像头数据失败:', error)
                // 获取之前的播放状态
                const playingState = playingCameras.get(camera.cameraSn)
                return {
                  entranceName: camera.cameraName || '--',
                  status: camera.isValid === 1 ? '已认证' : '未认证',
                  isAlive: aliveStatusMap.get(camera.cameraName) || false,
                  // 如果之前在播放,保持播放状态
                  isPlaying: playingState ? playingState.isPlaying : false,
                  videoUrl: playingState ? playingState.videoUrl : '',
                  startTime: playingState ? playingState.startTime : null,
                  playbackLogs: playingState ? playingState.playbackLogs : [],
                  latestRecord: null
                }
              }
            })
          )

          monitorData.value = processedCameras
        }
      } catch (error) {
        console.error('获取门禁信息失败:', error)
        ElNotification({
          title: '错误',
          message: '获取门禁信息失败',
          type: 'error'
        })
      } finally {
        loading.value = false
      }
    }

    // 摄像头28181认证
    const authenticateCameras = async (cameras) => {
      try {
        // 过滤出有效的摄像头（deviceId和channelId都存在的）
        const validCameras = cameras.filter(camera =>
          camera.deviceId && camera.channelId && camera.isValid === 1
        );

        // 对每个有效的摄像头进行认证
        const authPromises = validCameras.map(async camera => {
          try {
            const authResponse = await auth(camera.deviceId, camera.channelId);
            console.log(`摄像头 ${camera.cameraName} 认证结果:`, authResponse);
            return {
              cameraName: camera.cameraName,
              success: authResponse.code === 200,
              message: authResponse.msg
            };
          } catch (error) {
            console.error(`摄像头 ${camera.cameraName} 认证失败:`, error);
            return {
              cameraName: camera.cameraName,
              success: false,
              message: error.message || '认证失败'
            };
          }
        });

        const authResults = await Promise.all(authPromises);

        // 打印认证结果
        authResults.forEach(result => {
          if (!result.success) {
            console.warn(`摄像头 ${result.cameraName} 认证失败: ${result.message}`);
          }
        });

      } catch (error) {
        console.error('摄像头认证过程发生错误:', error);
      }
    }

    // 刷新数据
    const refreshData = async () => {
      if (selectedCompanyId.value) {
        try {
          await Promise.all([
            fetchGateInfo(selectedCompanyId.value),
            fetchLatestControl(),
            fetchStatData()
          ])
          console.log('数据刷新成功:', new Date().toLocaleString())
        } catch (error) {
          console.error('数据刷新失败:', error)
        }
      }
    }

    // 添加启动定时刷新的方法
    const startAutoRefresh = () => {
      // 清除可能存在的旧定时器
      if (refreshInterval.value) {
        clearInterval(refreshInterval.value)
      }
      // 设置新的定时器，每30秒刷新一次
      refreshInterval.value = setInterval(refreshData, 30000)
      console.log('启动自动刷新')
    }

    // 更新时间
    const updateTime = () => {
      const now = new Date()
      currentTime.value = now.toLocaleString()
    }

    // 初始化柱状图
    const initChart = () => {
      if (chartRef.value) {
        const ctx = chartRef.value.getContext('2d')
        if (barChart) {
          barChart.destroy()
          barChart = null
        }
        try {
          barChart = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: ['今日通行', '今日入场', '今日出场', '上报成功', '上报失败', '手动抬杆', '备案车辆'],
              datasets: [{
                data: [0, 0, 0, 0, 0, 0, 0],
                backgroundColor: '#1890ff',
                borderWidth: 0
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }
          })
        } catch (error) {
          console.error('初始化柱状图失败:', error)
        }
      }
    }

    // 初始化饼图
    const initPieChart = () => {
      console.log('初始化饼图', pieChartRef.value)
      if (pieChartRef.value) {
        const ctx = pieChartRef.value.getContext('2d')
        if (doughnutChart) {
          console.log('销毁旧的饼图')
          doughnutChart.destroy()
          doughnutChart = null
        }
        try {
          console.log('创建新的饼图')
          doughnutChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
              labels: ['相机在线', '相机离线'],
              datasets: [{
                data: [0, 0],
                backgroundColor: [
                  '#67C23A',
                  '#F56C6C'
                ],
                borderWidth: 0
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              cutout: '70%',
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    boxWidth: 15,
                    padding: 15
                  }
                }
              }
            }
          })
          console.log('饼图创建成功', doughnutChart)
        } catch (error) {
          console.error('初始化饼图失败:', error)
        }
      } else {
        console.error('找不到饼图 canvas 元素')
      }
    }

    // 获取最新管控信息
    const fetchLatestControl = async () => {
      if (!selectedCompanyId.value) return

      try {
        const response = await queryLatestControl(selectedCompanyId.value)
        if (response.code === 200 && response.data) {
          const { warningLevel, responseLevel, controlMeasure, startTime, endTime } = response.data
          statusMonitorData.value.latestControl = {
            warningLevel,
            responseLevel,
            controlTime: `${startTime} 至 ${endTime}`,
            controlMeasure
          }
          statusMonitorData.value.online = true
        }
      } catch (error) {
        console.error('获取最新管控信息失败:', error)
        statusMonitorData.value.online = false
      }
    }

    // 添加获取统计数据的方法
    const fetchStatData = async () => {
      if (!selectedCompanyId.value) return

      try {
        const response = await getstat(selectedCompanyId.value)
        if (response.code === 200 && response.data) {
          const {
            totalVehiclesToday = 0,
            inboundCount = 0,
            outboundCount = 0,
            inboundCertSuccessCount = 0,
            outboundCertSuccessCount = 0,
            manualLiftCount = 0,
            vehiclesAddedToday = 0
          } = response.data

          // 更新柱状图数据
          if (barChart) {
            barChart.data.datasets[0].data = [
              totalVehiclesToday,
              inboundCount,
              outboundCount,
              inboundCertSuccessCount + outboundCertSuccessCount,
              totalVehiclesToday - (inboundCertSuccessCount + outboundCertSuccessCount),
              manualLiftCount,
              vehiclesAddedToday
            ]
            barChart.update()
          }

          // 更新统计卡片数据
          statsCards.value[3].value = inboundCertSuccessCount + outboundCertSuccessCount
        }
      } catch (error) {
        console.error('获取统计数据失败:', error)
      }
    }

    const getControlStatusType = (status) => {
      const statusMap = {
        '允许通行': 'success',
        '禁止通行': 'danger',
        '限制通行': 'warning'
      }
      return statusMap[status] || 'info'
    }

    // 获取预警等级文本
    const getWarningLevelText = (level) => {
      const levels = {
        '1': '一级预警',
        '2': '二级预警',
        '3': '三级预警',
        '4': '四级预警',
        '5': '五级预警'
      }
      return levels[level] || `${level}级预警`
    }

    // 获取预警等级类型
    const getWarningLevelType = (level) => {
      const types = {
        '1': 'danger',
        '2': 'danger',
        '3': 'warning',
        '4': 'warning',
        '5': 'info'
      }
      return types[level] || ''
    }

    // 获取响应等级文本
    const getResponseLevelText = (level) => {
      const levels = {
        '1': '一级响应',
        '2': '二级响应',
        '3': '三级响应',
        '4': '四级响应',
        '5': '五级响应'
      }
      return levels[level] || `${level}级响应`
    }

    // 获取响应等级类型
    const getResponseLevelType = (level) => {
      const types = {
        '1': 'danger',
        '2': 'warning',
        '3': 'info'
      }
      return types[level] || ''
    }

    // 获取管控措施文本
    const getMeasureText = (measure) => {
      const measureMap = {
        '1': '重污染天气应急响应',
        '2': '季节性管控',
        '3': '错峰生产管控',
        '4': '其他管控'
      }
      return measureMap[measure] || '常规管控'
    }

    // 获取车辆类型
    const getVehicleTypes = (controlMeasure) => {
      try {
        const measureObj = JSON.parse(controlMeasure);
        return measureObj.vehicleTypes || [];
      } catch (e) {
        return [];
      }
    }

    // 获取排放标准
    const getEmissionStandards = (controlMeasure) => {
      try {
        const measureObj = JSON.parse(controlMeasure);
        return measureObj.emissionStandards || [];
      } catch (e) {
        return [];
      }
    }

    // 修改handlePlayVideo方法
    const handlePlayVideo = async (camera) => {
      console.log('点击播放按钮，摄像头信息:', {
        deviceId: camera.deviceId,
        channelId: camera.channelId,
        isAlive: camera.isAlive,
        entranceName: camera.entranceName
      });

      try {
        if (!camera.deviceId || !camera.channelId) {
          console.log('摄像头缺少必要参数:', {
            deviceId: camera.deviceId,
            channelId: camera.channelId
          });
          ElNotification({
            title: '错误',
            message: '该摄像头不支持视频播放',
            type: 'error'
          })
          return
        }

        if (!camera.isAlive) {
          console.log('摄像头不在线');
          ElNotification({
            title: '警告',
            message: '摄像头当前不在线',
            type: 'warning'
          })
          return
        }

        console.log('开始认证请求...');
        const authResponse = await auth(camera.deviceId, camera.channelId)
        console.log('认证响应:', authResponse);

        if (authResponse.code === 200) {
          const baseUrlResponse = await getBaseUrl()
          console.log('基础URL:', baseUrlResponse);

          const token = authResponse.data.genericToken || authResponse.data.accessTokenJK || '';
          console.log('使用token:', token);

          if (!token) {
            ElNotification({
              title: '错误',
              message: '无法获取有效的token',
              type: 'error'
            })
            return;
          }

          const url = baseUrlResponse.data + camera.deviceId + '/' + camera.channelId + '?source=1&format=fmp4&access_token=' + token;
          console.log('最终视频URL:', url);

          const index = monitorData.value.findIndex(item =>
            item.deviceId === camera.deviceId && item.channelId === camera.channelId
          );

          if (index !== -1) {
            monitorData.value[index] = {
              ...monitorData.value[index],
              videoUrl: url,
              isPlaying: true,
              startTime: new Date().toLocaleString(),
              playbackLogs: []
            };
          }
        } else {
          console.log('认证失败:', authResponse);
          ElNotification({
            title: '错误',
            message: authResponse.msg || '视频播放认证失败',
            type: 'error'
          })
        }
      } catch (error) {
        console.error('视频播放失败:', error)
        ElNotification({
          title: '错误',
          message: '视频播放失败',
          type: 'error'
        })
      }
    }

    // 添加视频事件处理方法
    const handleVideoEvent = (eventType, camera) => {
      const index = monitorData.value.findIndex(item =>
        item.deviceId === camera.deviceId && item.channelId === camera.channelId
      );

      if (index !== -1) {
        const eventMessages = {
          play: '开始播放',
          pause: '暂停播放',
          waiting: '正在缓冲',
          playing: '正在播放',
          loadstart: '开始加载',
          loadeddata: '数据加载完成',
          canplay: '可以播放'
        };

        const log = {
          time: new Date().toLocaleTimeString(),
          type: eventType,
          message: eventMessages[eventType] || eventType
        };

        if (!monitorData.value[index].playbackLogs) {
          monitorData.value[index].playbackLogs = [];
        }

        monitorData.value[index].playbackLogs.push(log);

        // 保持最新的10条日志
        if (monitorData.value[index].playbackLogs.length > 10) {
          monitorData.value[index].playbackLogs.shift();
        }
      }
    }

    // 修改视频错误处理方法
    const handleVideoError = (error, item) => {
      console.error('视频播放错误:', error)
      
      // 添加错误日志
      item.playbackLogs.push({
        time: new Date().toLocaleString(),
        message: `播放错误: ${error.message || '未知错误'}`,
        type: 'error'
      })

      // 如果是 AbortError，记录日志但不做其他处理
      if (error.name === 'AbortError') {
        item.playbackLogs.push({
          time: new Date().toLocaleString(),
          message: '检测到省电模式中断',
          type: 'warning'
        })
      }
    }

    // 添加时间格式化方法
    const formatTime = (timeStr) => {
      if (!timeStr) return '--'
      try {
        const date = new Date(timeStr)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        const seconds = String(date.getSeconds()).padStart(2, '0')
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
      } catch (error) {
        return timeStr
      }
    }

    onMounted(() => {
      fetchCompanyList()
      updateTime()
      setInterval(updateTime, 1000)
    })

    // 添加组件卸载时的清理
    onUnmounted(() => {
      // 清除定时器
      if (refreshInterval.value) {
        clearInterval(refreshInterval.value)
        refreshInterval.value = null
        console.log('清除自动刷新定时器')
      }
    })

    return {
      currentTime,
      phone,
      monitorData,
      monitorDataChunks,
      controlInfo,
      chartRef,
      pieChartRef,
      statsCards,
      deviceTimeRange,
      refreshData,
      getControlStatusType,
      statusMonitorData,
      Upload,
      Document,
      Open,
      Close,
      Warning,
      Refresh,
      VideoPlay,
      companyName,
      getWarningLevelText,
      getWarningLevelType,
      getResponseLevelText,
      getResponseLevelType,
      loading,
      queryParams,
      getMeasureText,
      getVehicleTypes,
      getEmissionStandards,
      handlePlayVideo,
      activeVideoUrl,
      showVideo,
      handleVideoEvent,
      handleVideoError,
      showCompanySelector,
      selectedCompanyId,
      companyList,
      handleCompanySelect,
      formatTime
    }
  }
}
</script>

<style scoped>
.gateway-monitor {
  height: 100vh;
  background: #f0f2f5;
  padding: 20px;
  color: #333;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.gateway-monitor .stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
  margin-top: 30px;
  height: 10vh;
}

.gateway-monitor .stats-cards .stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.gateway-monitor .stats-cards .stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.gateway-monitor .stats-cards .stat-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.gateway-monitor .stats-cards .stat-card .card-header .card-title {
  color: #666;
  font-size: 14px;
}

.gateway-monitor .stats-cards .stat-card .card-value {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.gateway-monitor .stats-cards .stat-card .card-value .number {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.gateway-monitor .stats-cards .stat-card .card-value .trend.up {
  color: #67c23a;
}

.gateway-monitor .stats-cards .stat-card .card-value .trend.down {
  color: #f56c6c;
}

.gateway-monitor .stats-cards .stat-card .card-value .text-success {
  color: #67C23A;
}

.gateway-monitor .stats-cards .stat-card .card-value .text-danger {
  color: #F56C6C;
}

.gateway-monitor .center-title {
  position: absolute;
  left: 50%;
  top: 20px;
  transform: translateX(-50%);
  z-index: 10;
}

.gateway-monitor .center-title .title {
  font-size: 32px;
  font-weight: 600;
  color: #1890ff;
  white-space: nowrap;
  letter-spacing: 2px;
}

.gateway-monitor .header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.gateway-monitor .header .left .time {
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.gateway-monitor .header .right {
  display: flex;
  align-items: center;
  gap: 20px;
  justify-content: flex-end;
}

.gateway-monitor .header .right .phone {
  font-size: 18px;
  color: #333;
}

.gateway-monitor .header .right .system {
  font-size: 18px;
  color: #666;
}

.gateway-monitor .header .right .right-menu-item {
  padding: 0 8px;
  font-size: 20px;
  color: #1890ff;
  vertical-align: text-bottom;
}

.gateway-monitor .header .right .right-menu-item.hover-effect {
  cursor: pointer;
  transition: all .3s;
}

.gateway-monitor .header .right .right-menu-item.hover-effect:hover {
  background: none;
  color: #40a9ff;
}

.gateway-monitor .content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.gateway-monitor .content .monitor-cards {
  margin-bottom: 20px;
  height: 35vh;
}

.gateway-monitor .content .monitor-cards :deep(.el-carousel__container) {
  height: 100%;
}

.gateway-monitor .content .monitor-cards :deep(.el-carousel__indicators) {
  bottom: -25px;
}

.gateway-monitor .content .monitor-cards .carousel-content {
  height: 100%;
  display: flex;
  gap: 20px;
  padding: 0 10px;
}

.gateway-monitor .content .monitor-cards .card {
  flex: 1;
  background: #fff;
  border-radius: 4px;
  padding: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.gateway-monitor .content .monitor-cards .card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 8px;
}

.gateway-monitor .content .monitor-cards .card .card-header .card-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.gateway-monitor .content .monitor-cards .card .card-content {
  flex: 1;
  display: flex;
  gap: 8px;
  min-height: 0;
  position: relative;
  overflow: hidden;
  height: 100%;
  justify-self: center;
}

.gateway-monitor .content .monitor-cards .card .card-content .image-section {
  height: 100%;
  aspect-ratio: 16/9;
  position: relative;
  background: #000;
  border-radius: 4px;
  overflow: hidden;
  min-width: 320px;
}

.gateway-monitor .content .monitor-cards .card .card-content .image-section img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.gateway-monitor .content .monitor-cards .card .card-content .image-section :deep(.video-player) {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gateway-monitor .content .monitor-cards .card .card-content .image-section :deep(.video-player .video-js) {
  width: 100% !important;
  height: 100% !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gateway-monitor .content .monitor-cards .card .card-content .image-section :deep(.video-player video) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gateway-monitor .content .monitor-cards .card .card-content .image-section :deep(.video-player .vjs-control-bar) {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  background-color: rgba(43, 51, 63, 0.9);
  visibility: visible !important;
  opacity: 1 !important;
  display: flex !important;
  z-index: 2;
}

.gateway-monitor .content .monitor-cards .card .card-content .image-section :deep(.video-player .vjs-progress-control) {
  position: absolute;
  bottom: 38px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: rgba(255, 255, 255, 0.2);
  visibility: visible !important;
  opacity: 1 !important;
  display: block !important;
  transition: height 0.2s;
  z-index: 2;
}

.gateway-monitor .content .monitor-cards .card .card-content .image-section :deep(.video-player .vjs-progress-control:hover) {
  height: 4px;
}

.gateway-monitor .content .monitor-cards .card .card-content .image-section :deep(.video-player .vjs-progress-holder) {
  margin: 0;
  height: 100%;
}

.gateway-monitor .content .monitor-cards .card .card-content .image-section :deep(.video-player .vjs-text-track-display) {
  pointer-events: none;
}

.gateway-monitor .content .monitor-cards .card .card-content .image-section :deep(.video-player .vjs-button) {
  height: 40px;
  width: 40px;
  margin: 0;
  padding: 0;
  line-height: 40px;
  text-align: center;
}

.gateway-monitor .content .monitor-cards .card .card-content .image-section :deep(.video-player .vjs-big-play-button) {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: none;
  width: 60px;
  height: 60px;
  line-height: 60px;
  border-radius: 50%;
  background-color: rgba(43, 51, 63, 0.9);
  font-size: 24px;
}

.gateway-monitor .content .monitor-cards .card .card-content .image-section :deep(.video-player .vjs-volume-panel) {
  margin-right: 10px;
}

.gateway-monitor .content .monitor-cards .card .card-content .image-section :deep(.video-player .vjs-menu-button-popup .vjs-menu) {
  bottom: 40px;
}

.gateway-monitor .content .monitor-cards .card .card-content .image-section :deep(.video-player .vjs-loading-spinner) {
  border: 3px solid rgba(255, 255, 255, 0.7);
}

.gateway-monitor .content .monitor-cards .card .card-content .image-section .image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1;
}

.gateway-monitor .content .monitor-cards .card .card-content .image-section .image-overlay .time-badge {
  color: #fff;
  font-size: 12px;
}

.gateway-monitor .content .monitor-cards .card .card-content .info-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 240px;
  padding: 8px;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.gateway-monitor .content .monitor-cards .card .card-content .info-section .info {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.gateway-monitor .content .monitor-cards .card .card-content .info-section .info .info-grid {
  display: flex;
  flex-direction: column;
  gap: 4px;
  height: 100%;
}

.gateway-monitor .content .monitor-cards .card .card-content .info-section .info .info-grid .info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 0;
  border-bottom: 1px solid #f0f0f0;
  min-height: 24px;
}

.gateway-monitor .content .monitor-cards .card .card-content .info-section .info .info-grid .info-item .label {
  color: #909399;
  font-size: 12px;
  white-space: nowrap;
}

.gateway-monitor .content .monitor-cards .card .card-content .info-section .info .info-grid .info-item .value {
  color: #303133;
  font-size: 12px;
  font-weight: 500;
  text-align: right;
}

.gateway-monitor .content .monitor-cards .card .card-content .info-section .info .info-grid .vehicle-image {
  margin-top: 4px;
  padding: 4px 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.gateway-monitor .content .monitor-cards .card .card-content .info-section .info .info-grid .vehicle-image .el-image {
  width: 100%;
  height: 80px;
  border-radius: 2px;
  overflow: hidden;
}

.gateway-monitor .content .monitor-cards .card .card-content .info-section .actions {
  margin-top: 4px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
}

.gateway-monitor .content .monitor-cards .card .card-content .info-section .actions .el-button {
  height: 24px;
  font-size: 12px;
}

.gateway-monitor .content .monitor-cards .card .card-content .info-section .actions .el-button.el-button--primary {
  background: #409eff;
}

.gateway-monitor .content .monitor-cards .card .card-content .info-section .actions .el-button.el-button--success {
  background: #67c23a;
}

.gateway-monitor .content .monitor-cards .card .card-content .info-section .actions .el-button.el-button--danger {
  background: #f56c6c;
}

.gateway-monitor .content .monitor-cards .card .card-content .info-section .actions .el-button:deep(.el-icon) {
  margin-right: 4px;
}

.gateway-monitor .content .monitor-cards .card .card-content .info-section .actions .el-button:hover {
  opacity: 0.9;
}

.gateway-monitor .content .statistics {
  height: 40vh;
  display: grid;
  grid-template-columns: 25% 30% 16.4% 25%;
  gap: 20px;
}

.gateway-monitor .content .statistics >div {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.gateway-monitor .content .statistics >div .card-header {
  padding-bottom: 8px;
  margin-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.gateway-monitor .content .statistics >div .chart,
.gateway-monitor .content .statistics >div .pie-chart {
  flex: 1;
  height: calc(100% - 40px);
}

.gateway-monitor .content .statistics >div .info-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 12px;
}

.gateway-monitor .content .statistics >div .info-content .info-grid {
  display: grid;
  grid-template-columns: 1fr;
  padding: 8px 0;
}

.gateway-monitor .content .statistics >div .info-content .info-grid .info-item {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  min-height: 32px;
  border-bottom: 1px solid #f5f5f5;
  padding: 6px 0;
}

.gateway-monitor .content .statistics >div .info-content .info-grid .info-item .label {
  color: #999;
  font-size: 14px;
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 80px;
  line-height: 1.4;
}

.gateway-monitor .content .statistics >div .info-content .info-grid .info-item .value {
  color: #333;
  font-size: 14px;
  text-align: right;
  padding-left: 12px;
  flex: 1;
  line-height: 1.4;
  white-space: normal;
  word-break: break-all;
}

.gateway-monitor .status-monitor {
  .status-content {
    padding: 12px;
    position: relative;
    min-height: 200px;
  }

  .status-content .control-info :deep(.el-descriptions) {
    margin-bottom: 0;
  }

  .status-content .control-info :deep(.el-descriptions .el-descriptions__cell) {
    padding: 8px;
  }

  .status-content .control-info .control-measures {
    white-space: normal;
    word-break: break-all;
    line-height: 1.4;
  }

  .status-content .control-info .control-measures .measure-item {
    display: flex;
    margin-bottom: 8px;
  }

  .status-content .control-info .control-measures .measure-item:last-child {
    margin-bottom: 0;
  }

  .status-content .control-info .control-measures .measure-item .measure-label {
    color: #909399;
    font-size: 14px;
    margin-right: 8px;
    white-space: nowrap;
  }

  .status-content .control-info .control-measures .measure-item .measure-content {
    color: #303133;
    flex: 1;
  }

  .status-content .empty-container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    text-align: center;
  }

  @media screen and (max-width: 768px) {
    .status-content {
      padding: 8px;
    }

    .status-content :deep(.el-descriptions__cell) {
      padding: 6px !important;
    }

    .status-content .control-measures {
      font-size: 12px;
    }

    .status-content .control-measures .measure-item {
      margin-bottom: 6px;
    }

    .status-content .control-measures .measure-item .measure-label {
      font-size: 12px;
    }
  }
}

.gateway-monitor .card-header {
  .header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .header-actions .status-tag {
    margin-right: 4px;
  }

  .header-actions .el-button {
    padding: 4px 8px;
  }
}

.gateway-monitor .video-logs {
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-top: 10px;
}

.gateway-monitor .video-logs .log-title {
  font-size: 14px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.gateway-monitor .video-logs .log-content {
  font-size: 12px;
  color: #606266;
}

.gateway-monitor .video-logs .log-content p {
  margin: 4px 0;
  line-height: 1.4;
  word-break: break-all;
}

.gateway-monitor .content .monitor-cards .card .card-content .info-section .video-logs .log-events {
  margin-top: 8px;
  max-height: 150px;
  overflow-y: auto;
}

.gateway-monitor .content .monitor-cards .card .card-content .info-section .video-logs .log-events p {
  margin: 4px 0;
  padding: 2px 4px;
  border-radius: 2px;
  font-size: 12px;
  line-height: 1.4;
}

.gateway-monitor .content .monitor-cards .card .card-content .info-section .video-logs .log-events p.error {
  color: #f56c6c;
  background-color: #fef0f0;
}

.gateway-monitor .content .monitor-cards .card .card-content .info-section .video-logs .log-events p.waiting {
  color: #e6a23c;
  background-color: #fdf6ec;
}

.gateway-monitor .content .monitor-cards .card .card-content .info-section .video-logs .log-events p.playing {
  color: #67c23a;
  background-color: #f0f9eb;
}

.gateway-monitor .content .monitor-cards .card .card-content .info-section .video-logs .log-events p.loadstart,
.gateway-monitor .content .monitor-cards .card .card-content .info-section .video-logs .log-events p.loadeddata,
.gateway-monitor .content .monitor-cards .card .card-content .info-section .video-logs .log-events p.canplay {
  color: #409eff;
  background-color: #ecf5ff;
}

/* 添加新的样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}
</style>