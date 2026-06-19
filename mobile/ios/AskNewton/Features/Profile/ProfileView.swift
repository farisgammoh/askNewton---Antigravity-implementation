import SwiftUI

struct ProfileView: View {
    @StateObject private var healthKitManager = HealthKitManager.shared
    @State private var notificationsEnabled = true
    
    var body: some View {
        NavigationView {
            List {
                // User Info
                Section {
                    HStack(spacing: 15) {
                        Image(systemName: "person.circle.fill")
                            .resizable()
                            .frame(width: 60, height: 60)
                            .foregroundColor(.gray)
                        
                        VStack(alignment: .leading) {
                            Text("John Doe")
                                .font(.headline)
                            Text("Member ID: 123-456-789")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                    }
                    .padding(.vertical, 10)
                }
                
                // Health Integrations
                Section(header: Text("Health Integrations")) {
                    Toggle(isOn: Binding(
                        get: { healthKitManager.isAuthorized },
                        set: { _ in Task { await healthKitManager.requestAuthorization() } }
                    )) {
                        HStack {
                            Image(systemName: "heart.text.square.fill")
                                .foregroundColor(.red)
                            VStack(alignment: .leading) {
                                Text("Apple Health")
                                Text("Share activity & vitals for better coverage insights")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                        }
                    }
                }
                
                // App Settings
                Section(header: Text("Settings")) {
                    Toggle("Notifications", isOn: $notificationsEnabled)
                    NavigationLink("Privacy Policy", destination: Text("Privacy Policy"))
                    NavigationLink("Terms of Service", destination: Text("Terms of Service"))
                }
                
                // Actions
                Section {
                    Button(action: {
                        AuthManager.shared.logout()
                    }) {
                        Text("Sign Out")
                            .foregroundColor(.red)
                    }
                }
            }
            .navigationTitle("Profile")
        }
    }
}
