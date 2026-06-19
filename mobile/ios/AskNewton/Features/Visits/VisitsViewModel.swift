import Foundation
import Combine

class VisitsViewModel: ObservableObject {
    @Published var timelineItems: [TimelineItem] = []
    @Published var isLoading = false
    
    enum ItemType {
        case visit
        case healthMetric
    }
    
    struct TimelineItem: Identifiable {
        let id = UUID()
        let type: ItemType
        let date: Date
        let title: String
        let subtitle: String
        let status: String? // For visits
        let metricValue: String? // For health metrics
    }
    
    @MainActor
    func fetchTimeline() async {
        isLoading = true
        try? await Task.sleep(nanoseconds: 500_000_000)
        
        let visits = [
            TimelineItem(type: .visit, date: Date(), title: "Dr. Smith", subtitle: "Annual Checkup", status: "Completed", metricValue: nil),
            TimelineItem(type: .visit, date: Date().addingTimeInterval(-86400*14), title: "City Lab", subtitle: "Blood Work", status: "Processed", metricValue: nil)
        ]
        
        let metrics = [
            TimelineItem(type: .healthMetric, date: Date().addingTimeInterval(-86400*2), title: "Activity Insight", subtitle: "You were more active this week!", status: nil, metricValue: "8,500 steps/avg"),
            TimelineItem(type: .healthMetric, date: Date().addingTimeInterval(-86400*10), title: "Heart Rate Trend", subtitle: "Resting HR is stable.", status: nil, metricValue: "62 bpm")
        ]
        
        self.timelineItems = (visits + metrics).sorted(by: { $0.date > $1.date })
        isLoading = false
    }
}
