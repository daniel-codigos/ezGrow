// Rutinas.tsx
import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  ScrollView,
  ActivityIndicator
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as SecureStore from 'expo-secure-store';
import ip from "../../ips.json";
import axios from 'axios';

const Rutinas = ({ visible, onClose, info }) => {
  const initialState = {
    lunes: false,
    martes: false,
    miercoles: false,
    jueves: false,
    viernes: false,
    sabado: false,
    domingo: false,
  };

  const { espacioName } = info.space;
  const [aparatos, setAparatos] = useState([]);
  const [aparatosSel, setAparatosSel] = useState([]); // Estado para los aparatos seleccionados
  const [showEncendidoPicker, setShowEncendidoPicker] = useState(false);
  const [showApagadoPicker, setShowApagadoPicker] = useState(false);
  const [horaEncendido, setHoraEncendido] = useState(new Date());
  const [horaApagado, setHoraApagado] = useState(new Date());
  const [horaEncendidoStr, setHoraEncendidoStr] = useState('');
  const [horaApagadoStr, setHoraApagadoStr] = useState('');
  const [nombreRutina, setNombreRutina] = useState('');
  const [dias, setDias] = useState(initialState);
  const [cargando, setCargando] = useState(false);
  let lanip = '';

  useEffect(() => {
    setAparatos([]);
    info.merossData.info.data.forEach(cada_regleta => {
      if (cada_regleta.name === info.master) {
        lanip = cada_regleta.lan_ip;
      }
    });

    if (info.mod !== null) {
      setNombreRutina(String(info.mod.info.nombre));
      setHoraApagadoStr(info.mod.info.horario_off);
      setHoraEncendidoStr(info.mod.info.horario_on);
      setDias(info.mod.info.dias);
      info.mod.info.aparatos?.forEach(cada_apa => toggleAparatos(cada_apa));
    } else {
      info.merossData.info.status[info.master].forEach(cada_apa => {
        cada_apa['regleta'] = info.master;
      });
      setAparatos(info.merossData.info.status[info.master]);
    }
  }, []);

  const toggleDia = (dia) => {
    setDias(prevDias => ({
      ...prevDias,
      [dia]: !prevDias[dia],
    }));
  };

  const toggleAparatos = (aparato) => {
    setAparatosSel((prev) => {
      const index = prev.findIndex(
        (x) => x.name === aparato.name && x.regleta === aparato.regleta
      );
      if (index >= 0) {
        return [...prev.slice(0, index), ...prev.slice(index + 1)];
      } else {
        return [...prev, aparato];
      }
    });
  };

  const onChangeApagado = (event, selectedDate) => {
    setShowApagadoPicker(false);
    if (selectedDate) {
      setHoraApagado(selectedDate);
      setHoraApagadoStr(
        selectedDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      );
    }
  };

  const onChangeEncendido = (event, selectedDate) => {
    setShowEncendidoPicker(false);
    if (selectedDate) {
      setHoraEncendido(selectedDate);
      setHoraEncendidoStr(
        selectedDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      );
    }
  };

  const guardarRutina = async () => {
    try {
      let uuid, lanip, userKey;
      info.merossData.info.data.forEach(cada_regleta => {
        if (cada_regleta.name === info.master) {
          uuid = cada_regleta.uuid;
          lanip = cada_regleta.lan_ip;
          //userKey = cada_regleta.key; // Captura el userKey
        }
      });


      const token = await SecureStore.getItemAsync("token_ez");
      const fin = {
        'info': {
          lanip,
          aparatos: aparatosSel, // Enviar solo los aparatos seleccionados
          dias,
          horario_on: horaEncendidoStr,
          horario_off: horaApagadoStr,
          uuid,
          nombre: nombreRutina,
          space: info.space,
          regleta: info.master,
          //userKey, // Incluye el userKey en el payload
        },
      };

      const response = await axios.post(
        `http://${ip['ips']['elegido']}/api/pages/crear_rutina`,
        { fin },
        {
          headers: {
            'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
          },
        }
      );

      onClose();
      console.log(response.data);
    } catch (error) {
      console.error('Error al guardar la rutina:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <ScrollView contentContainerStyle={styles.modalView}>
        <Text style={styles.modalTitle}>Configurar Rutinas</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre de la rutina:</Text>
          <TextInput
            style={styles.input}
            value={nombreRutina}
            onChangeText={setNombreRutina}
            placeholder="Introduce un nombre"
          />
        </View>
            {cargando && (
              <View style={styles.loading}>
                <ActivityIndicator size="large" color="#007AFF" />
              </View>
            )}
        <Text style={styles.sectionTitle}>Días de la semana:</Text>
        <View style={styles.daysContainer}>
          {Object.entries(dias).map(([dia, valor]) => (
            <TouchableOpacity
              key={dia}
              style={[styles.dayButton, valor && styles.dayButtonActive]}
              onPress={() => toggleDia(dia)}
            >
              <Text style={styles.dayText}>{dia}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Aparatos:</Text>
        <View style={styles.aparatosContainer}>
          {info.merossData.info.status[info.master].map((cada_aparato, index) => (
            index > 0 ?
            <TouchableOpacity
              key={index}
              style={[styles.aparatoButton,
                aparatosSel.some(ap => ap.name === cada_aparato.name && ap.regleta === info.master) && styles.aparatoButtonActive
              ]}
              onPress={() => toggleAparatos({ ...cada_aparato, regleta: info.master })}
            >
              <Text style={styles.aparatoText}>{cada_aparato.name}</Text>
            </TouchableOpacity>
            :
            null
          ))}
        </View>

        <Text style={styles.sectionTitle}>Horario:</Text>
        <TouchableOpacity style={styles.boton} onPress={() => setShowEncendidoPicker(true)}>
          <Text style={styles.botonTexto}>Configurar Encendido</Text>
        </TouchableOpacity>
        {horaEncendidoStr ? <Text style={styles.horaText}>Encendido: {horaEncendidoStr}</Text> : null}

        <TouchableOpacity style={styles.boton} onPress={() => setShowApagadoPicker(true)}>
          <Text style={styles.botonTexto}>Configurar Apagado</Text>
        </TouchableOpacity>
        {horaApagadoStr ? <Text style={styles.horaText}>Apagado: {horaApagadoStr}</Text> : null}

        {showEncendidoPicker && (
          <DateTimePicker value={horaEncendido} mode="time" display="default" onChange={onChangeEncendido} />
        )}
        {showApagadoPicker && (
          <DateTimePicker value={horaApagado} mode="time" display="default" onChange={onChangeApagado} />
        )}

        <TouchableOpacity onPress={guardarRutina} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Guardar Rutina</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Cerrar</Text>
        </TouchableOpacity>

      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalView: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  dayButton: {
    backgroundColor: '#E0E0E0',
    padding: 10,
    margin: 5,
    borderRadius: 8,
  },
  dayButtonActive: {
    backgroundColor: 'orange',
  },
  dayText: {
    fontSize: 14,
  },
  aparatosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  aparatoButton: {
    backgroundColor: 'purple',
    padding: 10,
    margin: 5,
    borderRadius: 8,
  },
  aparatoButtonActive: {
    backgroundColor: 'green',
  },
  aparatoText: {
    color: 'white',
  },
  boton: {
    backgroundColor: '#3897f0',
    padding: 10,
    borderRadius: 20,
    marginVertical: 10,
    alignItems: 'center',
  },
  botonTexto: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  horaText: {
    fontSize: 16,
    color: '#2c3e50',
    marginVertical: 5,
  },
  saveButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 20,
    marginTop: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Rutinas;


