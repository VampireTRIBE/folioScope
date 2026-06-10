import { useEffect, useState } from "react";

// ! Styles
import portfolioNavlinkStyle from "./portfolionavlink.module.css";

// ! Componets
import Button from "../../../../../components/UI/buttons/Button";

const PortfolioNavlink = () => {
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    {
      id: "overview",
      text: "Overview",
    },
    {
      id: "analysis",
      text: "Analysis",
    },
    {
      id: "comparison",
      text: "Comparison",
    },
  ];

  const handleScrollToSection = (id) => {
    const section = document.getElementById(id);
    if (!section) return;
    section.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-100px 0px -90% 0px",
        threshold: 0,
      },
    );

    sections.forEach((sectionData) => {
      const section = document.getElementById(sectionData.id);

      if (section) {
        observer.observe(section);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <nav className={portfolioNavlinkStyle.navlinkContainer}>
      {sections.map((section, indx) => (
        <Button
          key={section?.id ?? indx}
          text={section.text}
          varient={
            activeSection === section.id
              ? "navlinkButtonActive"
              : "navlinkButton"
          }
          onClick={() => handleScrollToSection(section.id)}
        />
      ))}
    </nav>
  );
};

export default PortfolioNavlink;
