import { useMemo, useState } from 'react';
import katex from 'katex';
import { StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

import colors from '../../../theme/colors';

export default function FormulaRenderer({ value }) {
  const [height, setHeight] = useState(56);
  const html = useMemo(() => {
    try {
      const math = katex.renderToString(value, {
        displayMode: true,
        output: 'mathml',
        throwOnError: true,
        trust: false,
      });
      return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"><style>html,body{margin:0;padding:0;background:transparent;color:#0A0A0A;font-size:18px}body{display:flex;align-items:center;justify-content:center;min-height:48px;overflow:hidden}math{max-width:100%;overflow-x:auto}</style></head><body>${math}<script>window.ReactNativeWebView.postMessage(String(document.documentElement.scrollHeight));</script></body></html>`;
    } catch {
      return null;
    }
  }, [value]);

  if (!html) {
    return (
      <View style={styles.errorSurface}>
        <Text style={styles.error}>Formula could not be rendered.</Text>
      </View>
    );
  }

  return (
    <WebView
      javaScriptEnabled
      onMessage={(event) => {
        const nextHeight = Number(event.nativeEvent.data);
        if (Number.isFinite(nextHeight)) setHeight(Math.max(48, nextHeight));
      }}
      originWhitelist={['*']}
      scrollEnabled={false}
      source={{ html }}
      style={[styles.webView, { height }]}
    />
  );
}

const styles = StyleSheet.create({
  webView: { backgroundColor: 'transparent', width: '100%' },
  errorSurface: {
    backgroundColor: colors.errorSurface,
    borderRadius: 8,
    padding: 10,
  },
  error: { color: colors.error, fontSize: 13 },
});
