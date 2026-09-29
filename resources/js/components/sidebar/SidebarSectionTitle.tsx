import { useSidebar } from "@/hooks/use-sidebar";

type SidebarSectionTitleProps = {
  title: string;
};

const SidebarSectionTitle = ({ title }: SidebarSectionTitleProps) => {
  const { collapsed, hoverSidebar } = useSidebar();
  return (
    <li
      style={{
        position: "relative",
        padding: "25px 0 6px 0",
        marginTop: "0px",
        marginBottom: "12px",
        display: !collapsed || hoverSidebar ? "block" : "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          width: "100%",
          height: "1px",
          background: "rgba(255,255,255,0.2)",
          transform: "translateX(-50%)",
        }}
      />
      <h6 className="mb-0 text-uppercase text-white">{title}</h6>
    </li>
  );
};

export default SidebarSectionTitle;
