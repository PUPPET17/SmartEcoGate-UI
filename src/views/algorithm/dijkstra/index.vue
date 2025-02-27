<template>
    <div class="dijkstra-container">
        <!-- 节点和边的管理面板 -->
        <el-row :gutter="20" class="mb-20">
            <!-- 节点列表面板 -->
            <el-col :span="12">
                <div class="node-panel card-panel">
                    <div class="panel-title">
                        <el-icon><Connection /></el-icon>
                        <span>节点管理</span>
                    </div>
                    <div class="panel-content node-content">
                        <el-scrollbar height="400px">
                            <el-row :gutter="20" class="mb-20">
                                <el-col :span="18">
                                    <el-input v-model="newNode.id" placeholder="请输入节点ID（单个大写字母）" size="large" />
                                </el-col>
                                <el-col :span="6">
                                    <el-button type="success" @click="confirmAddNode" :disabled="!isValidNodeId"
                                        class="w-100" size="large">
                                        <el-icon><Plus /></el-icon>
                                        添加节点
                                    </el-button>
                                </el-col>
                            </el-row>
                            <el-table :data="nodes" style="width: 100%" border>
                                <el-table-column prop="id" label="节点ID" align="center" />
                                <el-table-column label="操作" width="120" align="center">
                                    <template #default="scope">
                                        <el-button type="danger" size="small" @click="removeNode(scope.$index)"
                                            :disabled="hasConnectedEdges(scope.row.id)">
                                            <el-icon><Delete /></el-icon>
                                            删除
                                        </el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-scrollbar>
                    </div>
                </div>
            </el-col>

            <!-- 边的管理面板 -->
            <el-col :span="12">
                <div class="edge-panel card-panel">
                    <div class="panel-title">
                        <el-icon><Share /></el-icon>
                        <span>边的管理</span>
                    </div>
                    <div class="panel-content edge-content">
                        <el-scrollbar height="400px">
                            <el-row :gutter="20" class="mb-20">
                                <el-col :span="6">
                                    <el-select v-model="newEdge.source" placeholder="起始节点" class="w-100" size="large">
                                        <el-option v-for="node in nodes" :key="node.id" :label="node.id" :value="node.id" />
                                    </el-select>
                                </el-col>
                                <el-col :span="6">
                                    <el-select v-model="newEdge.target" placeholder="目标节点" class="w-100" size="large">
                                        <el-option v-for="node in nodes" :key="node.id" :label="node.id" :value="node.id" />
                                    </el-select>
                                </el-col>
                                <el-col :span="6">
                                    <el-input-number v-model="newEdge.weight" :min="1" :max="100" placeholder="权重"
                                        class="w-100" size="large" />
                                </el-col>
                                <el-col :span="6">
                                    <el-button type="primary" @click="addEdge" :disabled="!canAddEdge"
                                        class="w-100" size="large">
                                        <el-icon><Plus /></el-icon>
                                        添加边
                                    </el-button>
                                </el-col>
                            </el-row>

                            <el-table :data="edges" style="width: 100%" border>
                                <el-table-column prop="source" label="起始节点" align="center" />
                                <el-table-column prop="target" label="目标节点" align="center" />
                                <el-table-column prop="weight" label="权重" align="center" />
                                <el-table-column label="操作" width="120" align="center">
                                    <template #default="scope">
                                        <el-button type="danger" size="small" @click="removeEdge(scope.$index)">
                                            <el-icon><Delete /></el-icon>
                                            删除
                                        </el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-scrollbar>
                    </div>
                </div>
            </el-col>
        </el-row>

        <el-row :gutter="20" class="mb-20">
            <el-col :span="24">
                <div class="control-panel card-panel">
                    <div class="panel-title">
                        <el-icon><Operation /></el-icon>
                        <span>算法控制</span>
                    </div>
                    <div class="button-group">
                        <el-button type="primary" size="large" @click="startAlgorithm">
                            <el-icon><VideoPlay /></el-icon>
                            开始算法
                        </el-button>
                        <el-button size="large" @click="resetGraph">
                            <el-icon><Refresh /></el-icon>
                            重置图
                        </el-button>
                    </div>
                    <div class="node-controls">
                        <div class="select-group">
                            <span class="select-label">起点：</span>
                            <el-select v-model="startNode" placeholder="选择起点" size="large">
                                <el-option v-for="node in nodes" :key="node.id" :label="node.id" :value="node.id" />
                            </el-select>
                        </div>
                        <div class="select-group">
                            <span class="select-label">终点：</span>
                            <el-select v-model="endNode" placeholder="选择终点" size="large">
                                <el-option v-for="node in nodes" :key="node.id" :label="node.id" :value="node.id" />
                            </el-select>
                        </div>
                    </div>
                </div>
            </el-col>
        </el-row>

        <!-- 图形展示和计算过程面板 -->
        <el-row :gutter="20">
            <!-- 图形展示面板 -->
            <el-col :span="14">
                <div class="graph-panel card-panel">
                    <div class="panel-title">
                        <el-icon><TrendCharts /></el-icon>
                        <span>图形展示</span>
                    </div>
                    <div ref="graphContainer" class="graph-container"></div>
                </div>
            </el-col>

            <!-- 计算过程面板 -->
            <el-col :span="10">
                <div class="calculation-panel card-panel">
                    <div class="panel-title">
                        <el-icon><Monitor /></el-icon>
                        <span>计算过程</span>
                    </div>
                    <div class="panel-content calculation-content">
                        <el-scrollbar height="600px">
                            <el-timeline>
                                <el-timeline-item
                                    v-for="(step, index) in calculationSteps"
                                    :key="index"
                                    :type="step.type"
                                    :color="step.color"
                                    :size="'large'"
                                >
                                    <div class="timeline-content">
                                        <h4 class="step-title">{{ step.title }}</h4>
                                        <p class="step-description">{{ step.description }}</p>
                                        <template v-if="step.distances">
                                            <div class="distance-table">
                                                <div class="distance-row header-row">
                                                    <div class="distance-cell">节点</div>
                                                    <div v-for="node in nodes" :key="node.id" class="distance-cell">
                                                        {{ node.id }}
                                                    </div>
                                                </div>
                                                <div class="distance-row">
                                                    <div class="distance-cell">距离</div>
                                                    <div v-for="node in nodes" :key="node.id" class="distance-cell"
                                                        :class="{'infinity': step.distances[node.id] === Infinity}">
                                                        {{ step.distances[node.id] === Infinity ? '∞' : step.distances[node.id] }}
                                                    </div>
                                                </div>
                                            </div>
                                        </template>
                                    </div>
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
import { Operation, VideoPlay, Refresh, Connection, Share, Plus, Delete, TrendCharts, Monitor } from '@element-plus/icons-vue'
import * as d3 from 'd3'

export default {
    name: 'Dijkstra',
    components: {
        Operation,
        VideoPlay,
        Refresh,
        Connection,
        Share,
        Plus,
        Delete,
        TrendCharts,
        Monitor
    },
    data() {
        return {
            nodes: [],
            edges: [],
            startNode: null,
            endNode: null,
            animationSpeed: 1000,
            svg: null,
            simulation: null,
            newEdge: {
                source: '',
                target: '',
                weight: 1
            },
            newNode: {
                id: ''
            },
            calculationSteps: [],
            // 新增：随机生成的配置
            randomConfig: {
                nodeCount: 10,    // 固定生成10个节点
                maxEdgesPerNode: 3,  // 每个节点最多3条边
                minWeight: 1,   // 最小边权重
                maxWeight: 10   // 最大边权重
            }
        }
    },
    computed: {
        canAddEdge() {
            // 确保选择了起点和终点
            if (!this.newEdge.source || !this.newEdge.target) {
                return false
            }

            // 不允许自环（起点和终点相同）
            if (this.newEdge.source === this.newEdge.target) {
                return false
            }

            // 检查是否已存在这条边（无向图中 A-B 和 B-A 是同一条边）
            const edgeExists = this.edges.some(edge =>
                (edge.source === this.newEdge.source && edge.target === this.newEdge.target) ||
                (edge.source === this.newEdge.target && edge.target === this.newEdge.source)
            )

            return !edgeExists
        },
        isValidNodeId() {
            const id = this.newNode.id
            return id &&
                id.length === 1 &&
                /^[A-Z]$/.test(id) &&
                !this.nodes.some(node => node.id === id)
        }
    },
    mounted() {
        this.generateRandomGraph()
    },
    methods: {
        // 生成随机图
        generateRandomGraph() {
            // 清空现有数据
            this.nodes = []
            this.edges = []
            this.startNode = null
            this.endNode = null
            this.calculationSteps = []

            // 生成固定数量的节点
            for (let i = 0; i < this.randomConfig.nodeCount; i++) {
                const nodeId = String.fromCharCode(65 + i) // A, B, C, ...
                this.nodes.push({ id: nodeId })
            }

            // 为每个节点生成随机边
            const nodeEdgeCounts = {}  // 记录每个节点的边数
            this.nodes.forEach(node => {
                nodeEdgeCounts[node.id] = 0
            })

            // 按顺序遍历每个节点，尝试添加边
            for (let i = 0; i < this.nodes.length; i++) {
                const node = this.nodes[i]
                
                // 获取可能的目标节点（排除已经达到3条边的节点）
                const possibleTargets = this.nodes.filter(target => {
                    if (target.id === node.id) return false // 排除自身
                    if (nodeEdgeCounts[target.id] >= this.randomConfig.maxEdgesPerNode) return false // 排除已有3条边的节点
                    if (nodeEdgeCounts[node.id] >= this.randomConfig.maxEdgesPerNode) return false // 排除当前节点已有3条边
                    
                    // 检查是否已存在边
                    const edgeExists = this.edges.some(edge => 
                        (edge.source === node.id && edge.target === target.id) ||
                        (edge.source === target.id && edge.target === node.id)
                    )
                    
                    return !edgeExists
                })

                // 随机决定要添加的边数（在剩余可用边数和可能目标节点数之间取最小值）
                const remainingEdges = this.randomConfig.maxEdgesPerNode - nodeEdgeCounts[node.id]
                const edgesToAdd = Math.min(
                    remainingEdges,
                    possibleTargets.length,
                    Math.floor(Math.random() * 3) + 1  // 随机1-3条边
                )

                // 随机选择目标节点并创建边
                for (let j = 0; j < edgesToAdd; j++) {
                    if (possibleTargets.length === 0) break

                    const targetIndex = Math.floor(Math.random() * possibleTargets.length)
                    const target = possibleTargets[targetIndex]
                    
                    // 生成随机权重
                    const weight = Math.floor(
                        Math.random() * 
                        (this.randomConfig.maxWeight - this.randomConfig.minWeight + 1) + 
                        this.randomConfig.minWeight
                    )

                    // 添加边（确保源节点ID小于目标节点ID）
                    const [source, dest] = [node.id, target.id].sort()
                    this.edges.push({
                        source: source,
                        target: dest,
                        weight: weight
                    })

                    // 更新边数计数
                    nodeEdgeCounts[node.id]++
                    nodeEdgeCounts[target.id]++

                    // 从可能的目标节点中移除已使用的节点
                    possibleTargets.splice(targetIndex, 1)
                }
            }

            // 确保图是连通的
            this.ensureConnectedGraph()

            // 随机选择起点和终点
            const availableNodes = [...this.nodes]
            const startIndex = Math.floor(Math.random() * availableNodes.length)
            this.startNode = availableNodes[startIndex].id
            availableNodes.splice(startIndex, 1)
            
            const endIndex = Math.floor(Math.random() * availableNodes.length)
            this.endNode = availableNodes[endIndex].id

            // 初始化图形显示
            this.initializeGraph()

            // 添加生成信息到计算步骤
            this.addCalculationStep(
                '生成随机图',
                `生成了 ${this.nodes.length} 个节点和 ${this.edges.length} 条边，每个节点最多连接3条边。起点为 ${this.startNode}，终点为 ${this.endNode}`,
                'info'
            )
        },

        // 确保图是连通的
        ensureConnectedGraph() {
            const visited = new Set()
            const dfs = (nodeId) => {
                visited.add(nodeId)
                this.edges.forEach(edge => {
                    if (edge.source === nodeId && !visited.has(edge.target)) {
                        dfs(edge.target)
                    }
                    if (edge.target === nodeId && !visited.has(edge.source)) {
                        dfs(edge.source)
                    }
                })
            }

            // 从第一个节点开始DFS
            dfs(this.nodes[0].id)

            // 如果有未访问的节点，添加边以连接它们
            this.nodes.forEach(node => {
                if (!visited.has(node.id)) {
                    // 随机选择一个已访问的节点连接
                    const connectedNode = Array.from(visited)[Math.floor(Math.random() * visited.size)]
                    const weight = Math.floor(
                        Math.random() * 
                        (this.randomConfig.maxWeight - this.randomConfig.minWeight + 1) + 
                        this.randomConfig.minWeight
                    )

                    // 添加连接边
                    const [source, target] = [connectedNode, node.id].sort()
                    this.edges.push({
                        source: source,
                        target: target,
                        weight: weight
                    })

                    // 将节点标记为已访问
                    dfs(node.id)
                }
            })
        },
        resetGraph() {
            this.generateRandomGraph()
        },
        initializeGraph() {
            const width = 800
            const height = 600

            // 清除已存在的 SVG
            d3.select(this.$refs.graphContainer).selectAll('*').remove()

            // 创建 SVG
            this.svg = d3.select(this.$refs.graphContainer)
                .append('svg')
                .attr('width', width)
                .attr('height', height)

            // 为边准备节点数据
            const edgesWithNodes = this.edges.map(edge => ({
                ...edge,
                sourceNode: this.nodes.find(n => n.id === edge.source),
                targetNode: this.nodes.find(n => n.id === edge.target)
            }))

            // 创建力导向图
            this.simulation = d3.forceSimulation(this.nodes)
                .force('link', d3.forceLink(edgesWithNodes)
                    .id(d => d.id)
                    .distance(100))
                .force('charge', d3.forceManyBody().strength(-300))
                .force('center', d3.forceCenter(width / 2, height / 2))

            // 绘制边
            const edges = this.svg.append('g')
                .selectAll('g')
                .data(edgesWithNodes)
                .enter()
                .append('g')

            edges.append('line')
                .attr('stroke', '#999')
                .attr('stroke-width', 2)

            edges.append('text')
                .text(d => d.weight)
                .attr('text-anchor', 'middle')
                .attr('dy', -5)

            // 绘制节点
            const nodes = this.svg.append('g')
                .selectAll('g')
                .data(this.nodes)
                .enter()
                .append('g')

            nodes.append('circle')
                .attr('r', 20)
                .attr('fill', '#69c0ff')

            nodes.append('text')
                .text(d => d.id)
                .attr('text-anchor', 'middle')
                .attr('dy', 5)

            // 更新力导向图
            this.simulation.on('tick', () => {
                edges.selectAll('line')
                    .attr('x1', d => d.source.x)
                    .attr('y1', d => d.source.y)
                    .attr('x2', d => d.target.x)
                    .attr('y2', d => d.target.y)

                edges.selectAll('text')
                    .attr('x', d => (d.source.x + d.target.x) / 2)
                    .attr('y', d => (d.source.y + d.target.y) / 2)

                nodes.attr('transform', d => 'translate(' + d.x + ',' + d.y + ')')
            })

            // 添加拖拽功能
            nodes.call(d3.drag()
                .on('start', (event, d) => {
                    if (!event.active) this.simulation.alphaTarget(0.3).restart()
                    d.fx = d.x
                    d.fy = d.y
                })
                .on('drag', (event, d) => {
                    d.fx = event.x
                    d.fy = event.y
                })
                .on('end', (event, d) => {
                    if (!event.active) this.simulation.alphaTarget(0)
                    d.fx = null
                    d.fy = null
                }))
        },
        async startAlgorithm() {
            if (!this.startNode || !this.endNode) {
                this.$message({
                    type: 'warning',
                    message: '请选择起点和终点'
                })
                return
            }

            // 重置所有样式和计算步骤
            this.resetStyles()
            this.calculationSteps = []

            const { distances, previous, visitSequence } = this.dijkstra(this.startNode)
            
            // 动画展示算法执行过程
            await this.animateAlgorithm(visitSequence, previous)

            // 高亮最终路径
            this.highlightShortestPath(previous, distances)
        },
        resetStyles() {
            const nodes = this.svg.selectAll('circle')
            const edges = this.svg.selectAll('line')

            nodes.attr('fill', '#69c0ff')
                .attr('stroke', 'none')
            edges.attr('stroke', '#999')
                .attr('stroke-width', 2)
        },
        async animateAlgorithm(visitSequence, previous) {
            const nodes = this.svg.selectAll('circle')
            const edges = this.svg.selectAll('line')

            // 动画展示访问序列
            for (const nodeId of visitSequence) {
                // 高亮当前访问的节点
                nodes.filter(d => d.id === nodeId)
                    .attr('fill', '#ffd591')
                    .attr('stroke', '#fa8c16')
                    .attr('stroke-width', 2)

                // 如果有前驱节点，高亮边
                if (previous[nodeId]) {
                    const edge = this.edges.find(e =>
                        (e.source === previous[nodeId] && e.target === nodeId) ||
                        (e.source === nodeId && e.target === previous[nodeId])
                    )

                    if (edge) {
                        edges.filter(d => d === edge)
                            .attr('stroke', '#fa8c16')
                            .attr('stroke-width', 2)
                    }
                }

                // 等待动画时间
                await new Promise(resolve => setTimeout(resolve, this.animationSpeed))
            }
        },
        highlightShortestPath(previous, distances) {
            const nodes = this.svg.selectAll('circle')
            const edges = this.svg.selectAll('line')

            // 构建从终点到起点的路径
            const path = []
            let currentNode = this.endNode
            while (currentNode !== null) {
                path.unshift(currentNode)
                currentNode = previous[currentNode]
            }

            // 高亮最短路径
            for (let i = 0; i < path.length - 1; i++) {
                const edge = this.edges.find(e =>
                    (e.source === path[i] && e.target === path[i + 1]) ||
                    (e.source === path[i + 1] && e.target === path[i])
                )

                if (edge) {
                    edges.filter(d => d === edge)
                        .attr('stroke', '#f5222d')
                        .attr('stroke-width', 3)

                    nodes.filter(d => d.id === path[i] || d.id === path[i + 1])
                        .attr('fill', '#f5222d')
                        .attr('stroke', 'none')
                }
            }

            // 显示最短距离
            this.$message({
                message: `从节点 ${this.startNode} 到节点 ${this.endNode} 的最短距离：${distances[this.endNode]}`,
                type: 'success'
            })
        },
        dijkstra(startNodeId) {
            const distances = {}
            const previous = {}
            const unvisited = new Set()
            const visitSequence = []

            // 初始化距离
            this.nodes.forEach(node => {
                distances[node.id] = Infinity
                previous[node.id] = null
                unvisited.add(node.id)
            })
            distances[startNodeId] = 0

            // 记录初始化步骤
            this.calculationSteps.push({
                type: 'primary',
                color: '#409EFF',
                title: '初始化',
                description: `将起点 ${startNodeId} 的距离设为 0，其他节点的距离设为无穷大`,
                distances: { ...distances }
            })

            while (unvisited.size > 0) {
                // 找到距离最小的未访问节点
                let minDistance = Infinity
                let minNode = null
                for (const nodeId of unvisited) {
                    if (distances[nodeId] < minDistance) {
                        minDistance = distances[nodeId]
                        minNode = nodeId
                    }
                }

                if (minNode === null) break

                visitSequence.push(minNode)
                
                // 记录当前访问的节点
                this.calculationSteps.push({
                    type: 'success',
                    color: '#67C23A',
                    title: `访问节点 ${minNode}`,
                    description: `当前访问节点 ${minNode}，更新其邻居节点的距离`,
                    distances: { ...distances }
                })

                if (minNode === this.endNode) {
                    unvisited.delete(minNode)
                    // 记录找到终点
                    this.calculationSteps.push({
                        type: 'success',
                        color: '#67C23A',
                        title: '到达终点',
                        description: `已找到从起点 ${startNodeId} 到终点 ${this.endNode} 的最短路径`,
                        distances: { ...distances }
                    })
                    break
                }

                unvisited.delete(minNode)

                // 更新相邻节点的距离
                const neighbors = this.edges.filter(edge =>
                    edge.source === minNode || edge.target === minNode
                )

                for (const edge of neighbors) {
                    const neighbor = edge.source === minNode ? edge.target : edge.source
                    if (!unvisited.has(neighbor)) continue

                    const weight = edge.weight
                    const totalDistance = distances[minNode] + weight

                    if (totalDistance < distances[neighbor]) {
                        distances[neighbor] = totalDistance
                        previous[neighbor] = minNode
                        // 记录距离更新
                        this.calculationSteps.push({
                            type: 'warning',
                            color: '#E6A23C',
                            title: `更新距离`,
                            description: `通过节点 ${minNode} 更新到节点 ${neighbor} 的距离为 ${totalDistance}`,
                            distances: { ...distances }
                        })
                    }
                }
            }

            return { distances, previous, visitSequence }
        },
        showAddNodeDialog() {
            this.newNode.id = this.nextNodeId
        },
        confirmAddNode() {
            if (this.isValidNodeId) {
                this.nodes.push({
                    id: this.newNode.id
                })

                // 重置输入
                this.newNode.id = this.nextNodeId

                this.initializeGraph()
            } else {
                this.$message({
                    type: 'warning',
                    message: '节点ID必须是单个大写字母且不能重复'
                })
            }
        },
        removeNode(index) {
            const nodeId = this.nodes[index].id
            if (!this.hasConnectedEdges(nodeId)) {
                this.nodes.splice(index, 1)
                this.initializeGraph()
            }
        },
        hasConnectedEdges(nodeId) {
            return this.edges.some(edge => 
                edge.source === nodeId || edge.target === nodeId
            )
        },
        addEdge() {
            if (this.canAddEdge) {
                // 确保边的方向是有序的（例如：总是从字母顺序小的节点指向大的）
                const [source, target] = [this.newEdge.source, this.newEdge.target].sort()
                
                this.edges.push({
                    source,
                    target,
                    weight: this.newEdge.weight
                })

                // 重置表单
                this.newEdge = {
                    source: '',
                    target: '',
                    weight: 1
                }

                // 重新初始化图形
                this.initializeGraph()
            } else {
                this.$message({
                    type: 'warning',
                    message: '无法添加重复的边或自环'
                })
            }
        },
        removeEdge(index) {
            this.edges.splice(index, 1)
            this.initializeGraph()
        },
        addCalculationStep(title, description, type) {
            this.calculationSteps.push({
                type,
                title,
                description,
                distances: {}
            })
        }
    }
}
</script>

<style scoped>
.dijkstra-container {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: 100vh;
}

.card-panel {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.card-panel:hover {
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.15);
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

.panel-content {
    padding: 20px;
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

.node-controls {
    display: flex;
    gap: 20px;
    align-items: center;
}

.select-group {
    display: flex;
    align-items: center;
    gap: 8px;
}

.select-label {
    font-size: 14px;
    color: #606266;
}

.graph-container {
    height: 600px;
    padding: 20px;
    background-color: #fff;
}

.calculation-content {
    padding: 0 20px;
    height: 600px;
}

.timeline-content {
    padding: 12px;
    background: #f8f9fa;
    border-radius: 6px;
    margin-top: 8px;
}

.step-title {
    margin: 0 0 8px 0;
    color: #303133;
    font-weight: 600;
}

.step-description {
    margin: 0 0 12px 0;
    color: #606266;
}

.distance-table {
    background: #fff;
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid #ebeef5;
}

.distance-row {
    display: flex;
    border-bottom: 1px solid #ebeef5;
}

.header-row {
    background-color: #f5f7fa;
}

.distance-row:last-child {
    border-bottom: none;
}

.distance-cell {
    flex: 1;
    padding: 12px;
    text-align: center;
    border-right: 1px solid #ebeef5;
    transition: background-color 0.3s;
}

.distance-cell.infinity {
    color: #909399;
    font-style: italic;
}

.distance-cell:last-child {
    border-right: none;
}

.mb-20 {
    margin-bottom: 20px;
}

.w-100 {
    width: 100%;
}

:deep(.el-button) {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
}

:deep(.el-table) {
    border-radius: 4px;
    overflow: hidden;
}

:deep(.el-input-number) {
    width: 100%;
}

:deep(.el-timeline-item__node) {
    background-color: var(--el-color-primary);
}

:deep(.el-timeline-item__wrapper) {
    padding-left: 28px;
}

:deep(.el-scrollbar__wrap) {
    padding-right: 20px;
}

:deep(.el-timeline) {
    padding: 20px 0;
}

.node-content,
.edge-content {
    padding: 0;
    height: 400px;
}

.node-content :deep(.el-scrollbar__wrap),
.edge-content :deep(.el-scrollbar__wrap) {
    padding: 20px;
}

:deep(.el-table__body-wrapper) {
    overflow-y: hidden !important;
}
</style>