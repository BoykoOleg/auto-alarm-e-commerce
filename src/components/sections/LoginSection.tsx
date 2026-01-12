import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Icon from '@/components/ui/icon'

interface LoginSectionProps {
  setActiveSection: (section: string) => void
  onLoginSuccess: (userData: any) => void
}

export const LoginSection = ({ setActiveSection, onLoginSuccess }: LoginSectionProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    const formElement = e.target as HTMLFormElement
    const formData = {
      email: (formElement.elements.namedItem('email') as HTMLInputElement).value,
      password: (formElement.elements.namedItem('password') as HTMLInputElement).value,
    }

    try {
      const response = await fetch('https://functions.poehali.dev/auth-api-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'login', ...formData }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setSubmitStatus('success')
        localStorage.setItem('authToken', result.token)
        localStorage.setItem('userData', JSON.stringify(result.user))
        onLoginSuccess(result.user)
        setTimeout(() => setActiveSection('dashboard'), 1000)
      } else {
        setSubmitStatus('error')
        setErrorMessage(result.message || 'Неверный email или пароль')
      }
    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage('Ошибка подключения к серверу')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    const formElement = e.target as HTMLFormElement
    const formData = {
      name: (formElement.elements.namedItem('name') as HTMLInputElement).value,
      email: (formElement.elements.namedItem('reg-email') as HTMLInputElement).value,
      phone: (formElement.elements.namedItem('phone') as HTMLInputElement).value,
      company_name: (formElement.elements.namedItem('company') as HTMLInputElement).value,
      password: (formElement.elements.namedItem('reg-password') as HTMLInputElement).value,
    }

    try {
      const response = await fetch('https://functions.poehali.dev/aa3aea15-0141-490d-aa72-389642c2efc3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'register', ...formData }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setSubmitStatus('success')
        localStorage.setItem('authToken', result.token)
        localStorage.setItem('userData', JSON.stringify(result.user))
        onLoginSuccess(result.user)
        setTimeout(() => setActiveSection('dashboard'), 1000)
      } else {
        setSubmitStatus('error')
        setErrorMessage(result.message || 'Ошибка регистрации')
      }
    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage('Ошибка подключения к серверу')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-20 min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="container px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveSection('home')}
              className="mb-4"
            >
              <Icon name="ArrowLeft" className="mr-2 h-4 w-4" />
              На главную
            </Button>
            <h1 className="font-heading text-3xl font-bold mb-2">Личный кабинет</h1>
            <p className="text-muted-foreground">
              Войдите или зарегистрируйтесь для работы с заявками
            </p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Войти в систему</CardTitle>
                  <CardDescription>
                    Введите email и пароль для входа
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="partner@example.com"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Пароль</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        required
                      />
                    </div>

                    {submitStatus === 'success' && (
                      <div className="bg-green-50 text-green-700 p-3 rounded-lg flex items-center gap-2">
                        <Icon name="CheckCircle" className="h-5 w-5" />
                        <span>Вход выполнен успешно!</span>
                      </div>
                    )}

                    {submitStatus === 'error' && (
                      <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center gap-2">
                        <Icon name="XCircle" className="h-5 w-5" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      <Icon name="LogIn" className="mr-2 h-4 w-4" />
                      {isSubmitting ? 'Вход...' : 'Войти'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Регистрация партнёра</CardTitle>
                  <CardDescription>
                    Создайте аккаунт для приёма заявок и получения бонусов
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Ваше имя</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Иван Иванов"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="company">Название компании (необязательно)</Label>
                      <Input
                        id="company"
                        name="company"
                        type="text"
                        placeholder="ООО 'Автосервис'"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Телефон</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+7 (___) ___-__-__"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="reg-email">Email</Label>
                      <Input
                        id="reg-email"
                        name="reg-email"
                        type="email"
                        placeholder="partner@example.com"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="reg-password">Пароль</Label>
                      <Input
                        id="reg-password"
                        name="reg-password"
                        type="password"
                        placeholder="Минимум 6 символов"
                        minLength={6}
                        required
                      />
                    </div>

                    {submitStatus === 'success' && (
                      <div className="bg-green-50 text-green-700 p-3 rounded-lg flex items-center gap-2">
                        <Icon name="CheckCircle" className="h-5 w-5" />
                        <span>Регистрация успешна!</span>
                      </div>
                    )}

                    {submitStatus === 'error' && (
                      <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center gap-2">
                        <Icon name="XCircle" className="h-5 w-5" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      <Icon name="UserPlus" className="mr-2 h-4 w-4" />
                      {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  )
}