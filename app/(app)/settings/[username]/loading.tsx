import { Loader } from '@/resource/client/components/loader';

export default function Loading() {
  return (
    <main className="relative flex h-screen min-h-screen w-full items-center bg-background-theme justify-center">
      {/* <Loader type="progressbar" /> */}
      Load...
    </main>
  );
}
