import Navbar from "./components/navbar";
import { ThemeProvider } from "./components/theme-provider";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="portfolio-theme">
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <Navbar />

        {/* Demo content to show theme changes */}
        <div className="max-w-4xl mx-auto p-8">
          <h1 className="text-4xl font-bold mb-8 text-primary">Portfolio</h1>

          <div className="bg-card p-6 rounded-lg border transition-colors duration-300">
            <h2 className="text-2xl font-semibold mb-4 text-card-foreground">
              Theme Toggle Demo
            </h2>
            <p className="text-muted-foreground">
              Click the theme toggle in the navbar to see the smooth transition
              between light and dark themes!
            </p>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
