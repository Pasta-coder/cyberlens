'use client';

import React from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

interface NarrativeData {
  key_findings: string[];
  possible_reasons: string[];
  recommendations: string[];
}

interface GapNarrativeProps {
  data?: NarrativeData;
}

export default function GapNarrative({ data }: GapNarrativeProps) {
  if (!data) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-2">
          <Info className="h-5 w-5 text-blue-600" />
          What Does This Gap Mean?
        </h2>
        <p className="text-sm text-gray-700 italic">
          Auto-generated insights from data patterns — designed for policy-level review, not individual accusations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Key Findings */}
        <div className="bg-white rounded-lg p-4 border border-blue-100">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            Key Observations
          </h3>
          <ul className="space-y-2">
            {data.key_findings.map((finding, idx) => (
              <li key={idx} className="text-sm text-gray-700 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-blue-600 before:font-bold">
                {finding}
              </li>
            ))}
          </ul>
        </div>

        {/* Possible Reasons */}
        <div className="bg-white rounded-lg p-4 border border-yellow-100">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Info className="h-4 w-4 text-yellow-600" />
            Potential Explanations
          </h3>
          <ul className="space-y-2">
            {data.possible_reasons.map((reason, idx) => (
              <li key={idx} className="text-sm text-gray-700 pl-4 relative before:content-['→'] before:absolute before:left-0 before:text-yellow-600">
                {reason}
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-lg p-4 border border-green-100">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            Policy Actions
          </h3>
          <ul className="space-y-2">
            {data.recommendations.map((rec, idx) => (
              <li key={idx} className="text-sm text-gray-700 pl-4 relative before:content-['✓'] before:absolute before:left-0 before:text-green-600 before:font-bold">
                {rec}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
        <p className="text-xs text-gray-600 flex items-start gap-2">
          <Info className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <span>
            <strong>Important:</strong> This analysis identifies system-level patterns for administrative review. 
            Individual beneficiaries may have legitimate reasons for continued enrollment. 
            Field verification and cross-departmental coordination are recommended before policy changes.
          </span>
        </p>
      </div>
    </div>
  );
}
