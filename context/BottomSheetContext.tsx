import React, { createContext, useContext, useRef, useState } from "react";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { colors } from "constants/colors";
import { useSettings } from "./SettingsContext";

type SheetContent = React.ReactNode;

type BottomSheetContextType = {
  openSheet: (content: SheetContent) => void;
  closeSheet: () => void;
};

const BottomSheetContext = createContext<BottomSheetContextType | null>(null);

export function BottomSheetProvider({ children }: { children: React.ReactNode }) {
  const sheetRef = useRef<BottomSheet>(null);
  const { theme } = useSettings();

  const [content, setContent] = useState<SheetContent>(null);

  const openSheet = (node: SheetContent) => {
    setContent(node);
    // Need a small delay to ensure sheet renders content before expanding
    requestAnimationFrame(() => {
      sheetRef.current?.expand();
    });
  };

  const closeSheet = () => {
    sheetRef.current?.close();
  };

  const snapPoints = ['50%'];

  return (
    <BottomSheetContext.Provider value={{ openSheet, closeSheet }}>
      {children}

        <BottomSheet
            ref={sheetRef}
            index={-1}
            enableDynamicSizing
            enablePanDownToClose
            backgroundStyle={{ backgroundColor: theme === "dark" ? colors.background : colors.backgroundLight }}
            handleIndicatorStyle={{ backgroundColor: theme === "dark" ? 'white' : 'black', width: 40 }}
            enableContentPanningGesture={false}
        >
            <BottomSheetView style={{ flex: 1, borderTopLeftRadius: 0, borderTopRightRadius: 0, overflow: 'hidden' }}>
                {content}
            </BottomSheetView>
        </BottomSheet>
    </BottomSheetContext.Provider>
  );
}

export function useBottomSheet() {
  const ctx = useContext(BottomSheetContext);
  if (!ctx) throw new Error("useBottomSheet must be inside BottomSheetProvider");
  return ctx;
}
