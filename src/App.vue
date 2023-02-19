<template>
  <router-view />
  <MessageWindowPopup />
  <LeaveConfirmationPopup />
</template>

<script>
import { defineComponent } from "vue";
import MessageWindowPopup from "./components/MessageWindowPopup.vue";
import LeaveConfirmationPopup from "./components/LeaveConfirmationPopup.vue";
export default defineComponent({
  setup() {},
  name: "App",
  components: {
    MessageWindowPopup,
    LeaveConfirmationPopup,
  },
});
</script>
