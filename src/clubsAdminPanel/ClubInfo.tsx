import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Modal } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';

const ClubInfo = ({ visible, onClose, clubInfoPrin }) => {
  const [latitude, longitude] = clubInfoPrin.info[0]?.info.location.split(', ').map(Number);

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Información del Club</Text>
          <Image source={{ uri: clubInfoPrin.info[0]?.info.imagen }} style={styles.image} />
          <Text style={styles.label}>
            Nombre del Club: <Text style={{color:'green'}}>{clubInfoPrin.info[0]?.info.name}</Text>
          </Text>
          <Text style={styles.label}>
            Descripción: <Text style={{color:'green'}}>{clubInfoPrin.info[0]?.info.descipcionClub}</Text>
          </Text>
          <Text style={styles.label}>Localización:</Text>
          <View style={styles.mapContainer}>
            <MapView
              provider={undefined} // No utilizamos Google Maps
              style={styles.map}
              initialRegion={{
                latitude: latitude || 40.416775,
                longitude: longitude || -3.703790,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            >
              <UrlTile
                urlTemplate="http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maximumZ={19}
                flipY={false}
              />
              <Marker
                coordinate={{ latitude: latitude || 40.416775, longitude: longitude || -3.703790 }}
                title={clubInfoPrin.info[0]?.info.name}
                description={clubInfoPrin.info[0]?.info.descipcionClub}
              />
            </MapView>
          </View>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#212121',
    width: '100%',
    height: '100%',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    color: '#00FFFF',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 10,
  },
  mapContainer: {
    width: '100%',
    height: 200,
    marginBottom: 20,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 15,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
});

export default ClubInfo;
