import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/resource/db/user/get-accounts';
import { pusherServer } from '@/resource/configs/pusher/pusher';

/**
import { auth } from '@/auth/auth';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await auth();

  if (!session?.user?.email) {
    return res.status(401);
  }

  const socketId = req.body.socket_id;
  const channel = req.body.channel_name;
  const data = {
    user_id: session?.user?.email,
    user_info: {
      id: session?.user?.id!,
      email: session?.user?.email!,
      name: session?.user?.username!,
      avatar: session?.user?.image!
    }
  };

  const authResponse = pusherServer.authorizeChannel(socketId, channel, data);
  return res.send(authResponse);
}
*/

export async function POST(req: Request) {
  try {
    // Parse request body
    const currentUser = await getCurrentUser();

    // const body = await req.json() // to → req.formData();
    // const socketId = body.socket_id;
    // const channelName = body.channel_name;

    const formData = await req.formData();
    const socketId = formData.get('socket_id') as string;
    const channelName = formData.get('channel_name') as string;

    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!currentUser || !currentUser.email) return new NextResponse('Unauthorized', { status: 401 });

    const data = {
      user_id: currentUser?.email!,
      // user_id: currentUser?.id!,
      user_info: {
        id: currentUser?.id!,
        email: currentUser?.email!,
        name: currentUser?.username!,
        avatar: currentUser?.image!
      }
    };

    // Authorize channel
    const authResponse = pusherServer.authorizeChannel(socketId, channelName, data);

    // Return response
    return new Response(JSON.stringify(authResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

    // return NextResponse.json(authResponse);
  } catch (error) {
    console.error('Pusher auth error:', error);
    // return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    return new NextResponse('Internal server error', { status: 500 });
  }
}
