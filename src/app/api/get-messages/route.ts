import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import mongoose from 'mongoose';
import { User } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/options';

export async function GET(request: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const _user: User = session?.user;

  if (!session || !_user) {
    return Response.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }
  const userId = new mongoose.Types.ObjectId(_user._id); // ye id string ko mongoose ke ObjectId me convert kar raha hai  kyu ki aggregation me ObjectId chahiye hota hai
  try {
    const user = await UserModel.aggregate([
      { $match: { _id: userId } },
      { $unwind: '$messages' }, // unwind array ke har element ko alag document bana deta hai see pipeline 25:00
      { $sort: { 'messages.createdAt': -1 } }, // sort kar raha hai messages ko createdAt ke basis pe descending order me
      //{ $limit: 20 }, // sirf 20 messages le raha hai
      { $group: { _id: '$_id', messages: { $push: '$messages' } } }, // fir se group kar raha hai messages ko ek array me
    ]).exec();

    if (!user || user.length === 0) {
      return Response.json(
        { message: 'User not found', success: false },
        { status: 404 }
      );
    }

    return Response.json(
      { messages: user[0].messages },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return Response.json(
      { message: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}
