<template>
  <router-view />
  <MessageWindowPopup />
  <LeaveConfirmationPopup />
</template>

<script>
import { defineComponent } from "vue";
import MessageWindowPopup from "./components/popup/MessageWindowPopup.vue";
import LeaveConfirmationPopup from "./components/popup/LeaveConfirmationPopup.vue";
export default defineComponent({
  setup() {},
  name: "App",
  components: {
    MessageWindowPopup,
    LeaveConfirmationPopup,
  },
});
</script>
