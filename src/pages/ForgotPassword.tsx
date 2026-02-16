import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Icon from "@/components/ui/icon";

const RESET_URL = "https://functions.poehali.dev/853ae20f-b562-4446-a8c4-2631f2311321";

const ForgotPassword = () => {
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(RESET_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request", phone }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep("code");
        toast({
          title: "Код отправлен",
          description: "Запрос отправлен администратору в Telegram",
        });
      } else {
        toast({
          title: "Ошибка",
          description: data.error || "Не удалось отправить запрос",
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

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Ошибка",
        description: "Пароли не совпадают",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Ошибка",
        description: "Пароль должен быть минимум 6 символов",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(RESET_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm", code, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Успешно",
          description: "Пароль успешно изменен",
        });
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        toast({
          title: "Ошибка",
          description: data.error || "Не удалось изменить пароль",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="mb-8 text-center">
          <Icon name="KeyRound" size={48} className="mx-auto mb-4 text-blue-600" />
          <h1 className="text-3xl font-bold mb-2">Восстановление пароля</h1>
          {step === "phone" ? (
            <p className="text-gray-600">
              Введите номер телефона — код восстановления будет отправлен администратору
            </p>
          ) : (
            <p className="text-gray-600">
              Введите код из Telegram и новый пароль
            </p>
          )}
        </div>

        {step === "phone" ? (
          <form onSubmit={handlePhoneSubmit} className="space-y-6">
            <div>
              <Label htmlFor="phone">Номер телефона</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+7 (999) 123-45-67"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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
                  Запросить код
                </>
              )}
            </Button>

            <div className="text-center text-sm">
              <Link to="/" className="text-blue-600 hover:underline">
                Вернуться на главную
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCodeSubmit} className="space-y-6">
            <div>
              <Label htmlFor="code">Код восстановления</Label>
              <Input
                id="code"
                type="text"
                placeholder="6-значный код"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                maxLength={6}
                className="mt-2 text-center text-2xl tracking-widest"
              />
            </div>

            <div>
              <Label htmlFor="password">Новый пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="Минимум 6 символов"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Повторите пароль"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-2"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Icon name="Check" size={16} className="mr-2" />
                  Установить пароль
                </>
              )}
            </Button>

            <div className="text-center text-sm space-y-2">
              <button
                type="button"
                onClick={() => setStep("phone")}
                className="text-blue-600 hover:underline block w-full"
              >
                Запросить новый код
              </button>
              <Link to="/" className="text-blue-600 hover:underline block">
                Вернуться на главную
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
