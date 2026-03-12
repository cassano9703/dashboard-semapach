# 🚀 Guía Definitiva: De Prototipo a las Tiendas (SEMAPACH)

Esta guía te llevará paso a paso para que la App de monitoreo comercial de SEMAPACH pase de ser un prototipo a una herramienta oficial descargable.

---

## 1. Comparativa de Costos: Apple vs. Android

Si la institución decide publicar la App formalmente, estos son los costos oficiales:

| Característica | Apple App Store (iPhone) | Google Play Store (Android) |
| :--- | :--- | :--- |
| **Costo de Registro** | $99 USD | $25 USD |
| **Frecuencia de Pago** | **Anual** (Cada año) | **Pago único** (Para siempre) |
| **Requisito Identidad** | D-U-N-S (Número empresarial) | Registro con correo institucional |
| **Tiempo de Revisión** | 24 - 48 horas | 1 - 7 días |

---

## 2. Fase de Desarrollo (Lo que tienes ahora)
Actualmente tienes un prototipo funcional en Xcode. Para verlo en tu iPhone físico:
1. **Conecta tu iPhone** a la Mac vía USB.
2. En Xcode, selecciona tu iPhone físico en la parte superior central.
3. Presiona el botón **Play**.
4. *Nota:* Esta versión gratuita caduca cada 7 días. Deberás darle a Play de nuevo si deja de abrir.

---

## 3. Preparación para Producción (Paso a Paso)

### Paso 1: Inscripción en Apple / Google
Para que la App sea pública, la institución (SEMAPACH) debe crear sus cuentas:
1. **Para iPhone:** Ve a [developer.apple.com](https://developer.apple.com/).
2. **Para Android:** Ve a [play.google.com/console](https://play.google.com/console/signup).

### Paso 2: Configurar el Icono Oficial
Necesitarás el logo de SEMAPACH en alta resolución:
1. En Xcode, ve a la carpeta **Assets**.
2. Busca **AppIcon**.
3. Arrastra tu logo (1024x1024 px) y Xcode lo ajustará automáticamente.

---

## 4. Código de la Interfaz "Aquarium" (SwiftUI)

Asegúrate de que tu archivo `ContentView.swift` tenga este código para la animación de las olas:

```swift
import SwiftUI
import FirebaseFirestore

struct ContentView: View {
    @State private var dailyAmount: Double = 0.0
    @State private var monthlyAccumulated: Double = 0.0
    @State private var monthlyGoal: Double = 1.0 
    @State private var isLoading = true
    @State private var waveOffset = Angle(degrees: 0)
    
    private var db = Firestore.firestore()
    
    var progress: Double {
        min(monthlyAccumulated / monthlyGoal, 1.0)
    }

    var body: some View {
        ZStack {
            LinearGradient(colors: [Color.blue.opacity(0.1), Color.white], startPoint: .top, endPoint: .bottom)
                .ignoresSafeArea()
            
            ScrollView {
                VStack(spacing: 25) {
                    // Header
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
                    
                    // AQUARIUM VIEW
                    VStack(spacing: 15) {
                        ZStack {
                            Circle()
                                .stroke(Color.blue.opacity(0.1), lineWidth: 15)
                                .frame(width: 240, height: 240)
                            
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
                    
                    // Card Principal: Recaudación de Hoy
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
                    
                    // Stats Secundarios
                    HStack(spacing: 15) {
                        StatCardView(title: "ACUMULADO", value: monthlyAccumulated, icon: "chart.line.uptrend.xyaxis", color: .green)
                        StatCardView(title: "META TOTAL", value: monthlyGoal, icon: "target", color: .orange)
                    }
                    .padding(.horizontal)
                }
                .padding(.top, 20)
            }
        }
        .onAppear {
            startListening()
        }
    }

    func startListening() {
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

// Componentes Auxiliares (LiquidWaveView, StatCardView, etc.) se mantienen igual.
```

---

## 5. Publicación Final
Cuando la App esté lista y la cuenta de desarrollador pagada:
1. En Xcode, ve a **Product > Archive**.
2. Selecciona **Distribute App**.
3. Elige **App Store Connect**.
4. Apple revisará la app en 24-48h y ¡estará en vivo!
