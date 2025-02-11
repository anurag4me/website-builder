import React from 'react';
import { CheckCircle, Circle, Clock } from 'lucide-react';
import { Step } from '../types';

interface StepsListProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (stepId: number) => void;
}

export default function StepsList({ steps, currentStep, onStepClick }: StepsListProps) {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-gray-100">Steps</h2>
      </div>
      <div className="p-2">
        {steps.map((step, index) => (
          <div
            key={`${step.id}-${index}`}
            className={`flex items-start p-4 cursor-pointer border-b border-gray-700 ${
              currentStep === step.id
                ? 'bg-gray-700 border border-gray-600'
                : 'hover:bg-gray-700'
            }`}
            onClick={() => onStepClick(step.id)}
          >
            {step.status == "completed" ? (
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
            ) : step.status == "in-progress" ? (
              <Clock className="w-5 h-5 text-blue-400 mt-0.5" />
            ) : (
              <Circle className="w-5 h-5 text-gray-500 mt-0.5" />
            )}
            <div className="ml-3">
              <h3 className="font-medium text-gray-100">{step.title}</h3>
              <p className="text-sm text-gray-400">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};