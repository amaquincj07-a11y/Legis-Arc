import { ensureStaticParams } from "@/lib/static-export";

export async function generateOrdinanceStaticParams() {
  return ensureStaticParams<{ id: string }>([]);
}

export async function generateResolutionStaticParams() {
  return ensureStaticParams<{ id: string }>([]);
}

export async function generateSessionMinutesStaticParams() {
  return ensureStaticParams<{ id: string }>([]);
}

export async function generateLGUStaticParams() {
  return ensureStaticParams<{ id: string }>([]);
}
