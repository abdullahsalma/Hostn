import { redirect } from 'next/navigation';

export default function HostRegisterPage() {
  redirect('/auth');
}
