# Panel Estadístico SEMAPACH

Este es el panel administrativo y de visualización de datos para SEMAPACH, construido con Next.js y Firebase.

## Sincronización con Aplicaciones Móviles

Este proyecto está listo para sincronizarse con aplicaciones móviles (iOS, Android, Flutter, React Native). Gracias a que utilizamos **Firebase** como backend centralizado, la integración es nativa y en tiempo real.

### Pasos para conectar una App:

1. **Firebase Console:** Ve a la consola de Firebase de este proyecto.
2. **Agregar Aplicación:** Haz clic en "Añadir aplicación" y selecciona la plataforma (Android o iOS).
3. **Configuración:** Sigue los pasos para descargar el archivo de configuración (`google-services.json` para Android o `GoogleService-Info.plist` para iOS).
4. **Mismos Datos:** Utiliza las mismas colecciones de Firestore que usa este panel:
   - `daily_collections`
   - `district_progress`
   - `recovered_services`
   - `monthly_goals`
   - `meter_data`
5. **Autenticación:** La App compartirá la misma base de usuarios de Firebase Auth que este panel.

Cualquier cambio realizado en la App se reflejará instantáneamente en este panel y viceversa.

---
git remote set-url origin https://cassano9703@github.com/FrankRemuzgo/semapach.git
