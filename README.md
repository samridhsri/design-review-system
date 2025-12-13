# Digital Design Review System

A professional prototype for reviewing and annotating engineering drawings, built with React, TypeScript, Tailwind CSS, and FastAPI.

---

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+

### Installation (5 minutes)

**1. Start Backend**
```bash
cd backend
pip install -r requirements.txt
python main.py
```
✅ API running at http://localhost:8000

**2. Start Frontend** (new terminal)
```bash
cd frontend
npm install
npm run dev
```
✅ App running at http://localhost:3000

### First Steps
1. App opens automatically
2. Click "Manhattan Bridge Renovation" project
3. Select "Foundation Plan - Level B2" drawing
4. Click "Comment" tool and drag on the drawing
5. Enter your comment and see it appear
6. Click annotation markers to view details

---

## Core Features

### 💬 Collaboration
- Threaded discussions on annotations
- Reply to comments
- Resolve/unresolve tracking
- User attribution

### 📊 Version Control
- Version history with changes
- Status workflow (Draft → In Review → Approved)
- Compare versions (stubbed)

### 📐 Drawing Viewer
- **Pan & Zoom**: Smooth navigation with mouse controls
- **PDF Upload**: Upload and view PDF drawings directly
- **Real PDF Rendering**: Display actual PDF files in the viewer
- **Grid-based Layout**: Blueprint-style technical display

### 🖊️ Annotation Tools
- **Comment**: Add text-based feedback anywhere on the drawing
- **Highlight**: Emphasize specific areas
- **Measurement**: Mark dimensions and distances
- **Stamp**: Apply approval/rejection stamps
- **Arrow**: Point to specific elements
- **Rectangle**: Create bounding boxes for areas of interest

---

## Project Structure

```
design-review-system/
├── backend/
│   ├── main.py              # FastAPI app with 15+ endpoints
│   └── requirements.txt     # Python dependencies
│
└── frontend/
    ├── src/
    │   ├── App.tsx         # Main React application
    │   ├── main.tsx        # Entry point
    │   └── index.css       # Tailwind styles
    ├── package.json
    └── [config files]
```

---

## Tech Stack

**Frontend**
- React 18 (UI framework)
- TypeScript (type safety)
- Tailwind CSS (styling)
- Vite (build tool)
- Lucide React (icons)

**Backend**
- FastAPI (web framework)
- Pydantic (data validation)
- Uvicorn (ASGI server)

---

## API Documentation

Visit http://localhost:8000/docs for interactive API documentation.

**Key Endpoints:**
- `GET /api/projects` - List projects
- `GET /api/drawings` - List drawings
- `GET /api/annotations` - List annotations
- `POST /api/annotations` - Create annotation
- `PUT /api/annotations/{id}/resolve` - Mark resolved

---

## Mock Data

Pre-loaded with:
- 2 projects (Manhattan Bridge, Hudson Yards)
- 2 drawings (Foundation Plan, Structural Framing)
- 3 annotations (comment, measurement, stamp)
- 3 users (Engineer, Reviewer, Admin)

---

## Common Issues

**Backend won't start**
```bash
python --version  # Check Python 3.8+
pip install -r requirements.txt --upgrade
```

**Frontend won't start**
```bash
node --version  # Check Node 18+
rm -rf node_modules package-lock.json
npm install
```

**CORS errors**
- Ensure backend is on port 8000
- Ensure frontend is on port 3000


---

## Usage Guide

### Adding Annotations
1. Click tool in toolbar (e.g., "Comment")
2. Tool highlights in cyan
3. Click and drag on drawing to define area
4. Enter content in dialog
5. Annotation appears with colored marker

### Viewing Annotations
1. Click any annotation marker
2. Panel opens on right
3. View author, content, replies
4. Add replies or resolve

### Version History
1. Click clock icon (bottom-left)
2. View all versions
3. See change summaries and status
4. Click version to load (stubbed)

### Navigation
- **Pan**: Click and drag drawing (no tool selected)
- **Zoom**: Use +/- buttons (top-right)
- **Search**: Type in sidebar search bar
- **Switch drawings**: Click in sidebar

---

## Design Highlights

### Aesthetic: "Industrial Blueprint meets Modern Tech"

**Colors**
- Deep slate backgrounds (professional)
- Cyan accents (technical, blueprint-inspired)
- Color-coded annotations

**Typography**
- Outfit (modern UI text)
- JetBrains Mono (technical data)

**Layout**
- Fixed sidebar (navigation)
- Top toolbar (tools)
- Center viewer (drawing)
- Floating panels (details)

---

## Known Limitations

This is a **prototype** with some limitations:

- ✅ PDF upload and viewing now supported
- No persistence (data resets on server restart)
- No DWG file support (PDF only)

**By design** - focuses on UX validation before production investment.

---

## Support

**Documentation:**
- This file (basics)
- TECHNICAL_APPROACH.md (design decisions)
- Backend API docs at /docs endpoint

**Code:**
- All code in 2 files (App.tsx, main.py)
- Inline comments explain complex logic
- TypeScript types document data structures

---
