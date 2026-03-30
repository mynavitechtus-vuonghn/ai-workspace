"use client";

import { useRef } from "react";

import { clearGoogleGenerativeAiApiKeyOverride, saveGoogleGenerativeAiApiKey } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  hasStoredOverride: boolean;
  effectiveSource: "env" | "settings" | "none";
  defaultModelLabel: string;
};

export function GeminiKeyForm({ hasStoredOverride, effectiveSource, defaultModelLabel }: Props) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="space-y-4">
      <form
        ref={formRef}
        action={async (formData) => {
          await saveGoogleGenerativeAiApiKey(formData);
          formRef.current?.reset();
        }}
        className="space-y-3"
      >
        <div className="space-y-2">
          <Label htmlFor="googleGenerativeAiApiKey">GOOGLE_GENERATIVE_AI_API_KEY (Gemini)</Label>
          <Input
            id="googleGenerativeAiApiKey"
            name="googleGenerativeAiApiKey"
            type="password"
            autoComplete="off"
            placeholder={
              hasStoredOverride ? "•••••••• (đã lưu — nhập mới để thay)" : "Lấy free tại aistudio.google.com/apikey"
            }
            className="font-mono text-xs md:text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Model mặc định: <span className="font-medium text-foreground">{defaultModelLabel}</span> (có thể đổi bằng{" "}
            <code className="text-[0.7rem]">AI_MODEL_ID</code> trong env). Chat ưu tiên key trong Settings, sau đó{" "}
            <code className="text-[0.7rem]">GOOGLE_GENERATIVE_AI_API_KEY</code>.
          </p>
        </div>
        <Button type="submit">Lưu key</Button>
        <p className="text-xs text-muted-foreground">
          Nguồn hiện tại:{" "}
          <span className="font-medium text-foreground">
            {effectiveSource === "settings" && "Key đã lưu (tài khoản)"}
            {effectiveSource === "env" && ".env / server"}
            {effectiveSource === "none" && "Chưa có — chat sẽ lỗi"}
          </span>
        </p>
      </form>

      {hasStoredOverride ? (
        <form action={clearGoogleGenerativeAiApiKeyOverride}>
          <Button type="submit" variant="outline" size="sm" className="text-destructive hover:text-destructive">
            Xóa key đã lưu (dùng lại env nếu có)
          </Button>
        </form>
      ) : null}
    </div>
  );
}
