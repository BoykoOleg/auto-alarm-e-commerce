import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Icon from '@/components/ui/icon'

interface DashboardStatsCardsProps {
  userData: any
  requests: any[]
  works: any[]
}

export const DashboardStatsCards = ({ userData, requests, works }: DashboardStatsCardsProps) => {
  return (
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
            <Icon name="Clock" className="h-8 w-8 text-yellow-500" />
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
              <p className="text-xs text-muted-foreground">выполнено</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}