import { Button } from '@/components/ui/button'
import Icon from '@/components/ui/icon'

interface HeaderProps {
  activeSection: string
  setActiveSection: (section: string) => void
  isAuthenticated?: boolean
}

export const Header = ({ activeSection, setActiveSection, isAuthenticated }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Icon name="Shield" className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-heading text-xl font-bold">DivisionAuto</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <button
            onClick={() => setActiveSection('home')}
            className={`text-sm font-medium transition-colors hover:text-primary ${
              activeSection === 'home' ? 'text-primary' : 'text-foreground/60'
            }`}
          >
            Главная
          </button>
          <button
            onClick={() => setActiveSection('catalog')}
            className={`text-sm font-medium transition-colors hover:text-primary ${
              activeSection === 'catalog' ? 'text-primary' : 'text-foreground/60'
            }`}
          >
            Каталог
          </button>
          <button
            onClick={() => setActiveSection('russification')}
            className={`text-sm font-medium transition-colors hover:text-primary ${
              activeSection === 'russification' ? 'text-primary' : 'text-foreground/60'
            }`}
          >
            Русификация
          </button>
          <button
            onClick={() => setActiveSection('services')}
            className={`text-sm font-medium transition-colors hover:text-primary ${
              activeSection === 'services' ? 'text-primary' : 'text-foreground/60'
            }`}
          >
            Услуги
          </button>
          <button
            onClick={() => setActiveSection('about')}
            className={`text-sm font-medium transition-colors hover:text-primary ${
              activeSection === 'about' ? 'text-primary' : 'text-foreground/60'
            }`}
          >
            О компании
          </button>
          <button
            onClick={() => setActiveSection('contacts')}
            className={`text-sm font-medium transition-colors hover:text-primary ${
              activeSection === 'contacts' ? 'text-primary' : 'text-foreground/60'
            }`}
          >
            Контакты
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <Button className="hidden md:flex" variant="outline" size="sm">
            <Icon name="Phone" className="mr-2 h-4 w-4" />
            +7 (901) 911-12-51
          </Button>
          
          {isAuthenticated ? (
            <Button 
              className="hidden md:flex" 
              size="sm"
              onClick={() => setActiveSection('dashboard')}
            >
              <Icon name="User" className="mr-2 h-4 w-4" />
              Кабинет
            </Button>
          ) : (
            <Button 
              className="hidden md:flex" 
              size="sm"
              onClick={() => setActiveSection('login')}
            >
              <Icon name="LogIn" className="mr-2 h-4 w-4" />
              Вход
            </Button>
          )}

          <Button variant="ghost" size="icon" className="md:hidden">
            <Icon name="Menu" className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </header>
  )
}