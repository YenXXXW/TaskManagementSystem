const API_BASE_URL = 'http://localhost:4000/api';

interface ApiConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface CreateTaskData {
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
}

export interface DeleteTasksData {
  ids: string[]
}

export interface UpdateTaskData {
  updatedBy: string;
  title?: string;
  description?: string;
  status?: 'pending' | 'in-progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  assignedTo?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface Notification {
  _id: string;
  type: 'taskUpdated' | 'taskAssigned' | 'taskCommented';
  message: string;
  task?: {
    _id: string;
    title: string;
  };
  isRead: boolean;
  createdAt: string;
  createdBy: User
}

export interface NotiUpdateData {
  ids: string[]
}

export const api = {
  async request<T>(endpoint: string, config: ApiConfig = {}): Promise<T> {
    const token = localStorage.getItem('token');
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: config.method || 'GET',
      headers: {
        ...defaultHeaders,
        ...config.headers,
      },
      body: config.body ? JSON.stringify(config.body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Something went wrong');
    }

    return response.json();
  },

  tasks: {
    getAll: () => api.request<Task[]>('/tasks'),
    getById: (id: string) => api.request<Task>(`/tasks/${id}`),
    create: (data: CreateTaskData) => api.request<Task>('/tasks', { method: 'POST', body: data }),
    update: (id: string, data: UpdateTaskData) => api.request<Task>(`/tasks/${id}`, { method: 'PUT', body: data }),
    delete: (data: DeleteTasksData) => api.request<{ message: string }>(`/tasks/delete`, { method: 'POST', body: data }),
    getByStatus: (status: string) => api.request<Task[]>(`/tasks/status/${status}`),
    getByPriority: (priority: string) => api.request<Task[]>(`/tasks/priority/${priority}`),
  },

  auth: {
    login: (data: LoginData) => api.request<{ token: string; user: { _id: string; name: string; email: string } }>('/auth/login', { method: 'POST', body: data }),
    register: (data: RegisterData) => api.request<{ token: string; user: { _id: string; name: string; email: string } }>('/auth/register', { method: 'POST', body: data }),
  },

  users: {
    getAll: () => api.request<User[]>('/users'),
  },

  notis: {
    getAll: (userId: string) => api.request<Notification[]>(`/notifications/${userId}`),
    markRead: (data: NotiUpdateData) => api.request<Notification[]>(`/notifications/read`, {
      method: 'PUT', body: data
    }),
  }

}; 
