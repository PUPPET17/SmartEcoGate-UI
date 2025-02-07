<template>

    <span>新增成功！</span>
    <span>您现在可以点击下方按钮打开闸门</span>
    <span slot="footer" class="dialog-footer">
        <el-button @click="openTheGate">打开闸门</el-button>
    </span>

</template>

<script setup>
import { ref, reactive, toRefs } from 'vue';
import { addOffSiteVehicleNoAuth,openGate } from "@/api/wx/offSite";
import { useRoute, useRouter } from 'vue-router';

</script>

<style scoped></style>