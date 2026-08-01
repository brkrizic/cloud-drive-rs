import React from 'react';
import { View, Text } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

const CircularProgressLoader = ({ progress }: { progress: number }) => {
  return (
    <View className="flex-1 items-center justify-center">
      <AnimatedCircularProgress
        size={100}             // diameter
        width={8}              // thickness
        fill={progress}        // 0 to 100
        tintColor="#007AFF"    // progress color
        backgroundColor="#333" // track color
      >
        {(fill: any) => (
          <Text className="text-white text-lg">{Math.round(fill)}%</Text>
        )}
      </AnimatedCircularProgress>
    </View>
  );
};

export default CircularProgressLoader;
