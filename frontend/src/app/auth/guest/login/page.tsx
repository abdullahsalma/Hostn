import { redirect } from 'next/navigation';

export default function GuestLoginPage() {
  redirect('/auth');
}
