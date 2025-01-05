import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import React, { useState, useEffect } from 'react';

// Solicitar permisos para notificaciones (solo es necesario una vez)
export const requestPermissions = async () => {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('No se han concedido permisos para mostrar notificaciones.');
      return;
    }
  }
};

// Configurar el comportamiento de las notificaciones (opcional)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Función para enviar una notificación
export const sendNotification = async (title: string, body: string) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body,
      sound: true,
    },
    trigger: null, // Inmediatamente
  });
};
