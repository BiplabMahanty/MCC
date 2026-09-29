import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const buttonGradient = [
  {
    type: 'linear-gradient',
    direction: '180deg',
    colorStops: [
      { color: '#2BCD80', positions: ['0%'] },
      { color: '#06A963', positions: ['100%'] },
    ],
  },
];

export default function AuthPrimaryButton({
  disabled = false,
  label,
  loading = false,
  onPress,
  style,
}) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        style,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
      ]}
    >
      <View style={styles.gradient}>
        {loading ? (
          <ActivityIndicator color="#F9FBFA" />
        ) : (
          <>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.arrow}>→</Text>
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 11,
    elevation: 7,
    overflow: 'hidden',
    shadowColor: '#00150C',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.3,
    shadowRadius: 11,
    width: '100%',
  },
  gradient: {
    alignItems: 'center',
    backgroundColor: '#06A963',
    borderRadius: 11,
    experimental_backgroundImage: buttonGradient,
    flexDirection: 'row',
    gap: 9,
    justifyContent: 'center',
    minHeight: 58,
  },
  label: {
    color: '#F9FBFA',
    fontSize: 18,
    fontWeight: '700',
  },
  arrow: {
    color: '#F9FBFA',
    fontSize: 20,
    fontWeight: '500',
    marginTop: -1,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.995 }],
  },
  disabled: {
    opacity: 0.6,
  },
});
