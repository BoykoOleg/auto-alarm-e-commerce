import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";

interface Service {
  title: string;
  description: string;
  price: string;
  icon: string;
}

interface StaticServicesSectionProps {
  services: Service[];
  setActiveSection: (section: string) => void;
}

export const StaticServicesSection = ({
  services,
  setActiveSection,
}: StaticServicesSectionProps) => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl font-bold mb-4">
            Наши услуги
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Полный спектр услуг по установке и обслуживанию автосигнализаций
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
          {services.map((service, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <Icon
                    name={service.icon}
                    className="h-6 w-6 text-primary"
                  />
                </div>
                <CardTitle className="font-heading">
                  {service.title}
                </CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-between items-center">
                <p className="text-xl font-bold text-primary">
                  {service.price}
                </p>
                <Button
                  variant="outline"
                  onClick={() => setActiveSection("contacts")}
                >
                  Заказать
                  <Icon name="ArrowRight" className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">
              Доставка от партнёров
            </CardTitle>
            <CardDescription>
              Сотрудничаем с крупнейшими поставщиками автомобильного
              оборудования
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-6 justify-center items-center">
              <Badge variant="outline" className="text-base px-4 py-2">
                CDEK
              </Badge>
              <Badge variant="outline" className="text-base px-4 py-2">
                Почта России
              </Badge>
              <Badge variant="outline" className="text-base px-4 py-2">
                Boxberry
              </Badge>
              <Badge variant="outline" className="text-base px-4 py-2">
                DPD
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
