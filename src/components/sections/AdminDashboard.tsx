import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Icon from '@/components/ui/icon'
import { AdminStatsCards } from './admin/AdminStatsCards'
import { AdminRequestsTab } from './admin/AdminRequestsTab'
import { AdminWorksTab } from './admin/AdminWorksTab'
import { AdminPartnersTab } from './admin/AdminPartnersTab'
import { AdminWorksManagement } from './admin/AdminWorksManagement'
import { AdminProductsManagement } from './admin/AdminProductsManagement'
import { AdminServicesManagement } from './admin/AdminServicesManagement'

interface AdminDashboardProps {
  setActiveSection: (section: string) => void
  onLogout: () => void
}

export const AdminDashboard = ({ setActiveSection, onLogout }: AdminDashboardProps) => {
  const [requests, setRequests] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [works, setWorks] = useState<any[]>([])
  const [portfolioCount, setPortfolioCount] = useState(0)
  const [productsCount, setProductsCount] = useState(0)
  const [servicesCount, setServicesCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    setIsLoading(true)
    const token = localStorage.getItem('authToken')

    try {
      const [adminRes, portfolioRes, productsRes, servicesRes] = await Promise.all([
        fetch('https://functions.poehali.dev/e06691eb-ff8f-4b28-88e2-e9e033b0dd28', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }),
        fetch('https://functions.poehali.dev/e06691eb-ff8f-4b28-88e2-e9e033b0dd28?action=content&type=works'),
        fetch('https://functions.poehali.dev/e06691eb-ff8f-4b28-88e2-e9e033b0dd28?action=content&type=products'),
        fetch('https://functions.poehali.dev/e06691eb-ff8f-4b28-88e2-e9e033b0dd28?action=content&type=services')
      ])

      if (adminRes.ok) {
        const data = await adminRes.json()
        setRequests(data.requests || [])
        setUsers(data.users || [])
        setWorks(data.works || [])
      }

      if (portfolioRes.ok) {
        const portfolioData = await portfolioRes.json()
        setPortfolioCount((portfolioData.items || []).length)
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setProductsCount((productsData.items || []).length)
      }

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json()
        setServicesCount((servicesData.items || []).length)
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

  const handleDeleteRequest = async (requestId: number) => {
    if (!confirm('Удалить заявку? Это действие нельзя отменить.')) return
    
    const token = localStorage.getItem('authToken')

    try {
      const response = await fetch('https://functions.poehali.dev/e06691eb-ff8f-4b28-88e2-e9e033b0dd28', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'delete_request',
          request_id: requestId,
        }),
      })

      if (response.ok) {
        loadAdminData()
      } else {
        alert('Ошибка при удалении заявки')
      }
    } catch (error) {
      console.error('Ошибка удаления заявки:', error)
      alert('Ошибка при удалении заявки')
    }
  }

  const unreadMessagesCount = requests.reduce((sum, r) => sum + (r.unread_count || 0), 0)

  const stats = {
    totalRequests: requests.length,
    pendingRequests: requests.filter(r => r.status === 'pending').length,
    inProgressRequests: requests.filter(r => r.status === 'in_progress').length,
    completedWorks: works.length,
    unpaidBonuses: works.filter(w => !w.is_bonus_paid).length,
    totalPartners: users.filter(u => u.user_role === 'partner').length,
    portfolioWorks: portfolioCount,
    productsCount: productsCount,
    servicesCount: servicesCount,
  }

  return (
    <section className="py-12 min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold mb-2">Админ-панель</h1>
            <p className="text-muted-foreground">Smartline</p>
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

        <AdminStatsCards stats={stats} />

        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="requests" className="text-xs md:text-sm relative">
              <span className="hidden sm:inline">Заявки</span>
              <span className="sm:hidden">Заяв.</span>
              <span className="ml-1">({requests.length})</span>
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {unreadMessagesCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed-works" className="text-xs md:text-sm">
              <span className="hidden sm:inline">Работы</span>
              <span className="sm:hidden">Раб.</span>
              <span className="ml-1">({works.length})</span>
            </TabsTrigger>
            <TabsTrigger value="partners" className="text-xs md:text-sm">
              <span className="hidden sm:inline">Партнёры</span>
              <span className="sm:hidden">Парт.</span>
              <span className="ml-1">({stats.totalPartners})</span>
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="text-xs md:text-sm">
              <Icon name="Briefcase" className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">Портфолио</span>
              <span className="sm:hidden">Порт.</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="text-xs md:text-sm">
              <Icon name="Package" className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">Товары</span>
              <span className="sm:hidden">Тов.</span>
            </TabsTrigger>
            <TabsTrigger value="services" className="text-xs md:text-sm">
              <Icon name="Wrench" className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">Услуги</span>
              <span className="sm:hidden">Усл.</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <AdminRequestsTab
              requests={requests}
              users={users}
              works={works}
              isLoading={isLoading}
              onUpdateStatus={handleUpdateStatus}
              onCompleteWork={handleCompleteWork}
              onDeleteRequest={handleDeleteRequest}
            />
          </TabsContent>

          <TabsContent value="completed-works">
            <AdminWorksTab
              works={works}
              users={users}
              requests={requests}
              isLoading={isLoading}
              onPayBonus={handlePayBonus}
            />
          </TabsContent>

          <TabsContent value="portfolio">
            <AdminWorksManagement
              isLoading={isLoading}
              onRefresh={loadAdminData}
            />
          </TabsContent>

          <TabsContent value="products">
            <AdminProductsManagement
              isLoading={isLoading}
              onRefresh={loadAdminData}
            />
          </TabsContent>

          <TabsContent value="services">
            <AdminServicesManagement
              isLoading={isLoading}
              onRefresh={loadAdminData}
            />
          </TabsContent>

          <TabsContent value="partners">
            <AdminPartnersTab
              users={users}
              requests={requests}
              works={works}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}