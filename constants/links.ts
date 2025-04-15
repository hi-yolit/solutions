const whatsappNumberInt = "+27638821640"
const whatsappNumber = "073 572 1710"
const phoneNumber = whatsappNumber
const email = "yolit.academy@gmail.com"
export const whatsappBaseLink = `https://api.whatsapp.com/send?phone=${whatsappNumberInt}&text=${"Hi 😁"}`

type BaseLink = {
    title: string;
    url: string;
  };
  
  type SocialLink = BaseLink & {
    iconUrl: string;
    iconUrlLight: string;
  };
  
  type FooterSection = {
    title: string;
    links: (BaseLink | SocialLink)[];
  };
  

  export const footerLinks: FooterSection[] = [
    {
      title: "Socials",
      links: [
        {
          title: "WhatsApp",
          url: whatsappBaseLink,
          iconUrl: "/icons/social/whatsapp-dark.png",
          iconUrlLight: "/icons/social/whatsapp-light.png",
        },
        {
          title: "Instagram",
          url: "https://www.instagram.com/yolitacademy",
          iconUrl: "/icons/social/instagram-dark.png",
          iconUrlLight: "/icons/social/instagram-light.png",
        },
        {
          title: "Tiktok",
          url: "https://www.tiktok.com/@yolitacademy",
          iconUrl: "/icons/social/tiktok-dark.png",
          iconUrlLight: "/icons/social/tiktok-light.png",
        },
        {
          title: "Facebook",
          url: "https://www.facebook.com/yolitacademy",
          iconUrl: "/icons/social/facebook-dark.png",
          iconUrlLight: "/icons/social/facebook-light.png",
        },
        {
          title: "Linkedin",
          url: "https://www.linkedin.com/company/yolit-academy/",
          iconUrl: "/icons/social/linkedin-dark.png",
          iconUrlLight: "/icons/social/linkedin-light.png",
        },
      ],
    },
    {
      title: "Contact",
      links: [
        { title: phoneNumber, url: "/" },
        { title: email, url: "/" },
        { title: "WhatsApp", url: whatsappBaseLink },
      ],
    },
  ];
  