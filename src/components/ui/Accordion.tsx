import { useState } from "react";
import { ChevronDown, ChevronRight } from "./Icons";

/**
 * There was no such component like accordion from Radix UI
 * so here is the custom created accordion
 */
const Accordion = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactElement;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={"mb-2"}>
      <div
        className="flex items-center p-[10px] gap-[10px] cursor-pointer"
        onClick={toggleAccordion}
      >
        <span className="mr-[10px] flex items-center">
          {isOpen ? (
            <ChevronDown />
          ) : (
            <ChevronRight />
          )}
        </span>
        <span className={"font-semibold"}>{title}</span>
      </div>
      {isOpen && (
        <div className="pl-[2px] pt-[2px] pb-[2px] ml-[40px]">{children}</div>
      )}
    </div>
  );
};

export default Accordion;