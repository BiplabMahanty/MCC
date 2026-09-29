import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import AppButton from '../../../components/common/AppButton';
import ErrorState from '../../../components/common/ErrorState';
import Loader from '../../../components/common/Loader';
import Screen from '../../../components/common/Screen';
import env from '../../../config/env';
import colors from '../../../theme/colors';
import useHealthQuery from '../hooks/useHealthQuery';

function ServiceRow({ label, status }) {
  const connected = status === 'connected';

  return (
    <View style={styles.serviceRow}>
      <View style={styles.serviceName}>
        <View
          style={[
            styles.dot,
            connected ? styles.dotConnected : styles.dotDisconnected,
          ]}
        />
        <Text style={styles.serviceLabel}>{label}</Text>
      </View>
      <Text
        style={[
          styles.serviceStatus,
          connected ? styles.connected : styles.disconnected,
        ]}
      >
        {connected ? 'Connected' : 'Disconnected'}
      </Text>
    </View>
  );
}

export default function HealthScreen() {
  const { data, error, isFetching, isPending, refetch } = useHealthQuery();

  return (
    <Screen>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.brandMark}>
          <Text style={styles.brandMarkText}>CSM</Text>
        </View>
        <Text style={styles.eyebrow}>COACHING MANAGEMENT SYSTEM</Text>
        <Text style={styles.heading}>Project foundation</Text>
        <Text style={styles.subtitle}>
          Mobile and backend infrastructure status
        </Text>

        <View style={styles.card}>
          {isPending ? <Loader /> : null}

          {error ? (
            <ErrorState
              message={error.message}
              onRetry={refetch}
              retrying={isFetching}
            />
          ) : null}

          {data ? (
            <View style={styles.healthContent}>
              <View style={styles.summary}>
                <View
                  style={[
                    styles.summaryIcon,
                    data.status === 'healthy'
                      ? styles.healthySurface
                      : styles.degradedSurface,
                  ]}
                >
                  <Text
                    style={[
                      styles.summaryIconText,
                      data.status === 'healthy'
                        ? styles.connected
                        : styles.disconnected,
                    ]}
                  >
                    {data.status === 'healthy' ? '✓' : '!'}
                  </Text>
                </View>
                <View style={styles.summaryText}>
                  <Text style={styles.summaryTitle}>Backend connected</Text>
                  <Text style={styles.summarySubtitle}>
                    {data.status === 'healthy'
                      ? 'All foundation services are ready.'
                      : 'The API is reachable, but a dependency needs attention.'}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />
              <ServiceRow label="API" status={data.services?.api?.status} />
              <ServiceRow
                label="MongoDB"
                status={data.services?.mongodb?.status}
              />
              <ServiceRow label="Redis" status={data.services?.redis?.status} />

              <Text style={styles.timestamp}>
                Last checked: {new Date(data.timestamp).toLocaleString()}
              </Text>
              <AppButton
                disabled={isFetching}
                label={isFetching ? 'Refreshing…' : 'Refresh status'}
                onPress={refetch}
              />
            </View>
          ) : null}
        </View>

        <Text selectable style={styles.endpoint}>
          API: {env.apiUrl}
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  brandMark: {
    alignItems: 'center',
    backgroundColor: colors.black,
    borderRadius: 16,
    height: 58,
    justifyContent: 'center',
    marginBottom: 20,
    width: 58,
  },
  brandMarkText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  heading: {
    color: colors.black,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.7,
    marginTop: 8,
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 28,
    marginTop: 8,
  },
  card: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  healthContent: {
    gap: 16,
  },
  summary: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  summaryIcon: {
    alignItems: 'center',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  healthySurface: {
    backgroundColor: colors.successSurface,
  },
  degradedSurface: {
    backgroundColor: colors.warningSurface,
  },
  summaryIconText: {
    fontSize: 24,
    fontWeight: '900',
  },
  summaryText: {
    flex: 1,
    gap: 3,
  },
  summaryTitle: {
    color: colors.black,
    fontSize: 20,
    fontWeight: '800',
  },
  summarySubtitle: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 20,
  },
  divider: {
    backgroundColor: colors.border,
    height: 1,
  },
  serviceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 28,
  },
  serviceName: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  dot: {
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  dotConnected: {
    backgroundColor: colors.success,
  },
  dotDisconnected: {
    backgroundColor: colors.warning,
  },
  serviceLabel: {
    color: colors.darkNeutral,
    fontSize: 15,
    fontWeight: '600',
  },
  serviceStatus: {
    fontSize: 13,
    fontWeight: '700',
  },
  connected: {
    color: colors.success,
  },
  disconnected: {
    color: colors.warning,
  },
  timestamp: {
    color: colors.mutedText,
    fontSize: 12,
    marginTop: 4,
  },
  endpoint: {
    color: colors.mutedText,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 16,
    textAlign: 'center',
  },
});
