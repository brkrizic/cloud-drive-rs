import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

type Props = {
  uri: string;
  fileName: string;
};

const AudioPreview: React.FC<Props> = ({ uri, fileName }) => {
  const player = useAudioPlayer(uri, { downloadFirst: true });
  const status = useAudioPlayerStatus(player);


  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
    });

    return () => {
      player.release();
    };
  }, [player]);

  const canPlay = Number.isFinite(player.duration) && player.duration > 0;
  const isPlaying = player.playing;


  const togglePlay = () => {
    if (!canPlay) return;

    
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }

  };

  const formatTime = (seconds = 0) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <View className="flex-1 items-center justify-center bg-black px-4">
      <View className="w-full max-w-md rounded-2xl bg-zinc-900 p-5">
        <Text numberOfLines={1} className="text-white mb-4 text-center">
          {fileName}
        </Text>

        <View className="flex-row items-center justify-center gap-6">
          <Pressable onPress={togglePlay} disabled={!canPlay}>
            <Ionicons
              name={isPlaying ? 'pause-circle' : 'play-circle'}
              size={64}
              color={canPlay ? 'white' : 'gray'}
            />
          </Pressable>

          <Text className="text-gray-300">
            {formatTime(player.currentTime)} / {formatTime(player.duration)}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default AudioPreview;
