import React, { useEffect, useState } from "react";

export type Option = {
  idx: number;
  name: string;
};

interface DropDownProps {
  labelName?: string;
  value: number;
  options: Option[];
  handleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const DropDown: React.FC<DropDownProps> = ({
  labelName,
  value,
  options,
  handleChange,
}: DropDownProps): JSX.Element => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const toggleDropDown = () => {
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    setIsExpanded(isExpanded);
  }, [isExpanded]);

  return (
    <label className="bg-[#1f2937] flex  flex-col rounded-[10px]  ">
      {labelName && (
        <span className="font-epilogue font-medium text-[14px] leading-[22px] text-[#e5e7eb] mb-[10px]">
          {labelName}
        </span>
      )}
      <select
        value={value}
        className="py-[15px] sm:px-[25px] px-[15px] outline-none border-[1px] border-[#9ca3af]  bg-[#374151] font-epilogue text-white text-[14px] rounded-[10px] sm:min-w-[300px] hover:border-[#3a3a43] hover:bg-[#808191] mb-1"
        onChange={handleChange}
      >
        <option value="">Choose Your Category</option>

        {options?.map(
          (opt: Option, i: number): JSX.Element => (
            <option
              key={opt.idx}
              value={opt.idx}
              className="py-[10px] sm:px-[25px] px-[10px] text-center outline-none border-[1px] border-[#808191]  bg-[#3a3a43] font-epilogue text-white text-[14px] rounded-[10px] sm:min-w-[300px] hover:border-[#808191] hover:bg-[#808191] cursor-pointer mb-1"
            >
              {opt.name}
            </option>
          )
        )}
      </select>
    </label>
  );
};

export default DropDown;
