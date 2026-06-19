import Foundation
import Combine

class HomeViewModel: ObservableObject {
    @Published var coverageSummary: CoverageSummary?
    @Published var isLoading = false
    @Published var error: String?
    
    struct CoverageSummary: Decodable {
        let planName: String
        let networkTier: String
        let deductibleUsed: Double
        let deductibleTotal: Double
        let oopUsed: Double
        let oopTotal: Double
        let isCovered: Bool
    }
    
    @MainActor
    func fetchCoverage() async {
        isLoading = true
        error = nil
        
        do {
            // In a real app, this would be a network call
            // self.coverageSummary = try await ApiClient.shared.request("/member/coverage-summary")
            
            // Mock data for now
            try await Task.sleep(nanoseconds: 1_000_000_000)
            self.coverageSummary = CoverageSummary(
                planName: "Gold PPO Plan",
                networkTier: "Tier 1",
                deductibleUsed: 450.0,
                deductibleTotal: 1500.0,
                oopUsed: 1200.0,
                oopTotal: 5000.0,
                isCovered: true
            )
        } catch {
            self.error = error.localizedDescription
        }
        
        isLoading = false
    }
}
