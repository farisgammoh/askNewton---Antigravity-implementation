# AskNewton iOS App

This directory contains the source code for the AskNewton iOS Member App.

## Project Structure

- **AskNewtonApp.swift**: The main entry point of the application.
- **Core/**: Contains core utilities like `ApiClient`, `AuthManager`, and `HealthKitManager`.
- **Features/**: Contains feature-specific views and view models (Home, Benefits, PreAuth, Visits, Profile).
- **UI/**: Shared UI components and the main tab view.

## How to Run

Since this project was generated without an `.xcodeproj` file, you can easily import it into Xcode:

1.  Open **Xcode**.
2.  Select **File > New > Project**.
3.  Choose **iOS > App**.
4.  Name it **AskNewton** and ensure the Interface is set to **SwiftUI**.
5.  Once created, drag and drop the `AskNewton` folder (containing `Core`, `Features`, `UI`, etc.) into your new Xcode project.
6.  Delete the default `ContentView.swift` and `AskNewtonApp.swift` created by Xcode and replace them with the ones provided here.
7.  **Add Capabilities**:
    *   Go to Project Settings > Signing & Capabilities.
    *   Add **HealthKit** capability.
    *   Add **Privacy - Health Share Usage Description** and **Privacy - Health Update Usage Description** to your `Info.plist`.

## Dependencies

This project uses standard SwiftUI and Combine. No external dependencies are required for the core functionality, but you might want to add:
- **Alamofire** (optional replacement for URLSession)
- **Sentry** (for error tracking)

## Features Implemented

- **Authentication**: Mock login flow.
- **Coverage Home**: Dashboard showing deductible/OOP status.
- **Claims & EOB**: List of claims with detailed explanation view.
- **Pre-Auth Helper**: Tool to check coverage for procedures.
- **Visit Timeline**: Combined view of medical visits and health metrics.
- **HealthKit**: Integration to read steps and other metrics (requires permission).
