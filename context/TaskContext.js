import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { debugFetch } from '../utils/debugFetch';
import { AuthContext } from './AuthContext';
import { API_BASE_URL } from '@env';

const TaskContext = createContext();

const initialState = {
  tasks: [],
  projects: [],
  contexts: [],
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id ? action.payload : task
        ),
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
      };
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };
    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.payload] };
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.payload.id ? { ...p, ...action.payload } : p
        ),
      };
    case 'DELETE_PROJECT_AND_TASKS':
      return {
        ...state,
        projects: state.projects.filter((p) => p.id !== action.payload),
        tasks: state.tasks.filter((task) => task.projectId !== action.payload),
      };
    case 'SET_CONTEXTS':
      return { ...state, contexts: action.payload };
    case 'ADD_CONTEXT':
      if (state.contexts.some((c) => c.context_name === action.payload.context_name)) return state;
      return {
        ...state,
        contexts: [...state.contexts, action.payload],
      };
    case 'UPDATE_CONTEXT':
      return {
        ...state,
        contexts: state.contexts.map((c) =>
          c.id === action.payload.id ? { ...c, ...action.payload } : c
        ),
      };
    case 'DELETE_CONTEXT':
      return {
        ...state,
        contexts: state.contexts.filter((c) => c.id !== action.payload),
        tasks: state.tasks.map((task) =>
          task.contextId === action.payload
            ? { ...task, contextId: null, completed: true }
            : task
        ),
      };
    default:
      return state;
  }
};

export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { getCurrentToken, user, initializing } = useContext(AuthContext);

  // Debug logging for authentication state
  useEffect(() => {
    console.log('🔐 TaskContext Auth State Debug:');
    console.log('  - initializing:', initializing);
    console.log('  - user:', user ? {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      displayName: user.displayName
    } : 'null');
    console.log('  - user.emailVerified:', user?.emailVerified);
  }, [user, initializing]);

  // Helper function to get Firebase token for API calls
  const getAuthToken = async () => {
    console.log('🔑 Getting auth token...');
    try {
      const token = await getCurrentToken();
      if (!token) {
        console.error('❌ No authentication token available');
        throw new Error('No authentication token available');
      }
      console.log('✅ Auth token obtained successfully');
      return token;
    } catch (error) {
      console.error('❌ Error getting auth token:', error);
      throw error;
    }
  };

  // Fetch all data from backend on app start
  const fetchAll = async () => {
    console.log('📡 Starting fetchAll...');
    try {
      const token = await getAuthToken();
      console.log('🔑 Token obtained for fetchAll');
      
      // Fetch tasks
      console.log('📋 Fetching tasks...');
      const tasksRes = await debugFetch(`${API_BASE_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const tasksData = await tasksRes.json();
      console.log('📋 Tasks response:', tasksData);
      if (tasksRes.ok && Array.isArray(tasksData.tasks)) {
        dispatch({ type: 'SET_TASKS', payload: tasksData.tasks });
        console.log('✅ Tasks loaded:', tasksData.tasks.length);
      }
      
      // Fetch projects
      console.log('📁 Fetching projects...');
      const projectsRes = await debugFetch(`${API_BASE_URL}/api/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const projectsData = await projectsRes.json();
      console.log('📁 Projects response:', projectsData);
      if (projectsRes.ok && Array.isArray(projectsData.projects)) {
        dispatch({ type: 'SET_PROJECTS', payload: projectsData.projects });
        console.log('✅ Projects loaded:', projectsData.projects.length);
      }
      
      // Fetch next-actions/contexts
      console.log('🎯 Fetching next actions...');
      const contextsRes = await debugFetch(`${API_BASE_URL}/api/next-actions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const contextsData = await contextsRes.json();
      console.log('🎯 Next actions response:', contextsData);
      if (contextsRes.ok && Array.isArray(contextsData.nextActions)) {
        dispatch({ type: 'SET_CONTEXTS', payload: contextsData.nextActions });
        console.log('✅ Next actions loaded:', contextsData.nextActions.length);
      }
      
      console.log('✅ fetchAll completed successfully');
    } catch (error) {
      console.error('❌ Error in fetchAll:', error);
      console.error('  - Error message:', error.message);
      console.error('  - Error stack:', error.stack);
    }
  };
    
  // Only fetch data when user is authenticated and not initializing
  useEffect(() => {
    console.log('🔄 TaskContext useEffect triggered:');
    console.log('  - initializing:', initializing);
    console.log('  - user exists:', !!user);
    console.log('  - user.emailVerified:', user?.emailVerified);
    
    if (!initializing && user && user.emailVerified) {
      console.log('✅ Conditions met, calling fetchAll');
      fetchAll();
    } else if (!initializing && !user) {
      console.log('🧹 User not authenticated, clearing data');
      // Clear data when user is not authenticated
      dispatch({ type: 'SET_TASKS', payload: [] });
      dispatch({ type: 'SET_PROJECTS', payload: [] });
      dispatch({ type: 'SET_CONTEXTS', payload: [] });
    } else {
      console.log('⏳ Waiting for authentication state...');
    }
  }, [user, initializing]);

  // TASKS
  const addTask = async (title, description, dueDate, priority, category = 'inbox', projectId = null, nextActionId = null) => {
    console.log('➕ Adding task:', { title, category, projectId });
    
    // Only allow API calls if user is authenticated
    if (!user || !user.emailVerified) {
      console.error('❌ User not authenticated for addTask');
      return;
    }

    try {
      const token = await getAuthToken();
      const taskData = {
        title,
        description,
        dueDate,
        priority,
        category,
        projectId,
        nextActionId,
      };
      
      console.log('📤 Sending task data:', taskData);
      
      const res = await debugFetch(`${API_BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });
      
      const data = await res.json();
      console.log('📥 Task creation response:', data);
      
      if (res.ok && data.task) {
        dispatch({ type: 'ADD_TASK', payload: data.task });
        console.log('✅ Task added successfully');
      } else {
        console.error('❌ Task creation failed:', data);
      }
    } catch (error) {
      console.error('❌ Error adding task:', error);
    }
  };

  const updateTask = async (updatedTask) => {
    // Only allow API calls if user is authenticated
    if (!user || !user.emailVerified) {
      console.error('User not authenticated');
      return;
    }

    try {
      const token = await getAuthToken();
      const res = await debugFetch(`${API_BASE_URL}/api/tasks/${updatedTask.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask),
      });
      const data = await res.json();
      if (res.ok && data.task) {
        dispatch({ type: 'UPDATE_TASK', payload: data.task });
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId) => {
    // Only allow API calls if user is authenticated
    if (!user || !user.emailVerified) {
      console.error('User not authenticated');
      return;
    }

    try {
      const token = await getAuthToken();
      const res = await debugFetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        dispatch({ type: 'DELETE_TASK', payload: taskId });
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const toggleComplete = async (taskId) => {
    // Only allow API calls if user is authenticated
    if (!user || !user.emailVerified) {
      console.error('User not authenticated');
      return;
    }

    try {
      const token = await getAuthToken();
      const task = state.tasks.find(t => t.id === taskId);
      if (!task) return;

      const reqBody = {
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        priority: task.priority,
        category: task.category,
        projectId: task.projectId || null,
        nextActionId: task.nextActionId || null,
        completed: !task.completed, 
      };

      const res = await debugFetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reqBody),
      });
      const data = await res.json();
      if (res.ok && data.task) {
        dispatch({ type: 'UPDATE_TASK', payload: data.task });
      }
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  // PROJECTS
  const addProject = async (name, description = "") => {
    // Only allow API calls if user is authenticated
    if (!user || !user.emailVerified) {
      console.error('User not authenticated');
      return null;
    }

    try {
      const token = await getAuthToken();
      const res = await debugFetch(`${API_BASE_URL}/api/projects`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description }),
      });
      const data = await res.json();
      if (res.ok && data.project) {
        dispatch({ type: 'ADD_PROJECT', payload: data.project });
        return data.project; 
      }
      return null;
    } catch (error) {
      console.error('Error adding project:', error);
      return null;
    }
  };

  const updateProject = async (project) => {
    // Only allow API calls if user is authenticated
    if (!user || !user.emailVerified) {
      console.error('User not authenticated');
      return;
    }

    try {
      const token = await getAuthToken();
      const res = await debugFetch(`${API_BASE_URL}/api/projects/${project.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(project),
      });
      const data = await res.json();
      if (res.ok && data.project) {
        dispatch({ type: 'UPDATE_PROJECT', payload: data.project });
      }
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const deleteProject = async (projectId) => {
    // Only allow API calls if user is authenticated
    if (!user || !user.emailVerified) {
      console.error('User not authenticated');
      return;
    }

    try {
      const token = await getAuthToken();
      const res = await debugFetch(`${API_BASE_URL}/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        dispatch({ type: 'DELETE_PROJECT_AND_TASKS', payload: projectId });
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  // NEXT-ACTIONS / CONTEXTS
  const addContext = async (context_name) => {
    // Only allow API calls if user is authenticated
    if (!user || !user.emailVerified) {
      console.error('User not authenticated');
      return null;
    }

    try {
      const token = await getAuthToken();
      const res = await debugFetch(`${API_BASE_URL}/api/next-actions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ context_name }),
      });
      const data = await res.json();
      if (res.ok && data.nextAction) {
        dispatch({ type: 'ADD_CONTEXT', payload: data.nextAction });
        return data.nextAction; 
      }
      return null;
    } catch (error) {
      console.error('Error adding context:', error);
      return null;
    }
  };

  const updateContext = async (context) => {
    // Only allow API calls if user is authenticated
    if (!user || !user.emailVerified) {
      console.error('User not authenticated');
      return;
    }

    try {
      const token = await getAuthToken();
      const res = await debugFetch(`${API_BASE_URL}/api/next-actions/${context.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(context),
      });
      const data = await res.json();
      if (res.ok && data.nextAction) {
        dispatch({ type: 'UPDATE_CONTEXT', payload: data.nextAction });
      }
    } catch (error) {
      console.error('Error updating context:', error);
    }
  };

  const deleteContext = async (contextId) => {
    // Only allow API calls if user is authenticated
    if (!user || !user.emailVerified) {
      console.error('User not authenticated');
      return;
    }

    try {
      const token = await getAuthToken();
      const res = await debugFetch(`${API_BASE_URL}/api/next-actions/${contextId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        dispatch({ type: 'DELETE_CONTEXT', payload: contextId });
      }
    } catch (error) {
      console.error('Error deleting context:', error);
    }
  };

  const moveTo = async (taskId, type, payload) => {
    // Only allow API calls if user is authenticated
    if (!user || !user.emailVerified) {
      console.error('User not authenticated');
      return;
    }

    try {
      const token = await getAuthToken();
      // Find the task to update
      const task = state.tasks.find(t => t.id === taskId);
      if (!task) return;

      let updatedTask = { ...task };

      if (type === 'project' && payload.projectId) {
        updatedTask.projectId = payload.projectId;
      }
      if (type === 'next' && payload.contextId) {
        updatedTask.nextActionId = payload.contextId;
      }

      const res = await debugFetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask),
      });
      const data = await res.json();
      if (res.ok && data.task) {
        dispatch({ type: 'UPDATE_TASK', payload: data.task });
      }
    } catch (error) {
      console.error('Error moving task:', error);
    }
  };

  const getTasksByProject = (projectId) => {
    return state.tasks.filter(
      (task) => task.projectId === projectId && !task.completed && !task.trashed
    );
  };

  return (
    <TaskContext.Provider
      value={{
        state,
        dispatch,
        addTask,
        updateTask,
        deleteTask,
        addProject,
        updateProject,
        deleteProject,
        addContext,
        updateContext,
        deleteContext,
        getTasksByProject,
        toggleComplete,
        moveTo,
        refreshAll: fetchAll,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => useContext(TaskContext);
