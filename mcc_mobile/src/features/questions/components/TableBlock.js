import { ScrollView, StyleSheet, Text, View } from 'react-native';

import colors from '../../../theme/colors';

export default function TableBlock({ block }) {
  return (
    <View style={styles.container}>
      {block.caption ? (
        <Text style={styles.caption}>{block.caption}</Text>
      ) : null}
      <ScrollView horizontal>
        <View style={styles.table}>
          <View style={styles.row}>
            {block.headers.map((cell, index) => (
              <Text
                key={`${cell}-${index}`}
                style={[styles.cell, styles.header]}
              >
                {cell}
              </Text>
            ))}
          </View>
          {block.rows.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.row}>
              {row.map((cell, cellIndex) => (
                <Text key={`cell-${cellIndex}`} style={styles.cell}>
                  {cell}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  caption: { color: colors.darkNeutral, fontSize: 13, fontWeight: '700' },
  table: { borderColor: colors.border, borderLeftWidth: 1, borderTopWidth: 1 },
  row: { flexDirection: 'row' },
  cell: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    borderRightColor: colors.border,
    borderRightWidth: 1,
    color: colors.black,
    minWidth: 100,
    padding: 10,
  },
  header: { backgroundColor: colors.lightNeutral, fontWeight: '800' },
});
