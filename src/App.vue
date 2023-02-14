<template>
  <router-view />
  <MessageWindowPopup />
</template>

<script>
import { defineComponent } from "vue";
import MessageWindowPopup from "./components/MessageWindowPopup.vue";
export default defineComponent({
  setup() {},
  name: "App",
  components: {
    MessageWindowPopup,
  },
});
</script>
