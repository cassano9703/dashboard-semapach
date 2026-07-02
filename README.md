
# 🚀 Guía Definitiva: SEMAPACH (App + Agente AI)

Este proyecto contiene dos partes independientes. Es **CRÍTICO** no mezclar los lenguajes.

---

## 🛠️ PARTE 1: La App de iPhone (Xcode / Swift)
Esta es la interfaz "Aquarium" con las olas dinámicas. **Solo funciona en Xcode.**

**Instrucciones para borrar los errores rojos:**
1. Abre **Xcode**.
2. Abre el archivo `ContentView.swift`.
3. **BORRA TODO** (Selecciona todo y borra).
4. Copia y pega el código de abajo (el que empieza con `import SwiftUI`).

```swift
import SwiftUI

struct ContentView: View {
    @State private var progress: Double = 0.65 // 65% de la meta
    @State private var waveOffset = Angle(degrees: 0)
    
    var body: some View {
        VStack(spacing: 30) {
            Text("SEMAPACH")
                .font(.largeTitle).bold()
                .foregroundColor(.blue)
            
            // EL ACUARIO
            ZStack {
                Circle()
                    .stroke(Color.blue.opacity(0.2), lineWidth: 10)
                    .frame(width: 250, height: 250)
                
                // Olas animadas
                WaveShape(offset: waveOffset, percent: progress)
                    .fill(LinearGradient(colors: [.blue, .cyan], startPoint: .top, endPoint: .bottom))
                    .clipShape(Circle())
                    .frame(width: 230, height: 230)
                
                VStack {
                    Text("\(Int(progress * 100))%")
                        .font(.system(size: 50, weight: .black, design: .rounded))
                        .foregroundColor(progress > 0.5 ? .white : .blue)
                    Text("RECAUDADO")
                        .font(.caption).bold()
                        .foregroundColor(progress > 0.5 ? .white.opacity(0.8) : .secondary)
                }
            }
            .onAppear {
                withAnimation(.linear(duration: 2).repeatForever(autoreverses: false)) {
                    waveOffset = Angle(degrees: 360)
                }
            }
            
            // Datos
            HStack(spacing: 20) {
                StatCard(title: "Meta", value: "S/ 2.8M", color: .gray)
                StatCard(title: "Hoy", value: "S/ 45k", color: .green)
            }
        }
        .padding()
    }
}

struct WaveShape: Shape {
    var offset: Angle
    var percent: Double
    
    var animatableData: Double {
        get { offset.degrees }
        set { offset = Angle(degrees: newValue) }
    }
    
    func path(in rect: CGRect) -> Path {
        var path = Path()
        let lowAmplitudeHeight = 10.0
        let waveWidth = rect.width
        let waveHeight = rect.height
        let yOffset = (1 - percent) * waveHeight
        
        path.move(to: CGPoint(x: 0, y: yOffset))
        
        for x in stride(from: 0, through: waveWidth, by: 1) {
            relativeX = x / waveWidth
            let sine = sin(relativeX * .pi * 2 + offset.radians)
            let y = yOffset + sine * lowAmplitudeHeight
            path.addLine(to: CGPoint(x: x, y: y))
        }
        
        path.addLine(to: CGPoint(x: waveWidth, y: waveHeight))
        path.addLine(to: CGPoint(x: 0, y: waveHeight))
        path.closeSubpath()
        
        return path
    }
}

struct StatCard: View {
    var title: String
    var value: String
    var color: Color
    var body: some View {
        VStack {
            Text(title).font(.caption).foregroundColor(.secondary)
            Text(value).font(.headline).foregroundColor(color)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color.blue.opacity(0.05))
        .cornerRadius(15)
    }
}
```

---

## 🐍 PARTE 2: El Agente Seguidor de Líneas (Python / Pygame)
Este es un simulador de IA que corre en tu computadora, **fuera de Xcode**.

**Cómo ejecutarlo:**
1. Abre la **Terminal** de tu Mac.
2. Instala la librería Pygame (si no la tienes):
   `pip3 install pygame`
3. Ejecuta el agente que está en esta carpeta:
   `python3 agent_follower.py`

---

## ⚠️ SOLUCIÓN DE PROBLEMAS (LOGIN)
Si al intentar ingresar desde este panel recibes un error, verifica lo siguiente:

### 1. Dominio no autorizado (Error `auth/unauthorized-domain`)
Debes agregar el dominio de este entorno en tu Consola de Firebase:
- **Consola:** [console.firebase.google.com](https://console.firebase.google.com/)
- **Ruta:** Authentication > Settings > Authorized domains > Add domain
- **Dominio a copiar:** `9002-firebase-studio-1761162758029.cluster-dwvm25yncracsxpd26rcd5ja3m.cloudworkstations.dev`

### 2. Usuario no existe en el proyecto
Verifica que el usuario que intentas usar esté creado en la pestaña **"Users"** del proyecto `studio-5698097440-ab57f`. Si la web oficial usa otro proyecto, las cuentas no se comparten automáticamente.

---

## 💰 Comparativa de Lanzamiento (Tiendas)

| Característica | Apple App Store (iPhone) | Google Play Store (Android) |
| :--- | :--- | :--- |
| **Costo** | $99 USD Anuales | $25 USD (Pago único) |
| **Dificultad** | Alta (Revisión estricta) | Media |
| **Uso en SEMAPACH** | Ideal para directivos | Ideal para técnicos en campo |
