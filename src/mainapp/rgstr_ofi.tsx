import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, PermissionsAndroid, Platform, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import BleManager from 'react-native-ble-manager';
import { Picker } from '@react-native-picker/picker';
import { useRoute } from '@react-navigation/native';
import { Buffer } from 'buffer';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import ip from "../ips.json"

const BluetoothProvisioning = () => {
  const route = useRoute();
  const { espacioName } = route.params;
  const [devices, setDevices] = useState([]);
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [writeCharacteristic, setWriteCharacteristic] = useState(null);
  const [showSensorForm, setShowSensorForm] = useState(false);

  const [senName, setSenName] = useState('');
  const [cualTipo, setCualTipo] = useState('');
  const [cualTipoNum, setCualTipoNum] = useState('');
  const [tiposSensor, setTiposSensor] = useState([
    {"name":"sen_water_temp","label":"Temp Agua"},
    {"name":"sen_temp_hume","label":"Temp y Humedad"},
    {"name":"sen_water_dist","label":"Capacidad Agua"},
    {"name":"sen_hume_tierra","label":"Humedad tierra"}
  ]);

  useEffect(() => {
    const startBleManager = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ]);

        if (
          granted['android.permission.BLUETOOTH_SCAN'] !== PermissionsAndroid.RESULTS.GRANTED ||
          granted['android.permission.BLUETOOTH_CONNECT'] !== PermissionsAndroid.RESULTS.GRANTED ||
          granted['android.permission.ACCESS_FINE_LOCATION'] !== PermissionsAndroid.RESULTS.GRANTED ||
          granted['android.permission.ACCESS_COARSE_LOCATION'] !== PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('Permissions denied');
          return;
        }
      }

      BleManager.start({ showAlert: false });

      const handleDiscoverPeripheral = (peripheral) => {
        if (peripheral.name && peripheral.name.includes('Step-sen')) {
          setDevices((prevDevices) => {
            if (!prevDevices.find((dev) => dev.id === peripheral.id)) {
              return [...prevDevices, peripheral];
            }
            return prevDevices;
          });
          BleManager.stopScan(); // Stop scanning once we find the target device
        }
      };

      const handleStopScan = () => {
        console.log('Scan is stopped');
      };

      const handleDisconnectedPeripheral = (data) => {
        console.log('Disconnected from ' + data.peripheral);
      };

      const discoverListener = BleManager.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
      const stopScanListener = BleManager.addListener('BleManagerStopScan', handleStopScan);
      const disconnectListener = BleManager.addListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral);

      // Start scan
      BleManager.scan([], 5, true).then(() => {
        console.log('Scanning...');
      });

      return () => {
        discoverListener.remove();
        stopScanListener.remove();
        disconnectListener.remove();
      };
    };

    startBleManager();
  }, []);

  const connectToDevice = async (device) => {
    try {
      await BleManager.connect(device.id);
      const peripheralInfo = await BleManager.retrieveServices(device.id);
      setSelectedDevice(device);

      // Find the writable characteristic
      const writableCharacteristic = peripheralInfo.characteristics.find(c => c.properties.Write || c.properties.WriteWithoutResponse);
      if (writableCharacteristic) {
        setWriteCharacteristic(writableCharacteristic);
      }

      console.log('Services and Characteristics:', peripheralInfo.services, peripheralInfo.characteristics);
    } catch (error) {
      console.log('Connection error', error);
    }
  };

  const sendCredentials = async () => {
    if (selectedDevice && writeCharacteristic) {
      const { service, characteristic } = writeCharacteristic;
      const credentials = `${ssid}:${password}\n`;
      const data = Buffer.from(credentials, 'utf-8');
      console.log('Sending credentials: ', credentials);
      console.log('Data length: ', data.length);

      try {
        // Convert Buffer to Uint8Array
        const uint8ArrayData = new Uint8Array(data);
        console.log('Uint8Array data:', uint8ArrayData);

        // Send data in chunks
        const chunkSize = 20; // BLE packet payload size limit
        for (let i = 0; i < uint8ArrayData.length; i += chunkSize) {
          const chunk = uint8ArrayData.slice(i, i + chunkSize);
          await BleManager.write(selectedDevice.id, service, characteristic, Array.from(chunk));
          console.log(`Chunk sent: ${Array.from(chunk)}`);
        }

        console.log('Credentials sent');
        Alert.alert("Success", "Credentials sent successfully!");
        setShowSensorForm(true);
      } catch (error) {
        console.log('Error sending credentials', error);
        Alert.alert("Error", "Failed to send credentials");
      }
    } else {
      Alert.alert("Error", "No device or characteristic found");
    }
  };

  const generateRandomToken = (length) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };

  const saveNewSensorInfo = async () => {
    try {
      console.log("Saving sensor info...");
      const name = senName;
      const space = espacioName;
      const tipo = cualTipo;
      let token_sen = generateRandomToken(15);
      const token = await SecureStore.getItemAsync("token_ez");
      const response = await axios.post('http://' + ip['ips']['elegido'] + '/api/info_sensores/save_new_info', {
        topic: tipo,
        token: token_sen,
        name: name,
        esp_cat: space
      }, {
        headers: {
          'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
        },
      });
      
      console.log(response.data);
      if (response.status === 200 || response.status === 201) {
        Alert.alert("Success", "Sensor information saved successfully!");
      }
    } catch (error) {
      console.error('Error saving sensor info:', error);
      Alert.alert("Error", "Failed to save sensor information");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BLE Provisioning</Text>
      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.deviceButton} onPress={() => connectToDevice(item)}>
            <Text style={styles.deviceButtonText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
      {selectedDevice && !showSensorForm && (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="SSID"
            value={ssid}
            onChangeText={setSsid}
            placeholderTextColor={'#888'}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            placeholderTextColor={'#888'}
            secureTextEntry
          />
          <TouchableOpacity style={styles.button} onPress={sendCredentials}>
            <Text style={styles.buttonText}>Send WiFi Credentials</Text>
          </TouchableOpacity>
        </View>
      )}
      {showSensorForm && (
        <View style={styles.form}>
          <Text style={styles.label}>Nombre Sensor:</Text>
          <TextInput
            style={styles.input}
            value={senName}
            onChangeText={(text) => setSenName(text)}
          />
          <Text style={styles.label}>Tipo de sensor:</Text>
          <Picker
            selectedValue={cualTipo}
            onValueChange={(itemValue, itemLabel) => {
              setCualTipo(itemValue);
              setCualTipoNum(itemLabel);
            }}
            style={styles.picker}
          >
            {tiposSensor.map((tipo, index) => (
              <Picker.Item
                key={index}
                label={tipo.label}
                value={tipo.name}
              />
            ))}
          </Picker>
          <TouchableOpacity style={styles.button} onPress={saveNewSensorInfo}>
            <Text style={styles.buttonText}>Listo!</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  deviceButton: {
    padding: 15,
    backgroundColor: '#007bff',
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  deviceButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  form: {
    marginTop: 32,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    color: '#333',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  picker: {
    marginBottom: 16,
  },
  txt_opsel: {
    color: '#000',
  },
});

export default BluetoothProvisioning;
