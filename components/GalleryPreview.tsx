import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    ActivityIndicator,
    FlatList,
    Dimensions,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Modal,
} from 'react-native';
import { useFilePreview } from 'hooks/useFilePreview';
import { FileItem } from 'constants/fileItem';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GalleryItemPreview from './GalleryItemPreview';
import { useSettings } from 'context/SettingsContext';
import { colors } from 'constants/colors';

type Props = {
    files: FileItem[];
    initialIndex: number;
    visible: boolean;
    setVisible: (v: boolean) => void;
};


const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const GalleryPreview: React.FC<Props> = ({
    files,
    initialIndex,
    visible,
    setVisible,
    }) => {
    const { getPreviewUri } = useFilePreview();
    const [imageUris, setImageUris] = useState<string[] | null>(null);
    const insets = useSafeAreaInsets();

    const fullscreenRef = useRef<FlatList>(null);
    const thumbRef = useRef<FlatList>(null);
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    const { theme } = useSettings();

    useEffect(() => {
        let mounted = true;
        (async () => {
        const uris: string[] = [];
        for (const file of files) {
            try {
            const uri = await getPreviewUri(file);
            uris.push(uri);
            } catch (err) {
            console.warn('Failed to get preview for', file.fileName, err);
            }
        }
        if (mounted) setImageUris(uris);
        })();
        return () => {
        mounted = false;
        };
    }, [files, getPreviewUri]);


    const onFullscreenScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetX = e.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / SCREEN_WIDTH);
        if (index !== currentIndex) {
            setCurrentIndex(index);
            thumbRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
        }
    };

    if (!imageUris) {
        return (
        <View
            style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'black',
            }}
        >
            <ActivityIndicator size="large" color="#fff" />
        </View>
        );
    }

    const bg =
        theme === "dark" ? colors.background : colors.backgroundLight;

    return (
        <Modal visible={visible} transparent={true} onRequestClose={() => setVisible(false)}>
        <View style={{ flex: 1, backgroundColor: bg, paddingTop: insets.top }}>
            {/* Fullscreen FlatList */}
            <FlatList
                ref={fullscreenRef}
                data={imageUris}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                    <GalleryItemPreview uri={item} file={files[index]}/>
                )}
                onScroll={onFullscreenScroll}
                scrollEventThrottle={16}
                getItemLayout={(_, index) => ({
                        length: SCREEN_WIDTH,
                        offset: SCREEN_WIDTH * index,
                        index,
                    })}
                initialScrollIndex={initialIndex}
            />

        </View>
        </Modal>
    );
};

    export default GalleryPreview;
