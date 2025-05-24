# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Project Features
- Trending stocks, financial news, favorites, AI summaries, notifications, user profiles, onboarding, ads, subscriptions, and more. See `ai-overview.md` for details.

## Configuration
- Copy `.env.example` to `.env` and fill in all required API keys (Firebase, RapidAPI, OpenAI, AdMob, etc.).
- See `0-project-setup.md` for setup instructions.

## Troubleshooting
- If you encounter issues starting the app, ensure all dependencies are installed and environment variables are set.
- For common issues, see the documentation in the `docs/` folder.

## Contributing
- Please follow the code documentation standards in `19-dev-docs.md`.
- Write tests for new features and bug fixes.
- Keep documentation up to date with code changes.

## Internationalization (i18n)

This app uses [react-i18next](https://react.i18next.com/) and [expo-localization](https://docs.expo.dev/versions/latest/sdk/localization/) for internationalization support. Translation files are located in the `locales/` directory at the project root.

**Supported languages:**
- English (en)
- Mandarin Chinese (zh)
- Hindi (hi)
- Spanish (es)
- Arabic (ar)

To add or update translations, edit the corresponding JSON file in `locales/`. To add a new language, create a new JSON file and update the i18n configuration.
