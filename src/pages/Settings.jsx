import React from 'react';
import OptionManager from '../components/settings/OptionManager';

export default function Settings() {
  const optionLists = [
    { listName: 'department_options', displayName: 'Setores' },
    { listName: 'category_options', displayName: 'Categorias' },
    { listName: 'priority_options', displayName: 'Prioridades' },
    { listName: 'status_options', displayName: 'Status' }
  ];

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-full">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>
        <p className="text-slate-600">Gerencie as opções de seleção para a criação de protocolos.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {optionLists.map(list => (
          <OptionManager key={list.listName} listName={list.listName} displayName={list.displayName} />
        ))}
      </div>
    </div>
  );
}