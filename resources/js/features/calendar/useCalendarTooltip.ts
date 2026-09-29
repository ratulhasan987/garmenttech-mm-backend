import { useEffect, useRef } from "react";

export type TooltipPayload = {
  title: string;
};

export function useCalendarTooltip() {
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const tooltip = document.createElement("div");
    tooltip.className = "fc-tooltip";
    tooltip.style.display = "none";
    document.body.appendChild(tooltip);
    tooltipRef.current = tooltip;

    return () => {
      tooltip.remove();
    };
  }, []);

  const showTooltip = (e: MouseEvent, payload: TooltipPayload) => {
    if (!tooltipRef.current) return;

    tooltipRef.current.innerText = payload.title;
    tooltipRef.current.style.display = "block";
    tooltipRef.current.style.top = e.pageY + 10 + "px";
    tooltipRef.current.style.left = e.pageX + 10 + "px";
  };

  const moveTooltip = (e: MouseEvent) => {
    if (!tooltipRef.current) return;

    tooltipRef.current.style.top = e.pageY + 10 + "px";
    tooltipRef.current.style.left = e.pageX + 10 + "px";
  };

  const hideTooltip = () => {
    if (!tooltipRef.current) return;
    tooltipRef.current.style.display = "none";
  };

  return {
    showTooltip,
    moveTooltip,
    hideTooltip,
  };
}
