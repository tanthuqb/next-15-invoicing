
import Container from "@/components/container";

const Footer = () => {
  return (
    <footer className="mt-6 mb-8">
      <Container className="flex justify-between gap-4">
        <p className="text-sm">
          Invoicipedia &copy; {new Date().getFullYear()}
        </p>
        <p className="text-sm">
          Created by Hoang Cong Loc with Next.js, Supabase and Clerk
        </p>
      </Container>
    </footer>
  )
}

export default Footer;

