import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Icon from '@/components/ui/icon'

interface Service {
  id: number
  title: string
  description: string
  category: string
  image_url: string
  price: number
  is_active: boolean
  display_order: number
}

export const ServicesSection = () => {
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('https://functions.poehali.dev/e06691eb-ff8f-4b28-88e2-e9e033b0dd28?action=content&type=services')

      if (response.ok) {
        const data = await response.json()
        setServices((data.items || []).filter((s: Service) => s.is_active))
      }
    } catch (error) {
      console.error('Ошибка загрузки услуг:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const categories = ['all', ...new Set(services.map(s => s.category).filter(Boolean))]
  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(s => s.category === selectedCategory)

  const scrollToContact = () => {
    const contactSection = document.getElementById('contacts')
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section id="services" className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Наши услуги
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Профессиональный сервис для вашего автомобиля
          </p>
        </div>

        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                className="cursor-pointer px-4 py-2"
                onClick={() => setSelectedCategory(category)}
              >
                {category === 'all' ? 'Все услуги' : category}
              </Badge>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Icon name="Loader" className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-20">
            <Icon name="Wrench" className="h-20 w-20 mx-auto mb-4 text-muted-foreground" />
            <p className="text-xl text-muted-foreground">
              {selectedCategory === 'all' ? 'Услуги скоро появятся' : 'Нет услуг в этой категории'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
            {filteredServices.map((service) => (
              <Card key={service.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {service.image_url && (
                  <div className="aspect-video w-full overflow-hidden bg-muted">
                    <img
                      src={service.image_url}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                    {service.category && (
                      <Badge variant="secondary">{service.category}</Badge>
                    )}
                  </div>
                  {service.description && (
                    <CardDescription className="text-base">
                      {service.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {service.price && (
                    <p className="text-2xl font-bold text-primary mb-4">
                      от {service.price.toLocaleString('ru-RU')} ₽
                    </p>
                  )}
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={scrollToContact}
                  >
                    <Icon name="MessageCircle" className="mr-2 h-5 w-5" />
                    Заказать услугу
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
