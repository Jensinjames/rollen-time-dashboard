import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  return <ResetPasswordForm token={params.token} />
}
