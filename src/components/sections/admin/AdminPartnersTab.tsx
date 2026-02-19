import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Icon from '@/components/ui/icon'

interface AdminPartnersTabProps {
  users: any[]
  requests: any[]
  works: any[]
  isLoading: boolean
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

export const AdminPartnersTab = ({ 
  users, 
  requests, 
  works, 
  isLoading 
}: AdminPartnersTabProps) => {
  const partners = users.filter(u => u.user_role === 'partner')
  const [openPartnerId, setOpenPartnerId] = useState<number | null>(null)

  const togglePartner = (id: number) => {
    setOpenPartnerId(prev => prev === id ? null : id)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Партнёры</CardTitle>
        <CardDescription>
          Нажмите на партнёра, чтобы увидеть его заявки
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <Icon name="Loader" className="h-8 w-8 animate-spin mx-auto" />
          </div>
        ) : partners.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="Users" className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">Нет партнёров</p>
          </div>
        ) : (
          <div className="space-y-3">
            {partners.map((user) => {
              const userRequests = requests.filter((r: any) => r.user_id === user.id)
              const userWorks = works.filter((w: any) => w.user_id === user.id)
              const isOpen = openPartnerId === user.id
              
              return (
                <Card key={user.id} className="border overflow-hidden">
                  <button
                    className="w-full text-left cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => togglePartner(user.id)}
                  >
                    <CardContent className="pt-4 pb-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-lg">{user.name}</p>
                            <Icon
                              name={isOpen ? "ChevronUp" : "ChevronDown"}
                              className="h-4 w-4 text-muted-foreground transition-transform"
                            />
                          </div>
                          {user.company_name && (
                            <p className="text-sm text-muted-foreground">{user.company_name}</p>
                          )}
                          <div className="flex flex-col sm:flex-row sm:gap-4 gap-1 text-sm mt-2">
                            <span className="text-muted-foreground">
                              <Icon name="Phone" className="h-3 w-3 inline mr-1" />
                              {user.phone}
                            </span>
                            {user.email && user.email !== '' && (
                              <span className="text-muted-foreground break-all">
                                <Icon name="Mail" className="h-3 w-3 inline mr-1" />
                                {user.email}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right mt-3 sm:mt-0">
                          <p className="text-2xl font-bold text-primary">{user.bonus_balance}</p>
                          <p className="text-xs text-muted-foreground">бонусов</p>
                          <div className="flex gap-3 text-xs text-muted-foreground mt-2">
                            <span>Заявок: {userRequests.length}</span>
                            <span>Работ: {userWorks.length}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </button>

                  {isOpen && (
                    <div className="border-t mx-4 mb-4">
                      {userRequests.length === 0 ? (
                        <div className="text-center py-6 text-sm text-muted-foreground">
                          <Icon name="FileX" className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          У этого партнёра пока нет заявок
                        </div>
                      ) : (
                        <div className="space-y-2 pt-3">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                            Заявки ({userRequests.length})
                          </p>
                          {userRequests.map((req: any) => (
                            <div
                              key={req.id}
                              className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-medium">
                                    <span className="text-muted-foreground">#{String(req.id).padStart(3, '0')}</span>{' '}
                                    {req.client_name}
                                  </span>
                                  {getStatusBadge(req.status)}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                                  <span>{req.car_brand} {req.car_model}{req.car_year ? `, ${req.car_year}` : ''}</span>
                                  <span>·</span>
                                  <span>{getServiceTypeName(req.service_type)}</span>
                                </div>
                                {req.description && (
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{req.description}</p>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground whitespace-nowrap">
                                {new Date(req.created_at).toLocaleDateString('ru-RU')}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default AdminPartnersTab