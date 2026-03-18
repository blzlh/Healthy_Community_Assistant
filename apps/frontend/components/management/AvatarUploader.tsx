"use client";

import Image from "next/image";
import { Upload } from "antd";
import type { UploadFile, UploadProps } from "antd";
import { Icon } from "@iconify/react";

type AvatarUploaderProps = {
  value?: string;
  onChange: (value?: string) => void;
};

export function AvatarUploader({ value, onChange }: AvatarUploaderProps) {
  const handleBeforeUpload: UploadProps["beforeUpload"] = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      onChange(reader.result as string);
    };
    reader.readAsDataURL(file);
    return false;
  };

  const fileList: UploadFile[] = value
    ? [
        {
          uid: "avatar",
          name: "avatar.png",
          status: "done",
          url: value,
        },
      ]
    : [];

  return (
    <div className="flex items-center gap-4">
      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5">
        {value ? (
          <Image
            src={value}
            alt="avatar"
            width={80}
            height={80}
            className="h-full w-full object-cover"
            unoptimized
          />
        ) : (
          <Icon icon="material-symbols:person" className="h-8 w-8 text-white/60" />
        )}
      </div>
      <Upload
        accept="image/*"
        showUploadList={false}
        beforeUpload={handleBeforeUpload}
        fileList={fileList}
      >
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
        >
          <Icon icon="material-symbols:upload" className="h-4 w-4" />
          上传头像
        </button>
      </Upload>
      {value ? (
        <button
          type="button"
          className="text-sm text-white/50 hover:text-white"
          onClick={() => onChange(undefined)}
        >
          移除
        </button>
      ) : null}
    </div>
  );
}
