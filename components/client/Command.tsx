import { actFromObserve, getSuggestions, goto } from "@/app/api/stagehand/run";
import { editableAtom, sessionIdAtom, stepsAtom } from "@/atoms";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ObserveResult } from "@browserbasehq/stagehand";
import { useAtom, useAtomValue } from "jotai";
import { useState, useEffect } from "react";

const COMMAND = "What is the stock price of Nvidia?";

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [command, setCommand] = useState<"NA" | "GOTO" | "EXTRACT" | "ACT">(
    "NA"
  );
  const [steps, setSteps] = useAtom(stepsAtom);
  const [editable, setEditable] = useAtom(editableAtom);
  const [observeResults, setObserveResults] = useState<ObserveResult[]>([]);
  const sessionId = useAtomValue(sessionIdAtom);
  const [customInstruction, setCustomInstruction] = useState("");
  const gotoSuggestions = [
    "https://www.google.com",
    "https://news.ycombinator.com",
    "https://github.com",
  ];

  useEffect(() => {
    if (!editable) {
      setCommand("NA");
    }
  }, [editable]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const cmd = e.metaKey || e.ctrlKey;
      if (cmd && e.key === "k") {
        e.preventDefault();
        setCommand("NA");
        setOpen(!open);
      }

      if (cmd && e.key === "g") {
        e.preventDefault();
        console.log("GOTO");
        setCommand("GOTO");
      }
      if (cmd && e.key === "a") {
        e.preventDefault();
        console.log("ACT");
        setCommand("ACT");
      }

      if (open && (e.key === "Enter" || e.code === "NumpadEnter")) {
        e.preventDefault();
        alert(customInstruction);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, customInstruction]);

  useEffect(() => {
    if (command !== "NA") {
      setOpen(true);
    }
  }, [command]);

  function addGoto(url: string) {
    setEditable(false);
    setOpen(false);
    setSteps([
      ...steps,
      {
        reasoning: "",
        execution: {
          action: "GOTO",
          instruction: url,
        },
      },
    ]);
    goto(url, sessionId!)
      .then(async () => {
        const results = await getSuggestions(COMMAND, sessionId!);
        setObserveResults(results);
      })
      .finally(() => {
        setEditable(true);
      });
  }

  function addActFromObserve(observeResult: ObserveResult) {
    setEditable(false);
    setOpen(false);
    setSteps([
      ...steps,
      {
        reasoning: "",
        execution: {
          action: "ACT",
          instruction: observeResult.description,
        },
      },
    ]);
    actFromObserve(observeResult, sessionId!)
      .then(async () => {
        const results = await getSuggestions(COMMAND, sessionId!);
        setObserveResults(results);
      })
      .finally(() => {
        setEditable(true);
      });
  }

  if (!editable) {
    return (
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">UIhhhh</h1>
      </div>
    );
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) {
          setCommand("NA");
        }
      }}
    >
      <CommandInput
        placeholder="Type a command or search..."
        onValueChange={(value) => setCustomInstruction(value)}
      />
      <CommandList>
        <CommandEmpty>
          {customInstruction === ""
            ? "No results found."
            : `Custom command: "${customInstruction}"`}
        </CommandEmpty>
        <CommandGroup heading="Suggestions">
          {command === "NA" && (
            <>
              <CommandItem onSelect={() => setCommand("GOTO")}>
                GOTO
              </CommandItem>
              <CommandItem onSelect={() => setCommand("EXTRACT")}>
                EXTRACT
              </CommandItem>
              <CommandItem onSelect={() => setCommand("ACT")}>ACT</CommandItem>
            </>
          )}
          {command === "GOTO" && (
            <>
              {gotoSuggestions.map((suggestion) => (
                <CommandItem
                  key={suggestion}
                  onSelect={() => addGoto(suggestion)}
                >
                  {suggestion}
                </CommandItem>
              ))}
            </>
          )}
          {command === "ACT" && (
            <>
              {observeResults.map((result) => (
                <CommandItem
                  key={result.selector}
                  onSelect={() => addActFromObserve(result)}
                >
                  <span className="mr-2">
                    <Action
                      action={
                        result.method?.toUpperCase() as
                          | "FILL"
                          | "CLICK"
                          | "OTHER"
                      }
                    />{" "}
                    {result.description}
                  </span>
                </CommandItem>
              ))}
            </>
          )}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

function Action({ action }: { action: "FILL" | "CLICK" | "OTHER" }) {
  return (
    <div
      className={`inline-flex items-center px-2 py-1 rounded-sm text-xs ${
        action === "FILL"
          ? "bg-blue-100 text-blue-800 px-3"
          : action === "CLICK"
          ? "bg-green-100 text-green-800 px-2"
          : "bg-gray-100 text-gray-800"
      }`}
    >
      {action}
    </div>
  );
}
