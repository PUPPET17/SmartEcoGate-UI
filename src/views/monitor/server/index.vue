<template>
  <div class="app-container">
    <el-row>
      <el-col :span="8" class="card-box">
        <el-card>
          <template #header>
            <Cpu style="width: 1em; height: 1em; vertical-align: middle;" /> <span
              style="vertical-align: middle;">CPU</span>
          </template>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <table cellspacing="0" style="width: 100%;">
              <thead>
                <tr>
                  <th class="el-table__cell is-leaf">
                    <div class="cell">属性</div>
                  </th>
                  <th class="el-table__cell is-leaf">
                    <div class="cell">值</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">核心数</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" v-if="server.cpu">{{ server.cpu.cpuNum }}</div>
                  </td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">用户使用率</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" v-if="server.cpu">{{ server.cpu.used }}%</div>
                  </td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">系统使用率</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" v-if="server.cpu">{{ server.cpu.sys }}%</div>
                  </td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">当前空闲率</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" v-if="server.cpu">{{ server.cpu.free }}%</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8" class="card-box">
        <el-card>
          <template #header>
            <Tickets style="width: 1em; height: 1em; vertical-align: middle;" /> <span
              style="vertical-align: middle;">内存</span>
          </template>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <table cellspacing="0" style="width: 100%;">
              <thead>
                <tr>
                  <th class="el-table__cell is-leaf">
                    <div class="cell">属性</div>
                  </th>
                  <th class="el-table__cell is-leaf">
                    <div class="cell">内存</div>
                  </th>
                  <th class="el-table__cell is-leaf">
                    <div class="cell">JVM</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">总内存</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" v-if="server.mem">{{ server.mem.total }}G</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" v-if="server.jvm">{{ server.jvm.total }}M</div>
                  </td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">已用内存</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" v-if="server.mem">{{ server.mem.used }}G</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" v-if="server.jvm">{{ server.jvm.used }}M</div>
                  </td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">剩余内存</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" v-if="server.mem">{{ server.mem.free }}G</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" v-if="server.jvm">{{ server.jvm.free }}M</div>
                  </td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">使用率</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" v-if="server.mem" :class="{ 'text-danger': server.mem.usage > 80 }">{{
                      server.mem.usage
                    }}%</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" v-if="server.jvm" :class="{ 'text-danger': server.jvm.usage > 80 }">{{
                      server.jvm.usage
                    }}%</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8" class="card-box">
        <el-card>
          <!-- header 插槽应该直接在 el-card 下面 -->
          <template #header>
            <span>日志级别</span>
            <el-popover trigger="click" placement="bottom" width="500" :visible="visible">
              <template #reference>
                <!-- 添加触发元素 -->
                <el-button class="ml-2" type="primary" link>
                  <el-icon>
                    <Setting @click="visible = true" />
                  </el-icon>
                </el-button>
              </template>
              <el-row :gutter="5">
                <el-col :span="10">
                  <el-form :model="logLevelForm" ref="logLevelFormRef">
                    <el-form-item label="包名" prop="packageName">
                      <el-select v-model="logLevelForm.packageName" placeholder="目标包名">
                        <el-option label="com.ruoyi" value="com.ruoyi"></el-option>
                      </el-select>
                    </el-form-item>
                  </el-form>
                </el-col>
                <el-col :span="10">
                  <el-form :model="logLevelForm" ref="logLevelFormRef">
                    <el-form-item label="级别" prop="levelName">
                      <el-select v-model="logLevelForm.levelName" placeholder="日志级别">
                        <el-option label="TRACE" value="TRACE"></el-option>
                        <el-option label="DEBUG" value="DEBUG"></el-option>
                        <el-option label="INFO" value="INFO"></el-option>
                        <el-option label="WARN" value="WARN"></el-option>
                        <el-option label="ERROR" value="ERROR"></el-option>
                      </el-select>
                    </el-form-item>
                  </el-form>
                </el-col>
                <el-col :span="4">
                  <el-form-item>
                    <el-button type="primary" @click="handleUpdateLogLevel" plain
                      :disabled="!logLevelForm.packageName || !logLevelForm.levelName">修改</el-button>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-popover>
          </template>

          <div class="el-table el-table--enable-row-hover el-table--medium"
            style="max-height: 200px; overflow-y: auto;">
            <el-table :data="logLevels" style="width: 100%;height: 200px;">
              <el-table-column sortable prop="name" label="名称" />
              <el-table-column sortable prop="configuredLevel.levelStr" label="配置级别" />
              <el-table-column prop="effectiveLevel.levelStr" label="有效级别" />
            </el-table>
          </div>
        </el-card>
      </el-col>

      <el-col :span="24" class="card-box">
        <el-card>
          <template #header>
            <Monitor style="width: 1em; height: 1em; vertical-align: middle;" /> <span
              style="vertical-align: middle;">服务器信息</span>
          </template>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <table cellspacing="0" style="width: 100%;">
              <tbody>
                <tr>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">服务器名称</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" v-if="server.sys">{{ server.sys.computerName }}</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">操作系统</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" v-if="server.sys">{{ server.sys.osName }}</div>
                  </td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">服务器IP</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" v-if="server.sys">{{ server.sys.computerIp }}</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">系统架构</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" v-if="server.sys">{{ server.sys.osArch }}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-card>
      </el-col>

      <el-col :span="24" class="card-box">
        <el-card>
          <template #header>
            <CoffeeCup style="width: 1em; height: 1em; vertical-align: middle;" /> <span
              style="vertical-align: middle;">Java虚拟机信息</span>
          </template>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <table cellspacing="0" style="width: 100%;table-layout:fixed;">
              <tbody>
                <tr>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">Java名称</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" v-if="server.jvm">{{ server.jvm.name }}</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">Java版本</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" v-if="server.jvm">{{ server.jvm.version }}</div>
                  </td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">启动时间</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" v-if="server.jvm">{{ server.jvm.startTime }}</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">运行时长</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" v-if="server.jvm">{{ server.jvm.runTime }}</div>
                  </td>
                </tr>
                <tr>
                  <td colspan="1" class="el-table__cell is-leaf">
                    <div class="cell">安装路径</div>
                  </td>
                  <td colspan="3" class="el-table__cell is-leaf">
                    <div class="cell" v-if="server.jvm">{{ server.jvm.home }}</div>
                  </td>
                </tr>
                <tr>
                  <td colspan="1" class="el-table__cell is-leaf">
                    <div class="cell">项目路径</div>
                  </td>
                  <td colspan="3" class="el-table__cell is-leaf">
                    <div class="cell" v-if="server.sys">{{ server.sys.userDir }}</div>
                  </td>
                </tr>
                <tr>
                  <td colspan="1" class="el-table__cell is-leaf">
                    <div class="cell">运行参数</div>
                  </td>
                  <td colspan="3" class="el-table__cell is-leaf">
                    <div class="cell" v-if="server.jvm">{{ server.jvm.inputArgs }}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-card>
      </el-col>

      <el-col :span="24" class="card-box">
        <el-card>
          <template #header>
            <MessageBox style="width: 1em; height: 1em; vertical-align: middle;" /> <span
              style="vertical-align: middle;">磁盘状态</span>
          </template>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <table cellspacing="0" style="width: 100%;">
              <thead>
                <tr>
                  <th class="el-table__cell el-table__cell is-leaf">
                    <div class="cell">盘符路径</div>
                  </th>
                  <th class="el-table__cell is-leaf">
                    <div class="cell">文件系统</div>
                  </th>
                  <th class="el-table__cell is-leaf">
                    <div class="cell">盘符类型</div>
                  </th>
                  <th class="el-table__cell is-leaf">
                    <div class="cell">总大小</div>
                  </th>
                  <th class="el-table__cell is-leaf">
                    <div class="cell">可用大小</div>
                  </th>
                  <th class="el-table__cell is-leaf">
                    <div class="cell">已用大小</div>
                  </th>
                  <th class="el-table__cell is-leaf">
                    <div class="cell">已用百分比</div>
                  </th>
                </tr>
              </thead>
              <tbody v-if="server.sysFiles">
                <tr v-for="(sysFile, index) in server.sysFiles" :key="index">
                  <td class="el-table__cell is-leaf">
                    <div class="cell">{{ sysFile.dirName }}</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">{{ sysFile.sysTypeName }}</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">{{ sysFile.typeName }}</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">{{ sysFile.total }}</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">{{ sysFile.free }}</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">{{ sysFile.used }}</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" :class="{ 'text-danger': sysFile.usage > 80 }">{{ sysFile.usage }}%</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { getServer, getLogLevels, changeLogLevel } from '@/api/monitor/server'
import { ref } from 'vue';

const server = ref([]);
const logLevels = ref([]);
const logLevelForm = ref({
  packageName: '',
  levelName: ''
});
const { proxy } = getCurrentInstance();
const visible = ref(false); // 控制popover的显隐状态

function getList() {
  proxy.$modal.loading("正在加载服务监控数据，请稍候！");
  getServer().then(response => {
    server.value = response.data;
    fetchLogLevels();
    proxy.$modal.closeLoading();
  });
}

function fetchLogLevels() {
  getLogLevels().then(response => {
    logLevels.value = response.loggers;
    console.log("获取的日志级别:", logLevels.value); // 打印获取的日志级别
  }).catch(error => {
    console.error("获取日志级别失败:", error);
  });
}

function updateLogLevel() {
  console.log("正在更改日志级别:", logLevelForm.value);
  const level = logLevelForm.value.levelName
  changeLogLevel(logLevelForm.value.packageName, logLevelForm.value.levelName)
    .then(response => {
      fetchLogLevels(); // 刷新日志级别列表
      const logLevelMessages = {
        DEBUG: "更改日志为DEBUG级别成功",
        INFO: "更改日志为INFO级别成功",
        WARN: "更改日志为WARN级别成功",
        ERROR: "更改日志为ERROR级别成功",
        TRACE: "更改日志为TRACE级别成功"
      };

      if (logLevelMessages[level]) {
        proxy.$modal.msgSuccess(logLevelMessages[level]); 
      }

      console.log("日志级别已更改:", logLevelForm.value);
    })
    .catch(error => {
      proxy.$modal.msgError(error.message);
      console.error("更改日志级别失败:", error);
    });
}

function handleUpdateLogLevel() {
  updateLogLevel(); // 调用更新日志级别的函数
  visible.value = false; // 隐藏popover
}

getList();
</script>
