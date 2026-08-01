import { BaseToast } from 'react-native-toast-message';

export const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#22c55e' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 19, fontWeight: 'bold' }} // bigger title
      text2Style={{ fontSize: 14 }} // bigger subtitle
    />
  ),
};
