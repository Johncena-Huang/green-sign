<template>
  <div class="container row">
    <!-- left -->
    <div class="left">
      <div class="wedge">免費試用版</div>
      <div class="product-card">
        <h3 class="product-card__name">小綠簽</h3>
        <p class="product-card__introduction">
          護樹、永續、減碳的綠色生活<br />
          響應環保無紙化電子簽署，<br />
          省時便利又環保。
        </p>
      </div>
    </div>
    <!-- right -->
    <div class="right">
      <div class="drop-area">
        <img
          class="drop-area__visual-reminder"
          src="../assets/document.png"
          alt="types-accepted"
        />
        <div class="drop-area__uploader-box">
          <input
            id="uploader"
            accept="image/*,application/pdf"
            class="drop-area__input"
            ref="uploaderRef"
            type="file"
            @change.prevent="handleFileUpload"
          />
          <label class="drop-area__label" for="uploader">選擇檔案 </label>
        </div>
        <p class="drop-area__guidance">或拖移檔案到此處</p>
        <p class="drop-area__notice">(限10MB 內的PDF或JPG檔)</p>
      </div>
    </div>
    <!-- people card -->
    <div class="people-card">
      <img
        class="people-card__grass"
        src="../assets/people/grass.png"
        alt="grass"
      />
      <img
        class="people-card__woman-1"
        src="../assets/people/woman-left-1.png"
        alt="woman-1"
      />
      <img
        class="people-card__woman-2"
        src="../assets/people/woman-left-2.png"
        alt="woman-2"
      />
      <img
        class="people-card__pot-1"
        src="../assets/people/pot-left.png"
        alt="pot-1"
      />
      <img
        class="people-card__pot-2"
        src="../assets/people/pot-right.png"
        alt="pot-2"
      />
      <img
        class="people-card__man-1"
        src="../assets/people/man-right-1.png"
        alt="man-1"
      />

      <img
        class="people-card__woman-3"
        src="../assets/people/woman-right-2.png"
        alt="woman-3"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits } from "vue";
import useNotify from "src/composables/notify";
const notify = useNotify();
// ======================= DATA =======================
// State
const uploaderRef = ref(null);
// ======================= EMITS =======================
const emit = defineEmits(["file-uploaded"]);
// ======================= METHODS =======================
const handleFileUpload = (e) => {
  const MAX_SIZE = 10 * 1000 * 1000; // Maximum size 10MB
  const file = e.target.files[0];
  const fileType = file.type;
  const fileSize = file.size;
  const isPdfFile = fileType === "application/pdf";
  const isImageFile = fileType.startsWith("image/");
  //   Guard clause for file types(only "pdf" and "image")
  if (!isPdfFile && !isImageFile) {
    notify.showMessage("檔案格式錯誤，請重新選擇");
    return;
  }
  //   Guard clause for file size
  if (fileSize > MAX_SIZE) {
    notify.showMessage("檔案超過10MB，請重新選擇");
    return;
  }
  emit("file-uploaded", file);
};
</script>

<style lang="scss" scoped>
// 1024px
$desktop-screen: 64em;
// 688px
$mobile-screen: 43em;
.container {
  position: relative;
  height: 55.8rem;
  max-width: 103.6rem;
  margin: 0 auto;
  border-radius: 3.4rem;
  background-color: rgba(240, 240, 240, 0.58);
  // Grid
  display: grid;
  grid-template-columns: repeat(2, 1fr);
}
.left {
  grid-column: 1 / span 1;
}
.right {
  grid-column: 2 / span 1;
}

.wedge {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 22.5rem;
  height: 6.2rem;
  border-radius: 3.4rem 0;
  background: linear-gradient(180deg, #35a483 0%, #077854 100%);
  color: #fff;
  font-size: 2.4rem;
}
.product-card {
  margin-top: 5.5rem;
  margin-left: 4.4rem;
  &__name {
    font-size: 5rem;
    background: linear-gradient(180deg, #35a483 0%, #077854 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
    line-height: normal;
  }
  &__introduction {
    font-size: 1.8rem;
    color: #424242;
  }
}
.drop-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem 8.2rem;
  margin-top: 3.1rem;
  margin-right: 21.8%;
  border: 2px dashed #b7b7b7;
  border-radius: 2.6rem;
  background: #ffffff;
  &__visual-reminder {
    margin-bottom: 2rem;
  }
  &__uploader-box {
    display: flex;
    justify-content: center;
    margin-bottom: 1.5rem;
  }
  &__input {
    display: none;
  }
  &__label {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 22.7rem;
    height: 6rem;
    background: linear-gradient(180deg, #35a483 0%, #077854 100%);
    box-shadow: 1px 4px 6px rgba(0, 0, 0, 0.11);
    border-radius: 1.6rem;
    color: white;
    font-size: 1.8rem;
    cursor: pointer;
  }
  &__guidance {
    color: #424242;
    margin-bottom: 1.5rem;
  }
  &__notice {
    background: linear-gradient(180deg, #35a483 0%, #077854 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}
.people-card {
  position: absolute;
  right: 0;
  bottom: -3.6rem;
  width: 67rem;
  height: auto;
  &__grass {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 67rem;
    height: 12.8rem;
  }
  &__woman-1 {
    position: absolute;
    bottom: 5rem;
    left: (5.5 / 67 * 100%);
    width: 18.9rem;
    height: 26.8rem;
  }
  &__woman-2 {
    position: absolute;
    bottom: 3.6rem;
    left: (29.6 / 67 * 100%);
    width: 13rem;
    height: 21.8rem;
  }
  &__pot-1 {
    position: absolute;
    bottom: 3.6rem;
    right: (16.6 / 67 * 100%);
    width: 10rem;
    height: 17rem;
  }
  &__pot-2 {
    position: absolute;
    bottom: 3rem;
    right: (17.7 / 67 * 100%);
    width: 2.7rem;
    height: 3.7rem;
  }
  &__man-1 {
    position: absolute;
    bottom: 14.6rem;
    right: (4.6 / 67 * 100%);
  }
  &__woman-3 {
    position: absolute;
    bottom: 5.5rem;
    right: (7.9 / 67 * 100%);
    width: 14.2rem;
    height: 24.8rem;
  }
}
@media (max-width: $desktop-screen) {
  .container {
    height: fit-content;
    width: 100%;
    margin: 0;
    border-radius: 0;
    // padding-top: 10.6rem;
    background-color: transparent;
  }
  .left {
    display: none;
  }
  .right {
    grid-column: 1 / span 2;
    padding: 0 3.8rem;
  }
  .drop-area {
    margin: 0 auto;
    max-width: 54.7rem;
    height: 56.7rem;
  }
  .people-card {
    left: 0;
    bottom: -13.6rem;
    // center the absolutely positioned element
    margin: 0 auto;
    &__man-1 {
      display: none;
    }
  }
}
@media (max-width: $mobile-screen) {
  .drop-area {
    height: calc(56.7rem - (567 - 384) / (688 - 375) * (688px - 100vw));
  }
  .people-card {
    width: 36.2rem;
    &__grass {
      width: 35.5rem;
      height: 5.9rem;
    }
    &__woman-1 {
      left: 0;
      bottom: 2.6rem;
      width: 14.2rem;
      height: 20.2rem;
    }
    &__woman-2 {
      left: 12.4rem;
      bottom: 1.9rem;
      width: 9.7rem;
      height: 16.4rem;
    }
    &__pot-1 {
      right: 8.1rem;
      bottom: 1.9rem;
      width: 7.6rem;
      height: 12.7rem;
    }
    &__pot-2 {
      right: 9rem;
      bottom: 1.4rem;
      width: 2.1rem;
      height: 2.7rem;
    }
    &__woman-3 {
      right: 1.5rem;
      bottom: 3.3rem;
      width: 10.8rem;
      height: 18.8rem;
    }
  }
}
</style>
