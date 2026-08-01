import React, { Dispatch, SetStateAction, useState } from "react";
import { View, Pressable, Image, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSettings } from "context/SettingsContext";
import { colors } from "constants/colors";
import SearchBar from "./SearchBar";
import CategorySelector from "./CategorySelector";
import ViewToggleButton from "./ViewToggleButton";
import { Ionicons } from "@expo/vector-icons";
import { useBottomSheet } from "context/BottomSheetContext";
import { FileFilters, SortMode } from "hooks/useFileFilterSort";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PendingActionsList } from "./modals/PendingActionsList";
import Avatar from "./Avatar";

type HeaderProps = {
  query: string;
  setQuery: (text: string) => void;
  toggleFilter: (key: keyof FileFilters) => void;
  setSortMode: (mode: SortMode | null) => void;
  sortMode: SortMode | null;
  isGrid: boolean;
  setIsGrid: (newState: boolean) => void;
  mode: 'home' | 'folder';
  setShowFolders: Dispatch<SetStateAction<boolean>>;
  showFolders: boolean;
};

export default function Header({ mode, query, setQuery, setSortMode, sortMode, toggleFilter, isGrid, setIsGrid, setShowFolders, showFolders }: HeaderProps) {
    const navigation = useNavigation();
    const { theme } = useSettings();
    const { openSheet } = useBottomSheet();
    const insets = useSafeAreaInsets();

    const handleSortPress = () => {
        openSheet(<PendingActionsList/>);
    };

    return (
        <View style={[styles.container, { backgroundColor: theme === "dark" ? colors.background : colors.backgroundLight }]}>
        
            {/* Top Row: Avatar + Search */}
            <View style={styles.topRow}>
                {/* Avatar */}
                <Avatar />

                {/* Search */}
                <View style={styles.searchWrapper}>
                    <SearchBar value={query} onChange={setQuery} onClear={() => setQuery("")} />
                </View>

                {/* Filter button wrapper */}
                <View style={styles.filterWrapper}>
                    <TouchableOpacity
                        onPress={handleSortPress}
                        style={({ pressed }) => [
                            styles.filterButton,
                            { backgroundColor: pressed ? "#e0e0e0" : "transparent" },
                        ]}
                        >
                        <Ionicons
                            name="notifications-outline"
                            size={35}
                            color={theme === "dark" ? colors.accent : colors.accentLight}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Category Selector + Toggle Button Row */}
            <View style={styles.categoryRow}>
                <View style={{ flex: 1 }}>
                    <CategorySelector toggleFilter={toggleFilter}/>
                </View>
                <View style={{ flexDirection: 'row', marginLeft: 8 }}>
                    <ViewToggleButton isGrid={isGrid} onToggle={setIsGrid} />
                    <View style={{ marginTop: 2 }}>
                        <TouchableOpacity onPress={() => setShowFolders(!showFolders)}>
                            <Ionicons name={showFolders ? "folder" : "folder-outline"} size={20} color={theme === "dark" ? "white" : "black"}/>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 0,
        paddingVertical: 6, // tighter padding
    },
    topRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: -10, // reduced spacing below
    },
    avatarButton: {
        marginRight: 10,
    },
    avatar: {
        width: 40, // slightly smaller
        height: 40,
        borderRadius: 12,
        marginBottom: 15
    },
    searchWrapper: {
        flex: 1,
        justifyContent: "center",
    },
    categoryRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    filterWrapper: {
        marginBottom: 15,
        marginLeft: 5,         
        justifyContent: "center", 
        alignItems: "center",
    },
    filterButton: {
        padding: 8,
        borderRadius: 10,
        marginLeft: 8,
        justifyContent: "center",
        alignItems: "center",
    }
});
