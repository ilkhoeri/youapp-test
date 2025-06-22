import { Navigation } from '@/resource/client/components/actions';
import { HomeFillIcon } from '@/resource/client/components/icons-fill';

interface LayoutProps {
  children: React.ReactNode;
}
export default function ChatsLayout({ children }: Readonly<LayoutProps>) {
  return (
    <section className="relative w-full min-h-screen max-w-screen-2xl mx-auto flex flex-col [&_[data-panel-group]]:mb-[38.5svh]">
      <div className="mb-6 mt-8 grid grid-cols-3 justify-items-center items-center">
        <Navigation instance="back" className="mr-auto" />
        <p className="text-sm font-semibold"></p>
        <Navigation instance="replace" href="/" className="w-max mr-4 rtl:mr-0 rtl:ml-4 text-sm font-semibold ml-auto py-0">
          <HomeFillIcon size={28} />
        </Navigation>
      </div>

      {/* <ChatList title="Messages" accounts={users} items={chats} /> */}
      {children}
    </section>
  );
}
