'use client';

import React from 'react';

interface UseShareProps extends ShareData {
  url?: string;
  getFile?: (content?: ShareData) => Promise<File | null | undefined> | (File | null | undefined);
}

export function useClipboardShare(props: UseShareProps) {
  const { url, title, text } = props;
  const [copied, setCopied] = React.useState(false);

  async function handleCopy() {
    const shareText = `${title}\n\n${text}\n\nKunjungi: ${url}`;

    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      alert(`"${title}"\nBerhasil disalin!\nTempel di WhatsApp, Telegram, atau lainnya.`);
    } catch (error) {
      console.error('Gagal menyalin:', error);
    }
  }

  return { handleCopy, copied };
}

export function useShare(props: UseShareProps) {
  const { url, getFile, ...data } = props;

  const [splash, setSplash] = React.useState(false);

  /*
  async function handleShare() {
    setSplash(true);
    setTimeout(() => {
      setSplash(false);
    }, 3500);

    try {
      if (navigator.share) {
        // Jika browser mendukung Web Share API
        await navigator.share({
          ...data,
          url: url || window.location.href // Mengambil URL saat ini
        });
      } else {
        // Jika browser tidak mendukung Web Share API
        // Di sini Anda bisa menampilkan dialog berbagi kustom atau pilihan lain
        alert('Browser Anda tidak mendukung fitur berbagi.');
      }
    } catch (error) {
      console.error('Gagal berbagi:', error);
    }
  }
  */

  async function handleShare() {
    setSplash(true);
    setTimeout(() => {
      setSplash(false);
    }, 3500);

    try {
      let files: File[] = [];

      // Ambil file PDF jika tersedia
      if (getFile) {
        const file = await getFile({ ...data, url: url || window.location.href });
        if (file) files.push(file);
      }

      const shareData: ShareData = {
        ...data,
        url: url || window.location.href,
        files: files.length > 0 ? files : undefined // Tambahkan file jika ada
      };

      if (navigator.canShare && !navigator.canShare(shareData)) {
        console.warn('Perangkat ini tidak mendukung berbagi file.');
        return alert('Perangkat ini hanya mendukung berbagi teks dan URL.');
      }

      await navigator.share(shareData);
    } catch (error) {
      console.error('Gagal berbagi:', error);
    }
  }

  return { handleShare, splash };
}
