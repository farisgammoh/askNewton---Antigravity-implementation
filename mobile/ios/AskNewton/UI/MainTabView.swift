import SwiftUI

struct MainTabView: View {
    var body: some View {
        TabView {
            HomeView()
                .tabItem {
                    Label("Home", systemImage: "house.fill")
                }
            
            VisitsView()
                .tabItem {
                    Label("Visits", systemImage: "calendar")
                }
            
            BenefitsView()
                .tabItem {
                    Label("Benefits", systemImage: "doc.text.fill")
                }
            
            PreAuthView()
                .tabItem {
                    Label("Pre-Auth", systemImage: "checkmark.shield.fill")
                }
            
            ProfileView()
                .tabItem {
                    Label("Profile", systemImage: "person.fill")
                }
        }
        .accentColor(Color("BrandPrimary")) // Assuming Asset catalog
    }
}

// Placeholder Views
struct HomeView: View { var body: some View { Text("Home") } }
struct VisitsView: View { var body: some View { Text("Visits") } }
struct BenefitsView: View { var body: some View { Text("Benefits") } }
struct PreAuthView: View { var body: some View { Text("Pre-Auth") } }
struct ProfileView: View { var body: some View { Text("Profile") } }
