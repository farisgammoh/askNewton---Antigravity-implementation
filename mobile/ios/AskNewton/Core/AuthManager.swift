import Foundation
import SwiftUI

class AuthManager: ObservableObject {
    static let shared = AuthManager()
    
    @Published var isAuthenticated: Bool = false
    @Published var token: String? {
        didSet {
            isAuthenticated = token != nil
            if let token = token {
                UserDefaults.standard.set(token, forKey: "authToken")
            } else {
                UserDefaults.standard.removeObject(forKey: "authToken")
            }
        }
    }
    
    private init() {
        self.token = UserDefaults.standard.string(forKey: "authToken")
        self.isAuthenticated = self.token != nil
    }
    
    func login(token: String) {
        self.token = token
    }
    
    func logout() {
        self.token = nil
    }
}
