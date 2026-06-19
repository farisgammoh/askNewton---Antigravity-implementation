# AskNewton Android App

This directory contains the source code for the AskNewton Android Member App.

## Project Structure

- **MainActivity.kt**: The main entry point of the application.
- **ui/**: Contains the main `AskNewtonApp` composable, theme, and shared components.
- **feature/**: Contains feature-specific screens (Home, Benefits, PreAuth, Visits, Profile).

## How to Run

Since this project was generated without a full Gradle project structure, you can import it into Android Studio:

1.  Open **Android Studio**.
2.  Select **New Project > Empty Activity**.
3.  Name it **AskNewton** and ensure the language is **Kotlin**.
4.  Once created, copy the `com.asknewton.app` package structure (containing `ui`, `feature`, etc.) into your new Android project's `src/main/java` directory.
5.  **Dependencies**: Add the following to your `build.gradle` (Module: app):
    ```gradle
    implementation "androidx.navigation:navigation-compose:2.7.7"
    implementation "androidx.compose.material3:material3:1.2.1"
    // Add Health Connect dependencies if needed
    ```
6.  **Manifest**: Ensure your `AndroidManifest.xml` includes necessary permissions for internet and health data.

## Features Implemented

- **Coverage Home**: Dashboard showing deductible/OOP status.
- **Claims & EOB**: List of claims with detailed breakdown.
- **Pre-Auth Helper**: Tool to check coverage for procedures.
- **Visit Timeline**: Combined view of medical visits and health metrics.
- **Profile**: Settings and Health Connect toggle.
