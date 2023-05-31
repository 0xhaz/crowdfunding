import React, { useState } from "react";
import { NextRouter, useRouter } from "next/router";
import Image from "next/image";

import { logo, sun, arrow } from "../public/assets";
import { navlinks } from "../constants";
import Link from "next/link";

interface IconProps {
  styles?: string;
  name?: string;
  imgUrl?: string;
  isActive?: string;
  isExpanded?: boolean;
  disabled?: boolean;
  handleClick?: () => void;
}

const Icon = ({
  styles,
  name,
  imgUrl,
  isActive,
  isExpanded,
  disabled,
  handleClick,
}: IconProps): JSX.Element => (
  <div
    className={`w-[48px] h-[48px] rounded-[10px] ${
      isActive && isActive === name && "bg-[#374151]"
    } flex justify-center items-center ${
      !disabled && "cursor-pointer"
    } ${styles}`}
    onClick={handleClick}
  >
    {!isActive ? (
      <Image src={imgUrl || ""} alt="fund_logo" className="w-1/2 h-1/2" />
    ) : (
      <Image
        src={imgUrl || ""}
        alt="fund_logo"
        className={`w-1/2 h-1/2 ${isActive !== name && "grayscale"}`}
      />
    )}
    {isExpanded && <div className="text-white">{name}</div>}
  </div>
);

const Sidebar = () => {
  const router: NextRouter = useRouter();
  const [isActive, setIsActive] = useState("dashboard");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSidebarExpand = () => {
    setIsExpanded(!isExpanded);
  };
  return (
    <div className="flex justify-between items-center flex-col sticky top-5 h-[93vh]">
      <Link href="/">
        <Icon styles="w-[60px] h-[60px] bg-[#374151]" imgUrl={logo} />
      </Link>
      <div
        className={`flex-1 flex flex-col justify-between items-center relative  bg-[#1f2937] rounded-[20px] w-[76px] py-4 mt-12 transition-all duration-500 ${
          isExpanded ? "w-[220px]" : "w-[76px]"
        }`}
      >
        <div className="flex flex-col justify-around items-stretch outline-none gap-3 mt-12">
          {navlinks.map(link => (
            <div
              key={link.name}
              className={`flex items-center  gap-2 cursor-pointer ${
                isActive === link.name ? "text-[#e5e7eb]" : "text-gray-400"
              }`}
              onClick={() => {
                if (!link.disabled) {
                  setIsActive(link.name);
                  router.push(`${link.path}`);
                }
              }}
            >
              <Icon {...link} isActive={isActive} />

              {isExpanded && (
                <span className="font-epilogue font-medium text-[16px] ml-2 mt-1">
                  {link.name}
                </span>
              )}
            </div>
          ))}
          <div
            className={`flex items-center justify-center absolute top-0 right-[-10px] ${
              isExpanded ? "transfrom rotate-180" : ""
            } `}
          >
            <Icon
              styles="bg-[#4b5563] shadow-secondary "
              imgUrl={arrow}
              handleClick={handleSidebarExpand}
            />
          </div>
        </div>
        <Icon styles="bg-[#374151] shadow-secondary" imgUrl={sun} />
      </div>
    </div>
  );
};

export default Sidebar;
