# Guía de Sincronización: Panel Web SEMAPACH + App iOS

Este documento es tu mapa para conectar la App móvil de iPhone con este panel administrativo usando Firebase.

## 1. Preparación en Xcode (Tu Mac)

### Paso 1: Instalar Firebase (La pantalla de tu imagen)
1. En Xcode, en la ventana que tienes abierta (**Add Package Dependencies**):
2. En el cuadro de búsqueda (arriba a la derecha), pega esta URL: `https://github.com/firebase/firebase-ios-sdk`
3. Cuando aparezca el paquete, selecciona las librerías: **FirebaseAuth** y **FirebaseFirestore**.
4. Dale al botón azul "Add Package".

### Paso 2: El archivo de credenciales
1. Asegúrate de que el archivo `GoogleService-Info.plist` esté dentro de tu carpeta de proyecto en Xcode.
2. **IMPORTANTE (File Inspector):** 
   * Haz clic en el archivo `.plist` en la lista de la izquierda de Xcode.
   * Abre el panel derecho (botón de arriba a la derecha con una barrita lateral).
   * En **Target Membership**, marca el check azul al lado del nombre de tu App.

---

## 2. Código para copiar y pegar en Xcode

### A. Inicialización (Archivo: `semapach_reportApp.swift`)
Busca el archivo que tiene el icono de una "A" azul y asegúrate de que se vea así:

```swift
import SwiftUI
import FirebaseCore // 1. Importar Firebase

@main
struct semapach_reportApp: App {
    // 2. Configurar Firebase al arrancar
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

### B. Leer datos en Tiempo Real (Archivo: `ContentView.swift`)
Sustituye el contenido de tu archivo por este para ver la recaudación de la web en el iPhone:

```swift
import SwiftUI
import FirebaseFirestore // 1. Importar Firestore

struct ContentView: View {
    @State private var dailyAmount: Double = 0.0
    private var db = Firestore.firestore()

    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "drop.fill")
                .imageScale(.large)
                .foregroundStyle(.blue)
                .font(.system(size: 60))
            
            Text("Recaudación SEMAPACH")
                .font(.headline)
            
            // Este número cambiará automáticamente cuando edites la web
            Text("S/ \(dailyAmount, specifier: "%.2f")")
                .font(.system(size: 45, weight: .bold))
                .foregroundColor(.primary)
            
            Text("Sincronizado en tiempo real")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding()
        .onAppear {
            listenToData()
        }
    }

    func listenToData() {
        // Escucha el documento de hoy en la colección que usa la web
        // Nota: Asegúrate de que el ID del documento exista (ej: "2025-03-05")
        db.collection("daily_collections").order(by: "date", descending: true).limit(to: 1).addSnapshotListener { snap, error in
            if let docs = snap?.documents, let lastDoc = docs.first {
                self.dailyAmount = lastDoc.data()["dailyCollectionAmount"] as? Double ?? 0.0
            }
        }
    }
}
```

---
**Nota Técnica:** El ID de tu proyecto actual es `studio-5698097440-ab57f`. Los datos que guardes en el panel de administración aparecerán automáticamente en esta pantalla del iPhone.