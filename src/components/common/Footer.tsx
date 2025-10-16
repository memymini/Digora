import Link from "next/link";
const Footer = () => {
  return (
    <footer className="border-t py-8 mt-16">
      <div className="container mx-auto px-4 text-center flex gap-8 items-center justify-center">
        <p className="caption-text text-muted-foreground">
          © 2025 디고라(Digora)
        </p>
        <Link href="/privacy" className="caption-text text-muted-foreground">
          개인정보처리방침
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
