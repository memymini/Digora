"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { AdminVotes } from "@/types";
import { UseFormReturn, SubmitHandler, useFieldArray } from "react-hook-form";

// Define the schema for your form data
export interface VoteFormSchema {
  title: string;
  details: string;
  ends_at: string;
  options: {
    id?: number;
    name: string;
    descriptions: string;
    file?: FileList;
    imageUrl?: string;
  }[];
}

interface VoteFormProps {
  form: UseFormReturn<VoteFormSchema>;
  onSubmit: SubmitHandler<VoteFormSchema>;
  onCancel: () => void;
  selectedVote: AdminVotes | null;
}

export const VoteForm = ({
  form,
  onSubmit,
  onCancel,
  selectedVote,
}: VoteFormProps) => {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "options",
  });

  const watchedOptions = watch("options");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-8">
      <h3 className="text-lg font-semibold">
        {selectedVote ? "투표 수정" : "새 투표 생성"}
      </h3>
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          제목
        </label>
        <input
          type="text"
          id="title"
          {...register("title", { required: "제목을 입력해주세요." })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>
      <div>
        <label
          htmlFor="subtitle"
          className="block text-sm font-medium text-gray-700"
        >
          소제목
        </label>
        <textarea
          id="subtitle"
          rows={3}
          {...register("details")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <div className="space-y-6">
        {fields.map((field, index) => {
          const watchedFile = watchedOptions?.[index]?.file;
          const previewUrl = watchedFile?.[0]
            ? URL.createObjectURL(watchedFile[0])
            : field.imageUrl;

          return (
            <div
              key={field.id}
              className="p-4 border rounded-md space-y-2 relative"
            >
              <h4 className="font-medium">후보 {index + 1}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor={`options.${index}.name`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    이름
                  </label>
                  <input
                    {...register(`options.${index}.name`, {
                      required: "후보 이름을 입력해주세요.",
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                  {errors.options?.[index]?.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.options?.[index]?.name?.message}
                    </p>
                  )}

                  <label
                    htmlFor={`options.${index}.description`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    설명
                  </label>
                  <textarea
                    {...register(`options.${index}.descriptions`)}
                    rows={2}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    placeholder={`후보 ${index + 1}에 대한 설명을 입력하세요`}
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor={`options.${index}.file`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    이미지
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    {...register(`options.${index}.file`)}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                  />
                  {previewUrl && (
                    <Image
                      src={previewUrl}
                      alt={`Candidate ${index + 1} Preview`}
                      width={100}
                      height={100}
                      className="mt-2 rounded-md object-cover"
                    />
                  )}
                </div>
              </div>
              {fields.length > 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  className="absolute top-2 right-2"
                >
                  삭제
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <div>
        <label
          htmlFor="duration"
          className="block text-sm font-medium text-gray-700"
        >
          투표 종료일
        </label>
        <input
          type="date"
          id="duration"
          {...register("ends_at", { required: "투표 종료일을 선택해주세요." })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        {errors.ends_at && (
          <p className="text-red-500 text-sm mt-1">{errors.ends_at.message}</p>
        )}
      </div>
      <div className="text-right space-x-2">
        {selectedVote && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            취소
          </Button>
        )}
        <Button type="submit">
          {selectedVote ? "수정 완료" : "투표 생성"}
        </Button>
      </div>
    </form>
  );
};
