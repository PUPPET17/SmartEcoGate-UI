<template>
    <div class="astar-container">
        <!-- 控制面板 -->
        <el-row :gutter="20" class="mb-20">
            <el-col :span="24">
                <div class="control-panel card-panel">
                    <div class="panel-title">
                        <el-icon>
                            <Operation />
                        </el-icon>
                        <span>算法控制</span>
                    </div>
                    <div class="button-group">
                        <el-button type="primary" size="large" @click="startAlgorithm">
                            <el-icon>
                                <VideoPlay />
                            </el-icon>
                            开始算法
                        </el-button>
                        <el-button size="large" @click="resetGrid">
                            <el-icon>
                                <Refresh />
                            </el-icon>
                            重置网格
                        </el-button>
                        <el-button type="warning" size="large" @click="generateRandomWalls">
                            <el-icon>
                                <MagicStick />
                            </el-icon>
                            随机障碍
                        </el-button>
                    </div>
                    <div class="control-options">
                        <el-select v-model="gridSize" placeholder="网格大小" size="large">
                            <el-option label="10 x 10" :value="10" />
                            <el-option label="20 x 20" :value="20" />
                            <el-option label="30 x 30" :value="30" />
                            <el-option label="40 x 40" :value="40" />
                            <el-option label="50 x 50" :value="50" />
                        </el-select>
                        <el-slider v-model="wallDensity" :min="10" :max="40" :step="5" show-input
                            :format-tooltip="value => `${value}%`">
                            <template #label>
                                <span>障碍密度</span>
                            </template>
                        </el-slider>
                        <el-slider v-model="animationSpeed" :min="10" :max="200" :step="10" show-input
                            :format-tooltip="value => `${value}ms`">
                            <template #label>
                                <span>动画速度</span>
                            </template>
                        </el-slider>
                    </div>
                </div>
            </el-col>
        </el-row>

        <!-- 网格展示和计算过程 -->
        <el-row :gutter="20">
            <el-col :span="16">
                <div class="grid-panel card-panel">
                    <div class="panel-title">
                        <el-icon>
                            <Grid />
                        </el-icon>
                        <span>路径网格</span>
                    </div>
                    <div ref="gridContainer" class="grid-container">
                        <canvas ref="canvas" width="600" height="600"></canvas>
                    </div>
                </div>
            </el-col>
            <el-col :span="8">
                <div class="calculation-panel card-panel">
                    <div class="panel-title">
                        <el-icon>
                            <Monitor />
                        </el-icon>
                        <span>计算过程</span>
                    </div>
                    <div class="calculation-content">
                        <el-scrollbar height="600px">
                            <el-timeline>
                                <el-timeline-item v-for="(step, index) in calculationSteps" :key="index"
                                    :type="step.type" :color="step.color" :size="'large'">
                                    <h4>{{ step.title }}</h4>
                                    <p>{{ step.description }}</p>
                                </el-timeline-item>
                            </el-timeline>
                        </el-scrollbar>
                    </div>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import { Operation, VideoPlay, Refresh, Grid, Monitor, MagicStick } from '@element-plus/icons-vue'

export default {
    name: 'AStar',
    components: {
        Operation,
        VideoPlay,
        Refresh,
        Grid,
        Monitor,
        MagicStick
    },
    data() {
        return {
            gridSize: 100,
            animationSpeed: 50,
            wallDensity: 20, // 默认障碍物密度 20%
            grid: [],
            startNode: null,
            endNode: null,
            calculationSteps: [],
            svg: null,
            isRunning: false
        }
    },
    watch: {
        gridSize: {
            handler(newVal) {
                this.resetGrid()
            }
        }
    },
    mounted() {
        this.initializeGrid()
        window.addEventListener('resize', this.handleResize)
    },
    beforeUnmount() {
        window.removeEventListener('resize', this.handleResize)
    },
    methods: {
        handleResize() {
            this.drawGrid()
        },
        initializeGrid() {
            // 初始化网格
            this.grid = Array(this.gridSize).fill().map(() =>
                Array(this.gridSize).fill().map(() => ({
                    isWall: false,
                    isStart: false,
                    isEnd: false,
                    f: 0,
                    g: 0,
                    h: 0,
                    parent: null
                }))
            )

            this.drawGrid()

            // 添加 Canvas 点击事件监听
            if (this.$refs.canvas) {
                this.$refs.canvas.addEventListener('click', this.handleCanvasClick)
            }
        },
        drawGrid() {
            const canvas = this.$refs.canvas
            const ctx = canvas.getContext('2d')
            const width = canvas.width
            const height = canvas.height
            const cellSize = width / this.gridSize

            // 清空画布
            ctx.clearRect(0, 0, width, height)

            // 绘制网格
            for (let i = 0; i < this.gridSize; i++) {
                for (let j = 0; j < this.gridSize; j++) {
                    const cell = this.grid[i][j]
                    const x = j * cellSize
                    const y = i * cellSize

                    // 设置单元格颜色
                    if (cell.isStart) {
                        ctx.fillStyle = '#67C23A'
                    } else if (cell.isEnd) {
                        ctx.fillStyle = '#F56C6C'
                    } else if (cell.isWall) {
                        ctx.fillStyle = '#909399'
                    } else {
                        ctx.fillStyle = 'white'
                    }

                    // 绘制单元格
                    ctx.fillRect(x, y, cellSize, cellSize)
                    ctx.strokeStyle = '#ddd'
                    ctx.strokeRect(x, y, cellSize, cellSize)
                }
            }
        },
        handleCanvasClick(event) {
            const canvas = this.$refs.canvas
            const rect = canvas.getBoundingClientRect()
            const x = event.clientX - rect.left
            const y = event.clientY - rect.top
            const cellSize = canvas.width / this.gridSize

            // 计算点击的网格坐标
            const j = Math.floor(x / cellSize)
            const i = Math.floor(y / cellSize)

            // 确保坐标在有效范围内
            if (i >= 0 && i < this.gridSize && j >= 0 && j < this.gridSize) {
                this.handleCellClick(i, j)
            }
        },
        handleCellClick(i, j) {
            if (!this.startNode) {
                this.startNode = { i, j }
                this.grid[i][j].isStart = true
                this.addCalculationStep('设置起点', `在位置 (${i}, ${j}) 设置起点`, 'success')
            } else if (!this.endNode) {
                this.endNode = { i, j }
                this.grid[i][j].isEnd = true
                this.addCalculationStep('设置终点', `在位置 (${i}, ${j}) 设置终点`, 'danger')
            } else {
                this.grid[i][j].isWall = !this.grid[i][j].isWall
                this.addCalculationStep('切换障碍', `在位置 (${i}, ${j}) ${this.grid[i][j].isWall ? '添加' : '移除'}障碍`, 'warning')
            }
            this.drawGrid()
        },
        updateCell(i, j, color) {
            const canvas = this.$refs.canvas
            const ctx = canvas.getContext('2d')
            const cellSize = canvas.width / this.gridSize

            ctx.fillStyle = color
            ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize)
            ctx.strokeStyle = '#ddd'
            ctx.strokeRect(j * cellSize, i * cellSize, cellSize, cellSize)
        },
        addCalculationStep(title, description, type) {
            const colors = {
                'success': '#67C23A',
                'warning': '#E6A23C',
                'danger': '#F56C6C',
                'info': '#909399'
            }
            this.calculationSteps.push({
                title,
                description,
                type,
                color: colors[type]
            })
        },
        // 计算曼哈顿距离作为启发式函数
        calculateHeuristic(node, end) {
            return Math.abs(node.i - end.i) + Math.abs(node.j - end.j)
        },

        // 获取相邻节点
        getNeighbors(node) {
            const neighbors = []
            const directions = [
                { i: -1, j: 0 }, // 上
                { i: 1, j: 0 },  // 下
                { i: 0, j: -1 }, // 左
                { i: 0, j: 1 }   // 右
            ]

            for (const dir of directions) {
                const newI = node.i + dir.i
                const newJ = node.j + dir.j

                // 检查边界
                if (newI >= 0 && newI < this.gridSize && newJ >= 0 && newJ < this.gridSize) {
                    // 检查是否是墙
                    if (!this.grid[newI][newJ].isWall) {
                        neighbors.push({ i: newI, j: newJ })
                    }
                }
            }

            return neighbors
        },

        // 重建路径
        async reconstructPath(node) {
            const path = []
            let current = node

            while (current) {
                path.unshift({ i: current.i, j: current.j })
                current = this.grid[current.i][current.j].parent
            }

            // 高亮最终路径
            for (let i = 0; i < path.length; i++) {
                const node = path[i]
                if (!this.grid[node.i][node.j].isStart && !this.grid[node.i][node.j].isEnd) {
                    this.updateCell(node.i, node.j, '#f5222d')
                }
                await new Promise(resolve => setTimeout(resolve, this.animationSpeed / 2))
            }

            return path
        },

        async startAlgorithm() {
            if (this.isRunning) {
                return
            }

            if (!this.startNode || !this.endNode) {
                this.$message.warning('请先设置起点和终点')
                return
            }

            console.log('开始执行算法:', {
                startNode: this.startNode,
                endNode: this.endNode,
                gridSize: this.gridSize
            })

            this.isRunning = true
            this.calculationSteps = []

            try {
                // 重置所有节点的状态
                for (let i = 0; i < this.gridSize; i++) {
                    for (let j = 0; j < this.gridSize; j++) {
                        if (!this.grid[i][j].isWall && !this.grid[i][j].isStart && !this.grid[i][j].isEnd) {
                            this.updateCell(i, j, 'white')
                        }
                        this.grid[i][j].f = 0
                        this.grid[i][j].g = 0
                        this.grid[i][j].h = 0
                        this.grid[i][j].parent = null
                    }
                }

                const openSet = new Set([`${this.startNode.i},${this.startNode.j}`])
                const closedSet = new Set()

                console.log('初始化完成:', {
                    openSetSize: openSet.size,
                    startNodePosition: `${this.startNode.i},${this.startNode.j}`
                })

                // 初始化起点
                this.grid[this.startNode.i][this.startNode.j].g = 0
                this.grid[this.startNode.i][this.startNode.j].h = this.calculateHeuristic(this.startNode, this.endNode)
                this.grid[this.startNode.i][this.startNode.j].f = this.grid[this.startNode.i][this.startNode.j].h

                this.addCalculationStep('初始化', '将起点加入开放列表，计算初始 f(n) = g(n) + h(n)', 'info')

                while (openSet.size > 0) {
                    console.log('当前开放列表大小:', openSet.size)

                    // 找到 f 值最小的节点
                    let currentNode = null
                    let minF = Infinity

                    for (const nodeStr of openSet) {
                        const [i, j] = nodeStr.split(',').map(Number)
                        const node = this.grid[i][j]
                        if (node.f < minF) {
                            minF = node.f
                            currentNode = { i, j }
                        }
                    }

                    console.log('当前访问节点:', currentNode)

                    // 如果到达终点
                    if (currentNode.i === this.endNode.i && currentNode.j === this.endNode.j) {
                        console.log('到达终点')
                        this.addCalculationStep('到达终点', '找到最短路径！', 'success')
                        await this.reconstructPath(currentNode)
                        return
                    }

                    // 从开放列表中移除当前节点
                    openSet.delete(`${currentNode.i},${currentNode.j}`)
                    closedSet.add(`${currentNode.i},${currentNode.j}`)

                    // 高亮已访问的节点
                    if (!this.grid[currentNode.i][currentNode.j].isStart && !this.grid[currentNode.i][currentNode.j].isEnd) {
                        this.updateCell(currentNode.i, currentNode.j, '#ffd591')
                    }

                    this.addCalculationStep(
                        '访问节点',
                        `访问节点 (${currentNode.i}, ${currentNode.j})，f(n) = ${this.grid[currentNode.i][currentNode.j].f}`,
                        'warning'
                    )

                    // 获取相邻节点
                    const neighbors = this.getNeighbors(currentNode)
                    console.log('相邻节点数量:', neighbors.length)

                    for (const neighbor of neighbors) {
                        // 如果邻居在关闭列表中，跳过
                        if (closedSet.has(`${neighbor.i},${neighbor.j}`)) {
                            continue
                        }

                        // 计算从当前节点到邻居的代价
                        const tentativeG = this.grid[currentNode.i][currentNode.j].g + 1

                        // 如果邻居不在开放列表中，或者找到了更好的路径
                        if (!openSet.has(`${neighbor.i},${neighbor.j}`) || tentativeG < this.grid[neighbor.i][neighbor.j].g) {
                            this.grid[neighbor.i][neighbor.j].parent = currentNode
                            this.grid[neighbor.i][neighbor.j].g = tentativeG
                            this.grid[neighbor.i][neighbor.j].h = this.calculateHeuristic(neighbor, this.endNode)
                            this.grid[neighbor.i][neighbor.j].f = this.grid[neighbor.i][neighbor.j].g + this.grid[neighbor.i][neighbor.j].h

                            if (!openSet.has(`${neighbor.i},${neighbor.j}`)) {
                                openSet.add(`${neighbor.i},${neighbor.j}`)
                                if (!this.grid[neighbor.i][neighbor.j].isStart && !this.grid[neighbor.i][neighbor.j].isEnd) {
                                    this.updateCell(neighbor.i, neighbor.j, '#e6f7ff')
                                }
                            }

                            console.log('更新邻居节点:', {
                                position: `${neighbor.i},${neighbor.j}`,
                                g: this.grid[neighbor.i][neighbor.j].g,
                                h: this.grid[neighbor.i][neighbor.j].h,
                                f: this.grid[neighbor.i][neighbor.j].f
                            })

                            this.addCalculationStep(
                                '更新邻居',
                                `更新节点 (${neighbor.i}, ${neighbor.j}) 的值：g(n) = ${this.grid[neighbor.i][neighbor.j].g}, h(n) = ${this.grid[neighbor.i][neighbor.j].h}, f(n) = ${this.grid[neighbor.i][neighbor.j].f}`,
                                'info'
                            )
                        }
                    }

                    await new Promise(resolve => setTimeout(resolve, this.animationSpeed))
                }

                console.log('未找到路径')
                this.addCalculationStep('搜索结束', '未找到可行路径', 'danger')
                this.$message.error('未找到可行路径')
            } catch (error) {
                console.error('A* 算法执行错误:', error)
                this.$message.error('算法执行出错，请重试')
            } finally {
                this.isRunning = false
            }
        },
        generateRandomWalls() {
            if (this.isRunning || !this.startNode || !this.endNode) {
                this.$message.warning('请先设置起点和终点')
                return
            }

            // 清除现有的障碍物（保留起终点）
            for (let i = 0; i < this.gridSize; i++) {
                for (let j = 0; j < this.gridSize; j++) {
                    if (this.grid[i][j].isWall) {
                        this.grid[i][j].isWall = false
                    }
                }
            }

            // 生成多条随机路径
            const paths = []
            const pathCount = 3

            // 生成随机路径的辅助函数
            const generateRandomPath = (startNode, endNode, randomness = 0.3) => {
                const path = []
                let currentI = startNode.i
                let currentJ = startNode.j
                const visited = new Set()

                while (currentJ <= endNode.j) {
                    const pos = `${currentI},${currentJ}`
                    if (visited.has(pos)) break // 防止无限循环
                    
                    path.push({ i: currentI, j: currentJ })
                    visited.add(pos)

                    // 随机决定下一步的移动方向
                    const verticalDist = endNode.i - currentI
                    const horizontalDist = endNode.j - currentJ
                    
                    // 根据距离终点的远近调整随机性
                    const progress = currentJ / endNode.j
                    const currentRandomness = randomness * (1 - progress) // 越接近终点随机性越小

                    if (Math.random() < currentRandomness) {
                        // 随机移动
                        const possibleMoves = []
                        
                        // 向终点方向的垂直移动
                        if (verticalDist !== 0) {
                            possibleMoves.push({ 
                                di: verticalDist > 0 ? 1 : -1, 
                                dj: 0,
                                weight: Math.abs(verticalDist) // 权重与距离成正比
                            })
                        }
                        
                        // 向右移动
                        if (horizontalDist > 0) {
                            possibleMoves.push({ 
                                di: 0, 
                                dj: 1,
                                weight: horizontalDist
                            })
                        }
                        
                        // 随机上下移动（带有较小权重）
                        if (currentI > 2) {
                            possibleMoves.push({ di: -1, dj: 0, weight: 1 })
                        }
                        if (currentI < this.gridSize - 3) {
                            possibleMoves.push({ di: 1, dj: 0, weight: 1 })
                        }

                        // 根据权重选择移动方向
                        const totalWeight = possibleMoves.reduce((sum, move) => sum + move.weight, 0)
                        let random = Math.random() * totalWeight
                        let selectedMove = possibleMoves[0]
                        
                        for (const move of possibleMoves) {
                            random -= move.weight
                            if (random <= 0) {
                                selectedMove = move
                                break
                            }
                        }

                        currentI += selectedMove.di
                        currentJ += selectedMove.dj
                    } else {
                        // 向终点方向移动
                        if (Math.abs(verticalDist) > Math.abs(horizontalDist)) {
                            currentI += verticalDist > 0 ? 1 : -1
                        } else {
                            currentJ++
                        }
                    }

                    // 确保在边界内
                    currentI = Math.max(0, Math.min(currentI, this.gridSize - 1))
                    currentJ = Math.max(startNode.j, Math.min(currentJ, endNode.j))
                }

                // 确保路径到达终点
                while (currentI !== endNode.i || currentJ !== endNode.j) {
                    if (currentI !== endNode.i) {
                        currentI += currentI < endNode.i ? 1 : -1
                    }
                    if (currentJ !== endNode.j) {
                        currentJ++
                    }
                    path.push({ i: currentI, j: currentJ })
                }

                return path
            }

            // 生成多条随机路径
            for (let i = 0; i < pathCount; i++) {
                const randomness = 0.2 + (Math.random() * 0.3) // 0.2 到 0.5 之间的随机值
                const path = generateRandomPath(this.startNode, this.endNode, randomness)
                paths.push(path)
            }

            // 标记所有路径位置
            const pathCells = new Set()
            paths.forEach(path => {
                path.forEach(pos => {
                    pathCells.add(`${pos.i},${pos.j}`)
                })
            })

            // 计算要生成的障碍物数量
            const totalCells = this.gridSize * this.gridSize
            const wallsToGenerate = Math.floor(totalCells * (this.wallDensity / 100))

            // 生成随机障碍物，避开路径
            let wallsGenerated = 0
            let attempts = 0
            const maxAttempts = wallsToGenerate * 2

            while (wallsGenerated < wallsToGenerate && attempts < maxAttempts) {
                const i = Math.floor(Math.random() * this.gridSize)
                const j = Math.floor(Math.random() * this.gridSize)
                attempts++

                // 检查是否可以在此位置放置障碍物
                if (!this.grid[i][j].isWall && 
                    !this.grid[i][j].isStart && 
                    !this.grid[i][j].isEnd &&
                    !pathCells.has(`${i},${j}`)) {
                    this.grid[i][j].isWall = true
                    wallsGenerated++
                }
            }

            // 重新绘制整个网格
            this.drawGrid()

            this.addCalculationStep(
                '生成路径和障碍',
                `基于起终点生成了 ${pathCount} 条随机可行路径和 ${wallsGenerated} 个障碍物（密度：${this.wallDensity}%）`,
                'warning'
            )
        },
        resetGrid() {
            this.startNode = null
            this.endNode = null
            this.calculationSteps = []
            this.isRunning = false
            this.initializeGrid()
        }
    }
}
</script>

<style scoped>
.astar-container {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: 100vh;
}

.card-panel {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
}

.panel-title {
    padding: 16px 20px;
    border-bottom: 1px solid #ebeef5;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    display: flex;
    align-items: center;
    gap: 8px;
}

.control-panel {
    padding: 20px;
    display: flex;
    gap: 30px;
    align-items: center;
}

.button-group {
    display: flex;
    gap: 12px;
}

.control-options {
    display: flex;
    gap: 20px;
    align-items: center;
    flex: 1;
}

.grid-container {
    padding: 20px;
    display: flex;
    justify-content: center;
}

.calculation-content {
    padding: 20px;
}

:deep(.el-timeline-item__node) {
    background-color: var(--el-color-primary);
}

:deep(.el-timeline-item__wrapper) {
    padding-left: 28px;
}

:deep(.el-button) {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
}

.mb-20 {
    margin-bottom: 20px;
}
</style>