<template>
    <div class="pixelate-container">
        <div class="control-panel">
            <el-upload
                class="image-uploader"
                :show-file-list="false"
                :auto-upload="false"
                :on-change="handleFileChange"
            >
                <div class="upload-area" v-if="!imageUrl">
                    <el-icon class="upload-icon"><Plus /></el-icon>
                    <div class="upload-text">点击上传图片</div>
                </div>
                <img v-else :src="imageUrl" class="preview-image">
            </el-upload>

            <div class="url-input">
                <el-input
                    v-model="imageUrlInput"
                    placeholder="输入图片URL"
                    clearable
                >
                    <template #append>
                        <el-button @click="handleUrlSubmit">确定</el-button>
                    </template>
                </el-input>
            </div>

            <div class="settings" v-if="imageUrl">
                <el-form label-position="top">
                    <el-form-item label="像素大小">
                        <el-slider
                            v-model="pixelSize"
                            :min="1"
                            :max="50"
                            @change="processImage"
                        />
                    </el-form-item>
                    <el-form-item label="颜色数量">
                        <el-slider
                            v-model="colorLevels"
                            :min="2"
                            :max="256"
                            :step="2"
                            @change="processImage"
                        />
                    </el-form-item>
                </el-form>
                <el-button type="primary" @click="downloadImage">下载图片</el-button>
            </div>
        </div>

        <div class="result-display" v-if="processedImageUrl">
            <img :src="processedImageUrl" class="result-image">
        </div>
    </div>
</template>

<script>
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

export default {
    name: 'PixelateImage',
    components: {
        Plus
    },
    setup() {
        const imageUrl = ref('')
        const processedImageUrl = ref('')
        const pixelSize = ref(8)
        const colorLevels = ref(32)
        const imageUrlInput = ref('')

        const handleFileChange = (file) => {
            const isImage = file.raw.type.startsWith('image/')
            const isLt2M = file.raw.size / 1024 / 1024 < 2

            if (!isImage) {
                ElMessage.error('只能上传图片文件！')
                return
            }
            if (!isLt2M) {
                ElMessage.error('图片大小不能超过 2MB！')
                return
            }

            imageUrl.value = URL.createObjectURL(file.raw)
            processImage()
        }

        const handleUrlSubmit = async () => {
            if (!imageUrlInput.value) {
                ElMessage.error('请输入图片URL')
                return
            }

            try {
                const img = new Image()
                img.crossOrigin = 'anonymous'  // 处理跨域
                img.src = imageUrlInput.value

                await new Promise((resolve, reject) => {
                    img.onload = resolve
                    img.onerror = () => reject(new Error('图片加载失败'))
                })

                imageUrl.value = imageUrlInput.value
                processImage()
            } catch (error) {
                ElMessage.error('图片加载失败，请检查URL是否正确或是否支持跨域访问')
            }
        }

        const processImage = async () => {
            if (!imageUrl.value) return

            try {
                const img = new Image()
                img.crossOrigin = 'anonymous'  // 处理跨域
                img.src = imageUrl.value
                
                await new Promise((resolve, reject) => {
                    img.onload = resolve
                    img.onerror = () => reject(new Error('图片加载失败'))
                })

                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')

                // 设置画布大小
                const scale = Math.min(800 / img.width, 800 / img.height)
                canvas.width = img.width * scale
                canvas.height = img.height * scale

                // 绘制原始图片
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

                // 获取图片数据
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                const data = imageData.data

                // 像素化处理
                for (let y = 0; y < canvas.height; y += pixelSize.value) {
                    for (let x = 0; x < canvas.width; x += pixelSize.value) {
                        let r = 0, g = 0, b = 0
                        let count = 0

                        // 计算区块平均颜色
                        for (let py = y; py < y + pixelSize.value && py < canvas.height; py++) {
                            for (let px = x; px < x + pixelSize.value && px < canvas.width; px++) {
                                const i = (py * canvas.width + px) * 4
                                r += data[i]
                                g += data[i + 1]
                                b += data[i + 2]
                                count++
                            }
                        }

                        r = Math.round(r / count)
                        g = Math.round(g / count)
                        b = Math.round(b / count)

                        // 颜色量化
                        const step = 256 / colorLevels.value
                        r = Math.round(r / step) * step
                        g = Math.round(g / step) * step
                        b = Math.round(b / step) * step

                        // 填充区块
                        for (let py = y; py < y + pixelSize.value && py < canvas.height; py++) {
                            for (let px = x; px < x + pixelSize.value && px < canvas.width; px++) {
                                const i = (py * canvas.width + px) * 4
                                data[i] = r
                                data[i + 1] = g
                                data[i + 2] = b
                            }
                        }
                    }
                }

                ctx.putImageData(imageData, 0, 0)
                processedImageUrl.value = canvas.toDataURL('image/png')
            } catch (error) {
                ElMessage.error('图片处理失败，请检查网络连接或图片格式')
            }
        }

        const downloadImage = () => {
            if (!processedImageUrl.value) return
            
            const link = document.createElement('a')
            link.download = 'pixelated-image.png'
            link.href = processedImageUrl.value
            link.click()
        }

        return {
            imageUrl,
            processedImageUrl,
            pixelSize,
            colorLevels,
            imageUrlInput,
            handleFileChange,
            handleUrlSubmit,
            processImage,
            downloadImage
        }
    }
}
</script>

<style scoped>
.pixelate-container {
    padding: 20px;
    display: flex;
    gap: 20px;
    min-height: calc(100vh - 64px);
    background: #fff;
}

.control-panel {
    width: 300px;
    background: #f5f7fa;
    padding: 20px;
    border-radius: 4px;
}

.image-uploader {
    width: 100%;
}

.upload-area {
    width: 100%;
    height: 200px;
    border: 1px dashed #dcdfe6;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background: #fff;
}

.upload-area:hover {
    border-color: #409EFF;
}

.upload-icon {
    font-size: 28px;
    color: #909399;
    margin-bottom: 8px;
}

.upload-text {
    color: #606266;
    font-size: 14px;
}

.preview-image {
    width: 100%;
    height: 200px;
    object-fit: contain;
}

.url-input {
    margin-top: 20px;
    padding: 15px;
    background: #fff;
    border-radius: 4px;
}

.settings {
    margin-top: 20px;
    padding: 15px;
    background: #fff;
    border-radius: 4px;
}

.result-display {
    flex: 1;
    background: #f5f7fa;
    padding: 20px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.result-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}

:deep(.el-form-item__label) {
    color: #606266;
}

:deep(.el-button) {
    width: 100%;
}
</style> 