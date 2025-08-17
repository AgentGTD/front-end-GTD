import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
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

    case 'ADD_TASK': // legacy (server-confirmed adds)
      return { ...state, tasks: [...state.tasks, action.payload] };

    // NEW: optimistic insert of a local temp task
    case 'ADD_TASK_OPTIMISTIC':
      return { ...state, tasks: [...state.tasks, action.payload] };

    // NEW: replace a temp task with the server-confirmed task
    case 'REPLACE_TASK': {
      const { tempId, task } = action.payload;
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === tempId ? task : t)),
      };
    }

    // NEW: rollback temp task
    case 'REVERT_OPTIMISTIC_TASK':
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== action.payload),
      };

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id ? { ...task, ...action.payload } : task
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
        // FIX: tasks use nextActionId, not contextId
        tasks: state.tasks.map((task) =>
          task.nextActionId === action.payload
            ? { ...task, nextActionId: null }
            : task
        ),
      };

    case 'OPTIMISTIC_TOGGLE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload ? { ...task, completed: !task.completed } : task
        ),
      };

    default:
      return state;
  }
};

export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { getCurrentToken, user, initializing } = useContext(AuthContext);
  const stateRef = useRef(state);

  // Keep ref updated
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

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
      dispatch({ type: 'SET_TASKS', payload: [] });
      dispatch({ type: 'SET_PROJECTS', payload: [] });
      dispatch({ type: 'SET_CONTEXTS', payload: [] });
    } else {
      console.log('⏳ Waiting for authentication state...');
    }
  }, [user, initializing]);

  // --- Utilities ---

  // Generate a stable temporary id for optimistic items
  const genTempId = () => `temp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // Fetch with timeout
  const fetchWithTimeout = async (url, options = {}, timeoutMs = 15000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await debugFetch(url, { ...options, signal: controller.signal });
      return res;
    } finally {
      clearTimeout(id);
    }
  };

  // TASKS
  const addTask = async (title, description, dueDate, priority, category = 'inbox', projectId = null, nextActionId = null) => {
    console.log('➕ Adding task (optimistic):', { title, category, projectId });

    if (!user || !user.emailVerified) {
      console.error('❌ User not authenticated for addTask');
      return;
    }

    const tempId = genTempId();
    const optimisticTask = {
      id: tempId,
      title,
      description,
      dueDate,
      priority,
      category,
      projectId,
      nextActionId,
      completed: false,
      trashed: false,
      optimistic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_TASK_OPTIMISTIC', payload: optimisticTask });

    try {
      const token = await getAuthToken();
      const body = { title, description, dueDate, priority, category, projectId, nextActionId };

      const res = await fetchWithTimeout(`${API_BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }, 20000);

      const data = await res.json();
      console.log('📥 Task creation response:', data);

      if (res.ok && data.task) {
        dispatch({ type: 'REPLACE_TASK', payload: { tempId, task: { ...data.task, optimistic: false } } });
        console.log('✅ Task added successfully (server confirmed)');
      } else {
        dispatch({ type: 'REVERT_OPTIMISTIC_TASK', payload: tempId });
        console.error('❌ Task creation failed:', data);
      }
    } catch (error) {
      dispatch({ type: 'REVERT_OPTIMISTIC_TASK', payload: tempId });
      console.error('❌ Error adding task:', error);
    }
  };

  // OPTIMISTIC updateTask
  const updateTask = async (updatedTask) => {
    if (!user || !user.emailVerified) {
      console.error('User not authenticated');
      return;
    }

    // Save previous snapshot for rollback
    const prev = stateRef.current.tasks.find(t => t.id === updatedTask.id);
    if (!prev) return;

    // Optimistic apply
    dispatch({ type: 'UPDATE_TASK', payload: updatedTask });

    try {
      const token = await getAuthToken();
      const res = await fetchWithTimeout(`${API_BASE_URL}/api/tasks/${updatedTask.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask),
      });
      const data = await res.json();
      if (res.ok && data.task) {
        // Normalize to server version (keeps server timestamps, etc.)
        dispatch({ type: 'UPDATE_TASK', payload: data.task });
      } else {
        // Revert
        dispatch({ type: 'UPDATE_TASK', payload: prev });
        console.error('Error updating task (server response not ok):', data);
      }
    } catch (error) {
      // Revert on error
      dispatch({ type: 'UPDATE_TASK', payload: prev });
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId) => {
    if (!user || !user.emailVerified) {
      console.error('User not authenticated');
      return;
    }

    try {
      const token = await getAuthToken();
      const res = await fetchWithTimeout(`${API_BASE_URL}/api/tasks/${taskId}`, {
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
    if (!user || !user.emailVerified) {
      console.error('User not authenticated');
      return;
    }

    const prevTask = stateRef.current.tasks.find(t => t.id === taskId);
    if (!prevTask) return;

    const newCompleted = !prevTask.completed;

    dispatch({ type: 'OPTIMISTIC_TOGGLE_TASK', payload: taskId });

    try {
      const token = await getAuthToken();

      const reqBody = {
        title: prevTask.title,
        description: prevTask.description,
        dueDate: prevTask.dueDate,
        priority: prevTask.priority,
        category: prevTask.category,
        projectId: prevTask.projectId || null,
        nextActionId: prevTask.nextActionId || null,
        completed: newCompleted,
      };

      const res = await fetchWithTimeout(`${API_BASE_URL}/api/tasks/${taskId}`, {
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
      } else {
        // revert optimistic change
        dispatch({ type: 'OPTIMISTIC_TOGGLE_TASK', payload: taskId });
      }
    } catch (error) {
      console.error('Error toggling task completion:', error);
      // revert on error
      dispatch({ type: 'OPTIMISTIC_TOGGLE_TASK', payload: taskId });
    }
  };

  // PROJECTS
  const addProject = async (name, description = "") => {
    if (!user || !user.emailVerified) {
      console.error('User not authenticated');
      return null;
    }

    try {
      const token = await getAuthToken();
      const res = await fetchWithTimeout(`${API_BASE_URL}/api/projects`, {
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
    if (!user || !user.emailVerified) {
      console.error('User not authenticated');
      return;
    }

    try {
      const token = await getAuthToken();
      const res = await fetchWithTimeout(`${API_BASE_URL}/api/projects/${project.id}`, {
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
    if (!user || !user.emailVerified) {
      console.error('User not authenticated');
      return;
    }

    try {
      const token = await getAuthToken();
      const res = await fetchWithTimeout(`${API_BASE_URL}/api/projects/${projectId}`, {
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
    if (!user || !user.emailVerified) {
      console.error('User not authenticated');
      return null;
    }

    try {
      const token = await getAuthToken();
      const res = await fetchWithTimeout(`${API_BASE_URL}/api/next-actions`, {
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
    if (!user || !user.emailVerified) {
      console.error('User not authenticated');
      return;
    }

    try {
      const token = await getAuthToken();
      const res = await fetchWithTimeout(`${API_BASE_URL}/api/next-actions/${context.id}`, {
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
    if (!user || !user.emailVerified) {
      console.error('User not authenticated');
      return;
    }

    try {
      const token = await getAuthToken();
      const res = await fetchWithTimeout(`${API_BASE_URL}/api/next-actions/${contextId}`, {
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

  // OPTIMISTIC moveTo
  const moveTo = async (taskId, type, payload) => {
    if (!user || !user.emailVerified) {
      console.error('User not authenticated');
      return;
    }

    try {
      const token = await getAuthToken();
      const prevTask = stateRef.current.tasks.find(t => t.id === taskId);
      if (!prevTask) return;

      let updatedTask = { ...prevTask };

      if (type === 'project' && payload.projectId) {
        updatedTask.projectId = payload.projectId;
      }
      if (type === 'next' && payload.contextId) {
        updatedTask.nextActionId = payload.contextId;
      }

      // Optimistic apply
      dispatch({ type: 'UPDATE_TASK', payload: updatedTask });

      const res = await fetchWithTimeout(`${API_BASE_URL}/api/tasks/${taskId}`, {
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
      } else {
        // revert on server error
        dispatch({ type: 'UPDATE_TASK', payload: prevTask });
        console.error('Error moving task (server response not ok):', data);
      }
    } catch (error) {
      console.error('Error moving task:', error);
      // revert on network error
      const prevTask = stateRef.current.tasks.find(t => t.id === taskId);
      if (prevTask) dispatch({ type: 'UPDATE_TASK', payload: prevTask });
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
        stateRef,
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
