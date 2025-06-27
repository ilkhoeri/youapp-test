'use client';
import * as React from 'react';
import axios from 'axios';
import { AlertModal } from '../alert';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export interface ChatDeleteAlertProps {
  confirm: boolean;
  onConfirm: (value: React.SetStateAction<boolean>) => void;
  onOpenChange?: (value: React.SetStateAction<boolean>) => void;
  url: string | null;
}

export function ChatDeleteAlert({ confirm, onConfirm, onOpenChange, url }: ChatDeleteAlertProps) {
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const onDelete = React.useCallback(() => {
    if (!url) return;

    setLoading(true);

    try {
      axios
        .delete(url)
        .then(() => {
          onConfirm(false);
          onOpenChange?.(false);
          router.push('/chat');
          router.refresh();
        })
        .catch(() => toast.error('Something went wrong!'))
        .finally(() => {
          setLoading(false);
          router.refresh();
        });
    } catch (_e) {}
  }, [router, url]);

  return (
    <AlertModal
      open={confirm}
      onOpenChange={onConfirm}
      disabled={loading}
      onConfirm={onDelete}
      title="Delete"
      description="Are you sure you want to delete this conversation? This action cannot be undone."
      classNames={{
        overlay: 'dark:bg-[#111b21fa]',
        content: 'dark:bg-[#182229] rounded-[28px] max-sm:rounded-[28px]',
        onCancle: 'rounded-full bg-transparent transition-colors text-muted-foreground hover:text-color',
        onConfirm: 'rounded-full bg-transparent transition-colors border text-red-500 hover:text-black'
      }}
    />
  );
}
