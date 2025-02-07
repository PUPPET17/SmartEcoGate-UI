<template>
    <el-cascader
        v-model="selectedRegion"
        :options="regionOptions"
        :props="cascaderProps"
        @change="handleRegionChange"
        placeholder="请选择行政区划"
        clearable
        style="width: 100%;"
        filterable
        :show-all-levels="false" 
    />
</template>

<script setup>
import { ref, defineEmits, defineProps, watch } from 'vue'
import axios from 'axios'
import { getToken } from '@/utils/auth'

const props = defineProps({
    modelValue: {
        type: Array,
        default: () => []
    }
})

// 绑定选择的区域值
const selectedRegion = ref(props.modelValue)
// 行政区划数据
const regionOptions = ref([])
// 向父组件传递更新事件
const emit = defineEmits(['update:modelValue'])

// 基础配置
const baseUrl = import.meta.env.VITE_APP_BASE_API
const headers = { Authorization: "Bearer " + getToken() }

// 配置 el-cascader 的属性，启用懒加载
const cascaderProps = {
    lazy: true,
    lazyLoad(node, resolve) {
        const parent = node.value || null
        fetchRegions(parent).then(data => resolve(data))
    },
    value: 'value',
    label: 'label',
    children: 'children',
    checkStrictly: true // 允许选择任意层级
}

// 获取行政区划数据
const fetchRegions = async (parent = null) => {
    try {
        const response = await axios.get(`${baseUrl}/api/region/base/child/list`, {
            params: { parent },
            headers
        })
        const dataArray = Array.isArray(response.data) ? response.data : response.data.data
        if (dataArray && Array.isArray(dataArray)) {
            return dataArray.map(item => ({
                value: item.deviceId,
                label: item.name,
                leaf: item.isLeaf,
                children: item.isLeaf ? undefined : [] // 非叶子节点需要设置空children数组
            }))
        }
        return []
    } catch (error) {
        console.error('获取行政区划数据时出错:', error)
        return []
    }
}

// 处理选择变化
const handleRegionChange = (value) => {
    console.log('选择变化:', value)
    // 只有当选择了三级（省市县）时才触发更新
    if (value && value.length === 3) {
        // 确保值保持字符串格式
        const stringValues = value.map(v => String(v))
        // 发出事件通知父组件
        emit('update:modelValue', stringValues)
    }
}

// 监听外部传入的 modelValue 变化
watch(
    () => props.modelValue,
    (newValue) => {
        if (newValue !== selectedRegion.value) {
            selectedRegion.value = newValue
        }
    }
)

// 初始化加载根级数据
fetchRegions().then(data => {
    regionOptions.value = data
})
</script>