import Foundation
import Combine

enum APIError: Error {
    case invalidURL
    case requestFailed
    case decodingFailed
    case unauthorized
    case serverError(String)
}

class ApiClient {
    static let shared = ApiClient()
    private let baseURL = "https://asknewton.com/api" // Update with actual prod URL
    
    private init() {}
    
    func request<T: Decodable>(_ endpoint: String, method: String = "GET", body: Encodable? = nil) async throws -> T {
        guard let url = URL(string: "\(baseURL)\(endpoint)") else {
            throw APIError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        if let token = AuthManager.shared.token {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        if let body = body {
            request.httpBody = try JSONEncoder().encode(body)
        }
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.requestFailed
        }
        
        guard (200...299).contains(httpResponse.statusCode) else {
            if httpResponse.statusCode == 401 {
                AuthManager.shared.logout()
                throw APIError.unauthorized
            }
            throw APIError.serverError("Status code: \(httpResponse.statusCode)")
        }
        
        do {
            return try JSONDecoder().decode(T.self, from: data)
        } catch {
            throw APIError.decodingFailed
        }
    }
}
