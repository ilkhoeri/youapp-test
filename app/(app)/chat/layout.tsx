import { Navigation } from '@/resource/client/components/actions';
// import { getUsers } from '@/resource/db/user/get-accounts';
// import { getChats } from '@/resource/server/messages/get-chats';

interface LayoutProps {
  children: React.ReactNode;
}
export default function ChatsLayout({ children }: Readonly<LayoutProps>) {
  // const [chats, users] = await Promise.all([getChats(), getUsers()]);

  return (
    <section className="relative w-full min-h-screen max-w-screen-2xl mx-auto flex flex-col">
      <div className="mb-6 mt-8 grid grid-cols-3 justify-items-center items-center">
        <Navigation instance="back" className="mr-auto" />
        <p className="text-sm font-semibold"></p>
        <p className="w-max mr-4 rtl:mr-0 rtl:ml-4 text-sm font-semibold ml-auto py-0"></p>
      </div>

      {/* <ChatList title="Messages" accounts={users} items={chats} /> */}
      {children}
    </section>
  );
}
