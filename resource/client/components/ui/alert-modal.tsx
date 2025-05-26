'use client';

import { useEffect, useState } from 'react';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/resource/client/components/ui/dialog';
import { Button } from '@/resource/client/components/ui/button';

import { twMerge } from 'tailwind-merge';

export type ClassModal = {
  classNames?: {
    content?: string;
    header?: string;
    headerWrap?: string;
    title?: string;
    description?: string;
    body?: string;
  };
};

interface AlertModalProps extends ClassModal {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  children?: React.ReactNode;
  disabled?: boolean;
}

export function AlertModal({
  icon,
  isOpen,
  onClose,
  disabled,
  children,
  classNames,
  onConfirm,
  title = 'This action cannot be undone.',
  description = 'Once you delete, there is no going back. Please be certain.'
}: AlertModalProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const onChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onChange}>
      <DialogContent disabled={disabled} aria-disabled={disabled} className={twMerge('[--ring-focus:#b91c1c]', classNames?.content)}>
        <DialogHeader className={classNames?.header}>
          {icon}
          <div className={twMerge('grid', classNames?.headerWrap)}>
            <DialogTitle className={twMerge('text-[#b91c1c]', classNames?.title)}>{title}</DialogTitle>
            <DialogDescription className={classNames?.description}>{description}</DialogDescription>
          </div>
        </DialogHeader>

        <div className={classNames?.body}>
          {children}

          <DialogFooter className="pt-6 gap-2 flex-row justify-end w-full">
            <Button disabled={disabled} variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" disabled={disabled} onClick={onConfirm} className="min-w-[96px] w-[96px] bg-red-500 text-red-50">
              Delete
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
