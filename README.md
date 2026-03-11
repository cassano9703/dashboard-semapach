# Guía de Sincronización: Panel Web SEMAPACH + App iOS

Este documento es tu mapa para conectar la App móvil de iPhone con este panel administrativo usando Firebase.

## ⚠️ ¡IMPORTANTE: No confundir el Editor Web con Xcode!

Lo que ves en el navegador (Firebase Studio) es para la **Web**. Para configurar la App de iPhone, debes abrir el programa **Xcode** en tu computadora Mac.

---

## 1. En la Consola de Firebase (Navegador)

1.  Ve a **Configuración (icono de engranaje)** > **Configuración del proyecto**.
2.  En la pestaña "General", baja hasta **"Tus apps"**.
3.  Selecciona tu App de iOS y descarga el archivo **`GoogleService-Info.plist`**.

---

## 2. En Xcode (Tu Mac - Programa para Apps)

### Paso 1: Agregar el archivo y el "Target Membership"
1.  Abre tu proyecto de App móvil en Xcode.
2.  Arrastra el archivo `GoogleService-Info.plist` dentro de tu proyecto.
3.  **¿DÓNDE ESTÁ EL FILE INSPECTOR?**
    *   Haz un solo clic sobre el archivo `.plist` dentro de Xcode.
    *   Mira a la **derecha de Xcode**. Verás un panel lateral.
    *   El primer icono (una hojita de papel) es el **File Inspector**.
    *   Abajo verás una sección llamada **Target Membership**.
    *   **¡DEBE TENER EL CHECK AZUL MARCADO!** Si no, la App no funcionará.

### Paso 2: Instalar librerías de Firebase
1.  En Xcode, ve a **File > Add Package Dependencies...**
2.  Pega esta URL: `https://github.com/firebase/firebase-ios-sdk`
3.  Selecciona: **FirebaseAuth** y **FirebaseFirestore**.

---

## 3. Código de Conexión (Swift en Xcode)

### Inicialización (TuProyectoApp.swift)
```swift
import SwiftUI
import FirebaseCore

@main
struct SemapachMobileApp: App {
    init() {
        FirebaseApp.configure()
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
```

### Leer Datos (Ejemplo en tiempo real)
```swift
import FirebaseFirestore

class DashboardViewModel: ObservableObject {
    @Published var dailyAmount: Double = 0.0
    private var db = Firestore.firestore()

    func listen() {
        db.collection("daily_collections").document("2025-03-05").addSnapshotListener { snap, _ in
            if let d = snap?.data() {
                self.dailyAmount = d["dailyCollectionAmount"] as? Double ?? 0.0
            }
        }
    }
}
```

---
**Tip:** Los cambios que hagas en el panel web se verán reflejados en el iPhone al instante gracias al `addSnapshotListener`.
