import { WorkflowCanvas } from "@/components/workflows/workflow-canvas";

export default function WorkflowsPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Workflows</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          React Flow canvas placeholder — connect nodes and BullMQ workers in later phases.
        </p>
      </div>
      <WorkflowCanvas />
    </section>
  );
}
