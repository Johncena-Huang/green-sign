<template>
  <div class="final-status-container fullscreen">
    <div class="logo-box">
      <a class="logo-link" href="/">
        <img class="logo" src="../assets/logo.png" alt="logo" />
      </a>
    </div>
    <div class="content-wrapper">
      <!-- Message group -->
      <div class="message-group">
        <div
          class="message"
          :class="{ 'message--active': !props.errorMessage }"
        >
          <Vue3Lottie
            :animationData="SuccessJSON"
            :width="140"
            :height="140"
            :loop="1"
          />
          <div class="message__text">下載成功</div>
        </div>
        <div class="message" :class="{ 'message--active': props.errorMessage }">
          <Vue3Lottie
            :animationData="ErrorJSON"
            :width="140"
            :height="140"
            :loop="1"
          />
          <div class="message__text">
            下載失敗，請稍後再試<br />{{ props.errorMessage }}
          </div>
        </div>
      </div>
      <!-- Home button -->
      <q-btn class="home-btn" label="回首頁" @click.prevent="handleClick" />
    </div>
  </div>
</template>

<script setup>
import { Vue3Lottie } from "vue3-lottie";
import "vue3-lottie/dist/style.css";
import SuccessJSON from "../assets/json/success.json";
import ErrorJSON from "../assets/json/error.json";
const props = defineProps({
  errorMessage: {
    type: String,
    required: true,
  },
});
const handleClick = () => {
  window.location.reload();
};
</script>

<style lang="scss" scoped>
// 1024px
$desktop-screen: 64em;
// 688px
$mobile-screen: 43em;
.final-status-container {
  background-color: #f0f0f0;
}
.logo-box {
  position: absolute;
  top: 2.8rem;
  left: 4rem;
}
.logo {
  display: block;
}
.content-wrapper {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 6.9rem;
}
.message-group {
  display: inline-block;
}
.message {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  &__text {
    font-weight: 400;
    font-size: 2.2rem;
    line-height: 32px;
    color: #424242;
  }
  &--active {
    display: flex;
  }
}
.home-btn {
  //   layout
  padding: 1.45rem 10.3rem;
  //   visual
  background: linear-gradient(180deg, #35a483 0%, #077854 100%);
  border-radius: 16px;
  //  typography
  color: white;
  font-weight: 400;
  font-size: 1.8rem;
  line-height: 27px;
}
@media screen and (max-width: $desktop-screen) {
  .logo {
    display: none;
  }
}
@media screen and (max-width: $mobile-screen) {
  .content-wrapper {
    padding: 3.2rem 2rem;
  }
  .message-group {
    margin: auto 0;
  }
}
</style>
