import { NextRequest, NextResponse } from 'next/server';
import {
  getCredentialById,
  updateCredential,
  deleteCredential,
  CredentialInput,
} from '@/lib/credentials-management';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const { type, id } = await params;

    if (type !== 'admin' && type !== 'user') {
      return NextResponse.json(
        { error: 'Invalid credential type' },
        { status: 400 }
      );
    }

    const credential = await getCredentialById(type, parseInt(id));

    return NextResponse.json(credential);
  } catch (error) {
    console.error('Error fetching credential:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credential' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const { type, id } = await params;

    if (type !== 'admin' && type !== 'user') {
      return NextResponse.json(
        { error: 'Invalid credential type' },
        { status: 400 }
      );
    }

    const body = (await request.json()) as Partial<CredentialInput>;

    const credential = await updateCredential(type, parseInt(id), body);

    return NextResponse.json(credential);
  } catch (error) {
    console.error('Error updating credential:', error);
    const message = error instanceof Error ? error.message : 'Failed to update credential';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const { type, id } = await params;

    if (type !== 'admin' && type !== 'user') {
      return NextResponse.json(
        { error: 'Invalid credential type' },
        { status: 400 }
      );
    }

    await deleteCredential(type, parseInt(id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting credential:', error);
    return NextResponse.json(
      { error: 'Failed to delete credential' },
      { status: 500 }
    );
  }
}
