<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span class="title">MQTT消息发送测试</span>
            </div>
          </template>
          <el-form ref="mqttForm" :model="form" :rules="rules" label-width="100px">
            <el-form-item label="主题" prop="topic">
              <el-input v-model="form.topic" placeholder="请输入MQTT主题" />
            </el-form-item>
            <el-form-item label="消息内容" prop="message">
              <el-input v-model="form.message" type="textarea" :rows="7" placeholder="请输入消息内容" />
            </el-form-item>
            <el-form-item label="QoS级别" prop="qos">
              <el-select v-model="form.qos" placeholder="请选择QoS级别">
                <el-option label="QoS 0 - 最多发送一次" :value="0" />
                <el-option label="QoS 1 - 至少发送一次" :value="1" />
                <el-option label="QoS 2 - 确保只发送一次" :value="2" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSend">发送消息</el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <el-col :span="8">
        <!-- 添加实时消息监控卡片 -->
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <el-row>
                <el-col :span="24">
                  <span class="title">MQTT实时消息监控</span>
                </el-col>

                <el-col :span="16">
                  <div class="header-right">
                    <el-input v-model="monitorTopic" placeholder="输入要监控的主题，支持通配符(+,#,*)"
                      style="width: 500px; margin-right: 10px;" @keyup.enter="connectSSE">
                      <template #prefix>
                        <el-icon>
                          <Connection />
                        </el-icon>
                      </template>
                    </el-input>
                    <el-tooltip effect="dark" placement="top" :show-after="500">
                      <template #content>
                        <div class="wildcard-tooltip">
                          <h3 class="tooltip-title">支持的通配符</h3>
                          <div class="wildcard-item">
                            <div class="wildcard-symbol">+</div>
                            <div class="wildcard-desc">
                              <div class="desc-title">单层匹配</div>
                              <div class="desc-example">
                                匹配一个层级，如：
                                <code>device/+/temp</code> → <code>device/001/temp</code>
                              </div>
                            </div>
                          </div>
                          <div class="wildcard-item">
                            <div class="wildcard-symbol">#</div>
                            <div class="wildcard-desc">
                              <div class="desc-title">多层匹配</div>
                              <div class="desc-example">
                                匹配多个层级，如：
                                <code>device/#</code> → <code>device/001/temp</code>
                              </div>
                            </div>
                          </div>
                          <div class="wildcard-item">
                            <div class="wildcard-symbol">*</div>
                            <div class="wildcard-desc">
                              <div class="desc-title">字符匹配</div>
                              <div class="desc-example">
                                匹配任意字符，如：
                                <code>device/*.*</code> → <code>device/abc.txt</code>
                              </div>
                            </div>
                          </div>
                          <div class="example-section">
                            <h4 class="example-title">常用示例</h4>
                            <div class="example-list">
                              <code>device/+/up/snapshot</code>
                              <code>device/#</code>
                              <code>sensor/+/temp/#</code>
                            </div>
                          </div>
                        </div>
                      </template>
                      <el-icon class="help-icon">
                        <QuestionFilled />
                      </el-icon>
                    </el-tooltip>
                    <div class="control-buttons">
                      <el-button :type="sseConnected ? 'danger' : 'primary'"
                        :class="['monitor-btn', sseConnected ? 'is-connected' : '']" size="small"
                        @click="sseConnected ? disconnectSSE() : connectSSE()">
                        <el-icon>
                          <component :is="sseConnected ? 'Close' : 'Link'" />
                        </el-icon>
                        <span>{{ sseConnected ? '断开' : '监控' }}</span>
                      </el-button>

                      <el-button type="info" class="clear-btn" size="small" :disabled="!messages.length"
                        @click="clearMessages">
                        <el-icon>
                          <Delete />
                        </el-icon>
                        <span>清空</span>
                      </el-button>
                    </div>
                  </div>
                </el-col>
              </el-row>
            </div>

          </template>

          <div class="message-container">
            <div v-if="messages.length === 0" class="no-message">
              <el-empty description="暂无消息">
                <template #image>
                  <el-icon :size="60" color="#909399">
                    <Message />
                  </el-icon>
                </template>
              </el-empty>
            </div>
            <div v-else class="message-list">
              <div v-for="(msg, index) in messages" :key="index" class="message-item">
                <div class="message-header">
                  <div class="message-header-left">
                    <el-tag size="small" type="info">{{ msg.topic || monitorTopic }}</el-tag>
                    <el-button type="primary" link size="small" @click="copyMessage(msg.content)">
                      <el-icon>
                        <DocumentCopy />
                      </el-icon>
                      复制
                    </el-button>
                  </div>
                  <div class="message-header-right">
                    <span class="message-time">{{ msg.time }}</span>
                  </div>
                </div>
                <div class="message-content">{{ msg.content }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span class="title">MQTT处理器信息</span>
              <el-button type="primary" link @click="refreshHandlers">
                <el-icon>
                  <Refresh />
                </el-icon>
                刷新
              </el-button>
            </div>
          </template>
          <el-table v-loading="loading" :data="handlersList" style="width: 100%">
            <el-table-column label="主题" prop="topic" show-overflow-tooltip>
              <template #default="scope">
                <el-button type="primary" link @click="setTestTopic(scope.row.topic)">
                  {{ scope.row.topic }}
                </el-button>
              </template>
            </el-table-column>
            <el-table-column label="处理器" prop="handler" show-overflow-tooltip />
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="box-card mt20">
      <template #header>
        <div class="card-header">
          <span class="title">MQTT客户端列表</span>
          <div class="header-right">
            <el-button type="primary" link @click="refreshClients">
              <el-icon>
                <Refresh />
              </el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
        <el-form-item label="客户端ID" prop="likeClientid">
          <el-input v-model="queryParams.likeClientid" placeholder="模糊搜索客户端ID" clearable style="width: 200px"
            @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="用户名" prop="likeUsername">
          <el-input v-model="queryParams.likeUsername" placeholder="模糊搜索用户名" clearable style="width: 200px"
            @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="IP地址" prop="ipAddress">
          <el-input v-model="queryParams.ipAddress" placeholder="请输入IP地址" clearable style="width: 200px"
            @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="连接状态" prop="connState">
          <el-select v-model="queryParams.connState" placeholder="请选择连接状态" clearable style="width: 200px">
            <el-option label="已连接" :value="'true'" />
            <el-option label="已断开" :value="'false'" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="clientsLoading" :data="clientsList">
        <el-table-column label="客户端ID" prop="clientid" show-overflow-tooltip />
        <el-table-column label="用户名" prop="username" show-overflow-tooltip />
        <el-table-column label="IP地址" prop="ip_address" width="130" />
        <el-table-column label="连接状态" prop="connected" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.connected ? 'success' : 'danger'">
              {{ scope.row.connected ? '已连接' : '已断开' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="协议版本" prop="proto_ver" width="100" />
        <el-table-column label="协议名称" prop="proto_name" width="100" />
        <el-table-column label="Clean Start" prop="clean_start" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.clean_start ? 'primary' : 'info'">
              {{ scope.row.clean_start ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="连接时间" prop="connected_at" width="180">
          <template #default="scope">
            {{ parseTime(scope.row.connected_at) }}
          </template>
        </el-table-column>
        <el-table-column label="Keep Alive" prop="keepalive" width="100" />
        <el-table-column label="订阅数量" prop="subscriptions_cnt" width="100" />
        <el-table-column label="接收消息数" prop="recv_msg" width="100" />
        <el-table-column label="发送消息数" prop="send_msg" width="100" />
        <el-table-column label="操作" width="180" align="center">
          <template #default="scope">
            <el-button type="danger" plain size="small" @click="handleBan(scope.row)" v-if="scope.row.connected">
              <el-icon style="margin-right: 4px">
                <CircleClose />
              </el-icon>
              加入黑名单
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.page" v-model:limit="queryParams.limit"
        @pagination="getClientList" />
    </el-card>
    <el-card class="box-card mt20">
      <template #header>
        <div class="card-header">
          <span class="title">MQTT黑名单列表</span>
          <div class="header-right">
            <el-button type="primary" link @click="refreshBannedList">
              <el-icon>
                <Refresh />
              </el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <el-table v-loading="bannedLoading" :data="bannedList">
        <el-table-column label="禁止对象" prop="who" show-overflow-tooltip />
        <el-table-column label="禁止方式" prop="as" width="120">
          <template #default="scope">
            <el-tag :type="getBanTypeTag(scope.row.as)">
              {{ getBanTypeText(scope.row.as) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作人" prop="by" width="120" />
        <el-table-column label="禁止原因" prop="reason" show-overflow-tooltip />
        <el-table-column label="禁止时间" prop="at" width="180">
          <template #default="scope">
            {{ parseTime(scope.row.at) }}
          </template>
        </el-table-column>
        <el-table-column label="结束时间" prop="until" width="180">
          <template #default="scope">
            {{ parseTime(scope.row.until) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template #default="scope">
            <el-tooltip content="解除对该客户端的禁止" placement="top" :hide-after="2000">
              <el-button type="primary" plain size="small" @click="handleUnban(scope.row)">
                <el-icon style="margin-right: 4px">
                  <RemoveFilled />
                </el-icon>
                解除禁止
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="bannedTotal > 0" :total="bannedTotal" v-model:page="bannedQuery.page"
        v-model:limit="bannedQuery.limit" @pagination="getBannedList" />
    </el-card>
  </div>
</template>

<script setup name="Mqtt">
import { getCurrentInstance, ref, onBeforeUnmount } from 'vue';
import {
  Refresh,
  CircleClose,
  RemoveFilled,
  QuestionFilled,
  Connection,
  Delete,
  Message,
  DocumentCopy
} from '@element-plus/icons-vue';
import request from '@/utils/request';
import { parseTime } from '@/utils/ruoyi';
import { ElNotification } from 'element-plus';

const { proxy } = getCurrentInstance();

const loading = ref(false);
const clientsLoading = ref(false);
const showSearch = ref(true);
const total = ref(0);

const form = ref({
  topic: '',
  message: '',
  qos: 1
});

const queryParams = ref({
  page: 1,
  limit: 10,
  node: undefined,
  username: undefined,
  ipAddress: undefined,
  connState: undefined,
  cleanStart: undefined,
  protoVer: undefined,
  likeClientid: undefined,
  likeUsername: undefined
});

const rules = {
  topic: [
    { required: true, message: '请输入MQTT主题', trigger: 'blur' }
  ],
  message: [
    { required: true, message: '请输入消息内容', trigger: 'blur' }
  ]
};

const handlersList = ref([]);
const clientsList = ref([]);

const bannedLoading = ref(false);
const bannedList = ref([]);
const bannedTotal = ref(0);
const bannedQuery = ref({
  page: 1,
  limit: 10
});

// SSE相关状态
const sseConnected = ref(false);
const eventSource = ref(null);
const monitorTopic = ref('');
const messages = ref([]);
const reconnectAttempts = ref(0);
const maxReconnectAttempts = 3;
const reconnectDelay = 2000;

// 发送消息
function handleSend() {
  proxy.$refs['mqttForm'].validate(valid => {
    if (valid) {
      loading.value = true;
      request.post('/mqtt/send', {
        topic: form.value.topic,
        message: form.value.message,
        qos: form.value.qos
      }).then(response => {
        ElNotification({
          title: '成功',
          message: '消息发送成功',
          type: 'success',
          duration: 2000
        });
      }).catch(error => {
        ElNotification({
          title: '错误',
          message: '消息发送失败',
          type: 'error',
          duration: 3000
        });
      }).finally(() => {
        loading.value = false;
      });
    }
  });
}

// 重置表单
function resetForm() {
  proxy.$refs['mqttForm'].resetFields();
}

// 获取处理器信息
function getHandlers() {
  loading.value = true;
  request.get('/mqtt/handlers').then(response => {
    const data = response.data;
    handlersList.value = Object.entries(data).map(([topic, handler]) => ({
      topic,
      handler
    }));
  }).catch(error => {
    ElNotification({
      title: '错误',
      message: '获取处理器信息失败',
      type: 'error',
      duration: 3000
    });
  }).finally(() => {
    loading.value = false;
  });
}

// 获取客户端列表
function getClientList() {
  clientsLoading.value = true;
  request.get('/mqtt/clients', {
    params: queryParams.value
  }).then(response => {
    clientsList.value = response.rows;
    total.value = response.total;
  }).catch(error => {
    ElNotification({
      title: '错误',
      message: '获取客户端列表失败',
      type: 'error',
      duration: 3000
    });
  }).finally(() => {
    clientsLoading.value = false;
  });
}

// 搜索按钮操作
function handleQuery() {
  queryParams.value.page = 1;
  getClientList();
}

// 重置按钮操作
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 刷新处理器信息
function refreshHandlers() {
  getHandlers();
}

// 刷新客户端列表
function refreshClients() {
  getClientList();
}

// 获取连接状态类型
function getConnStateType(state) {
  const typeMap = {
    'connected': 'success',
    'idle': 'warning',
    'disconnected': 'danger'
  };
  return typeMap[state] || 'info';
}

// 获取连接状态文本
function getConnStateText(state) {
  const textMap = {
    'connected': '已连接',
    'idle': '空闲',
    'disconnected': '已断开'
  };
  return textMap[state] || state;
}

// 处理加入黑名单
function handleBan(row) {
  proxy.$modal.confirm(
    `确定要将客户端 "${row.clientid}" 加入黑名单吗？`,
    '加入黑名单确认',
    {
      confirmButtonText: '确定加入',
      cancelButtonText: '取消',
      type: 'warning',
      dangerouslyUseHTMLString: true
    }
  ).then(() => {
    proxy.$modal.prompt('请输入禁止原因', '加入黑名单', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /\S+/,
      inputErrorMessage: '禁止原因不能为空',
      inputPlaceholder: '例如：异常连接行为',
      type: 'warning',
      draggable: true,
      customClass: 'custom-dialog'
    }).then(({ value: reason }) => {
      request.post('/mqtt/ban', {
        as: 'clientid',
        who: row.clientid,
        reason: reason
      }).then(response => {
        ElNotification({
          title: '成功',
          message: '加入黑名单成功',
          type: 'success',
          duration: 2000
        });
        getBannedList();
        getClientList();
      }).catch(error => {
        ElNotification({
          title: '错误',
          message: '加入黑名单失败',
          type: 'error',
          duration: 3000
        });
      });
    });
  });
}

// 获取黑名单列表
function getBannedList() {
  bannedLoading.value = true;
  request.get('/mqtt/banned', {
    params: bannedQuery.value
  }).then(response => {
    bannedList.value = response.rows;
    bannedTotal.value = response.total;
  }).catch(error => {
    ElNotification({
      title: '错误',
      message: '获取黑名单列表失败',
      type: 'error',
      duration: 3000
    });
  }).finally(() => {
    bannedLoading.value = false;
  });
}

// 刷新黑名单列表
function refreshBannedList() {
  getBannedList();
}

// 获取禁止方式标签类型
function getBanTypeTag(type) {
  const typeMap = {
    'clientid': 'danger',
    'username': 'warning',
    'peerhost': 'info'
  };
  return typeMap[type] || 'info';
}

// 获取禁止方式文本
function getBanTypeText(type) {
  const textMap = {
    'clientid': '客户端ID',
    'username': '用户名',
    'peerhost': 'IP地址'
  };
  return textMap[type] || type;
}

// 处理解除黑名单
function handleUnban(row) {
  proxy.$modal.confirm(
    `确定要解除对以下客户端的禁止吗？
     禁止对象：${row.who}`,
    '解除禁止确认',
    {
      confirmButtonText: '确定解除',
      cancelButtonText: '取消',
      type: 'warning',
      dangerouslyUseHTMLString: true
    }
  ).then(() => {
    request.delete(`/mqtt/banned/${row.as}/${row.who}`).then(response => {
      ElNotification({
        title: '成功',
        message: '解除禁止成功',
        type: 'success',
        duration: 2000
      });
      getBannedList();
      setTimeout(() => {
        getClientList();
      }, 1000);
    }).catch(error => {
      ElNotification({
        title: '错误',
        message: '解除禁止失败',
        type: 'error',
        duration: 3000
      });
    });
  });
}

// 添加设置测试主题的方法
const setTestTopic = (topic) => {
  form.value.topic = topic;
  ElNotification({
    title: '成功',
    message: '已设置 ' + topic + ' 为测试主题',
    type: 'success',
    duration: 2000
  });
};

// 连接SSE
const connectSSE = () => {
  if (!monitorTopic.value) {
    ElNotification({
      title: '错误',
      message: '请输入要监控的主题',
      type: 'error',
      duration: 2000
    });
    return;
  }

  // 如果已经有连接，先断开
  disconnectSSE();

  try {
    // 构建SSE URL，使用查询参数而不是路径参数
    const baseUrl = import.meta.env.VITE_APP_BASE_API || '';
    const sseUrl = `${baseUrl}/mqtt/sse/subscribe?topic=${encodeURIComponent(monitorTopic.value)}`;

    console.log('正在连接SSE:', sseUrl);
    console.log('监控主题:', monitorTopic.value);

    // 创建EventSource实例
    eventSource.value = new EventSource(sseUrl, {
      withCredentials: true
    });

    // 设置连接超时
    const connectionTimeout = setTimeout(() => {
      if (eventSource.value && eventSource.value.readyState === 0) { // 0 = CONNECTING
        disconnectSSE();
        ElNotification({
          title: '错误',
          message: '连接超时，请检查服务器状态',
          type: 'error',
          duration: 3000
        });
      }
    }, 5000);

    eventSource.value.onopen = () => {
      clearTimeout(connectionTimeout);
      console.log('SSE连接成功');
    };

    eventSource.value.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('收到消息:', data);

        switch (data.type) {
          case 'connected':
            console.log('收到连接确认:', data);
            sseConnected.value = true;
            reconnectAttempts.value = 0;
            ElNotification({
              title: '成功',
              message: `已连接到主题: ${data.topic}`,
              type: 'success',
              duration: 2000
            });
            break;

          case 'message':
            console.log('收到业务消息:', data);
            let formattedContent;
            try {
              // 尝试解析JSON字符串
              const jsonContent = JSON.parse(data.data);
              // 格式化JSON对象，使用2个空格进行缩进
              formattedContent = JSON.stringify(jsonContent, null, 2);
            } catch (e) {
              // 如果解析失败，就使用原始内容
              formattedContent = data.data;
            }

            messages.value.unshift({
              time: new Date().toLocaleTimeString(),
              topic: data.topic,
              content: formattedContent
            });
            if (messages.value.length > 100) {
              messages.value = messages.value.slice(0, 100);
            }
            break;

          default:
            console.log('收到未知类型消息:', data);
        }
      } catch (error) {
        console.error('处理消息失败:', error);
      }
    };

    eventSource.value.onerror = (error) => {
      console.error('SSE错误:', error);
      sseConnected.value = false;

      if (reconnectAttempts.value < maxReconnectAttempts) {
        const nextAttempt = reconnectAttempts.value + 1;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.value), 30000);

        setTimeout(() => {
          if (!sseConnected.value) {
            reconnectAttempts.value = nextAttempt;
            console.log(`尝试第 ${nextAttempt} 次重连...`);
            connectSSE();
          }
        }, delay);
      } else {
        disconnectSSE();
        ElNotification({
          title: '错误',
          message: 'SSE连接失败，请检查主题格式或服务器状态',
          type: 'error',
          duration: 3000
        });
      }
    };
  } catch (error) {
    console.error('创建SSE连接失败:', error);
    ElNotification({
      title: '错误',
      message: '创建SSE连接失败: ' + error.message,
      type: 'error',
      duration: 3000
    });
  }
};

// 断开SSE连接
const disconnectSSE = () => {
  if (eventSource.value) {
    eventSource.value.close();
    eventSource.value = null;
    sseConnected.value = false;
  }
};

// 清空消息
const clearMessages = () => {
  messages.value = [];
};

// 添加复制功能
const copyMessage = (content) => {
  navigator.clipboard.writeText(content).then(() => {
    ElNotification({
      title: '成功',
      message: '消息内容已复制到剪贴板',
      type: 'success',
      duration: 2000
    });
  }).catch(err => {
    ElNotification({
      title: '错误',
      message: '复制失败: ' + err,
      type: 'error',
      duration: 3000
    });
  });
};

// 组件销毁前清理
onBeforeUnmount(() => {
  disconnectSSE();
});

// 初始化
getHandlers();
getClientList();
getBannedList();
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.box-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

/* 添加高度一致的样式 */
.el-row {
  display: flex;
  align-items: stretch;
}

.el-col {
  display: flex;
  flex-direction: column;
}

.el-col .box-card {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.el-col .box-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.el-col .box-card .el-table {
  flex: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-right {
  display: flex;
  gap: 8px;
}

.title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.mt20 {
  margin-top: 20px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

:deep(.el-input__wrapper:hover),
:deep(.el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px #c0c4cc inset;
}

:deep(.el-button) {
  padding: 8px 20px;
  font-weight: 500;
}

:deep(.el-table) {
  border-radius: 4px;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  font-weight: 500;
}

/* 添加主题按钮的样式 */
:deep(.el-button--primary.el-button--link) {
  padding: 0;
  height: auto;
  font-size: 14px;
}

:deep(.el-button--primary.el-button--link:hover) {
  color: #409eff;
  text-decoration: underline;
}

/* 可以添加自定义通知样式 */
:deep(.el-notification__title) {
  font-weight: bold;
}

:deep(.el-notification__content) {
  margin-top: 5px;
}

.message-container {
  height: 400px;
  overflow-y: auto;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.no-message {
  text-align: center;
  color: #909399;
  padding: 40px 0;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.message-item {
  background-color: #fff;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.message-time {
  font-family: "SF Mono", "JetBrains Mono", monospace;
  font-size: 12px;
  color: #606266;
  font-weight: 500;
}

.message-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.message-header-right .el-button {
  padding: 4px 8px;
  font-size: 12px;
}

.message-header-right .el-button:hover {
  background-color: #ecf5ff;
  border-radius: 4px;
}

.message-content {
  position: relative;
}

/* 通配符提示框样式 */
.wildcard-tooltip {
  padding: 8px;
  max-width: 320px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.tooltip-title {
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  font-size: 16px;
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;
}

.wildcard-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
}

.wildcard-symbol {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin-right: 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  font-size: 18px;
  font-weight: bold;
  color: #fff;
}

.wildcard-desc {
  flex: 1;
}

.desc-title {
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  margin-bottom: 4px;
}

.desc-example {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
}

.desc-example code {
  background: rgba(255, 255, 255, 0.15);
  padding: 2px 4px;
  border-radius: 3px;
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 11px;
}

.example-section {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.example-title {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #fff;
  font-weight: 500;
}

.example-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.example-list code {
  display: block;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 12px;
  color: #fff;
}

.help-icon {
  font-size: 18px;
  color: #909399;
  cursor: help;
  transition: color 0.3s ease;
}

.help-icon:hover {
  color: #409eff;
}

/* 提示框箭头样式 */
:deep(.el-popper.is-dark) {
  background: #2c3e50 !important;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

:deep(.el-popper.is-dark .el-popper__arrow::before) {
  background: #2c3e50 !important;
  border: none;
}

.control-buttons {
  display: flex;
  gap: 8px;
}

.monitor-btn {
  min-width: 88px;
  transition: all 0.3s ease;
  padding: 8px 16px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.monitor-btn.is-connected {
  background-color: #f56c6c;
  border-color: #f56c6c;
}

.monitor-btn.is-connected:hover {
  background-color: #e64242;
  border-color: #e64242;
}

.monitor-btn:not(.is-connected) {
  background-color: #409eff;
  border-color: #409eff;
}

.monitor-btn:not(.is-connected):hover {
  background-color: #2b85e4;
  border-color: #2b85e4;
}

.clear-btn {
  min-width: 88px;
  transition: all 0.3s ease;
  padding: 8px 16px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background-color: #909399;
  border-color: #909399;
}

.clear-btn:not(:disabled):hover {
  background-color: #606266;
  border-color: #606266;
}

.clear-btn:disabled {
  background-color: #f4f4f5;
  border-color: #e9e9eb;
  cursor: not-allowed;
}

.monitor-btn .el-icon,
.clear-btn .el-icon {
  font-size: 14px;
  margin-right: 2px;
}

/* 按钮文字 */
.monitor-btn span,
.clear-btn span {
  font-size: 13px;
  font-weight: 500;
}

/* 按钮hover效果 */
.monitor-btn:hover,
.clear-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

/* 按钮点击效果 */
.monitor-btn:active,
.clear-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: none;
}
</style>
