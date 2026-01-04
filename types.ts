export interface BOMItem {
  id: string;
  sNo: number;
  component: string;
  value: string;
  totalQuantity: number;
  pcbQuantity: number;
  selected: boolean;
}

export interface ModuleData {
  id: string;
  name: string;
  version: string;
  items: BOMItem[];
  lastModified: Date;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  EDITOR = 'EDITOR',
}

export interface ProjectCardProps {
  module: ModuleData;
  onClick: (id: string) => void;
}
