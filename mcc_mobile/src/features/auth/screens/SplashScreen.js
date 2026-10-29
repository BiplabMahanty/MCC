import { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Screen from '../../../components/common/Screen';
import colors from '../../../theme/colors';
import env from '../../../config/env';

export default function SplashScreen() {
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [float]);

  const bookTranslateY = float.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const bookRotate = float.interpolate({
    inputRange: [0, 1],
    outputRange: ['-3deg', '3deg'],
  });

  return (
    <Screen>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.studyAnimation,
            { transform: [{ translateY: bookTranslateY }, { rotate: bookRotate }] },
          ]}
        >
          <Text style={styles.bookEmoji}>📚</Text>
          <View style={styles.studySpark} />
        </Animated.View>
        <View style={styles.mark}>
          <Text style={styles.markText}>CSM</Text>
        </View>
        <Text style={styles.title}>{env.instituteName}</Text>
        <Text style={styles.subtitle}>Restoring your secure session…</Text>
        <ActivityIndicator color={colors.primary} size="small" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
  },
  mark: {
    alignItems: 'center',
    backgroundColor: colors.black,
    borderRadius: 22,
    height: 76,
    justifyContent: 'center',
    marginBottom: 8,
    width: 76,
  },
  studyAnimation: {
    alignItems: 'center',
    height: 58,
    justifyContent: 'center',
    marginBottom: -2,
    width: 88,
  },
  bookEmoji: {
    fontSize: 42,
  },
  studySpark: {
    backgroundColor: colors.primary,
    borderRadius: 4,
    bottom: 3,
    height: 5,
    opacity: 0.55,
    position: 'absolute',
    width: 42,
  },
  markText: {
    color: colors.primary,
    fontSize: 23,
    fontWeight: '900',
  },
  title: {
    color: colors.black,
    fontSize: 22,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: 14,
    marginBottom: 8,
  },
});
