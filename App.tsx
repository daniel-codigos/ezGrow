import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { AppRegistry } from 'react-native';
import { expo as appName } from './app.json';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View } from 'react-native';
import { NewAuthProvider } from './src/context/AuthProvider';
import LoginScreen from './src/Login';
import HomeScreen from './src/Welcome';
import DashBoard from './src/mainapp/DashBoard/DashBoard'
import MenuScreen from './src/mainapp/Menu';
import EnchufesMenu from './src/mainapp/enchufes/enchufes_data';
import LuzMenu from './src/mainapp/luz/menu'
import LuzEdit from './src/mainapp/luz/luz_config'
import LuzPower from './src/mainapp/luz/luz_power'
import VentiMenu from './src/mainapp/aire/menu'
import VentiConfig from './src/mainapp/aire/fan_config'
import VentiPower from './src/mainapp/aire/fan_power'
import RiegoMenu from './src/mainapp/riego/menu'
import RiegoConfig from './src/mainapp/riego/riego_config'
import RiegoApp from './src/mainapp/riego/riego_app'
import BidonApp from './src/mainapp/riego/bidon_app'
import BidonConfig from './src/mainapp/riego/BidonConfig'
import CamaraApp from './src/mainapp/fotos'
import RutinasApp from './src/mainapp/eventos/rutinasMeross'
import RegistrarSensor from './src/mainapp/rgstr_ofi'
import VerSensores from './src/mainapp/ViewSen/view_sen'
import OpSensores from './src/mainapp/ViewSen/OpSensores'
import DatosMenu from './src/mainapp/infodb/menu'
import DatosRegistrados from './src/mainapp/infodb/ShowInfo'
import Carrito from './src/carrito/Carrito';
import FixedCartButton from './src/carrito/FixedCartButton'; 
import AdminPanelButton from './src/clubsAdminPanel/AdminPanelButton';
import AdminPanel from './src/clubsAdminPanel/AdminPanel';
import RegisterScreen from './src/mainapp/RegisterNew';
import { useAuth } from './src/context/AuthProvider';
import NuevoCulti from './src/mainapp/newCulti/NuevoCultivo'
//import AdminWelcome from './src/clubsAdminPanel/AdminWelcome';
import ClubInfo from './src/clubsAdminPanel/ClubInfo';
import ManageMenu from './src/clubsAdminPanel/ManageMenu';
import SubscribedUsers from './src/clubsAdminPanel/SubscribedUsers';
import ClubSettings from './src/clubsAdminPanel/ClubSettings';
const Stack = createStackNavigator();

export default function App() {
  const { user } = useAuth(); 
  const [isLoginOk, setIsLoginOk] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminPanelVisi, setIsAdminPanelVisi] = useState(false);
  const [isCarritoVisible, setIsCarritoVisible] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [clubInfoPrin, setClubInfoPrin] = useState([]);
  const [isAdminWelcomeVisible, setIsAdminWelcomeVisible] = useState(false);
  const [isClubInfoVisible, setIsClubInfoVisible] = useState(false);
  const [isManageMenuVisible, setIsManageMenuVisible] = useState(false);
  const [isSubscribedUsersVisible, setIsSubscribedUsersVisible] = useState(false);
  const [isEditAdVisible, setIsEditAdVisible] = useState(false);
  const [isClubSettingsVisible, setIsClubSettingsVisible] = useState(false);

  const loginOk = () => setIsLoginOk(true);
  const openCarrito = () => setIsCarritoVisible(true);
  const closeCarrito = () => setIsCarritoVisible(false);
  const openAdminPanel = () => setIsAdminPanelVisi(true);
  const closeAdminPanel = () => setIsAdminPanelVisi(false);

  const removeFromCart = (item) => {
    setCartItems(prevItems => prevItems.filter(cartItem => cartItem !== item));
  };

  return (
    <NavigationContainer>
      <NewAuthProvider>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{ flex: 1, width:'100%',height:'100%'}}>
            <Stack.Navigator>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen 
                name="Welcome" 
                options={{
                  headerLeft: () => null,  // Esto quita el botón de retroceso
                  gestureEnabled: false,  // Esto desactiva los gestos de vuelta en iOS
                }}
              >
                {(props) => <HomeScreen {...props} loginOk={loginOk} setAdmin={setIsAdmin} />} 
              </Stack.Screen>
              <Stack.Screen name="DashBoard">
                {props => <DashBoard {...props} setCartItems={setCartItems} />}
              </Stack.Screen>
              <Stack.Screen name="Menu">
                {props => <MenuScreen {...props} setCartItems={setCartItems} />}
              </Stack.Screen>
              <Stack.Screen name="EnchufesMenu">
                {props => <EnchufesMenu {...props} setCartItems={setCartItems} />}
              </Stack.Screen>
              <Stack.Screen name="LuzMenu">
                {props => <LuzMenu {...props} setCartItems={setCartItems} />}
              </Stack.Screen>
              <Stack.Screen name="LuzEdit">
                {props => <LuzEdit {...props} setCartItems={setCartItems} />}
              </Stack.Screen>
              <Stack.Screen name="LuzPower">
                {props => <LuzPower {...props} setCartItems={setCartItems} />}
              </Stack.Screen>
              <Stack.Screen name="VentiMenu">
                {props => <VentiMenu {...props} setCartItems={setCartItems} />}
              </Stack.Screen>
              <Stack.Screen name="VentiConfig">
                {props => <VentiConfig {...props} setCartItems={setCartItems} />}
              </Stack.Screen>
              <Stack.Screen name="VentiPower">
                {props => <VentiPower {...props} setCartItems={setCartItems} />}
              </Stack.Screen>
              <Stack.Screen name="RiegoMenu">
                {props => <RiegoMenu {...props} setCartItems={setCartItems} />}
              </Stack.Screen>
              <Stack.Screen name="RiegoConfig">
                {props => <RiegoConfig {...props} setCartItems={setCartItems} />}
              </Stack.Screen>
              <Stack.Screen name="RiegoApp">
                {props => <RiegoApp {...props} setCartItems={setCartItems} />}
              </Stack.Screen>

              <Stack.Screen name="BidonApp">
                {props => <BidonApp {...props} setCartItems={setCartItems} />}
              </Stack.Screen>
              <Stack.Screen name="BidonConfig">
                {props => <BidonConfig {...props} setCartItems={setCartItems} />}
              </Stack.Screen>
              
              <Stack.Screen name="CamaraApp">
                {props => <CamaraApp {...props} setCartItems={setCartItems} />}
              </Stack.Screen>
              <Stack.Screen name="RutinasApp">
                {props => <RutinasApp {...props} setCartItems={setCartItems} />}
              </Stack.Screen>
              <Stack.Screen name="RegistrarSensor">
                {props => <RegistrarSensor {...props} setCartItems={setCartItems} />}
              </Stack.Screen>
              <Stack.Screen name="VerSensores">
                {props => <VerSensores {...props} setCartItems={setCartItems} />}
              </Stack.Screen>
              <Stack.Screen name="DatosMenu">
                {props => <DatosMenu {...props} setCartItems={setCartItems} />}
              </Stack.Screen>
              <Stack.Screen name="DatosRegistrados">
                {props => <DatosRegistrados {...props} setCartItems={setCartItems} />}
              </Stack.Screen>
              
              <Stack.Screen name="NuevoCulti">
                {props => <NuevoCulti {...props} setCartItems={setCartItems} />}
              </Stack.Screen>
            </Stack.Navigator>

            {isLoginOk && (
              <>
                {
                  isAdmin && (
                    <>
                      <AdminPanelButton openAdmin={() => setIsAdminPanelVisi(true)} />
                      <AdminPanel 
                        visible={isAdminPanelVisi} 
                        onClose={() => setIsAdminPanelVisi(false)} 
                        otrosPaneles={{'clubInfo':setIsClubInfoVisible,'manage':setIsManageMenuVisible,'suscribedUsers':setIsSubscribedUsersVisible,'editAd':setIsEditAdVisible,'clubSet':setIsClubSettingsVisible}}
                        clubInfoPrin={setClubInfoPrin}
                      />
                      {
                        isAdminPanelVisi && (
                          
                          <>
                          {
                            isClubInfoVisible && (
                              <>
                                <ClubInfo 
                                  visible={isClubInfoVisible} 
                                  onClose={() => setIsClubInfoVisible(false)} 
                                  clubInfoPrin={clubInfoPrin}
                                />
                              </>
                            )
                          }
                          {
                            isManageMenuVisible && (
                              <>
                                <ManageMenu 
                                  visible={isManageMenuVisible} 
                                  onClose={() => setIsManageMenuVisible(false)} 
                                  clubInfoPrin={clubInfoPrin}
                                />
                              </>
                            )
                          }
                          {
                            isSubscribedUsersVisible && (
                              <>
                                <SubscribedUsers 
                                  visible={isSubscribedUsersVisible} 
                                  onClose={() => setIsSubscribedUsersVisible(false)} 
                                  clubInfoPrin={clubInfoPrin}
                                />
                              </>
                            )
                          }                        
                          {
                            isClubSettingsVisible && (
                              <>
                                <ClubSettings 
                                  visible={isClubSettingsVisible} 
                                  onClose={() => setIsClubSettingsVisible(false)} 
                                  clubInfoPrin={clubInfoPrin}
                                />
                              </>
                            )
                          }
                          </>
                        )
                      }

                    </>
                  )
                }
                <FixedCartButton openCarrito={openCarrito} />
                <Carrito 
                  visible={isCarritoVisible} 
                  onClose={closeCarrito} 
                  cartItems={cartItems} 
                  removeFromCart={removeFromCart} 
                />
              </>
            )}
          </View>
        </ScrollView>
      </NewAuthProvider>
    </NavigationContainer>
    
  );
}
AppRegistry.registerComponent(appName.name, () => App);