import React from 'react';
import { ModuleData, ProjectCardProps } from '../types';
import { FileText, Calendar, ChevronRight } from 'lucide-react';

export const ProjectCard: React.FC<ProjectCardProps> = ({ module, onClick }) => {
  return (
    <div 
      onClick={() => onClick(module.id)}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
          <FileText className="w-6 h-6 text-indigo-600" />
        </div>
        <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
          {module.version}
        </span>
      </div>
      
      <h3 className="text-lg font-bold text-gray-900 mb-1">{module.name}</h3>
      <p className="text-sm text-gray-500 mb-4">{module.items.length} Components</p>
      
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center text-xs text-gray-400">
          <Calendar className="w-3 h-3 mr-1" />
          {module.lastModified.toLocaleDateString()}
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
      </div>
    </div>
  );
};
