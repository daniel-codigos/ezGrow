import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LinearGradient } from 'react-native';

interface EnchufesMenuProps {
  nombre: string;
  onPress: () => void;
}

const EnchufesMenu: React.FC<EnchufesMenuProps> = ({ nombre, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.touchable}>
      <View style={styles.card}>
        <View style={styles.gradientContainer}>
          <Text style={styles.ench_titulo}>{nombre}</Text>
        </View>
        <View style={styles.indicatorContainer}>
          <View style={styles.indicator} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    marginVertical: 15,
    marginHorizontal: 10,
    borderRadius: 15,
    overflow: 'hidden',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#dcdcdc',
    borderRadius: 15,
    elevation: 10, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  gradientContainer: {
    flex: 3,
    backgroundColor: '#007AFF',
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
    paddingVertical: 20,
    paddingHorizontal: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ench_titulo: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  indicatorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#29D8DB', // A vibrant indicator color
  },
});

export default EnchufesMenu;
