package com.asknewton.app.feature.preauth

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun PreAuthScreen() {
    var reason by remember { mutableStateOf("") }
    var provider by remember { mutableStateOf("") }
    var isChecking by remember { mutableStateOf(false) }
    var result by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()
    
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Pre-Auth Helper", style = MaterialTheme.typography.headlineMedium)
        Text("Check coverage before you go", style = MaterialTheme.typography.bodyMedium, color = Color.Gray)
        
        Spacer(modifier = Modifier.height(24.dp))
        
        OutlinedTextField(
            value = reason,
            onValueChange = { reason = it },
            label = { Text("Reason for visit") },
            modifier = Modifier.fillMaxWidth()
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        OutlinedTextField(
            value = provider,
            onValueChange = { provider = it },
            label = { Text("Provider or Facility") },
            modifier = Modifier.fillMaxWidth()
        )
        
        Spacer(modifier = Modifier.height(24.dp))
        
        Button(
            onClick = {
                scope.launch {
                    isChecking = true
                    delay(1000)
                    result = if (reason.contains("surgery", ignoreCase = true)) "Pending Approval" else "Approved"
                    isChecking = false
                }
            },
            modifier = Modifier.fillMaxWidth(),
            enabled = !isChecking && reason.isNotEmpty() && provider.isNotEmpty()
        ) {
            if (isChecking) {
                CircularProgressIndicator(modifier = Modifier.size(24.dp), color = Color.White)
            } else {
                Text("Check Coverage")
            }
        }
        
        Spacer(modifier = Modifier.height(24.dp))
        
        result?.let { status ->
            Card(
                colors = CardDefaults.cardColors(
                    containerColor = if (status == "Approved") Color(0xFF34C759).copy(alpha = 0.1f) else Color(0xFFFF9500).copy(alpha = 0.1f)
                ),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = status,
                        style = MaterialTheme.typography.headlineSmall,
                        color = if (status == "Approved") Color(0xFF34C759) else Color(0xFFFF9500)
                    )
                    Text(
                        text = if (status == "Approved") "You're cleared for this visit!" else "We are working on your approval.",
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            }
        }
    }
}
