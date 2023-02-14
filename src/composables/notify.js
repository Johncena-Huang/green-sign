import { reactive } from "vue";
const popupState = reactive({
  show: false,
  message: null,
  buttonType: 1,
});
export default function useNotify() {
  const showMessage = (msg, btnType = 1) => {
    popupState.show = true;
    popupState.message = msg;
    popupState.buttonType = btnType;
  };
  const closePopup = () => {
    popupState.show = false;
    popupState.message = null;
  };
  return { popupState, showMessage, closePopup };
}
