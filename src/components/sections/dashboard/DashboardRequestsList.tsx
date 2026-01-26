import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Icon from '@/components/ui/icon'
import { RequestChat } from '@/components/RequestChat'

interface DashboardRequestsListProps {
  requests: any[]
  isLoading: boolean
}

export const DashboardRequestsList = ({ requests, isLoading }: DashboardRequestsListProps) => {
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null)

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
    <>
      <Card>
        <CardHeader>
          <CardTitle>Мои заявки</CardTitle>
          <CardDescription>
            История ваших заявок на русификацию
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Icon name="Loader" className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="Inbox" className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">У вас пока нет заявок</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request.id} className="border">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">
                            {request.car_brand} {request.car_model} {request.car_year}
                          </CardTitle>
                          {getStatusBadge(request.status)}
                          {request.unread_count > 0 && (
                            <Badge variant="destructive" className="ml-auto">
                              {request.unread_count} новых
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Icon name="User" className="h-3 w-3" />
                            <span>{request.client_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Icon name="Phone" className="h-3 w-3" />
                            <span>{request.client_phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Icon name="Wrench" className="h-3 w-3" />
                            <span>{getServiceTypeName(request.service_type)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Icon name="Calendar" className="h-3 w-3" />
                            <span>
                              {new Date(request.created_at).toLocaleDateString('ru-RU', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  {request.description && (
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground">{request.description}</p>
                    </CardContent>
                  )}
                  <CardContent className="pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setSelectedRequestId(request.id)}
                    >
                      <Icon name="MessageCircle" className="mr-2 h-4 w-4" />
                      {request.unread_count > 0 ? 'Посмотреть новые сообщения' : 'Открыть чат'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={selectedRequestId !== null} onOpenChange={() => setSelectedRequestId(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Чат по заявке</DialogTitle>
          </DialogHeader>
          {selectedRequestId && (
            <RequestChat
              requestId={selectedRequestId}
              onClose={() => setSelectedRequestId(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
