import type { SVGProps } from "react";

export function CarDoorIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {/* door body: hinge on the left, roofline rising to the right */}
      <path d="M3.5 20V11.6L8 6h8.4a2 2 0 0 1 1.99 1.8L19.5 20Z" />
      {/* window sill (glass area sits above this line) */}
      <path d="M8 11.6h8.2" />
      {/* handle */}
      <path d="M13.3 15h3.2" />
    </svg>
  );
}
