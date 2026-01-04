import React, { useState, useCallback } from 'react';
import { ModuleData, BOMItem } from '../types';
import { generateBOMSuggestions } from '../services/geminiService';
import { 
  ArrowLeft, 
  Save, 
  Download, 
  Plus, 
  Trash2, 
  Wand2, 
  Loader2, 
  FileSpreadsheet,
  Package
} from 'lucide-react';

interface BOMEditorProps {
  initialData: ModuleData | null;
  onSave: (data: ModuleData) => void;
  onBack: () => void;
}

const EmptyState = () => (
  <div className="text-center py-12 text-gray-400">
    <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
    <p>No components added yet.</p>
  </div>
);

export const BOMEditor: React.FC<BOMEditorProps> = ({ initialData, onSave, onBack }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [version, setVersion] = useState(initialData?.version || 'V1 R1');
  const [items, setItems] = useState<BOMItem[]>(initialData?.items || []);
  const [isGenerating, setIsGenerating] = useState(false);

  // New Item Input State
  const [newItemComponent, setNewItemComponent] = useState('');
  const [newItemValue, setNewItemValue] = useState('');
  const [newItemTotalQty, setNewItemTotalQty] = useState<number | string>('');
  const [newItemPcbQty, setNewItemPcbQty] = useState<number | string>('');

  const handleAddItem = () => {
    if (!newItemComponent) return;

    const newItem: BOMItem = {
      id: Math.random().toString(36).substr(2, 9),
      sNo: items.length + 1,
      component: newItemComponent,
      value: newItemValue,
      totalQuantity: Number(newItemTotalQty) || 0,
      pcbQuantity: Number(newItemPcbQty) || 0,
      selected: false,
    };

    setItems([...items, newItem]);
    
    // Reset inputs
    setNewItemComponent('');
    setNewItemValue('');
    setNewItemTotalQty('');
    setNewItemPcbQty('');
  };

  const handleGenerateAI = async () => {
    if (!name) {
      alert("Please enter a Module Name first so the AI knows what to generate.");
      return;
    }
    setIsGenerating(true);
    try {
      const suggestions = await generateBOMSuggestions(name, `Version: ${version}`);
      
      // Merge logic: append new items with correct S.NO
      const currentLength = items.length;
      const newItems = suggestions.map((item, idx) => ({
        ...item,
        sNo: currentLength + idx + 1
      }));
      
      setItems(prev => [...prev, ...newItems]);
    } catch (error) {
      alert("Failed to generate suggestions. Please check API configuration.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['S.NO', 'Component', 'Value', 'Total Quantity', 'PCB Quantity'];
    const csvContent = [
      headers.join(','),
      ...items.map(item => 
        [item.sNo, `"${item.component}"`, `"${item.value}"`, item.totalQuantity, item.pcbQuantity].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${name || 'module'}_${version}_BOM.csv`;
    link.click();
  };

  const handleSave = () => {
    if (!name) {
        alert("Module name is required");
        return;
    }
    const moduleData: ModuleData = {
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      name,
      version,
      items,
      lastModified: new Date(),
    };
    onSave(moduleData);
  };

  const handleDeleteItem = (id: string) => {
    setItems(prev => {
        const filtered = prev.filter(i => i.id !== id);
        // Re-index S.NO
        return filtered.map((item, idx) => ({ ...item, sNo: idx + 1 }));
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header Section from Sketch */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto">
          
          {/* Top Bar: Back & Title */}
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={onBack}
              className="flex items-center text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Projects
            </button>
            <div className="text-sm text-gray-400">Module Editor</div>
          </div>

          {/* Form Area from Sketch */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            
            {/* Inputs */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 ml-1">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 3 Inch Thermal Printer"
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 ml-1">
                  Version
                </label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="e.g. V3 R1"
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
                />
              </div>
            </div>

            {/* Actions: Export & AI */}
            <div className="flex items-center gap-2">
               <button
                onClick={handleGenerateAI}
                disabled={isGenerating}
                className="flex items-center px-4 py-2.5 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
                AI Auto-Fill
              </button>
              <div className="h-8 w-px bg-gray-300 mx-2 hidden md:block"></div>
              <button
                onClick={handleExportCSV}
                className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export BOM
              </button>
              <button
                className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors opacity-60 cursor-not-allowed"
                title="Not implemented"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Group
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Table Container */}
          <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden flex flex-col">
            
            {/* Table Header */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th scope="col" className="px-6 py-4 w-16">S.NO</th>
                    <th scope="col" className="px-6 py-4">Component</th>
                    <th scope="col" className="px-6 py-4">Value</th>
                    <th scope="col" className="px-6 py-4 w-32 text-center">Total Qty</th>
                    <th scope="col" className="px-6 py-4 w-32 text-center">Qty / PCB</th>
                    <th scope="col" className="px-6 py-4 w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                        <td colSpan={6}><EmptyState /></td>
                    </tr>
                  ) : (
                      items.map((item) => (
                    <tr key={item.id} className="bg-white border-b hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4 font-medium text-gray-900">{item.sNo}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{item.component}</td>
                      <td className="px-6 py-4 font-mono text-gray-600">{item.value}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded border border-blue-400">
                          {item.totalQuantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-600">{item.pcbQuantity}</td>
                      <td className="px-6 py-4 text-right">
                        <button 
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )))}
                  
                  {/* Add Row Input Line (Matches Sketch: T3 | [ ] | [ ]) */}
                  <tr className="bg-indigo-50/30 border-t-2 border-indigo-100">
                    <td className="px-6 py-4 font-medium text-indigo-300">
                        {items.length + 1}
                    </td>
                    <td className="px-6 py-2">
                        <input 
                            type="text" 
                            placeholder="Component Name"
                            value={newItemComponent}
                            onChange={(e) => setNewItemComponent(e.target.value)}
                            className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded focus:ring-indigo-500 focus:border-indigo-500 block p-2"
                        />
                    </td>
                    <td className="px-6 py-2">
                        <input 
                            type="text" 
                            placeholder="Value"
                            value={newItemValue}
                            onChange={(e) => setNewItemValue(e.target.value)}
                            className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded focus:ring-indigo-500 focus:border-indigo-500 block p-2"
                        />
                    </td>
                    <td className="px-6 py-2">
                        <input 
                            type="number" 
                            placeholder="0"
                            value={newItemTotalQty}
                            onChange={(e) => setNewItemTotalQty(e.target.value)}
                            className="w-full text-center bg-white border border-gray-300 text-gray-900 text-sm rounded focus:ring-indigo-500 focus:border-indigo-500 block p-2"
                        />
                    </td>
                    <td className="px-6 py-2">
                        <input 
                            type="number" 
                            placeholder="0"
                            value={newItemPcbQty}
                            onChange={(e) => setNewItemPcbQty(e.target.value)}
                            className="w-full text-center bg-white border border-gray-300 text-gray-900 text-sm rounded focus:ring-indigo-500 focus:border-indigo-500 block p-2"
                        />
                    </td>
                    <td className="px-6 py-2 text-center">
                        <button 
                            onClick={handleAddItem}
                            disabled={!newItemComponent}
                            className="p-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Sketch "SAVE" Button Footer */}
          <div className="mt-8 flex justify-end">
            <button
                onClick={handleSave}
                className="flex items-center px-8 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
                <Save className="w-4 h-4 mr-2" />
                SAVE MODULE
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
