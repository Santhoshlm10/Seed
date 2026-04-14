import { useMemo, useState } from "react";
import { Airline, Animal, ChevronDown, ChevronRight, Color, Commerce, Company, Database, DataType, Date, Finance, Food, Git, Hacker, Helpers, Image, Internet, Location, Lorem, Music, Number, Person, Phone, Science, String, System, Vehicle, Word } from "./Icons";

/**
 * There was no such component like accordion from Radix UI
 * so here is the custom created accordion
 */
const Accordion = ({
  title,
  children,
  titleKey
}: {
  title: string;
  children: React.ReactElement;
  titleKey?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  const ItemIcon:any = useMemo(() => {
    return {
      "Airlines": Airline,
      "Animal":Animal,
      "Color":Color,
      "Commerce":Commerce,
      "Company":Company,
      "Database":Database,
      "Datatype":DataType,
      "Date":Date,
      "Finance":Finance,
      "Food":Food,
      "Git":Git,
      "Hacker":Hacker,
      "Helpers":Helpers,
      "Image":Image,
      "Internet":Internet,
      "Location":Location,
      "Lorem":Lorem,
      "Music":Music,
      "Number":Number,
      "Person":Person,
      "Phone":Phone,
      "Science":Science,
      "String":String,
      "System":System,
      "Vehicle":Vehicle,
      "Word":Word
    }
  },[])

  const Icon = titleKey ? ItemIcon[titleKey] : undefined;

  return (
    <div className={"mb-2"}>
      <div
        className="flex items-center p-[10px] gap-[10px] cursor-pointer"
        onClick={toggleAccordion}
      >
        <span className="mr-[10px] flex items-center">
          {Icon && <Icon />}
        </span>
        <span
          className={
            "font-semibold flex flex-row gap-2 items-center justify-between w-full"
          }
        >
          {title}
          {isOpen ? <ChevronDown /> : <ChevronRight />}
        </span>
      </div>
      {isOpen && (
        <div className="pl-[2px] pt-[2px] pb-[2px] ml-[40px]">{children}</div>
      )}
    </div>
  );
};

export default Accordion;
