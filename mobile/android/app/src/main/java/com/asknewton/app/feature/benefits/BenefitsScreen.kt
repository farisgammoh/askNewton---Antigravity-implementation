package com.asknewton.app.feature.benefits

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import java.text.SimpleDateFormat
import java.util.*

data class Claim(
    val id: String,
    val provider: String,
    val date: Date,
    val status: String,
    val amount: Double
)

@Composable
fun BenefitsScreen() {
    val claims = listOf(
        Claim("1", "Dr. Smith", Date(), "Paid", 250.0),
        Claim("2", "City Lab", Date(), "Processing", 150.0),
        Claim("3", "Urgent Care", Date(), "Denied", 500.0)
    )
    
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Claims & EOBs", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(16.dp))
        
        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(claims) { claim ->
                ClaimRow(claim)
            }
        }
    }
}

@Composable
fun ClaimRow(claim: Claim) {
    Card(modifier = Modifier.fillMaxWidth().clickable { /* Navigate to details */ }) {
        Row(
            modifier = Modifier.padding(16.dp).fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(claim.provider, style = MaterialTheme.typography.titleMedium)
                Text(
                    SimpleDateFormat("MMM dd, yyyy", Locale.US).format(claim.date),
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.Gray
                )
            }
            
            Column(horizontalAlignment = Alignment.End) {
                StatusBadge(claim.status)
                Text("$${claim.amount.toInt()}", style = MaterialTheme.typography.bodyMedium)
            }
        }
    }
}

@Composable
fun StatusBadge(status: String) {
    val color = when (status) {
        "Paid" -> Color(0xFF34C759)
        "Denied" -> Color.Red
        "Processing" -> Color(0xFFFF9500)
        else -> Color.Gray
    }
    
    Surface(
        color = color.copy(alpha = 0.2f),
        shape = MaterialTheme.shapes.small
    ) {
        Text(
            text = status,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
            color = color,
            style = MaterialTheme.typography.labelSmall
        )
    }
}
