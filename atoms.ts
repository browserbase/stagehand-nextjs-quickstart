import { ObserveResult } from "@browserbasehq/stagehand";
import { atom } from "jotai";

export type Action = "ACT" | "GOTO" | "EXTRACT";

export type Step = {
  reasoning: string;
  execution?: {
    action: Action;
    instruction: string;
    params?: ObserveResult | unknown;
  };
  result?: string | unknown;
};

export const sessionIdAtom = atom<string | undefined>(undefined);
export const runningAtom = atom<boolean>(false);
export const errorAtom = atom<string | undefined>(undefined);
export const warningAtom = atom<string | undefined>(undefined);
export const debugUrlAtom = atom<string | undefined>(undefined);
export const stepsAtom = atom<Step[]>([]);
export const editableAtom = atom<boolean>(true);
