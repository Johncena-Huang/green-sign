<template>
  <Teleport to="body">
    <Transition name="scale" :duration="500" appear>
      <div class="leave-confirmation-popup" v-if="show">
        <div class="leave-confirmation-popup__dialog inner">
          <div class="leave-confirmation-popup__inner">
            <div class="leave-confirmation-popup__message">
              {{ message }}
            </div>
            <div class="leave-confirmation-popup__btn-group">
              <q-btn
                class="leave-confirmation-popup__btn leave-confirmation-popup__btn--cancel"
                label="取消"
                dense
                @click.prevent="cancel"
              />
              <q-btn
                class="leave-confirmation-popup__btn leave-confirmation-popup__btn--confirm"
                label="確定"
                dense
                @click.prevent="confirm"
              />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import useLeaveConfirmation from "../composables/leaveConfirmation";
const { show, message, confirm, cancel } = useLeaveConfirmation();
</script>

<style lang="scss" scoped>
.leave-confirmation-popup {
  // Positioning
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10000;
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
  &__dialog {
    width: 34.3rem;
    height: 15.6rem;
    padding: 2.3rem 2.75rem;
    background: #ffffff;
    border-radius: 26px;
  }
  &__inner {
    width: 100%;
  }
  &__message {
    font-weight: 400;
    font-size: 1.8rem;
    line-height: 26px;
    color: #424242;
    text-align: center;
    margin-bottom: 2.8rem;
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
    // width: 13.6rem;
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
.scale-enter-active .inner,
.scale-leave-active .inner {
  transition: all 0.5s ease;
}
.scale-enter-from .inner,
.scale-leave-to .inner {
  opacity: 0;
  transform: scale(0);
}
</style>
