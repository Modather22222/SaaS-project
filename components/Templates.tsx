
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { RocketLaunchIcon, ChartBarIcon, CalculatorIcon, PuzzlePieceIcon } from '@heroicons/react/24/outline';

interface Template {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  prompt: string;
  color: string;
}

const TEMPLATES: Template[] = [
  {
    id: 'landing',
    name: 'SaaS Landing Page',
    description: 'Modern landing page with hero section, features grid, and pricing table.',
    icon: RocketLaunchIcon,
    prompt: 'Create a modern, dark-themed SaaS landing page for a fictional AI company. Include a sticky header, a hero section with a glowing gradient background, a 3-column feature grid with hover effects, and a pricing section.',
    color: 'text-purple-400',
  },
  {
    id: 'dashboard',
    name: 'Analytics Dashboard',
    description: 'Interactive admin dashboard with charts and data tables.',
    icon: ChartBarIcon,
    prompt: 'Build an interactive analytics dashboard. Include a sidebar, a top stats row (Revenue, Users, Bounce Rate), and use CSS/SVG to create a dummy line chart and bar chart. Make it responsive.',
    color: 'text-blue-400',
  },
  {
    id: 'calculator',
    name: 'Mortgage Calculator',
    description: 'Functional financial tool with sliders and real-time results.',
    icon: CalculatorIcon,
    prompt: 'Create a mortgage calculator app. Include inputs for Home Value, Down Payment, Interest Rate, and Loan Term (sliders and number inputs). Display the Monthly Payment in large text that updates in real-time as inputs change.',
    color: 'text-green-400',
  },
  {
    id: 'kanban',
    name: 'Kanban Board',
    description: 'Drag-and-drop task management interface.',
    icon: PuzzlePieceIcon,
    prompt: 'Create a fully functional Kanban board with "To Do", "In Progress", and "Done" columns. Allow adding new cards, deleting cards, and allow moving cards between columns (simulate drag and drop with click-to-move if native API is too complex for one file).',
    color: 'text-orange-400',
  },
];

interface TemplatesProps {
  onUseTemplate: (prompt: string) => void;
}

export const Templates: React.FC<TemplatesProps> = ({ onUseTemplate }) => {
  return (
    <div className="flex-1 h-full overflow-y-auto bg-zinc-950 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Templates</h1>
          <p className="text-zinc-400 mt-2">Jumpstart your next project with these pre-built prompts.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => onUseTemplate(template.prompt)}
              className="group flex flex-col bg-zinc-900 border border-zinc-800 hover:border-zinc-600 p-6 rounded-2xl text-left transition-all hover:shadow-xl hover:-translate-y-1"
            >
              <div className={`w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mb-4 group-hover:bg-zinc-700 transition-colors ${template.color}`}>
                <template.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{template.name}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6 flex-1">
                {template.description}
              </p>
              <div className="w-full py-2 bg-zinc-800 rounded-lg text-center text-sm font-medium text-zinc-300 group-hover:bg-white group-hover:text-black transition-colors">
                Use Template
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
