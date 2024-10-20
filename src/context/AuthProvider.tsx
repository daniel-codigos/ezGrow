import React, { createContext, useState, useEffect, useContext, FC, ReactNode } from 'react';
import axios from 'axios';
import ip from "../ips.json"
import * as SecureStore from 'expo-secure-store';
import { useNavigation, StackActions } from '@react-navigation/native';

interface User {
  username: string;
  token:string;
  // Agrega aquí otras propiedades que contenga tu objeto de usuario
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const defaultAuthContext: AuthContextType = {
  user: null,
  login: async (username: string, password: string) => false,
  logout: () => {},
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const NewAuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    // Esta función se ejecutará inmediatamente cuando se monte el componente
    checkSession('yes');

    // Luego, configuramos un intervalo para ejecutar checkSession() cada 5 minutos
    const intervalId = setInterval(() => {
      checkSession('no');
    }, 4 * 60 * 1000); // 5 minutos en milisegundos

    // Limpieza del intervalo cuando el componente se desmonta
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  async function checkSession(doit) {
    try {
      //aqui chekeea la ses
      const token = await SecureStore.getItemAsync('token_ez');
      console.log("Token retrieved:", token);
      if (token) {
        // Intenta actualizar el token para mantener la sesión activa
        const newUser = await updateToken(token);
        console.log('cogojnes')
        console.log(newUser)
        if (newUser) {
          setUser(newUser);
          if (doit === 'yes'){
            navigation.dispatch(StackActions.replace('Welcome'));
          }
          //llamar update  const user = await updateToken(token);
        } else {
          // Si no se puede actualizar el token, puede ser necesario un nuevo inicio de sesión
          // O manejar como un logout si el refresh token también ha expirado
          console.log("Token could not be refreshed, requiring new login.");
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Error al verificar la sesión:', error);
    }
  }
  


//meter aqui el refresh pa update de token
// el token de refresh es el muy privado ya que es con el que voy a renovar el access que estoy usando todo el rato para poder acceder sin datos.


async function updateToken(token: string): Promise<User | null> {
  try {
    const parsedToken = JSON.parse(token);
    const response = await axios.post(`http://${ip['ips']['elegido']}/api/refresh`, { refresh: parsedToken.refresh });
    parsedToken.access = response.data.access;
    console.log('aveeee')
    console.log(parsedToken)
    await SecureStore.setItemAsync('token_ez', JSON.stringify(parsedToken));
    const user = await verifyToken(JSON.stringify(parsedToken));  // Reutilizar la verificación para establecer el usuario
    if (user) {
      return parsedToken;
    }else{
      return null
    }
  } catch (error) {
    console.error('Error al actualizar el token:', error);
    return null;
  }
}

async function verifyToken(token: string): Promise<User | null> {
  try {
    const parsedToken = JSON.parse(token);
    const response = await axios.get(`http://${ip['ips']['elegido']}/api/verify`, {
      headers: { 'Authorization': `Bearer ${parsedToken.access}` },
    });
    if (response.data) {
      //navigation.dispatch(StackActions.replace('(tabs)')); // Asegúrate que '(tabs)' es el nombre correcto de la ruta
      return { username: parsedToken.username, token: parsedToken.access }; // Asumiendo que la respuesta incluye el nombre de usuario
    }
    return null;
  } catch (error) {
    console.error('Error al verificar el token:', error);
    return null;
  }
}


  //rotito user pass testacu98
  async function login(username: string, password: string): Promise<boolean> {
    try {
      console.log('http://'+ip['ips']['elegido']+'/api/login')
      const response = await axios.post('http://'+ip['ips']['elegido']+'/api/login', { username, password });
      const token = response.data;
      console.log(response.data)
      // Convertir los datos a cadenas de texto utilizando JSON.stringify
      const tokenString = JSON.stringify(token);
      console.log(response.data.refresh);
      // Guardar los datos en SecureStore
      await SecureStore.setItemAsync('token_ez', tokenString);
      console.log('makina')
      console.log(response.data)
      // No olvides actualizar el estado del usuario usando la función setUser si es necesario
      setUser(response.data);
      navigation.dispatch(StackActions.replace('Welcome'));
      return true;
    } catch (error) {
      alert(String(error)+'http://'+ip['ips']['elegido']+'/api/login');
      console.error('Error al iniciar sesión:', error);
      return false;
    }
  }

  
  async function logout() {
    try {
      await SecureStore.deleteItemAsync('token_ez');
      setUser(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
