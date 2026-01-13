import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface FooterProps {
  setActiveSection: (section: string) => void;
}

export const Footer = ({ setActiveSection }: FooterProps) => {
  return (
    <footer className="border-t bg-muted/30 py-12">
      <div className="container px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Icon
                  name="Shield"
                  className="h-6 w-6 text-primary-foreground"
                />
              </div>
              <span className="font-heading text-xl font-bold">
                DivisionAuto
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Русификация и защита вашего автомобиля
            </p>
          </div>

          <div>
            <h3 className="font-heading font-semibold mb-4">Услуги</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <button
                  className="hover:text-primary transition-colors"
                  onClick={() => setActiveSection("russification")}
                >
                  Русификация
                </button>
              </li>
              <li>
                <button
                  className="hover:text-primary transition-colors"
                  onClick={() => setActiveSection("catalog")}
                >
                  Каталог
                </button>
              </li>
              <li>
                <button
                  className="hover:text-primary transition-colors"
                  onClick={() => setActiveSection("services")}
                >
                  Установка
                </button>
              </li>
              <li>
                <button className="hover:text-primary transition-colors">
                  Камеры
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-semibold mb-4">Компания</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <button className="hover:text-primary transition-colors">
                  О нас
                </button>
              </li>
              <li>
                <button className="hover:text-primary transition-colors">
                  Услуги
                </button>
              </li>
              <li>
                <button className="hover:text-primary transition-colors">
                  Доставка
                </button>
              </li>
              <li>
                <button className="hover:text-primary transition-colors">
                  Гарантия
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-semibold mb-4">Контакты</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Icon name="Phone" className="h-4 w-4" />
                +7 (901) 911-12-51
              </li>
              <li className="flex items-center gap-2">
                <Icon name="Mail" className="h-4 w-4" />
                LiveMotor@yandex.ru
              </li>
              <li className="flex items-center gap-2">
                <Icon name="MapPin" className="h-4 w-4" />
                Красноярск, ул. Дудинская, 3 стр.2
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 DivisionAuto. Все права защищены.
          </p>
          <div className="flex gap-4">
            <Button variant="ghost" size="icon">
              <Icon name="Facebook" className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Icon name="Instagram" className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Icon name="Youtube" className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};
