import React from "react";
import { loader } from "../public/assets";
import Image from "next/image";
type Props = {};

const Loader = (props: Props) => {
  return (
    <div className="fixed inset-0 z-10 h-screen bg-[rgba(0,0,0,0.7)] flex items-center justify-center flex-col">
      <Image
        src={loader}
        alt="loader"
        width={100}
        height={100}
        className="object-contain"
      />
      <p className="mt-[20px] font-epilogue font-bold text-[20px] text-white text-center">
        Transaction is in progress <br /> Please wait...
      </p>
    </div>
  );
};

export default Loader;
