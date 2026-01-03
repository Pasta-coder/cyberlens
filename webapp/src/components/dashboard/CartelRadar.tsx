"use client";

import { useState } from "react";
import { Users, Building2, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import ExplainPanel from "./ExplainPanel";

interface Buyer {
  id: string;
  name: string;
  contracts: number;
  total_spend: number;
  risk_score: number;
}

interface Supplier {
  id: string;
  name: string;
  contracts: number;
  total_spend: number;
  risk_score: number;
}

interface Edge {
  buyer_id: string;
  supplier_id: string;
  contracts: number;
  value: number;
}

interface CartelRadarProps {
  buyers: Buyer[];
  suppliers: Supplier[];
  edges: Edge[];
}

export default function CartelRadar({ buyers, suppliers, edges }: CartelRadarProps) {
  const [selectedEntity, setSelectedEntity] = useState<(Buyer | Supplier) & { type: string } | null>(null);
  const [highlightedEdges, setHighlightedEdges] = useState<string[]>([]);

  // Add safety checks
  if (!buyers || !suppliers || !edges || 
      !Array.isArray(buyers) || !Array.isArray(suppliers) || !Array.isArray(edges)) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No network data available</p>
      </div>
    );
  }

  const handleEntityClick = (entity: Buyer | Supplier, type: "buyer" | "supplier") => {
    setSelectedEntity({ ...entity, type });
    
    // Highlight connected edges
    const connected = edges
      .filter((edge) =>
        type === "buyer" ? edge.buyer_id === entity.id : edge.supplier_id === entity.id
      )
      .map((edge) => `${edge.buyer_id}-${edge.supplier_id}`);
    
    setHighlightedEdges(connected);
  };

  const getEdgeThickness = (value: number, maxValue: number) => {
    const normalized = (value / maxValue) * 8;
    return Math.max(2, Math.min(normalized, 8));
  };

  const maxEdgeValue = Math.max(...edges.map((e) => e.value));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  };

  // Detect suspicious patterns
  const detectMonopoly = (buyerId: string) => {
    const buyerEdges = edges.filter((e) => e.buyer_id === buyerId);
    if (buyerEdges.length === 0) return false;
    
    const totalValue = buyerEdges.reduce((sum, e) => sum + e.value, 0);
    const maxSupplierValue = Math.max(...buyerEdges.map((e) => e.value));
    
    return (maxSupplierValue / totalValue) > 0.7; // 70%+ concentration
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Cartel Detection Network (Radar)
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Relationship mapping between buyers and suppliers
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Network Visualization (Simplified) */}
        <div className="lg:col-span-2">
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 min-h-[500px]">
            {/* Buyers (Left Side) */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Buyers
                </h3>
                <div className="space-y-3">
                  {buyers.map((buyer) => {
                    const isMonopoly = detectMonopoly(buyer.id);
                    const isSelected = selectedEntity?.id === buyer.id;
                    
                    return (
                      <motion.button
                        key={buyer.id}
                        onClick={() => handleEntityClick(buyer, "buyer")}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          isSelected
                            ? "border-cyan-500 bg-cyan-50 shadow-lg"
                            : "border-gray-300 bg-white hover:border-cyan-300 hover:shadow-md"
                        } ${isMonopoly ? "ring-2 ring-red-300" : ""}`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-gray-900 text-sm truncate">
                            {buyer.name}
                          </p>
                          {isMonopoly && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                              ⚠️ Monopoly
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>{buyer.contracts} contracts</span>
                          <span className={`font-semibold ${
                            buyer.risk_score >= 70 ? "text-red-600" :
                            buyer.risk_score >= 40 ? "text-yellow-600" : "text-green-600"
                          }`}>
                            Risk: {buyer.risk_score}
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Suppliers (Right Side) */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Suppliers
                </h3>
                <div className="space-y-3">
                  {suppliers.map((supplier) => {
                    const isSelected = selectedEntity?.id === supplier.id;
                    
                    return (
                      <motion.button
                        key={supplier.id}
                        onClick={() => handleEntityClick(supplier, "supplier")}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          isSelected
                            ? "border-cyan-500 bg-cyan-50 shadow-lg"
                            : "border-gray-300 bg-white hover:border-cyan-300 hover:shadow-md"
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <p className="font-medium text-gray-900 text-sm mb-2 truncate">
                          {supplier.name}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>{supplier.contracts} contracts</span>
                          <span className={`font-semibold ${
                            supplier.risk_score >= 70 ? "text-red-600" :
                            supplier.risk_score >= 40 ? "text-yellow-600" : "text-green-600"
                          }`}>
                            Risk: {supplier.risk_score}
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Connection Summary */}
            <div className="mt-6 pt-6 border-t border-gray-300">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Key Connections
              </h4>
              <div className="space-y-2">
                {edges.slice(0, 5).map((edge) => {
                  const buyer = buyers.find((b) => b.id === edge.buyer_id);
                  const supplier = suppliers.find((s) => s.id === edge.supplier_id);
                  const isHighlighted = highlightedEdges.includes(`${edge.buyer_id}-${edge.supplier_id}`);
                  
                  return (
                    <div
                      key={`${edge.buyer_id}-${edge.supplier_id}`}
                      className={`flex items-center justify-between p-2 rounded-lg text-sm ${
                        isHighlighted ? "bg-cyan-100 border border-cyan-300" : "bg-white border border-gray-200"
                      }`}
                    >
                      <div className="flex-1 truncate">
                        <span className="font-medium text-gray-900">{buyer?.name}</span>
                        <span className="text-gray-500 mx-2">→</span>
                        <span className="text-gray-700">{supplier?.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span>{edge.contracts} deals</span>
                        <span className="font-semibold">{formatCurrency(edge.value)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Pattern Indicators */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-xs text-red-600 mb-1">Monopoly Patterns</p>
              <p className="text-2xl font-bold text-red-900">
                {buyers.filter((b) => detectMonopoly(b.id)).length}
              </p>
              <p className="text-xs text-red-700 mt-1">Buyers with 70%+ supplier concentration</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs text-blue-600 mb-1">Total Relationships</p>
              <p className="text-2xl font-bold text-blue-900">{edges.length}</p>
              <p className="text-xs text-blue-700 mt-1">Active buyer-supplier connections</p>
            </div>
          </div>
        </div>

        {/* Explain Panel */}
        <div>
          {selectedEntity ? (
            <ExplainPanel
              entityName={selectedEntity.name}
              entityType={selectedEntity.type as "buyer" | "supplier"}
              riskScore={selectedEntity.risk_score}
              totalContracts={selectedEntity.contracts}
              totalSpend={selectedEntity.total_spend}
              fraudSignals={[
                ...(selectedEntity.risk_score >= 70
                  ? [
                      {
                        signal_type: "high_concentration",
                        description: "Concentrated awarding patterns detected",
                        severity: "high" as const,
                      },
                    ]
                  : []),
                ...(detectMonopoly(selectedEntity.id)
                  ? [
                      {
                        signal_type: "monopoly_pattern",
                        description: "Single supplier dominates contracts",
                        severity: "high" as const,
                      },
                    ]
                  : []),
              ]}
              sampleContracts={edges
                .filter((e) =>
                  selectedEntity.type === "buyer"
                    ? e.buyer_id === selectedEntity.id
                    : e.supplier_id === selectedEntity.id
                )
                .slice(0, 3)
                .map((e) => ({
                  id: `${e.buyer_id}-${e.supplier_id}`,
                  title: `Contract ${e.contracts} items`,
                  value: e.value,
                }))}
            />
          ) : (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center h-full flex flex-col items-center justify-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-600">
                Click on a buyer or supplier to see detailed analysis and fraud indicators
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 border-t border-gray-200 pt-4">
        <h3 className="font-semibold text-gray-900 mb-2">How to read this network</h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          This visualization shows relationships between government buyers and suppliers. 
          <strong> Star patterns</strong> (one buyer, one dominant supplier) indicate potential 
          favoritism. <strong> Tight clusters</strong> suggest possible cartel behavior. Entities 
          with red rings show monopoly patterns requiring audit attention.
        </p>
      </div>
    </div>
  );
}