'use client';

import React from 'react';
import { BookOpen, Info } from 'lucide-react';

interface ResearchExplanationCardProps {
  domain: 'fiscal' | 'procurement';
}

export default function ResearchExplanationCard({ domain }: ResearchExplanationCardProps) {
  const content = domain === 'fiscal' ? {
    title: "Research Foundation: Benford's Law",
    explanation: "According to Benford's Law (used by auditors worldwide, including CAG-cited studies), naturally occurring financial transactions follow a predictable digit distribution. Large deviations may indicate manual manipulation.",
    keyPoints: [
      "Naturally occurring numbers start with '1' ~30% of the time",
      "Numbers starting with '9' should appear ~5% of the time",
      "Deviations suggest clustering near approval thresholds",
      "Used by forensic accountants globally for decades"
    ],
    sources: [
      "Comptroller & Auditor General (CAG) methodology",
      "Nigrini, M. (1996) - Digital Analysis in Auditing",
      "Adopted by IRS, FBI, and global audit bodies"
    ]
  } : {
    title: "Research Foundation: Bid Rigging Detection",
    explanation: "Economic research shows that competitive bidding produces predictable price dispersion patterns. Abnormal clustering or identical bids may indicate collusion among vendors.",
    keyPoints: [
      "Competitive markets show natural price variation",
      "Cover bidding creates suspicious patterns",
      "Bid rotation shows in temporal sequences",
      "Win rates should be proportional to capacity"
    ],
    sources: [
      "OECD Competition Guidelines",
      "Porter & Zona (1993) - Bid rigging detection",
      "Competition Commission of India frameworks"
    ]
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="bg-blue-600 rounded-lg p-3">
          <BookOpen className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            {content.title}
            <span className="text-xs font-normal text-blue-600 bg-blue-100 px-2 py-1 rounded">
              Step 1: Research Expectation
            </span>
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            {content.explanation}
          </p>
        </div>
      </div>

      {/* Key Points */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {content.keyPoints.map((point, idx) => (
          <div key={idx} className="flex items-start gap-2 bg-white rounded-lg p-3 border border-blue-100">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
              {idx + 1}
            </div>
            <p className="text-sm text-gray-700">{point}</p>
          </div>
        ))}
      </div>

      {/* Research Sources */}
      <div className="bg-white rounded-lg p-4 border border-blue-100">
        <div className="flex items-center gap-2 mb-3">
          <Info className="h-4 w-4 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-900">
            Research Sources & Standards
          </h3>
        </div>
        <ul className="space-y-1">
          {content.sources.map((source, idx) => (
            <li key={idx} className="text-xs text-gray-600 pl-4 relative before:content-['→'] before:absolute before:left-0 before:text-blue-600">
              {source}
            </li>
          ))}
        </ul>
      </div>

      {/* Important Note */}
      <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-xs text-yellow-800">
          <strong>Important:</strong> This analysis identifies statistical deviations from research expectations. 
          Deviations do not prove fraud — they are signals for desk review and field verification.
        </p>
      </div>
    </div>
  );
}
