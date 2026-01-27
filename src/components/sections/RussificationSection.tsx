import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";

interface RussificationSectionProps {
  setSelectedCarBrand: (brand: string) => void;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  submitStatus: "idle" | "success" | "error";
  setSubmitStatus: (status: "idle" | "success" | "error") => void;
}

export const RussificationSection = ({
  setSelectedCarBrand,
  isSubmitting,
  setIsSubmitting,
  submitStatus,
  setSubmitStatus,
}: RussificationSectionProps) => {
  return (
    <section className="py-20">
      <div className="container px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4">🌐 Русификация автомобилей</Badge>
            <h2 className="font-heading text-3xl font-bold mb-4">
              Русификация автомобильных систем
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              Профессиональная русификация мультимедиа, бортовых компьютеров
              и других систем для вашего комфорта
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card className="animate-fade-in">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <Icon name="Monitor" className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="font-heading text-2xl">
                  Мультимедийные системы
                </CardTitle>
                <CardDescription className="text-base">
                  Русификация меню, голосовых команд и интерфейса
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Icon
                      name="CheckCircle"
                      className="h-5 w-5 text-primary mt-0.5"
                    />
                    <span>Перевод всех пунктов меню на русский язык</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon
                      name="CheckCircle"
                      className="h-5 w-5 text-primary mt-0.5"
                    />
                    <span>Установка русских голосовых подсказок</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon
                      name="CheckCircle"
                      className="h-5 w-5 text-primary mt-0.5"
                    />
                    <span>Русские карты навигации</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon
                      name="CheckCircle"
                      className="h-5 w-5 text-primary mt-0.5"
                    />
                    <span>Настройка русской клавиатуры</span>
                  </li>
                </ul>
                <div className="mt-6 pt-6 border-t">
                  <p className="text-lg font-bold text-primary mb-2">
                    от 5 000 ₽
                  </p>
                  <Button className="w-full">
                    Заказать русификацию
                    <Icon name="ArrowRight" className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card
              className="animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <Icon name="Gauge" className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="font-heading text-2xl">
                  Бортовые компьютеры
                </CardTitle>
                <CardDescription className="text-base">
                  Русификация приборной панели и информационных экранов
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Icon
                      name="CheckCircle"
                      className="h-5 w-5 text-primary mt-0.5"
                    />
                    <span>Перевод сообщений на приборной панели</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon
                      name="CheckCircle"
                      className="h-5 w-5 text-primary mt-0.5"
                    />
                    <span>Русификация меню настроек автомобиля</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon
                      name="CheckCircle"
                      className="h-5 w-5 text-primary mt-0.5"
                    />
                    <span>Перевод предупреждений и уведомлений</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon
                      name="CheckCircle"
                      className="h-5 w-5 text-primary mt-0.5"
                    />
                    <span>Настройка региональных параметров</span>
                  </li>
                </ul>
                <div className="mt-6 pt-6 border-t">
                  <p className="text-lg font-bold text-primary mb-2">
                    от 5 000 ₽
                  </p>
                  <Button className="w-full">
                    Заказать русификацию
                    <Icon name="ArrowRight" className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-12 bg-gradient-to-br from-primary/5 to-accent/5 animate-scale-in">
            <CardHeader>
              <CardTitle className="font-heading text-2xl">
                Поддерживаемые марки автомобилей
              </CardTitle>
              <CardDescription>
                Работаем с большинством популярных марок и моделей
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: "Toyota", icon: "Car" },
                  { name: "Lexus", icon: "Car" },
                  { name: "BMW", icon: "Car" },
                  { name: "Mercedes-Benz", icon: "Car" },
                  { name: "Audi", icon: "Car" },
                  { name: "Volkswagen", icon: "Car" },
                  { name: "Mazda", icon: "Car" },
                  { name: "Honda", icon: "Car" },
                  { name: "Nissan", icon: "Car" },
                  { name: "Mitsubishi", icon: "Car" },
                  { name: "Subaru", icon: "Car" },
                  { name: "Porsche", icon: "Car" },
                ].map((brand, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto py-4 flex flex-col gap-2 hover:bg-primary/5"
                    onClick={() => setSelectedCarBrand(brand.name)}
                  >
                    <Icon name={brand.icon} className="h-6 w-6" />
                    <span className="font-semibold">{brand.name}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardHeader>
              <CardTitle className="font-heading text-2xl flex items-center gap-2">
                <Icon name="Calculator" className="h-6 w-6 text-primary" />
                Рассчитать стоимость
              </CardTitle>
              <CardDescription>
                Оставьте заявку и мы свяжемся с вами для уточнения деталей
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                className="grid gap-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setIsSubmitting(true);
                  setSubmitStatus("idle");

                  const formElement = e.target as HTMLFormElement;
                  const formData = {
                    name: (
                      formElement.elements.namedItem(
                        "russification-name",
                      ) as HTMLInputElement
                    ).value,
                    phone: (
                      formElement.elements.namedItem(
                        "russification-phone",
                      ) as HTMLInputElement
                    ).value,
                    car: (
                      formElement.elements.namedItem(
                        "russification-car",
                      ) as HTMLInputElement
                    ).value,
                    message: (
                      formElement.elements.namedItem(
                        "russification-message",
                      ) as HTMLTextAreaElement
                    ).value,
                    type: "Русификация",
                  };

                  try {
                    const response = await fetch(
                      "https://functions.poehali.dev/3ecd03ac-7f19-45a4-b1aa-563f140ea3c9",
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify(formData),
                      },
                    );

                    if (response.ok) {
                      setSubmitStatus("success");
                      formElement.reset();
                    } else {
                      setSubmitStatus("error");
                    }
                  } catch (error) {
                    setSubmitStatus("error");
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="russification-name">Ваше имя</Label>
                    <Input
                      id="russification-name"
                      name="russification-name"
                      placeholder="Иван"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="russification-phone">Телефон</Label>
                    <Input
                      id="russification-phone"
                      name="russification-phone"
                      type="tel"
                      placeholder="+7 (___) ___-__-__"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="russification-car">
                    Марка и модель автомобиля
                  </Label>
                  <Input
                    id="russification-car"
                    name="russification-car"
                    placeholder="Toyota Camry 2020"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="russification-message">
                    Комментарий (необязательно)
                  </Label>
                  <Textarea
                    id="russification-message"
                    name="russification-message"
                    placeholder="Что нужно русифицировать?"
                    rows={3}
                  />
                </div>

                {submitStatus === "success" && (
                  <div className="bg-green-50 text-green-700 p-3 rounded-lg flex items-center gap-2">
                    <Icon name="CheckCircle" className="h-5 w-5" />
                    <span>Заявка отправлена!</span>
                  </div>
                )}

                {submitStatus === "error" && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center gap-2">
                    <Icon name="XCircle" className="h-5 w-5" />
                    <span>Ошибка отправки.</span>
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  <Icon name="Send" className="mr-2 h-5 w-5" />
                  {isSubmitting ? "Отправка..." : "Отправить заявку"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
