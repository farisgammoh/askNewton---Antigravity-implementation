import Foundation
import Combine

class BenefitsViewModel: ObservableObject {
    @Published var claims: [Claim] = []
    @Published var isLoading = false
    
    struct Claim: Identifiable, Decodable {
        let id: String
        let date: Date
        let provider: String
        let status: String
        let amountBilled: Double
        let amountPaid: Double
        let patientResponsibility: Double
        
        var statusColor: String {
            switch status.lowercased() {
            case "paid": return "green"
            case "denied": return "red"
            case "processing": return "orange"
            default: return "gray"
            }
        }
    }
    
    @MainActor
    func fetchClaims() async {
        isLoading = true
        // Mock data
        try? await Task.sleep(nanoseconds: 500_000_000)
        self.claims = [
            Claim(id: "1", date: Date(), provider: "Dr. Smith", status: "Paid", amountBilled: 250.0, amountPaid: 200.0, patientResponsibility: 50.0),
            Claim(id: "2", date: Date().addingTimeInterval(-86400*5), provider: "City Lab", status: "Processing", amountBilled: 150.0, amountPaid: 0.0, patientResponsibility: 0.0),
            Claim(id: "3", date: Date().addingTimeInterval(-86400*20), provider: "Urgent Care", status: "Denied", amountBilled: 500.0, amountPaid: 0.0, patientResponsibility: 500.0)
        ]
        isLoading = false
    }
}
