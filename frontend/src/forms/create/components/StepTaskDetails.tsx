"use client";

import TitleField from "./fields/TitleField";
import DescriptionField from "./fields/DescriptionField";
import TagSelector from "./fields/TagSelector";
import ReferenceUriField from "./fields/ReferenceUriField";
import ThumbnailUpload from "./fields/ThumbnailUpload";

export default function StepTaskDetails() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 space-y-5">
      <TitleField />
      <DescriptionField />
      <TagSelector />
      <hr className="border-border" />
      <ReferenceUriField />
      <ThumbnailUpload />
    </div>
  );
}
