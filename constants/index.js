import {
  createCampaign,
  dashboard,
  logout,
  payment,
  profile,
  withdraw,
} from "../public/assets";

export const navlinks = [
  {
    name: "dashboard",
    imgUrl: dashboard,
    as: "/",
    path: "/",
  },
  {
    name: "campaign",
    imgUrl: createCampaign,
    as: "create-campaign",
    path: "/CreateCampaign",
  },
  {
    name: "payment",
    imgUrl: payment,
    link: "/",
    disabled: true,
  },
  {
    name: "withdraw",
    imgUrl: withdraw,
    link: "/",
    disabled: true,
  },
  {
    name: "profile",
    imgUrl: profile,
    as: "profile",
    path: "/Profile",
  },
  {
    name: "logout",
    imgUrl: logout,
    link: "/",
    disabled: true,
  },
];
