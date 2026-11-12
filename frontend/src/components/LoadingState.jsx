import { LoaderCircle } from "lucide-react";

export default function LoadingState({ label = "Loading your records…" }) {
  return <div className="loading-state"><LoaderCircle size={23} className="spin" /><span>{label}</span></div>;
}
