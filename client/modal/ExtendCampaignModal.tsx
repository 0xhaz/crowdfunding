import React, { useState } from "react";
import { CustomButton, FormField, Loader } from "../components";
import { useCrowdFundData, useAccount } from "../context";
import { ethers } from "ethers";

interface FormProps {
  pId: number;
  target: string;
  deadline: Date;
}

type ExtendCampaignModalProps = {
  pId: number;
  target: number;
  deadline: string;
  closeModal: () => void;
};

const ExtendCampaignModal = ({
  pId,
  target,
  deadline,
  closeModal,
}: ExtendCampaignModalProps) => {
  const { updateCampaign } = useCrowdFundData();
  const { account } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState<FormProps>({
    pId: pId,
    target: target.toString(),
    deadline: new Date(),
  });
  const [targetError, setTargetError] = useState("");
  const [deadlineError, setDeadlineError] = useState("");

  const handleFormFieldChange = (
    fieldName: string,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [fieldName]: e.target.value,
    });
  };

  const handleExtendCampaign = async () => {
    if (!account) return;
    setIsLoading(true);
    try {
      const decimals = 18;
      const newTarget = ethers.utils.parseUnits(
        form.target.toString(),
        decimals
      );

      const newDeadline = new Date(form.deadline);

      // if (newTarget <= target) {
      //   throw new Error(
      //     "New target must be equal to or greater than the current target"
      //   );
      // }

      if (newDeadline <= new Date(deadline)) {
        throw new Error(
          "New deadline must be equal to or greater than the current deadline"
        );
      }
      await updateCampaign({
        pId: form.pId,
        target: newTarget.toString(),
        deadline: newDeadline.getTime(),
      });
      closeModal();
    } catch (error: any) {
      console.error(error);

      if (
        error.message ===
        "New target must be equal to or greater than the current target"
      ) {
        setTargetError(error.message);
      } else if (
        error.message ===
        "New deadline must be equal to or greater than the current deadline"
      ) {
        setDeadlineError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex justify-center items-center flex-col fixed inset-0 bg-[rgba(0,0,0,0.7)]">
      {isLoading && <Loader />}
      <div className="flex flex-col justify-center items-center p-[16px] sm:min-w-[380px] bg-[#4b5563] rounded-[10px] w-1">
        <h2 className="font-epilogue font-bold text-[20px] text-center text-[#e5e7eb] mb-1">
          You want to extend your campaign?
        </h2>
        <p className="font-epilogue font-medium text-[16px] leading-[30px] text-center text-[#e5e7eb] mb-2">
          Please insert a new campaign date and target of your campaign
        </p>

        <div className="flex flex-wrap gap-[40px] mb-5">
          <FormField
            labelName="New Target *"
            placeholder="ETH 0.50"
            inputType="text"
            value={form.target.toString()}
            handleChange={e => {
              handleFormFieldChange("target", e);
              setTargetError("");
            }}
          />
          {targetError && (
            <p className="font-epilogue font-medium text-[16px] leading-[30px] text-center text-[#f15464] mb-2">
              {targetError}
            </p>
          )}

          <FormField
            labelName="New End Date *"
            placeholder="End Date"
            inputType="date"
            value={form.deadline}
            handleChange={e => {
              handleFormFieldChange("deadline", e);
              setDeadlineError("");
            }}
            min={new Date().toISOString().split("T")[0]} // set the min attribute to today's date
          />
          {deadlineError && (
            <p className="font-epilogue font-medium text-[16px] leading-[30px] text-center text-[#f15464] mb-2">
              {deadlineError}
            </p>
          )}
        </div>
        <div className="flex flex-wrap w-1/2 justify-between mt-15 gap-[10px]">
          <CustomButton
            btnType="button"
            title="Extend My Campaign"
            styles="w-full bg-[#374151] hover:bg-[#4acd8d] transition-all ease-out duration-300 mb-2"
            handleClick={handleExtendCampaign}
          />

          <CustomButton
            btnType="button"
            title="Cancel"
            styles="w-full bg-[#374151] hover:bg-[#f15464] transition-all ease-out duration-300 "
            handleClick={closeModal}
          />
        </div>
      </div>
    </div>
  );
};

export default ExtendCampaignModal;
