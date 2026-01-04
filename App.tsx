import React, { useState } from 'react';
import { Plus, LayoutGrid, Settings } from 'lucide-react';
import { ModuleData, ViewState } from './types';
import { ProjectCard } from './components/ProjectCard';
import { BOMEditor } from './components/BOMEditor';

// Mock Data
const MOCK_PROJECTS: ModuleData[] = [
  {
    id: '1',
    name: '3 Inch Thermal Printer',
    version: 'V3 R1',
    items: [
        { id: '101', sNo: 1, component: 'Thermal Head', value: 'FTP-628', totalQuantity: 1, pcbQuantity: 1, selected: false },
        { id: '102', sNo: 2, component: 'Stepper Motor', value: 'NEMA 14', totalQuantity: 1, pcbQuantity: 1, selected: false },
        { id: '103', sNo: 3, component: 'Microcontroller', value: 'STM32F103', totalQuantity: 1, pcbQuantity: 1, selected: false },
    ],
    lastModified: new Date('2023-10-25'),
  },
  {
    id: '2',
    name: 'Bluetooth Module Adapter',
    version: 'V1.2',
    items: [],
    lastModified: new Date('2023-10-20'),
  }
];

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  const [projects, setProjects] = useState<ModuleData[]>(MOCK_PROJECTS);
  const [editingProject, setEditingProject] = useState<ModuleData | null>(null);

  const handleCreateNew = () => {
    setEditingProject(null);
    setView(ViewState.EDITOR);
  };

  const handleEditProject = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      setEditingProject(project);
      setView(ViewState.EDITOR);
    }
  };

  const handleSaveProject = (updatedModule: ModuleData) => {
    setProjects(prev => {
      const exists = prev.find(p => p.id === updatedModule.id);
      if (exists) {
        return prev.map(p => p.id === updatedModule.id ? updatedModule : p);
      }
      return [updatedModule, ...prev];
    });
    setView(ViewState.DASHBOARD);
  };

  const handleBack = () => {
    setView(ViewState.DASHBOARD);
  };

  // Render Dashboard
  if (view === ViewState.DASHBOARD) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Navbar */}
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0 flex items-center text-indigo-600">
                  <LayoutGrid className="w-8 h-8 mr-2" />
                  <span className="font-bold text-xl tracking-tight">BOM Master</span>
                </div>
              </div>
              <div className="flex items-center">
                 <div className="p-2 rounded-full hover:bg-gray-100 cursor-pointer text-gray-500">
                    <Settings className="w-6 h-6" />
                 </div>
                 <div className="ml-4 flex items-center">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                        AD
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Dashboard Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
                <p className="mt-1 text-sm text-gray-500">Manage your module configurations and BOMs.</p>
            </div>
            <button
                onClick={handleCreateNew}
                className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow transition-colors"
            >
                <Plus className="w-5 h-5 mr-1" />
                New Project
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Create New Card (Visual shortcut) */}
            <div 
                onClick={handleCreateNew}
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 transition-all cursor-pointer min-h-[180px] group"
            >
                <div className="p-4 rounded-full bg-gray-100 group-hover:bg-indigo-100 transition-colors mb-3">
                    <Plus className="w-8 h-8" />
                </div>
                <span className="font-medium">Create Module</span>
            </div>

            {projects.map(project => (
              <ProjectCard 
                key={project.id} 
                module={project} 
                onClick={handleEditProject} 
              />
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Render Editor
  return (
    <div className="min-h-screen bg-gray-50">
      <BOMEditor 
        initialData={editingProject} 
        onSave={handleSaveProject}
        onBack={handleBack}
      />
    </div>
  );
};

export default App;
