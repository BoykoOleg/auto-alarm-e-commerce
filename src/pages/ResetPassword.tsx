import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Icon from "@/components/ui/icon";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      toast({
        title: "Ошибка",
        description: "Токен восстановления не найден",
        variant: "destructive",
      });
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
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
      const response = await fetch(
        "https://functions.poehali.dev/853ae20f-b562-4446-a8c4-2631f2311321",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "confirm",
            token: token,
            password: password,
          }),
        }
      );

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

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <Icon name="XCircle" size={64} className="mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold mb-4">Неверная ссылка</h1>
          <p className="text-gray-600 mb-6">
            Ссылка для восстановления пароля недействительна
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
          <Icon name="Lock" size={48} className="mx-auto mb-4 text-blue-600" />
          <h1 className="text-3xl font-bold mb-2">Новый пароль</h1>
          <p className="text-gray-600">Введите новый пароль для вашего аккаунта</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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

export default ResetPassword;
