'use client';

import React, { useState } from 'react';
import { BookOpen, X, Database, TrendingUp, AlertCircle } from 'lucide-react';

interface MethodologyData {
  title: string;
  explanation: string;
  data_sources: string[];
  disclaimer: string;
}

interface MethodologyModalProps {
  data?: MethodologyData;
}

export default function MethodologyModal({ data }: MethodologyModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!data) {
    return null;
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 group z-40"
      >
        <BookOpen className="h-5 w-5" />
        <span className="hidden group-hover:inline-block text-sm font-medium pr-1">
          Methodology
        </span>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <BookOpen className="h-6 w-6" />
                  {data.title}
                </h2>
                <p className="text-sm text-blue-100">
                  Research-backed assumptions and data transparency
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Main Explanation */}
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Methodology Overview
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {data.explanation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Data Sources */}
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Database className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">
                    Data Sources
                  </h3>
                </div>
                <ul className="space-y-2">
                  {data.data_sources.map((source, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-blue-600 font-bold mt-1">→</span>
                      <span>{source}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Key Concepts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                    What is "Expected"?
                  </h4>
                  <p className="text-xs text-gray-700">
                    Projected beneficiary count based on economic growth models. 
                    When income rises, poverty declines, reducing welfare needs.
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                    What is "Actual"?
                  </h4>
                  <p className="text-xs text-gray-700">
                    Real enrollment numbers from government welfare databases. 
                    Includes all active beneficiaries as per official records.
                  </p>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 rounded">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Important Disclaimer
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {data.disclaimer}
                    </p>
                  </div>
                </div>
              </div>

              {/* Research Context */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 text-sm">
                  Why Economic Models Matter
                </h4>
                <div className="space-y-2 text-xs text-gray-700">
                  <p>
                    <strong>Growth-Poverty Elasticity:</strong> Decades of research show that when 
                    per capita income grows, poverty rates typically decline. This is called "poverty elasticity."
                  </p>
                  <p>
                    <strong>Delhi's Context:</strong> Between 2018-2026, Delhi's economy grew 35%. 
                    Economic models suggest this should reduce welfare dependency by ~18%.
                  </p>
                  <p>
                    <strong>The Gap:</strong> Instead of declining, actual enrollment increased. 
                    This mismatch warrants administrative review — not accusations.
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
