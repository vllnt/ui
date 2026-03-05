"use client";

import { useState } from "react";

import { Check, Copy, Terminal as TerminalIcon } from "lucide-react";

import { Button } from "../button";

export type TerminalLine = {
  content: string;
  type: "command" | "comment" | "output";
};

export type TerminalProps = {
  copyable?: boolean;
  lines: TerminalLine[];
  title?: string;
};

export function Terminal({
  copyable = true,
  lines,
  title = "Terminal",
}: TerminalProps) {
  const [copied, setCopied] = useState(false);

  const commands = lines
    .filter((l) => l.type === "command")
    .map((l) => l.content);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(commands.join("\n"));
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="my-6 rounded-lg border bg-zinc-950 dark:bg-zinc-900 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 dark:bg-zinc-800 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <TerminalIcon className="h-4 w-4 text-zinc-400" />
          <span className="text-sm font-medium text-zinc-300">{title}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <div className="h-3 w-3 rounded-full bg-yellow-500" />
          <div className="h-3 w-3 rounded-full bg-green-500" />
        </div>
      </div>
      <div className="relative">
        <div className="p-4 font-mono text-sm space-y-1 overflow-x-auto">
          {lines.map((line, index) => (
            <div className="flex items-start" key={index}>
              {line.type === "command" && (
                <>
                  <span className="text-green-400 mr-2 select-none">$</span>
                  <span className="text-zinc-100">{line.content}</span>
                </>
              )}
              {line.type === "output" && (
                <span className="text-zinc-400">{line.content}</span>
              )}
              {line.type === "comment" && (
                <span className="text-zinc-600 italic"># {line.content}</span>
              )}
            </div>
          ))}
        </div>
        {copyable && commands.length > 0 ? (
          <Button
            className="absolute top-2 right-2 h-8 w-8 bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
            onClick={handleCopy}
            size="icon"
            variant="ghost"
          >
            {copied ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export type SimpleTerminalProps = {
  children: string;
  title?: string;
};

export function SimpleTerminal({
  children,
  title = "Terminal",
}: SimpleTerminalProps) {
  const [copied, setCopied] = useState(false);

  const lines = children
    .trim()
    .split("\n")
    .map((line): TerminalLine => {
      if (line.startsWith("$ ")) {
        return { content: line.slice(2), type: "command" };
      }
      if (line.startsWith("# ")) {
        return { content: line.slice(2), type: "comment" };
      }
      return { content: line, type: "output" };
    });

  const commands = lines
    .filter((l) => l.type === "command")
    .map((l) => l.content);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(commands.join("\n"));
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="my-6 rounded-lg border bg-zinc-950 dark:bg-zinc-900 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 dark:bg-zinc-800 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <TerminalIcon className="h-4 w-4 text-zinc-400" />
          <span className="text-sm font-medium text-zinc-300">{title}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <div className="h-3 w-3 rounded-full bg-yellow-500" />
          <div className="h-3 w-3 rounded-full bg-green-500" />
        </div>
      </div>
      <div className="relative">
        <div className="p-4 font-mono text-sm space-y-1 overflow-x-auto">
          {lines.map((line, index) => (
            <div className="flex items-start" key={index}>
              {line.type === "command" && (
                <>
                  <span className="text-green-400 mr-2 select-none">$</span>
                  <span className="text-zinc-100">{line.content}</span>
                </>
              )}
              {line.type === "output" && (
                <span className="text-zinc-400">{line.content}</span>
              )}
              {line.type === "comment" && (
                <span className="text-zinc-600 italic"># {line.content}</span>
              )}
            </div>
          ))}
        </div>
        {commands.length > 0 && (
          <Button
            className="absolute top-2 right-2 h-8 w-8 bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
            onClick={handleCopy}
            size="icon"
            variant="ghost"
          >
            {copied ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
