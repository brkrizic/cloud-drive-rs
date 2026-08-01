import { errorLottieMap } from "constants/errorsIcon";
import { globalLogout } from "./globalLogout";

export type AppError = {
  type: "NETWORK" | "AUTH" | "SERVER" | "CLIENT" | "UNKNOWN";
  message: string;
  status?: number;
};

// =======================
// GLOBAL MODAL HANDLER
// =======================

let showModalFn: ((title: string, message?: string, icon?: any) => void) | null = null;
let hideModalFn: (() => void) | null = null;

export const setGlobalErrorModal = (
  show: typeof showModalFn,
  hide: typeof hideModalFn
) => {
  showModalFn = show;
  hideModalFn = hide;
};

export const showErrorModal = (title: string, message?: string, icon?: any) => {
  showModalFn?.(title, message, icon);
};

export const hideErrorModal = () => {
  hideModalFn?.();
};

// =======================
// ERROR HANDLER (MODAL ONLY)
// =======================

export const handleError = (
  error: AppError,
  options?: { silent?: boolean }
) => {
  if (options?.silent) return;

  if (__DEV__) {
    console.log("GLOBAL ERROR:", error);
  }

  switch (error.type) {
    // 🔐 AUTH → logout + modal
    case "AUTH":
        showErrorModal(
            "Session expired",
            "Please log in again to continue",
            require('../assets/lottie/error.json'),
        );
        globalLogout?.();
        return;

    // 🌐 NETWORK
    case "NETWORK":
        showErrorModal(
            "No internet connection",
            "Check your network and try again",
            require('../assets/lottie/error.json')
        );
        return;

    // 🖥 SERVER
    case "SERVER":
        showErrorModal(
            "Server error",
            "Something went wrong on our side. Try again later.",
            require('../assets/lottie/error.json'),
        );
        return;

    // ❌ CLIENT ERROR
    case "CLIENT":
        if (error.status === 404) {
            showErrorModal("Not found", "The requested resource does not exist", require('../assets/lottie/error.json'));
            return;
        }

        showErrorModal("Request failed", error.message, require('../assets/lottie/error.json'));
        return;

    // ❓ UNKNOWN
    default:
        showErrorModal(
            "Something went wrong",
            error.message,
            require('../assets/lottie/error.json'),
        );
        return;
  }
};