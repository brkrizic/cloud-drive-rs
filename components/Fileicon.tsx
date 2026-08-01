import { Image, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { fileIcons, fileIconsTest } from "constants/fileIcons";

type Props = {
  ext: string;
  size?: number;
};

export function FileIcon({ ext, size = 34 }: Props) {
  const icon = fileIconsTest[ext] ?? fileIconsTest.default;

  if (icon.type === "image") {
    return (
        <View style={{ marginRight: 10 }}>
            <Image
                source={icon.source}
                style={{ width: size, height: size }}
                resizeMode="contain"
            />
        </View>
    );
  }

  if (icon.library === "material") {
    return (
        <View style={{ marginRight: 10 }}>
            <MaterialCommunityIcons
                name={icon.name as any}
                size={size}
                color={icon.color}
            />
      </View>
    );
  }

  return (
    <Ionicons
      name={icon.name as any}
      size={size}
      color={icon.color}
    />
  );
}