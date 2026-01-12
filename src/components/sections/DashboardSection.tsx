import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Icon from '@/components/ui/icon'

interface DashboardSectionProps {
  setActiveSection: (section: string) => void
  userData: any
  onLogout: () => void
}

export const DashboardSection = ({ setActiveSection, userData, onLogout }: DashboardSectionProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [requests, setRequests] = useState<any[]>([])
  const [works, setWorks] = useState<any[]>([])
  const [bonusHistory, setBonusHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    const token = localStorage.getItem('authToken')

    try {
      const response = await fetch('https://functions.poehali.dev/08452dc9-363d-4b0e-b976-d796d2cc8717', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setRequests(data.requests || [])
        setWorks(data.works || [])
        setBonusHistory(data.bonusHistory || [])
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    const formElement = e.target as HTMLFormElement
    const formData = {
      client_name: (formElement.elements.namedItem('client-name') as HTMLInputElement).value,
      client_phone: (formElement.elements.namedItem('client-phone') as HTMLInputElement).value,
      client_email: (formElement.elements.namedItem('client-email') as HTMLInputElement).value,
      car_brand: (formElement.elements.namedItem('car-brand') as HTMLInputElement).value,
      car_model: (formElement.elements.namedItem('car-model') as HTMLInputElement).value,
      car_year: parseInt((formElement.elements.namedItem('car-year') as HTMLInputElement).value),
      service_type: (formElement.elements.namedItem('service-type') as HTMLInputElement).value,
      description: (formElement.elements.namedItem('description') as HTMLTextAreaElement).value,
    }

    const token = localStorage.getItem('authToken')

    try {
      const response = await fetch('https://functions.poehali.dev/08452dc9-363d-4b0e-b976-d796d2cc8717', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitStatus('success')
        formElement.reset()
        loadDashboardData()
        
        await fetch('https://functions.poehali.dev/3ecd03ac-7f19-45a4-b1aa-563f140ea3c9', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: userData?.name || 'Партнёр',
            phone: formData.client_phone,
            car: `${formData.car_brand} ${formData.car_model} ${formData.car_year}`,
            message: `Тип услуги: ${formData.service_type}. ${formData.description || 'Без комментария'}`,
            type: 'Заявка от партнёра',
          }),
        }).catch(err => console.error('Ошибка отправки в Telegram:', err))
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: 'Ожидает', variant: 'secondary' },
      in_progress: { label: 'В работе', variant: 'default' },
      completed: { label: 'Завершено', variant: 'outline' },
      cancelled: { label: 'Отменено', variant: 'destructive' },
    }
    const statusInfo = statusMap[status] || statusMap.pending
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  const getServiceTypeName = (type: string) => {
    const types: Record<string, string> = {
      multimedia: 'Мультимедиа',
      dashboard: 'Бортовой компьютер',
      navigation: 'Навигация',
      climate: 'Климат-контроль',
      full: 'Полная русификация',
    }
    return types[type] || type
  }

  return (
    <section className="py-12 min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold mb-2">Личный кабинет</h1>
            <p className="text-muted-foreground">
              {userData?.company_name || userData?.name}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveSection('home')}
            >
              <Icon name="Home" className="mr-2 h-4 w-4" />
              На главную
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
            >
              <Icon name="LogOut" className="mr-2 h-4 w-4" />
              Выход
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Баланс бонусов
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Icon name="Award" className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-3xl font-bold">{userData?.bonus_balance || 0}</p>
                  <p className="text-xs text-muted-foreground">бонусных баллов</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Активных заявок
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Icon name="Clock" className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-3xl font-bold">
                    {requests.filter(r => r.status === 'pending' || r.status === 'in_progress').length}
                  </p>
                  <p className="text-xs text-muted-foreground">в обработке</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Всего работ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Icon name="CheckCircle" className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-3xl font-bold">{works.length}</p>
                  <p className="text-xs text-muted-foreground">завершено</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="new-request" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="new-request">Новая заявка</TabsTrigger>
            <TabsTrigger value="requests">Мои заявки ({requests.length})</TabsTrigger>
            <TabsTrigger value="history">История и бонусы</TabsTrigger>
          </TabsList>

          <TabsContent value="new-request">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Plus" className="h-5 w-5 text-primary" />
                  Создать заявку на русификацию
                </CardTitle>
                <CardDescription>
                  Заполните данные клиента и автомобиля. После выполнения работы вы получите бонусы.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitRequest} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Данные клиента</h3>
                      <div>
                        <Label htmlFor="client-name">Имя клиента *</Label>
                        <Input
                          id="client-name"
                          name="client-name"
                          placeholder="Иван Петров"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="client-phone">Телефон клиента *</Label>
                        <Input
                          id="client-phone"
                          name="client-phone"
                          type="tel"
                          placeholder="+7 (___) ___-__-__"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="client-email">Email клиента</Label>
                        <Input
                          id="client-email"
                          name="client-email"
                          type="email"
                          placeholder="client@example.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold">Данные автомобиля</h3>
                      <div>
                        <Label htmlFor="car-brand">Марка *</Label>
                        <Input
                          id="car-brand"
                          name="car-brand"
                          placeholder="Toyota"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="car-model">Модель *</Label>
                        <Input
                          id="car-model"
                          name="car-model"
                          placeholder="Camry"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="car-year">Год выпуска *</Label>
                        <Input
                          id="car-year"
                          name="car-year"
                          type="number"
                          min="1990"
                          max="2026"
                          placeholder="2020"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="service-type">Тип услуги *</Label>
                    <Select name="service-type" defaultValue="multimedia" required>
                      <SelectTrigger id="service-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="multimedia">Мультимедийная система</SelectItem>
                        <SelectItem value="dashboard">Бортовой компьютер</SelectItem>
                        <SelectItem value="navigation">Навигация</SelectItem>
                        <SelectItem value="climate">Климат-контроль</SelectItem>
                        <SelectItem value="full">Полная русификация</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description">Комментарий</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Дополнительная информация о работе..."
                      rows={4}
                    />
                  </div>

                  {submitStatus === 'success' && (
                    <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center gap-2">
                      <Icon name="CheckCircle" className="h-5 w-5" />
                      <div>
                        <p className="font-semibold">Заявка создана!</p>
                        <p className="text-sm">После завершения работы вам будут начислены бонусы.</p>
                      </div>
                    </div>
                  )}

                  {submitStatus === 'error' && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center gap-2">
                      <Icon name="XCircle" className="h-5 w-5" />
                      <span>Ошибка создания заявки. Попробуйте позже.</span>
                    </div>
                  )}

                  <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    <Icon name="Send" className="mr-2 h-5 w-5" />
                    {isSubmitting ? 'Отправка...' : 'Создать заявку'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Мои заявки</CardTitle>
                <CardDescription>
                  Все созданные вами заявки на русификацию
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <Icon name="Loader" className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p className="text-muted-foreground">Загрузка...</p>
                  </div>
                ) : requests.length === 0 ? (
                  <div className="text-center py-8">
                    <Icon name="FileText" className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">У вас пока нет заявок</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requests.map((request) => (
                      <Card key={request.id} className="border-2">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">
                                {request.car_brand} {request.car_model} ({request.car_year})
                              </CardTitle>
                              <CardDescription className="mt-1">
                                Клиент: {request.client_name} • {request.client_phone}
                              </CardDescription>
                            </div>
                            {getStatusBadge(request.status)}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Icon name="Wrench" className="h-4 w-4 text-muted-foreground" />
                              <span>{getServiceTypeName(request.service_type)}</span>
                            </div>
                            {request.description && (
                              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                <Icon name="MessageSquare" className="h-4 w-4 mt-0.5" />
                                <span>{request.description}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Icon name="Calendar" className="h-4 w-4" />
                              <span>{new Date(request.created_at).toLocaleDateString('ru-RU')}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>История работ</CardTitle>
                  <CardDescription>
                    Завершённые заявки и начисленные бонусы
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8">
                      <Icon name="Loader" className="h-8 w-8 animate-spin mx-auto" />
                    </div>
                  ) : works.length === 0 ? (
                    <div className="text-center py-8">
                      <Icon name="History" className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-muted-foreground">Пока нет завершённых работ</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {works.map((work) => (
                        <div key={work.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold">Заявка #{work.request_id}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(work.work_date).toLocaleDateString('ru-RU')}
                              </p>
                            </div>
                            <Badge variant="outline" className="bg-green-50">
                              +{work.bonus_earned} бонусов
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Стоимость работы:</span>
                            <span className="font-semibold">{work.work_cost.toLocaleString()} ₽</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Транзакции бонусов</CardTitle>
                  <CardDescription>
                    История начисления и списания баллов
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8">
                      <Icon name="Loader" className="h-8 w-8 animate-spin mx-auto" />
                    </div>
                  ) : bonusHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <Icon name="Award" className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-muted-foreground">Нет транзакций</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bonusHistory.map((transaction) => (
                        <div key={transaction.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-sm">
                                {transaction.description || 'Начисление бонусов'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(transaction.created_at).toLocaleDateString('ru-RU')}
                              </p>
                            </div>
                            <span className={`font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}