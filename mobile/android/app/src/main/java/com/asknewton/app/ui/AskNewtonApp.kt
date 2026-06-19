package com.asknewton.app.ui

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.asknewton.app.feature.home.HomeScreen
import com.asknewton.app.feature.benefits.BenefitsScreen
import com.asknewton.app.feature.preauth.PreAuthScreen
import com.asknewton.app.feature.visits.VisitsScreen
import com.asknewton.app.feature.profile.ProfileScreen
import com.asknewton.app.ui.components.BottomNavigationBar

@Composable
fun AskNewtonApp() {
    val navController = rememberNavController()
    
    Scaffold(
        bottomBar = { BottomNavigationBar(navController) }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = "home",
            modifier = Modifier.padding(innerPadding)
        ) {
            composable("home") { HomeScreen() }
            composable("visits") { VisitsScreen() }
            composable("benefits") { BenefitsScreen() }
            composable("preauth") { PreAuthScreen() }
            composable("profile") { ProfileScreen() }
        }
    }
}
