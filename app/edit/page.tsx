import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/Container";
import LoginForm from "@/components/edit/LoginForm";
import { getIsEditor } from "@/lib/editor-state";
import { isAuthConfigured } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Edit",
  robots: { index: false, follow: false },
};

export default async function EditPage() {
  const editor = await getIsEditor();
  const configured = isAuthConfigured();

  return (
    <section className="bg-cream">
      <Container className="flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
        <p className="eyebrow text-sage">KK Benjamin</p>
        <h1 className="mt-4 font-display text-h2 font-semibold text-forest">
          {editor ? "You're logged in" : "Edit your site"}
        </h1>

        {editor ? (
          <div className="mt-6 flex flex-col items-center gap-4">
            <p className="max-w-md text-forest/70">
              Head back to your site and tap <strong>Edit site</strong> in the bar
              at the bottom to start changing text and photos.
            </p>
            <Link
              href="/"
              className="rounded-[8px] bg-forest px-6 py-3.5 text-[0.75rem] font-medium uppercase tracking-[0.14em] text-cream transition-colors hover:bg-forest-deep"
            >
              Go to my site
            </Link>
          </div>
        ) : (
          <div className="mt-8 flex w-full flex-col items-center">
            {!configured && (
              <p className="mb-5 max-w-md rounded-[8px] bg-blush/30 px-4 py-3 text-sm text-forest/80">
                Editing isn&apos;t switched on yet. Once the site owner adds the
                admin password, this is where you&apos;ll log in.
              </p>
            )}
            <LoginForm />
          </div>
        )}
      </Container>
    </section>
  );
}
