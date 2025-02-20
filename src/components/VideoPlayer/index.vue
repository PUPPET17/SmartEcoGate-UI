<template>
  <div class="video-player-container">
    <video
      ref="videoPlayer"
      class="video-js vjs-default-skin vjs-big-play-centered"
      controls
      preload="auto"
      width="100%"
      height="100%"
      playsinline
      webkit-playsinline
      x5-playsinline
      x5-video-player-type="h5"
      x5-video-player-fullscreen="true"
    >
      <source :src="streamUrl" type="video/mp4">
      <p class="vjs-no-js">
        要查看此视频，请启用JavaScript，并考虑升级到支持HTML5视频的浏览器
      </p>
    </video>
  </div>
</template>

<script>
import { defineComponent, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'

export default defineComponent({
  name: 'VideoPlayer',
  props: {
    streamUrl: {
      type: String,
      required: true
    }
  },
  emits: ['error', 'play', 'pause', 'waiting', 'playing', 'loadstart', 'loadeddata', 'canplay'],
  setup(props, { emit }) {
    const videoPlayer = ref(null)
    let player = null

    const initializePlayer = () => {
      if (videoPlayer.value) {
        player = videojs(videoPlayer.value, {
          autoplay: true,
          fluid: true,
          liveui: true,
          controls: true,
          playsinline: true,
          sources: [{
            src: props.streamUrl,
            type: 'video/mp4'
          }]
        })

        player.on('error', function() {
          emit('error', '视频加载失败')
        })

        player.on('play', function() {
          emit('play')
        })

        player.on('pause', function() {
          emit('pause')
        })

        player.on('waiting', function() {
          emit('waiting')
        })

        player.on('playing', function() {
          emit('playing')
        })

        player.on('loadstart', function() {
          emit('loadstart')
        })

        player.on('loadeddata', function() {
          emit('loadeddata')
        })

        player.on('canplay', function() {
          emit('canplay')
        })

        player.on('loadedmetadata', function() {
          player.play().catch(function(error) {
            console.log("播放失败:", error);
            emit('error', `播放失败: ${error.message || '未知错误'}`);
            player.bigPlayButton.show();
          });
        });
      }
    }

    watch(() => props.streamUrl, (newUrl) => {
      if (player && newUrl) {
        player.src({
          src: newUrl,
          type: 'video/mp4'
        })
      }
    })

    onMounted(() => {
      initializePlayer()
    })

    onBeforeUnmount(() => {
      if (player) {
        player.dispose()
      }
    })

    return {
      videoPlayer
    }
  }
})
</script>

<style scoped>
.video-player-container {
  width: 100%;
  height: 100%;
  background: #000;
  position: relative;
}

:deep(.video-js) {
  width: 100%;
  height: 100%;
}

:deep(.vjs-big-play-centered .vjs-big-play-button) {
  transform: translate(-50%, -50%);
}
</style> 