import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Paniel · Catalog" };

/** Alias de digitação: `/paniel` → `/painel`. */
export default function Paniel() {
  redirect("/painel");
}
