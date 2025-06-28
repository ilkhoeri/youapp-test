'use client';
import React from 'react';
import { mergeRefs } from '@/resource/hooks/use-merged-ref';

export type VParams = {
  saving: boolean;
  editing: boolean;
  value: string | number | readonly string[];
  defaultValue: string | number | readonly string[];
  onChange: React.Dispatch<React.SetStateAction<string | number | readonly string[]>>;
};

type OnActionsProps<T = Element> = {
  onDoubleClick: React.MouseEventHandler<T>;
  onBlur: React.FocusEventHandler<T>;
  onKeyDown: React.KeyboardEventHandler<T>;
};

interface InlineEditableProps<T = Element> extends Partial<OnActionsProps<T>>, Omit<React.ComponentPropsWithRef<'div'>, 'children' | keyof OnActionsProps> {
  onBlurOrSubmit?: ((v: VParams) => void) | ((v: VParams) => Promise<void>);
  defaultEditing?: boolean;
  editing?: boolean;
  onEditingChange?: (prev: boolean | ((prev: boolean) => boolean)) => void;
  onSavingChange?: (saving: boolean) => void;
  debounceMs?: number;
  placeholder?: string;
  children?: React.ReactNode | ((v: VParams) => React.ReactNode);
  disabled?: boolean;
}

export function InlineEditable<T = Element>({
  ref,
  defaultValue = '',
  suppressHydrationWarning = true,
  suppressContentEditableWarning = true,
  onDoubleClick,
  onBlur,
  onKeyDown,
  onInput,
  onBlurOrSubmit,
  onSavingChange,
  defaultEditing = false,
  editing: editingProp,
  onEditingChange: setEditingProp,
  debounceMs = 0,
  placeholder = '',
  children,
  disabled,
  'aria-disabled': arDisabled,
  ...props
}: InlineEditableProps<T>) {
  const editableRef = React.useRef<HTMLElement>(null);

  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const [value, setValue] = React.useState(defaultValue);
  const [_editing, _setEditing] = React.useState(defaultEditing);
  const [_saving, setSaving] = React.useState(false);

  const editing = editingProp ?? _editing;
  const saving = _saving;

  const setEditing = React.useCallback(
    (prev: boolean | ((prev: boolean) => boolean)) => {
      const next = typeof prev === 'function' ? prev(editing) : prev;
      if (setEditingProp) setEditingProp(next);
      else _setEditing(next);
    },
    [setEditingProp, editing]
  );

  const revertChanges = () => {
    setValue(defaultValue);
    setEditing(false);
  };

  const submitChanges = async () => {
    if (value === defaultValue || !onBlurOrSubmit) return;

    const params = { saving, editing, value, defaultValue, onChange: setValue };

    const triggerSubmit = async () => {
      setSaving(true);
      onSavingChange?.(true);
      try {
        await onBlurOrSubmit(params);
      } finally {
        setSaving(false);
        onSavingChange?.(false);
      }
    };

    if (debounceMs > 0) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(triggerSubmit, debounceMs);
    } else {
      await triggerSubmit();
    }
  };

  const handleDoubleClick = React.useCallback(
    <T,>(e: React.MouseEvent<T, MouseEvent>) => {
      setEditing(true);
      onDoubleClick?.(e as any);
    },
    [setEditing, onDoubleClick]
  );

  const handleKeyDown = React.useCallback(
    <T,>(e: React.KeyboardEvent<T>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        setEditing(false);
        submitChanges();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        revertChanges();
      }
      onKeyDown?.(e as any);
    },
    [setEditing, submitChanges, onKeyDown]
  );

  const handleBlur = React.useCallback(
    <T,>(e: React.FocusEvent<T, Element>) => {
      setEditing(false);
      submitChanges();
      onBlur?.(e as any);
    },
    [setEditing, submitChanges, onBlur]
  );

  const handleInput = React.useCallback(<T,>(e: React.FormEvent<T>) => {
    if ('innerText' in e.currentTarget) {
      const text = e.currentTarget.innerText as string;
      setValue(text);
    }
    onInput?.(e as any);
  }, []);

  const resFn = {
    editing,
    value,
    defaultValue,
    onChange: setValue,
    saving
  };

  const childNode = typeof children === 'function' ? children(resFn) : children;

  const clonedChild =
    React.isValidElement(childNode) && editing ? (
      injectPropsToChild(childNode, {
        value,
        onChange: (e: any) => {
          if (e?.target?.value !== undefined) {
            setValue(e.target.value);
          }
        },
        onInput: handleInput,
        onBlur: handleBlur,
        onKeyDown: handleKeyDown,
        autoFocus: true,
        suppressContentEditableWarning
      })
    ) : !editing && !value && placeholder ? (
      <span className="text-gray-400 italic">{placeholder}</span>
    ) : (
      childNode
    );

  return (
    <div
      ref={mergeRefs(ref, editableRef)}
      suppressHydrationWarning={suppressHydrationWarning}
      onDoubleClick={handleDoubleClick}
      {...{ ...props, 'aria-disabled': arDisabled ?? (disabled ? 'true' : undefined), 'data-disabled': disabled ? 'true' : undefined }}
    >
      {clonedChild}
    </div>
  );
}

// === INJECT HANDLERS BERDASARKAN ELEMEN ===
function injectPropsToChild(
  child: React.ReactElement,
  {
    value,
    onChange,
    onInput,
    onBlur,
    onKeyDown,
    autoFocus,
    suppressContentEditableWarning
  }: {
    value: any;
    onChange: any;
    onInput: any;
    onBlur: any;
    onKeyDown: any;
    autoFocus: boolean;
    suppressContentEditableWarning: boolean;
  }
) {
  const tag = typeof child.type === 'string' ? child.type : null;

  if (tag === 'input' || tag === 'textarea') {
    return React.cloneElement(child, {
      value,
      onChange,
      onBlur,
      onKeyDown,
      autoFocus
    });
  }

  return React.cloneElement(child, {
    contentEditable: true,
    suppressContentEditableWarning,
    dangerouslySetInnerHTML: { __html: value },
    onInput,
    onBlur,
    onKeyDown,
    autoFocus
  });
}

/*
// 1
'use client';
import React from 'react';
import { mergeRefs } from '@/resource/hooks/use-merged-ref';

export type VParams = {
  editing: boolean;
  value: string | number | readonly string[];
  defaultValue: string | number | readonly string[];
  onChange: React.Dispatch<React.SetStateAction<string | number | readonly string[]>>;
};

type OnActionsProps<T = Element> = {
  onDoubleClick: React.MouseEventHandler<T>;
  onBlur: React.FocusEventHandler<T>;
  onKeyDown: React.KeyboardEventHandler<T>;
};

interface InlineEditableProps<T = Element> extends Partial<OnActionsProps<T>>, Omit<React.ComponentPropsWithRef<'div'>, 'children' | keyof OnActionsProps> {
  onBlurOrSubmit?: ((v: VParams) => void) | ((v: VParams) => Promise<void>);
  defaultEditing?: boolean;
  editing?: boolean;
  onEditingChange?: (prev: boolean | ((prev: boolean) => boolean)) => void;
  children?: React.ReactNode | ((v: VParams) => React.ReactNode);
}

export function InlineEditable<T = Element>({
  ref,
  defaultValue = '',
  suppressHydrationWarning = true,
  suppressContentEditableWarning = true,
  onDoubleClick,
  onBlur,
  onKeyDown,
  onBlurOrSubmit,
  defaultEditing = false,
  editing: editingProp,
  onEditingChange: setEditingProp,
  children,
  ...props
}: InlineEditableProps<T>) {
  const editableRef = React.useRef<HTMLDivElement>(null);

  const [value, setValue] = React.useState(defaultValue);
  const [_editing, _setEditing] = React.useState(defaultEditing);

  const editing = editingProp ?? _editing;
  const setEditing = React.useCallback(
    (prev: boolean | ((prev: boolean) => boolean)) => {
      const editingState = typeof prev === 'function' ? prev(editing) : prev;
      if (setEditingProp) setEditingProp(editingState);
      else _setEditing(editingState);
    },
    [setEditingProp, editing]
  );

  const resFn = {
    editing,
    value,
    defaultValue,
    onChange: setValue
  };

  const handleSubmit = React.useCallback(() => {
    if (value !== defaultValue) {
      onBlurOrSubmit?.(resFn);
    }
  }, [value, defaultValue, onBlurOrSubmit, resFn]);

  const handleDoubleClick = React.useCallback(
    <T = HTMLElement,>(e: React.MouseEvent<T, MouseEvent>) => {
      setEditing(true);
      onDoubleClick?.(e as any);
    },
    [setEditing, onDoubleClick]
  );

  const handleKeyDown = React.useCallback(
    <T = HTMLElement,>(e: React.KeyboardEvent<T>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        setEditing(false);
        handleSubmit();
      }
      onKeyDown?.(e as any);
    },
    [setEditing, handleSubmit, onKeyDown]
  );

  const handleBlur = React.useCallback(
    <T = HTMLElement,>(e: React.FocusEvent<T, Element>) => {
      setEditing(false);
      handleSubmit();
      onBlur?.(e as any);
    },
    [setEditing, handleSubmit, onBlur]
  );

  const childNode = typeof children === 'function' ? children(resFn) : children;

  return (
    <div
      ref={mergeRefs(ref, editableRef)}
      suppressHydrationWarning={suppressHydrationWarning}
      suppressContentEditableWarning={suppressContentEditableWarning}
      onDoubleClick={handleDoubleClick}
      {...props}
    >
      {editing && React.isValidElement(childNode)
        ? React.cloneElement(childNode as React.ReactElement, {
            value,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value),
            onBlur: handleBlur,
            onKeyDown: handleKeyDown,
            autoFocus: true
          })
        : childNode}
    </div>
  );
}
  */

/**
  * @example
// input (default)
<InlineEditable
  defaultValue="Nama Grup"
  onBlurOrSubmit={async ({ value }) => {
    await fetch('/api/chats/123', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: value }),
    });
  }}
>
  {({ value }) => (
    <input className="input" />
  )}
</InlineEditable>

  * @example
// textarea
<InlineEditable defaultValue="Deskripsi">
  {({ value }) => (
    <textarea className="textarea" />
  )}
</InlineEditable>

  @example
  <InlineEditable defaultValue="Edit saya!">
  {({ value }) => (
    <div className="editable-div" />
  )}
</InlineEditable>

 */
/**
// 2
 'use client';
import React from 'react';
import { mergeRefs } from '@/resource/hooks/use-merged-ref';

export type VParams = {
  editing: boolean;
  value: string | number | readonly string[];
  defaultValue: string | number | readonly string[];
  onChange: React.Dispatch<React.SetStateAction<string | number | readonly string[]>>;
};

interface InlineEditableProps extends Omit<React.ComponentPropsWithRef<'div'>, 'children'> {
  onBlurOrSubmit?: ((v: VParams) => void) | ((v: VParams) => Promise<void>);
  defaultEditing?: boolean;
  editing?: boolean;
  onEditingChange?: (prev: boolean | ((prev: boolean) => boolean)) => void;
  children?: React.ReactNode | ((v: VParams) => React.ReactNode);
}

export function InlineEditable({
  ref,
  defaultValue = '',
  suppressHydrationWarning = true,
  suppressContentEditableWarning = true,
  onDoubleClick,
  onBlur,
  onKeyDown,
  onInput,
  onBlurOrSubmit,
  defaultEditing = false,
  editing: editingProp,
  onEditingChange: setEditingProp,
  children,
  ...props
}: InlineEditableProps) {
  const editableRef = React.useRef<HTMLElement>(null);

  const [value, setValue] = React.useState(defaultValue);
  const [_editing, _setEditing] = React.useState(defaultEditing);
  const editing = editingProp ?? _editing;

  const setEditing = React.useCallback(
    (prev: boolean | ((prev: boolean) => boolean)) => {
      const editingState = typeof prev === 'function' ? prev(editing) : prev;
      if (setEditingProp) setEditingProp(editingState);
      else _setEditing(editingState);
    },
    [editing, setEditingProp]
  );

  const resFn = { editing, value, defaultValue, onChange: setValue };

  const handleDoubleClick = React.useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      setEditing(true);
      onDoubleClick?.(e);
    },
    [setEditing, onDoubleClick]
  );

  const handleSubmit = React.useCallback(() => {
    if (value !== defaultValue) {
      onBlurOrSubmit?.(resFn);
    }
  }, [value, defaultValue, onBlurOrSubmit, resFn]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        setEditing(false);
        handleSubmit();
      }
      onKeyDown?.(e);
    },
    [setEditing, handleSubmit, onKeyDown]
  );

  const handleBlur = React.useCallback(
    (e: React.FocusEvent) => {
      setEditing(false);
      handleSubmit();
      onBlur?.(e);
    },
    [setEditing, handleSubmit, onBlur]
  );

  const handleInput = React.useCallback(
    (e: React.FormEvent<HTMLElement>) => {
      const target = e.currentTarget as HTMLElement;
      setValue(target.innerText);
      onInput?.(e);
    },
    [onInput]
  );

  // === CHILD HANDLING ===
  const childNode =
    typeof children === 'function' ? children(resFn) : children;

  const clonedChild = React.isValidElement(childNode) && editing
    ? injectPropsToChild(childNode, {
        value,
        onChange: (e: any) => {
          if (e?.target?.value !== undefined) {
            setValue(e.target.value);
          }
        },
        onInput: handleInput,
        onBlur: handleBlur,
        onKeyDown: handleKeyDown,
        autoFocus: true,
        suppressContentEditableWarning,
        contentEditable: childNode.props.contentEditable ?? false,
      })
    : childNode;

  return (
    <div
      ref={mergeRefs(ref, editableRef)}
      onDoubleClick={handleDoubleClick}
      {...props}
    >
      {clonedChild}
    </div>
  );
}

// === INJECT PROPS WITH TYPE-SPECIFIC LOGIC ===
function injectPropsToChild(
  child: React.ReactElement,
  {
    value,
    onChange,
    onInput,
    onBlur,
    onKeyDown,
    autoFocus,
    contentEditable,
    suppressContentEditableWarning,
  }: {
    value: any;
    onChange: any;
    onInput: any;
    onBlur: any;
    onKeyDown: any;
    autoFocus: boolean;
    contentEditable: boolean;
    suppressContentEditableWarning: boolean;
  }
) {
  const type = (child.type as any)?.toString?.() ?? '';
  const tag = typeof child.type === 'string' ? child.type : null;

  const isInputLike =
    tag === 'input' || tag === 'textarea' || type.includes('Input');

  if (isInputLike) {
    return React.cloneElement(child, {
      value,
      onChange,
      onBlur,
      onKeyDown,
      autoFocus,
    });
  }

  // assume contentEditable mode
  return React.cloneElement(child, {
    contentEditable: true,
    suppressContentEditableWarning,
    onInput,
    onBlur,
    onKeyDown,
    autoFocus,
    dangerouslySetInnerHTML: { __html: value },
  });
}

 */
