# Blood Pressure Monitoring Application

## Overview

This is a comprehensive blood pressure monitoring application built with a full-stack TypeScript architecture. The application allows users to track blood pressure readings, manage multiple patient profiles, view statistics and trends, and generate reports. It features a modern web interface with medical-grade design principles, supporting features like data visualization, reminder management, and comprehensive health analytics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with a custom medical-themed color palette
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation
- **Charts**: Chart.js for data visualization and custom chart components

### Backend Architecture  
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses
- **Error Handling**: Centralized error middleware with structured error responses
- **Request Logging**: Custom middleware for API request/response logging
- **Development**: Hot reload with Vite integration in development mode

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Cloud Provider**: Neon Database (serverless PostgreSQL)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Development Storage**: In-memory storage implementation for development/testing
- **Data Models**: Profiles, blood pressure readings, and reminders with full type safety

### Database Schema Design
- **Profiles Table**: User demographics, medical conditions, and active status
- **Blood Pressure Readings Table**: Systolic/diastolic values, pulse, calculated metrics, and classifications
- **Reminders Table**: Medication and appointment reminders with scheduling options
- **Relationships**: Foreign key constraints ensuring data integrity between profiles and their associated data

### Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL session store
- **Profile System**: Multi-user support with active profile switching
- **Data Isolation**: Profile-based data access control ensuring users only see their own data

### API Architecture
- **Endpoints**: RESTful design with consistent response formats
- **Validation**: Zod schemas for request/response validation
- **Error Handling**: Structured error responses with appropriate HTTP status codes
- **Data Transformation**: Automatic calculation of blood pressure classifications and derived metrics

### Frontend State Management
- **Server State**: TanStack Query for caching, synchronization, and optimistic updates
- **Form State**: React Hook Form for complex form validation and submission
- **UI State**: React state for component-level interactions and modal management
- **Global State**: Query client for cross-component data sharing

### Component Architecture
- **Design System**: Consistent component library based on Shadcn/ui
- **Composition**: Reusable components with proper separation of concerns
- **Accessibility**: ARIA compliance through Radix UI primitives
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints

### Data Visualization
- **Chart Library**: Chart.js for interactive blood pressure trend charts
- **Custom Components**: Distribution charts for blood pressure classification analysis
- **Export Features**: PDF and CSV report generation with medical formatting
- **Real-time Updates**: Automatic chart updates when new readings are added

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Hook Form, TanStack Query
- **TypeScript**: Full type safety across frontend and backend
- **Vite**: Fast development server and optimized production builds
- **Express.js**: Backend web framework with middleware support

### Database and ORM
- **Drizzle ORM**: Type-safe database operations and schema management
- **Neon Database**: Serverless PostgreSQL hosting
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### UI and Styling
- **Radix UI**: Accessible component primitives (30+ components)
- **Tailwind CSS**: Utility-first CSS framework with custom medical theme
- **Lucide React**: Consistent icon library
- **Class Variance Authority**: Type-safe component variants

### Data Visualization and Reports
- **Chart.js**: Interactive charts for blood pressure trends
- **jsPDF**: PDF generation for medical reports
- **date-fns**: Date manipulation and formatting utilities

### Development and Build Tools
- **ESBuild**: Fast TypeScript compilation for production
- **PostCSS**: CSS processing with Tailwind
- **Replit Integration**: Development environment optimizations

### Validation and Type Safety
- **Zod**: Runtime type validation and schema definition
- **drizzle-zod**: Automatic Zod schema generation from database schemas
- **TypeScript**: Compile-time type checking across the entire application

### Session and State Management
- **Express Session**: Server-side session management
- **Wouter**: Lightweight client-side routing
- **Nanoid**: Secure unique ID generation