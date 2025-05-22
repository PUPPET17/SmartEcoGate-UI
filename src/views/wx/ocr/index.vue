<template>
    <div class="page-container">
        <header class="header">
            <div class="header-background">
                <div class="blob blob-1"></div>
                <div class="blob blob-2"></div>
                <div class="blob blob-3"></div>
            </div>
            <div class="header-content">
                <h1 class="title">行驶证上传</h1>
                <div class="title-underline"></div>
            </div>
        </header>

        <main class="main-content">
            <div class="upload-card">
                <div class="form-group">
                    <label class="input-label">车牌号码</label>
                    <el-input type="text" v-model="formData.carNumber" class="input-field" placeholder="请输入车牌号"
                        @input="handleInput" style="text-transform: uppercase" />
                </div>

                <div v-if="ocrData" class="form-group">
                    <label class="input-label">识别结果</label>
                    <div class="ocr-result">
                        {{ ocrData.vehicleLicenseId }}
                        <button class="copy-button" @click="copyOcrResult">
                            <svg class="copy-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="form-group">
                    <label class="input-label">上传图片</label>
                    <div class="upload-area">
                        <div class="upload-content">
                            <div v-if="!imagePreview" class="upload-placeholder" @click="triggerFileInput">
                                <svg class="upload-icon" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                    <path
                                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                                <div class="upload-text">
                                    <label class="upload-button">
                                        <span>拍摄</span>
                                        <input type="file" ref="fileInput" accept="image/*" @change="handleFileChange2"
                                            class="hidden-input" />
                                    </label>
                                    <p class="upload-hint">或从图库选择清晰行驶证图片</p>
                                </div>
                            </div>
                            <div v-else class="preview-container">
                                <img :src="imagePreview" alt="预览图片" class="preview-image" />
                                <button @click="imagePreview = null" class="remove-button">
                                    <svg class="remove-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                    <p v-if="errors.image" class="error-text">{{ errors.image }}</p>
                </div>
                <div class="form-group">
                    <button class="submit-button" @click="checkPlateNumAndRoute">提交</button>
                </div>
            </div>
        </main>
    </div>
</template>
<script>
import { ref, reactive } from 'vue';
import request from '@/utils/request';
import { ElMessage } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';

export default {
    name: 'DrivingLicenseUpload',
    setup() {
        const route = useRoute();
        const router = useRouter();

        const formData = reactive({
            aid: route.query.aid,
            carNumber: '',
            image: null
        });

        const imagePreview = ref(null);
        const errors = reactive({});
        const previewImage = ref(null);
        const showCamera = ref(false);
        const showDialog = ref(false);
        const video = ref(null);
        const canvas = ref(null);
        const captureType = ref(0);
        const ocrData = ref(null);

        // 初始化时检查URL中是否有plateNo参数
        if (route.query.plateNo) {
            formData.carNumber = route.query.plateNo.toString().toUpperCase();
        }

        const triggerFileInput = () => {
            document.querySelector('input[type="file"]').click();
        };

        const compressImage = (file) => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = (e) => {
                    const img = new Image();
                    img.src = e.target.result;
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        let width = img.width;
                        let height = img.height;

                        // 设置最大宽度和高度
                        const maxWidth = 1200;
                        const maxHeight = 800;

                        if (width > height) {
                            if (width > maxWidth) {
                                height = Math.round((height * maxWidth) / width);
                                width = maxWidth;
                            }
                        } else {
                            if (height > maxHeight) {
                                width = Math.round((width * maxHeight) / height);
                                height = maxHeight;
                            }
                        }

                        canvas.width = width;
                        canvas.height = height;

                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);

                        // 转换为 Blob，压缩质量为 0.8
                        canvas.toBlob((blob) => {
                            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
                        }, 'image/jpeg', 0.8);
                    };
                };
            });
        };

        const handleFileChange2 = async (event) => {
            const file = event.target.files[0];
            if (!file) {
                ElMessage.warning('请选择文件');
                return;
            }

            // 显示预览图
            imagePreview.value = URL.createObjectURL(file);

            try {
                // 压缩图片
                const compressedFile = await compressImage(file);
                console.log('原始文件大小：', file.size / 1024 / 1024, 'MB');
                console.log('压缩后文件大小：', compressedFile.size / 1024 / 1024, 'MB');

                const formDataUpload = new FormData();
                formDataUpload.append('file', compressedFile);

                const response = await request({
                    url: '/wx/image/ocr',
                    method: 'post',
                    data: formDataUpload,
                    headers: { 'Content-Type': 'multipart/form-data', 'skipAuth': true },
                    timeout: 20000
                });

                handleOcrResponse(response);
            } catch (error) {
                handleError(error);
            }
        };

        const handleOcrResponse = (response) => {
            if (response.success) {
                ElMessage.success(response.msg || '识别成功');
                ocrData.value = response.data;
                console.log(ocrData.value);
            } else {
                ElMessage.error(response.msg || '识别失败');
            }
        };

        const checkPlateNumAndRoute = () => {
            if (formData.carNumber == '') {
                ElMessage.error('请填写有效的车牌号');
                return;
            }
            if (!ocrData.value) {
                if (imagePreview.value) {
                    ElMessage.warning('图片识别中，请耐心等待...');
                } else {
                    ElMessage.error('请先上传行驶证图片');
                }
                return;
            }
            if (ocrData.value.vehicleLicenseId !== formData.carNumber) {
                console.log(ocrData.value.vehicleLicenseId + "    " + formData.carNumber);
                ElMessage.error('识别结果与填写的车牌号不一致，请检查车牌号是否填写正确或重新上传图片');
                return;
            } else {
                router.push({
                    path: '/wx/carinfo',
                    query: { 
                        ocrData: JSON.stringify(ocrData.value), 
                        aid: route.query.aid,
                        isAutoOpen: route.query.isAutoOpen || '0'
                    }
                });
            }
        };

        const recognitionDriving = () => {
            canvas.value.toBlob(blob => {
                const file = new File([blob], 'driving_license.jpg', { type: 'image/jpg' });
                handleFileUpload(file);
            }, 'image/jpg');
        };

        const handleFileChange = (event) => {
            const file = event.target.files[0];
            if (file) handleFileUpload(file);
        };

        const handleFileUpload = async (file) => {
            stopVideoStream();
            if (!file || !(file instanceof File)) {
                return ElMessage.error('请选择有效的文件');
            }

            if (!formData.carNumber) {
                errors.carNumber = '请输入车牌号';
                return;
            }

            errors.carNumber = '';
            const formDataUpload = new FormData();
            formDataUpload.append('file', file);
            formDataUpload.append('carNumber', formData.carNumber);

            try {
                const response = await request({
                    url: '/wx/image/upDrivingVehicleFile',
                    method: 'post',
                    data: formDataUpload,
                    headers: { 'Content-Type': 'multipart/form-data', 'skipAuth': true },
                    timeout: 20000
                });

                handleUploadResponse(response);
            } catch (error) {
                handleError(error);
            }
        };

        const handleUploadResponse = (response) => {
            if (response.success) {
                ElMessage.success(response.msg || '识别成功');
                ocrData.value = response.data;
                router.push({
                    path: '/wx/carinfo',
                    query: {
                        ocrData: JSON.stringify(ocrData.value),
                        aid: route.query.aid,
                        isAutoOpen: route.query.isAutoOpen || '0'
                    }
                });
            } else {
                ElMessage.error(response.msg || '识别失败');
            }
        };

        const handleError = (error) => {
            if (error.response) {
                if (error.response.status === 500) {
                    ElMessage.error('识别结果异常，请重新拍照');
                } else {
                    ElMessage.error(error.response.data || '请求错误');
                }
            } else {
                ElMessage.error(error.message || '上传失败，请稍后再试');
            }
            console.error('上传文件错误', error);
        };

        const handleInput = (value) => {
            formData.carNumber = value.toUpperCase();
        };

        // 添加复制功能
        const copyOcrResult = () => {
            if (ocrData.value && ocrData.value.vehicleLicenseId) {
                // 创建一个临时textarea元素
                const element = document.createElement('textarea');
                // 设置要复制的文本
                element.value = ocrData.value.vehicleLicenseId;
                // 防止在手机上弹出键盘
                element.setAttribute('readonly', '');
                // 设置样式使其不可见
                element.style.position = 'absolute';
                element.style.left = '-9999px';
                element.style.fontSize = '12pt'; // 防止iOS缩放
                
                // 添加到文档中
                document.body.appendChild(element);
                
                // 选择文本
                element.select();
                // 兼容iOS
                element.setSelectionRange(0, element.value.length);
                
                // 执行复制
                let isSuccess = false;
                try {
                    isSuccess = document.execCommand('copy');
                    if (isSuccess) {
                        ElMessage.success('已复制到剪贴板');
                    } else {
                        ElMessage.error('复制失败，请手动复制');
                    }
                } catch (err) {
                    ElMessage.error('复制失败: ' + err);
                }
                
                // 移除临时元素
                document.body.removeChild(element);
            }
        };

        return {
            formData,
            errors,
            previewImage,
            showCamera,
            video,
            canvas,
            captureType,
            triggerFileInput,
            handleFileChange2,
            imagePreview,
            showDialog,
            recognitionDriving,
            handleFileChange,
            checkPlateNumAndRoute,
            ocrData,
            handleInput,
            copyOcrResult,
        };
    }
};
</script>

<style scoped>
.page-container {
    min-height: 100vh;
    background: linear-gradient(180deg, #EBF5FF 0%, #FFFFFF 100%);
}

.header {
    position: relative;
    background: linear-gradient(90deg, #2563EB 0%, #60A5FA 100%);
    padding: 48px 0 128px;
}

.hidden-input {
    display: none;
}

.header-background {
    position: absolute;
    inset: 0;
    overflow: hidden;
}

.blob {
    position: absolute;
    width: 192px;
    height: 192px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.2);
    mix-blend-mode: multiply;
    filter: blur(24px);
    animation: blob 7s infinite;
}

.blob-1 {
    top: -16px;
    left: -16px;
    background-color: rgba(59, 130, 246, 0.2);
}

.blob-2 {
    top: 0;
    right: 0;
    animation-delay: 2s;
    background-color: rgba(147, 197, 253, 0.2);
}

.blob-3 {
    bottom: -32px;
    left: 80px;
    animation-delay: 4s;
    background-color: rgba(96, 165, 250, 0.2);
}

.header-content {
    position: relative;
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 16px;
}

.title {
    text-align: center;
    font-size: 30px;
    font-weight: bold;
    color: white;
    margin: 0;
}

.title-underline {
    width: 96px;
    height: 4px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 2px;
    margin: 8px auto 0;
}

.main-content {
    position: relative;
    z-index: 1;
    margin-top: -128px;
    padding: 0 16px 48px;
}

.upload-card {
    max-width: 1280px;
    margin: 0 auto;
    background: white;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form-group {
    margin-bottom: 24px;
}

.input-label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    margin-bottom: 8px;
}

.input-field {
    width: 100%;
    border: 1px solid #D1D5DB;
    border-radius: 6px;
    padding: 8px 12px;
    transition: all 0.3s;
}

.input-field:focus {
    border-color: #3B82F6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.upload-area {
    border: 2px dashed #D1D5DB;
    border-radius: 8px;
    padding: 24px;
    margin-top: 8px;
}

.upload-content {
    text-align: center;
}

.upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

.upload-icon {
    width: 48px;
    height: 48px;
    color: #9CA3AF;
    margin-bottom: 8px;
}

.upload-text {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 14px;
    color: #6B7280;
}

.upload-button {
    color: #2563EB;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.3s;
}

.upload-button:hover {
    color: #1D4ED8;
}

.hidden-input {
    display: none;
}

.upload-hint {
    margin: 0;
}

.file-types {
    font-size: 12px;
    color: #6B7280;
    margin: 4px 0 0;
}

.preview-container {
    position: relative;
    display: inline-block;
}

.preview-image {
    max-height: 256px;
    border-radius: 8px;
    object-fit: cover;
}

.remove-button {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 24px;
    height: 24px;
    border: none;
    border-radius: 50%;
    background: #EF4444;
    color: white;
    padding: 4px;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: background-color 0.3s;
}

.remove-button:hover {
    background: #DC2626;
}

.remove-icon {
    width: 16px;
    height: 16px;
}

.error-text {
    color: #DC2626;
    font-size: 14px;
    margin: 8px 0 0;
}

.submit-button {
    width: 100%;
    padding: 12px 0;
    background-color: #409EFF;
    /* 蓝色主题色，可根据需要调整 */
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.submit-button:hover {
    background-color: #66b1ff;
}

.submit-button:active {
    background-color: #3a8ee6;
}

.form-group {
    margin: 20px 0;
    padding: 0 15px;
}

@keyframes blob {
    0% {
        transform: translate(0px, 0px) scale(1);
    }

    33% {
        transform: translate(30px, -50px) scale(1.1);
    }

    66% {
        transform: translate(-20px, 20px) scale(0.9);
    }

    100% {
        transform: translate(0px, 0px) scale(1);
    }
}

@media (min-width: 640px) {
    .upload-card {
        padding: 32px;
    }
}

@media (max-width: 639px) {
    .header {
        padding: 32px 0 96px;
    }

    .main-content {
        margin-top: -96px;
    }

    .title {
        font-size: 24px;
    }

    .upload-area {
        padding: 16px;
    }
}

.ocr-result {
    padding: 10px;
    background-color: #f0f9ff;
    border: 1px solid #bae6fd;
    border-radius: 6px;
    color: #0369a1;
    font-size: 14px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.copy-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 5px;
    position: relative;
    color: #3B82F6;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    border-radius: 4px;
}

.copy-button:hover {
    background-color: rgba(59, 130, 246, 0.1);
}

.copy-icon {
    width: 18px;
    height: 18px;
}

.copy-button .tooltip {
    position: absolute;
    bottom: -25px;
    right: 0;
    background-color: #374151;
    color: white;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 12px;
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s ease;
    z-index: 10;
}

.copy-button:hover .tooltip {
    opacity: 1;
    visibility: visible;
}
</style>