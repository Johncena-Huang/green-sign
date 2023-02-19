<template>
  <Teleport to="body">
    <Transition name="scale" :duration="500" appear>
      <div
        class="signature-picker-popup"
        v-show="show"
        ref="popupRef"
        tabindex="-1"
        @keyup.esc="onEsc"
      >
        <div class="signature-picker-popup__dialog inner">
          <div class="signature-picker-popup__title">請選擇簽名</div>
          <div class="signature-picker-popup__content">
            <div
              class="signature-picker-popup__signature-item"
              v-for="({ dataURL, id }, index) in signatureArray"
              :key="id"
            >
              <img
                class="signature-picker-popup__signature"
                :src="dataURL"
                :alt="`signature-${id}`"
                @click.prevent="handleSignatureSelection(index)"
              />
              <img
                class="signature-picker-popup__delete-icon"
                src="../assets/svg/trash-bin.svg"
                :alt="`delete-icon-${id}`"
                @click.prevent="handleSignatureDelete(index)"
              />
            </div>
          </div>
          <div class="signature-picker-popup__footer">
            <q-btn
              label="+ 新增簽名"
              class="signature-picker-popup__append-btn"
              flat
              dense
              :ripple="false"
              :glossy="false"
              @click.prevent="toggleSignatureBoardPopup"
            />
          </div>
        </div>
        <SignatureBoardPopup
          :show="isSignatureBoardOpen"
          @popup-closed="isSignatureBoardOpen = false"
          @signature-created="signatureCreateEmitter"
        />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import SignatureBoardPopup from "./SignatureBoardPopup.vue";
import {
  ref,
  defineEmits,
  onMounted,
  onUnmounted,
  watch,
  defineProps,
  nextTick,
} from "vue";
// ======================= PROPS =======================
const props = defineProps({
  signatureArray: {
    type: Array,
    required: true,
  },
  show: {
    type: Boolean,
    required: true,
  },
});
// ======================= EMIT =======================
const emit = defineEmits([
  "popup-closed",
  "signature-deleted",
  "signature-inserted",
  "signature-created",
]);
// ======================= DATA =======================
// state
const isSignatureBoardOpen = ref(false);
// ref
const popupRef = ref(null);
// ======================= METHODS =======================
const handleSignatureSelection = (index) => {
  emit("signature-inserted", index);
};
const handleSignatureDelete = (index) => {
  emit("signature-deleted", index);
};
const toggleSignatureBoardPopup = () => {
  isSignatureBoardOpen.value = !isSignatureBoardOpen.value;
};
const handlePopupClose = (e) => {
  const insidePopup = e.target.closest(".signature-picker-popup");
  const outsidePopupDialog = !e.target.closest(
    ".signature-picker-popup__dialog"
  );
  const shouldClosePopup = insidePopup && outsidePopupDialog;
  if (!shouldClosePopup) return;
  emit("popup-closed");
};
const signatureCreateEmitter = (dataURL) => {
  emit("signature-created", dataURL);
};
const onEsc = () => {
  if (!props.show) return;
  emit("popup-closed");
};
onUnmounted(() => {
  window.removeEventListener("click", handlePopupClose);
});
watch(
  [() => props.show, isSignatureBoardOpen],
  async ([isShow, isSignatureBoardOpen], [_, __]) => {
    if (!isShow || isSignatureBoardOpen) {
      window.removeEventListener("click", handlePopupClose);
      popupRef.value.blur();
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
.signature-picker-popup {
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
  padding-bottom: 8.3rem;
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
    // Layouting
    min-width: 34.3rem; // To prevent the dialog from collapsion when there is no content
    padding: 1.6rem;
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    // Visual
    background: #f0f0f0;
    box-shadow: 1px 4px 6px rgba(0, 0, 0, 0.11);
    border-radius: 26px;
  }
  &__title {
    font-style: normal;
    font-weight: 400;
    font-size: 18px;
    line-height: 26px;
    color: #1c8b6a;
    text-align: center;
  }
  &__content {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
  }
  &__signature-item {
    display: flex;
    gap: 2.1rem;
  }
  &__signature {
    display: block;
    width: 27.1rem;
    height: 6.1rem;
    object-fit: contain;
    background-color: #ffffff;
    border-radius: 16px;
    cursor: pointer;
  }
  &__delete-icon {
    cursor: pointer;
  }
  &__footer {
    display: flex;
    justify-content: flex-start;
  }
  &__append-btn {
    color: #1c8b6a;
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
  .signature-picker-popup {
    -webkit-mask-image: none;
    mask-image: none;
    padding-bottom: 0;
  }
}
</style>
