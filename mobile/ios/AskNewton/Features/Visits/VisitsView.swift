import SwiftUI

struct VisitsView: View {
    @StateObject private var viewModel = VisitsViewModel()
    
    var body: some View {
        NavigationView {
            ScrollView {
                LazyVStack(spacing: 20) {
                    if viewModel.isLoading {
                        ProgressView()
                    } else {
                        ForEach(viewModel.timelineItems) { item in
                            TimelineRow(item: item)
                        }
                    }
                }
                .padding()
            }
            .navigationTitle("Timeline")
            .task {
                await viewModel.fetchTimeline()
            }
        }
    }
}

struct TimelineRow: View {
    let item: VisitsViewModel.TimelineItem
    
    var body: some View {
        HStack(alignment: .top, spacing: 15) {
            // Timeline Line & Dot
            VStack {
                Circle()
                    .fill(item.type == .visit ? Color.blue : Color.green)
                    .frame(width: 12, height: 12)
                Rectangle()
                    .fill(Color.gray.opacity(0.3))
                    .frame(width: 2)
            }
            
            // Content
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text(item.date, style: .date)
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Spacer()
                    if let status = item.status {
                        Text(status)
                            .font(.caption2)
                            .padding(4)
                            .background(Color.blue.opacity(0.1))
                            .foregroundColor(.blue)
                            .cornerRadius(4)
                    }
                }
                
                Text(item.title)
                    .font(.headline)
                
                Text(item.subtitle)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                
                if let metric = item.metricValue {
                    HStack {
                        Image(systemName: "heart.text.square.fill")
                            .foregroundColor(.green)
                        Text(metric)
                            .font(.callout)
                            .fontWeight(.medium)
                    }
                    .padding(8)
                    .background(Color.green.opacity(0.1))
                    .cornerRadius(8)
                }
            }
            .padding()
            .background(Color(UIColor.secondarySystemBackground))
            .cornerRadius(12)
        }
    }
}
