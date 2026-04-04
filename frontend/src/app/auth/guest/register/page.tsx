import { redirect } from 'next/navigation';

export default function GuestRegisterPage() {
  redirect('/auth');
}
