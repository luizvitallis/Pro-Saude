
import React, { useState, useEffect, useCallback } from 'react';
import { CustomOption } from '@/entities/CustomOption';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trash2, Plus, Save } from 'lucide-react';

export default function OptionManager({ listName, displayName }) {
  const [optionData, setOptionData] = useState(null);
  const [options, setOptions] = useState([]);
  const [newOption, setNewOption] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadOptions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await CustomOption.filter({ listName: listName });
      if (result && result.length > 0) {
        setOptionData(result[0]);
        setOptions(result[0].options);
      } else {
        setOptions([]);
        setOptionData(null); // Clear old data if nothing is found
      }
    } catch (error) {
      console.error(`Error loading ${displayName}:`, error);
    } finally {
      setLoading(false);
    }
  }, [listName, displayName]);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  const handleAddOption = () => {
    if (newOption.trim()) {
      setOptions([...options, newOption.trim()]);
      setNewOption('');
    }
  };

  const handleRemoveOption = (indexToRemove) => {
    setOptions(options.filter((_, index) => index !== indexToRemove));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (optionData) {
        await CustomOption.update(optionData.id, { options });
      } else {
        const newData = await CustomOption.create({ listName, displayName, options });
        setOptionData(newData);
      }
    } catch (error) {
      console.error(`Error saving ${displayName}:`, error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Card className="shadow-sm border-0"><CardContent className="p-4">Carregando...</CardContent></Card>;
  }

  return (
    <Card className="shadow-sm border-0">
      <CardHeader>
        <CardTitle>{displayName}</CardTitle>
        <CardDescription>Gerencie as opções disponíveis para este campo nos protocolos.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input value={option} readOnly className="flex-1" />
              <Button variant="ghost" size="icon" onClick={() => handleRemoveOption(index)}>
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Adicionar nova opção"
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddOption()}
          />
          <Button onClick={handleAddOption}><Plus className="w-4 h-4 mr-2" /> Adicionar</Button>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="gradient-primary">
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
