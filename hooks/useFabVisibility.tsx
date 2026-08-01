import {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { fabVisible } from "store/fabStore";

export function useFabVisibility() {

  // 📌 Stores last scroll position (UI thread memory)
  // Used to detect scroll direction (up/down)
  const lastY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {

      // ⚠️ You are reading x but NOT using it — remove unless horizontal logic needed
      const x = event.contentOffset.x;  

      const y = event.contentOffset.y;

      // 📌 How much user moved since last frame
      const diff = y - lastY.value;

      // 🧠 PERFORMANCE FILTER:
      // Prevents flickering from tiny scroll jitter (finger micro-movements)
      if (Math.abs(diff) < 10) return;

      // 📌 SCROLL DIRECTION LOGIC
      if (diff > 0) {
        // 👇 user scrolls DOWN → hide FAB
        fabVisible.value = 0;
      } else {
        // 👆 user scrolls UP → show FAB
        fabVisible.value = 1;
      }

      // 📌 Update reference point for next scroll event
      lastY.value = y;
    },
  });

  const fabStyle = useAnimatedStyle(() => {

    // ⚠️ IMPORTANT DESIGN NOTE:
    // You are using visible.value directly (GOOD)
    // BUT animating inside transform (GOOD for smooth UI)

    return {
      // 📌 Instant visibility change (no animation delay)
    //   opacity: visible.value,

      transform: [
        {
          // 🚀 Slide effect (horizontal in your case)
          // This creates "floating in/out" feeling
          translateX: withSpring(fabVisible.value ? 0 : 100, {
            damping: 100,     // higher = less bounce
            stiffness: 860,  // higher = faster response
          }),
        },
        {
          // 📌 Small scale shrink when hidden
          // Gives "depth" feeling instead of just disappearing
          scale: withSpring(fabVisible.value ? 1 : 0.85),
        },
      ],
    };
  });

  return { scrollHandler, fabStyle, fabVisible };
}