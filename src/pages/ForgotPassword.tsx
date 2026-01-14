import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Icon from "@/components/ui/icon";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://functions.poehali.dev/853ae20f-b562-4446-a8c4-2631f2311321",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "request",
            email: email,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        toast({
          title: "Письмо отправлено",
          description: "Проверьте вашу почту для восстановления пароля",
        });
      } else {
        toast({
          title: "Ошибка",
          description: data.error || "Не удалось отправить письмо",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить запрос",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="mb-6">
            <Icon name="CheckCircle" size={64} className="mx-auto text-green-500" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Письмо отправлено</h1>
          <p className="text-gray-600 mb-6">
            Если этот email зарегистрирован в системе, вы получите письмо с
            инструкциями по восстановлению пароля.
          </p>
          <Link to="/">
            <Button className="w-full">Вернуться на главную</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="mb-8 text-center">
          <Icon name="KeyRound" size={48} className="mx-auto mb-4 text-blue-600" />
          <h1 className="text-3xl font-bold mb-2">Восстановление пароля</h1>
          <p className="text-gray-600">
            Введите email, и мы отправим инструкции по восстановлению
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-2"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                Отправка...
              </>
            ) : (
              <>
                <Icon name="Send" size={16} className="mr-2" />
                Отправить письмо
              </>
            )}
          </Button>

          <div className="text-center text-sm">
            <Link to="/" className="text-blue-600 hover:underline">
              Вернуться на главную
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
