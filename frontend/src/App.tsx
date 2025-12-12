import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import {
  MessageSquare,
  Ruler,
  Stamp,
  Highlighter,
  ArrowRight,
  Square,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Share2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  FileText,
  Grid3x3,
  Layers,
  Search,
  Filter,
  MoreVertical,
  X,
  Send,
  Check,
  ChevronRight,
  Eye,
  GitCompare,
  Upload
} from 'lucide-react';

// Setup PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// ==================== Design System ====================
// Aesthetic: Industrial Blueprint meets Modern Tech
// Bold blues, technical precision, engineering-focused

const API_BASE = 'http://localhost:8000/api';

// ==================== Types ====================

type AnnotationType = 'comment' | 'highlight' | 'measurement' | 'stamp' | 'arrow' | 'rectangle';
type ReviewStatus = 'draft' | 'in_review' | 'approved' | 'rejected' | 'needs_revision';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AnnotationReply {
  id: string;
  author: User;
  content: string;
  created_at: string;
}

interface Annotation {
  id: string;
  drawing_id: string;
  version_id: string;
  type: AnnotationType;
  author: User;
  content: string;
  position: { x: number; y: number; width: number; height: number; page?: number };
  created_at: string;
  updated_at: string;
  resolved: boolean;
  replies: AnnotationReply[];
}

interface Version {
  id: string;
  version_number: number;
  created_at: string;
  created_by: User;
  file_url: string;
  changes_summary?: string;
  status: ReviewStatus;
}

interface Drawing {
  id: string;
  title: string;
  description?: string;
  project_id: string;
  current_version: Version;
  versions: Version[];
  created_at: string;
  updated_at: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  drawings: Drawing[];
  team_members: User[];
  created_at: string;
}

// ==================== API Functions ====================

const api = {
  async getProjects(): Promise<Project[]> {
    const res = await fetch(`${API_BASE}/projects`);
    return res.json();
  },
  
  async getDrawings(projectId?: string): Promise<Drawing[]> {
    const url = projectId ? `${API_BASE}/drawings?project_id=${projectId}` : `${API_BASE}/drawings`;
    const res = await fetch(url);
    return res.json();
  },
  
  async getAnnotations(drawingId: string, versionId?: string): Promise<Annotation[]> {
    const url = versionId 
      ? `${API_BASE}/drawings/${drawingId}/annotations?version_id=${versionId}`
      : `${API_BASE}/drawings/${drawingId}/annotations`;
    const res = await fetch(url);
    return res.json();
  },
  
  async createAnnotation(data: {
    drawing_id: string;
    version_id: string;
    type: AnnotationType;
    content: string;
    position: any;
  }): Promise<Annotation> {
    const res = await fetch(`${API_BASE}/annotations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  },
  
  async resolveAnnotation(annotationId: string): Promise<Annotation> {
    const res = await fetch(`${API_BASE}/annotations/${annotationId}/resolve`, {
      method: 'PUT'
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  },

  async unresolveAnnotation(annotationId: string): Promise<Annotation> {
    const res = await fetch(`${API_BASE}/annotations/${annotationId}/unresolve`, {
      method: 'PUT'
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  },
  
  async getCurrentUser(): Promise<User> {
    const res = await fetch(`${API_BASE}/users/me`);
    return res.json();
  }
};

// ==================== Components ====================

const StatusBadge: React.FC<{ status: ReviewStatus }> = ({ status }) => {
  const styles = {
    draft: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    in_review: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
    needs_revision: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
  };
  
  const icons = {
    draft: <FileText className="w-3 h-3" />,
    in_review: <Clock className="w-3 h-3" />,
    approved: <CheckCircle2 className="w-3 h-3" />,
    rejected: <X className="w-3 h-3" />,
    needs_revision: <AlertCircle className="w-3 h-3" />
  };
  
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${styles[status]}`}>
      {icons[status]}
      <span className="uppercase tracking-wider">{status.replace('_', ' ')}</span>
    </div>
  );
};

const Avatar: React.FC<{ user: User; size?: 'sm' | 'md' | 'lg' }> = ({ user, size = 'md' }) => {
  const sizes = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };
  
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg`}>
      {user.avatar || user.name.split(' ').map(n => n[0]).join('')}
    </div>
  );
};

const ToolButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
  disabled?: boolean;
}> = ({ icon, label, active, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm
      transition-all duration-200 group relative
      ${active 
        ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30' 
        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white'
      }
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    `}
  >
    <span className={`${active ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
      {icon}
    </span>
    <span>{label}</span>
  </button>
);

const AnnotationMarker: React.FC<{
  annotation: Annotation;
  onClick: () => void;
  isSelected: boolean;
}> = ({ annotation, onClick, isSelected }) => {
  const typeColors = {
    comment: 'bg-amber-500',
    highlight: 'bg-yellow-400',
    measurement: 'bg-cyan-500',
    stamp: 'bg-green-500',
    arrow: 'bg-purple-500',
    rectangle: 'bg-pink-500'
  };
  
  return (
    <div
      onClick={onClick}
      className={`
        absolute cursor-pointer transition-all duration-200
        ${isSelected ? 'ring-4 ring-cyan-400 z-20' : 'hover:ring-2 hover:ring-cyan-300 z-10'}
      `}
      style={{
        left: `${annotation.position.x}px`,
        top: `${annotation.position.y}px`,
        width: `${annotation.position.width}px`,
        height: `${annotation.position.height}px`,
      }}
    >
      <div className={`
        w-full h-full ${typeColors[annotation.type]} 
        ${annotation.type === 'highlight' ? 'opacity-30' : 'opacity-10'}
        border-2 border-current rounded-lg
      `} />
      <div className={`
        absolute -top-2 -right-2 w-6 h-6 ${typeColors[annotation.type]} 
        rounded-full flex items-center justify-center text-white text-xs font-bold
        shadow-lg
      `}>
        {annotation.replies.length > 0 ? annotation.replies.length : ''}
      </div>
      {annotation.resolved && (
        <div className="absolute -top-1 -left-1">
          <Check className="w-4 h-4 text-green-500" />
        </div>
      )}
    </div>
  );
};

const AnnotationPanel: React.FC<{
  annotation: Annotation | null;
  onClose: () => void;
  onResolve: (id: string) => void;
  onUnresolve: (id: string) => void;
  onReply: (id: string, content: string) => void;
}> = ({ annotation, onClose, onResolve, onUnresolve, onReply }) => {
  const [replyText, setReplyText] = useState('');
  
  if (!annotation) return null;
  
  const handleReply = () => {
    if (replyText.trim()) {
      onReply(annotation.id, replyText);
      setReplyText('');
    }
  };
  
  return (
    <div className="absolute top-20 right-6 w-96 bg-slate-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-500/20 z-30 max-h-[calc(100vh-10rem)] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50 flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <Avatar user={annotation.author} size="md" />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-white">{annotation.author.name}</div>
            <div className="text-xs text-slate-400">
              {new Date(annotation.created_at).toLocaleString()}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-cyan-400 uppercase tracking-wider">
              {annotation.type}
            </span>
            {annotation.resolved && (
              <span className="text-xs font-medium text-green-400 flex items-center gap-1">
                <Check className="w-3 h-3" />
                Resolved
              </span>
            )}
          </div>
          <p className="text-slate-200">{annotation.content}</p>
        </div>
        
        {/* Replies */}
        {annotation.replies.length > 0 && (
          <div className="space-y-3">
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Replies ({annotation.replies.length})
            </div>
            {annotation.replies.map((reply) => (
              <div key={reply.id} className="flex gap-3">
                <Avatar user={reply.author} size="sm" />
                <div className="flex-1 bg-slate-800/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-white">{reply.author.name}</span>
                    <span className="text-xs text-slate-500">
                      {new Date(reply.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">{reply.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-slate-700/50 space-y-3">
        {!annotation.resolved ? (
          <>
            <div className="flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleReply()}
                placeholder="Add a reply..."
                className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
              <button
                onClick={handleReply}
                disabled={!replyText.trim()}
                className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => onResolve(annotation.id)}
              className="w-full px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors font-medium"
            >
              <Check className="w-4 h-4 inline mr-2" />
              Mark as Resolved
            </button>
          </>
        ) : (
          <button
            onClick={() => onUnresolve(annotation.id)}
            className="w-full px-4 py-2 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-lg hover:bg-orange-500/30 transition-colors font-medium"
          >
            <AlertCircle className="w-4 h-4 inline mr-2" />
            Reopen Annotation
          </button>
        )}
      </div>
    </div>
  );
};

const DrawingViewer: React.FC<{
  drawing: Drawing;
  annotations: Annotation[];
  onAnnotationClick: (annotation: Annotation) => void;
  selectedAnnotation: Annotation | null;
  activeTool: AnnotationType | null;
  onCreateAnnotation: (type: AnnotationType, position: any, content: string) => void;
  onUpload: (file: File) => void;
}> = ({ drawing, annotations, onAnnotationClick, selectedAnnotation, activeTool, onCreateAnnotation, onUpload }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [drawRect, setDrawRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptContent, setPromptContent] = useState('');
  const [pendingAnnotation, setPendingAnnotation] = useState<{ type: AnnotationType; position: any } | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      onUpload(file);
    }
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left - pan.x) / zoom;
        const y = (e.clientY - rect.top - pan.y) / zoom;
        setIsDrawing(true);
        setDrawStart({ x, y });
      }
    } else {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    } else if (isDrawing && drawStart) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left - pan.x) / zoom;
        const y = (e.clientY - rect.top - pan.y) / zoom;
        setDrawRect({
          x: Math.min(drawStart.x, x),
          y: Math.min(drawStart.y, y),
          width: Math.abs(x - drawStart.x),
          height: Math.abs(y - drawStart.y)
        });
      }
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    if (isDrawing && drawRect && activeTool) {
      // Capture values before state changes
      const toolType = activeTool;
      const position = { ...drawRect, page: pageNumber };

      // Store pending annotation and show modal
      setPendingAnnotation({ type: toolType, position });
      setShowPrompt(true);

      // Reset drawing state
      setIsDrawing(false);
      setDrawStart(null);
      setDrawRect(null);
    }
  };

  const handleSubmitAnnotation = () => {
    if (pendingAnnotation && promptContent.trim()) {
      onCreateAnnotation(pendingAnnotation.type, pendingAnnotation.position, promptContent);
      setShowPrompt(false);
      setPromptContent('');
      setPendingAnnotation(null);
    }
  };

  const handleCancelAnnotation = () => {
    setShowPrompt(false);
    setPromptContent('');
    setPendingAnnotation(null);
  };
  
  return (
    <div className="relative flex-1 bg-slate-950 overflow-hidden">
      {/* Zoom Controls */}
      <div className="absolute top-6 right-6 flex gap-2 z-20">
        <button
          onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
          className="p-2 bg-slate-800/90 backdrop-blur-sm hover:bg-slate-700 text-white rounded-lg shadow-lg transition-colors"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <div className="px-4 py-2 bg-slate-800/90 backdrop-blur-sm text-white rounded-lg shadow-lg font-mono font-medium">
          {Math.round(zoom * 100)}%
        </div>
        <button
          onClick={() => setZoom(Math.min(3, zoom + 0.25))}
          className="p-2 bg-slate-800/90 backdrop-blur-sm hover:bg-slate-700 text-white rounded-lg shadow-lg transition-colors"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
      </div>

      {/* Page Navigation Controls */}
      {numPages && numPages > 1 && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          <button
            onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
            disabled={pageNumber <= 1}
            className="p-2 bg-slate-800/90 backdrop-blur-sm hover:bg-slate-700 text-white rounded-lg shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <div className="px-4 py-2 bg-slate-800/90 backdrop-blur-sm text-white rounded-lg shadow-lg font-mono font-medium">
            Page {pageNumber} / {numPages}
          </div>
          <button
            onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
            disabled={pageNumber >= numPages}
            className="p-2 bg-slate-800/90 backdrop-blur-sm hover:bg-slate-700 text-white rounded-lg shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
      
      {/* Canvas */}
      <div
        ref={canvasRef}
        className={`w-full h-full ${activeTool ? 'cursor-crosshair' : isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="relative"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'top left',
            width: '1200px',
            height: '900px'
          }}
        >
          {/* PDF Viewer or Upload Prompt */}
          {drawing.current_version.file_url && drawing.current_version.file_url.startsWith('http') ? (
            <Document
              file={drawing.current_version.file_url}
              onLoadSuccess={onDocumentLoadSuccess}
              className="flex items-center justify-center"
            >
              <Page
                pageNumber={pageNumber}
                scale={1}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-4 border-cyan-500/20 rounded-lg shadow-2xl flex items-center justify-center">
              <div className="text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-4 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors font-medium flex items-center gap-3 mx-auto"
                >
                  <Upload className="w-6 h-6" />
                  Upload PDF to Annotate
                </button>
                <p className="text-slate-400 mt-4">Click to upload a PDF file for review and annotation</p>
              </div>
            </div>
          )}
          
          {/* Annotations - Only show annotations for current page */}
          {annotations
            .filter(annotation => annotation.position.page === pageNumber)
            .map((annotation) => (
              <AnnotationMarker
                key={annotation.id}
                annotation={annotation}
                onClick={() => onAnnotationClick(annotation)}
                isSelected={selectedAnnotation?.id === annotation.id}
              />
            ))}
          
          {/* Drawing preview */}
          {isDrawing && drawRect && (
            <div
              className="absolute border-2 border-cyan-400 bg-cyan-400/10 rounded-lg"
              style={{
                left: `${drawRect.x}px`,
                top: `${drawRect.y}px`,
                width: `${drawRect.width}px`,
                height: `${drawRect.height}px`,
              }}
            />
          )}
        </div>
      </div>

      {/* Annotation Input Modal */}
      {showPrompt && pendingAnnotation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-500/20 w-96 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Enter {pendingAnnotation.type} content
            </h3>
            <textarea
              value={promptContent}
              onChange={(e) => setPromptContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitAnnotation();
                } else if (e.key === 'Escape') {
                  handleCancelAnnotation();
                }
              }}
              placeholder={`Enter your ${pendingAnnotation.type}...`}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
              rows={4}
              autoFocus
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleCancelAnnotation}
                className="flex-1 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitAnnotation}
                disabled={!promptContent.trim()}
                className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Sidebar: React.FC<{
  projects: Project[];
  selectedProject: Project | null;
  selectedDrawing: Drawing | null;
  onSelectProject: (project: Project) => void;
  onSelectDrawing: (drawing: Drawing) => void;
}> = ({ projects, selectedProject, selectedDrawing, onSelectProject, onSelectDrawing }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  return (
    <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">
          Design<span className="text-cyan-400">Review</span>
        </h1>
        <p className="text-sm text-slate-400">Engineering Document Management</p>
      </div>
      
      {/* Search */}
      <div className="p-4 border-b border-slate-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search drawings..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
      </div>
      
      {/* Projects & Drawings */}
      <div className="flex-1 overflow-y-auto">
        {projects.map((project) => (
          <div key={project.id} className="border-b border-slate-800">
            <button
              onClick={() => onSelectProject(project)}
              className={`w-full p-4 text-left transition-colors ${
                selectedProject?.id === project.id ? 'bg-slate-800' : 'hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                <div className="flex-1">
                  <div className="font-semibold text-white">{project.name}</div>
                  <div className="text-xs text-slate-400">{project.drawings.length} drawings</div>
                </div>
              </div>
            </button>
            
            {selectedProject?.id === project.id && (
              <div className="bg-slate-950/50">
                {project.drawings.map((drawing) => (
                  <button
                    key={drawing.id}
                    onClick={() => onSelectDrawing(drawing)}
                    className={`w-full p-4 pl-12 text-left transition-colors border-l-2 ${
                      selectedDrawing?.id === drawing.id
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-transparent hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <FileText className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white text-sm mb-1 truncate">
                          {drawing.title}
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={drawing.current_version.status} />
                          <span className="text-xs text-slate-500">
                            v{drawing.current_version.version_number}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* User Info */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <Avatar user={{ id: '1', name: 'Alex Chen', email: 'alex@example.com', role: 'engineer', avatar: 'AC' }} />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-white text-sm">Alex Chen</div>
            <div className="text-xs text-slate-400">Engineer</div>
          </div>
          <button className="text-slate-400 hover:text-white transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const Toolbar: React.FC<{
  activeTool: AnnotationType | null;
  onToolSelect: (tool: AnnotationType | null) => void;
  currentDrawing: Drawing | null;
}> = ({ activeTool, onToolSelect, currentDrawing }) => {
  const tools: { type: AnnotationType; icon: React.ReactNode; label: string }[] = [
    { type: 'comment', icon: <MessageSquare className="w-5 h-5" />, label: 'Comment' },
    { type: 'highlight', icon: <Highlighter className="w-5 h-5" />, label: 'Highlight' },
    { type: 'measurement', icon: <Ruler className="w-5 h-5" />, label: 'Measure' },
    { type: 'stamp', icon: <Stamp className="w-5 h-5" />, label: 'Stamp' },
    { type: 'arrow', icon: <ArrowRight className="w-5 h-5" />, label: 'Arrow' },
    { type: 'rectangle', icon: <Square className="w-5 h-5" />, label: 'Rectangle' },
  ];
  
  return (
    <div className="h-20 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between">
      {/* Left: Tools */}
      <div className="flex items-center gap-2">
        {tools.map((tool) => (
          <ToolButton
            key={tool.type}
            icon={tool.icon}
            label={tool.label}
            active={activeTool === tool.type}
            onClick={() => onToolSelect(activeTool === tool.type ? null : tool.type)}
          />
        ))}
      </div>
      
      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {currentDrawing && (
          <>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white rounded-lg transition-colors">
              <GitCompare className="w-5 h-5" />
              <span className="font-medium">Compare Versions</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white rounded-lg transition-colors">
              <Download className="w-5 h-5" />
              <span className="font-medium">Export</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors shadow-lg shadow-cyan-500/30">
              <Share2 className="w-5 h-5" />
              <span className="font-medium">Share</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const VersionHistory: React.FC<{
  versions: Version[];
  currentVersion: Version;
  onVersionSelect: (version: Version) => void;
}> = ({ versions, currentVersion, onVersionSelect }) => {
  return (
    <div className="absolute bottom-6 left-6 w-80 bg-slate-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-500/20 z-20">
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2 text-white font-semibold">
          <Clock className="w-5 h-5 text-cyan-400" />
          <span>Version History</span>
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto p-4 space-y-3">
        {versions.map((version, index) => (
          <button
            key={version.id}
            onClick={() => onVersionSelect(version)}
            className={`w-full text-left p-3 rounded-lg transition-colors ${
              version.id === currentVersion.id
                ? 'bg-cyan-500/20 border border-cyan-500/50'
                : 'bg-slate-800/50 hover:bg-slate-700/50 border border-transparent'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <Avatar user={version.created_by} size="sm" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-white">v{version.version_number}</span>
                  {index === 0 && (
                    <span className="text-xs px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full">
                      Current
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 mb-1">
                  {new Date(version.created_at).toLocaleString()}
                </div>
                {version.changes_summary && (
                  <div className="text-xs text-slate-300 mt-2">
                    {version.changes_summary}
                  </div>
                )}
                <div className="mt-2">
                  <StatusBadge status={version.status} />
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// ==================== Main App ====================

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedDrawing, setSelectedDrawing] = useState<Drawing | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [activeTool, setActiveTool] = useState<AnnotationType | null>(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  useEffect(() => {
    loadData();
  }, []);
  
  useEffect(() => {
    if (selectedDrawing) {
      loadAnnotations(selectedDrawing.id, selectedDrawing.current_version.id);
    }
  }, [selectedDrawing]);
  
  const loadData = async () => {
    try {
      const [projectsData, userData] = await Promise.all([
        api.getProjects(),
        api.getCurrentUser()
      ]);
      setProjects(projectsData);
      setCurrentUser(userData);
      
      if (projectsData.length > 0) {
        setSelectedProject(projectsData[0]);
        if (projectsData[0].drawings.length > 0) {
          setSelectedDrawing(projectsData[0].drawings[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };
  
  const loadAnnotations = async (drawingId: string, versionId: string) => {
    try {
      const data = await api.getAnnotations(drawingId, versionId);
      setAnnotations(data);
    } catch (error) {
      console.error('Failed to load annotations:', error);
    }
  };
  
  const handleCreateAnnotation = async (type: AnnotationType, position: any, content: string) => {
    if (!selectedDrawing || !currentUser) return;

    try {
      const newAnnotation = await api.createAnnotation({
        drawing_id: selectedDrawing.id,
        version_id: selectedDrawing.current_version.id,
        type,
        content,
        position
      });
      setAnnotations([...annotations, newAnnotation]);
      setActiveTool(null);
    } catch (error) {
      console.error('Failed to create annotation via API:', error);

      // Fallback: Create annotation locally if API fails
      const localAnnotation: Annotation = {
        id: `local-${Date.now()}`,
        drawing_id: selectedDrawing.id,
        version_id: selectedDrawing.current_version.id,
        type,
        author: currentUser,
        content,
        position,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        resolved: false,
        replies: []
      };
      setAnnotations([...annotations, localAnnotation]);
      setActiveTool(null);
    }
  };
  
  const handleResolveAnnotation = async (annotationId: string) => {
    try {
      await api.resolveAnnotation(annotationId);
      setAnnotations(annotations.map(a =>
        a.id === annotationId ? { ...a, resolved: true } : a
      ));
    } catch (error) {
      console.error('Failed to resolve annotation:', error);
    }
  };

  const handleUnresolveAnnotation = async (annotationId: string) => {
    try {
      await api.unresolveAnnotation(annotationId);
      setAnnotations(annotations.map(a =>
        a.id === annotationId ? { ...a, resolved: false } : a
      ));
    } catch (error) {
      console.error('Failed to unresolve annotation:', error);
    }
  };

  const handleReply = async (annotationId: string, content: string) => {
    // Mock reply for now
    const annotation = annotations.find(a => a.id === annotationId);
    if (annotation && currentUser) {
      const reply: AnnotationReply = {
        id: `reply-${Date.now()}`,
        author: currentUser,
        content,
        created_at: new Date().toISOString()
      };
      annotation.replies.push(reply);
      setAnnotations([...annotations]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!selectedDrawing) return;

    try {
      // Upload file to backend
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData
      });

      if (!uploadRes.ok) {
        throw new Error('Upload failed');
      }

      const uploadData = await uploadRes.json();

      // Create new version with uploaded file
      const versionRes = await fetch(`${API_BASE}/drawings/${selectedDrawing.id}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_url: uploadData.full_url,
          changes_summary: `Uploaded PDF: ${file.name}`
        })
      });

      if (!versionRes.ok) {
        throw new Error('Failed to create version');
      }

      const newVersion = await versionRes.json();

      // Update the drawing with new version
      setSelectedDrawing({
        ...selectedDrawing,
        current_version: newVersion,
        versions: [...selectedDrawing.versions, newVersion]
      });

      // Clear annotations for new version
      setAnnotations([]);
    } catch (error) {
      console.error('Failed to upload file:', error);
      alert('Failed to upload PDF. Please try again.');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-white overflow-hidden font-sans">
      {/* Custom font loading */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&display=swap');
        
        body {
          font-family: 'Outfit', system-ui, -apple-system, sans-serif;
        }
        
        .font-mono {
          font-family: 'JetBrains Mono', monospace;
        }
      `}</style>
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          projects={projects}
          selectedProject={selectedProject}
          selectedDrawing={selectedDrawing}
          onSelectProject={setSelectedProject}
          onSelectDrawing={setSelectedDrawing}
        />
        
        <div className="flex-1 flex flex-col">
          <Toolbar
            activeTool={activeTool}
            onToolSelect={setActiveTool}
            currentDrawing={selectedDrawing}
          />
          
          {selectedDrawing ? (
            <div className="flex-1 relative">
              <DrawingViewer
                drawing={selectedDrawing}
                annotations={annotations}
                onAnnotationClick={setSelectedAnnotation}
                selectedAnnotation={selectedAnnotation}
                activeTool={activeTool}
                onCreateAnnotation={handleCreateAnnotation}
                onUpload={handleFileUpload}
              />
              
              {selectedAnnotation && (
                <AnnotationPanel
                  annotation={selectedAnnotation}
                  onClose={() => setSelectedAnnotation(null)}
                  onResolve={handleResolveAnnotation}
                  onUnresolve={handleUnresolveAnnotation}
                  onReply={handleReply}
                />
              )}
              
              {showVersionHistory && selectedDrawing && (
                <VersionHistory
                  versions={selectedDrawing.versions}
                  currentVersion={selectedDrawing.current_version}
                  onVersionSelect={(version) => {
                    // In a real app, would load this version
                    console.log('Selected version:', version);
                  }}
                />
              )}
              
              {/* Toggle Version History */}
              <button
                onClick={() => setShowVersionHistory(!showVersionHistory)}
                className="absolute bottom-6 left-6 px-4 py-3 bg-slate-900/90 backdrop-blur-sm hover:bg-slate-800 text-white rounded-lg shadow-lg transition-colors border border-slate-700/50"
              >
                <Clock className="w-5 h-5" />
              </button>
              
              {/* Stats Panel */}
              <div className="absolute top-6 left-6 bg-slate-900/90 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-500/20 p-4 min-w-64">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Comments</div>
                    <div className="text-2xl font-bold text-white">{annotations.length}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Resolved</div>
                    <div className="text-2xl font-bold text-green-400">
                      {annotations.filter(a => a.resolved).length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Select a drawing to begin review</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
