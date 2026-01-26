import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Icon from '@/components/ui/icon'
import { DashboardStatsCards } from './dashboard/DashboardStatsCards'
import { DashboardRequestForm } from './dashboard/DashboardRequestForm'
import { DashboardRequestsList } from './dashboard/DashboardRequestsList'
import { DashboardWorksHistory } from './dashboard/DashboardWorksHistory'

interface DashboardSectionProps {
  setActiveSection: (section: string) => void
  userData: any
  onLogout: () => void
}

export const DashboardSection = ({ setActiveSection, userData, onLogout }: DashboardSectionProps) => {
  const [requests, setRequests] = useState<any[]>([])
  const [works, setWorks] = useState<any[]>([])
  const [bonusHistory, setBonusHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    const token = localStorage.getItem('authToken')

    try {
      const response = await fetch('https://functions.poehali.dev/08452dc9-363d-4b0e-b976-d796d2cc8717', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setRequests(data.requests || [])
        setWorks(data.works || [])
        setBonusHistory(data.bonusHistory || [])
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="py-12 min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold mb-2">Личный кабинет</h1>
            <p className="text-muted-foreground">
              {userData?.company_name || userData?.name}
            </p>
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

        <DashboardStatsCards userData={userData} requests={requests} works={works} />

        <Tabs defaultValue="new-request" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="new-request">Новая заявка</TabsTrigger>
            <TabsTrigger value="my-requests">
              Мои заявки ({requests.length})
            </TabsTrigger>
            <TabsTrigger value="history">История</TabsTrigger>
          </TabsList>

          <TabsContent value="new-request" className="mt-6">
            <DashboardRequestForm
              userData={userData}
              onSubmitSuccess={loadDashboardData}
            />
          </TabsContent>

          <TabsContent value="my-requests" className="mt-6">
            <DashboardRequestsList requests={requests} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <DashboardWorksHistory
              works={works}
              bonusHistory={bonusHistory}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}
