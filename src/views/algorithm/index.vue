<template>
    <div class="algorithm-container">
        <h1 class="page-title">算法可视化</h1>
        <el-row :gutter="20">
            <el-col :span="8">
                <router-link to="/algorithm/dijkstra">
                    <div class="algorithm-card">
                        <div class="card-icon">
                            <el-icon><Share /></el-icon>
                        </div>
                        <div class="card-content">
                            <h2>Dijkstra 最短路径算法</h2>
                            <p>通过贪心策略寻找图中两点间的最短路径，支持动态添加节点和边</p>
                        </div>
                    </div>
                </router-link>
            </el-col>
            <el-col :span="8">
                <router-link to="/algorithm/astar">
                    <div class="algorithm-card">
                        <div class="card-icon">
                            <el-icon><Location /></el-icon>
                        </div>
                        <div class="card-content">
                            <h2>A* 寻路算法</h2>
                            <p>结合启发式搜索的路径规划算法，可以在网格地图中寻找最短路径</p>
                        </div>
                    </div>
                </router-link>
            </el-col>
            <el-col :span="8">
                <router-link to="/algorithm/pixelate">
                    <div class="algorithm-card">
                        <div class="card-icon">
                            <el-icon><Picture /></el-icon>
                        </div>
                        <div class="card-content">
                            <h2>图片像素化</h2>
                            <p>将普通图片转换为像素风格图片，支持调整像素大小和颜色深度</p>
                        </div>
                    </div>
                </router-link>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import { Share, Location, Picture } from '@element-plus/icons-vue'

export default {
    name: 'AlgorithmIndex',
    components: {
        Share,
        Location,
        Picture
    }
}
</script>

<style scoped>
.algorithm-container {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: 100vh;
}

.page-title {
    margin-bottom: 30px;
    color: #303133;
    font-size: 28px;
    font-weight: 600;
}

.algorithm-card {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    padding: 20px;
    transition: all 0.3s ease;
    cursor: pointer;
    display: flex;
    gap: 20px;
    align-items: center;
    margin-bottom: 20px;
}

.algorithm-card:hover {
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
}

.card-icon {
    width: 60px;
    height: 60px;
    background-color: #e6f7ff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.card-icon :deep(.el-icon) {
    font-size: 30px;
    color: #1890ff;
}

.card-content {
    flex: 1;
}

.card-content h2 {
    margin: 0 0 10px 0;
    color: #303133;
    font-size: 18px;
}

.card-content p {
    margin: 0;
    color: #606266;
    font-size: 14px;
}

a {
    text-decoration: none;
}
</style> 