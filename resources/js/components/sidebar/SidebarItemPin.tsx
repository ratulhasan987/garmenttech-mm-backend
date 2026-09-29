import { useSidebar } from "@/hooks/use-sidebar";
import { useState } from "react";

type PropsType = {
  hovered: boolean;
  id: string;
};

const SidebarItemPin = ({ hovered, id }: PropsType) => {
  const [pinHover, setPinHover] = useState(false);
  const { togglePin } = useSidebar();

  return (
    <i
      onClick={(e) => {
        e.stopPropagation();
        togglePin(id);
      }}
      onMouseEnter={() => setPinHover(true)}
      onMouseLeave={() => setPinHover(false)}
      className="fa fa-thumb-tack"
      style={{
        visibility: hovered || pinHover ? "visible" : "hidden",
        opacity: hovered || pinHover ? 1 : 0,
        position: "absolute",
        top: "-8px",
        right: "0px",
        borderRadius: "15px",
        padding: "4px 6px",
        color: "#fff",
        fontSize: "11px",
        backgroundColor: "#006666",
        border: "1px solid rgba(255,255,255,0.6)",
        transition: "opacity 0.2s ease",
        cursor: "pointer",
        zIndex: 3,
      }}
    />
  );
};

export default SidebarItemPin;
