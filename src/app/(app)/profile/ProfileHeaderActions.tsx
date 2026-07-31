"use client";

import { useState } from "react";
import Link from "next/link";
import { Share2, Settings, Check, Edit3 } from "lucide-react";

export default function ProfileHeaderActions({ userHandle }: { userHandle: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: `${userHandle}'s IDEA Lab Profile`,
      text: `Check out ${userHandle}'s maker profile on SJCET AICTE IDEA Lab!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleShare}
        title="Share Profile"
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105 active:scale-95 shadow-sm"
      >
        {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
        {copied && (
          <span className="absolute -bottom-8 right-0 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white shadow-lg animate-fade-in">
            Link copied!
          </span>
        )}
      </button>

      <Link
        href="/profile/edit"
        title="Edit Profile"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105 active:scale-95 shadow-sm"
      >
        <Edit3 className="h-4 w-4" />
      </Link>
    </div>
  );
}