import React from "react";

interface FormFieldProps {
  labelName: string;
  placeholder: string;
  inputType?: string;
  isTextArea?: boolean;
  value: string | Date;
  style?: string;
  min?: string;
  handleChange: (e: any) => void;
}

const FormField = ({
  labelName,
  placeholder,
  inputType,
  isTextArea,
  value,
  min,
  style,
  handleChange,
}: FormFieldProps) => {
  const convertedValue = typeof value === "string" ? value : value.toString();
  return (
    <label className="flex-1 w-full flex flex-col">
      {labelName && (
        <span className="font-epilogue font-medium text-[14px] leading-[22px] text-[#e5e7eb] mb-[10px]">
          {labelName}
        </span>
      )}
      {isTextArea ? (
        <textarea
          required
          value={convertedValue}
          onChange={handleChange}
          rows={10}
          placeholder={placeholder}
          className="py-[15px] sm:px-[25px] px-[15px] outline-none border-[1px] border-[#9ca3af] bg-[#374151] font-epilogue text-white text-[14px] placeholder:text-[#e5e7eb] rounded-[10px] sm:min-w-[300px]"
          style={{ whiteSpace: "pre-wrap" }}
        />
      ) : (
        <input
          required
          value={convertedValue}
          onChange={handleChange}
          type={inputType}
          step="0.1"
          placeholder={placeholder}
          className="py-[15px] sm:px-[25px] px-[15px] outline-none border-[1px] border-[#9ca3af] bg-[#374151] font-epilogue text-white text-[14px] placeholder:text-[#e5e7eb] rounded-[10px] sm:min-w-[300px]"
        />
      )}
    </label>
  );
};

export default FormField;
