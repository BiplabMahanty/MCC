import { FlashList } from '@shopify/flash-list';
import { StyleSheet, Text, View } from 'react-native';

import EmptyState from '../../../components/common/EmptyState';
import ErrorState from '../../../components/common/ErrorState';
import Loader from '../../../components/common/Loader';
import Screen from '../../../components/common/Screen';
import colors from '../../../theme/colors';
import PortalHeader from '../components/PortalHeader';
import RecordListItem from '../components/RecordListItem';
import StudentPageHeader from '../components/StudentPageHeader';
import usePortalQuery from '../hooks/usePortalQuery';

// Icon and colour per resource type
const RESOURCE_META = {
  batches:  { icon: '📅', iconBg: colors.iconBgOrange },
  subjects: { icon: '📚', iconBg: colors.iconBgPurple },
  students: { icon: '👥', iconBg: colors.iconBgGreen },
  teachers: { icon: '👨🏫', iconBg: colors.iconBgBlue },
};

function subtitle(kind, item) {
  if (kind === 'batches')
    return [item.code, item.courseId?.name, item.academicSession].filter(Boolean).join(' · ');
  if (kind === 'subjects')
    return [item.code, item.courseId?.name, item.description].filter(Boolean).join(' · ');
  if (kind === 'students')
    return [item.studentCode, item.batchId?.name, item.email].filter(Boolean).join(' · ');
  return [item.employeeCode, item.qualification, item.email].filter(Boolean).join(' · ');
}

function RecordCard({ item, resource }) {
  const meta = RESOURCE_META[resource] ?? { icon: '📄', iconBg: colors.iconBgBlue };
  return (
    <View style={styles.card}>
      <View style={[styles.cardIcon, { backgroundColor: meta.iconBg }]}>
        <Text style={{ fontSize: 18 }}>{meta.icon}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardSub} numberOfLines={2}>{subtitle(resource, item)}</Text>
      </View>
      {item.isActive !== undefined ? (
        <View style={[styles.badge, item.isActive ? styles.badgeActive : styles.badgeInactive]}>
          <Text style={[styles.badgeText, item.isActive ? styles.badgeTextActive : styles.badgeTextInactive]}>
            {item.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export default function PortalCollectionScreen({ navigation, route }) {
  const { role, resource, title } = route.params;
  const query = usePortalQuery(role, resource);
  const records = query.data?.data ?? [];

  // Only apply student header for student role
  const isStudent = role === 'student';

  if (!isStudent) {
    // Teacher role — keep original plain layout (not in scope)
    if (query.isPending) return <Screen><Loader message={`Loading ${title.toLowerCase()}...`} /></Screen>;
    if (query.error) return <Screen><ErrorState message={query.error.message} onRetry={query.refetch} retrying={query.isFetching} /></Screen>;
    return (
      <Screen>
        <View style={{ flex: 1, gap: 20 }}>
          <PortalHeader onBack={navigation.goBack} subtitle="Information assigned by your institute administrator" title={title} />
          <FlashList
            data={records}
            keyExtractor={(item) => item._id}
            ListEmptyComponent={<EmptyState message="Your administrator has not assigned any records yet." title={`No ${title.toLowerCase()}`} />}
            onRefresh={query.refetch}
            refreshing={query.isRefetching}
            renderItem={({ item }) => <RecordListItem active={item.isActive} subtitle={subtitle(resource, item)} title={item.name} />}
          />
        </View>
      </Screen>
    );
  }

  return (
    <View style={styles.root}>
      <StudentPageHeader
        title={title}
        subtitle="Assigned by your institute administrator"
        onBack={navigation.goBack}
      />
      <View style={styles.body}>
        {query.isPending ? <Loader message={`Loading ${title.toLowerCase()}…`} /> : null}
        {query.error ? (
          <ErrorState message={query.error.message} onRetry={query.refetch} retrying={query.isFetching} />
        ) : null}
        {!query.isPending && !query.error ? (
          <FlashList
            data={records}
            estimatedItemSize={80}
            keyExtractor={(item) => item._id}
            ListEmptyComponent={
              <EmptyState
                title={`No ${title.toLowerCase()}`}
                message="Your administrator has not assigned any records yet."
              />
            }
            onRefresh={query.refetch}
            refreshing={query.isRefetching}
            renderItem={({ item }) => <RecordCard item={item} resource={resource} />}
            contentContainerStyle={styles.listContent}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.dashBg },
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  listContent: { paddingBottom: 36 },

  card: {
    backgroundColor: colors.dashCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.dashBorder,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cardIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, gap: 3 },
  cardTitle: { fontSize: 14, fontWeight: '800', color: colors.dashText },
  cardSub: { fontSize: 12, color: colors.dashSubText, lineHeight: 17 },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  badgeActive: { backgroundColor: '#DCFCE7' },
  badgeInactive: { backgroundColor: '#FEE2E2' },
  badgeText: { fontSize: 10, fontWeight: '700' },
  badgeTextActive: { color: colors.dashUp },
  badgeTextInactive: { color: '#DC2626' },
});
