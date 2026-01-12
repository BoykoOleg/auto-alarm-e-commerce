import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Icon from '@/components/ui/icon'

interface AdminDashboardProps {
  setActiveSection: (section: string) => void
  onLogout: () => void
}

export const AdminDashboard = ({ setActiveSection, onLogout }: AdminDashboardProps) => {
  const [requests, setRequests] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [works, setWorks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)

  useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    setIsLoading(true)
    const token = localStorage.getItem('authToken')

    try {
      const response = await fetch('https://functions.poehali.dev/e06691eb-ff8f-4b28-88e2-e9e033b0dd28', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setRequests(data.requests || [])
        setUsers(data.users || [])
        setWorks(data.works || [])
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async (requestId: number, newStatus: string) => {
    const token = localStorage.getItem('authToken')

    try {
      const response = await fetch('https://functions.poehali.dev/e06691eb-ff8f-4b28-88e2-e9e033b0dd28', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'update_status',
          request_id: requestId,
          status: newStatus,
        }),
      })

      if (response.ok) {
        loadAdminData()
      }
    } catch (error) {
      console.error('Ошибка обновления статуса:', error)
    }
  }

  const handleCompleteWork = async (requestId: number, workCost: number, bonusEarned: number) => {
    const token = localStorage.getItem('authToken')

    try {
      const response = await fetch('https://functions.poehali.dev/e06691eb-ff8f-4b28-88e2-e9e033b0dd28', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'complete_work',
          request_id: requestId,
          work_cost: workCost,
          bonus_earned: bonusEarned,
        }),
      })

      if (response.ok) {
        setSelectedRequest(null)
        loadAdminData()
      }
    } catch (error) {
      console.error('Ошибка завершения работы:', error)
    }
  }

  const handlePayBonus = async (workId: number) => {
    const token = localStorage.getItem('authToken')

    try {
      const response = await fetch('https://functions.poehali.dev/e06691eb-ff8f-4b28-88e2-e9e033b0dd28', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'pay_bonus',
          work_id: workId,
        }),
      })

      if (response.ok) {
        loadAdminData()
      }
    } catch (error) {
      console.error('Ошибка выплаты бонуса:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: 'Новая', variant: 'secondary' },
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

  const stats = {
    totalRequests: requests.length,
    pendingRequests: requests.filter(r => r.status === 'pending').length,
    inProgressRequests: requests.filter(r => r.status === 'in_progress').length,
    completedWorks: works.length,
    unpaidBonuses: works.filter(w => !w.is_bonus_paid).length,
    totalPartners: users.filter(u => u.user_role === 'partner').length,
  }

  return (
    <section className="py-12 min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold mb-2">Админ-панель</h1>
            <p className="text-muted-foreground">DivisionAuto</p>
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

        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Всего заявок
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.totalRequests}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Новых
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">{stats.pendingRequests}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                В работе
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-orange-600">{stats.inProgressRequests}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Завершено
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{stats.completedWorks}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Невыплачено
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">{stats.unpaidBonuses}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Партнёров
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.totalPartners}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="requests">Все заявки ({requests.length})</TabsTrigger>
            <TabsTrigger value="works">Завершённые работы ({works.length})</TabsTrigger>
            <TabsTrigger value="partners">Партнёры ({stats.totalPartners})</TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Управление заявками</CardTitle>
                <CardDescription>
                  Все заявки от партнёров на русификацию автомобилей
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
                    <p className="text-muted-foreground">Нет заявок</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requests.map((request) => {
                      const partner = users.find(u => u.id === request.user_id)
                      
                      return (
                        <Card key={request.id} className="border-2">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <CardTitle className="text-lg">
                                    {request.car_brand} {request.car_model} ({request.car_year})
                                  </CardTitle>
                                  {getStatusBadge(request.status)}
                                </div>
                                <CardDescription>
                                  Клиент: {request.client_name} • {request.client_phone}
                                  {request.client_email && ` • ${request.client_email}`}
                                </CardDescription>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Партнёр: {partner?.name || 'Неизвестно'}
                                  {partner?.company_name && ` (${partner.company_name})`}
                                </p>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
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
                                <span>{new Date(request.created_at).toLocaleString('ru-RU')}</span>
                              </div>

                              <div className="pt-3 border-t flex gap-2">
                                <Select
                                  value={request.status}
                                  onValueChange={(value) => handleUpdateStatus(request.id, value)}
                                >
                                  <SelectTrigger className="w-[180px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Новая</SelectItem>
                                    <SelectItem value="in_progress">В работе</SelectItem>
                                    <SelectItem value="completed">Завершено</SelectItem>
                                    <SelectItem value="cancelled">Отменено</SelectItem>
                                  </SelectContent>
                                </Select>

                                {request.status === 'in_progress' && (
                                  <Button
                                    size="sm"
                                    onClick={() => setSelectedRequest(request)}
                                  >
                                    <Icon name="CheckCircle" className="mr-2 h-4 w-4" />
                                    Завершить работу
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedRequest && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <Card className="max-w-md w-full">
                  <CardHeader>
                    <CardTitle>Завершить работу</CardTitle>
                    <CardDescription>
                      {selectedRequest.car_brand} {selectedRequest.car_model}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        const formData = new FormData(e.currentTarget)
                        const workCost = parseFloat(formData.get('work_cost') as string)
                        const bonusEarned = parseInt(formData.get('bonus_earned') as string)
                        handleCompleteWork(selectedRequest.id, workCost, bonusEarned)
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <Label htmlFor="work_cost">Стоимость работы (₽)</Label>
                        <Input
                          id="work_cost"
                          name="work_cost"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="5000"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="bonus_earned">Бонусы партнёру</Label>
                        <Input
                          id="bonus_earned"
                          name="bonus_earned"
                          type="number"
                          min="0"
                          placeholder="500"
                          required
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" className="flex-1">
                          <Icon name="Save" className="mr-2 h-4 w-4" />
                          Завершить
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setSelectedRequest(null)}
                        >
                          Отмена
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="works">
            <Card>
              <CardHeader>
                <CardTitle>Завершённые работы</CardTitle>
                <CardDescription>
                  История выполненных работ и статус выплаты бонусов
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
                    <p className="text-muted-foreground">Нет завершённых работ</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {works.map((work) => {
                      const partner = users.find(u => u.id === work.user_id)
                      const request = requests.find(r => r.id === work.request_id)
                      
                      return (
                        <Card key={work.id} className="border">
                          <CardContent className="pt-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-semibold">
                                    {request?.car_brand} {request?.car_model}
                                  </p>
                                  {work.is_bonus_paid ? (
                                    <Badge variant="outline" className="bg-green-50">
                                      ✓ Выплачено
                                    </Badge>
                                  ) : (
                                    <Badge variant="destructive">
                                      Не выплачено
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  Партнёр: {partner?.name || 'Неизвестно'}
                                  {partner?.company_name && ` (${partner.company_name})`}
                                </p>
                                <div className="flex gap-4 text-sm">
                                  <span className="text-muted-foreground">
                                    Стоимость: <strong>{work.work_cost.toLocaleString()} ₽</strong>
                                  </span>
                                  <span className="text-muted-foreground">
                                    Бонус: <strong className="text-primary">+{work.bonus_earned}</strong>
                                  </span>
                                  <span className="text-muted-foreground">
                                    {new Date(work.work_date).toLocaleDateString('ru-RU')}
                                  </span>
                                </div>
                              </div>
                              {!work.is_bonus_paid && (
                                <Button
                                  size="sm"
                                  onClick={() => handlePayBonus(work.id)}
                                >
                                  <Icon name="DollarSign" className="mr-2 h-4 w-4" />
                                  Выплатить
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="partners">
            <Card>
              <CardHeader>
                <CardTitle>Партнёры</CardTitle>
                <CardDescription>
                  Список всех зарегистрированных партнёров
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <Icon name="Loader" className="h-8 w-8 animate-spin mx-auto" />
                  </div>
                ) : users.filter(u => u.user_role === 'partner').length === 0 ? (
                  <div className="text-center py-8">
                    <Icon name="Users" className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">Нет партнёров</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {users.filter(u => u.user_role === 'partner').map((user) => {
                      const userRequests = requests.filter(r => r.user_id === user.id)
                      const userWorks = works.filter(w => w.user_id === user.id)
                      
                      return (
                        <Card key={user.id} className="border">
                          <CardContent className="pt-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold text-lg">{user.name}</p>
                                {user.company_name && (
                                  <p className="text-sm text-muted-foreground">{user.company_name}</p>
                                )}
                                <div className="flex gap-4 text-sm mt-2">
                                  <span className="text-muted-foreground">
                                    <Icon name="Phone" className="h-3 w-3 inline mr-1" />
                                    {user.phone}
                                  </span>
                                  <span className="text-muted-foreground">
                                    <Icon name="Mail" className="h-3 w-3 inline mr-1" />
                                    {user.email}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-primary">{user.bonus_balance}</p>
                                <p className="text-xs text-muted-foreground">бонусов</p>
                                <div className="flex gap-3 text-xs text-muted-foreground mt-2">
                                  <span>Заявок: {userRequests.length}</span>
                                  <span>Работ: {userWorks.length}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}