# DesignReview - Digital Design Review System

A modern, professional digital design review system for engineering drawings, inspired by Bluebeam and CoLab Software. Built with React, Tailwind CSS, and FastAPI.

![DesignReview System](https://img.shields.io/badge/Status-Prototype-blue)
![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?logo=fastapi)
![Tailwind](https://img.shields.io/badge/Tailwind-3.3-38B2AC?logo=tailwind-css)

## 🎯 Overview

DesignReview is a comprehensive prototype for reviewing and annotating engineering drawings with a focus on:

- **Intuitive UX/UI**: Industrial blueprint aesthetic meets modern tech
- **Collaborative Review**: Real-time annotations and threaded discussions
- **Version Control**: Track changes across drawing revisions
- **Engineering-First**: Built with structural, mechanical, and civil engineers in mind

## ✨ Core Features

### 📐 Drawing Viewer
- **Pan & Zoom**: Smooth navigation with mouse controls
- **Grid-based Layout**: Blueprint-style technical display
- **Mock Drawing Elements**: Structural elements, dimensions, and title blocks

### 🖊️ Annotation Tools
- **Comment**: Add text-based feedback anywhere on the drawing
- **Highlight**: Emphasize specific areas
- **Measurement**: Mark dimensions and distances
- **Stamp**: Apply approval/rejection stamps
- **Arrow**: Point to specific elements
- **Rectangle**: Create bounding boxes for areas of interest

### 💬 Collaboration
- **Threaded Discussions**: Reply to annotations
- **User Attribution**: Every comment tracked to its author
- **Resolution Tracking**: Mark issues as resolved
- **Status Indicators**: Visual feedback for annotation states

### 📊 Version Management
- **Version History**: View all revisions of a drawing
- **Change Summaries**: Track what changed between versions
- **Version Comparison**: (Stubbed) Compare different versions side-by-side
- **Status Workflow**: Draft → In Review → Approved/Rejected/Needs Revision

### 🎨 Design System
- **Color Palette**: Industrial blues with cyan accents
- **Typography**: Outfit (UI) + JetBrains Mono (technical data)
- **Component Library**: Reusable, consistent UI elements
- **Responsive Layout**: Sidebar, toolbar, viewer, and panels

## 🏗️ Architecture

```
design-review-system/
├── backend/                 # FastAPI Backend
│   ├── main.py             # API routes, models, mock data
│   └── requirements.txt    # Python dependencies
│
└── frontend/               # React Frontend
    ├── src/
    │   ├── App.tsx         # Main application component
    │   ├── main.tsx        # React entry point
    │   └── index.css       # Tailwind styles
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── tsconfig.json
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.8+
- **pip** package manager

### Backend Setup

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python main.py
```

The API will be available at `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Alternative docs: `http://localhost:8000/redoc`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The application will open at `http://localhost:3000`

## 📡 API Endpoints

### Projects
- `GET /api/projects` - List all projects
- `GET /api/projects/{id}` - Get project details

### Drawings
- `GET /api/drawings` - List all drawings (optional: `?project_id=xxx`)
- `GET /api/drawings/{id}` - Get drawing details
- `GET /api/drawings/{id}/versions` - Get version history

### Annotations
- `GET /api/drawings/{id}/annotations` - Get annotations (optional: `?version_id=xxx`)
- `POST /api/annotations` - Create new annotation
- `PUT /api/annotations/{id}/resolve` - Mark annotation as resolved
- `POST /api/annotations/{id}/replies` - Add reply to annotation

### Workflows
- `GET /api/workflows` - List review workflows
- `PUT /api/workflows/{id}/status` - Update workflow status

### Users
- `GET /api/users` - List all users
- `GET /api/users/me` - Get current user

## 🎮 User Guide

### Basic Workflow

1. **Select a Project**: Click on a project in the sidebar
2. **Choose a Drawing**: Select a drawing to review
3. **Add Annotations**: 
   - Click on an annotation tool in the toolbar
   - Click and drag on the drawing to create the annotation
   - Enter your comment when prompted
4. **View Annotations**: Click on any annotation marker to see details
5. **Discuss**: Add replies to annotations
6. **Resolve**: Mark annotations as resolved when addressed
7. **Version Control**: Click the clock icon to view version history

### Navigation

- **Pan**: Click and drag (when no tool is selected)
- **Zoom**: Use zoom controls in top-right corner
- **Search**: Use search bar to find drawings quickly

### Annotation Types

| Tool | Icon | Use Case |
|------|------|----------|
| Comment | 💬 | General feedback and questions |
| Highlight | 🖍️ | Emphasize areas of concern |
| Measurement | 📏 | Dimension verification |
| Stamp | ✓ | Approval/rejection marks |
| Arrow | → | Point to specific elements |
| Rectangle | ▢ | Area selection |

## 🎨 Design Philosophy

The UI follows an "Industrial Blueprint meets Modern Tech" aesthetic:

- **Color Scheme**: Deep slate backgrounds with cyan/blue accents
- **Typography**: Clean, modern fonts with monospace for technical data
- **Layout**: Grid-based precision with asymmetric information panels
- **Interactions**: Smooth transitions and hover states
- **Visual Hierarchy**: Clear distinction between primary and secondary actions

## 🔧 Technical Stack

### Frontend
- **React 18**: Component-based UI
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Vite**: Fast build tool and dev server
- **Lucide React**: Consistent icon library

### Backend
- **FastAPI**: Modern Python web framework
- **Pydantic**: Data validation
- **Uvicorn**: ASGI server
- **CORS Middleware**: Cross-origin support

## 📝 Data Models

### Key Entities

```typescript
User {
  id, name, email, role, avatar
}

Project {
  id, name, description, drawings[], team_members[]
}

Drawing {
  id, title, description, project_id,
  current_version, versions[], created_at, updated_at
}

Version {
  id, version_number, created_at, created_by,
  file_url, changes_summary, status
}

Annotation {
  id, drawing_id, version_id, type, author,
  content, position, created_at, resolved, replies[]
}
```

## 🔮 Future Enhancements

### Planned Features
- [ ] Real file upload and storage (PDFs, DWGs)
- [ ] Actual PDF/DWG rendering
- [ ] Real-time collaboration with WebSockets
- [ ] Version comparison (side-by-side, overlay)
- [ ] Advanced measurement tools (area, angles)
- [ ] Export annotations to PDF
- [ ] Email notifications
- [ ] Mobile-responsive design
- [ ] Offline support
- [ ] Integration with external tools (Procore, BIM 360)

### Technical Improvements
- [ ] Database integration (PostgreSQL)
- [ ] Authentication & authorization (JWT)
- [ ] File storage (S3, Azure Blob)
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Automated testing
- [ ] Performance optimization
- [ ] Accessibility (WCAG 2.1)

## 🎯 Key Decisions & Rationale

### Why This Tech Stack?

1. **React + TypeScript**: 
   - Industry-standard for complex UIs
   - Type safety prevents bugs
   - Large ecosystem of tools

2. **Tailwind CSS**: 
   - Rapid prototyping
   - Consistent design system
   - Easy customization

3. **FastAPI**: 
   - Modern Python framework
   - Auto-generated API docs
   - Fast development
   - Type hints with Pydantic

4. **Vite**: 
   - Lightning-fast HMR
   - Optimized builds
   - Modern tooling

### UX Design Choices

1. **Left Sidebar Navigation**: 
   - Familiar pattern for document management
   - Easy project/drawing switching
   - Hierarchical information display

2. **Persistent Toolbar**: 
   - Quick access to annotation tools
   - Context-aware actions
   - Visual tool state

3. **Floating Panels**: 
   - Non-intrusive information display
   - Focus on drawing content
   - Dismissible UI elements

4. **Color-Coded Annotations**: 
   - Quick visual identification
   - Type-specific colors
   - Status indicators

## 🐛 Known Limitations

This is a **prototype** with mock data:

- No actual PDF/DWG rendering
- No real file upload
- No persistence (data resets on server restart)
- No authentication
- No real-time updates
- Limited error handling
- Desktop-only (not mobile optimized)

## 📚 Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

## 👥 Team Collaboration Features

The system supports multiple user roles:

- **Admin**: Full project management
- **Engineer**: Create and update drawings
- **Reviewer**: Add annotations and feedback
- **Viewer**: Read-only access

## 🔒 Security Considerations

For production deployment, implement:

- User authentication (OAuth 2.0, JWT)
- Role-based access control (RBAC)
- API rate limiting
- Input validation and sanitization
- HTTPS/TLS encryption
- Secure file storage
- Audit logging

## 🌟 Highlights

This prototype demonstrates:

✅ **Clean Architecture**: Separation of concerns, modular design
✅ **Type Safety**: TypeScript + Pydantic models
✅ **RESTful API**: Standard HTTP methods and status codes
✅ **Responsive UI**: Smooth interactions and animations
✅ **Professional Design**: Engineering-focused aesthetic
✅ **Extensible**: Easy to add new features
✅ **Well-Documented**: Clear code comments and README

## 📧 Contact

For questions or feedback about this prototype, please reach out or check the API docs at `http://localhost:8000/docs`

---

**Built with ❤️ for engineers who review complex technical drawings**
