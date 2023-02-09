<template>
  <div class="backdrop">
    <!-- HEADER -->
    <div class="header-wrapper">
      <header class="header">
        <img src="../assets/logo.png" />
        <div class="btn-group">
          <button class="history-record--big-screen">歷史紀錄</button>
          <div class="history-record">歷史記錄</div>
        </div>
      </header>
    </div>
    <!-- CONTENT -->
    <div class="content-wrapper">
      <FileUploader />
    </div>
    <!-- LEAF DECORATION -->
    <div class="leaf-backdrop"></div>
    <!-- FOOTER -->
    <div class="footer-wrapper">
      <footer class="footer">小綠簽 © Code: Alex / Design: KT</footer>
    </div>
  </div>
</template>

<script setup>
import FileUploader from "src/components/FileUploader.vue";
</script>

<style lang="scss" scoped>
// 1024px
$desktop-screen: 64em;
// 688px
$mobile-screen: 43em;
.backdrop {
  // Avoid Margin collapse due to margin-top from header-wrapper
  overflow: hidden;
  // Proper way to set height and width to 100vh and vw across device width
  position: fixed;
  height: 100%;
  width: 100%;
  // padding: 0 3.8rem;
}
.leaf-backdrop {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-image: url("../assets/leaf-1.png"), url("../assets/leaf-2.png");
  background-repeat: no-repeat;
  background-position: 100% 0, 0 100%;
  pointer-events: none;
}
.header-wrapper {
  // position: absolute;
  margin: 2.8rem 12.2rem 2rem 4rem;
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .btn-group {
    margin-right: 2rem;
  }
  .history-record--big-screen {
    // override default styling
    padding: 0;
    border: 2px solid #1c8b6a;
    border-radius: 16px;
    color: #1c8b6a;
    font: inherit;
    background-color: transparent;
    cursor: pointer;
    outline: none;
    height: 4.4rem;
    width: 13.6rem;
  }
  .history-record {
    display: none;
    color: #424242;
    font-size: 1.8rem;
  }
}

.footer-wrapper {
  position: absolute;
  bottom: 1.7rem;
  right: 1.8rem;
  .footer {
    color: #424242;
  }
}
@media (max-width: $desktop-screen) {
  .backdrop {
    background-color: rgba(240, 240, 240, 0.58);
  }
  .header-wrapper {
    position: absolute;
    left: 0;
    right: 0;
    z-index: 1;
    margin: 2.8rem 3.8rem 1.4rem;
    .header {
      max-width: 54.7rem;
      margin: 0 auto;
    }
    .btn-group {
      margin: 0;
      align-self: flex-end;
    }
    .history-record {
      display: block;
    }
    .history-record--big-screen {
      display: none;
    }
  }

  .content-wrapper {
    height: 100%;
  }
  .leaf-backdrop {
    display: none;
  }
  .footer-wrapper {
    right: 0;
    left: 0;
    text-align: center;
  }
}
</style>
