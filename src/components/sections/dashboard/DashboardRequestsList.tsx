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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {requests.map((request) => (
                <div key={request.id} className="flex flex-col p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-medium">
                      {request.car_brand} {request.car_model} {request.car_year}
                    </span>
                    {getStatusBadge(request.status)}
                    {request.unread_count > 0 && (
                      <Badge variant="destructive" className="ml-auto">
                        {request.unread_count} новых
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1 flex-1">
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
                    {request.description && (
                      <p className="text-xs text-muted-foreground pt-1">{request.description}</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3"
                    onClick={() => setSelectedRequestId(request.id)}
                  >
                    <Icon name="MessageCircle" className="mr-2 h-4 w-4" />
                    {request.unread_count > 0 ? 'Новые сообщения' : 'Открыть чат'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={selectedRequestId !== null} onOpenChange={() => setSelectedRequestId(null)}>
        <DialogContent className="w-[100vw] h-[100dvh] max-w-[100vw] sm:max-w-3xl sm:w-full sm:h-auto sm:max-h-[80vh] p-0 sm:p-6 rounded-none sm:rounded-lg overflow-hidden flex flex-col gap-0 border-0 sm:border [&>button]:top-3 [&>button]:right-3 [&>button]:z-10">
          <DialogHeader className="flex-shrink-0 p-3 sm:p-0 sm:pb-2 border-b sm:border-0">
            <DialogTitle className="text-base sm:text-lg">Чат по заявке</DialogTitle>
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