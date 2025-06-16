'use client';
import React from 'react';
import axios from 'axios';
import { cloudinaryUpload, type Options as CldOptions } from './cloudinary-handler';
import { useRouter } from 'next/navigation';

interface Options<TPrevent> extends CldOptions {
  _prevent?: TPrevent;
  field?: string | `${string}.${string}`;
}

function setNestedKey(path: string, value: any): Record<string, any> {
  return path
    .split('.')
    .reverse()
    .reduce((acc, key) => ({ [key]: acc }), value);
}

export function useCloudinaryUpload<TPrevent>(url: string, opts: Options<TPrevent> = {}) {
  const { _prevent, field = 'image', ...cld } = opts;
  const prevented = typeof _prevent !== 'undefined' && _prevent;

  const router = useRouter();
  const [isDragging, setIsDragging] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);

  const onSubmit = React.useCallback(
    async (file: File | undefined) => {
      if (prevented) return;
      setIsDragging(false);
      setLoading(true);

      if (!file) return;

      const res = await cloudinaryUpload(file, cld);
      if (res.data) {
        try {
          const body = setNestedKey(field, res.data.secure_url);
          await axios.patch(url, body);
          router.refresh();
        } catch (error) {
          console.error('Upload to DB failed', error);
        }
      } else {
        console.error('Cloudinary error:', res?.error?.message);
      }
      setLoading(false);
    },
    [prevented, router, url]
  );

  const handleDrop = React.useCallback(
    async <T = HTMLElement>(e: React.DragEvent<T>) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      await onSubmit(file);
    },
    [onSubmit]
  );

  const handleChange = React.useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      await onSubmit(file);
    },
    [onSubmit]
  );

  const handleDragOver = React.useCallback(
    <T = HTMLElement>(e: React.DragEvent<T>) => {
      if (prevented) return;
      e.preventDefault(); // required for onDrop to be triggered
      setIsDragging(true);
    },
    [prevented]
  );

  const handleDragLeave = React.useCallback(
    <T = HTMLElement>(e: React.DragEvent<T>) => {
      if (prevented) return;
      e.preventDefault();
      setIsDragging(false);
    },
    [prevented]
  );

  return { isDragging, setIsDragging, loading, setLoading, handleChange, handleDrop, handleDragOver, handleDragLeave, onSubmit };
}
