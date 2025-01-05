import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Modal } from 'react-native';

const SubscribedUsers = ({ visible, onClose, clubInfoPrin }) => {
  const [users, setUsers] = useState([
    { id: '1', name: 'User1', phone: '123456789' },
    { id: '2', name: 'User2', phone: '987654321' },
  ]);
  console.log(clubInfoPrin.users)

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Usuarios Suscritos</Text>
          <FlatList
            data={clubInfoPrin.users}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <Text style={styles.itemText}>Nombre: <Text style={{color:'green'}}>{item.info.user}</Text></Text>
                <Text style={styles.itemText}>Telefono: <Text style={{color:'green'}}>{item.info.user_tlfn}</Text></Text>
                <Text style={styles.itemText}>Rango: <Text style={{color:'green'}}>{item.info.rank}</Text></Text>
              </View>
            )}
          />
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
  item: {
    marginBottom: 10,
    borderWidth:1,
    padding:9,
    borderRadius:15,
    borderColor:'red',
  },
  itemText: {
    color: '#FFFFFF',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
});

export default SubscribedUsers;
