<template>
  <div class="popup-wrapper" v-show="isOpen">
    <div class="popup">
      <div class="popup__message">{{ messageSelector[message] }}</div>
      <button class="popup__confirm" @click.prevent="handleConfirm">
        確定
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, toRefs, defineEmits } from "vue";
// Props
const props = defineProps({
  message: {
    type: String,
    required: true,
    validator(value) {
      return ["size", "type"].includes(value);
    },
  },
  isOpen: {
    type: Boolean,
    default: false,
  },
});
const { message, isOpen } = toRefs(props);
const messageSelector = {
  size: "檔案超過10MB，請重新選擇",
  type: "檔案格式錯誤，請重新選擇",
};
// Emits
const emit = defineEmits(["close-popup"]);
const handleConfirm = () => {
  emit("close-popup");
};
</script>

<style lang="scss" scoped>
.popup-wrapper {
  position: fixed;
  z-index: 1000;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  // Layouting
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(186, 186, 186, 0.47);
  backdrop-filter: blur(2.5px);
}
.popup {
  width: 34.3rem;
  height: 15.6rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 2.8rem;
  background-color: #f0f0f0;
  box-shadow: 1px 4px 6px rgba(0, 0, 0, 0.11);
  border-radius: 26px;
  &__message {
    text-align: center;
    color: #424242;
    font-size: 1.8rem;
    font-weight: 400;
    line-height: 26px;
    // Override default
  }
  &__confirm {
    // Dimension
    width: 22.9rem;
    height: 5.6rem;
    // Styling
    background-color: #1c8b6a;
    border-radius: 16px;
    // Default pressed effect
    box-shadow: 0 5px 10px 3px rgba(0, 0, 0, 0.2);
    transform: translateY(-3px);
    // Typography
    color: #fff;
    font-size: 1.8rem;
    font-weight: 400;
    line-height: 27px;
    cursor: pointer;
    // Override default style
    border: none;
    outline: none;
  }
  &__confirm:active {
    box-shadow: none;
    transform: translateY(-1px);
  }
}
</style>
