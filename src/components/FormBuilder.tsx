import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Type, Hash, List, Calendar, Upload, CheckSquare, Phone, Mail,
  User, CreditCard, GripVertical, Trash2, Copy, Settings,
  Eye, EyeOff, AlertCircle, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';

// ============================================
// Types
// ============================================

export type FormFieldType = 
  | 'text' | 'number' | 'email' | 'tel' | 'date' 
  | 'select' | 'checkbox' | 'radio' | 'file' 
  | 'textarea' | 'idcard' | 'jersey';

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  display?: {
    showInPublic: boolean;
    showInList: boolean;
  };
}

export interface FormTemplate {
  id: string;
  name: string;
  fields: FormField[];
  createdAt: string;
}

// ============================================
// Field Library
// ============================================

const fieldLibrary: { type: FormFieldType; label: string; icon: React.ElementType; description: string }[] = [
  { type: 'text', label: '文字欄位', icon: Type, description: '一般文字輸入' },
  { type: 'number', label: '數字欄位', icon: Hash, description: '數值輸入' },
  { type: 'email', label: 'Email', icon: Mail, description: '電子郵件地址' },
  { type: 'tel', label: '電話號碼', icon: Phone, description: '聯絡電話' },
  { type: 'date', label: '日期選擇', icon: Calendar, description: '出生日期等' },
  { type: 'select', label: '下拉選單', icon: List, description: '單選選項' },
  { type: 'checkbox', label: '多選框', icon: CheckSquare, description: '多選選項' },
  { type: 'radio', label: '單選框', icon: CheckSquare, description: '單選選項' },
  { type: 'file', label: '檔案上傳', icon: Upload, description: '上傳文件' },
  { type: 'textarea', label: '多行文字', icon: Type, description: '長文字輸入' },
  { type: 'idcard', label: '身分證字號', icon: CreditCard, description: '身分證驗證' },
  { type: 'jersey', label: '球衣號碼', icon: User, description: '背號輸入' },
];

const defaultFields: FormField[] = [
  {
    id: 'default-name',
    type: 'text',
    label: '姓名',
    placeholder: '請輸入姓名',
    required: true,
    display: { showInPublic: true, showInList: true },
  },
  {
    id: 'default-phone',
    type: 'tel',
    label: '聯絡電話',
    placeholder: '0912-345-678',
    required: true,
    display: { showInPublic: false, showInList: true },
  },
];

// ============================================
// Sortable Field Item Component
// ============================================

interface SortableFieldItemProps {
  field: FormField;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

function SortableFieldItem({ field, isSelected, onSelect, onDelete, onDuplicate }: SortableFieldItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const fieldInfo = fieldLibrary.find(f => f.type === field.type);
  const Icon = fieldInfo?.icon || Type;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative group rounded-lg border-2 transition-all cursor-pointer
        ${isSelected 
          ? 'border-orange-500 bg-orange-500/10' 
          : 'border-slate-700 bg-slate-800 hover:border-slate-500'}
      `}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3 p-4">
        {/* Drag Handle */}
        <div 
          {...attributes} 
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-slate-500 hover:text-slate-300"
        >
          <GripVertical className="w-5 h-5" />
        </div>

        {/* Icon */}
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          isSelected ? 'bg-orange-500/20' : 'bg-slate-700'
        }`}>
          <Icon className={`w-5 h-5 ${isSelected ? 'text-orange-500' : 'text-slate-400'}`} />
        </div>

        {/* Field Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-white truncate">{field.label}</span>
            {field.required && (
              <span className="text-xs text-red-400">*</span>
            )}
          </div>
          <span className="text-xs text-slate-500">{fieldInfo?.label}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Field Library Item Component
// ============================================

function FieldLibraryItem({ type, label, icon: Icon, description }: {
  type: FormFieldType;
  label: string;
  icon: React.ElementType;
  description: string;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({
    id: `library-${type}`,
    data: { type, isLibrary: true },
  });

  return (
    <motion.div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`
        p-3 rounded-lg border border-slate-700 bg-slate-800 
        hover:border-orange-500 hover:bg-slate-700 cursor-grab active:cursor-grabbing
        transition-all ${isDragging ? 'opacity-50' : ''}
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center">
          <Icon className="w-4 h-4 text-slate-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">{label}</p>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// Properties Panel Component
// ============================================

function PropertiesPanel({ 
  field, 
  onUpdate 
}: { 
  field: FormField | null; 
  onUpdate: (field: FormField) => void;
}) {
  const [newOption, setNewOption] = useState('');

  if (!field) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500">
        <div className="text-center">
          <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>選擇一個欄位來編輯屬性</p>
        </div>
      </div>
    );
  }

  const addOption = () => {
    if (newOption.trim() && !field.options?.includes(newOption.trim())) {
      onUpdate({
        ...field,
        options: [...(field.options || []), newOption.trim()],
      });
      setNewOption('');
    }
  };

  const removeOption = (index: number) => {
    onUpdate({
      ...field,
      options: field.options?.filter((_, i) => i !== index) || [],
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-700">
        <Settings className="w-5 h-5 text-orange-500" />
        <h3 className="font-bold text-white">欄位屬性</h3>
      </div>

      {/* Label */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          欄位名稱
        </label>
        <input
          type="text"
          value={field.label}
          onChange={(e) => onUpdate({ ...field, label: e.target.value })}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
        />
      </div>

      {/* Placeholder */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          提示文字
        </label>
        <input
          type="text"
          value={field.placeholder || ''}
          onChange={(e) => onUpdate({ ...field, placeholder: e.target.value })}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
          placeholder="請輸入..."
        />
      </div>

      {/* Required Toggle */}
      <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-300">必填欄位</span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={field.required}
            onChange={(e) => onUpdate({ ...field, required: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
        </label>
      </div>

      {/* Options (for select/radio/checkbox) */}
      {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            選項列表
          </label>
          <div className="space-y-2 mb-3">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="flex-1 px-3 py-2 bg-slate-900 rounded-lg text-white text-sm">
                  {option}
                </span>
                <button
                  onClick={() => removeOption(index)}
                  className="p-2 text-slate-400 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addOption()}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none text-sm"
              placeholder="新增選項..."
            />
            <Button onClick={addOption} variant="secondary" size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Validation (for number) */}
      {field.type === 'number' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              最小值
            </label>
            <input
              type="number"
              value={field.validation?.min || ''}
              onChange={(e) => onUpdate({
                ...field,
                validation: { ...field.validation, min: parseInt(e.target.value) || undefined },
              })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              最大值
            </label>
            <input
              type="number"
              value={field.validation?.max || ''}
              onChange={(e) => onUpdate({
                ...field,
                validation: { ...field.validation, max: parseInt(e.target.value) || undefined },
              })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Display Settings */}
      <div className="pt-4 border-t border-slate-700">
        <p className="text-sm font-medium text-slate-300 mb-3">顯示設定</p>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-400">公開顯示</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={field.display?.showInPublic ?? true}
                onChange={(e) => onUpdate({
                  ...field,
                  display: { 
                    showInPublic: e.target.checked, 
                    showInList: field.display?.showInList ?? true 
                  },
                })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-400">列表顯示</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={field.display?.showInList ?? true}
                onChange={(e) => onUpdate({
                  ...field,
                  display: { 
                    showInPublic: field.display?.showInPublic ?? true, 
                    showInList: e.target.checked 
                  },
                })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Preview Component
// ============================================

function FormPreview({ fields }: { fields: FormField[] }) {
  const renderField = (field: FormField) => {
    const baseClass = "w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none";
    
    switch (field.type) {
      case 'textarea':
        return <textarea className={`${baseClass} resize-none`} rows={3} placeholder={field.placeholder} readOnly />;
      case 'select':
        return (
          <select className={baseClass}>
            <option value="">請選擇</option>
            {field.options?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
          </select>
        );
      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((opt, i) => (
              <label key={i} className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 accent-orange-500" />
                <span className="text-slate-300">{opt}</span>
              </label>
            ))}
          </div>
        );
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((opt, i) => (
              <label key={i} className="flex items-center gap-2">
                <input type="radio" name={field.id} className="w-4 h-4 accent-orange-500" />
                <span className="text-slate-300">{opt}</span>
              </label>
            ))}
          </div>
        );
      case 'file':
        return (
          <div className={`${baseClass} flex items-center justify-center h-24 border-dashed`}>
            <div className="text-center">
              <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">點擊上傳檔案</p>
            </div>
          </div>
        );
      default:
        return <input type={field.type} className={baseClass} placeholder={field.placeholder} readOnly />;
    }
  };

  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <div key={field.id}>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {renderField(field)}
        </div>
      ))}
    </div>
  );
}

// ============================================
// Main Form Builder Component
// ============================================

interface FormBuilderProps {
  initialFields?: FormField[];
  onSave?: (fields: FormField[]) => void;
}

export function FormBuilder({ initialFields = defaultFields, onSave }: FormBuilderProps) {
  const [fields, setFields] = useState<FormField[]>(initialFields);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const { addToast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const selectedField = fields.find(f => f.id === selectedFieldId) || null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    // Check if dragging from library
    if (active.id.toString().startsWith('library-')) {
      const type = active.id.toString().replace('library-', '') as FormFieldType;
      const newField: FormField = {
        id: `field-${Date.now()}`,
        type,
        label: fieldLibrary.find(f => f.type === type)?.label || '新欄位',
        placeholder: '',
        required: false,
        options: ['select', 'radio', 'checkbox'].includes(type) ? ['選項 1', '選項 2'] : undefined,
        display: { showInPublic: true, showInList: true },
      };
      
      if (over.id === 'canvas') {
        setFields([...fields, newField]);
      } else {
        const overIndex = fields.findIndex(f => f.id === over.id);
        if (overIndex !== -1) {
          const newFields = [...fields];
          newFields.splice(overIndex + 1, 0, newField);
          setFields(newFields);
        }
      }
      setSelectedFieldId(newField.id);
      return;
    }

    // Reordering existing fields
    if (active.id !== over.id) {
      const oldIndex = fields.findIndex(f => f.id === active.id);
      const newIndex = fields.findIndex(f => f.id === over.id);
      setFields(arrayMove(fields, oldIndex, newIndex));
    }
  };

  const addField = (type: FormFieldType) => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type,
      label: fieldLibrary.find(f => f.type === type)?.label || '新欄位',
      placeholder: '',
      required: false,
      options: ['select', 'radio', 'checkbox'].includes(type) ? ['選項 1', '選項 2'] : undefined,
      display: { showInPublic: true, showInList: true } as { showInPublic: boolean; showInList: boolean },
    };
    setFields([...fields, newField]);
    setSelectedFieldId(newField.id);
  };

  const deleteField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
    if (selectedFieldId === id) {
      setSelectedFieldId(null);
    }
  };

  const duplicateField = (field: FormField) => {
    const newField: FormField = {
      ...field,
      id: `field-${Date.now()}`,
      label: `${field.label} (複製)`,
      display: field.display || { showInPublic: true, showInList: true },
    };
    const index = fields.findIndex(f => f.id === field.id);
    const newFields = [...fields];
    newFields.splice(index + 1, 0, newField);
    setFields(newFields);
    setSelectedFieldId(newField.id);
  };

  const updateField = (updatedField: FormField) => {
    setFields(fields.map(f => f.id === updatedField.id ? updatedField : f));
  };

  const handleSave = () => {
    onSave?.(fields);
    addToast({
      title: '表單已儲存',
      description: `共 ${fields.length} 個欄位`,
      variant: 'success',
    });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-[calc(100vh-4rem)] flex">
        {/* Left Sidebar - Field Library */}
        <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
          <div className="p-4 border-b border-slate-800">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-orange-500" />
              欄位庫
            </h3>
            <p className="text-xs text-slate-500 mt-1">拖曳或點擊新增</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {fieldLibrary.map((field) => (
              <div
                key={field.type}
                onClick={() => addField(field.type)}
                className="cursor-pointer"
              >
                <FieldLibraryItem {...field} />
              </div>
            ))}
          </div>
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 flex flex-col bg-slate-950">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white">表單設計</h3>
              <p className="text-xs text-slate-500">{fields.length} 個欄位</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? '編輯模式' : '預覽'}
              </Button>
              <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600">
                儲存表單
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {showPreview ? (
              <Card className="max-w-2xl mx-auto p-6 bg-slate-800 border-slate-700">
                <h4 className="text-lg font-bold text-white mb-4">表單預覽</h4>
                <FormPreview fields={fields} />
              </Card>
            ) : (
              <SortableContext
                items={fields.map(f => f.id)}
                strategy={verticalListSortingStrategy}
              >
                <div id="canvas" className="max-w-2xl mx-auto space-y-3 min-h-[200px]">
                  {fields.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-800 rounded-lg">
                      <Plus className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>從左側拖曳欄位到這裡</p>
                      <p className="text-sm">或點擊欄位庫中的項目</p>
                    </div>
                  ) : (
                    fields.map((field) => (
                      <SortableFieldItem
                        key={field.id}
                        field={field}
                        isSelected={selectedFieldId === field.id}
                        onSelect={() => setSelectedFieldId(field.id)}
                        onDelete={() => deleteField(field.id)}
                        onDuplicate={() => duplicateField(field)}
                      />
                    ))
                  )}
                </div>
              </SortableContext>
            )}
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            <PropertiesPanel
              field={selectedField}
              onUpdate={updateField}
            />
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeId?.startsWith('library-') && (
          <div className="p-3 rounded-lg border border-orange-500 bg-slate-800 shadow-xl">
            <p className="text-white text-sm">新增欄位</p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
