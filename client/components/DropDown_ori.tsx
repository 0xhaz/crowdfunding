import React, { useEffect, useState } from "react";

export type Option = {
  name: string;
  idx: number;
};

interface DropDownProps {
  labelName?: string;
  value: string;
  options: Option[];
  handleChange: (e: any) => void;
  onClick: (e: any) => void;
}

const DropDown: React.FC<DropDownProps> = ({
  labelName,
  value,
  options,
  handleChange,
  onClick,
}: DropDownProps): JSX.Element => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const toggleDropDown = () => {
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    setIsExpanded(isExpanded);
  }, [isExpanded]);

  return (
    <label className="bg-[#1c1c24] flex  flex-col rounded-[10px]  ">
      {labelName && (
        <span className="font-epilogue font-medium text-[14px] leading-[22px] text-[#808191] mb-[10px]">
          {labelName}
        </span>
      )}
      <button
        onClick={() => toggleDropDown()}
        className="py-[15px] sm:px-[25px] px-[15px] outline-none border-[1px] border-[#808191]  bg-[#3a3a43] font-epilogue text-white text-[14px] rounded-[10px] sm:min-w-[300px] hover:border-[#3a3a43] hover:bg-[#808191] mb-1"
        onChange={handleChange}
      >
        <div className="font-epilogue font-medium">
          {selectedCategory != null
            ? options[selectedCategory].name
            : "Choose Your Category"}
        </div>
      </button>
      {isExpanded && (
        <>
          {options?.map(
            (opt: Option, i: number): JSX.Element => (
              <div
                key={i}
                className="py-[10px] sm:px-[25px] px-[10px] text-center outline-none border-[1px] border-[#808191]  bg-[#3a3a43] font-epilogue text-white text-[14px] rounded-[10px] sm:min-w-[300px] hover:border-[#808191] hover:bg-[#808191] cursor-pointer mb-1"
                onClick={e => {
                  setSelectedCategory(i);
                }}
              >
                <span className="font-epilogue font-normal">{opt.name}</span>
              </div>
            )
          )}
        </>
      )}
    </label>
  );
};

export default DropDown;
