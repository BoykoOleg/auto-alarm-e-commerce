import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";

interface ContactsSectionProps {
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  submitStatus: "idle" | "success" | "error";
  setSubmitStatus: (status: "idle" | "success" | "error") => void;
}

export const ContactsSection = ({
  isSubmitting,
  setIsSubmitting,
  submitStatus,
  setSubmitStatus,
}: ContactsSectionProps) => {
  return (
    <section className="py-20">
      <div className="container px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold mb-4">
              Контакты
            </h2>
            <p className="text-muted-foreground">
              Свяжитесь с нами удобным способом
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="font-heading text-xl flex items-center gap-2">
                    <Icon name="Phone" className="h-5 w-5 text-primary" />
                    Телефон
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold">
                    +7 (901) 911-12-51
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Красноярск
                  </p>
                </CardContent>
              </Card>

              <Card
                className="animate-fade-in"
                style={{ animationDelay: "0.1s" }}
              >
                <CardHeader>
                  <CardTitle className="font-heading text-xl flex items-center gap-2">
                    <Icon name="Mail" className="h-5 w-5 text-primary" />
                    Email
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg">info@autosecure.ru</p>
                  <p className="text-sm text-muted-foreground">
                    Ответим в течение 1 часа
                  </p>
                </CardContent>
              </Card>

              <Card
                className="animate-fade-in"
                style={{ animationDelay: "0.2s" }}
              >
                <CardHeader>
                  <CardTitle className="font-heading text-xl flex items-center gap-2">
                    <Icon name="MapPin" className="h-5 w-5 text-primary" />
                    Адрес
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg">
                    г. Красноярск, ул. Дудинская, 3 стр.2
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Пн-Пт: 9:00 - 20:00
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Сб-Вс: 10:00 - 18:00
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="animate-scale-in">
              <CardHeader>
                <CardTitle className="font-heading text-xl">
                  Форма обратной связи
                </CardTitle>
                <CardDescription>
                  Оставьте заявку и мы свяжемся с вами в ближайшее время
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  className="space-y-4"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setIsSubmitting(true);
                    setSubmitStatus("idle");

                    const formElement = e.target as HTMLFormElement;
                    const formData = {
                      name: (
                        formElement.elements.namedItem(
                          "contact-name",
                        ) as HTMLInputElement
                      ).value,
                      phone: (
                        formElement.elements.namedItem(
                          "contact-phone",
                        ) as HTMLInputElement
                      ).value,
                      car: (
                        formElement.elements.namedItem(
                          "contact-email",
                        ) as HTMLInputElement
                      ).value,
                      message: (
                        formElement.elements.namedItem(
                          "contact-message",
                        ) as HTMLTextAreaElement
                      ).value,
                      type: "Обратная связь",
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
                  <div>
                    <Input
                      name="contact-name"
                      placeholder="Ваше имя"
                      required
                    />
                  </div>
                  <div>
                    <Input
                      name="contact-phone"
                      type="tel"
                      placeholder="Телефон"
                      required
                    />
                  </div>
                  <div>
                    <Input
                      name="contact-email"
                      type="email"
                      placeholder="Email"
                    />
                  </div>
                  <div>
                    <Textarea
                      name="contact-message"
                      placeholder="Сообщение"
                      rows={4}
                      required
                    />
                  </div>

                  {submitStatus === "success" && (
                    <div className="bg-green-50 text-green-700 p-3 rounded-lg flex items-center gap-2">
                      <Icon name="CheckCircle" className="h-5 w-5" />
                      <span>Сообщение отправлено!</span>
                    </div>
                  )}

                  {submitStatus === "error" && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center gap-2">
                      <Icon name="XCircle" className="h-5 w-5" />
                      <span>Ошибка отправки.</span>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    <Icon name="Send" className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Отправка..." : "Отправить заявку"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
