import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { DataType } from "@/types/game";

interface DataPanelProps {
  dataTypes: Record<string, DataType>;
}

const DataPanel = ({ dataTypes }: DataPanelProps) => {
  const [inventoryExpanded, setInventoryExpanded] = useState(false);

  return (
    <div className="absolute top-6 right-6 bg-card/90 backdrop-blur-xl border border-border shadow-xl rounded-xl p-5 min-w-[260px] z-50">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center text-lg">
          📊
        </div>
        <h4 className="font-semibold text-foreground flex-1">Data Inventory</h4>
        <button
          onClick={() => setInventoryExpanded(!inventoryExpanded)}
          className="p-1 hover:bg-muted rounded transition-colors"
          aria-label="Toggle data inventory"
        >
          {inventoryExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>
      
      {inventoryExpanded && (
        <div className="space-y-2 mt-4 pt-4 border-t border-border">
          {Object.entries(dataTypes).map(([type, data]) => (
            <div
              key={type}
              className={`p-3 rounded-lg border transition-all ${
                data.owned 
                  ? 'bg-gradient-overlay border-primary/20' 
                  : 'bg-muted/50 border-border opacity-60'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">{type}</span>
                <span className="text-xs font-semibold text-primary">{data.value}</span>
              </div>
              {!data.owned && (
                <div className="text-xs text-muted-foreground mt-1">Collecting...</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DataPanel;
