import { StyleSheet, View } from 'react-native';

const backgroundLayers = [
  {
    type: 'linear-gradient',
    direction: '90deg',
    colorStops: [
      { color: 'rgba(0, 4, 3, 0.70)', positions: ['0%'] },
      { color: 'rgba(0, 7, 5, 0.12)', positions: ['30%'] },
      { color: 'rgba(0, 7, 5, 0)', positions: ['63%'] },
      { color: 'rgba(0, 4, 3, 0.58)', positions: ['100%'] },
    ],
  },
  {
    type: 'radial-gradient',
    shape: 'ellipse',
    size: { x: '95%', y: '78%' },
    position: { top: '46%', left: '30%' },
    colorStops: [
      { color: 'rgba(0, 4, 3, 0.68)', positions: ['0%'] },
      { color: 'rgba(0, 11, 8, 0.38)', positions: ['42%'] },
      { color: 'rgba(0, 17, 12, 0)', positions: ['82%'] },
    ],
  },
  {
    type: 'radial-gradient',
    shape: 'ellipse',
    size: { x: '90%', y: '58%' },
    position: { top: '-12%', right: '-24%' },
    colorStops: [
      { color: 'rgba(18, 122, 78, 0.80)', positions: ['0%'] },
      { color: 'rgba(12, 93, 60, 0.58)', positions: ['27%'] },
      { color: 'rgba(7, 66, 43, 0.30)', positions: ['53%'] },
      { color: 'rgba(1, 25, 17, 0)', positions: ['82%'] },
    ],
  },
  {
    type: 'radial-gradient',
    shape: 'ellipse',
    size: { x: '82%', y: '68%' },
    position: { top: '37%', left: '-39%' },
    colorStops: [
      { color: 'rgba(5, 68, 44, 0.54)', positions: ['0%'] },
      { color: 'rgba(3, 48, 32, 0.26)', positions: ['48%'] },
      { color: 'rgba(1, 25, 17, 0)', positions: ['85%'] },
    ],
  },
  {
    type: 'radial-gradient',
    shape: 'ellipse',
    size: { x: '93%', y: '55%' },
    position: { bottom: '-29%', left: '-28%' },
    colorStops: [
      { color: 'rgba(8, 84, 54, 0.56)', positions: ['0%'] },
      { color: 'rgba(5, 58, 38, 0.24)', positions: ['48%'] },
      { color: 'rgba(1, 25, 17, 0)', positions: ['82%'] },
    ],
  },
  {
    type: 'linear-gradient',
    direction: '160deg',
    colorStops: [
      { color: '#00120D', positions: ['0%'] },
      { color: '#02251A', positions: ['34%'] },
      { color: '#011A12', positions: ['69%'] },
      { color: '#000907', positions: ['100%'] },
    ],
  },
];

export default function AuthBackground({ children }) {
  return (
    <View style={styles.background}>
      <View pointerEvents="none" style={styles.upperCurve} />
      <View pointerEvents="none" style={styles.lowerCurve} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#000907',
    experimental_backgroundImage: backgroundLayers,
    flex: 1,
    overflow: 'hidden',
  },
  upperCurve: {
    experimental_backgroundImage: [
      {
        type: 'radial-gradient',
        shape: 'ellipse',
        size: 'farthest-corner',
        position: { top: '16%', right: '28%' },
        colorStops: [
          { color: 'rgba(24, 125, 80, 0.22)', positions: ['0%'] },
          { color: 'rgba(12, 83, 55, 0.12)', positions: ['45%'] },
          { color: 'rgba(5, 49, 34, 0)', positions: ['100%'] },
        ],
      },
    ],
    borderRadius: 360,
    height: 690,
    position: 'absolute',
    right: -245,
    top: -385,
    transform: [{ rotate: '-13deg' }],
    width: 680,
  },
  lowerCurve: {
    experimental_backgroundImage: [
      {
        type: 'radial-gradient',
        shape: 'ellipse',
        size: 'farthest-corner',
        position: { bottom: '30%', left: '38%' },
        colorStops: [
          { color: 'rgba(10, 111, 68, 0.27)', positions: ['0%'] },
          { color: 'rgba(6, 71, 47, 0.13)', positions: ['48%'] },
          { color: 'rgba(3, 42, 29, 0)', positions: ['100%'] },
        ],
      },
    ],
    borderRadius: 360,
    bottom: -310,
    height: 500,
    left: -350,
    position: 'absolute',
    transform: [{ rotate: '17deg' }],
    width: 740,
  },
});
