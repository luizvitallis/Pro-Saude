import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const departmentColors = {
  'Atenção Primária': "bg-blue-100 text-blue-700 border-blue-200",
  'Atenção Especializada': "bg-purple-100 text-purple-700 border-purple-200",
  'Saúde Mental': "bg-teal-100 text-teal-700 border-teal-200",
  'Vigilância em Saúde': "bg-yellow-100 text-yellow-700 border-yellow-200",
};

export default function DepartmentMultiSelect({ selectedDepartments = [], availableDepartments = [], onChange }) {
  const [selectValue, setSelectValue] = useState('');

  const handleAdd = (value) => {
    if (value && !selectedDepartments.includes(value)) {
      onChange([...selectedDepartments, value]);
    }
    setSelectValue('');
  };

  const handleRemove = (dept) => {
    onChange(selectedDepartments.filter(d => d !== dept));
  };

  const availableOptions = availableDepartments.filter(d => !selectedDepartments.includes(d));

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Select value={selectValue} onValueChange={handleAdd}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Selecione setores" />
          </SelectTrigger>
          <SelectContent>
            {availableOptions.length === 0 ? (
              <div className="p-2 text-sm text-slate-500 text-center">Todos os setores selecionados</div>
            ) : (
              availableOptions.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
      
      {selectedDepartments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedDepartments.map(dept => (
            <Badge key={dept} className={`${departmentColors[dept] || 'bg-gray-100 text-gray-700 border-gray-200'} px-3 py-1.5 gap-2`}>
              <span>{dept}</span>
              <button
                onClick={() => handleRemove(dept)}
                className="hover:opacity-70 transition-opacity"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}