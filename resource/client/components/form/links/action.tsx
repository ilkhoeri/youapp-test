'use client';
import axios from 'axios';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/resource/client/components/ui/button';
import { truncate } from '@/resource/utils/text-parser';
import { twMerge } from 'tailwind-merge';
import { Alert } from '../../alert';
import { Svg } from '../../ui/svg';
import { toast } from 'sonner';
import { useApp } from '@/resource/client/contexts/app-provider';
import { Popover, PopoverContent, PopoverItem, PopoverTrigger } from '@/resource/client/components/ui/popover';

import type { FORM_USER } from '@/resource/types/user';

interface LinkActionsProps extends FORM_USER.FORM_LINK {
  setOnEdit?: () => void;
  onEdit?: boolean;
  classNames?: {
    trigger?: string;
  };
}
export const Action: React.FC<LinkActionsProps> = ({ data, setOnEdit, onEdit, classNames }) => {
  const router = useRouter();
  const { user } = useApp();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  async function onConfirm() {
    try {
      setLoading(true);
      toast.promise(axios.delete(`/api/client/${user?.refId}/links/${data?.id}`), {
        loading: 'Wait a moment...',
        success: () => {
          setOpen(false);
          setLoading(false);
          router.refresh();
          return `${truncate(data?.name)} telah dihapus`;
        },
        error: 'Error'
      });
    } catch (_e) {
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Alert.Modal title="Remove Social Media Item" item={`${data?.name} | ${data?.url}`} open={open} onOpenChange={setOpen} onConfirm={onConfirm} disabled={loading} />

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className={twMerge('h-9 w-9 p-0 md:ml-auto border border-border focus-visible:outline-0 focus-visible:ring-0 focus-visible:ring-offset-0', classNames?.trigger)}
          >
            <Svg size={18}>
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </Svg>
          </Button>
        </PopoverTrigger>

        <PopoverContent align="end" className="space-y-1 font-medium w-[178px]">
          <a
            href={`${data?.url}`}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="w-full justify-normal cursor-pointer select-none rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-muted/60 hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            tabIndex={-1}
            data-orientation="vertical"
            data-radix-collection-item
          >
            <Svg size={20} className="mr-4">
              <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </Svg>
            Open
          </a>
          <PopoverItem
            onClick={() => {
              if (setOnEdit) {
                setOnEdit();
              } else {
                router.push(`/settings/`);
              }
            }}
            className={onEdit ? 'bg-muted hover:bg-muted/60' : 'hover:bg-muted/60'}
          >
            <Svg size={20} className="mr-4">
              {setOnEdit ? (
                <>
                  <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                  <path d="M13.5 6.5l4 4" />
                  {onEdit ? (
                    <>
                      <path d="M22 22l-5 -5" />
                      <path d="M17 22l5 -5" />
                    </>
                  ) : (
                    <path d="M16 19h6" />
                  )}
                </>
              ) : (
                <>
                  <path d="M4 13.5V4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2h-5.5" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="M10.42 12.61a2.1 2.1 0 1 1 2.97 2.97L7.95 21 4 22l.99-3.95 5.43-5.44Z" />
                </>
              )}
            </Svg>
            {setOnEdit ? (onEdit ? 'Cancel' : 'Edit') : 'Update'}
          </PopoverItem>

          <PopoverItem onClick={() => setOpen(true)} className="bg-[#da3633] hover:bg-[#b91c1c] focus:bg-[#b91c1c] text-white">
            <Svg size={20} className="mr-4">
              <path d="M4 7l16 0" />
              <path d="M10 11l0 6" />
              <path d="M14 11l0 6" />
              <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
              <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
            </Svg>
            Remove
          </PopoverItem>
        </PopoverContent>
      </Popover>
    </>
  );
};
