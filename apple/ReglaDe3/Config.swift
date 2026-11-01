// Regla de 3 para macOS e iOS — configuración del anfitrión. Desarrollada por Javiera Navarrete.
import Foundation
extension ConfigApp {
    static let actual = ConfigApp(
        nombre: "Regla de 3",
        inicio: .local("index.html"),
        puente: .ninguno,
        permitidos: [],
        fuera: ["http://", "https://"],
        ventanasDentro: false,
        activos: [])
}
