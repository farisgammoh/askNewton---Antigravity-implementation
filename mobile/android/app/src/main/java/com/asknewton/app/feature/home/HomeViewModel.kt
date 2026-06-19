package com.asknewton.app.feature.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

data class CoverageSummary(
    val planName: String,
    val networkTier: String,
    val deductibleUsed: Double,
    val deductibleTotal: Double,
    val oopUsed: Double,
    val oopTotal: Double,
    val isCovered: Bool
)

class HomeViewModel : ViewModel() {
    private val _uiState = MutableStateFlow<HomeUiState>(HomeUiState.Loading)
    val uiState: StateFlow<HomeUiState> = _uiState
    
    init {
        fetchCoverage()
    }
    
    fun fetchCoverage() {
        viewModelScope.launch {
            _uiState.value = HomeUiState.Loading
            delay(1000) // Mock network delay
            
            _uiState.value = HomeUiState.Success(
                CoverageSummary(
                    planName = "Gold PPO Plan",
                    networkTier = "Tier 1",
                    deductibleUsed = 450.0,
                    deductibleTotal = 1500.0,
                    oopUsed = 1200.0,
                    oopTotal = 5000.0,
                    isCovered = true
                )
            )
        }
    }
}

sealed class HomeUiState {
    object Loading : HomeUiState()
    data class Success(val summary: CoverageSummary) : HomeUiState()
    data class Error(val message: String) : HomeUiState()
}
