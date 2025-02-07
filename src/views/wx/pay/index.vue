<template>
    <div>
        <div v-if="loading" class="loading">
            <div class="pic"></div>
        </div>
        <div class="pay" v-else>
            <div class="money_box">
                <p>支付金额</p>
                <div class="money">
                    <span>￥ {{ formattedAmount }}</span>
                </div>
            </div>
            <div class="detail_list">
                <ul>
                    <li>名称<span>行驶证识别信息</span></li>
                    <li>工厂名称<span>{{ aliyumImg.areaName }}</span></li>
                    <li>车牌号<span>{{ aliyumImg.carNumber }}</span></li>
                    <li>支付费用<span>¥ {{ formattedAmount }} 元</span></li>
                </ul>
            </div>
            <p class="notes">
                请在支付后<span style="color:blue; size:10px;"> 立即 </span>使用，过期需要重新支付，一车一支付!<br>
                注意支付后需要等待跳转信息录入页面,若直接退出当前页面需<span style="color:blue; size:10px;"> 二次支付 </span>!!!
            </p>
            <div style="margin-top:1.2rem;">
                <a class="pay_leave" @click="wxpay(aliyumImg.id, aliyumImg.receivable)">微信支付</a>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, reactive, computed, onUnmounted, onMounted } from 'vue';
import request from '@/utils/request';
import { ElMessage } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';

export default {
    data() {
        return {
            loading: true,
            aliyumImg: {
                id: '', // 从 API 或 props 获取
                receivable: 0, // 从 API 或 props 获取
                areaName: '', // 从 API 或 props 获取
                carNumber: '' // 从 API 或 props 获取
            }
        };
    },
    computed: {
        formattedAmount() {
            return this.aliyumImg.receivable.toFixed(2);
        }
    },
    methods: {
        wxpay(id, cost) {
            if (cost <= 0.0) {
                // this.$swal("支付金额不能为零");
                return;
            }

            this.loading = true;

            // Mock API call (replace with actual API call)
            this.getPaymentInfo(id).then((json) => {
                this.loading = false;
                if (json.success) {
                    this.onBridgeReady(json.obj, id);
                } else {
                    this.$swal(json.msg);
                }
            });
        },
        onBridgeReady(jsStr, id) {
            WeixinJSBridge.invoke(
                'getBrandWCPayRequest', {
                "appId": jsStr.appId,
                "timeStamp": jsStr.timeStamp,
                "nonceStr": jsStr.nonceStr,
                "package": jsStr.package,
                "paySign": jsStr.paySign,
                "signType": jsStr.signType
            },
                (res) => {
                    if (res.err_msg === "get_brand_wcpay_request:ok") {
                        
                    }
                }
            );
        },
        getPaymentInfo(id) {
            // Replace this with actual API call to get payment info
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        success: true,
                        obj: {
                            appId: 'mockAppId',
                            timeStamp: 'mockTimestamp',
                            nonceStr: 'mockNonceStr',
                            package: 'mockPackage',
                            paySign: 'mockPaySign',
                            signType: 'mockSignType'
                        }
                    });
                }, 1000);
            });
        }
    },
    mounted() {
        // Fetch data to initialize aliyumImg
        // For example: this.aliyumImg = await this.fetchAliyumImg();
        this.loading = false; // Set loading to false after data is fetched
    }
};
</script>

<style scoped>
.pay .money_box {
    border: 1px solid #dfdfdf;
    text-align: center;
    padding: 1.3rem 0;
    background: #87bffb;

}

.pay .money_box p {
    font-size: 1.5rem;
    line-height: 2rem;
    color: #fff;
}

.pay .money_box .money {
    font-size: 1.3rem;
    color: #fff;
}

.pay .money_box .money span {
    font-size: 2.1rem;
    line-height: 2.8rem;
    color: #fff;
    font-weight: bold;

}

.pay .detail_list {
    padding: .6rem 1rem;
    background: #fff;
}

.pay .detail_list li {
    line-height: 2rem;
    font-size: 0.9rem;
    overflow: hidden;
}

.pay .detail_list li span {
    float: right;
    line-height: 2rem;
    font-size: 0.9rem;
    display: block;
}

.pay .notes {
    font-size: 1rem;
    line-height: 1.5rem;
    padding: 1rem 1rem 2rem;
}

.pay .pay_leave {
    width: calc(100% - 2rem);
    line-height: 3rem;
    text-align: center;
    color: #fff;
    background: #00ab5e;
    display: block;
    margin: 0 1rem;
    font-size: 1.1rem;
    margin-top: 1rem;
}

@keyframes float {

    0%,
    100% {
        transform: translateY(0px);
    }

    50% {
        transform: translateY(-20px);
    }
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.loading-spinner {
    width: 50px;
    height: 50px;
    border: 5px solid #f3f3f3;
    border-top: 5px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto;
}
</style>