import React from "react";
import { FaShareAlt } from "react-icons/fa";
import {
  FacebookIcon,
  FacebookShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  RedditIcon,
  RedditShareButton,
  TelegramIcon,
  TelegramShareButton,
  TwitterIcon,
  TwitterShareButton,
  WhatsappIcon,
  WhatsappShareButton,
} from "react-share";
import { toast } from "react-toastify";
import { iconStyles, tabButtonStyles } from "../utils/data";
import { shareInfoMessage } from "../utils/messages";

const ShareButtons = ({ title, shareUrl, image }) => {
  return (
    <div className="">
      <div className={tabButtonStyles}>
        <div className="flex gap-1 items-center">
          <FaShareAlt
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(shareUrl);
              toast.info(shareInfoMessage);
            }}
            className={iconStyles}
            size={25}
          />
          <TwitterShareButton
            // title={title}
            url={shareUrl}
          >
            <TwitterIcon className={iconStyles} size={32} round />
          </TwitterShareButton>
          <WhatsappShareButton
            // title={`${title}`}
            url={shareUrl}
          >
            <WhatsappIcon className={iconStyles} size={32} round />
          </WhatsappShareButton>
          <LinkedinShareButton
            // title={`${title}`}
            url={shareUrl}
          >
            <LinkedinIcon className={iconStyles} size={32} round />
          </LinkedinShareButton>
          <TelegramShareButton
            // title={`${title}`}
            url={shareUrl}
          >
            <TelegramIcon className={iconStyles} size={32} round />
          </TelegramShareButton>
          <RedditShareButton
            // title={`${title}`}
            url={shareUrl}
          >
            <RedditIcon className={iconStyles} size={32} round />
          </RedditShareButton>
          <FacebookShareButton
            // title={`${title}`}
            url={shareUrl}
          >
            <FacebookIcon className={iconStyles} size={32} round />
          </FacebookShareButton>
        </div>
      </div>
    </div>
  );
};

export default ShareButtons;
