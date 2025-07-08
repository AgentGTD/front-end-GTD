# Contributor Guidelines

Thank you for your interest in contributing to **FlowDo**! This document provides guidelines and best practices for contributing to our GTD mobile application.

## 🤝 How to Contribute

### Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a feature branch** from `main`
4. **Make your changes** following the guidelines below
5. **Test thoroughly** before submitting
6. **Submit a Pull Request** with a clear description

### Branch Naming Convention

Use descriptive branch names following this pattern:
- `feature/description-of-feature`
- `bugfix/description-of-bug`
- `hotfix/urgent-fix-description`
- `docs/description-of-documentation`

Examples:
- `feature/add-dark-mode`
- `bugfix/fix-task-deletion-issue`
- `hotfix/fix-crash-on-startup`
- `docs/update-api-documentation`

## 📋 Pre-Submission Checklist

Before submitting your Pull Request, ensure you've completed all the following checks:

### 1. Expo Environment Checks

Run these commands to verify your development environment:

```bash
# Check Expo dependencies and configuration
npx expo install --check

# Run Expo Doctor to identify potential issues
npx expo-doctor

# Run linting to ensure code quality
npx expo lint
```

**All commands must pass without errors or warnings.**

### 2. Console Output Verification

- **No warnings or errors** in the Metro bundler console
- **No warnings or errors** in the device/simulator console
- **No TypeScript errors** (if using TypeScript)
- **No ESLint warnings or errors**

### 3. Code Quality Checks

- [ ] Code follows the established style guide
- [ ] All functions have proper JSDoc comments
- [ ] No console.log statements in production code
- [ ] No unused imports or variables
- [ ] Proper error handling implemented
- [ ] Async operations properly handled

### 4. Testing Requirements

- [ ] Test on both iOS and Android (or specify platform limitations)
- [ ] Test on different screen sizes
- [ ] Verify all user flows work correctly
- [ ] Test edge cases and error scenarios
- [ ] Performance testing for new features

## 🎨 Coding Standards

### JavaScript/React Native Best Practices

#### 1. Component Structure

```javascript
// ✅ Good - Proper component structure
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Component description
 * @param {Object} props - Component props
 * @param {string} props.title - The title to display
 * @returns {JSX.Element} Rendered component
 */
const MyComponent = ({ title }) => {
  const [state, setState] = useState(null);

  useEffect(() => {
    // Effect logic
  }, []);

  const handlePress = () => {
    // Event handler logic
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MyComponent;
```

#### 2. State Management

```javascript
// ✅ Good - Using Context API properly
const [state, dispatch] = useReducer(reducer, initialState);

// ✅ Good - Proper action dispatching
dispatch({ type: 'ADD_TASK', payload: newTask });

// ❌ Bad - Direct state mutation
state.tasks.push(newTask);
```

#### 3. Async Operations

```javascript
// ✅ Good - Proper async/await with error handling
const fetchData = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    // Handle error appropriately
  }
};

// ❌ Bad - No error handling
const fetchData = async () => {
  const response = await fetch(API_URL);
  return response.json();
};
```

#### 4. Navigation

```javascript
// ✅ Good - Type-safe navigation
navigation.navigate('ProjectDetail', { projectId: id });

// ✅ Good - Proper navigation options
<Stack.Screen
  name="ProjectDetail"
  component={ProjectDetailScreen}
  options={{ title: 'Project Details' }}
/>
```

### File Organization

#### 1. File Naming

- **Components**: PascalCase (e.g., `TaskCard.js`, `AddTaskModal.js`)
- **Screens**: PascalCase with "Screen" suffix (e.g., `InboxScreen.js`)
- **Utilities**: camelCase (e.g., `dateUtils.js`, `groupTasks.js`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.js`)

#### 2. Import Order

```javascript
// 1. React and React Native imports
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// 2. Third-party library imports
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 3. Local imports (components, screens, utils)
import TaskCard from '../components/TaskCard';
import { formatDate } from '../utils/dateUtils';

// 4. Constants and types
import { API_BASE_URL } from '../apiConfig';
```

### Styling Guidelines

#### 1. StyleSheet Usage

```javascript
// ✅ Good - Using StyleSheet.create
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8fa',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
});

// ❌ Bad - Inline styles
<View style={{ flex: 1, backgroundColor: '#f6f8fa' }}>
```

#### 2. Color and Theme

```javascript
// ✅ Good - Using consistent color scheme
const colors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  background: '#f6f8fa',
  text: '#333333',
  textSecondary: '#666666',
  border: '#E1E5E9',
  error: '#FF3B30',
  success: '#34C759',
};
```

### Error Handling

#### 1. API Calls

```javascript
// ✅ Good - Comprehensive error handling
const fetchTasks = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token');
    }

    const response = await fetch(`${API_BASE_URL}/api/tasks`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.tasks;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    // Show user-friendly error message
    Alert.alert('Error', 'Failed to load tasks. Please try again.');
    return [];
  }
};
```

#### 2. User Feedback

```javascript
// ✅ Good - Providing user feedback
const handleTaskCreation = async (taskData) => {
  try {
    setLoading(true);
    await addTask(taskData);
    Alert.alert('Success', 'Task created successfully!');
  } catch (error) {
    Alert.alert('Error', 'Failed to create task. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

## 🔧 Development Setup

### Required Tools

- **Node.js**: v16 or higher
- **npm** or **yarn**: Latest stable version
- **Expo CLI**: `npm install -g @expo/cli`
- **Git**: Latest version
- **Code Editor**: VS Code (recommended) with React Native extensions

### VS Code Extensions (Recommended)

- ESLint
- Prettier
- React Native Tools
- Auto Rename Tag
- Bracket Pair Colorizer
- GitLens

### Editor Configuration

Create `.vscode/settings.json` in your project:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact"
  ],
  "files.associations": {
    "*.js": "javascriptreact"
  }
}
```

## 🧪 Testing Guidelines

### Manual Testing Checklist

- [ ] **Navigation**: All screens accessible and navigation works correctly
- [ ] **Forms**: Input validation and error handling
- [ ] **Data Persistence**: Changes saved and retrieved correctly
- [ ] **Network**: Offline/online behavior
- [ ] **Performance**: No lag or memory leaks
- [ ] **Accessibility**: Screen reader compatibility
- [ ] **Platform Specific**: iOS and Android specific behaviors

### Testing Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=TaskCard.test.js
```

## 📝 Pull Request Guidelines

### PR Title Format

```
type(scope): description

Examples:
feat(tasks): add task completion animation
fix(navigation): resolve crash on project detail screen
docs(readme): update installation instructions
```

### PR Description Template

```markdown
## Description
Brief description of the changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Tested on iOS
- [ ] Tested on Android
- [ ] All existing tests pass
- [ ] New tests added for new functionality

## Checklist
- [ ] Code follows the style guidelines
- [ ] Self-review of code completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No console warnings or errors
- [ ] All Expo checks pass

## Screenshots (if applicable)
Add screenshots for UI changes.

## Related Issues
Closes #123
```

## 🚫 What Not to Do

### Code Anti-Patterns

```javascript
// ❌ Bad - Direct DOM manipulation (not applicable in RN but for reference)
document.getElementById('button').onclick = handleClick;

// ❌ Bad - Inline styles
<View style={{ flex: 1, backgroundColor: 'red' }}>

// ❌ Bad - No error handling
const data = await fetch(url).then(res => res.json());

// ❌ Bad - Console logs in production
console.log('Debug info:', data);

// ❌ Bad - Magic numbers
const timeout = 5000; // Should be a named constant

// ❌ Bad - Unused imports
import { View, Text, TouchableOpacity, Alert } from 'react-native';
// Only View and Text are used
```

### Git Anti-Patterns

- ❌ **Don't commit directly to main branch**
- ❌ **Don't commit large files or build artifacts**
- ❌ **Don't commit sensitive information (API keys, passwords)**
- ❌ **Don't use vague commit messages**
- ❌ **Don't mix multiple features in one PR**

## 🎯 Code Review Process

### Review Checklist

- [ ] **Functionality**: Does the code work as intended?
- [ ] **Performance**: Are there any performance implications?
- [ ] **Security**: Are there any security vulnerabilities?
- [ ] **Maintainability**: Is the code easy to understand and maintain?
- [ ] **Testing**: Are there adequate tests?
- [ ] **Documentation**: Is the code properly documented?

### Review Comments

When reviewing code, use these prefixes:

- `nit:` - Minor suggestions (spacing, naming, etc.)
- `suggestion:` - Optional improvements
- `blocker:` - Must be fixed before merging
- `question:` - Seeking clarification

## 📞 Getting Help

If you need help or have questions:

1. **Check existing issues** on GitHub
2. **Search documentation** in the README
3. **Create a new issue** with the "question" label
4. **Join our community** (if applicable)

## 🏆 Recognition

Contributors will be recognized in:
- Project README
- Release notes
- Contributor hall of fame (if applicable)

---

Thank you for contributing to FlowDo! Your efforts help make this GTD application better for everyone. 🎯 