# FlowDo - GTD Mobile Application

A comprehensive Getting Things Done (GTD) mobile application built with React Native and Expo, designed to help users organize tasks, manage projects, and maintain productivity through the GTD methodology.

## 🚀 Features

### Core GTD Functionality
- **Inbox Management**: Capture and organize incoming tasks and ideas
- **Project Organization**: Group related tasks into projects with detailed management
- **Next Actions**: Define specific next actions for each project
- **Context Management**: Organize tasks by context (work, home, errands, etc.)
- **Today's Focus**: Prioritize and focus on today's most important tasks

### Task Management
- Create, edit, and delete tasks with rich details
- Set due dates, priorities, and categories
- Mark tasks as complete/incomplete
- Associate tasks with projects and contexts
- Real-time synchronization with backend API

### Project Management
- Create and manage multiple projects
- View project details with associated tasks
- Track project progress and completion
- Delete projects and associated tasks

### User Experience
- Clean, intuitive interface built with React Native Paper
- Smooth navigation with React Navigation
- Persistent data storage with AsyncStorage
- Real-time updates and synchronization
- Responsive design for both iOS and Android

## 🛠️ Tech Stack

- **Framework**: React Native 0.79.5
- **Development Platform**: Expo SDK 53
- **Navigation**: React Navigation v7
- **UI Components**: React Native Paper
- **State Management**: React Context API with useReducer
- **Storage**: AsyncStorage for local data persistence
- **Date Handling**: date-fns
- **Icons**: Expo Vector Icons
- **Development**: ESLint for code quality

## 📱 Screenshots

The app includes the following main screens:
- **Splash Screen**: App loading and authentication
- **Inbox Screen**: Capture and organize incoming items
- **Today Screen**: Focus on today's priority tasks
- **Projects Screen**: Manage and view all projects
- **Project Detail Screen**: Detailed project view with associated tasks
- **Next Actions Screen**: Organize tasks by context

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development) or Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd front-end-GTD
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   expo start
   ```

4. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your physical device

### Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint for code quality
- `npm run install-safe` - Install dependencies with legacy peer deps

## 🔧 Configuration

### API Configuration
The app connects to a backend API for data persistence. Update the `apiConfig.js` file with your backend URL:

```javascript
export const API_BASE_URL = 'https://your-backend-url.com';
```

### Authentication
The app uses JWT token-based authentication. Tokens are automatically stored in AsyncStorage upon successful login.

## 📁 Project Structure

```
front-end-GTD/
├── assets/                 # Images, icons, and static assets
├── components/             # Reusable UI components
│   ├── AddTaskModal.js
│   ├── FAB.js
│   ├── TaskCard.js
│   └── TaskDetailModal.js
├── context/               # React Context for state management
│   └── TaskContext.js
├── navigation/            # Navigation configuration
│   ├── AppNavigator.js
│   └── ProjectsStack.js
├── screens/               # Main application screens
│   ├── InboxScreen.js
│   ├── NextActionsScreen.js
│   ├── ProjectDetailScreen.js
│   ├── ProjectsScreen.js
│   ├── SplashScreen.js
│   └── TodayScreen.js
├── utils/                 # Utility functions
│   ├── dateUtils.js
│   └── groupTasks.js
├── App.js                 # Main application component
├── apiConfig.js           # API configuration
└── package.json           # Dependencies and scripts
```

## 🔄 State Management

The app uses React Context API with useReducer for state management:

- **TaskContext**: Manages tasks, projects, and contexts
- **AsyncStorage**: Persists authentication tokens and user preferences
- **API Integration**: Real-time synchronization with backend services

## 📱 Platform Support

- **iOS**: 13.0 and later
- **Android**: API level 21 and later
- **Web**: Modern browsers (Chrome, Firefox, Safari, Edge)

## 🚀 Building for Production

### Using EAS Build (Recommended)

1. **Install EAS CLI**
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Configure EAS**
   ```bash
   eas build:configure
   ```

3. **Build for platforms**
   ```bash
   eas build --platform ios
   eas build --platform android
   ```

### Manual Build

1. **Prebuild the project**
   ```bash
   npx expo prebuild
   ```

2. **Build for iOS**
   ```bash
   npx expo run:ios --configuration Release
   ```

3. **Build for Android**
   ```bash
   npx expo run:android --variant release
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the Expo documentation for general React Native/Expo questions

## 🔮 Roadmap

- [ ] Offline mode support
- [ ] Push notifications for due dates
- [ ] Data export/import functionality
- [ ] Advanced filtering and search
- [ ] Dark mode support
- [ ] Widget support for iOS/Android
- [ ] Integration with calendar apps
- [ ] Team collaboration features

---

**FlowDo** - Get things done, one task at a time! 🎯
