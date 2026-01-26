import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Icon from '@/components/ui/icon'
import { AdminRequestChat } from '@/components/AdminRequestChat'

interface AdminRequestsTabProps {
  requests: any[]
  users: any[]
  isLoading: boolean
  onUpdateStatus: (requestId: number, newStatus: string) => void
  onCompleteWork: (requestId: number, workCost: number, bonusEarned: number) => void
  onDeleteRequest: (requestId: number) => void
}

export const AdminRequestsTab = ({ 
  requests, 
  users, 
  isLoading, 
  onUpdateStatus, 
  onCompleteWork,
  onDeleteRequest
}: AdminRequestsTabProps) => {
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [chatRequestId, setChatRequestId] = useState<number | null>(null)

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: 'Новая', variant: 'secondary' },
      in_progress: { label: 'В работе', variant: 'default' },
      completed: { label: 'Завершено', variant: 'outline' },
      cancelled: { label: 'Отменено', variant: 'destructive' },
      to_delete: { label: 'На удаление', variant: 'destructive' },
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

  const handleCompleteWorkSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const workCost = parseFloat(formData.get('work_cost') as string)
    const bonusEarned = parseInt(formData.get('bonus_earned') as string)
    onCompleteWork(selectedRequest.id, workCost, bonusEarned)
    setSelectedRequest(null)
  }

  return (
    <>
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

                        <div className="pt-3 border-t space-y-2">
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Select
                              value={request.status}
                              onValueChange={(value) => onUpdateStatus(request.id, value)}
                              disabled={request.status === 'to_delete'}
                            >
                              <SelectTrigger className="w-full sm:w-[180px]">
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
                                className="w-full sm:w-auto"
                                onClick={() => setSelectedRequest(request)}
                              >
                                <Icon name="CheckCircle" className="mr-2 h-4 w-4" />
                                <span className="hidden sm:inline">Завершить работу</span>
                                <span className="sm:hidden">Завершить</span>
                              </Button>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 relative"
                              onClick={() => setChatRequestId(request.id)}
                            >
                              <Icon name="MessageCircle" className="mr-2 h-4 w-4" />
                              Открыть переписку
                              {request.unread_count > 0 && (
                                <span className="ml-2 bg-destructive text-destructive-foreground rounded-full px-2 py-0.5 text-xs font-medium">
                                  {request.unread_count}
                                </span>
                              )}
                            </Button>
                            {request.status !== 'to_delete' && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => onDeleteRequest(request.id)}
                              >
                                <Icon name="Trash2" className="h-4 w-4" />
                              </Button>
                            )}
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

      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <Card className="max-w-md w-full my-8">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Завершить работу</CardTitle>
              <CardDescription>
                {selectedRequest.car_brand} {selectedRequest.car_model}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCompleteWorkSubmit} className="space-y-4">
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
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button type="submit" className="flex-1">
                    <Icon name="Save" className="mr-2 h-4 w-4" />
                    Завершить
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="sm:w-auto"
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

      <Dialog open={chatRequestId !== null} onOpenChange={(open) => !open && setChatRequestId(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Переписка по заявке #{chatRequestId}</DialogTitle>
          </DialogHeader>
          {chatRequestId && <AdminRequestChat requestId={chatRequestId} />}
        </DialogContent>
      </Dialog>
    </>
  )
}