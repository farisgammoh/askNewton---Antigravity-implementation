import SwiftUI

struct HomeView: View {
    @StateObject private var viewModel = HomeViewModel()
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    if viewModel.isLoading {
                        ProgressView()
                    } else if let summary = viewModel.coverageSummary {
                        // Status Banner
                        StatusBanner(isCovered: summary.isCovered)
                        
                        // Plan Details
                        VStack(alignment: .leading, spacing: 10) {
                            Text(summary.planName)
                                .font(.headline)
                            Text(summary.networkTier)
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                            
                            Divider()
                            
                            // Deductible
                            ProgressRow(
                                title: "Deductible",
                                current: summary.deductibleUsed,
                                total: summary.deductibleTotal,
                                color: .orange
                            )
                            
                            // Out of Pocket
                            ProgressRow(
                                title: "Out-of-Pocket Max",
                                current: summary.oopUsed,
                                total: summary.oopTotal,
                                color: .green
                            )
                        }
                        .padding()
                        .background(Color(UIColor.secondarySystemBackground))
                        .cornerRadius(12)
                        
                        // Quick Actions
                        HStack(spacing: 15) {
                            QuickActionButton(icon: "creditcard.fill", title: "Card")
                            QuickActionButton(icon: "magnifyingglass", title: "Find Care")
                            QuickActionButton(icon: "message.fill", title: "Ask Newton")
                        }
                    } else {
                        Text("Unable to load coverage")
                        Button("Retry") {
                            Task { await viewModel.fetchCoverage() }
                        }
                    }
                }
                .padding()
            }
            .navigationTitle("Coverage")
            .task {
                await viewModel.fetchCoverage()
            }
        }
    }
}

struct StatusBanner: View {
    let isCovered: Bool
    
    var body: some View {
        HStack {
            Image(systemName: isCovered ? "checkmark.circle.fill" : "exclamationmark.triangle.fill")
                .foregroundColor(.white)
            Text(isCovered ? "You are covered" : "Attention needed")
                .font(.headline)
                .foregroundColor(.white)
            Spacer()
        }
        .padding()
        .background(isCovered ? Color.green : Color.red)
        .cornerRadius(12)
    }
}

struct ProgressRow: View {
    let title: String
    let current: Double
    let total: Double
    let color: Color
    
    var body: some View {
        VStack(alignment: .leading) {
            HStack {
                Text(title)
                Spacer()
                Text("$\(Int(current)) / $\(Int(total))")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    Rectangle()
                        .frame(width: geometry.size.width, height: 8)
                        .opacity(0.3)
                        .foregroundColor(color)
                    
                    Rectangle()
                        .frame(width: min(CGFloat(current / total) * geometry.size.width, geometry.size.width), height: 8)
                        .foregroundColor(color)
                }
                .cornerRadius(4)
            }
            .frame(height: 8)
        }
    }
}

struct QuickActionButton: View {
    let icon: String
    let title: String
    
    var body: some View {
        Button(action: {}) {
            VStack {
                Image(systemName: icon)
                    .font(.title2)
                Text(title)
                    .font(.caption)
                    .fontWeight(.medium)
            }
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color.blue.opacity(0.1))
            .foregroundColor(.blue)
            .cornerRadius(10)
        }
    }
}
