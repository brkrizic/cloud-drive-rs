import React, { useEffect, useRef } from "react";
import LottieView from "lottie-react-native";

type Props = {
  active: boolean;
  disabled?: boolean;
  source: any;
  size?: number; 
};

const AnimatedLoadingIcon = React.memo(
  ({ active, disabled, source, size = 150 }: Props) => {
    const animationRef = useRef<LottieView>(null);

    useEffect(() => {
      if (!animationRef.current) return;

      if (active) {
        animationRef.current.play(0, 150);
      } else {
        animationRef.current.play(0, 150);
      }
    }, [active]);

    return (
      <LottieView
        ref={animationRef}
        source={source}
        loop={active}
        autoPlay={false}
        style={{
          width: size,
          height: size,
          opacity: disabled ? 0.5 : 1,
        }}
      />
    );
  }
);

export default AnimatedLoadingIcon;