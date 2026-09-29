import { Image, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

import colors from '../../../theme/colors';

export default function ImageBlock({ block }) {
  const ratio =
    block.width && block.height ? block.width / block.height : 16 / 9;

  return (
    <View style={styles.container}>
      {block.mimeType === 'image/svg+xml' ? (
        <WebView
          javaScriptEnabled={false}
          originWhitelist={['https://*', 'http://*']}
          source={{ uri: block.url }}
          style={styles.svg}
        />
      ) : (
        <Image
          accessibilityLabel={block.alt}
          resizeMode="contain"
          source={{ uri: block.url }}
          style={[styles.image, { aspectRatio: ratio }]}
        />
      )}
      <Text style={styles.caption}>{block.alt}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  image: {
    backgroundColor: colors.lightNeutral,
    borderRadius: 10,
    width: '100%',
  },
  svg: { backgroundColor: colors.lightNeutral, height: 220, width: '100%' },
  caption: { color: colors.mutedText, fontSize: 12, textAlign: 'center' },
});
