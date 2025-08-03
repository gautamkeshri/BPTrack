# Blood Pressure Monitoring Application

## Overview

This is a comprehensive blood pressure monitoring application built with a full-stack TypeScript architecture. The application allows users to track blood pressure readings, manage multiple patient profiles, view statistics and trends, and generate medical-grade reports. It features a modern web interface with medical-grade design principles, supporting features like data visualization, reminder management, and comprehensive health analytics following ACC/AHA 2017 guidelines.

## Recent Changes (January 2025)

### Application Status: Production Ready ✅
- **Complete Feature Set**: All core functionality implemented and tested
- **Medical Compliance**: Full ACC/AHA 2017 guideline implementation
- **Multi-User Support**: Profile management with data isolation
- **Report Generation**: PDF and CSV exports for healthcare providers
- **Data Visualization**: Interactive charts and statistical analysis
- **TypeScript Errors**: All resolved and application running cleanly

### MySQL Database Migration ✅
- **Database Backend**: Migrated from PostgreSQL to MySQL
- **Schema Files**: Complete SQL schema with tables, views, and stored procedures
- **Test Data**: Comprehensive test dataset with 5 users, 7 profiles, 90+ readings
- **Simple Authentication**: Common password "bloodpressure123" for all test users
- **Production Ready**: MySQL connection pooling and optimized performance

### Comprehensive Documentation Created
- **README.md**: Complete setup and feature overview
- **Technical Specification**: Detailed architecture and implementation
- **API Documentation**: Full REST API reference with examples  
- **Deployment Guide**: Multi-platform deployment instructions
- **Medical Guidelines**: Clinical standards and ACC/AHA compliance details
- **User Guide**: End-user documentation for all features
- **Database Documentation**: MySQL setup, test credentials, and maintenance guides

## Documentation Structure

The project includes comprehensive documentation in the `/docs` folder:

### Core Documentation Files
- **README.md**: Project overview, features, quick start, and technical architecture
- **docs/TECHNICAL_SPECIFICATION.md**: Detailed system architecture, data models, and implementation details
- **docs/API_DOCUMENTATION.md**: Complete REST API reference with examples and error codes
- **docs/DEPLOYMENT_GUIDE.md**: Multi-platform deployment instructions and environment setup
- **docs/MEDICAL_GUIDELINES.md**: ACC/AHA 2017 compliance details and clinical standards
- **docs/USER_GUIDE.md**: End-user documentation for all application features

### Documentation Standards
- **Medical Compliance**: All documentation includes ACC/AHA 2017 guideline references
- **Technical Accuracy**: Code examples and API references tested and validated
- **User-Friendly**: Clear instructions for both technical and non-technical users
- **Production Ready**: Includes deployment, security, and maintenance guidance

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
- **Database**: MySQL with Drizzle ORM for type-safe database operations
- **Connection**: mysql2 driver with connection pooling for optimal performance
- **Schema Management**: Complete SQL files with schema and test data
- **Development Storage**: In-memory storage implementation for development/testing
- **Data Models**: Profiles, blood pressure readings, and reminders with full type safety
- **Test Data**: Comprehensive test dataset with common password "bloodpressure123" for all users

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
- **MySQL Database**: Production MySQL database with connection pooling
- **mysql2**: Fast MySQL driver with promise support
- **Database Files**: Complete SQL schema and test data with common passwords

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