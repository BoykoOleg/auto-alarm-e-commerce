import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Icon from '@/components/ui/icon'

interface DashboardWorksHistoryProps {
  works: any[]
  bonusHistory: any[]
  isLoading: boolean
}

export const DashboardWorksHistory = ({ works, bonusHistory, isLoading }: DashboardWorksHistoryProps) => {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>История выполненных работ</CardTitle>
          <CardDescription>
            Завершённые заявки и заработанные бонусы
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Icon name="Loader" className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : works.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="FileText" className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Нет завершённых работ</p>
            </div>
          ) : (
            <div className="space-y-3">
              {works.map((work) => (
                <div
                  key={work.id}
                  className="flex items-start justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name="CheckCircle" className="h-4 w-4 text-green-500" />
                      <span className="font-medium">Заявка #{String(work.request_id).padStart(3, '0')}</span>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <Icon name="Calendar" className="h-3 w-3" />
                        <span>
                          {new Date(work.work_date).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="Award" className="h-3 w-3" />
                        <span>Бонусов: {work.bonus_earned}</span>
                        {work.is_bonus_paid ? (
                          <Badge variant="outline" className="ml-2 bg-green-50">
                            Бонус выплачен
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="ml-2">
                            Бонус начислен
                          </Badge>
                        )}
                      </div>
                    </div>
                    {work.notes && (
                      <p className="text-xs text-muted-foreground mt-2">{work.notes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      {work.work_cost.toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>История бонусов</CardTitle>
          <CardDescription>
            Все операции с бонусными баллами
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Icon name="Loader" className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : bonusHistory.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="Award" className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Нет операций с бонусами</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bonusHistory.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-start justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {transaction.transaction_type === 'earned' ? (
                        <Icon name="TrendingUp" className="h-4 w-4 text-green-500" />
                      ) : (
                        <Icon name="TrendingDown" className="h-4 w-4 text-red-500" />
                      )}
                      <span className="font-medium">
                        {transaction.transaction_type === 'earned' ? 'Начисление' : 'Списание'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{transaction.description}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Icon name="Calendar" className="h-3 w-3" />
                      <span>
                        {new Date(transaction.created_at).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        transaction.transaction_type === 'earned'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {transaction.transaction_type === 'earned' ? '+' : '-'}
                      {transaction.amount}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}