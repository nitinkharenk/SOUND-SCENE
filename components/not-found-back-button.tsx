"use client";

import { useRouter } from "next/navigation";

export function NotFoundBackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="route-action focus-ring"
    >
      Go Back
    </button>
  );
}
