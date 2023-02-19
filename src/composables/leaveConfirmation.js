import { reactive, toRefs } from "vue";
const popupState = reactive({
  show: false,
  message: "",
  stay: null,
  leave: null,
});
const { show, message } = toRefs(popupState);
export default function useLeaveConfirmation() {
  const waitForResponse = () => {
    return new Promise((resolve, reject) => {
      popupState.leave = resolve;
      popupState.stay = reject;
    });
  };
  const showMessage = (msg) => {
    popupState.message = msg;
    popupState.show = true;
  };
  const confirm = () => {
    popupState.message = "";
    popupState.show = false;
    popupState.leave();
    popupState.stay = null;
    popupState.leave = null;
  };
  const cancel = () => {
    popupState.message = "";
    popupState.show = false;
    popupState.stay();
    popupState.stay = null;
    popupState.leave = null;
  };
  return { show, message, showMessage, waitForResponse, confirm, cancel };
}
