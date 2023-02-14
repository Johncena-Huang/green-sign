<template>
  <Teleport to="body">
    <Transition name="scale" :duration="500" appear>
      <div
        class="text-input-popup"
        v-show="props.show"
        tabindex="-1"
        @keyup.esc="onEsc"
        ref="popupRef"
      >
        <div class="text-input-popup__dialog inner">
          <div class="text-input-popup__input-box">
            <textarea
              class="text-input-popup__input"
              v-model="message"
              placeholder="輸入文字"
              autofocus
            ></textarea>
          </div>
          <div class="text-input-popup__btn-group">
            <q-btn
              class="text-input-popup__btn text-input-popup__btn--cancel"
              label="取消"
              dense
              @click.prevent="handleCancel"
            />
            <q-btn
              class="text-input-popup__btn text-input-popup__btn--confirm"
              label="使用"
              dense
              @click.prevent="handleConfirm"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import {
  ref,
  defineProps,
  defineEmits,
  watch,
  nextTick,
  onUnmounted,
} from "vue";
// ======================= PROPS =======================
const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
});
// ======================= EMITS =======================
const emit = defineEmits(["popup-closed", "text-inserted"]);
// ======================= DATA =======================
const message = ref("");
const popupRef = ref(null);
// ======================= METHODS =======================
// Handlers
const handleCancel = () => {
  emit("popup-closed");
};
const handleConfirm = () => {
  emit("text-inserted", message.value);
};
const onEsc = () => {
  console.log("esc");
  if (!props.show) return;
  emit("popup-closed");
};
// Helpers
const handlePopupClose = (e) => {
  const insidePopup = e.target.closest(".text-input-popup");
  const outsidePopupDialog = !e.target.closest(".text-input-popup__dialog");
  const shouldClosePopup = insidePopup && outsidePopupDialog;
  if (!shouldClosePopup) return;
  emit("popup-closed");
};
// ======================= LIFE CYCLES =======================
onUnmounted(() => {
  window.removeEventListener("click", handlePopupClose);
});
// ======================= WATCHER =======================
watch(
  () => props.show,
  async (show, _) => {
    if (!show) {
      message.value = "";
      window.removeEventListener("click", handlePopupClose);
    } else {
      window.addEventListener("click", handlePopupClose);
      await nextTick(); // wait until the popup comes into DOM
      popupRef.value.focus(); // in order for esc to work
    }
  }
);
</script>

<style lang="scss" scoped>
$desktop-screen: 64em;
$mobile-screen: 43em;
.text-input-popup {
  // Positioning
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  // Layouting
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  // Visual
  background: rgba(186, 186, 186, 0.47);
  -webkit-backdrop-filter: blur(2.5px);
  backdrop-filter: blur(2.5px);
  -webkit-mask-image: linear-gradient(
    180deg,
    white 0%,
    white calc(100% - 8.3rem),
    transparent calc(100% - 8.3rem),
    transparent 100%
  );
  mask-image: linear-gradient(
    180deg,
    white 0%,
    white calc(100% - 8.3rem),
    transparent calc(100% - 8.3rem),
    transparent 100%
  );
  &__dialog {
    padding: 2.4rem 2.95rem;
    background: #f0f0f0;
    border-radius: 26px;
  }
  &__input-box {
    width: 28.4rem;
    height: 8.4rem;
    margin-bottom: 1.6rem;
  }
  &__input {
    // Layout
    display: inline-block;
    width: 100%;
    height: 100%;
    padding: 1rem 1.6rem;
    // Typography
    font-weight: 400;
    font-size: 1.4rem;
    line-height: 21px;
    color: #000000;
    // Visual
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 1px 4px 6px rgba(0, 0, 0, 0.11);
    resize: none;
  }
  &__input:focus-visible {
    outline: none;
  }
  &__btn-group {
    display: flex;
    gap: 1.2rem;
    align-items: center;
  }
  &__btn {
    font-weight: 400;
    font-size: 1.8rem;
    line-height: 27px;
    width: 100%;
    height: 5.6rem;
    border-radius: 16px;
  }
  &__btn--cancel {
    border: 1px solid #1c8b6a;
    color: #1c8b6a;
  }
  &__btn--confirm {
    background: #1c8b6a;
    color: #ffffff;
  }
}
// Animation
.scale-enter-active .inner,
.scale-leave-active .inner {
  transition: all 0.5s ease;
}
.scale-enter-from .inner,
.scale-leave-to .inner {
  opacity: 0;
  transform: scale(0);
}
@media screen and (max-width: $desktop-screen) {
  .text-input-popup {
    -webkit-mask-image: none;
    mask-image: none;
    padding-bottom: 0;
  }
}
</style>
