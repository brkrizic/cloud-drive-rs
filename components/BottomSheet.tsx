import React, { useMemo, useRef } from 'react';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Text } from 'react-native';

export const bottomSheetRef = React.createRef<BottomSheet>();

export default function GlobalBottomSheet() {
  const snapPoints = useMemo(() => ['25%', '60%'], []);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
    >
      <BottomSheetView style={{ padding: 24 }}>
        <Text>Quick actions / notifications</Text>
      </BottomSheetView>
    </BottomSheet>
  );
}
