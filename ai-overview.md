## Project Overview

- *Project Name:* expo-app
- *Description:*
  This is a cross-platform mobile application built with Expo and React Native. The app provides users with trending stock data, financial news, AI-generated stock summaries, favorites management, notifications, and user profile features. It integrates with Firebase for authentication and data storage, RapidAPI for stock/news data, and OpenAI for AI summaries.

- *Main Features:*
  - Trending stocks list with search and mini chart
  - Financial news feed
  - Favorites management synced with Firestore
  - AI-powered stock summaries via OpenAI
  - Google authentication and biometric login
  - Push notifications (Expo Notifications)
  - Profile/settings with theme and language options
  - Onboarding/tutorial flow
  - AdMob integration for ads
  - In-app purchases for subscriptions

---

## Architecture Overview

The application is a client-only Expo/React Native app. It uses a modular structure with screens, services, components, and hooks. All business logic and data access are handled on the client, with integrations to third-party APIs (Firebase, RapidAPI, OpenAI, AdMob).

- *Design Patterns/Principles:*
  - Modular folder structure (components, services, hooks)
  - Service abstraction for API/data access
  - React functional components and hooks
  - File-based routing (expo-router)

### System Diagram
- *Diagram:*
```mermaid
graph TD
  subgraph Mobile App (Expo/React Native)
    UI[UI Screens]
    Components[Reusable Components]
    Services[Services (API, Firebase, AI, Notifications)]
    Hooks[Custom Hooks]
    UI --> Services
    UI --> Hooks
    Hooks --> Services
  end
  Services -->|REST/SDK| Firebase[(Firebase Auth/Firestore)]
  Services -->|REST| RapidAPI[(RapidAPI: Stocks/News)]
  Services -->|REST| OpenAI[(OpenAI API)]
  Services -->|SDK| AdMob[(AdMob)]
  Services -->|SDK| ExpoNotifications[(Expo Notifications)]
```
- *Explanation:*
  - The app is structured around UI screens that interact with services and hooks.
  - Services handle all external integrations (Firebase, RapidAPI, OpenAI, AdMob, Notifications).
  - No backend/server-side code is present in the codebase.

---

## Front End/Client Side

- *UI*
  - Home: Welcome, quick start, push registration
  - Explore: App features, routing, theming, onboarding info
  - Trending: List of trending stocks (from RapidAPI)
  - News: Financial news feed (from RapidAPI)
  - Favorites: User's favorite stocks (synced with Firestore)
  - AI Summary: AI-generated stock summaries (OpenAI)
  - Profile: User info, sign out, theme/language toggles
  - Notifications: Register for push, view token/status
  - Onboarding: Multi-step intro/tutorial (AppIntroSlider)
  - Auth: Google login, biometric prompt

  - Cross-cutting: File-based routing (expo-router), state via React hooks, API access via services, authentication via Firebase

- *Structure*
  - `app/`: All screens, layouts, and routing
  - `components/`: Reusable UI components (ThemedText, ParallaxScrollView, Collapsible, etc.)
  - `components/ui/`: Icon and tab bar components
  - `services/`: API and business logic (favorites, news, stocks, notifications, AI summary)
  - `constants/`: App-wide constants and Firebase config
  - `hooks/`: Custom React hooks (theme, color scheme)
  - `assets/`: Images and fonts
  - `scripts/`: Utility scripts (e.g., reset-project.js)

---

## Back End/Service Side

- *Bootstrap*
  [Information not found in codebase: No backend/server-side code present.]
- *Contract*
  [Information not found in codebase: No backend/server-side code present.]
- *App Layers*
  [Information not found in codebase: No backend/server-side code present.]
- *Infra*
  - Uses Firebase (Auth, Firestore) via client SDK
  - Integrates with RapidAPI, OpenAI, AdMob, Expo Notifications
- *3rd Parties*
  - Firebase: Auth, Firestore
  - RapidAPI: Stock and news data
  - OpenAI: AI summaries
  - AdMob: Ads
  - Expo Notifications: Push notifications

---

## Technology Stack

- *Frontend:*
  - Frameworks/Libraries: React Native 0.79.2, Expo ~53.0.9, expo-router ~5.0.6
  - Styling: React Native StyleSheet, ThemedText, ThemedView
  - State Management: React hooks (useState, useEffect, etc.)

- *Backend:*
  - [Information not found in codebase: No backend/server-side code present.]

- *Database:*
  - Primary Database: Firebase Firestore (via client SDK)
  - Cache: AsyncStorage (for onboarding, preferences)

- *Other Tools & Services:*  - AdMob (react-native-google-mobile-ads) - **ENABLED with test IDs**  - OpenAI API (gpt-3.5-turbo)  - RapidAPI (stock/news endpoints)  - Expo Notifications  - GitHub Actions (see 18-github-actions-cicd.md)

---

## Project Structure

```
startup-template-angular/
├── expo-app/
│   ├── app/                  # Screens, layouts, routing (file-based)
│   │   ├── (tabs)/           # Tab screens (Home, Explore, Trending, News, Favorites, AI Summary, Profile, Notifications)
│   │   ├── onboarding.tsx    # Onboarding/tutorial screen
│   │   ├── auth.tsx          # Auth screen
│   │   └── _layout.tsx       # Tab navigator layout
│   ├── assets/               # Images and fonts
│   │   ├── images/
│   │   └── fonts/
│   ├── components/           # Reusable UI components
│   │   ├── ui/
│   │   ├── constants/        # App-wide constants, Firebase config
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API and business logic services
│   │   ├── scripts/          # Utility scripts
│   │   ├── .expo/            # Expo config/cache
│   │   ├── package.json      # App dependencies and scripts
│   │   ├── app.json          # Expo app config
│   │   ├── .gitignore        # Git ignore rules
│   │   └── README.md         # Project readme
│   ├── 0-project-setup.md    # Setup and overview
│   ├── ... (feature docs)
```

---

## Environment Configurations

- *Environments:*
  - [Information not found in codebase: No explicit staging/production config.]
  - Development: Local Expo CLI setup

- *Configuration Management:*
  - Uses `.env` file for API keys (OpenAI, RapidAPI, Firebase, AdMob, etc.)
  - Example: [No .env.example found in codebase]

- *Setup Instructions for local development:*
  1. Run `npm install` in `expo-app/` to install dependencies.
  2. Create a `.env` file in `expo-app/` and fill in required API keys (see 0-project-setup.md).
  3. Start the app with `npx expo start`.

---

## Environment Variables Example

- See `.env.example` in the project root for required environment variables and example values for API keys (Firebase, RapidAPI, OpenAI, AdMob, etc.).
- Do not commit your real API keys to version control.

---

## Security

- *Authentication:*
  - Google sign-in via Firebase Auth
  - Biometric authentication via expo-local-authentication

- *Authorization:*
  - [Information not found in codebase: No explicit RBAC or role checks in client code.]

- *Data Encryption:*
  - [Information not found in codebase: No explicit encryption at rest; relies on Firebase/Expo defaults.]

- *Security Tools:*
  - [Information not found in codebase: No explicit security middleware/tools.]

---

## Deployment

- *Deployment Process:*
  - [Information not found in codebase: No deployment scripts or cloud provider config.]
  - EAS Build and Expo CLI for building and publishing apps (see 0-project-setup.md)

- *CI/CD Pipeline:*
  - GitHub Actions (see 18-github-actions-cicd.md)

- *Tools Used:*
  - Expo CLI, EAS Build, GitHub Actions
  - `scripts/reset-project.js` for project reset

---

## Testing (Update)

- Test setup and coverage are required for all major features and services.
- See `19-dev-docs.md` for test writing standards and coverage requirements.

---

## UI Framework

- *Framework/Library:*
  - React Native 0.79.2 with functional components and hooks
  - Expo ~53.0.9

- *Component Library:*
  - @expo/vector-icons
  - Custom components in `components/` and `components/ui/`

- *Styling:*
  - React Native StyleSheet
  - ThemedText, ThemedView for theme support

---

## Shared Utilities and Helpers

- *Utilities:*
  - `services/`: API clients for stocks, news, favorites, notifications, AI summary
  - `constants/Colors.ts`: Color palette
  - `constants/firebaseConfig.ts`: Firebase config

- *Helpers:*
  - `hooks/`: useColorScheme, useThemeColor

- *Examples:*
  ```typescript
  // services/aiSummaryService.ts
  export async function getAISummary(stock, priceHistory, news) { ... }
  ```

---

## Important Notes

- *Known Issues:*
  - [Information not found in codebase: No known issues documented.]

- *Workarounds:*
  - [Information not found in codebase: No workarounds documented.]

---

### Maintenance Note
This document should be updated whenever significant changes are made to the architecture, tech stack, or processes. 

---

## Feature Completeness Checklist
- [ ] Authentication (Google, Biometric)
- [ ] Onboarding & Tutorial
- [ ] Trending Stocks (RapidAPI)
- [ ] Stock Charts
- [ ] News Integration (RapidAPI)
- [ ] Favorites (Firestore)
- [ ] AI Summary (OpenAI)
- [x] Ad Integration (AdMob) - **ENABLED with test IDs**
- [ ] Subscription & Payment
  - Subscription logic is implemented in `services/subscriptionService.ts`.
  - Update `PRODUCT_IDS` in that file with your real Google Play/Apple product IDs.
  - Profile screen now shows subscription status, benefits, and subscribe/restore buttons.
  - Ads are hidden for subscribers throughout the app.
- [ ] Profile & Settings
- [ ] Notifications (FCM, in-app)
- [ ] Admin App
- [ ] Analytics & Crash Reporting
- [ ] Offline Support
- [ ] Privacy & Terms
- [ ] Internationalization (i18n)
- [ ] Icons & Imagery
- [ ] CI/CD (GitHub Actions, EAS)
- [ ] Developer Documentation 