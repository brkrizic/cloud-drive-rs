import NetInfo from "@react-native-community/netinfo";
import { errorLottieMap } from "constants/errorsIcon";
import { hideErrorModal, showErrorModal } from "handlers/globalErrorHandler";

export const initNetworkListener = () => {
  NetInfo.addEventListener((state) => {
    if (!state.isConnected) {
      showErrorModal("No internet connection", "You are offline", require("../assets/lottie/error.json"),);
    } else {
      hideErrorModal(); // 👈 THIS fixes your “stuck error”
    }
  });
};