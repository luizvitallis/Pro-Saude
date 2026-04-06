import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Plus, Trash2, Save, XCircle, Upload, FileText, Download } from 'lucide-react';
import { UploadFile } from '@/integrations/Core';
import { CustomOption } from '@/entities/CustomOption';
import DepartmentMultiSelect from './DepartmentMultiSelect';

export default function ProtocolEditor({ protocol, onSave, onCancel }) {
  const [editedData, setEditedData] = useState(protocol);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingStepPdf, setUploadingStepPdf] = useState({});
  const [options, setOptions] = useState({ departments: [], categories: [], priorities: [], statuses: [] });
  const pdfInputRef = useRef(null);
  const stepPdfInputRefs = useRef({});

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const [depts, cats, prios, stats] = await Promise.all([
        CustomOption.filter({ listName: 'department_options' }),
        CustomOption.filter({ listName: 'category_options' }),
        CustomOption.filter({ listName: 'priority_options' }),
        CustomOption.filter({ listName: 'status_options' }),
      ]);

      // Assuming filter returns an array where the first element contains the options
      setOptions({
        departments: depts.length > 0 && depts[0].options ? depts[0].options : [],
        categories: cats.length > 0 && cats[0].options ? cats[0].options : [],
        priorities: prios.length > 0 && prios[0].options ? prios[0].options : [],
        statuses: stats.length > 0 && stats[0].options ? stats[0].options : [],
      });
    } catch (error) {
      console.error("Failed to fetch custom options:", error);
      // Optionally, set default hardcoded options or show an error message
    }
  };

  const handleInputChange = (field, value) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

  const handleStepChange = (index, field, value) => {
    const newSteps = [...(editedData.steps || [])];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setEditedData(prev => ({ ...prev, steps: newSteps }));
  };

  const addStep = () => {
    const newSteps = [...(editedData.steps || []), {
      order: (editedData.steps?.length || 0) + 1,
      title: '',
      description: '',
      required: false,
      estimated_time: '',
      department: '',
      step_pdf_url: '',
    }];
    setEditedData(prev => ({ ...prev, steps: newSteps }));
  };

  const removeStep = (index) => {
    const newSteps = editedData.steps.filter((_, i) => i !== index);
    setEditedData(prev => ({ ...prev, steps: newSteps }));
  };

  const handlePdfUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Por favor, selecione apenas arquivos PDF.');
      return;
    }

    setUploadingPdf(true);
    try {
      const result = await UploadFile({ file });
      setEditedData(prev => ({ ...prev, pdf_url: result.file_url }));
    } catch (error) {
      console.error('Error uploading PDF:', error);
      alert('Erro ao fazer upload do PDF. Tente novamente.');
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleStepPdfUpload = async (event, index) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('Por favor, selecione apenas arquivos PDF.');
      return;
    }

    setUploadingStepPdf(prev => ({ ...prev, [index]: true }));
    try {
      const result = await UploadFile({ file });
      handleStepChange(index, 'step_pdf_url', result.file_url);
    } catch (error) {
      console.error('Error uploading step PDF:', error);
      alert('Erro ao fazer upload do PDF. Tente novamente.');
    } finally {
      setUploadingStepPdf(prev => ({ ...prev, [index]: false }));
    }
  };

  const removePdf = () => {
    setEditedData(prev => ({ ...prev, pdf_url: '' }));
  };
  
  const removeStepPdf = (index) => {
    handleStepChange(index, 'step_pdf_url', '');
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Editando Protocolo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input 
              id="title" 
              value={editedData.title || ''} 
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Digite o título do protocolo"
            />
          </div>
          <div>
            <Label htmlFor="version">Versão</Label>
            <Input 
              id="version" 
              value={editedData.version || ''} 
              onChange={(e) => handleInputChange('version', e.target.value)}
              placeholder="ex: 1.0"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="description">Descrição</Label>
          <Textarea 
            id="description" 
            value={editedData.description || ''} 
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Descrição detalhada do protocolo"
            rows={3}
          />
        </div>

        {/* PDF Upload Section */}
        <div className="space-y-3">
          <Label>Arquivo PDF do Protocolo</Label>
          {editedData.pdf_url ? (
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">PDF anexado com sucesso</p>
                  <p className="text-sm text-green-700">Clique para visualizar o arquivo</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(editedData.pdf_url, '_blank')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Visualizar
                </Button>
                <Button variant="outline" size="sm" onClick={removePdf}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
              <input
                ref={pdfInputRef}
                type="file"
                accept=".pdf"
                onChange={handlePdfUpload}
                className="hidden"
              />
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-700 mb-2">
                Adicionar PDF do Protocolo
              </h3>
              <p className="text-slate-500 mb-4">
                Faça upload do documento PDF contendo o protocolo completo
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => pdfInputRef.current?.click()}
                disabled={uploadingPdf}
                className="gap-2"
              >
                {uploadingPdf ? (
                  <>
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Selecionar PDF
                  </>
                )}
              </Button>
              <p className="text-xs text-slate-400 mt-2">Apenas arquivos PDF são aceitos</p>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <div>
            <Label>Setores</Label>
            <DepartmentMultiSelect
              selectedDepartments={Array.isArray(editedData.department) ? editedData.department : (editedData.department ? [editedData.department] : [])}
              availableDepartments={options.departments}
              onChange={(depts) => handleInputChange('department', depts)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Categoria</Label>
              <Select value={editedData.category || ''} onValueChange={(v) => handleInputChange('category', v)}>
                <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
                <SelectContent>
                  {options.categories.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Prioridade</Label>
              <Select value={editedData.priority || ''} onValueChange={(v) => handleInputChange('priority', v)}>
                <SelectTrigger><SelectValue placeholder="Prioridade" /></SelectTrigger>
                <SelectContent>
                  {options.priorities.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={editedData.status || ''} onValueChange={(v) => handleInputChange('status', v)}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  {options.statuses.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Passos do Protocolo</h3>
            <Button variant="outline" size="sm" onClick={addStep}>
              <Plus className="w-4 h-4 mr-2" /> Adicionar Passo
            </Button>
          </div>
          <div className="space-y-4">
            {(editedData.steps || []).map((step, index) => (
              <Card key={index} className="p-4 bg-slate-50">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-3">
                    <Input 
                      placeholder="Título do passo" 
                      value={step.title || ''} 
                      onChange={(e) => handleStepChange(index, 'title', e.target.value)} 
                    />
                    <Textarea 
                      placeholder="Descrição detalhada do passo" 
                      value={step.description || ''} 
                      onChange={(e) => handleStepChange(index, 'description', e.target.value)}
                      rows={2}
                    />
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm">Setor Responsável</Label>
                        <Select value={step.department || ''} onValueChange={(v) => handleStepChange(index, 'department', v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o setor" />
                          </SelectTrigger>
                          <SelectContent>
                            {options.departments.map(opt => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Input 
                          placeholder="Tempo estimado (ex: 5 min)" 
                          value={step.estimated_time || ''} 
                          onChange={(e) => handleStepChange(index, 'estimated_time', e.target.value)} 
                        />
                        <div className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={step.required || false}
                            onChange={(e) => handleStepChange(index, 'required', e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <Label className="text-sm">Passo obrigatório</Label>
                        </div>
                      </div>
                    </div>
                    
                    {/* PDF Upload para o passo */}
                    <div className="space-y-2 pt-2">
                      <Label className="text-sm font-medium">PDF do Passo</Label>
                       <input
                        ref={el => stepPdfInputRefs.current[index] = el}
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleStepPdfUpload(e, index)}
                        className="hidden"
                      />
                      {step.step_pdf_url ? (
                        <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg text-sm">
                          <p className="font-medium text-green-800 truncate">PDF anexado</p>
                          <div className="flex gap-1">
                             <Button 
                               variant="ghost" 
                               size="sm" 
                               onClick={() => window.open(step.step_pdf_url, '_blank')}
                               className="h-auto px-2 py-1"
                             >Visualizar</Button>
                             <Button variant="ghost" size="icon" onClick={() => removeStepPdf(index)}>
                               <Trash2 className="w-4 h-4 text-red-500" />
                             </Button>
                          </div>
                        </div>
                      ) : (
                         <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => stepPdfInputRefs.current[index]?.click()}
                            disabled={uploadingStepPdf[index]}
                            className="w-full gap-2"
                          >
                            {uploadingStepPdf[index] ? (
                              <>
                                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                Enviando...
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4" />
                                Anexar PDF do passo
                              </>
                            )}
                          </Button>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeStep(index)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </Card>
            ))}
            {(!editedData.steps || editedData.steps.length === 0) && (
              <div className="text-center py-8 text-slate-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>Nenhum passo adicionado ainda.</p>
                <p className="text-sm">Clique em "Adicionar Passo" para começar.</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onCancel}>
          <XCircle className="w-4 h-4 mr-2" /> Cancelar
        </Button>
        <Button onClick={() => onSave(editedData)} className="gradient-primary">
          <Save className="w-4 h-4 mr-2" /> Salvar Alterações
        </Button>
      </CardFooter>
    </Card>
  );
}