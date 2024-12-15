import { StyleSheet, TouchableOpacity, Text, View, ScrollView, Dimensions } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/FontAwesome5';
import Icon3 from 'react-native-vector-icons/Entypo';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window'); // Obtener las dimensiones de la pantalla

export default function TabOneScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { espacioName } = route.params;

  const handleButtonPress = (btntxt) => {
    navigation.navigate(btntxt, { espacioName: espacioName });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dentro de: {espacioName}</Text>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.cont_prin}>
          <TouchableOpacity onPress={() => handleButtonPress("EnchufesMenu")} style={styles.button}>
            <Icon name="plug" size={width * 0.08} color="#ffffff" />
            <Text style={styles.txtEnchufes}>Enchufes</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleButtonPress("LuzMenu")} style={styles.button}>
            <Icon2 name="lightbulb" size={width * 0.09} color="#ffffff" />
            <Text style={styles.txtEnchufes}>Luz</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleButtonPress("VentiMenu")} style={styles.button}>
            <Icon2 name="temperature-low" size={width * 0.08} color="#ffffff" />
            <Text style={styles.txtEnchufes}>Ventilación</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleButtonPress("RiegoMenu")} style={styles.button}>
            <Icon2 name="hand-holding-water" size={width * 0.08} color="#ffffff" />
            <Text style={styles.txtEnchufes}>Riego</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleButtonPress("CamaraApp")} style={styles.button}>
            <Icon2 name="camera-retro" size={width * 0.08} color="#ffffff" />
            <Text style={styles.txtEnchufes}>Cámara</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleButtonPress("RutinasApp")} style={styles.button}>
            <Icon2 name="calendar-check" size={width * 0.08} color="#ffffff" />
            <Text style={styles.txtEnchufes}>Rutinas</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleButtonPress("RegistrarSensor")} style={styles.button}>
            <Icon3 name="add-to-list" size={width * 0.08} color="#ffffff" />
            <Text style={styles.txtEnchufes}>Nuevo Sensor</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleButtonPress("VerSensores")} style={styles.button}>
            <Icon name="list" size={width * 0.08} color="#ffffff" />
            <Text style={styles.txtEnchufes}>Sensores</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleButtonPress("DatosMenu")} style={styles.button}>
            <Text style={{ fontSize: width * 0.07 }}>📊</Text>
            <Text style={styles.txtEnchufes}>Datos Registrados</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleButtonPress("NuevoCulti")} style={styles.button}>
            <Text style={{ fontSize: width * 0.07 }}>🆕🚪</Text>
            <Text style={styles.txtEnchufes}>Nuevo Cultivo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#212121',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: width * 0.05,
  },
  cont_prin: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    alignItems: "center",
    alignContent: "flex-start",
  },
  title: {
    color:'#fff',
    fontSize: width * 0.06,
    fontWeight: 'bold',
    marginVertical: height * 0.02,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: width * 0.04,
    borderRadius: width * 0.04,
    marginTop: height * 0.02,
    marginLeft: width * 0.02,
    textAlign: "center",
    width: width * 0.3,
    height: width * 0.3,
    justifyContent: "center",
    alignItems: "center",
  },
  txtEnchufes: {
    color: 'white',
    marginTop: height * 0.01,
    fontWeight: "bold",
    fontSize: width * 0.04,
    textAlign: "center",
  },
});
