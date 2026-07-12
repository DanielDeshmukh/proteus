declare module "react-icons/fa6" {
  import { ComponentType } from "react";
  export const FaCopy: ComponentType<{ size?: number; color?: string; className?: string }>;
}

declare module "react-icons/md" {
  import { ComponentType } from "react";
  export const MdFileDownloadDone: ComponentType<{ size?: number; color?: string; className?: string }>;
}

declare module "react-icons/fi" {
  import { ComponentType } from "react";
  export const FiDownload: ComponentType<{ size?: number; color?: string; className?: string }>;
}

declare module "nodemailer" {
  interface TransportOptions {
    host?: string;
    port?: number;
    secure?: boolean;
    auth?: { user?: string; pass?: string };
  }
  interface MailOptions {
    from: string;
    to: string;
    subject: string;
    text?: string;
    html?: string;
  }
  interface Transport {
    sendMail(options: MailOptions): Promise<unknown>;
  }
  function createTransport(options: TransportOptions): Transport;
  export default { createTransport };
}
