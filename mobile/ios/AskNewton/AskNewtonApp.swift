import SwiftUI

@main
struct AskNewtonApp: App {
    @StateObject private var authManager = AuthManager.shared
    
    var body: some Scene {
        WindowGroup {
            if authManager.isAuthenticated {
                MainTabView()
            } else {
                OnboardingView()
            }
        }
    }
}
