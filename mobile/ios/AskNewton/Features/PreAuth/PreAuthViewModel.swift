import Foundation
import Combine

class PreAuthViewModel: ObservableObject {
    @Published var selectedReason: String = ""
    @Published var selectedProvider: String = ""
    @Published var checkResult: PreAuthResult?
    @Published var isChecking = false
    
    struct PreAuthResult: Decodable {
        let requiresAuth: Bool
        let status: String // "Approved", "Pending", "Not Required", "Denied"
        let message: String
        
        var statusColor: String {
            switch status {
            case "Approved", "Not Required": return "green"
            case "Pending": return "orange"
            case "Denied": return "red"
            default: return "gray"
            }
        }
    }
    
    @MainActor
    func checkPreAuth() async {
        guard !selectedReason.isEmpty && !selectedProvider.isEmpty else { return }
        
        isChecking = true
        checkResult = nil
        
        try? await Task.sleep(nanoseconds: 1_000_000_000)
        
        // Mock logic
        if selectedReason.lowercased().contains("surgery") {
            checkResult = PreAuthResult(
                requiresAuth: true,
                status: "Pending",
                message: "We are working on your approval. This usually takes 2-3 days."
            )
        } else {
            checkResult = PreAuthResult(
                requiresAuth: false,
                status: "Not Required",
                message: "You're cleared for this visit! No pre-authorization is needed."
            )
        }
        
        isChecking = false
    }
}
