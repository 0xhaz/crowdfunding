import React, { useEffect, useState, useRef } from "react";
import { Web3Storage } from "web3.storage";
import Image from "next/image";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import { money } from "../public/assets";
import { CustomButton, DropDown, FormField, Loader } from "../components";
import { useCrowdFundData } from "../context";

interface FormProps {
  category: number;
  title: string;
  description: string;
  target: string;
  deadline: Date;
  image: string;
}

const CreateCampaign = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { createCampaign } = useCrowdFundData();
  const [selectedCategory, setSelectedCategory] = useState<number>(0);
  const [droppedImage, setDroppedImage] = useState<File | null>(null);
  const router = useRouter();
  const [form, setForm] = useState<FormProps>({
    category: selectedCategory,
    title: "",
    description: "",
    target: "",
    deadline: new Date(),
    image: "",
  });

  const options = [
    {
      idx: 0,
      name: "Charity",
    },
    {
      idx: 1,
      name: "Tech",
    },
    {
      idx: 2,
      name: "Web3",
    },
    {
      idx: 3,
      name: "Games",
    },
    {
      idx: 4,
      name: "Education",
    },
  ];

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const getCategoryCode = (selectedCategory: number) => {
    return options[selectedCategory]?.idx;
  };

  const handleFormFieldChange = (
    fieldName: string,
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    if (fieldName === "image") {
      const file = (e.target as HTMLInputElement).files?.[0] || null;
      setDroppedImage(file);
    } else {
      const value = e.target.value;
      if (fieldName === "description") {
        const newValue = value.replace(/\n/g, "\n");
        setForm(prevForm => ({
          ...prevForm,
          [fieldName]: newValue,
        }));
      } else {
        setForm(prevForm => ({
          ...prevForm,
          [fieldName]: e.target.value,
        }));
      }
    }
  };

  const handleClick = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = parseInt(e.target.value);
    setSelectedCategory(selectedValue);
    setForm(prevForm => ({
      ...prevForm,
      category: selectedValue,
    }));
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = (e.dataTransfer as DataTransfer).files[0];
    setDroppedImage(droppedFile);

    if (fileInputRef.current) {
      fileInputRef.current.style.display = "block";
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const categoryCode = getCategoryCode(form.category);

    if (!droppedImage) {
      alert("Please upload an image");
      return;
    }

    setIsLoading(true);

    const client = new Web3Storage({
      token: process.env.NEXT_PUBLIC_WEB3_STORAGE_API_KEY || "",
    });

    const cid = await client.put([droppedImage], {
      name: "Campaign Image",
      maxRetries: 3,
    });
    const imageURL = `https://ipfs.io/ipfs/${cid}/${droppedImage.name}`;

    await createCampaign({
      ...form,
      category: categoryCode,
      target: ethers.utils.parseUnits(form.target, 18),
      image: imageURL,
    });

    setIsLoading(false);
    router.push("/");
  };

  useEffect(() => {
    setForm(prevForm => ({
      ...prevForm,
      category: selectedCategory,
    }));
  }, [selectedCategory]);

  return (
    <div className="bg-[#1f2937] flex justify-center items-center flex-col rounded-[10px] sm:p-10 p-4">
      {isLoading && <Loader />}
      <div className="flex justify-center items-center p-[16px] sm:min-w-[380px] bg-[#374151] rounded-[10px]">
        <h1 className="font-epilogue font-bold sm:text-[25px] text-[18px] leading-[38px] text-white">
          Start a Campaign
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full mt-[65px] flex flex-col gap-[30px]"
      >
        <div className="flex flex-wrap gap-[40px]">
          <DropDown
            labelName="Categories"
            value={selectedCategory}
            options={options}
            handleChange={handleClick}
          />
          <FormField
            labelName="Campaign Title"
            placeholder="Write a title"
            inputType="text"
            value={form.title}
            handleChange={e => {
              handleFormFieldChange("title", e);
            }}
          />
        </div>
        <FormField
          labelName="Story *"
          placeholder="Write your story"
          isTextArea
          value={form.description}
          handleChange={e => {
            handleFormFieldChange("description", e);
          }}
        />

        <div className="w-full flex justify-center items-center p-4 bg-[#374151] h-[120px] rounded-[10px]">
          <Image
            src={money}
            alt="money"
            className="w-[40px] h-[40px] object-contain"
          />
          <h4 className="font-epilogue font-bold text-[25px] text-white ml-[20px]">
            You will get 90% of the raised amount
          </h4>
        </div>

        <div className="flex flex-wrap gap-[40px]">
          <FormField
            labelName="Goal *"
            placeholder="ETH 0.50"
            inputType="text"
            value={form.target.toString()}
            handleChange={e => {
              handleFormFieldChange("target", e);
            }}
          />
          <FormField
            labelName="End Date *"
            placeholder="End Date"
            inputType="date"
            value={form.deadline}
            handleChange={e => {
              handleFormFieldChange("deadline", e);
            }}
          />
        </div>

        <label
          htmlFor="fileInput"
          className="font-epilogue font-medium text-[14px] leading-[22px] text-[#e5e7eb] mb-0"
        >
          Image *
        </label>
        <div
          className="flex flex-col items-center justify-center w-[1000px] h-[200px] bg-[#374151] border  border-[#9ca3af] rounded-[10px] cursor-pointer m-auto"
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {droppedImage ? (
            <p className="font-epilogue font-bold text-[16px] text-white ml-[20px]">
              Image selected: {droppedImage.name}
            </p>
          ) : (
            <p className="font-epilogue font-bold text-[16px] text-white ml-[20px]">
              Drag and drop image here or click to select
            </p>
          )}
          <div className="flex justify-center items-center mt-[40px]">
            <div
              className="hidden text-white font-epilogue text-[14px] "
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={e => handleFormFieldChange("image", e)}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center mt-[40px]">
          <CustomButton
            btnType="submit"
            title="Submit new campaign"
            styles="bg-[#374151] hover:bg-[#8c6dfd] transition-all ease-out duration-300 "
            handleClick={handleSubmit}
          />
        </div>
      </form>
    </div>
  );
};

export default CreateCampaign;
