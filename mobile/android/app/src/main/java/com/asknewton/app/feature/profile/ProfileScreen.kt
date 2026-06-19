package com.asknewton.app.feature.profile

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
fun ProfileScreen() {
    var healthConnectEnabled by remember { mutableStateOf(false) }
    var notificationsEnabled by remember { mutableStateOf(true) }
    
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        // User Info
        Row(verticalAlignment = Alignment.CenterVertically) {
            Surface(
                modifier = Modifier.size(60.dp),
                shape = MaterialTheme.shapes.extraLarge,
                color = Color.Gray.copy(alpha = 0.3f)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Text("JD", style = MaterialTheme.typography.headlineMedium)
                }
            }
            Spacer(modifier = Modifier.width(16.dp))
            Column {
                Text("John Doe", style = MaterialTheme.typography.headlineSmall)
                Text("Member ID: 123-456-789", style = MaterialTheme.typography.bodyMedium, color = Color.Gray)
            }
        }
        
        Spacer(modifier = Modifier.height(32.dp))
        
        Text("Health Integrations", style = MaterialTheme.typography.titleMedium)
        Spacer(modifier = Modifier.height(8.dp))
        
        ListItem(
            headlineContent = { Text("Health Connect") },
            supportingContent = { Text("Share activity & vitals for better coverage insights") },
            trailingContent = {
                Switch(
                    checked = healthConnectEnabled,
                    onCheckedChange = { healthConnectEnabled = it }
                )
            }
        )
        
        Divider()
        Spacer(modifier = Modifier.height(16.dp))
        
        Text("Settings", style = MaterialTheme.typography.titleMedium)
        
        ListItem(
            headlineContent = { Text("Notifications") },
            trailingContent = {
                Switch(
                    checked = notificationsEnabled,
                    onCheckedChange = { notificationsEnabled = it }
                )
            }
        )
        
        ListItem(headlineContent = { Text("Privacy Policy") })
        ListItem(headlineContent = { Text("Terms of Service") })
        
        Spacer(modifier = Modifier.weight(1f))
        
        Button(
            onClick = { /* Logout */ },
            colors = ButtonDefaults.buttonColors(containerColor = Color.Red.copy(alpha = 0.1f), contentColor = Color.Red),
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Sign Out")
        }
    }
}
