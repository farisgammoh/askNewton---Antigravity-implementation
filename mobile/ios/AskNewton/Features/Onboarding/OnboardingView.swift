import SwiftUI

struct OnboardingView: View {
    @StateObject private var viewModel = OnboardingViewModel()
    
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                Image(systemName: "cross.case.fill") // Placeholder logo
                    .resizable()
                    .scaledToFit()
                    .frame(width: 100, height: 100)
                    .foregroundColor(.blue)
                
                Text("Welcome to AskNewton")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                
                Text("Your health coverage, simplified.")
                    .font(.body)
                    .foregroundColor(.secondary)
                
                Spacer()
                
                Button(action: {
                    // Simulate login for now
                    AuthManager.shared.login(token: "dummy_token")
                }) {
                    Text("Sign In")
                        .font(.headline)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .cornerRadius(10)
                }
                .padding(.horizontal)
                
                NavigationLink("Create Account", destination: Text("Sign Up"))
                    .padding()
            }
            .padding()
        }
    }
}

class OnboardingViewModel: ObservableObject {
    // Login logic will go here
}
