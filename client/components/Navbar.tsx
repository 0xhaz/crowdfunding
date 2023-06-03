import React, { useEffect, useState } from "react";
import Router, { useRouter } from "next/router";
import Identicon from "react-identicons";
import Link from "next/link";
import Image from "next/image";

import { CustomButton } from "./";
import { logo, menu, search } from "../public/assets";
import { navlinks } from "../constants";
import { useAccount } from "../context";

type NavbarProps = {
  onSearchQueryChange: (query: string) => void;
};

const Navbar = ({ onSearchQueryChange }: NavbarProps) => {
  const [isActive, setIsActive] = useState("dashboard");
  const [toggleDrawer, setToggleDrawer] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { connect, account } = useAccount();
  const router = useRouter();

  const handleSearch = () => {
    if (!account) return;
    onSearchQueryChange(searchQuery);
  };

  useEffect(() => {
    if (!account) return;
    onSearchQueryChange(searchQuery);
  }, [searchQuery]);

  return (
    <div className="flex md:flex-row flex-col-reverse justify-between mb-[35px] gap-6">
      <div className="lg:flex-1 flex flex-row max-w-[458px] py-2 pl-4 pr-2 h-[52px] bg-[#374151] rounded-[100px]">
        <input
          type="text"
          placeholder="Search For Campaigns"
          className="flex w-full font-epilogue font-normal text-[14px] placeholder:text-[#e5e7eb] text-white bg-transparent outline-none"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />

        <div
          className="w-[72px] h-full rounded-[20px] bg-[#1f2937] flex justify-center items-center cursor-pointer"
          onClick={handleSearch}
        >
          <Image
            src={search}
            alt="search"
            className="w-[15px] h-[15px] object-contain"
          />
        </div>
      </div>

      <div className="sm:flex hidden flex-row justify-end gap-4">
        <CustomButton
          btnType="button"
          title={account ? "Create a campaign" : "Connect"}
          styles={
            account
              ? "bg-[#374151] hover:bg-[#8c6dfd] transition-all ease-out duration-300 "
              : "bg-[#374151] hover:bg-[#8c6dfd] transition-all ease-out duration-300"
          }
          handleClick={() => {
            if (account) router.push("/CreateCampaign");
            else connect();
          }}
        />

        <Link href="/Profile">
          <div className="w-[52px] h-[52px] rounded-full  bg-[#374151] flex justify-center items-center cursor-pointer">
            <Identicon
              size={15}
              string={account || ""}
              className="w-[60%] h-[60%] object-contain"
            />
          </div>
        </Link>
      </div>

      {/* small screen navigation */}
      <div className="sm:hidden flex justify-between items-center relative">
        <div className="w-[40px] h-[40px] rounded-[10px]  bg-[#2c2f32] flex justify-center items-center cursor-pointer">
          <Identicon
            size={15}
            string={account || ""}
            className="w-[60%] h-[60%] object-contain"
          />
        </div>
        <Image
          src={menu}
          alt="menu"
          className="w-[34px] h-[34px] object-contain cursor-pointer"
          onClick={() => setToggleDrawer(prev => !prev)}
        />
        <div
          className={`absolute top-[60px] right-0 left-0 bg-[#1c1c24] z-10 shadow-secondary py-4 ${
            !toggleDrawer ? "-translate-y-[100vh]" : "translate-y-0"
          } transition-all duration-700`}
        >
          <ul className="mb-4">
            {navlinks.map(link => (
              <li
                key={link.name}
                className={`flex p-4 ${
                  isActive === link.name && "bg-[#3a3a43]"
                }`}
                onClick={() => {
                  setIsActive(link.name);
                  setToggleDrawer(false);
                  <Link href={link.link} />;
                }}
              >
                <Image
                  src={link.imgUrl}
                  alt={link.name}
                  className={`w-[24px] h-[24px] object-contain ${
                    isActive === link.name ? "grayscale-0" : "grayscale"
                  }`}
                />
                <p
                  className={`ml-[20px] font-epilogue font-semibold text-[14px] ${
                    isActive === link.name ? "text-[#e5e7eb]" : "text-[#808191]"
                  }`}
                >
                  {link.name}
                </p>
              </li>
            ))}
          </ul>
          <div className="flex mx-4">
            <CustomButton
              btnType="button"
              title={account ? "Create a campaign" : "Connect"}
              styles={account ? "bg-[#374151]" : "bg-[#374151]"}
              handleClick={() => {
                if (account) router.push("/CreateCampaign");
                else connect();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
