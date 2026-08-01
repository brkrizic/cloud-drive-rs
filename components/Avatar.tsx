import { View, Text, Pressable, Image, StyleSheet } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native';

const Avatar = () => {
    const navigation = useNavigation();
  return (
    <View>
        <Pressable
            onPress={() => navigation.openDrawer()}
            style={styles.avatarButton}
        >
            <Image
                source={{ uri: "https://i.pravatar.cc/150?img=12" }}
                style={styles.avatar}
            />
        </Pressable>
    </View>
  )
}

export default Avatar

const styles = StyleSheet.create({
    avatar: {
        width: 40, // slightly smaller
        height: 40,
        borderRadius: 12,
        marginBottom: 15
    },
    avatarButton: {
        marginRight: 5,
    },
})