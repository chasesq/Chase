import { NextRequest, NextResponse } from 'next/server';
import {
  getUserCredentials,
  createCredential,
  searchCredentials,
  CredentialInput,
} from '@/lib/credentials-management';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');

    let credentials;
    if (query) {
      credentials = await searchCredentials('user', query);
    } else {
      credentials = await getUserCredentials();
    }

    return NextResponse.json(credentials);
  } catch (error) {
    console.error('Error fetching user credentials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user credentials' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CredentialInput;

    // Validate required fields
    if (!body.email || !body.password || !body.full_name) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, full_name' },
        { status: 400 }
      );
    }

    const credential = await createCredential('user', body);

    return NextResponse.json(credential, { status: 201 });
  } catch (error) {
    console.error('Error creating user credential:', error);
    const message = error instanceof Error ? error.message : 'Failed to create user credential';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
