import { reactive, toRefs } from "vue";
const popupState = reactive({
  show: false,
  message: null,
});
const { show, message } = toRefs(popupState);
export default function useNotify() {
  const showMessage = (msg) => {
    popupState.show = true;
    popupState.message = msg;
  };
  const closePopup = () => {
    popupState.show = false;
    popupState.message = null;
  };
  return { show, message, showMessage, closePopup };
}
