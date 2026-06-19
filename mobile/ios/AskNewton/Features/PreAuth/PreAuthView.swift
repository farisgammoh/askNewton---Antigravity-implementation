import SwiftUI

struct PreAuthView: View {
    @StateObject private var viewModel = PreAuthViewModel()
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 25) {
                    // Intro
                    Text("Check if you're covered before you go.")
                        .font(.title2)
                        .bold()
                        .multilineTextAlignment(.center)
                    
                    // Form
                    VStack(alignment: .leading, spacing: 15) {
                        Text("Reason for visit")
                            .font(.headline)
                        TextField("e.g. Knee Surgery, Annual Checkup", text: $viewModel.selectedReason)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                        
                        Text("Provider or Facility")
                            .font(.headline)
                        TextField("e.g. Dr. Smith, City Hospital", text: $viewModel.selectedProvider)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                        
                        Button(action: {
                            Task { await viewModel.checkPreAuth() }
                        }) {
                            if viewModel.isChecking {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            } else {
                                Text("Check Coverage")
                                    .bold()
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(10)
                        .disabled(viewModel.isChecking || viewModel.selectedReason.isEmpty || viewModel.selectedProvider.isEmpty)
                    }
                    .padding()
                    .background(Color(UIColor.secondarySystemBackground))
                    .cornerRadius(12)
                    
                    // Result
                    if let result = viewModel.checkResult {
                        VStack(spacing: 15) {
                            Image(systemName: result.status == "Denied" ? "xmark.circle.fill" : "checkmark.circle.fill")
                                .font(.system(size: 50))
                                .foregroundColor(Color(result.statusColor))
                            
                            Text(result.status)
                                .font(.title)
                                .bold()
                                .foregroundColor(Color(result.statusColor))
                            
                            Text(result.message)
                                .multilineTextAlignment(.center)
                                .foregroundColor(.secondary)
                            
                            if result.requiresAuth && result.status == "Pending" {
                                Button("Upload Documents") {
                                    // Upload logic
                                }
                                .padding(.top)
                            }
                        }
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(Color(result.statusColor).opacity(0.1))
                        .cornerRadius(12)
                        .transition(.scale)
                    }
                }
                .padding()
            }
            .navigationTitle("Pre-Auth Helper")
        }
    }
}
