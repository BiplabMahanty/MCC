import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import colors from '../../../theme/colors';

function pad(n) {
  return String(n).padStart(2, '0');
}

function formatMs(ms) {
  if (ms <= 0) return '00:00:00';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

/**
 * Server-authoritative countdown.
 * expiresAt — ISO string from server.
 * onExpire  — called once when time reaches zero.
 */
export default function ExamTimer({ expiresAt, onExpire }) {
  const expireMs = new Date(expiresAt).getTime();
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, expireMs - Date.now()),
  );
  const firedRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const left = Math.max(0, expireMs - Date.now());
      setRemaining(left);
      if (left === 0 && !firedRef.current) {
        firedRef.current = true;
        onExpire?.();
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expireMs, onExpire]);

  const urgent = remaining < 5 * 60 * 1000; // last 5 minutes

  return (
    <View style={[styles.container, urgent && styles.urgent]}>
      <Text style={[styles.time, urgent && styles.timeUrgent]}>
        {formatMs(remaining)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.lightNeutral,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  urgent: { backgroundColor: colors.errorSurface },
  time: {
    color: colors.black,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  timeUrgent: { color: colors.error },
});
