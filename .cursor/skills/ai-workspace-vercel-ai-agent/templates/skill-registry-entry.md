# Template — new entry in `lib/ai/skills.ts`

```ts
myFeature: {
  name: "My feature",
  description: "Short label for UI or logs",
  prompt: `System instructions for this skill.
           Be specific about output format.`,
  tools: ["listTasks", "createTask"], // logical names; must match wired tool names later
},
```

Add the key to the `skills` record exported from `lib/ai/skills.ts`. Wire execution in agent/orchestrator code separately.
