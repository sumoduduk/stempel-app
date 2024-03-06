import { invoke } from "@tauri-apps/api/core";
import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { InvokeParamsType } from "~/types/img-types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convInt(num: number) {
  return Math.floor(num);
}

export async function startInvoke(param: InvokeParamsType) {
  try {
    return await invoke("watermark_command", param);
  } catch (error) {
    console.error(error);
  }
}
