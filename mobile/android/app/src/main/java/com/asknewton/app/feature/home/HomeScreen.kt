package com.asknewton.app.feature.home

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel

@Composable
fun HomeScreen(viewModel: HomeViewModel = viewModel()) {
    val uiState by viewModel.uiState.collectAsState()
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        when (val state = uiState) {
            is HomeUiState.Loading -> CircularProgressIndicator(modifier = Modifier.align(Alignment.CenterHorizontally))
            is HomeUiState.Success -> HomeContent(state.summary)
            is HomeUiState.Error -> Text("Error: ${state.message}")
        }
    }
}

@Composable
fun HomeContent(summary: CoverageSummary) {
    // Status Banner
    Card(
        colors = CardDefaults.cardColors(containerColor = if (summary.isCovered) Color(0xFF34C759) else Color.Red)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = if (summary.isCovered) "You are covered" else "Attention needed",
                color = Color.White,
                style = MaterialTheme.typography.titleMedium
            )
        }
    }
    
    // Plan Details
    Card {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = summary.planName, style = MaterialTheme.typography.titleLarge)
            Text(text = summary.networkTier, style = MaterialTheme.typography.bodyMedium, color = Color.Gray)
            
            Spacer(modifier = Modifier.height(16.dp))
            
            ProgressRow("Deductible", summary.deductibleUsed, summary.deductibleTotal, Color(0xFFFF9500))
            Spacer(modifier = Modifier.height(8.dp))
            ProgressRow("Out-of-Pocket Max", summary.oopUsed, summary.oopTotal, Color(0xFF34C759))
        }
    }
}

@Composable
fun ProgressRow(title: String, current: Double, total: Double, color: Color) {
    Column {
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text(text = title, style = MaterialTheme.typography.bodyMedium)
            Text(text = "$${current.toInt()} / $${total.toInt()}", style = MaterialTheme.typography.bodySmall)
        }
        LinearProgressIndicator(
            progress = (current / total).toFloat(),
            modifier = Modifier.fillMaxWidth().height(8.dp),
            color = color
        )
    }
}
