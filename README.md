# Guía de Sincronización: Panel Web SEMAPACH + App iOS

Este documento es tu mapa para conectar la App móvil de iPhone con este panel administrativo usando Firebase.

## 1. Preparación en Xcode (Tu Mac)

### Paso 1: Instalar Firebase
1. En Xcode, ve al menú superior: **File > Add Package Dependencies...**
2. Pega esta URL: `https://github.com/firebase/firebase-ios-sdk`
3. Selecciona las librerías: **FirebaseAuth** y **FirebaseFirestore**.
4. Dale a "Add Package".

### Paso 2: El archivo de credenciales
1. Arrastra el archivo `GoogleService-Info.plist` dentro de tu carpeta `semapach-report` en Xcode.
2. **IMPORTANTE (File Inspector):** Para ver el panel derecho que mencionamos:
   * En Xcode, haz clic en el botón de la **esquina superior derecha** (el que tiene una barrita lateral). Eso abrirá el panel derecho.
   * Haz clic en el archivo `.plist` en la lista de la izquierda.
   * En el panel derecho verás **Target Membership**. Asegúrate de que tu App esté marcada con un check azul.

---

## 2. Código para copiar y pegar en Xcode

### A. Inicialización (Archivo: `semapach_reportApp.swift`)
Busca el archivo que tiene el icono de una "A" azul y pega esto:

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

### B. Leer datos (Archivo: `ContentView.swift`)
Sustituye el contenido de tu archivo actual por este para ver la recaudación de hoy en tiempo real:

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
                .foregroundStyle(.tint)
                .font(.system(size: 60))
            
            Text("Recaudación de Hoy")
                .font(.headline)
            
            // Este número cambiará solo cuando edites el panel web
            Text("S/ \(dailyAmount, specifier: "%.2f")")
                .font(.system(size: 40, weight: .bold))
                .foregroundColor(.blue)
        }
        .padding()
        .onAppear {
            listenToData()
        }
    }

    func listenToData() {
        // Escucha el documento de hoy (asegúrate de que exista en la web)
        // Ejemplo: si hoy es 2025-03-05, buscará ese ID
        db.collection("daily_collections").document("2025-03-05").addSnapshotListener { snap, error in
            if let data = snap?.data() {
                self.dailyAmount = data["dailyCollectionAmount"] as? Double ?? 0.0
            }
        }
    }
}
```

---
**Nota:** El ID de tu proyecto actual es `studio-5698097440-ab57f`. Asegúrate de que tu archivo `.plist` coincida con este ID para que la sincronización funcione.
