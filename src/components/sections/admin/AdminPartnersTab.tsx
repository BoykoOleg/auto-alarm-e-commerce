import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Icon from '@/components/ui/icon'

interface AdminPartnersTabProps {
  users: any[]
  requests: any[]
  works: any[]
  isLoading: boolean
}

export const AdminPartnersTab = ({ 
  users, 
  requests, 
  works, 
  isLoading 
}: AdminPartnersTabProps) => {
  const partners = users.filter(u => u.user_role === 'partner')

  return (
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
        ) : partners.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="Users" className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">Нет партнёров</p>
          </div>
        ) : (
          <div className="space-y-3">
            {partners.map((user) => {
              const userRequests = requests.filter(r => r.user_id === user.id)
              const userWorks = works.filter(w => w.user_id === user.id)
              
              return (
                <Card key={user.id} className="border">
                  <CardContent className="pt-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{user.name}</p>
                        {user.company_name && (
                          <p className="text-sm text-muted-foreground">{user.company_name}</p>
                        )}
                        <div className="flex flex-col sm:flex-row sm:gap-4 gap-1 text-sm mt-2">
                          <span className="text-muted-foreground">
                            <Icon name="Phone" className="h-3 w-3 inline mr-1" />
                            {user.phone}
                          </span>
                          <span className="text-muted-foreground break-all">
                            <Icon name="Mail" className="h-3 w-3 inline mr-1" />
                            {user.email}
                          </span>
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
                </Card>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
