export type CloudinaryUploadInfo = {
  /** @example asset_id: '0fcf0ca469610edd7e71353a6b8d06b1' */
  asset_id: string;
  /** @example public_id: 'assets/ga6lbwnhwqh0cffgsgye' */
  public_id: string;
  /** @example version: 1750080432 */
  version: number;
  /** @example version_id: '246498700babedba3bb8d7683a1b3f03' */
  version_id: string;
  /** @example signature: '1a015ffbbfd32a64e6b1f3fd19d01aa4b2faaa04' */
  signature: string;
  /** @example width: 320 */
  width: number;
  /** @example height: 320 */
  height: number;
  /** @example format: 'png' */
  format: string;
  /** @example resource_type: 'image' */
  resource_type: string;
  /** @example created_at: '2025-06-16T13:27:12Z' */
  created_at: string;
  /** @example tags: [] */
  tags: string[];
  /** @example bytes: 10047 */
  bytes: number;
  /** @example type: 'upload' */
  type: string;
  /** @example etag: 'b819835cd1521432d6357d3331f68757' */
  etag: string;
  /** @example placeholder: false */
  placeholder: boolean;
  /** @example url: 'http://res.cloudinary.com/<your_cloud_name>/image/upload/v1750080432/assets/ga6lbwnhwqh0cffgsgye.png' */
  url: string;
  /** @example secure_url: 'https://res.cloudinary.com/<your_cloud_name>/image/upload/v1750080432/assets/ga6lbwnhwqh0cffgsgye.png' */
  secure_url: string;
  /** @example folder: 'assets' */
  folder: string;
  /** @example access_mode: 'public' */
  access_mode: string;
  /** @example original_filename: 'oeri-logo-black' */
  original_filename: string;
};

export type Info = { message: string; status: number };
export type CloudinaryUpload = { error?: Info; success?: Info; data?: CloudinaryUploadInfo };

export type Options = {
  uploadPreset?: string;
  cloudName?: string;
};

/**
 * @example
 * // 📌 input:
 * function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
 *   const file = e.target.files?.[0];
 *   if (!file) return;
 *   cloudinaryUpload(file).then(console.log);
 * }
 * // full
 * <input
 *   type="file"
 *   accept="image/*"
 *   onChange={e => {
 *     const file = e.target.files?.[0];
 *     if (file) cloudinaryUpload(file).then(res => console.log(res));
 *   }}
 * />
 * @example
 * // 📌 drag & drop, atau image cropper, atau sumber lain:
 * const file = new File([blob], 'avatar.png', { type: 'image/png' });
 * await cloudinaryUpload(file);
 * // atau
 * const handleDrop = (files: File[]) => {
 *   cloudinaryUpload(files[0]).then(res => console.log(res));
 * };
 * @example
 * // 📌 programmatic upload (misal dari clipboard paste, camera capture, dll.):
 * const onDrop = useCallback((files: File[]) => {
 *   cloudinaryUpload(files[0]).then(res => {
 *     if ('data' in res) {
 *       form.setValue('image', res.data.secure_url);
 *     }
 *   });
 * }, []);
 * @param file File
 * @returns Promise<CloudinaryUpload>
 */
export async function cloudinaryUpload(file: File, opts: Options = {}): Promise<CloudinaryUpload> {
  // const user = await getCurrentUser();
  // if (!user) return { error: { message: 'Unauthorized', status: 403 } };

  const {
    //
    uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string,
    cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME as string
  } = opts;

  if (!file) return { error: { message: 'Missing File', status: 400 } };

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset); // ← wajib
  // formData.append('folder', 'avatars'); // opsional

  try {
    /** API FETCH URL: `https://api.cloudinary.com/v1_1/<your_cloud_name>/image/upload` */
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    });

    const data = await res.json();

    if (!res.ok) return { error: { message: data?.error?.message || 'Cloudinary upload failed', status: res.status } };

    // console.log('Cloudinary upload success:', data);
    // `data.secure_url` bisa kamu simpan ke DB atau set ke form state
    return { data: data as CloudinaryUploadInfo, success: { message: 'Cloudinary upload success', status: 200 } };
  } catch (err) {
    console.error('Upload failed', err);
    return { error: { message: 'Internal Error', status: 500 } };
  }
}
