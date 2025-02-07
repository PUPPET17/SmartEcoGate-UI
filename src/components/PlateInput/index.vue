<template>
  <div class="license-plate-container">
    <el-input v-model="licensePlate" placeholder="请输入车牌号" @focus="handleInputFocus" ref="plateInput" clearable
      @clear="clearInput" show-word-limit maxlength="7"></el-input>

    <!-- 省份选择弹出层 -->
    <div v-if="showProvinceSelect" class="custom-popover province-popover">
      <el-button  @click="turnOffP()" size="small" plain>关闭</el-button>
      <div class="province-grid">
        <el-button v-for="prov in provinces" :key="prov" size="small" @click="selectProvince(prov)">
          {{ prov }}
        </el-button>
      </div>
    </div>

    <!-- 城市字母选择弹出层 -->
    <div v-if="showCitySelect" class="custom-popover city-popover">
      <el-button  @click="turnOffC()" size="small" plain>关闭</el-button>
      <div class="city-grid">
        <el-button v-for="letter in cityLetters" :key="letter" size="small" @click="selectCity(letter)">
          {{ letter }}
        </el-button>
      </div>
    </div>

    <!-- 数字字母选择弹出层 -->
    <div v-if="showCharSelect" class="custom-popover char-popover">
      <el-button  @click="turnOffChar()" size="small" plain>关闭</el-button>
      <div class="char-grid">
        <el-button v-for="char in allowedChars" :key="char" size="small" @click="selectChar(char)">
          {{ char }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus';
import { ref } from 'vue';

const emit = defineEmits();

const licensePlate = ref('');
const currentPosition = ref(0);
const showProvinceSelect = ref(false);
const showCitySelect = ref(false);
const showCharSelect = ref(false);

const provinces = ['京', '津', '冀', '晋', '蒙', '辽', '吉', '黑', '沪', '苏', '浙', '皖', '闽', '赣', '鲁', '豫', '鄂', '湘', '粤', '桂', '琼', '渝', '川', '贵', '云', '藏', '陕', '甘', '青', '宁', '新'];
const cityLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
const allowedChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

const handleInputFocus = () => {
  if (licensePlate.value.length === 0) {
    showProvinceSelect.value = true;
  } else {
    currentPosition.value = licensePlate.value.length;
    if (currentPosition.value === 0) {
      showProvinceSelect.value = true;
    } else if (currentPosition.value === 1) {
      showCitySelect.value = true;
    } else {
      showCharSelect.value = true;
    }
  }
};

const selectProvince = (province) => {
  licensePlate.value = province;
  showProvinceSelect.value = false;
  showCitySelect.value = true;
  currentPosition.value = 1;
};

const selectCity = (city) => {
  licensePlate.value += city;
  showCitySelect.value = false;
  showCharSelect.value = true;
  currentPosition.value = 2;
};

const selectChar = (char) => {
  if (licensePlate.value.length < 7) {
    licensePlate.value += char;
    currentPosition.value += 1;
    if (licensePlate.value.length === 7) {
      showCharSelect.value = false;
      showCitySelect.value = false;
      showProvinceSelect.value = false;
      emit('update:modelValue', licensePlate.value);
      currentPosition.value = 0;
    }
  }
};

const clearInput = () => {
  licensePlate.value = '';
  showCharSelect.value = false;
  showCitySelect.value = false;
  showProvinceSelect.value = false;
  currentPosition.value = 0;
  emit('update:modelValue', '');
};

const turnOffP =() => {
  showProvinceSelect.value = false;
}

const turnOffC =() => {
  showCitySelect.value = false
}

const turnOffChar = () =>{
  showCharSelect.value = false
}
</script>

<style scoped>
.license-plate-container {
  /* width: 350px; */
  position: relative;
}

.el-input__inner {
  padding-right: 140px;
}

.custom-popover {
  position: absolute;
  top: 40px;
  left: 0;
  width: 100%;
  z-index: 10;
  background-color: white;
  border: 1px solid #ddd;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 10px;
}

/* .province-popover {
    top: 40px;
  }
  
  .city-popover {
    top: 40px;
  }
  
  .char-popover {
    top: 40px;
  } */

.province-grid,
.city-grid,
.char-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.province-grid .el-button,
.city-grid .el-button,
.char-grid .el-button {
  width: 100%;
  margin: 0px 0px 0px 0px;
  text-align: center;
  font-size: 20px;
  border-radius: 4px;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.province-grid .el-button:hover,
.city-grid .el-button:hover,
.char-grid .el-button:hover {
  background-color: #409eff;
  color: white;
}

@media (max-width: 480px) {

  .province-grid,
  .city-grid,
  .char-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .el-button {
    font-size: 20px;
  }
}
</style>