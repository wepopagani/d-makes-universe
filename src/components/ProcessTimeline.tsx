import React from 'react';

interface Step {
  step: number;
  title: string;
  description: string;
}

interface ProcessTimelineProps {
  steps: Step[];
  title?: string;
}

const ProcessTimeline: React.FC<ProcessTimelineProps> = ({ steps, title }) => {
  return (
    <div className="container mx-auto">
      {title && <h2 className="text-3xl font-bold text-center mb-12">{title}</h2>}
      
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-1/2 top-0 h-full w-0.5 bg-gray-200 transform -translate-x-1/2 hidden md:block"></div>
        
        <div className="space-y-16 md:space-y-24">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Mobile Version */}
              <div className="md:hidden">
                <div className="flex items-start">
                  <div className="flex-shrink-0 z-10 flex items-center justify-center w-10 h-10 bg-brand-accent rounded-full shadow-md">
                    <span className="text-white font-bold">{step.step}</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-brand-gray">{step.description}</p>
                  </div>
                </div>
              </div>
              
              {/* Desktop Version with alternating sides */}
              <div className="hidden md:block">
                <div className="flex items-center justify-center">
                  {/* Circle in the middle */}
                  <div className="absolute z-10 flex items-center justify-center w-10 h-10 bg-brand-accent rounded-full left-1/2 transform -translate-x-1/2 shadow-md">
                    <span className="text-white font-bold">{step.step}</span>
                  </div>
                  
                  {/* Left Side Content (even index) */}
                  <div className={`w-1/2 pr-16 ${index % 2 === 0 ? 'block' : 'invisible'}`}>
                    <div className="text-right">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{step.title}</h3>
                      <p className="text-brand-gray">{step.description}</p>
                    </div>
                  </div>
                  
                  {/* Right Side Content (odd index) */}
                  <div className={`w-1/2 pl-16 ${index % 2 === 1 ? 'block' : 'invisible'}`}>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{step.title}</h3>
                      <p className="text-brand-gray">{step.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProcessTimeline; 