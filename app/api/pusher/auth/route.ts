import { NextRequest, NextResponse } from 'next/server';
import { pusherServer } from '@/resource/server/messages/pusher';
import { currentUser } from '@/resource/db/user/get-accounts';

/**
import { auth } from '@/auth/auth';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await auth(req, res);

  if (!session?.user?.email) {
    return res.status(401);
  }

  const socketId = req.body.socket_id;
  const channel = req.body.channel_name;
  const data = {
    user_id: session.user.email
  };

  const authResponse = pusherServer.authorizeChannel(socketId, channel, data);
  return res.send(authResponse);
}
*/

export async function POST(request: NextRequest) {
  try {
    const session = await currentUser();

    if (!session || !session.email) return new NextResponse('Unauthorized', { status: 401 });

    if (!session?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const socketId = body.socket_id;
    const channel = body.channel_name;

    const data = {
      user_id: session.email,
      // user_id: session.id,
      user_info: {
        name: session.username,
        avatar: session.image
      }
    };

    // Authorize channel dengan Pusher
    const authResponse = pusherServer.authorizeChannel(socketId, channel, data);

    // Return response
    return new Response(JSON.stringify(authResponse), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Pusher auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
