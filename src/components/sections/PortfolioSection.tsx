import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Icon from '@/components/ui/icon'

interface PortfolioWork {
  id: number
  title: string
  description: string
  category: string
  image_url: string
  price: number
  is_active: boolean
  display_order: number
}

export const PortfolioSection = () => {
  const [works, setWorks] = useState<PortfolioWork[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    loadWorks()
  }, [])

  const loadWorks = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('https://functions.poehali.dev/e06691eb-ff8f-4b28-88e2-e9e033b0dd28?action=content&type=works')
      
      if (response.ok) {
        const data = await response.json()
        const activeWorks = (data.items || []).filter((w: PortfolioWork) => w.is_active)
        setWorks(activeWorks)
      }
    } catch (error) {
      console.error('Ошибка загрузки работ:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const categories = ['all', ...Array.from(new Set(works.map(w => w.category).filter(Boolean)))]
  const filteredWorks = selectedCategory === 'all' 
    ? works 
    : works.filter(w => w.category === selectedCategory)

  return (
    <section className="py-16 md:py-24">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Наши работы
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Примеры выполненных проектов по русификации автомобилей
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
                {category === 'all' ? 'Все работы' : category}
              </Badge>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-16">
            <Icon name="Loader" className="h-12 w-12 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Загрузка работ...</p>
          </div>
        ) : filteredWorks.length === 0 ? (
          <div className="text-center py-16">
            <Icon name="Briefcase" className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">
              {selectedCategory === 'all' ? 'Работы скоро появятся' : 'Нет работ в этой категории'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredWorks.map((work) => (
              <Card key={work.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {work.image_url && (
                  <div className="aspect-video w-full overflow-hidden bg-muted">
                    <img
                      src={work.image_url}
                      alt={work.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <CardTitle className="text-xl">{work.title}</CardTitle>
                  </div>
                  {work.category && (
                    <Badge variant="outline" className="w-fit">
                      {work.category}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  {work.description && (
                    <CardDescription className="mb-4">
                      {work.description}
                    </CardDescription>
                  )}
                  {work.price && (
                    <div className="flex items-center gap-2 text-primary">
                      <Icon name="DollarSign" className="h-5 w-5" />
                      <span className="text-xl font-semibold">
                        {work.price.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
