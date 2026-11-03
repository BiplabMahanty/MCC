import { Component } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import colors from '../../../theme/colors';

const MENU_GROUPS = [
  {
    title: 'Overview',
    items: [{ label: 'Dashboard', icon: '⌂', route: 'TeacherHome' }],
  },
  {
    title: 'Teaching',
    items: [
      { label: 'My Batches', icon: '▣', route: 'TeacherBatches' },
      { label: 'My Subjects', icon: '▤', route: 'TeacherSubjects' },
      { label: 'Students', icon: '♟', route: 'TeacherStudents' },
    ],
  },
  {
    title: 'Content',
    items: [
      { label: 'Assignments', icon: '✎', route: 'TeacherAssignments' },
      { label: 'Materials', icon: '📂', route: 'TeacherMaterials' },
    ],
  },
  {
    title: 'Academics',
    items: [
      { label: 'Question Bank', icon: '✓', route: 'TeacherQuestionBank' },
      { label: 'Exams', icon: '▥', route: 'TeacherExamList' },
      { label: 'Schedule', icon: '▦', route: 'TeacherSchedule' },
    ],
  },
  {
    title: 'Account',
    items: [{ label: 'My Profile', icon: '●', route: 'TeacherProfile' }],
  },
];

export default class TeacherSidebar extends Component {
  handleNavigate = (route) => {
    this.props.onClose?.();
    this.props.navigation.navigate(route);
  };

  renderMenuItem = (item) => {
    const active = this.props.currentRoute === item.route;

    return (
      <Pressable
        key={item.label}
        accessibilityRole="button"
        onPress={() => this.handleNavigate(item.route)}
        style={({ pressed, hovered }) => [
          styles.menuItem,
          active && styles.menuItemActive,
          hovered && styles.menuItemHovered,
          pressed && styles.menuItemPressed,
        ]}
      >
        <Text style={[styles.menuIcon, active && styles.menuIconActive]}>
          {item.icon}
        </Text>
        <Text style={[styles.menuLabel, active && styles.menuLabelActive]}>
          {item.label}
        </Text>
        <Text style={[styles.chevron, active && styles.menuLabelActive]}>
          ›
        </Text>
      </Pressable>
    );
  };

  render() {
    const { visible, onClose, user, onLogout } = this.props;

    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.modalRoot}>
          <SafeAreaView style={styles.sidebar} edges={['top', 'bottom']}>
            <View style={styles.sidebarHeader}>
              <View style={styles.profileIcon}>
                <Text style={styles.profileIconText}>
                  {user?.name?.charAt(0).toUpperCase() ?? 'T'}
                </Text>
              </View>
              <View style={styles.profileCopy}>
                <Text style={styles.profileName} numberOfLines={1}>
                  {user?.name ?? 'Teacher'}
                </Text>
                <Text style={styles.profileSubtitle} numberOfLines={1}>
                  {user?.instituteName ?? 'Teacher Portal'}
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Close menu"
                onPress={onClose}
                style={({ pressed, hovered }) => [
                  styles.closeButton,
                  hovered && styles.closeButtonHovered,
                  pressed && styles.closeButtonPressed,
                ]}
              >
                <Text style={styles.closeText}>×</Text>
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.menuContent}
            >
              {MENU_GROUPS.map((group) => (
                <View key={group.title} style={styles.menuGroup}>
                  <Text style={styles.groupTitle}>{group.title}</Text>
                  {group.items.map(this.renderMenuItem)}
                </View>
              ))}
              <View style={styles.divider} />
              <Pressable
                onPress={() => {
                  onClose?.();
                  onLogout?.();
                }}
                style={({ pressed, hovered }) => [
                  styles.menuItem,
                  styles.logoutItem,
                  hovered && styles.logoutHovered,
                  pressed && styles.menuItemPressed,
                ]}
              >
                <Text style={styles.logoutIcon}>↪</Text>
                <Text style={styles.logoutLabel}>Sign Out</Text>
              </Pressable>
            </ScrollView>
          </SafeAreaView>
          <Pressable
            accessibilityLabel="Close navigation menu"
            style={styles.dismissArea}
            onPress={onClose}
          />
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  modalRoot: { flex: 1, flexDirection: 'row' },
  dismissArea: { flex: 1, backgroundColor: 'rgba(13, 61, 36, 0.48)' },
  sidebar: {
    width: '86%',
    maxWidth: 390,
    backgroundColor: colors.dashCard,
    elevation: 18,
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
  },
  sidebarHeader: {
    backgroundColor: colors.dashGreen,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.dashGreenAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIconText: { color: '#fff', fontSize: 20, fontWeight: '900' },
  profileCopy: { flex: 1, gap: 3 },
  profileName: { color: '#fff', fontSize: 17, fontWeight: '900' },
  profileSubtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 12 },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonHovered: { backgroundColor: 'rgba(255,255,255,0.16)' },
  closeButtonPressed: { backgroundColor: 'rgba(255,255,255,0.24)' },
  closeText: { color: '#fff', fontSize: 30, fontWeight: '300', lineHeight: 32 },
  menuContent: {
    paddingHorizontal: 16,
    paddingVertical: 22,
    paddingBottom: 32,
  },
  menuGroup: { marginBottom: 22 },
  groupTitle: {
    color: colors.dashSubText,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginHorizontal: 8,
    marginBottom: 8,
  },
  menuItem: {
    minHeight: 58,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 14,
  },
  menuItemActive: { backgroundColor: colors.dashGreenLight },
  menuItemHovered: { backgroundColor: colors.dashGreenLight },
  menuItemPressed: {
    backgroundColor: '#D5EDDF',
    transform: [{ scale: 0.985 }],
  },
  menuIcon: {
    display: 'none',
    width: 24,
    color: colors.dashSubText,
    fontSize: 22,
    textAlign: 'center',
  },
  menuIconActive: { color: colors.dashGreen },
  menuLabel: {
    flex: 1,
    color: colors.dashText,
    fontSize: 15,
    fontWeight: '700',
  },
  menuLabelActive: { color: colors.dashGreen, fontWeight: '900' },
  chevron: { color: colors.dashSubText, fontSize: 26, fontWeight: '300' },
  divider: {
    height: 1,
    backgroundColor: colors.dashBorder,
    marginHorizontal: 8,
    marginBottom: 12,
  },
  logoutItem: { marginBottom: 8 },
  logoutHovered: { backgroundColor: '#FEE2E2' },
  logoutIcon: {
    display: 'none',
    width: 24,
    color: '#DC2626',
    fontSize: 22,
    textAlign: 'center',
  },
  logoutLabel: { color: '#DC2626', fontSize: 15, fontWeight: '800' },
});
