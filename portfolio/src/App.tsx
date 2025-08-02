import Navbar from "./components/navbar";
import { ThemeProvider } from "./controllers/theme-provider";
import GalaxyExplorer from "./components/3D spaces/Galaxy Explorer/galaxyExplorer";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="portfolio-theme">
      <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
        <GalaxyExplorer />
      </div>
    </ThemeProvider>
  );
}

export default App;
