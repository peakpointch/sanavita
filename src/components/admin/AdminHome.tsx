type AdminHomeProps = {
  visibility?: boolean;
};

export function AdminHome({ visibility = true }: AdminHomeProps) {
  if (!visibility) return null;

  return (
    <main className="wf flex h-screen w-full flex-col items-center justify-center p-8 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="text-4xl font-bold text-brand-800">Willkommen im Admin-Bereich</h1>
        <p className="text-brand-800/70">
          Bitte wählen Sie eine Seite aus der Navigation auf der linken Seite aus, um zu beginnen.
        </p>
      </div>
    </main>
  );
}
