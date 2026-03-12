# Guía de Sincronización Final: Panel SEMAPACH + iPhone

¡Estás en el último paso! Sigue estas instrucciones para activar los permisos en tu iPhone y ver los datos con la nueva interfaz dinámica.

## 1. Activar el "Developer Mode" (Modo Desarrollador)
Si te sale el error "Developer Mode disabled", haz esto en tu **iPhone/Simulador**:
1. Abre **Ajustes** (Settings).
2. Ve a **Privacidad y Seguridad** (Privacy & Security).
3. Baja hasta el fondo y entra en **Modo de Desarrollador** (Developer Mode).
4. Activa el interruptor y dale a **Reiniciar** (Restart).
5. Al prender, presiona **Activar** (Turn On).

## 2. Confiar en el Certificado (Error: Not Trusted)
Si te sale el mensaje "Developer App Certificate is not trusted", haz esto:
1. Abre **Ajustes** (Settings) en el iPhone.
2. Ve a **General** > **Gestión de dispositivos y VPN**.
3. Toca en tu **Apple ID** (debajo de App de desarrollador).
4. Toca en **"Confiar en..."** (el texto azul).
5. Dale a **Confiar** (botón rojo).

## 3. Código Final de los Archivos en Xcode

### A. Archivo: `semapach_reportApp.swift`
(Este archivo inicializa la conexión con Firebase)
```swift
import SwiftUI
import FirebaseCore

@main
struct semapach_reportApp: App {
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

### B. Archivo: `ContentView.swift` (NUEVA INTERFAZ DINÁMICA)
(Borra todo el contenido de este archivo en Xcode y pega este código profesional)
```swift
import SwiftUI
import FirebaseFirestore

struct ContentView: View {
    @State private var dailyAmount: Double = 0.0
    @State private var monthlyAccumulated: Double = 0.0
    @State private var monthlyGoal: Double = 1.0 // Evitar división por cero
    @State private var isLoading = true
    @State private var waveOffset = Angle(degrees: 0)
    
    private var db = Firestore.firestore()
    
    var progress: Double {
        min(monthlyAccumulated / monthlyGoal, 1.0)
    }

    var body: some View {
        ZStack {
            // Fondo con degradado suave
            LinearGradient(colors: [Color.blue.opacity(0.1), Color.white], startPoint: .top, endPoint: .bottom)
                .ignoresSafeArea()
            
            ScrollView {
                VStack(spacing: 25) {
                    // Cabecera Profesional
                    HStack {
                        VStack(alignment: .leading) {
                            Text("SEMAPACH")
                                .font(.system(size: 28, weight: .black, design: .rounded))
                                .foregroundColor(.blue)
                            Text("Dashboard Comercial")
                                .font(.subheadline)
                                .fontWeight(.bold)
                                .foregroundColor(.secondary)
                        }
                        Spacer()
                        Image(systemName: "drop.fill")
                            .font(.system(size: 40))
                            .foregroundStyle(LinearGradient(colors: [.blue, .cyan], startPoint: .top, endPoint: .bottom))
                    }
                    .padding(.horizontal)
                    
                    // El "Aquarium" - Progreso de la Meta con Olas
                    VStack(spacing: 15) {
                        ZStack {
                            Circle()
                                .stroke(Color.blue.opacity(0.1), lineWidth: 15)
                                .frame(width: 240, height: 240)
                            
                            // Relleno de Agua con Animación
                            LiquidWaveView(progress: progress, waveOffset: waveOffset)
                                .clipShape(Circle())
                                .frame(width: 220, height: 220)
                                .shadow(color: .blue.opacity(0.3), radius: 10, x: 0, y: 5)
                            
                            VStack {
                                Text("\(Int(progress * 100))%")
                                    .font(.system(size: 55, weight: .black, design: .rounded))
                                    .foregroundColor(progress > 0.4 ? .white : .blue)
                                Text("DE LA META")
                                    .font(.caption)
                                    .fontWeight(.bold)
                                    .foregroundColor(progress > 0.4 ? .white.opacity(0.8) : .secondary)
                            }
                        }
                        .onAppear {
                            withAnimation(.linear(duration: 3).repeatForever(autoreverses: false)) {
                                waveOffset = Angle(degrees: 360)
                            }
                        }
                        
                        Text("Avance del Mes Actual")
                            .font(.headline)
                            .foregroundColor(.secondary)
                    }
                    .padding(.vertical, 20)
                    
                    // Dato Principal: Recaudación Diaria
                    VStack(spacing: 10) {
                        Text("RECAUDACIÓN DE HOY")
                            .font(.caption)
                            .fontWeight(.bold)
                            .foregroundColor(.blue)
                            .tracking(2)
                        
                        if isLoading {
                            ProgressView()
                        } else {
                            Text("S/ \(dailyAmount, specifier: "%.2f")")
                                .font(.system(size: 42, weight: .black, design: .rounded))
                                .foregroundColor(.primary)
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .padding(30)
                    .background(Color.white)
                    .cornerRadius(30)
                    .shadow(color: .black.opacity(0.05), radius: 15, x: 0, y: 10)
                    .padding(.horizontal)
                    
                    // Rejilla de Estadísticas Secundarias
                    HStack(spacing: 15) {
                        StatCardView(title: "ACUMULADO", value: monthlyAccumulated, icon: "chart.line.uptrend.xyaxis", color: .green)
                        StatCardView(title: "META TOTAL", value: monthlyGoal, icon: "target", color: .orange)
                    }
                    .padding(.horizontal)
                    
                    Text(isLoading ? "Sincronizando con la nube..." : "Conectado en tiempo real")
                        .font(.caption2)
                        .foregroundColor(.green)
                        .padding(.top, 10)
                        .padding(.bottom, 30)
                }
                .padding(.top, 20)
            }
        }
        .onAppear {
            startListening()
        }
    }

    func startListening() {
        // Escucha en tiempo real la última recaudación guardada
        db.collection("daily_collections")
            .order(by: "date", descending: true)
            .limit(to: 1)
            .addSnapshotListener { snap, error in
                self.isLoading = false
                if let docs = snap?.documents, let lastDoc = docs.first {
                    let data = lastDoc.data()
                    self.dailyAmount = data["dailyCollectionAmount"] as? Double ?? 0.0
                    self.monthlyAccumulated = data["accumulatedMonthlyTotal"] as? Double ?? 0.0
                    self.monthlyGoal = data["monthlyGoal"] as? Double ?? 1.0
                }
            }
    }
}

// Subcomponente: Vista de Ola de Agua
struct LiquidWaveView: View {
    var progress: Double
    var waveOffset: Angle
    
    var body: some View {
        ZStack {
            WaveShape(offset: waveOffset, percent: progress)
                .fill(LinearGradient(colors: [Color.blue, Color.blue.opacity(0.8)], startPoint: .top, endPoint: .bottom))
                .offset(y: 0)
            WaveShape(offset: waveOffset + Angle(degrees: 90), percent: progress)
                .fill(Color.blue.opacity(0.4))
                .offset(y: 10)
        }
    }
}

// Subcomponente: Forma de la Ola
struct WaveShape: Shape {
    var offset: Angle
    var percent: Double
    
    var animatableData: Double {
        get { offset.degrees }
        set { offset = Angle(degrees: newValue) }
    }
    
    func path(in rect: CGRect) -> Path {
        var path = Path()
        let waveHeight = 0.03 * rect.height
        let yOffset = CGFloat(1 - percent) * rect.height
        
        path.move(to: CGPoint(x: 0, y: yOffset))
        
        for x in stride(from: 0, through: rect.width, by: 1) {
            let relativeX = x / rect.width
            let sine = sin(relativeX * 2 * .pi + CGFloat(offset.radians))
            let y = yOffset + sine * waveHeight
            path.addLine(to: CGPoint(x: x, y: y))
        }
        
        path.addLine(to: CGPoint(x: rect.width, y: rect.height))
        path.addLine(to: CGPoint(x: 0, y: rect.height))
        path.closeSubpath()
        
        return path
    }
}

// Subcomponente: Tarjeta de Estadística
struct StatCardView: View {
    var title: String
    var value: Double
    var icon: String
    var color: Color
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: icon)
                    .foregroundColor(color)
                    .font(.headline)
                Spacer()
            }
            Text(title)
                .font(.system(size: 10, weight: .black))
                .foregroundColor(.secondary)
            Text("S/ \(value, specifier: "%.0f")")
                .font(.system(size: 18, weight: .bold, design: .rounded))
                .foregroundColor(.primary)
        }
        .padding()
        .frame(maxWidth: .infinity)
        .background(Color.white)
        .cornerRadius(20)
        .shadow(color: .black.opacity(0.03), radius: 10, x: 0, y: 5)
    }
}
```

## 4. Solución de Cierre Inesperado (Error SIGABRT)
Si la App se cierra al abrir:
1. Borra el archivo `GoogleService-Info.plist` de Xcode (Move to Trash).
2. Arrástralo de nuevo desde tu carpeta de Descargas a Xcode.
3. Asegúrate de marcar la casilla **"semapach-report"** en la ventana que sale.
