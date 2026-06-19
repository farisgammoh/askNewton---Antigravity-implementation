import SwiftUI

struct BenefitsView: View {
    @StateObject private var viewModel = BenefitsViewModel()
    
    var body: some View {
        NavigationView {
            List {
                ForEach(viewModel.claims) { claim in
                    NavigationLink(destination: EOBDetailView(claim: claim)) {
                        ClaimRow(claim: claim)
                    }
                }
            }
            .navigationTitle("Claims & EOBs")
            .task {
                await viewModel.fetchClaims()
            }
        }
    }
}

struct ClaimRow: View {
    let claim: BenefitsViewModel.Claim
    
    var body: some View {
        VStack(alignment: .leading, spacing: 5) {
            HStack {
                Text(claim.provider)
                    .font(.headline)
                Spacer()
                Text(claim.status)
                    .font(.caption)
                    .padding(5)
                    .background(Color(claim.statusColor).opacity(0.2))
                    .foregroundColor(Color(claim.statusColor))
                    .cornerRadius(5)
            }
            
            HStack {
                Text(claim.date, style: .date)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                Spacer()
                Text("$\(Int(claim.amountBilled))")
                    .font(.subheadline)
            }
        }
        .padding(.vertical, 5)
    }
}

struct EOBDetailView: View {
    let claim: BenefitsViewModel.Claim
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Header
                VStack(alignment: .leading) {
                    Text(claim.provider)
                        .font(.title2)
                        .bold()
                    Text(claim.date, style: .date)
                        .foregroundColor(.secondary)
                }
                
                Divider()
                
                // Financial Breakdown
                VStack(spacing: 15) {
                    DetailRow(title: "Billed Amount", value: claim.amountBilled)
                    DetailRow(title: "Plan Paid", value: claim.amountPaid, color: .green)
                    Divider()
                    DetailRow(title: "You Owe", value: claim.patientResponsibility, isTotal: true)
                }
                .padding()
                .background(Color(UIColor.secondarySystemBackground))
                .cornerRadius(12)
                
                // Explanation
                VStack(alignment: .leading, spacing: 10) {
                    Text("Explanation")
                        .font(.headline)
                    Text("This claim was processed according to your plan benefits. The provider billed $\(Int(claim.amountBilled)). Your plan covered $\(Int(claim.amountPaid)). You are responsible for the remaining balance of $\(Int(claim.patientResponsibility)) which applies to your deductible.")
                        .font(.body)
                        .foregroundColor(.secondary)
                }
                .padding()
                
                // Actions
                Button(action: {}) {
                    Label("I'm Confused - Ask Newton", systemImage: "questionmark.circle.fill")
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(10)
                }
            }
            .padding()
        }
        .navigationTitle("EOB Details")
    }
}

struct DetailRow: View {
    let title: String
    let value: Double
    var color: Color = .primary
    var isTotal: Bool = false
    
    var body: some View {
        HStack {
            Text(title)
                .fontWeight(isTotal ? .bold : .regular)
            Spacer()
            Text("$\(String(format: "%.2f", value))")
                .fontWeight(isTotal ? .bold : .regular)
                .foregroundColor(color)
        }
    }
}
