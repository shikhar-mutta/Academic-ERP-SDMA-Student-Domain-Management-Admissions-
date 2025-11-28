# Academic ERP - Frontend

Student Admissions Portal frontend application built with React, TypeScript, Vite, and Tailwind CSS.

## Features

- **Google OAuth Authentication** - Server-side OAuth flow with role-based access control
- **Student Admission** - Add new students with photo upload and automatic roll number generation
- **Student Management** - View and search through admitted students
- **Modern UI** - Beautiful, responsive design with smooth animations

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Environment Variables

Create a `.env` file in the root directory:

```
VITE_API_BASE_URL=http://localhost:8080
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## Project Structure

```
src/
├── components/     # Reusable components
├── context/        # React context providers
├── hooks/          # Custom React hooks
├── pages/          # Page components
├── services/       # API service layer
└── types/          # TypeScript type definitions
```
