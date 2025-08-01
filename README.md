# Personal Task Manager

A modern, full-stack task management application built with Next.js, Express.js, Prisma, and Neon PostgreSQL. This is a Todoist-like application that allows users to manage projects and tasks with a beautiful, responsive interface.

## 🚀 Features

- **User Authentication**: Secure signup/login with JWT tokens
- **Project Management**: Create, edit, and delete projects
- **Task Management**: Full CRUD operations for tasks
- **Task Filtering**: Filter tasks by all, active, or completed status
- **Dashboard Statistics**: Overview of projects and task completion
- **Responsive Design**: Beautiful UI built with Tailwind CSS
- **Real-time Updates**: Instant updates across the application

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Axios** - HTTP client

### Backend
- **Express.js** - Node.js web framework
- **Prisma** - Modern database toolkit
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Database
- **Neon PostgreSQL** - Serverless PostgreSQL database

## 📦 Project Structure

```
/
├── backend/
│   ├── routes/
│   │   ├── authRoutes.js      # Authentication endpoints
│   │   └── taskRoutes.js      # Task and project endpoints
│   ├── middleware/
│   │   └── auth.js            # JWT authentication middleware
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   ├── index.js               # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/     # Dashboard page
│   │   │   ├── login/         # Login page
│   │   │   ├── register/      # Register page
│   │   │   └── layout.tsx     # Root layout
│   │   ├── components/
│   │   │   ├── Layout.tsx     # Main layout component
│   │   │   ├── ProjectSidebar.tsx
│   │   │   └── TaskList.tsx
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   └── services/
│   │       └── api.ts         # API service layer
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Neon PostgreSQL database (free tier available)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd personal-task-manager
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
DATABASE_URL="postgresql://username:password@hostname:port/database?sslmode=require"
JWT_SECRET="your-super-secret-jwt-key-here"
PORT=3001
```

```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Start the server
npm run dev
```

The backend will be running on `http://localhost:3001`

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create environment file (optional)
echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > .env.local

# Start the development server
npm run dev
```

The frontend will be running on `http://localhost:3000`

## 🗄 Database Schema

```prisma
model User {
  id       Int       @id @default(autoincrement())
  email    String    @unique
  password String
  projects Project[]
}

model Project {
  id      Int     @id @default(autoincrement())
  name    String
  userId  Int
  user    User    @relation(fields: [userId], references: [id])
  tasks   Task[]
}

model Task {
  id        Int      @id @default(autoincrement())
  title     String
  completed Boolean  @default(false)
  projectId Int
  project   Project  @relation(fields: [projectId], references: [id])
  createdAt DateTime @default(now())
}
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Projects
- `GET /api/projects` - Get all user projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/projects/:id/tasks` - Get project tasks (with filtering)
- `POST /api/projects/:id/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## 🎨 Features Overview

### Authentication
- Secure user registration and login
- JWT-based authentication
- Password hashing with bcrypt
- Protected routes

### Project Management
- Create multiple projects (e.g., Work, Personal)
- Edit project names
- Delete projects (with confirmation)
- Project task counters

### Task Management
- Create tasks within projects
- Mark tasks as complete/incomplete
- Edit task titles
- Delete tasks
- Task creation timestamps

### Filtering & Views
- Filter tasks: All, Active, Completed
- Real-time task counters
- Dashboard statistics overview

### User Experience
- Responsive design for all devices
- Smooth animations and transitions
- Intuitive drag-and-drop-like interactions
- Loading states and error handling
- Confirmation dialogs for destructive actions

## 🔮 Future Enhancements

- **Drag & Drop**: Reorder tasks and move between projects
- **Due Dates**: Add deadline management
- **Categories/Tags**: Organize tasks with labels
- **Notifications**: Email or browser notifications
- **Collaboration**: Share projects with other users
- **Mobile App**: React Native or PWA version
- **Analytics**: Advanced task completion analytics
- **Dark Mode**: Theme switching
- **Bulk Operations**: Select and manage multiple tasks
- **Task Templates**: Predefined task sets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by Todoist and other task management applications
- Icons provided by Lucide React
- UI components styled with Tailwind CSS