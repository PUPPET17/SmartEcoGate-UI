<template>
    <div class="bg-gray-100 min-h-screen">
        <div class="curved-background">
            <div class="circle-large"></div>
            <div class="circle-small"></div>
            <div class="circle-large2"></div>
            <div class="circle-small1"></div>

            <div class="container">
                <p class="title">行驶证上传</p>
                <div class="underline"></div>
            </div>
        </div>

        <div class="content-wrapper">
            <div class="container">
                <div class="form-container">
                    <div class="form-content">
                        <div class="form-group">
                            <label class="label">行驶证(正面)图片</label>
                            <div class="upload-area" @click="openCapture">
                                <p class="upload-text">点击启用摄像头拍摄照片</p>
                            </div>
                            <div class="upload-area" @click="openInput">
                                <p class="upload-text">点击上传本地文件</p>
                            </div>
                            <span v-if="errors.image" class="error">{{ errors.image }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <el-dialog title="上传行驶证" v-model="showDialog" width="50%" class="my-dialog">
            <label for="car-no" class="label">车牌号</label>
            <input type="text" id="car-no" v-model="formData.carNumber" class="input" placeholder="请输入车牌号"
                style="text-transform:uppercase;">
            <div class="file-input-wrapper">
                <input 
                    type="file" 
                    ref="fileInput"
                    accept="image/*" 
                    @change="handleFileChange2" 
                    class="input" 
                    style="margin-bottom: 20px;"
                />
            </div>
            <span v-if="errors.image" class="error">{{ errors.image }}</span>
            <div class="buttonDiv">
                <button @click="closeDialog" class="button">取消</button>
            </div>
        </el-dialog>
        <el-dialog title="拍照" v-model="showCamera" width="100%" style="margin-top: 0 !important;" class="my-dialog">
            <input type="hidden" v-model="formData.aid">
            <label for="car-no" class="label">车牌号</label>
            <input type="text" id="car-no" v-model="formData.carNumber" class="input" placeholder="请输入车牌号"
                style="text-transform:uppercase;">
            <span v-if="errors.carNumber" class="error">{{ errors.carNumber }}</span>
            <div class="camera-container">
                <video ref="video" playsinline @loadedmetadata="onVideoLoaded" class="video-preview"></video>
                <canvas ref="canvas" class="photo-canvas"></canvas>
                <div ref="squareFrame" class="square-frame"></div>
            </div>
            <div class="buttonDiv">
                <button @click="takePhoto" class="button">{{ captureButtonText }}</button>
                <button @click="recognitionDriving" class="button" :class="recognitionButtonClass">识别并上传</button>
                <button @click="closeCapture" class="button">关闭摄像头</button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { ref, reactive, computed, onUnmounted, onMounted } from 'vue';
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

        const recognitionButtonClass = ref('buttonDisabled');
        const containerSize = ref({ width: 0, height: 0 });

        const errors = reactive({});
        const previewImage = ref(null);
        const showCamera = ref(false);
        const showDialog = ref(false);
        const video = ref(null);
        const canvas = ref(null);
        const captureType = ref(0);
        const mediaStream = ref(null);
        const videoLoaded = ref(false);
        const ocrData = ref(null);

        const getVideoStream = (stream) => {
            mediaStream.value = stream;
            video.value.srcObject = stream;
            video.value.play()
                .then(() => videoLoaded.value = true)
                .catch(error => {
                    console.error('视频播放错误：', error);
                    ElMessage.error('无法播放视频：' + error.message);
                });
        };

        const getMedia = () => {
            if (!navigator.mediaDevices?.getUserMedia) {
                return ElMessage.error('不支持的浏览器或协议，请联系管理员进行反馈');
            }

            const constraints_video = {
                width: { ideal: 880, min: 640, max: 880 },
                height: { ideal: 600, min: 480, max: 600 },
                facingMode: 'environment'
            };

            navigator.mediaDevices.getUserMedia({ audio: false, video: constraints_video })
                .then(getVideoStream)
                .catch(error => {
                    console.error(error);
                    ElMessage.error('无法获取媒体设备：' + error.message);
                });
        };

        const openCapture = () => {
            showCamera.value = true;
            setTimeout(getMedia, 1000);
        };

        const openInput = () =>{
            showDialog.value = true;
        }

        const fileInput = ref(null);

        const handleFileChange2 = (event) => {
            const files = event.target?.files;
            if (!files || files.length === 0) {
                ElMessage.warning('请选择文件');
                return;
            }

            const file = files[0];
            handleFileUpload(file);
        };

        const closeDialog = () => {
            showDialog.value = false;
            // Reset the file input
            if (fileInput.value) {
                fileInput.value.value = '';
            }
            // Reset any errors
            errors.image = '';
        };

        const closeCapture = () => {
            mediaStream.value?.getTracks().forEach(track => track.stop());
            showCamera.value = false;
        };

        const takePhoto = () => {
            if (captureType.value === 1) {
                resetPhotoState();
                return;
            }

            if (!video.value || !canvas.value) return;

            const { videoWidth, videoHeight } = video.value;
            canvas.value.width = videoWidth;
            canvas.value.height = videoHeight;
            canvas.value.getContext('2d').drawImage(video.value, 0, 0, videoWidth, videoHeight);

            captureType.value = 1;
            recognitionButtonClass.value = 'buttonEnabled';
        };

        const resetPhotoState = () => {
            previewImage.value = null;
            captureType.value = 0;
            recognitionButtonClass.value = 'buttonDisabled';
            const ctx = canvas.value.getContext('2d');
            ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
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

        const stopVideoStream = () => {
            mediaStream.value?.getTracks().forEach(track => track.stop());
        };

        const handleUploadResponse = (response) => {
            if (response.success) {
                ElMessage.success(response.msg || '识别成功');
                ocrData.value = response.data;
                router.push({
                    path: '/wx/carinfo',
                    query: { ocrData: JSON.stringify(ocrData.value), aid: route.query.aid }
                });
            } else {
                ElMessage.error(response.msg || '识别失败');
            }
        };

        const handleError = (error) => {
            if (error.response) {
                if (error.response.status === 500) {
                    ElMessage.error(error.response.data || '识别结果异常，请重新拍照');
                } else {
                    ElMessage.error(error.response.data || '请求错误');
                }
            } else {
                ElMessage.error(error.message || '上传失败，请稍后再试');
            }
            console.error('上传文件错误', error);
        };

        const submitForm = () => {
            errors.carNumber = formData.carNumber ? '' : '请输入车牌号';
            errors.image = previewImage.value ? '' : '请上传行驶证图片';

            if (!errors.carNumber && !errors.image) {
                request({
                    url: '/wx/aliyun/upImg',
                    method: 'post',
                    data: formData
                }).then(response => {
                    if (response.success) {
                        ElMessage.success('提交成功');
                    } else {
                        ElMessage.error(response.msg || '提交失败');
                    }
                }).catch(error => {
                    console.error('Error submitting form:', error);
                    ElMessage.error('提交表单时出错');
                });
            }
        };

        onUnmounted(() => closeCapture());

        onMounted(() => {
            const resizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    if (entry.target === video.value.parentElement) {
                        containerSize.value = { width: entry.contentRect.width, height: entry.contentRect.height };
                        adjustVideoSize();
                    }
                }
            });

            if (video.value?.parentElement) {
                resizeObserver.observe(video.value.parentElement);
            }
        });

        return {
            formData,
            errors,
            previewImage,
            showCamera,
            video,
            canvas,
            captureType,
            openCapture,
            openInput,
            handleFileChange2,
            showDialog,
            takePhoto,
            recognitionDriving,
            closeCapture,
            handleFileChange,
            submitForm,
            captureButtonText: computed(() => captureType.value === 1 ? '重新拍照' : '拍照'),
            recognitionButtonClass: computed(() => recognitionButtonClass.value)
        };
    }
};
</script>

<style scoped>
.bg-gray-100 {
    background-color: #f7fafc;
    overflow: hidden;
}

.container {
    margin: 0 auto;
    max-width: 600px;
    padding: 20px;
    text-align: center;
}

.title {
    font-size: 2rem;
    font-weight: bold;
    color: #ffffff;
    margin: 1rem 0;
}

.underline {
    width: 100px;
    height: 5px;
    background: rgb(11, 152, 84);
    margin: 0 auto 1rem auto;
}

.curved-background {
    position: relative;
    background: linear-gradient(to right, #2b6cb0, #63b3ed);
    border-radius: 0 0 20px 20px;
    padding: 20px 0;
}

.circle-large,
.circle-large2 {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
}

.circle-large {
    width: 200px;
    height: 200px;
    top: -50px;
    left: -50px;
}

.circle-large2 {
    width: 250px;
    height: 250px;
    bottom: -60px;
    right: -50px;
}

.circle-small,
.circle-small1 {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
}

.circle-small {
    width: 100px;
    height: 100px;
    top: 50px;
    left: 100px;
}

.circle-small1 {
    width: 80px;
    height: 80px;
    bottom: 20px;
    right: 100px;
}

.content-wrapper {
    padding: 20px;
}

.form-container {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.form-group {
    margin-bottom: 20px;
    text-align: left;
}

.label {
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
    color: #333;
}

.input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.upload-area {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: 2px dashed #ccc;
    border-radius: 4px;
    padding: 20px;
    margin-top: 10px;
}

.upload-icon {
    width: 30px;
    height: 30px;
    margin-right: 10px;
}

.upload-text {
    color: #666;
}

.error {
    color: red;
    font-size: 0.875rem;
}

.submit-button {
    text-align: center;
    margin-top: 20px;
}

.button {
    background-color: #3182ce;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.button:hover {
    background-color: #2b6cb0;
}

.modal-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.modal-card {
    background: white;
    border-radius: 8px;
    padding: 20px;
    z-index: 10;
}

.videoDiv {
    position: relative;
}

.viewport {
    position: relative;
    width: 880px;
    height: 600px;
}

.buttonDisabled {
    background-color: #ccc;
    color: white;
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    cursor: not-allowed;
}

.alert {
    color: #e53e3e;
    margin-bottom: 10px;
}

.buttonEnabled {
    background-color: #38a169;
    color: white;
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.el-dialog:not(.is-fullscreen) {
    margin-top: 0 !important
}

.my-dialog {
    height: 100%;
    /* 使用全高 */
    margin: 0;
    overflow: hidden !important;
    margin: 0 !important;
    /* 消除默认边距 */
}

.camera-container {
    position: relative;
    width: 100%;
    height: 0;
    padding-bottom: 75%;
    /* 4:3 aspect ratio */
}

.video-preview,
.photo-canvas {
    position: absolute;
    top: 0;
    right: auto;
    left: auto;
    width: 880;
    height: 100%;
}

.square-frame {
    position: absolute;
    top: 5%;
    left: 7%;
    width: 35.5%;
    /* 3/8 of the width */
    aspect-ratio: 1 / 1;
    border: 4px solid rgb(211, 38, 38);
    box-sizing: border-box;
}

.camera-container {
    position: relative;
    width: 100%;
    height: calc(90vh - 120px);
    /* 预留空间给按钮区域，120px 可根据按钮高度调整 */
    overflow: hidden;
    /* 隐藏溢出内容 */
}

.video-preview {
    position: absolute;
    top: 50%;
    left: 50%;
    width: auto;
    /* 自动宽度 */
    height: 600;
    /* 填满容器高度 */
    max-height: 100%;
    /* 限制最大高度 */
    max-width: 400px;
    /* 不限制最大宽度 */
    transform: translate(-50%, -50%);
    /* 居中显示 */
}

.buttonDiv {
    display: flex;
    justify-content: space-around;
    /* 按钮之间的空间 */
    align-items: center;
    height: 120px;
    /* 预留空间 */
}

.button {
    flex: 1;
    /* 按钮均分 */
    margin: 0 10px;
    /* 按钮间距 */
    padding: 10px;
    /* 内边距 */
    background-color: #007bff;
    /* 按钮背景颜色 */
    color: white;
    /* 按钮文字颜色 */
    border: none;
    /* 去掉边框 */
    border-radius: 5px;
    /* 圆角 */
    cursor: pointer;
    /* 鼠标悬停效果 */
}

.button:hover {
    background-color: #0056b3;
    /* 鼠标悬停时改变背景颜色 */
}
</style>