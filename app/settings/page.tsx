import { APP_VERSION } from "@/lib/constants";

export default function SettingsPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-normal">Settings</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Current version: {APP_VERSION}. Settings content is implemented in phase
        6.
      </p>
    </main>
  );
}
