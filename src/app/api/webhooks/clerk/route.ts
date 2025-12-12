// ============================================
// PREREQ - Clerk Webhook Handler
// POST /api/webhooks/clerk
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/server';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

interface ClerkUserData {
  id: string;
  email_addresses: Array<{
    email_address: string;
    id: string;
  }>;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  created_at: number;
  updated_at: number;
}

interface WebhookEvent {
  type: string;
  data: ClerkUserData;
}

export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    console.error('CLERK_WEBHOOK_SECRET not configured');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  // Get headers
  const headerPayload = await headers();
  const svixId = headerPayload.get('svix-id');
  const svixTimestamp = headerPayload.get('svix-timestamp');
  const svixSignature = headerPayload.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: 'Missing svix headers' },
      { status: 400 }
    );
  }

  // Get body
  const payload = await request.json();
  const body = JSON.stringify(payload);

  // Verify webhook signature
  const wh = new Webhook(webhookSecret);
  let event: WebhookEvent;

  try {
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // Handle different event types
  switch (event.type) {
    case 'user.created': {
      const { id, email_addresses, first_name, last_name } = event.data;

      const email = email_addresses?.[0]?.email_address;
      if (!email) {
        console.error('No email found for user:', id);
        return NextResponse.json(
          { error: 'No email found' },
          { status: 400 }
        );
      }

      const name = [first_name, last_name].filter(Boolean).join(' ') || null;

      // Create user in database
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: insertError } = await (supabase as any).from('users').insert({
        clerk_id: id,
        email,
        name,
        plan: 'free',
      });

      if (insertError) {
        console.error('Failed to create user:', insertError);
        // Check if user already exists (duplicate webhook)
        if (insertError.code === '23505') {
          return NextResponse.json({ message: 'User already exists' });
        }
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        );
      }

      console.log('User created:', id);
      break;
    }

    case 'user.updated': {
      const { id, email_addresses, first_name, last_name } = event.data;

      const email = email_addresses?.[0]?.email_address;
      const name = [first_name, last_name].filter(Boolean).join(' ') || null;

      // Update user in database
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase as any)
        .from('users')
        .update({
          email: email || undefined,
          name,
          updated_at: new Date().toISOString(),
        })
        .eq('clerk_id', id);

      if (updateError) {
        console.error('Failed to update user:', updateError);
        return NextResponse.json(
          { error: 'Failed to update user' },
          { status: 500 }
        );
      }

      console.log('User updated:', id);
      break;
    }

    case 'user.deleted': {
      const { id } = event.data;

      // Delete user from database (cascades to briefs, chats, etc.)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: deleteError } = await (supabase as any)
        .from('users')
        .delete()
        .eq('clerk_id', id);

      if (deleteError) {
        console.error('Failed to delete user:', deleteError);
        return NextResponse.json(
          { error: 'Failed to delete user' },
          { status: 500 }
        );
      }

      console.log('User deleted:', id);
      break;
    }

    default:
      console.log('Unhandled webhook event:', event.type);
  }

  return NextResponse.json({ message: 'Webhook processed' });
}
