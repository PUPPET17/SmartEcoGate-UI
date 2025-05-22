<template>
  <div class="app-container">


    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="100px" label-position="left">
      <el-row :gutter="20">
        <el-col :span="5">
          <el-form-item label="企业名称" prop="companyId" >
            <el-select v-model="queryParams.companyId" placeholder="请选择企业" clearable filterable style="width: 180px;">
              <el-option v-for="item in enterpriseIds" :key="item.companyId" :label="item.companyName"
                :value="item.companyId" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item label="组id" prop="groupId">
            <el-select v-model="queryParams.groupId" placeholder="请选择组ID" clearable style="width: 180px;">
              <el-option v-for="group in groupOptions" :key="group.groupId" :label="'组ID: ' + group.groupId"
                :value="group.groupId" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item label="是否主账号" prop="mainAccount">
            <el-select v-model="queryParams.mainAccount" placeholder="请选择是否主账号" clearable style="width: 180px;">
              <el-option label="是" value="1" />
              <el-option label="不是" value="0" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>



    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:group:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['system:group:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['system:group:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['system:group:export']">导出</el-button>
      </el-col>
      <el-col :span="18">
        <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="24">
        <el-table v-loading="loading" :data="groupList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="企业名称" align="center" prop="companyName" />
          <el-table-column label="企业组ID" align="center" prop="groupId" />
          <el-table-column label="所属企业组" align="center">
            <template #default="scope">
              <el-popover placement="top" width="300" trigger="click" popper-class="group-members-popover"
                :disabled="loadingGroupMembers && currentRowId === scope.row.id"
                :visible="popoverVisible === scope.row.id" @hide="handleHidePopover(scope.row.id)">
                <template #default>
                  <div class="group-members-container">
                    <div class="group-title">企业组 ID: {{ scope.row.groupId }}</div>
                    <div v-if="loadingGroupMembers && currentRowId === scope.row.id" class="loading-container">
                      <el-icon class="loading-icon">
                        <Loading />
                      </el-icon> 加载中...
                    </div>
                    <div v-else class="group-members-list">
                      <div v-for="item in cachedGroupMembers" :key="item.id" class="group-member-item">
                        <el-tag :type="item.mainAccount == 1 || item.mainAccount === '1' ? 'success' : 'info'"
                          size="small">
                          {{ item.companyName }}
                          <span v-if="item.mainAccount == 1 || item.mainAccount === '1'">(主账号)</span>
                        </el-tag>
                      </div>
                      <div v-if="cachedGroupMembers.length === 0" class="no-members">
                        无组成员数据
                      </div>
                    </div>
                  </div>
                </template>
                <template #reference>
                  <el-button link type="primary" @click.stop="handleViewGroupMembers(scope.row)">
                    查看企业组成员
                  </el-button>
                </template>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column label="是否主账号" align="center" prop="mainAccount">
            <template #default="scope">
              <el-tag :type="scope.row.mainAccount == 1 || scope.row.mainAccount === '1' ? 'success' : 'info'">
                {{ scope.row.mainAccount == 1 || scope.row.mainAccount === '1' ? '是' : '不是' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                v-hasPermi="['system:group:edit']">修改</el-button>
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                v-hasPermi="['system:group:remove']">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="24">
        <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize" @pagination="getList" />
      </el-col>
    </el-row>

    <!-- 添加或修改企业组对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="groupRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="企业名称" prop="companyId">
              <el-select v-model="form.companyId" placeholder="请选择企业" clearable filterable @change="handleCompanyChange"
                style="width: 100%">
                <el-option v-for="item in enterpriseIds" :key="item.companyId" :label="item.companyName"
                  :value="item.companyId" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="企业组" prop="groupId">
              <el-radio-group v-model="groupSelectionType" @change="handleGroupSelectionChange">
                <el-radio label="existing">添加到现有企业组</el-radio>
                <el-radio label="new">创建新企业组</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="24">
            <div v-if="groupSelectionType === 'existing'" class="mt-2">
              <el-select v-model="form.groupId" placeholder="请选择现有企业组" clearable @change="handleExistingGroupChange"
                style="width: 100%">
                <el-option v-for="group in groupOptions" :key="group.groupId"
                  :label="'组ID: ' + group.groupId + ' (包含' + (group.enterpriseCount || getGroupMemberCountLabel(group.groupId)) + '个企业)'"
                  :value="group.groupId" />
              </el-select>

              <div v-if="form.groupId" class="mt-2">
                <el-row :gutter="10">
                  <el-col :span="24">
                    <div class="group-members-title text-center">当前组成员:
                      <el-tag v-if="loadingFormGroupMembers" size="small" type="info">加载中...</el-tag>
                    </div>
                    <div class="form-group-members-list members-center">
                      <template v-if="loadingFormGroupMembers">
                        <div class="loading-members">
                          <el-icon class="loading-icon">
                            <Loading />
                          </el-icon> 正在加载组成员...
                        </div>
                      </template>
                      <template v-else>
                        <div class="members-container">
                          <el-tag v-for="item in formGroupMembers" :key="item.id"
                            :type="item.mainAccount == 1 || item.mainAccount === '1' ? 'success' : 'info'"
                            class="group-member-tag mr-1">
                            {{ item.companyName }}
                            <span v-if="item.mainAccount == 1 || item.mainAccount === '1'">(主账号)</span>
                          </el-tag>
                          <div v-if="formGroupMembers.length === 0" class="no-members">
                            无组成员数据
                          </div>
                        </div>
                      </template>
                    </div>
                  </el-col>
                </el-row>
              </div>
            </div>

            <div v-else class="mt-2">
              <el-alert v-if="form.companyId" title="将为该企业创建新的企业组" type="info" :closable="false">
              </el-alert>
            </div>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="是否主账号" prop="mainAccount">
              <el-switch v-model="form.mainAccount" :disabled="isMainAccountDisabled" :active-value="1"
                :inactive-value="0" active-text="是" inactive-text="否">
              </el-switch>
              <div v-if="mainAccountWarning" class="warning-text mt-1">
                {{ mainAccountWarning }}
              </div>
            </el-form-item>
          </el-col>
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

<script setup name="Group">
import { listGroup, getGroup, delGroup, addGroup, updateGroup, getGroupById, getAllGroupsCount } from "@/api/system/group";
import { selectIds } from "@/api/system/info";
import { getCurrentInstance, ref, reactive, toRefs, computed, watch } from 'vue';
import { Loading } from '@element-plus/icons-vue';

const { proxy } = getCurrentInstance();

const groupList = ref([]);
const groupMembersMap = ref({});
const cachedGroupMembers = ref([]);
const formGroupMembers = ref([]);
const loadingGroupMembers = ref(false);
const loadingFormGroupMembers = ref(false);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const enterpriseIds = ref([]);
const groupSelectionType = ref('existing'); // 'existing' 或 'new'
const mainAccountWarning = ref('');
const preloadingStatus = ref(''); // 预加载状态
const popoverVisible = ref(null); // 控制哪一行的popover显示，存储row.id
const currentRowId = ref(null); // 当前正在操作的行ID
const currentGroupId = ref(null); // 当前正在加载的组ID
const allGroupsData = ref([]); // 存储所有的企业组及数量信息

// 表单校验规则
const rules = {
  companyId: [
    { required: true, message: "企业不能为空", trigger: "blur" }
  ],
  groupId: [
    { required: true, message: "组ID不能为空", trigger: "blur" }
  ]
};

const data = reactive({
  form: {
    id: null,
    companyName: null,
    companyId: null,
    groupId: null,
    mainAccount: 0
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    companyName: null,
    companyId: null,
    groupId: null,
    mainAccount: null
  }
});

const { queryParams, form } = toRefs(data);

// 获取所有不重复的组ID选项
const groupOptions = computed(() => {
  // 优先使用从API获取的完整企业组列表
  if (allGroupsData.value && allGroupsData.value.length > 0) {
    return allGroupsData.value.map(item => ({
      groupId: item.groupId,
      enterpriseCount: item.enterpriseCount
    }));
  }

  // 如果没有获取到完整列表，则使用当前分页数据
  const groups = [];
  const groupIds = new Set();

  groupList.value.forEach(item => {
    if (!groupIds.has(item.groupId)) {
      groupIds.add(item.groupId);
      groups.push({ groupId: item.groupId });
    }
  });

  return groups;
});

// 根据组ID获取该组的所有成员
const getGroupMembers = async (groupId) => {
  // 检查缓存中是否已有该组的完整成员数据
  if (!groupMembersMap.value[groupId]) {
    try {
      const response = await getGroupById(groupId);
      if (response && response.data) {
        groupMembersMap.value[groupId] = response.data;
      } else {
        // 如果API调用失败，则使用当前分页数据作为备选
        groupMembersMap.value[groupId] = groupList.value.filter(item => item.groupId === groupId);
      }
    } catch (error) {
      console.error("获取企业组成员失败:", error);
      // 异常情况下使用当前分页数据
      groupMembersMap.value[groupId] = groupList.value.filter(item => item.groupId === groupId);
    }
  }
  return groupMembersMap.value[groupId];
};

// 获取特定组的成员数量（异步）
const getGroupMembersCount = async (groupId) => {
  const members = await getGroupMembers(groupId);
  return members.length;
};

// 根据组ID获取当前分页中的组成员（用于计算选项等非显示场景）
const getLocalGroupMembers = (groupId) => {
  return groupList.value.filter(item => item.groupId === groupId);
};

// 判断特定组是否已存在主账号
const hasMainAccount = async (groupId) => {
  const members = await getGroupMembers(groupId);
  return members.some(item => item.mainAccount == 1 || item.mainAccount === '1');
};

// 获取特定组的主账号企业名称
const getMainAccountName = async (groupId) => {
  const members = await getGroupMembers(groupId);
  const mainAccount = members.find(item => item.mainAccount == 1 || item.mainAccount === '1');
  return mainAccount ? mainAccount.companyName : '';
};

// 加载特定组ID的所有成员
const loadGroupMembers = async (groupId) => {
  loadingGroupMembers.value = true;
  try {
    // 检查是否已预加载
    if (groupMembersMap.value[groupId]) {
      cachedGroupMembers.value = groupMembersMap.value[groupId];
    } else {
      // 如果没有预加载，则单独获取
      const members = await getGroupMembers(groupId);
      cachedGroupMembers.value = members;
    }
  } catch (error) {
    console.error("加载组成员失败:", error);
  } finally {
    loadingGroupMembers.value = false;
  }
};

// 判断是否应该禁用主账号开关
const isMainAccountDisabled = computed(() => {
  if (!form.value.groupId || groupSelectionType.value === 'new') {
    return false;
  }

  // 获取当前编辑的记录ID
  const currentEditId = form.value.id;

  // 使用当前本地数据进行初步判断，避免异步操作
  const localMembers = getLocalGroupMembers(form.value.groupId);
  const existingMainAccount = localMembers.find(
    item => (item.mainAccount == 1 || item.mainAccount === '1') && item.id !== currentEditId
  );

  if (existingMainAccount) {
    mainAccountWarning.value = `该企业组已有主账号: ${existingMainAccount.companyName}`;
    return true;
  }

  // 如果本地没找到，可能需要通过API查询完整数据
  // 这里为了界面响应速度，先返回false，后续可以在选择时异步更新
  mainAccountWarning.value = '';
  return false;
});

// 为表单加载特定组ID的所有成员
const loadFormGroupMembers = async (groupId) => {
  if (!groupId) return;

  loadingFormGroupMembers.value = true;
  try {
    // 检查是否已预加载
    if (groupMembersMap.value[groupId]) {
      formGroupMembers.value = groupMembersMap.value[groupId];
    } else {
      // 如果没有预加载，则单独获取
      const members = await getGroupMembers(groupId);
      formGroupMembers.value = members;
    }
  } catch (error) {
    console.error("加载组成员失败:", error);
    formGroupMembers.value = [];
  } finally {
    loadingFormGroupMembers.value = false;
  }
};

// 监听表单中组ID变化，自动加载该组成员
watch(() => form.value.groupId, (newGroupId) => {
  if (newGroupId && groupSelectionType.value === 'existing') {
    loadFormGroupMembers(newGroupId);
  } else {
    formGroupMembers.value = [];
  }
});

/** 查询企业组列表 */
function getList() {
  loading.value = true;
  // 清除组成员缓存
  groupMembersMap.value = {};

  listGroup(queryParams.value).then(response => {
    groupList.value = response.rows;
    total.value = response.total;
    loading.value = false;

    // 在获取列表后，预加载所有显示的组的成员数据
    preloadGroupMembers();
  });

  // 获取所有企业组及数量
  fetchAllGroupsCount();
}

// 获取所有企业组及数量信息
async function fetchAllGroupsCount() {
  try {
    const response = await getAllGroupsCount();
    if (response && response.data) {
      allGroupsData.value = response.data;
      console.log("获取所有企业组数量信息成功:", allGroupsData.value);
    }
  } catch (error) {
    console.error("获取企业组数量信息失败:", error);
  }
}

// 预加载当前页面中所有组的成员数据
async function preloadGroupMembers() {
  // 获取所有不同的组ID
  const uniqueGroupIds = new Set();
  groupList.value.forEach(item => {
    if (item.groupId) {
      uniqueGroupIds.add(item.groupId);
    }
  });

  // 记录预加载状态
  preloadingStatus.value = `正在预加载 ${uniqueGroupIds.size} 个组的成员数据...`;
  console.log(preloadingStatus.value);

  // 并行加载所有组的成员数据
  const promises = [];
  uniqueGroupIds.forEach(groupId => {
    promises.push(fetchGroupMembers(groupId));
  });

  try {
    await Promise.all(promises);
    console.log(`已完成 ${uniqueGroupIds.size} 个组的成员预加载`);
  } catch (error) {
    console.error("预加载组成员数据失败:", error);
  }
}

// 获取指定组ID的成员并存入缓存
async function fetchGroupMembers(groupId) {
  try {
    const response = await getGroupById(groupId);
    if (response && response.data) {
      groupMembersMap.value[groupId] = response.data;
      return response.data;
    }
  } catch (error) {
    console.error(`获取组 ${groupId} 成员失败:`, error);
    // 异常情况下使用当前分页数据
    groupMembersMap.value[groupId] = groupList.value.filter(item => item.groupId === groupId);
  }
  return null;
}

// 处理企业选择变化
function handleCompanyChange(value) {
  // 如果选择了企业，自动填充企业名称
  if (value) {
    const company = enterpriseIds.value.find(item => item.companyId === value);
    if (company) {
      form.value.companyName = company.companyName;
    }
  } else {
    form.value.companyName = null;
  }

  // 如果是新建企业组，则生成新的组ID
  if (groupSelectionType.value === 'new') {
    generateNewGroupId();
  }
}

// 处理组选择类型变更
function handleGroupSelectionChange(value) {
  if (value === 'new') {
    // 选择新建组，生成一个新的组ID
    generateNewGroupId();
    // 默认设为主账号
    form.value.mainAccount = 1;
    mainAccountWarning.value = '';
  } else {
    // 选择现有组，清空组ID和主账号设置
    form.value.groupId = null;
    form.value.mainAccount = 0;
  }
}

// 处理现有组选择变更
async function handleExistingGroupChange(groupId) {
  if (groupId) {
    // 显示加载状态
    mainAccountWarning.value = "正在检查组信息...";

    try {
      const hasMain = await hasMainAccount(groupId);
      if (hasMain) {
        form.value.mainAccount = 0;
        const mainName = await getMainAccountName(groupId);
        mainAccountWarning.value = `该企业组已有主账号: ${mainName}`;
      } else {
        mainAccountWarning.value = '';
      }
    } catch (error) {
      console.error("检查组主账号失败:", error);
      mainAccountWarning.value = "获取组信息失败，请重试";
    }
  }
}

// 生成新的组ID
function generateNewGroupId() {
  // 简单实现：找到当前最大的组ID并加1
  let maxGroupId = 0;
  groupList.value.forEach(item => {
    if (item.groupId > maxGroupId) {
      maxGroupId = parseInt(item.groupId);
    }
  });
  form.value.groupId = maxGroupId + 1;
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
    companyName: null,
    companyId: null,
    groupId: null,
    mainAccount: 0
  };
  groupSelectionType.value = 'existing';
  mainAccountWarning.value = '';
  proxy.resetForm("groupRef");
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
  title.value = "添加企业组";

  // 确保有最新的企业组数据
  fetchAllGroupsCount();
}

/** 修改按钮操作 */
async function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value;

  // 确保有最新的企业组数据
  await fetchAllGroupsCount();

  try {
    const response = await getGroup(_id);
    form.value = response.data;

    // 设置组选择类型为现有组
    groupSelectionType.value = 'existing';

    // 检查当前记录是否为主账号，或组内是否有其他主账号
    if (form.value.mainAccount == 1 || form.value.mainAccount === '1') {
      mainAccountWarning.value = '当前企业为该组的主账号';
    } else {
      mainAccountWarning.value = "正在检查组信息...";
      const hasMain = await hasMainAccount(form.value.groupId);
      if (hasMain) {
        const mainName = await getMainAccountName(form.value.groupId);
        mainAccountWarning.value = `该企业组已有主账号: ${mainName}`;
      } else {
        mainAccountWarning.value = '';
      }
    }

    open.value = true;
    title.value = "修改企业组";
  } catch (error) {
    console.error("获取企业组详情失败:", error);
    proxy.$modal.msgError("获取详情失败，请重试");
  }
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["groupRef"].validate(valid => {
    if (valid) {
      // 如果是新建企业组
      if (groupSelectionType.value === 'new' && !form.value.id) {
        // 新建企业组默认为主账号
        form.value.mainAccount = 1;
      }

      if (form.value.id != null) {
        updateGroup(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addGroup(form.value).then(response => {
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

  // 检查是否是主账号企业，给出提示
  let warningMsg = '是否确认删除企业组编号为"' + _ids + '"的数据项？';

  if (typeof row === 'object' && (row.mainAccount == 1 || row.mainAccount === '1')) {
    warningMsg = '警告：该企业是企业组的主账号！删除后该组将没有主账号。\n' + warningMsg;
  }

  proxy.$modal.confirm(warningMsg).then(function () {
    return delGroup(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/group/export', {
    ...queryParams.value
  }, `group_${new Date().getTime()}.xlsx`)
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

const getCompanyName = (companyId) => {
  const company = enterpriseIds.value.find(item => item.companyId === companyId);
  return company ? company.companyName : '未知企业'; // 如果找不到，返回默认值
};

// 获取组成员数量显示标签
const getGroupMemberCountLabel = (groupId) => {
  // 尝试从allGroupsData中获取准确数量
  const groupInfo = allGroupsData.value.find(g => g.groupId === groupId);
  if (groupInfo) {
    return groupInfo.enterpriseCount;
  }

  // 如果已经预加载了组成员数据，使用准确数量
  if (groupMembersMap.value[groupId]) {
    return groupMembersMap.value[groupId].length;
  }

  // 否则使用当前页面数据估算，并加上+号表示可能不完整
  const localCount = getLocalGroupMembers(groupId).length;
  return localCount + "+";
};

// 处理隐藏popover
const handleHidePopover = (rowId) => {
  if (popoverVisible.value === rowId) {
    popoverVisible.value = null;
  }
};

// 处理点击查看组成员
const handleViewGroupMembers = async (row) => {
  const rowId = row.id;
  const groupId = row.groupId;

  // 如果正在加载并且是同一行，则不处理
  if (loadingGroupMembers.value && currentRowId.value === rowId) {
    return;
  }

  // 如果点击的是当前已显示的popover，则关闭它
  if (popoverVisible.value === rowId) {
    popoverVisible.value = null;
    return;
  }

  // 先加载数据
  loadingGroupMembers.value = true;
  currentRowId.value = rowId;
  currentGroupId.value = groupId;
  cachedGroupMembers.value = []; // 清空之前的数据

  try {
    // 检查是否已预加载
    if (groupMembersMap.value[groupId]) {
      cachedGroupMembers.value = groupMembersMap.value[groupId];
    } else {
      // 如果没有预加载，则单独获取
      const members = await getGroupMembers(groupId);
      cachedGroupMembers.value = members;
    }
    // 数据加载完成后显示popover
    popoverVisible.value = rowId;
  } catch (error) {
    console.error("加载组成员失败:", error);
    proxy.$modal.msgError("获取组成员失败，请重试");
  } finally {
    loadingGroupMembers.value = false;
  }
};

getEnterpriseList();
getList();
</script>

<style scoped>
.mt-1 {
  margin-top: 5px;
}

.mt-2 {
  margin-top: 10px;
}

.mr-1 {
  margin-right: 5px;
}

.group-members-container {
  padding: 5px;
}

.group-title {
  font-weight: bold;
  margin-bottom: 10px;
  padding-bottom: 5px;
  border-bottom: 1px solid #EBEEF5;
  color: #303133;
}

.group-members-list {
  max-height: 200px;
  overflow-y: auto;
}

.group-members-title {
  font-size: 12px;
  color: #606266;
  margin-bottom: 5px;
}

.group-member-tag {
  margin-bottom: 5px;
}

.group-member-item {
  margin-bottom: 8px;
}

.warning-text {
  color: #E6A23C;
  font-size: 12px;
}

/* 使用全局样式覆盖 popover 宽度 */
:deep(.group-members-popover) {
  min-width: 300px;
  max-width: 400px;
}

.form-group-members-list {
  margin-top: 8px;
  padding: 8px;
  border-radius: 4px;
  background-color: #f5f7fa;
  min-height: 40px;
  max-height: 150px;
  overflow-y: auto;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  color: #909399;
}

.loading-icon {
  animation: rotating 2s linear infinite;
  margin-right: 5px;
}

.loading-members {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 40px;
  color: #909399;
  font-size: 14px;
}

.no-members {
  width: 100%;
  text-align: center;
  color: #909399;
  font-size: 14px;
  padding: 10px 0;
}

@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.text-center {
  text-align: center;
}

.members-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.members-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 5px;
  max-width: 90%;
}
</style>
