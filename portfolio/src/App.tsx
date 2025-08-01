import Navbar from "./components/navbar";
import { ThemeProvider } from "./components/theme-provider";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="portfolio-theme">
      <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
        <Navbar />
      </div>
    </ThemeProvider>
  );
}

export default App;
