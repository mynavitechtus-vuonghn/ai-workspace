"use client";

import { Background, Controls, ReactFlow } from "reactflow";
import "reactflow/dist/style.css";

export function WorkflowCanvas() {
  return (
    <div className="h-[min(70vh,560px)] w-full rounded-xl border border-border bg-muted/20">
      <ReactFlow nodes={[]} edges={[]} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
