import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileImage, FileText, File, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';

interface FileUploadProps {
  accept?: string;
  maxSize?: number; // in MB
  maxFiles?: number;
  onUpload?: (files: File[]) => void;
  className?: string;
}

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  preview?: string;
}

export function FileUpload({
  accept = '*',
  maxSize = 10,
  maxFiles = 5,
  onUpload,
  className = '',
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return FileImage;
    if (type.includes('pdf') || type.includes('doc')) return FileText;
    return File;
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize * 1024 * 1024) {
      return `檔案大小超過 ${maxSize}MB 限制`;
    }
    return null;
  };

  const processFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;

    const fileArray = Array.from(newFiles);

    if (files.length + fileArray.length > maxFiles) {
      addToast({
        title: '檔案數量超過限制',
        description: `最多只能上傳 ${maxFiles} 個檔案`,
        variant: 'warning',
      });
      return;
    }

    const newUploadedFiles: UploadedFile[] = [];

    fileArray.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        addToast({
          title: '檔案驗證失敗',
          description: `${file.name}: ${error}`,
          variant: 'error',
        });
        return;
      }

      const uploadedFile: UploadedFile = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        status: 'uploading',
      };

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          uploadedFile.preview = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      }

      newUploadedFiles.push(uploadedFile);

      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setFiles(prev =>
            prev.map(f =>
              f.id === uploadedFile.id
                ? { ...f, progress: 100, status: 'completed' }
                : f
            )
          );
        } else {
          setFiles(prev =>
            prev.map(f =>
              f.id === uploadedFile.id ? { ...f, progress } : f
            )
          );
        }
      }, 200);
    });

    setFiles(prev => [...prev, ...newUploadedFiles]);
    onUpload?.(fileArray);
  }, [files.length, maxFiles, maxSize, onUpload, addToast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleRemove = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    addToast({
      title: '已移除檔案',
      variant: 'default',
    });
  }, [addToast]);

  const handleClearAll = useCallback(() => {
    setFiles([]);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <motion.div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragging 
            ? 'border-orange-500 bg-orange-500/10' 
            : 'border-slate-600 hover:border-slate-500 bg-slate-800/50'
          }
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          className="hidden"
          onChange={(e) => processFiles(e.target.files)}
        />

        <motion.div
          animate={isDragging ? { y: [0, -5, 0] } : {}}
          transition={{ duration: 0.5, repeat: isDragging ? Infinity : 0 }}
        >
          <Upload className={`w-12 h-12 mx-auto mb-3 ${isDragging ? 'text-orange-500' : 'text-slate-500'}`} />
        </motion.div>

        <p className="text-white font-medium mb-1">
          {isDragging ? '放開以上傳檔案' : '點擊或拖曳檔案至此'}
        </p>
        <p className="text-slate-400 text-sm">
          支援 {accept === '*' ? '所有' : accept} 格式，最大 {maxSize}MB
        </p>
        <p className="text-slate-500 text-xs mt-2">
          最多 {maxFiles} 個檔案
        </p>
      </motion.div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">
                已上傳 {files.length} / {maxFiles} 個檔案
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-red-400"
                onClick={handleClearAll}
              >
                全部清除
              </Button>
            </div>

            {files.map((file) => {
              const Icon = getFileIcon(file.type);
              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Card className="p-3 bg-slate-800 border-slate-700">
                    <div className="flex items-center gap-3">
                      {/* Preview or Icon */}
                      {file.preview ? (
                        <img
                          src={file.preview}
                          alt={file.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-slate-400" />
                        </div>
                      )}

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm truncate">{file.name}</p>
                        <p className="text-slate-400 text-xs">{formatFileSize(file.size)}</p>

                        {/* Progress Bar */}
                        {file.status === 'uploading' && (
                          <div className="mt-2 bg-slate-700 rounded-full h-1.5 overflow-hidden">
                            <motion.div
                              className="h-full bg-orange-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${file.progress}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Status */}
                      <div className="flex items-center gap-2">
                        {file.status === 'completed' && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        )}
                        {file.status === 'error' && (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        )}
                        <button
                          onClick={() => handleRemove(file.id)}
                          className="p-1 hover:bg-slate-700 rounded transition-colors"
                        >
                          <X className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Avatar Upload Component
interface AvatarUploadProps {
  currentAvatar?: string;
  onUpload?: (file: File) => void;
  size?: number;
  className?: string;
}

export function AvatarUpload({
  currentAvatar,
  onUpload,
  size = 120,
  className = '',
}: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatar || null);
  const [isHovering, setIsHovering] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast({
        title: '檔案過大',
        description: '頭像圖片最大 5MB',
        variant: 'error',
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      addToast({
        title: '格式不支援',
        description: '請上傳圖片檔案',
        variant: 'error',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    onUpload?.(file);

    addToast({
      title: '頭像已更新',
      variant: 'success',
    });
  }, [onUpload, addToast]);

  return (
    <div className={`relative ${className}`}>
      <motion.div
        className="relative rounded-full overflow-hidden cursor-pointer"
        style={{ width: size, height: size }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={() => inputRef.current?.click()}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {preview ? (
          <img
            src={preview}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-slate-700 flex items-center justify-center">
            <Upload className="w-8 h-8 text-slate-500" />
          </div>
        )}

        {/* Overlay */}
        <AnimatePresence>
          {isHovering && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 flex items-center justify-center"
            >
              <Upload className="w-8 h-8 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Edit indicator */}
      <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
        <Upload className="w-4 h-4 text-white" />
      </div>
    </div>
  );
}
