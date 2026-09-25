import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="Crear Cuenta | Paraiso Biker"
        description="Sistema de gestión - Paraiso Biker"
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
