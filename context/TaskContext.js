import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../apiConfig';

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

  // Fetch all data from backend on app start
    const fetchAll = async () => {
      const token = await AsyncStorage.getItem('token');
      // Fetch tasks
      const tasksRes = await fetch(`${API_BASE_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const tasksData = await tasksRes.json();
      if (tasksRes.ok && Array.isArray(tasksData.tasks)) {
        dispatch({ type: 'SET_TASKS', payload: tasksData.tasks });
      }
      // Fetch projects
      const projectsRes = await fetch(`${API_BASE_URL}/api/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const projectsData = await projectsRes.json();
      if (projectsRes.ok && Array.isArray(projectsData.projects)) {
        dispatch({ type: 'SET_PROJECTS', payload: projectsData.projects });
      }
      // Fetch next-actions/contexts
      const contextsRes = await fetch(`${API_BASE_URL}/api/next-actions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const contextsData = await contextsRes.json();
      if (contextsRes.ok && Array.isArray(contextsData.nextActions)) {
        dispatch({ type: 'SET_CONTEXTS', payload: contextsData.nextActions });
      }
    };
    
    useEffect(() => {
    fetchAll();
  }, []);

  // TASKS
  const addTask = async (title, description, dueDate, priority, category = 'inbox', projectId = null, nextActionId = null) => {
    const token = await AsyncStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        description,
        dueDate,
        priority,
        category,
        projectId,
        nextActionId,
      }),
    });
    const data = await res.json();
    if (res.ok && data.task) {
      dispatch({ type: 'ADD_TASK', payload: data.task });
    }
  };

  const updateTask = async (updatedTask) => {
    const token = await AsyncStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/api/tasks/${updatedTask.id}`, {
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
  };

  const deleteTask = async (taskId) => {
    const token = await AsyncStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      dispatch({ type: 'DELETE_TASK', payload: taskId });
    }
  };

  const toggleComplete = async (taskId) => {
    const token = await AsyncStorage.getItem('token');
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

    const res = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
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
  };

  // PROJECTS
  const addProject = async (name, description = "") => {
    const token = await AsyncStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/api/projects`, {
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
  };

  const updateProject = async (project) => {
    const token = await AsyncStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/api/projects/${project.id}`, {
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
  };

  const deleteProject = async (projectId) => {
    const token = await AsyncStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      dispatch({ type: 'DELETE_PROJECT_AND_TASKS', payload: projectId });
    }
  };

  // NEXT-ACTIONS / CONTEXTS
  const addContext = async (context_name) => {
    const token = await AsyncStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/api/next-actions`, {
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
  };

  const updateContext = async (context) => {
    const token = await AsyncStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/api/next-actions/${context.id}`, {
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
  };

  const deleteContext = async (contextId) => {
    const token = await AsyncStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/api/next-actions/${contextId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      dispatch({ type: 'DELETE_CONTEXT', payload: contextId });
    }
  };

  const moveTo = async (taskId, type, payload) => {
    const token = await AsyncStorage.getItem('token');
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

    const res = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
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
