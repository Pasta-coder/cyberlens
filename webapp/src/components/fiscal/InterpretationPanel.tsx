'use client';

import React, { useMemo } from 'react';
import { Scale, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { analyzeBenfordDeviations, Transaction } from '@/lib/benford';

interface InterpretationPanelProps {
  transactions: Transaction[];
}

export default function InterpretationPanel({ transactions }: InterpretationPanelProps) {
  const analysis = useMemo(() => {
    return analyzeBenfordDeviations(transactions);
  }, [transactions]);

  if (!transactions || transactions.length === 0) {
    return null;
  }

  const getStatusIcon = () => {
    if (analysis.requiresReview) {
      return <AlertCircle className="h-6 w-6 text-orange-600" />;
    }
    return <CheckCircle className="h-6 w-6 text-green-600" />;
  };

  const getStatusBadge = () => {
    if (analysis.requiresReview) {
      return (
        <span className="inline-block px-4 py-2 bg-orange-100 text-orange-700 border-2 border-orange-300 rounded-full text-sm font-semibold">
          REQUIRES REVIEW
        </span>
      );
    }
    return (
      <span className="inline-block px-4 py-2 bg-green-100 text-green-700 border-2 border-green-300 rounded-full text-sm font-semibold">
          NO SIGNIFICANT ANOMALIES
        </span>
    );
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          <div className="bg-purple-600 rounded-lg p-3">
            <Scale className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              Interpretation for Policy Teams
              <span className="text-xs font-normal text-purple-600 bg-purple-100 px-2 py-1 rounded">
                Step 4: Plain-Language Findings
              </span>
            </h2>
            <p className="text-sm text-gray-600">
              Auto-generated analysis for auditors, policymakers, and judicial review
            </p>
          </div>
        </div>
        {getStatusIcon()}
      </div>

      {/* Main Interpretation */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-5 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Statistical Finding</h3>
        </div>
        <p className="text-gray-800 leading-relaxed mb-4">
          {analysis.interpretation}
        </p>
        <div className="flex justify-end">
          {getStatusBadge()}
        </div>
      </div>

      {/* Detailed Breakdown */}
      {analysis.requiresReview && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* What This Means */}
          <div className="bg-white rounded-lg border border-orange-200 p-4">
            <h4 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              What This Means
            </h4>
            <ul className="space-y-2 text-xs text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold mt-0.5">•</span>
                <span>Spending pattern deviates from natural expectations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold mt-0.5">•</span>
                <span>Possible clustering near approval thresholds</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold mt-0.5">•</span>
                <span>May indicate strategic payment splitting</span>
              </li>
            </ul>
          </div>

          {/* Recommended Actions */}
          <div className="bg-white rounded-lg border border-blue-200 p-4">
            <h4 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              Recommended Actions
            </h4>
            <ul className="space-y-2 text-xs text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-0.5">→</span>
                <span>Conduct desk review of high-value transactions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-0.5">→</span>
                <span>Verify vendor documentation and approvals</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-0.5">→</span>
                <span>Cross-check with departmental approval logs</span>
              </li>
            </ul>
          </div>

          {/* Important Disclaimer */}
          <div className="bg-white rounded-lg border border-purple-200 p-4">
            <h4 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
              <Scale className="h-4 w-4 text-purple-600" />
              Legal Disclaimer
            </h4>
            <p className="text-xs text-gray-700 leading-relaxed">
              <strong>This is not proof of wrongdoing.</strong> Statistical anomalies require 
              field investigation and contextual analysis. Legitimate administrative patterns 
              (bulk procurement, quarterly cycles) can also cause deviations.
            </p>
          </div>
        </div>
      )}

      {/* No Anomalies Message */}
      {!analysis.requiresReview && (
        <div className="bg-white rounded-lg border-2 border-green-200 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Clean Bill of Health</h4>
              <p className="text-sm text-gray-700">
                Transaction digit distribution conforms to Benford's Law expectations. 
                No significant statistical anomalies detected in this dataset. 
                Routine auditing procedures are sufficient.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Methodology Note */}
      <div className="mt-4 bg-blue-50 rounded-lg p-3 border border-blue-200">
        <p className="text-xs text-blue-900">
          <strong>Methodology:</strong> This analysis uses Benford's Law (first-digit test) as adopted by 
          forensic auditors globally, including the Comptroller & Auditor General of India (CAG). 
          Sample size: <strong>{analysis.sampleSize.toLocaleString('en-IN')} transactions</strong>.
        </p>
      </div>
    </div>
  );
}
