# 1. **Descripción**

Llevo varios años desarrollando un proyecto para la automatización del huerto. Empezó siendo un bot de telegram con comandos y mediante preguntas (una conversación con el bot) podrás regar, lanzar una foto con una cámara, y consultar los días de uso y sus diferentes opciones usadas. Todo funcionaba con una raspberry que alimentaba e interactuaba con un arduino, el encargado de encender y apagar cada relé en una fila de reles.

 Al finalizar el desarrollo de este proyecto al menos la parte importante, empecé a tener más ideas y mucho más grandes para el proyecto, por lo que ví la necesidad de crear una apk para el móvil, ya que sería mucho más cómodo tanto para el uso diario sin necesidad de recordar comandos y sus diferentes usos en la conversación. 

También a su vez en el mercado (amazon) se empezó a ver los enchufes wifi y las regleta wifi, lo que facilitaba y actualizaba mucho mi proyecto y no necesitaría la raspberry para los interruptores (enchufes). Manos a la obra(comprar). Decidí actualizar esta parte y empezar a desarrollar mi proyecto en React Native con un API en Django y actualizar todo el sistema en físico. 

Entonces pensé en hacer los sensores individuales, ya que ya no necesito la raspberry para nada. Buscando sobre arduino mini encontré los ESP32 que incorporan WiFi y Bluetooth y su versión ESP32-C3 que es muy pequeña, perfecta para sensores sencillos. Para hacer las cajas de los sensores y del ESP32 uso mi impresora 3d Ender 3 MAX y mis conocimientos con cinema 4d (actualmente blender, poco a poco). No soy el mejor diseñador 3d pero para hacer cajas bonitas sirvo. 

Los sensores funcionan por MQTT, en su registro previo se le envía junto a las credenciales del WiFi un token auto generado para su diferenciación aparte del nombre, nº de huerto ubicado, ID y tipo de sensor. Mediante MQTT puedo consultar la información del sensor/es y con la API puedo programar el sensor para que envie info cada X tiempo y se registre o que la API cada X minutos consulte al MQTT enviandole el token y su respectiva info para consultarlo. Este proyecto es mi favorito por la cantidad de tiempo invertida en el.

# 2. **Instalación**
Requsitos:
 - java 17, node 17/18
Instalación:

Crear archivo ips.json dentro de src/ con la siguiente estructura:
```
{
    "ips":{
        "elegido":"IP:Puerto"
        
    }
    
}
```
Continuamos con la instalación.
```
npm install -g yarn
```
```
yarn install
yarn android
```
o
```
npm install
npm android
```

# 3. **Configuración**
Despues de lanzar
```
yarn android
```
Cuando termina deberiamos ver la carpeta de android generada. Añadimos en el sigueinte archivo:
```
android/app/src/main/AndroidManifest.xml
```
Buscamos la etiqueta "application" y le añadimos lo siguiente:
```
android:usesCleartextTraffic="true"
```
Debería quedar algo asi:
```
<application android:name=".MainApplication" android:usesCleartextTraffic="true" android:label="@string/app_name" android:icon="@mipmap/ic_launcher" android:roundIcon="@mipmap/ic_launcher_round" android:allowBackup="true" android:theme="@style/AppTheme">
```

El archivo que contiene la direccion de la API es ips.json el espacio de "elegido" y "camara" para la direccion del script de la camara.
```
{
    "ips":{
        "elegido":"IP_API:PORT_API",
        "camara": "IP_RASP_CAM:PORT",
    }
}
```
# 4. **Run app**
Para ejecutar la app debemos ejecutar
```
yarn start
```
Y tenemos diferentes opciones:
 1. Usar Expo Go con un dispositivo fisico, meidante USB o WiFi mediante IP.
 2. Usar un emulador android (android studio / android studio command line tools)

