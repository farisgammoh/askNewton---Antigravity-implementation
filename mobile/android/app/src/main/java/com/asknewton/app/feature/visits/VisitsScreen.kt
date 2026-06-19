package com.asknewton.app.feature.visits

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import java.text.SimpleDateFormat
import java.util.*

data class TimelineItem(
    val id: String,
    val type: ItemType,
    val date: Date,
    val title: String,
    val subtitle: String,
    val status: String? = null,
    val metricValue: String? = null
)

enum class ItemType { VISIT, METRIC }

@Composable
fun VisitsScreen() {
    val items = listOf(
        TimelineItem("1", ItemType.VISIT, Date(), "Dr. Smith", "Annual Checkup", "Completed"),
        TimelineItem("2", ItemType.METRIC, Date(System.currentTimeMillis() - 86400000*2), "Activity Insight", "You were more active this week!", metricValue = "8,500 steps/avg"),
        TimelineItem("3", ItemType.VISIT, Date(System.currentTimeMillis() - 86400000*14), "City Lab", "Blood Work", "Processed")
    )
    
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Timeline", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(16.dp))
        
        LazyColumn(verticalArrangement = Arrangement.spacedBy(16.dp)) {
            items(items) { item ->
                TimelineRow(item)
            }
        }
    }
}

@Composable
fun TimelineRow(item: TimelineItem) {
    Row(modifier = Modifier.fillMaxWidth()) {
        // Timeline Line
        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.width(24.dp)) {
            Box(
                modifier = Modifier
                    .size(12.dp)
                    .background(if (item.type == ItemType.VISIT) Color(0xFF007AFF) else Color(0xFF34C759), CircleShape)
            )
            Box(
                modifier = Modifier
                    .width(2.dp)
                    .height(80.dp) // Fixed height for simplicity in this mock
                    .background(Color.Gray.copy(alpha = 0.3f))
            )
        }
        
        Spacer(modifier = Modifier.width(12.dp))
        
        // Content
        Card(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        SimpleDateFormat("MMM dd", Locale.US).format(item.date),
                        style = MaterialTheme.typography.labelSmall,
                        color = Color.Gray
                    )
                    item.status?.let {
                        Text(it, style = MaterialTheme.typography.labelSmall, color = Color(0xFF007AFF))
                    }
                }
                
                Text(item.title, style = MaterialTheme.typography.titleMedium)
                Text(item.subtitle, style = MaterialTheme.typography.bodyMedium, color = Color.Gray)
                
                item.metricValue?.let { metric ->
                    Spacer(modifier = Modifier.height(8.dp))
                    Surface(
                        color = Color(0xFF34C759).copy(alpha = 0.1f),
                        shape = MaterialTheme.shapes.small
                    ) {
                        Row(modifier = Modifier.padding(8.dp), verticalAlignment = Alignment.CenterVertically) {
                            Text("♥", color = Color(0xFF34C759)) // Placeholder icon
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(metric, style = MaterialTheme.typography.bodyMedium)
                        }
                    }
                }
            }
        }
    }
}
