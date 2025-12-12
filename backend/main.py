from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum
import uuid
import os
import shutil
from pathlib import Path

app = FastAPI(title="Design Review System API", version="1.0.0")

# Create uploads directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for serving PDFs
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ==================== Models ====================

class UserRole(str, Enum):
    ADMIN = "admin"
    ENGINEER = "engineer"
    REVIEWER = "reviewer"
    VIEWER = "viewer"

class AnnotationType(str, Enum):
    COMMENT = "comment"
    HIGHLIGHT = "highlight"
    MEASUREMENT = "measurement"
    STAMP = "stamp"
    ARROW = "arrow"
    RECTANGLE = "rectangle"

class ReviewStatus(str, Enum):
    DRAFT = "draft"
    IN_REVIEW = "in_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    NEEDS_REVISION = "needs_revision"

class User(BaseModel):
    id: str
    name: str
    email: str
    role: UserRole
    avatar: Optional[str] = None

class Annotation(BaseModel):
    id: str
    drawing_id: str
    version_id: str
    type: AnnotationType
    author: User
    content: str
    position: dict  # {x, y, width, height}
    created_at: datetime
    updated_at: datetime
    resolved: bool = False
    replies: List['AnnotationReply'] = []

class AnnotationReply(BaseModel):
    id: str
    author: User
    content: str
    created_at: datetime

class Version(BaseModel):
    id: str
    version_number: int
    created_at: datetime
    created_by: User
    file_url: str
    changes_summary: Optional[str] = None
    status: ReviewStatus

class Drawing(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    project_id: str
    current_version: Version
    versions: List[Version]
    created_at: datetime
    updated_at: datetime

class Project(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    drawings: List[Drawing]
    team_members: List[User]
    created_at: datetime

class ReviewWorkflow(BaseModel):
    id: str
    drawing_id: str
    version_id: str
    status: ReviewStatus
    reviewers: List[User]
    due_date: Optional[datetime] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

# ==================== Mock Data ====================

# Mock users
USERS = [
    User(
        id="user-1",
        name="Alex Chen",
        email="alex.chen@example.com",
        role=UserRole.ENGINEER,
        avatar="AC"
    ),
    User(
        id="user-2",
        name="Jordan Smith",
        email="jordan.smith@example.com",
        role=UserRole.REVIEWER,
        avatar="JS"
    ),
    User(
        id="user-3",
        name="Sam Rivera",
        email="sam.rivera@example.com",
        role=UserRole.ADMIN,
        avatar="SR"
    ),
]

# Mock projects with drawings
PROJECTS = [
    Project(
        id="proj-1",
        name="Manhattan Bridge Renovation",
        description="Structural upgrades and modernization",
        drawings=[],
        team_members=USERS,
        created_at=datetime(2024, 1, 15)
    ),
    Project(
        id="proj-2",
        name="Hudson Yards Tower C",
        description="Commercial high-rise development",
        drawings=[],
        team_members=USERS[:2],
        created_at=datetime(2024, 2, 1)
    ),
]

# Mock versions
VERSION_1 = Version(
    id="ver-1-1",
    version_number=1,
    created_at=datetime(2024, 10, 1),
    created_by=USERS[0],
    file_url="/api/files/drawing-1-v1.pdf",
    status=ReviewStatus.APPROVED
)

VERSION_2 = Version(
    id="ver-1-2",
    version_number=2,
    created_at=datetime(2024, 11, 15),
    created_by=USERS[0],
    file_url="/api/files/drawing-1-v2.pdf",
    changes_summary="Updated load calculations and beam specifications",
    status=ReviewStatus.IN_REVIEW
)

# Mock drawings
DRAWINGS = [
    Drawing(
        id="draw-1",
        title="Foundation Plan - Level B2",
        description="Detailed foundation and basement level structural plan",
        project_id="proj-1",
        current_version=VERSION_2,
        versions=[VERSION_1, VERSION_2],
        created_at=datetime(2024, 10, 1),
        updated_at=datetime(2024, 11, 15)
    ),
    Drawing(
        id="draw-2",
        title="Structural Framing - Level 15",
        description="Steel framing and column layout",
        project_id="proj-1",
        current_version=VERSION_1,
        versions=[VERSION_1],
        created_at=datetime(2024, 10, 5),
        updated_at=datetime(2024, 10, 5)
    ),
]

PROJECTS[0].drawings = DRAWINGS

# Mock annotations
ANNOTATIONS = [
    Annotation(
        id="ann-1",
        drawing_id="draw-1",
        version_id="ver-1-2",
        type=AnnotationType.COMMENT,
        author=USERS[1],
        content="Please verify the rebar spacing in grid A-3. Seems tighter than spec.",
        position={"x": 450, "y": 320, "width": 200, "height": 100},
        created_at=datetime(2024, 11, 16, 10, 30),
        updated_at=datetime(2024, 11, 16, 10, 30),
        resolved=False,
        replies=[
            AnnotationReply(
                id="reply-1",
                author=USERS[0],
                content="Good catch! Will update to match detail 3/A2.1",
                created_at=datetime(2024, 11, 16, 14, 15)
            )
        ]
    ),
    Annotation(
        id="ann-2",
        drawing_id="draw-1",
        version_id="ver-1-2",
        type=AnnotationType.MEASUREMENT,
        author=USERS[0],
        content="12'-6\" clear height verified",
        position={"x": 200, "y": 150, "width": 150, "height": 80},
        created_at=datetime(2024, 11, 15, 9, 0),
        updated_at=datetime(2024, 11, 15, 9, 0),
        resolved=True,
        replies=[]
    ),
    Annotation(
        id="ann-3",
        drawing_id="draw-1",
        version_id="ver-1-2",
        type=AnnotationType.STAMP,
        author=USERS[1],
        content="APPROVED",
        position={"x": 650, "y": 100, "width": 120, "height": 60},
        created_at=datetime(2024, 11, 17, 16, 45),
        updated_at=datetime(2024, 11, 17, 16, 45),
        resolved=True,
        replies=[]
    ),
]

# Mock workflows
WORKFLOWS = [
    ReviewWorkflow(
        id="wf-1",
        drawing_id="draw-1",
        version_id="ver-1-2",
        status=ReviewStatus.IN_REVIEW,
        reviewers=[USERS[1]],
        due_date=datetime(2024, 11, 30),
        created_at=datetime(2024, 11, 15),
    )
]

# ==================== API Endpoints ====================

@app.get("/")
async def root():
    return {
        "message": "Design Review System API",
        "version": "1.0.0",
        "docs": "/docs"
    }

# Projects
@app.get("/api/projects", response_model=List[Project])
async def get_projects():
    return PROJECTS

@app.get("/api/projects/{project_id}", response_model=Project)
async def get_project(project_id: str):
    project = next((p for p in PROJECTS if p.id == project_id), None)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

# Drawings
@app.get("/api/drawings", response_model=List[Drawing])
async def get_drawings(project_id: Optional[str] = None):
    if project_id:
        return [d for d in DRAWINGS if d.project_id == project_id]
    return DRAWINGS

@app.get("/api/drawings/{drawing_id}", response_model=Drawing)
async def get_drawing(drawing_id: str):
    drawing = next((d for d in DRAWINGS if d.id == drawing_id), None)
    if not drawing:
        raise HTTPException(status_code=404, detail="Drawing not found")
    return drawing

# Annotations
@app.get("/api/drawings/{drawing_id}/annotations", response_model=List[Annotation])
async def get_annotations(drawing_id: str, version_id: Optional[str] = None):
    annotations = [a for a in ANNOTATIONS if a.drawing_id == drawing_id]
    if version_id:
        annotations = [a for a in annotations if a.version_id == version_id]
    return annotations

class CreateAnnotationRequest(BaseModel):
    drawing_id: str
    version_id: str
    type: AnnotationType
    content: str
    position: dict
    author_id: Optional[str] = "user-1"

@app.post("/api/annotations", response_model=Annotation)
async def create_annotation(request: CreateAnnotationRequest):
    author = next((u for u in USERS if u.id == request.author_id), USERS[0])
    new_annotation = Annotation(
        id=f"ann-{len(ANNOTATIONS) + 1}",
        drawing_id=request.drawing_id,
        version_id=request.version_id,
        type=request.type,
        author=author,
        content=request.content,
        position=request.position,
        created_at=datetime.now(),
        updated_at=datetime.now(),
        resolved=False,
        replies=[]
    )
    ANNOTATIONS.append(new_annotation)
    return new_annotation

@app.put("/api/annotations/{annotation_id}/resolve")
async def resolve_annotation(annotation_id: str):
    annotation = next((a for a in ANNOTATIONS if a.id == annotation_id), None)
    if not annotation:
        raise HTTPException(status_code=404, detail="Annotation not found")
    annotation.resolved = True
    return annotation

@app.put("/api/annotations/{annotation_id}/unresolve")
async def unresolve_annotation(annotation_id: str):
    annotation = next((a for a in ANNOTATIONS if a.id == annotation_id), None)
    if not annotation:
        raise HTTPException(status_code=404, detail="Annotation not found")
    annotation.resolved = False
    return annotation

@app.delete("/api/annotations/{annotation_id}")
async def delete_annotation(annotation_id: str):
    global ANNOTATIONS
    annotation = next((a for a in ANNOTATIONS if a.id == annotation_id), None)
    if not annotation:
        raise HTTPException(status_code=404, detail="Annotation not found")
    ANNOTATIONS = [a for a in ANNOTATIONS if a.id != annotation_id]
    return {"message": "Annotation deleted successfully", "id": annotation_id}

@app.post("/api/annotations/{annotation_id}/replies", response_model=Annotation)
async def add_reply(annotation_id: str, content: str, author_id: str = "user-1"):
    annotation = next((a for a in ANNOTATIONS if a.id == annotation_id), None)
    if not annotation:
        raise HTTPException(status_code=404, detail="Annotation not found")
    
    author = next((u for u in USERS if u.id == author_id), USERS[0])
    reply = AnnotationReply(
        id=f"reply-{len(annotation.replies) + 1}",
        author=author,
        content=content,
        created_at=datetime.now()
    )
    annotation.replies.append(reply)
    return annotation

# Versions
@app.get("/api/drawings/{drawing_id}/versions", response_model=List[Version])
async def get_versions(drawing_id: str):
    drawing = next((d for d in DRAWINGS if d.id == drawing_id), None)
    if not drawing:
        raise HTTPException(status_code=404, detail="Drawing not found")
    return drawing.versions

# Workflows
@app.get("/api/workflows", response_model=List[ReviewWorkflow])
async def get_workflows(drawing_id: Optional[str] = None):
    if drawing_id:
        return [w for w in WORKFLOWS if w.drawing_id == drawing_id]
    return WORKFLOWS

@app.put("/api/workflows/{workflow_id}/status")
async def update_workflow_status(workflow_id: str, status: ReviewStatus):
    workflow = next((w for w in WORKFLOWS if w.id == workflow_id), None)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    workflow.status = status
    if status in [ReviewStatus.APPROVED, ReviewStatus.REJECTED]:
        workflow.completed_at = datetime.now()
    return workflow

# Users
@app.get("/api/users", response_model=List[User])
async def get_users():
    return USERS

@app.get("/api/users/me", response_model=User)
async def get_current_user():
    return USERS[0]  # Mock current user

# File Upload
@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = UPLOAD_DIR / unique_filename

    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "filename": unique_filename,
        "original_filename": file.filename,
        "url": f"/uploads/{unique_filename}",
        "full_url": f"http://localhost:8000/uploads/{unique_filename}"
    }

class CreateVersionRequest(BaseModel):
    file_url: str
    changes_summary: Optional[str] = None
    created_by_id: Optional[str] = "user-1"

# Create new version with uploaded file
@app.post("/api/drawings/{drawing_id}/versions")
async def create_version(drawing_id: str, request: CreateVersionRequest):
    drawing = next((d for d in DRAWINGS if d.id == drawing_id), None)
    if not drawing:
        raise HTTPException(status_code=404, detail="Drawing not found")

    creator = next((u for u in USERS if u.id == request.created_by_id), USERS[0])
    new_version_number = len(drawing.versions) + 1

    new_version = Version(
        id=f"ver-{drawing_id}-{new_version_number}",
        version_number=new_version_number,
        created_at=datetime.now(),
        created_by=creator,
        file_url=request.file_url,
        changes_summary=request.changes_summary,
        status=ReviewStatus.DRAFT
    )

    drawing.versions.append(new_version)
    drawing.current_version = new_version
    drawing.updated_at = datetime.now()

    return new_version

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
