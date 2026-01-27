import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Icon from "@/components/ui/icon";

export const AboutSection = () => {
  return (
    <section className="py-20">
      <div className="container px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold mb-4">
              О компании
            </h2>
            <p className="text-muted-foreground text-lg">
              Доверие клиентов - наша главная ценность
            </p>
          </div>

          <Card className="mb-8 animate-fade-in">
            <CardHeader>
              <CardTitle className="font-heading text-2xl">
                DivisionAuto - ваш эксперт по русификации
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Мы специализируемся на русификации магнитол, бортовых
                компьютеров и мультимедийных систем уже более 10 лет. За это
                время мы помогли более 5000 владельцев автомобилей по всей
                России получить полностью русифицированный интерфейс авто.
              </p>
              <p>
                Наша команда состоит из сертифицированных специалистов по
                автомобильной электронике. Мы работаем со всеми популярными
                марками автомобилей и используем только официальные прошивки
                и языковые пакеты. Гарантия на все виды работ - 1 год.
              </p>
              <p>
                Русификация - это не просто перевод меню, а полная адаптация
                интерфейса автомобиля для удобства и безопасности вождения.
                Мы работаем с автомобилями всех марок - от японских до
                премиальных европейских брендов.
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardHeader>
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-2 mx-auto">
                  <Icon name="Award" className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="font-heading">Качество</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Используем только официальные прошивки и сертифицированное
                  оборудование
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-2 mx-auto">
                  <Icon name="Users" className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="font-heading">Опыт</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Более 10 лет на рынке и 5000+ успешно выполненных проектов
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-2 mx-auto">
                  <Icon
                    name="Headphones"
                    className="h-6 w-6 text-primary"
                  />
                </div>
                <CardTitle className="font-heading">Поддержка</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Круглосуточная техническая поддержка и гарантийное
                  обслуживание
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
