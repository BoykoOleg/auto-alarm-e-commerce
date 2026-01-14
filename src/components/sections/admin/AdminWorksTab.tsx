import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Icon from '@/components/ui/icon'

interface AdminWorksTabProps {
  works: any[]
  users: any[]
  requests: any[]
  isLoading: boolean
  onPayBonus: (workId: number) => void
}

export const AdminWorksTab = ({ 
  works, 
  users, 
  requests, 
  isLoading, 
  onPayBonus 
}: AdminWorksTabProps) => {
  return (
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
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
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
                        <div className="flex flex-wrap gap-3 text-sm">
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
                          className="w-full sm:w-auto"
                          onClick={() => onPayBonus(work.id)}
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
  )
}
