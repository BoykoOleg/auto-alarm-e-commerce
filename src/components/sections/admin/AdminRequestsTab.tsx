import { useState, useMemo } from 'react'
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
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [clientSearch, setClientSearch] = useState('')

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false
      if (clientSearch.trim()) {
        const q = clientSearch.trim().toLowerCase()
        const partner = users.find((u: any) => u.id === r.user_id)
        const searchable = [
          r.client_name,
          r.client_phone,
          r.client_email,
          r.car_brand,
          r.car_model,
          partner?.name,
          partner?.company_name
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!searchable.includes(q)) return false
      }
      return true
    })
  }, [requests, statusFilter, clientSearch, users])

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
      dashboard: 'Борт. компьютер',
      navigation: 'Навигация',
      climate: 'Климат',
      full: 'Полная',
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
        <CardHeader className="pb-3">
          <CardTitle>Управление заявками</CardTitle>
          <CardDescription>
            Все заявки от партнёров на русификацию автомобилей
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Поиск по клиенту, партнёру, авто..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                className="h-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px] h-9">
                <SelectValue placeholder="Все статусы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="pending">Новые</SelectItem>
                <SelectItem value="in_progress">В работе</SelectItem>
                <SelectItem value="completed">Завершено</SelectItem>
                <SelectItem value="cancelled">Отменено</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <Icon name="Loader" className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Загрузка...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="FileText" className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">
                {requests.length === 0 ? 'Нет заявок' : 'Ничего не найдено'}
              </p>
              {requests.length > 0 && (
                <Button variant="ghost" size="sm" className="mt-2" onClick={() => { setStatusFilter('all'); setClientSearch('') }}>
                  Сбросить фильтры
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredRequests.map((request) => {
                const partner = users.find((u: any) => u.id === request.user_id)

                return (
                  <div
                    key={request.id}
                    className="border rounded-lg p-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">
                            {request.car_brand} {request.car_model}
                            {request.car_year ? ` (${request.car_year})` : ''}
                          </span>
                          {getStatusBadge(request.status)}
                          {request.unread_count > 0 && (
                            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                              {request.unread_count}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                          <span>{request.client_name}</span>
                          <span>·</span>
                          <span>{request.client_phone}</span>
                          <span>·</span>
                          <span>{getServiceTypeName(request.service_type)}</span>
                          <span>·</span>
                          <span>{partner?.name || '—'}</span>
                          <span>·</span>
                          <span>{new Date(request.created_at).toLocaleDateString('ru-RU')}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <Select
                          value={request.status}
                          onValueChange={(value) => onUpdateStatus(request.id, value)}
                          disabled={request.status === 'to_delete'}
                        >
                          <SelectTrigger className="h-7 text-xs w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Новая</SelectItem>
                            <SelectItem value="in_progress">В работе</SelectItem>
                            <SelectItem value="cancelled">Отменено</SelectItem>
                          </SelectContent>
                        </Select>

                        {request.status === 'in_progress' && (
                          <Button
                            size="sm"
                            className="h-7 text-xs px-2"
                            onClick={() => setSelectedRequest(request)}
                          >
                            <Icon name="CheckCircle" className="h-3 w-3" />
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs px-2 relative"
                          onClick={() => setChatRequestId(request.id)}
                        >
                          <Icon name="MessageCircle" className="h-3 w-3" />
                        </Button>

                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => onDeleteRequest(request.id)}
                        >
                          <Icon name="Trash2" className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
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
        <DialogContent className="w-[100vw] h-[100dvh] max-w-[100vw] sm:max-w-3xl sm:w-full sm:h-auto sm:max-h-[85vh] p-0 sm:p-6 rounded-none sm:rounded-lg overflow-hidden flex flex-col gap-0 border-0 sm:border [&>button]:top-3 [&>button]:right-3 [&>button]:z-10">
          <DialogHeader className="flex-shrink-0 p-3 sm:p-0 sm:pb-2 border-b sm:border-0">
            <DialogTitle className="text-base sm:text-lg">Переписка по заявке #{chatRequestId}</DialogTitle>
          </DialogHeader>
          {chatRequestId && <AdminRequestChat requestId={chatRequestId} />}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default AdminRequestsTab