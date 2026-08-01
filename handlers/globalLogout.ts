let logoutFn: (() => void) | null = null;

export const setGlobalLogout = (fn: () => void) => {
  logoutFn = fn;
};

export const globalLogout = () => {
  console.log("🔥 GLOBAL LOGOUT CALLED");
  logoutFn?.();
};