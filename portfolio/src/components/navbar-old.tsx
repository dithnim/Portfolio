import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";

const Navbar = () => {
  return (
    <div className="top-0 sticky h-14 flex items-center justify-between px-3 bg-background/80 backdrop-blur-sm border-b transition-colors duration-300">
      <div>
        <Button variant="ghost" className="px-2">
          <i className="bx bx-home text-lg"></i>
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </div>
  );
};

export default Navbar;

