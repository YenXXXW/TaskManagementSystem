const API_BASE_URL = `${process.env.NEXT_PUBLIC_SERVER_URL}/api`;

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
  isOverdue: boolean;
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

export interface AuthResponse {
  status: "success" | "error";
  token: string;
  data: {
    user: {
      _id: string;
      name: string;
      email: string;
      role: string;
      createdAt: string;
      updatedAt: string;
      __v: number;
    };
  }
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
  task?: Task;
  isRead: boolean;
  createdAt: string;
  createdBy: User
}

export interface NotiUpdateData {
  ids: string[]
}

export interface GetTaskByStatusData {
  token: string,
}

export interface GetTasksByStatusResponse {
  pending: Task[],
  inProgress: Task[],
  completed: Task[]
}


export interface GetTasksByPriorityResponse {
  low: Task[],
  medium: Task[],
  high: Task[]
}

export const api = {
  async request<T>(endpoint: string, config: ApiConfig & { token?: string } = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (config.token) {
      headers['Cookie'] = `token=${config.token}`;
    }
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: config.method || 'GET',
      headers,
      body: config.body ? JSON.stringify(config.body) : undefined,
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Something went wrong');
    }

    return response.json();
  },

  tasks: {
    test: () => api.request('/'),
    getAll: (token: string) => api.request<Task[]>('/tasks', { token }),
    getById: (id: string) => api.request<Task>(`/tasks/${id}`),
    create: (data: CreateTaskData) => api.request<Task>('/tasks', { method: 'POST', body: data }),
    update: (id: string, data: UpdateTaskData) => api.request<Task>(`/tasks/${id}`, { method: 'PUT', body: data }),
    delete: (data: DeleteTasksData) => api.request<{ message: string }>(`/tasks/delete`, { method: 'POST', body: data }),
    getByStatus: (data: GetTaskByStatusData) => api.request<GetTasksByStatusResponse>(`/tasks/status`, { token: data.token }),
    getByPriority: (data: GetTaskByStatusData) => api.request<GetTasksByPriorityResponse>(`/tasks/priority`, { token: data.token }),
    search: (searchTerm: string) => api.request<Task[]>(`/tasks/search?search=${encodeURIComponent(searchTerm)}`),
    getNearDeathlineTasks: () => api.request<Task[]>(`/tasks/nearDeathline`)
  },

  auth: {
    login: (data: LoginData) => api.request<AuthResponse>('/auth/login', { method: 'POST', body: data }),
    register: (data: RegisterData) => api.request<{ token: string; user: { _id: string; name: string; email: string } }>('/auth/register', { method: 'POST', body: data }),
    logout: () => api.request('/auth/logout', { method: 'POST' })
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
