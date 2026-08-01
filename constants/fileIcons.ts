import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export const fileIcons: Record<string, { icon: any; color: string }> = {
  pdf: { icon: MaterialCommunityIcons, name: 'file-pdf-box', color: '#EF4444' },       // red
  doc: { icon: MaterialCommunityIcons, name: 'file-word-box', color: '#2563EB' },      // blue
  docx: { icon: MaterialCommunityIcons, name: 'file-word-box', color: '#2563EB' },
  xls: { icon: MaterialCommunityIcons, name: 'file-excel-box', color: '#16A34A' },     // green
  xlsx: { icon: MaterialCommunityIcons, name: 'file-excel-box', color: '#16A34A' },
  ppt: { icon: MaterialCommunityIcons, name: 'file-powerpoint-box', color: '#F59E0B' },// orange
  pptx: { icon: MaterialCommunityIcons, name: 'file-powerpoint-box', color: '#F59E0B' },
  txt: { icon: Ionicons, name: 'document-text-outline', color: '#64748B' },               // gray
  csv: { icon: MaterialCommunityIcons, name: 'file-delimited-outline', color: '#16A34A' },
  zip: { icon: MaterialCommunityIcons, name: 'folder-zip-outline', color: '#FBBF24' },     // yellow
  rar: { icon: MaterialCommunityIcons, name: 'folder-zip-outline', color: '#FBBF24' },
  mp3: { icon: MaterialCommunityIcons, name: 'file-music-outline', color: '#0EA5E9' },    // blue
  wav: { icon: MaterialCommunityIcons, name: 'file-music-outline', color: '#0EA5E9' },
  mp4: { icon: MaterialCommunityIcons, name: 'file-video-outline', color: '#2563EB' },     // blue
  mov: { icon: MaterialCommunityIcons, name: 'file-video-outline', color: '#2563EB' },
  jpg: { icon: MaterialCommunityIcons, name: 'file-image-outline', color: '#F59E0B' },    // yellow/orange
  jpeg: { icon: MaterialCommunityIcons, name: 'file-image-outline', color: '#F59E0B' },
  png: { icon: MaterialCommunityIcons, name: 'file-image-outline', color: '#F59E0B' },
  gif: { icon: MaterialCommunityIcons, name: 'file-image-outline', color: '#F59E0B' },
  default: { icon: Ionicons, name: 'document-outline', color: '#94A3B8' },               // fallback gray
};

type FileIconDescriptor =
  | {
      type: "vector";
      library: "material" | "ion";
      name: string;
      color: string;
    }
  | {
      type: "image";
      source: any;
    };

export const fileIconsTest: Record<string, FileIconDescriptor> = {
  pdf: {
    type: "vector",
    library: "material",
    name: "file-pdf-box",
    color: "#EF4444",
  },
  pptx: {
    type: "vector",
    library: "material",
    name: "file-powerpoint-box",
    color: "#F59E0B",
  },
  txt: {
    type: "vector",
    library: "ion",
    name: "document-text-outline",
    color: "#64748B",
  },
  mp4: {
    type: "vector",
    library: "material",
    name: "file-video",
    color: "#2563EB"
  },
  png: {
    type: "vector",
    library: "material",
    name: "file-image",
    color: "#F59E0B"
  },
  jpg: {
    type: "vector",
    library: "material",
    name: "file-image",
    color: "#F59E0B"
  },
  mp3: {
    type: "vector",
    library: "material",
    name: "file-music",
    color: "#0EA5E9"
  },
  

  // 🔥 PNG example
  xlsx: {
    type: "image",
    source: require("assets/icons/xlsIconFill.png"),
  },

  doc: {
    type: "image",
    source: require("assets/icons/docIcon.png"),
  },

  default: {
    type: "vector",
    library: "ion",
    name: "document-outline",
    color: "#94A3B8",
  },
};
